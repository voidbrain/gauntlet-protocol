// Deterministic compile grader for the embedded-v1 Arduino and ESP32 sketch tasks (F-016-T02).
// A candidate is one sketch source. The grader writes it alone into a fresh sketch folder, refuses includes that
// could reach host files, runs static checks on the source with comments and string literals removed, and compiles
// it with arduino-cli against the cores pinned in toolchain.json. Nothing is uploaded or executed: compiling is not
// running, and the candidate supplies no build files or flags. A missing toolchain or an unpinned core is an `error`
// (the run could not grade), never a `failed` candidate.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  accessSync,
  constants,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const toolchainFile = join(here, 'toolchain.json');
const guide = 'docs/guides/arduino-cli.md';
// Homebrew on Apple silicon, then Intel; agent shells often lack /opt/homebrew/bin on PATH.
export const defaultArduinoCliPaths = ['/opt/homebrew/bin/arduino-cli', '/usr/local/bin/arduino-cli'];
const maxOutputBytes = 64_000;
const maxListBytes = 32_000_000;

const plain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const only = (value, keys) => plain(value) && Object.keys(value).every((key) => keys.includes(key));
const checkList = (list) =>
  Array.isArray(list) &&
  list.every(
    (check) =>
      only(check, ['id', 'pattern']) &&
      typeof check.id === 'string' &&
      /^[a-z0-9-]+$/.test(check.id) &&
      typeof check.pattern === 'string' &&
      new RegExp(check.pattern) instanceof RegExp,
  );

export function readToolchain() {
  const toolchain = JSON.parse(readFileSync(toolchainFile, 'utf8'));
  if (
    !only(toolchain, ['schemaVersion', 'tool', 'cores', 'additionalUrls']) ||
    toolchain.schemaVersion !== 1 ||
    toolchain.tool !== 'arduino-cli' ||
    !plain(toolchain.cores) ||
    !Object.values(toolchain.cores).every((version) => typeof version === 'string' && /^\d+\.\d+\.\d+$/.test(version))
  )
    throw Error('Invalid embedded toolchain pins');
  return toolchain;
}

export function readTask(taskDir) {
  const task = JSON.parse(readFileSync(join(taskDir, 'task.json'), 'utf8'));
  const { cores } = readToolchain();
  if (
    !only(task, ['schemaVersion', 'fqbn', 'prompt', 'requires', 'forbids', 'literals']) ||
    task.schemaVersion !== 1 ||
    typeof task.fqbn !== 'string' ||
    !Object.hasOwn(cores, task.fqbn.split(':').slice(0, 2).join(':')) ||
    typeof task.prompt !== 'string' ||
    !task.prompt ||
    !checkList(task.requires) ||
    !checkList(task.forbids ?? []) ||
    !(task.literals ?? []).every((literal) => typeof literal === 'string' && literal)
  )
    throw Error('Invalid embedded task');
  return { forbids: [], literals: [], ...task };
}

// Identity of everything the grader holds for a task: the task, its starter and the pinned cores.
export function taskHash(taskDir) {
  readTask(taskDir);
  const digest = createHash('sha256');
  for (const file of [join(taskDir, 'task.json'), join(taskDir, 'starter.ino'), toolchainFile])
    digest.update(file.slice(file.lastIndexOf('/') + 1) + '\0' + readFileSync(file, 'utf8') + '\0');
  return digest.digest('hex');
}

const executable = (path) => {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

// GAUNTLET_ARDUINO_CLI, then the default install locations, then PATH; undefined when none is executable.
export function resolveArduinoCli({ env = process.env, defaults = defaultArduinoCliPaths } = {}) {
  if (env.GAUNTLET_ARDUINO_CLI) return env.GAUNTLET_ARDUINO_CLI;
  for (const path of defaults) if (executable(path)) return path;
  for (const dir of (env.PATH ?? '').split(delimiter).filter(Boolean))
    if (executable(join(dir, 'arduino-cli'))) return join(dir, 'arduino-cli');
  return undefined;
}

// Runs a grader-controlled command, bounding time and output and killing its whole process group on timeout.
function runCommand(command, args, { env, timeoutMs, maxBytes = maxOutputBytes }) {
  return new Promise((resolve) => {
    let output = '';
    let timedOut = false;
    let child;
    try {
      child = spawn(command, args, { env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      resolve({ missing: true, error });
      return;
    }
    const collect = (chunk) => {
      if (output.length < maxBytes) output += chunk;
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {}
    }, timeoutMs);
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ missing: error.code === 'ENOENT' || error.code === 'EACCES', error });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, output, timedOut });
    });
  });
}

const missingMessage = (cli) =>
  `arduino-cli not found${cli ? ` at ${cli}` : ''}: install it with the pinned cores (${guide}), or set ` +
  'GAUNTLET_ARDUINO_CLI to its path.';
const coreLabel = (id, version) => `${id}@${version}`;

