// Deterministic hidden-test grader for the coding-v1 pack.
// It never runs code itself: the caller supplies `execute`, which must run the command inside an enforced
// boundary (no network, time, memory and process limits) whenever the candidate is untrusted. A process group
// is not such a boundary. The grader decides only from a result line tagged with a fresh nonce and from the
// number of hidden tests the task declares, so a candidate cannot pass by printing a summary or by exiting early.
import { randomBytes, createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const harness = join(dirname(fileURLToPath(import.meta.url)), 'harness');
const languages = {
  python: {
    entry: 'solution.py',
    tests: /^test_[a-z0-9_]+\.py$/,
    runner: 'run_tests.py',
    argv: ['python3', '-I', '-B', 'run_tests.py'],
  },
  typescript: {
    entry: 'solution.ts',
    tests: /^[a-z0-9-]+\.test\.ts$/,
    runner: 'run-tests.mjs',
    argv: ['node', 'run-tests.mjs'],
  },
};

export function readTask(taskDir) {
  const task = JSON.parse(readFileSync(join(taskDir, 'task.json'), 'utf8'));
  const language = languages[task.language];
  if (
    task.schemaVersion !== 1 ||
    !language ||
    task.entry !== language.entry ||
    !Number.isInteger(task.hiddenTests) ||
    task.hiddenTests < 1 ||
    typeof task.prompt !== 'string' ||
    !task.prompt
  )
    throw Error('Invalid coding task');
  const hidden = readdirSync(join(taskDir, 'hidden')).sort();
  if (!hidden.length || hidden.some((name) => !language.tests.test(name))) throw Error('Invalid hidden tests');
  return { ...task, hidden };
}

// Identity of everything the grader holds for a task: prompt, starter and hidden tests.
export function taskHash(taskDir) {
  const task = readTask(taskDir);
  const starter = 'starter' + task.entry.slice(task.entry.lastIndexOf('.'));
  const files = [
    ['task.json', 'task.json'],
    [starter, starter],
    ...task.hidden.map((name) => [name, join('hidden', name)]),
  ];
  const digest = createHash('sha256');
  for (const [name, path] of files) digest.update(name + '\0' + readFileSync(join(taskDir, path), 'utf8') + '\0');
  return digest.digest('hex');
}

// The candidate is written to an empty workspace first; hidden tests and the harness are copied in afterwards.
export async function gradeCandidate({ taskDir, candidate, execute, timeoutMs = 10000 }) {
  if (typeof candidate !== 'string' || typeof execute !== 'function')
    throw Error('Candidate source and executor required');
  const task = readTask(taskDir);
  const language = languages[task.language];
  const workspace = mkdtempSync(join(realpathSync(tmpdir()), 'gauntlet-coding-'));
  try {
    writeFileSync(join(workspace, task.entry), candidate);
    for (const name of task.hidden) cpSync(join(taskDir, 'hidden', name), join(workspace, name));
    cpSync(join(harness, language.runner), join(workspace, language.runner));
    const nonce = randomBytes(16).toString('hex');
    const outcome = await execute({ argv: language.argv, cwd: workspace, env: { GAUNTLET_NONCE: nonce }, timeoutMs });
    if (outcome.timedOut) return { status: 'failed', reason: 'timeout', tests: task.hiddenTests, passed: 0 };
    const prefix = 'GAUNTLET-RESULT ' + nonce + ' ';
    const lines = String(outcome.stdout)
      .split('\n')
      .filter((line) => line.startsWith(prefix));
    let summary;
    try {
      summary = lines.length === 1 ? JSON.parse(lines[0].slice(prefix.length)) : undefined;
    } catch {}
    if (!summary || !Number.isInteger(summary.tests) || !Number.isInteger(summary.passed))
      return { status: 'failed', reason: 'no-summary', tests: task.hiddenTests, passed: 0 };
    const passed = summary.tests === task.hiddenTests ? Math.min(summary.passed, task.hiddenTests) : 0;
    return {
      status: outcome.code === 0 && passed === task.hiddenTests ? 'passed' : 'failed',
      reason:
        summary.tests === task.hiddenTests
          ? passed === task.hiddenTests
            ? 'all-passed'
            : 'tests-failed'
          : 'test-count',
      tests: task.hiddenTests,
      passed,
    };
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}
