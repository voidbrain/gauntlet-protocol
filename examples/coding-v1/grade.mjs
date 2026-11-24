// Deterministic out-of-process grader for the coding-v1 pack.
// The candidate's process (inside the runner's sandbox) receives only the candidate, a small driver and the case
// inputs: no expected values, assertions or test framework. The driver writes what the candidate returned for each
// input; this grader, outside that process, reads the results under a strict schema and size cap and compares them
// with expectations only it holds. Tampering inside the candidate's process can change only the candidate's own answers.
// The grader runs nothing itself: `execute` must run the driver inside an enforced boundary whenever the candidate
// is untrusted, and must have stopped every candidate process before it resolves. The grader bounds the wait
// itself and does not rely on the executor to do so; it reports a timeout even if cleanup then fails.
import { createHash } from 'node:crypto';
import {
  closeSync,
  constants,
  cpSync,
  fstatSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readSync,
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

// Opens without following a symlink or blocking on a FIFO, checks the opened file itself and reads at most the cap,
// so a process still running in the workspace cannot swap the file between the check and the read.
function readResults(file) {
  const fd = openSync(file, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > maxResultBytes) return undefined;
    const buffer = Buffer.alloc(maxResultBytes + 1);
    let length = 0;
    for (let read; length <= maxResultBytes && (read = readSync(fd, buffer, length, buffer.length - length, null)) > 0;)
      length += read;
    return length > maxResultBytes ? undefined : JSON.parse(buffer.subarray(0, length).toString('utf8'));
  } finally {
    closeSync(fd);
  }
}

// Best effort: a process the executor failed to stop may still be writing. The verdict never depends on cleanup.
const leftoverWorkspaces = new Set();
function removeWorkspace(workspace) {
  try {
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

// The candidate is written to an empty workspace first; the driver and the inputs are copied in afterwards.
export async function gradeCandidate({ taskDir, candidate, execute, timeoutMs = 10000 }) {
  if (typeof candidate !== 'string' || typeof execute !== 'function')
    throw Error('Candidate source and executor required');
  const task = readTask(taskDir);
  const language = languages[task.language];
  const tests = task.cases.length;
  const workspace = mkdtempSync(join(realpathSync(tmpdir()), 'gauntlet-coding-'));
  let timer;
  try {
    writeFileSync(join(workspace, task.entry), candidate);
    cpSync(join(drivers, language.driver), join(workspace, language.driver));
    writeFileSync(
      join(workspace, 'inputs.json'),
      JSON.stringify({ function: task.function, inputs: task.cases.map((c) => c.input) }),
    );
    const deadline = new Promise((resolve) => {
      timer = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
    });
    const outcome = await Promise.race([
      execute({ argv: language.argv, cwd: workspace, env: {}, timeoutMs }),
      deadline,
    ]);
    if (outcome?.timedOut) return { status: 'failed', reason: 'timeout', tests, passed: 0 };
    let results;
    try {
      results = readResults(join(workspace, 'results.json'));
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
    removeWorkspace(workspace);
  }
}
