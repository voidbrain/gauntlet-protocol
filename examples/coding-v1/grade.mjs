// Deterministic out-of-process grader for the coding-v1 pack.
// The candidate's process (inside the runner's sandbox) receives only the candidate, a small driver and the case
// inputs: no expected values, assertions or test framework. The driver prints what the candidate returned for each
// input as the last tagged stdout line; this grader, outside that process, reads it under a strict schema and size
// cap and compares it
// with expectations only it holds. Tampering inside the candidate's process can change only the candidate's own answers.
// The grader runs nothing itself: `execute` must run the driver inside an enforced boundary whenever the candidate
// is untrusted, return the command's stdout, and have stopped every candidate process before it resolves; an
// optional `execute.prepare(argv)` (engine checks, image pulls) is awaited before the case's time starts. The grader bounds the wait
// itself and does not rely on the executor to do so. On a timeout it returns at once and removes the workspace only
// once the executor resolves (its processes are then stopped); until then the workspace is a leftover.
import { createHash } from 'node:crypto';
import {
  chmodSync,
  cpSync,
  lstatSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const drivers = join(dirname(fileURLToPath(import.meta.url)), 'driver');
const languages = {
  python: { entry: 'solution.py', driver: 'driver.py', argv: ['python3', '-I', '-B', 'driver.py'] },
  typescript: { entry: 'solution.ts', driver: 'driver.mjs', argv: ['node', 'driver.mjs'] },
};
const maxResultBytes = 1_000_000;
const resultPrefix = 'GAUNTLET-RESULTS ';

const plain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const only = (value, keys) => plain(value) && Object.keys(value).every((key) => keys.includes(key));

export function readTask(taskDir) {
  const task = JSON.parse(readFileSync(join(taskDir, 'task.json'), 'utf8'));
  const language = languages[task.language];
  if (
    !only(task, ['schemaVersion', 'language', 'entry', 'function', 'prompt']) ||
    task.schemaVersion !== 1 ||
    !language ||
    task.entry !== language.entry ||
    typeof task.function !== 'string' ||
    !/^[A-Za-z_][A-Za-z0-9_]*$/.test(task.function) ||
    typeof task.prompt !== 'string' ||
    !task.prompt
  )
    throw Error('Invalid coding task');
  const { schemaVersion, cases } = JSON.parse(readFileSync(join(taskDir, 'cases.json'), 'utf8'));
  if (
    schemaVersion !== 1 ||
    !Array.isArray(cases) ||
    !cases.length ||
    cases.some(
      (c) =>
        !only(c, ['input', 'expect']) ||
        !Array.isArray(c.input) ||
        !(
          (only(c.expect, ['return']) && Object.hasOwn(c.expect, 'return')) ||
          (only(c.expect, ['raises', 'messageIncludes']) &&
            typeof c.expect.raises === 'string' &&
            ['string', 'undefined'].includes(typeof c.expect.messageIncludes))
        ),
    )
  )
    throw Error('Invalid coding cases');
  return { ...task, cases };
}

// Identity of everything the grader holds for a task: prompt, starter and the input/expected cases.
export function taskHash(taskDir) {
  const task = readTask(taskDir);
  const starter = 'starter' + task.entry.slice(task.entry.lastIndexOf('.'));
  const digest = createHash('sha256');
  for (const name of ['task.json', starter, 'cases.json'])
    digest.update(name + '\0' + readFileSync(join(taskDir, name), 'utf8') + '\0');
  return digest.digest('hex');
}

const answer = (result) =>
  (only(result, ['ok']) && Object.hasOwn(result, 'ok')) ||
  (only(result, ['error', 'message']) &&
    Array.isArray(result.error) &&
    result.error.length <= 64 &&
    result.error.every((kind) => typeof kind === 'string') &&
    typeof result.message === 'string');

const matches = (expect, result) =>
  Object.hasOwn(expect, 'return')
    ? Object.hasOwn(result, 'ok') && isDeepStrictEqual(result.ok, expect.return)
    : Object.hasOwn(result, 'error') &&
      result.error.includes(expect.raises) &&
      (expect.messageIncludes === undefined || result.message.includes(expect.messageIncludes));

// Best effort: a process the executor failed to stop may still be writing. The verdict never depends on cleanup.
const leftoverWorkspaces = new Set();
// A candidate can lock folders it created (chmod 0); unlock the tree, never following links, before removing it.
function unlock(path) {
  try {
    if (!lstatSync(path).isDirectory()) return;
    chmodSync(path, 0o700);
    for (const name of readdirSync(path)) unlock(join(path, name));
  } catch {}
}
function removeWorkspace(workspace) {
  try {
    unlock(workspace);
    rmSync(workspace, { recursive: true, force: true, maxRetries: 3 });
    leftoverWorkspaces.delete(workspace);
  } catch {
    leftoverWorkspaces.add(workspace);
    process.emitWarning('coding grader could not remove ' + workspace + '; the executor left a process running');
  }
}

// Retries the workspaces an earlier cleanup could not remove; returns those still left.
export function removeLeftoverWorkspaces() {
  for (const workspace of [...leftoverWorkspaces]) removeWorkspace(workspace);
  return [...leftoverWorkspaces];
}

// An executor that rejects (engine missing or its client failing to start) is an infrastructure fault: an `error`
// result that never counts as covering the case.
const executorError = (error, tests) => ({
  status: 'error',
  reason: 'executor-error',
  message: String(error?.message ?? error),
  tests,
  passed: 0,
});

// The candidate is written to an empty workspace first; the driver and the inputs are copied in afterwards.
export async function gradeCandidate({ taskDir, candidate, execute, timeoutMs = 10000 }) {
  if (typeof candidate !== 'string' || typeof execute !== 'function')
    throw Error('Candidate source and executor required');
  const task = readTask(taskDir);
  const language = languages[task.language];
  const tests = task.cases.length;
  const workspace = mkdtempSync(join(realpathSync(tmpdir()), 'gauntlet-coding-'));
  let timer;
  let cleanupDeferred = false;
  try {
    writeFileSync(join(workspace, task.entry), candidate);
    cpSync(join(drivers, language.driver), join(workspace, language.driver));
    writeFileSync(
      join(workspace, 'inputs.json'),
      JSON.stringify({ function: task.function, inputs: task.cases.map((c) => c.input) }),
    );
    // Engine checks and image pulls happen before the case's time starts.
    try {
      await execute.prepare?.(language.argv);
    } catch (error) {
      return executorError(error, tests);
    }
    const deadline = new Promise((resolve) => {
      timer = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
    });
    const executing = Promise.resolve().then(() =>
      execute({ argv: language.argv, cwd: workspace, env: {}, timeoutMs }),
    );
    let outcome;
    try {
      outcome = await Promise.race([executing, deadline]);
    } catch (error) {
      return executorError(error, tests);
    }
    if (outcome?.timedOut) {
      // Removing the tree now would race a process the executor has not stopped yet and block the event loop.
      cleanupDeferred = true;
      leftoverWorkspaces.add(workspace);
      const cleanup = () => removeWorkspace(workspace);
      executing.then(cleanup, cleanup);
      return { status: 'failed', reason: 'timeout', tests, passed: 0 };
    }
    // The driver prints its results as the last tagged line of stdout; anything the candidate prints is ignored.
    const line = String(outcome?.stdout ?? '')
      .split('\n')
      .filter((text) => text.startsWith(resultPrefix))
      .at(-1);
    let results;
    try {
      if (line !== undefined && line.length - resultPrefix.length <= maxResultBytes)
        results = JSON.parse(line.slice(resultPrefix.length));
    } catch {}
    if (results === undefined) return { status: 'failed', reason: 'no-results', tests, passed: 0 };
    if (!Array.isArray(results) || results.length !== tests || !results.every(answer))
      return { status: 'failed', reason: 'malformed-results', tests, passed: 0 };
    const passed = task.cases.filter((c, index) => matches(c.expect, results[index])).length;
    return {
      status: passed === tests ? 'passed' : 'failed',
      reason: passed === tests ? 'all-passed' : 'wrong-answers',
      tests,
      passed,
    };
  } finally {
    clearTimeout(timer);
    if (!cleanupDeferred) removeWorkspace(workspace);
  }
}
