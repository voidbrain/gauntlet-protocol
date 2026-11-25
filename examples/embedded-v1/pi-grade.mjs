// Static grader for the embedded-v1 Raspberry Pi Python tasks (F-016-T03). Nothing is executed: pi_facts.py
// byte-compiles and parses the candidate (never imports it) and reports facts; this grader checks them against the
// task's required and forbidden imports, calls (with literal pin and setting arguments), attribute uses, calls in
// finally blocks, and while loops that never block. A missing Python is an `error`, never a failed candidate.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const analyzer = join(dirname(fileURLToPath(import.meta.url)), 'pi_facts.py');
const maxOutputBytes = 2_000_000;
const kinds = ['import', 'call', 'assign', 'attribute', 'finally'];

const plain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const only = (value, keys) => plain(value) && Object.keys(value).every((key) => keys.includes(key));
const argSpec = (arg) =>
  only(arg, ['pos', 'name', 'value']) &&
  Object.hasOwn(arg, 'value') &&
  (Number.isInteger(arg.pos) || typeof arg.name === 'string');
const check = (entry) =>
  only(entry, ['id', ...kinds, 'args']) &&
  typeof entry.id === 'string' &&
  /^[a-z0-9-]+$/.test(entry.id) &&
  kinds.filter((kind) => typeof entry[kind] === 'string').length === 1 &&
  (entry.args === undefined ||
    (typeof entry.call === 'string' && Array.isArray(entry.args) && entry.args.every(argSpec)));

export function readPiTask(taskDir) {
  const task = JSON.parse(readFileSync(join(taskDir, 'task.json'), 'utf8'));
  if (
    !only(task, ['schemaVersion', 'prompt', 'requires', 'forbids', 'noBusyLoop']) ||
    task.schemaVersion !== 1 ||
    typeof task.prompt !== 'string' ||
    !task.prompt ||
    !Array.isArray(task.requires) ||
    !task.requires.every(check) ||
    !(task.forbids ?? []).every(check) ||
    !['boolean', 'undefined'].includes(typeof task.noBusyLoop)
  )
    throw Error('Invalid Raspberry Pi task');
  return { forbids: [], noBusyLoop: false, ...task };
}

// Identity of everything the grader holds for a task: the task and its starter.
export function piTaskHash(taskDir) {
  readPiTask(taskDir);
  const digest = createHash('sha256');
  for (const name of ['task.json', 'starter.py'])
    digest.update(name + '\0' + readFileSync(join(taskDir, name), 'utf8') + '\0');
  return digest.digest('hex');
}

const argMatches = (call, arg) =>
  (Number.isInteger(arg.pos) && call.args.length > arg.pos && isDeepStrictEqual(call.args[arg.pos], arg.value)) ||
  (typeof arg.name === 'string' &&
    Object.hasOwn(call.kwargs, arg.name) &&
    isDeepStrictEqual(call.kwargs[arg.name], arg.value));

function holds(facts, entry) {
  if (entry.import) return facts.imports.includes(entry.import);
  if (entry.assign) return facts.assigns.includes(entry.assign);
  if (entry.attribute) return facts.attributes.includes(entry.attribute);
  if (entry.finally) return facts.finallyCalls.includes(entry.finally);
  return facts.calls.some(
    (call) => call.name === entry.call && (entry.args ?? []).every((arg) => argMatches(call, arg)),
  );
}

function analyze(python, file, { env, timeoutMs }) {
  return new Promise((resolve) => {
    let output = '';
    const child = spawn(python, ['-I', '-B', analyzer, file], {
      env: { PATH: process.env.PATH ?? '', ...env },
      detached: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const timer = setTimeout(() => {
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {}
      resolve({ timedOut: true });
    }, timeoutMs);
    child.stdout.on('data', (chunk) => {
      if (output.length < maxOutputBytes) output += chunk;
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ missing: true, error });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
  });
}

export async function gradePiSolution({ taskDir, candidate, python, env = {}, timeoutMs = 20000 }) {
  if (typeof candidate !== 'string') throw Error('Candidate Python source required');
  const task = readPiTask(taskDir);
  const checks = 1 + task.requires.length + task.forbids.length + (task.noBusyLoop ? 1 : 0);
  const interpreter = python ?? env.GAUNTLET_PYTHON ?? process.env.GAUNTLET_PYTHON ?? 'python3';
  const workspace = mkdtempSync(join(realpathSync(tmpdir()), 'gauntlet-pi-'));
  try {
    const file = join(workspace, 'solution.py');
    writeFileSync(file, candidate);
    const outcome = await analyze(interpreter, file, { env, timeoutMs });
    if (outcome.missing)
      return {
        status: 'error',
        reason: 'toolchain-missing',
        message: `Python 3 not found at ${interpreter}: install python3 or set GAUNTLET_PYTHON to its path.`,
        checks,
        passed: 0,
      };
    if (outcome.timedOut) return { status: 'error', reason: 'analyzer-timeout', checks, passed: 0 };
    let facts;
    try {
      facts = JSON.parse(outcome.output.trim().split('\n').at(-1));
    } catch {}
    if (!plain(facts) || outcome.code !== 0)
      return { status: 'error', reason: 'analyzer-error', message: 'pi_facts.py gave no facts', checks, passed: 0 };
    if (facts.syntax !== 'ok')
      return {
        status: 'failed',
        reason: 'syntax-error',
        failedChecks: ['syntax'],
        checks,
        passed: 0,
        diagnostics: String(facts.message ?? '').slice(0, 500),
      };
    const failedChecks = [
      ...task.requires.filter((entry) => !holds(facts, entry)).map((entry) => entry.id),
      ...task.forbids.filter((entry) => holds(facts, entry)).map((entry) => entry.id),
      ...(task.noBusyLoop && facts.busyLoops > 0 ? ['no-busy-loop'] : []),
    ];
    return {
      status: failedChecks.length ? 'failed' : 'passed',
      reason: failedChecks.length ? 'static-checks' : 'all-passed',
      failedChecks,
      checks,
      passed: checks - failedChecks.length,
    };
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}