// Confirms the tool runs and every pinned core is installed at its pinned version.
export async function checkToolchain({ cli = resolveArduinoCli(), env = {}, timeoutMs = 60000 } = {}) {
  const { cores } = readToolchain();
  if (!cli) return { ok: false, reason: 'toolchain-missing', message: missingMessage() };
  const listed = await runCommand(cli, ['core', 'list', '--format', 'json'], {
    env: { ...process.env, ...env },
    timeoutMs,
    maxBytes: maxListBytes,
  });
  if (listed.missing) return { ok: false, reason: 'toolchain-missing', message: missingMessage(cli) };
  let installed;
  try {
    if (listed.code === 0)
      installed = Object.fromEntries(
        JSON.parse(listed.output).platforms.map((platform) => [platform.id, platform.installed_version]),
      );
  } catch {}
  if (!installed)
    return {
      ok: false,
      reason: 'toolchain-error',
      message: `${cli} core list failed: ${String(listed.output).slice(-500)}`,
    };
  const absent = Object.entries(cores).filter(([id]) => !installed[id]);
  if (absent.length)
    return {
      ok: false,
      reason: 'core-missing',
      message: `Pinned core not installed: ${absent.map(([id, version]) => coreLabel(id, version)).join(', ')} (${guide}).`,
    };
  const drifted = Object.entries(cores).filter(([id, version]) => installed[id] !== version);
  if (drifted.length)
    return {
      ok: false,
      reason: 'core-version-mismatch',
      message: `Installed core differs from the pin: ${drifted
        .map(([id, version]) => `${id} ${installed[id]} (pinned ${version})`)
        .join(', ')}; install the pinned version (${guide}).`,
    };
  return { ok: true, cli, cores };
}

// Removes comments and the contents of string and character literals, keeping line structure. Returns the code and
// the string literals' contents.
export function stripSource(source) {
  let code = '';
  const strings = [];
  for (let i = 0; i < source.length;) {
    const two = source.slice(i, i + 2);
    if (two === '//') {
      while (i < source.length && source[i] !== '\n') i++;
    } else if (two === '/*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end < 0 ? source.length : end + 2;
      code += source.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
    } else if (source[i] === '"' || source[i] === "'") {
      const quote = source[i];
      let text = '';
      i++;
      while (i < source.length && source[i] !== quote && source[i] !== '\n') {
        if (source[i] === '\\' && i + 1 < source.length) text += source[i++];
        text += source[i++];
      }
      i++;
      if (quote === '"') strings.push(text);
      code += quote + quote;
    } else code += source[i++];
  }
  return { code, strings };
}

// Includes only of <library-or-core-header>; no quoted, absolute, parent or macro includes, and no assembler
// directives that embed files.
function unsafeInclude(code) {
  for (const line of code.split('\n')) {
    const include = /^\s*#\s*include\b(.*)$/.exec(line);
    if (include && !/^\s*<[A-Za-z0-9_][A-Za-z0-9_./-]*>\s*$/.test(include[1])) return true;
    if (include && /\.\./.test(include[1])) return true;
  }
  return /\.?incbin\b|__has_include|#\s*include_next\b/.test(code);
}

/**
 * @param {{ taskDir: string, candidate: string, cli?: string, env?: Record<string, string>, timeoutMs?: number }} options
 * @returns {Promise<{ status: string, reason: string, checks: number, passed: number, message?: string, compile?: string, failedChecks?: string[], diagnostics?: string }>}
 */
export async function gradeSketch({ taskDir, candidate, cli, env = {}, timeoutMs = 300000 }) {
  if (typeof candidate !== 'string') throw Error('Candidate sketch source required');
  const task = readTask(taskDir);
  const checks = task.requires.length + task.forbids.length + task.literals.length + 1;
  const resolved = cli ?? resolveArduinoCli({ env: { ...process.env, ...env } });
  const toolchain = await checkToolchain({ cli: resolved, env });
  if (!toolchain.ok)
    return { status: 'error', reason: toolchain.reason, message: toolchain.message, checks, passed: 0 };
  const { code, strings } = stripSource(candidate);
  // The raw source is checked too: a quoted include survives literal stripping only as `#include ""`.
  if (unsafeInclude(code) || /^\s*#\s*include\s*"/m.test(candidate))
    return {
      status: 'failed',
      reason: 'unsafe-include',
      compile: 'not-run',
      failedChecks: ['unsafe-include'],
      checks,
      passed: 0,
    };
  const failedChecks = [
    ...task.requires.filter((check) => !new RegExp(check.pattern).test(code)).map((check) => check.id),
    ...task.forbids.filter((check) => new RegExp(check.pattern).test(code)).map((check) => check.id),
    ...task.literals.filter((literal) => !strings.includes(literal)).map((literal) => 'literal:' + literal),
  ];
  const workspace = mkdtempSync(join(realpathSync(tmpdir()), 'gauntlet-embedded-'));
  try {
    const sketch = join(workspace, 'sketch');
    mkdirSync(sketch);
    writeFileSync(join(sketch, 'sketch.ino'), candidate);
    const compiled = await runCommand(
      resolved,
      ['compile', '--fqbn', task.fqbn, '--build-path', join(workspace, 'build'), '--no-color', sketch],
      { env: { ...process.env, ...env }, timeoutMs },
    );
    const diagnostics = String(compiled.output ?? '')
      .replaceAll(workspace, '<workspace>')
      .slice(-4000);
    const compile = compiled.code === 0 && !compiled.timedOut ? 'passed' : 'failed';
    if (compile === 'failed') failedChecks.push('compile');
    const reason = compiled.timedOut
      ? 'timeout'
      : compile === 'failed'
        ? 'compile-error'
        : failedChecks.length
          ? 'static-checks'
          : 'all-passed';
    return {
      status: failedChecks.length ? 'failed' : 'passed',
      reason,
      compile,
      failedChecks,
      checks,
      passed: checks - failedChecks.length,
      diagnostics,
    };
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}
