// Contract tests for the sandboxed coding reference runner. They need a running container engine: without one they
// are skipped locally and fail in CI, where the engine is part of the contract.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { defaults, run, validatePack, validateRegistry, type Profile } from '../src/index.ts';
import { containerExecutor } from '../examples/coding-v1/container-executor.mjs';
import { gradeCandidate, readTask } from '../examples/coding-v1/grade.mjs';

const engine = (() => {
  try {
    execFileSync('docker', ['version', '--format', '{{.Server.Version}}'], { stdio: 'ignore', timeout: 15000 });
    return true;
  } catch {
    return false;
  }
})();
const needsEngine = { skip: engine || process.env.CI ? false : 'no container engine running' };
const leftovers = () =>
  execFileSync('docker', ['ps', '-aq', '--filter', 'label=gauntlet.coding'], { encoding: 'utf8' }).trim();
const workspace = () => mkdtempSync(join(realpathSync(tmpdir()), 'coding-sandbox-'));
const python = (code: string) => ['python3', '-I', '-c', code];

test('the container boundary denies network, host files and writes outside the workspace', needsEngine, async () => {
  const execute = containerExecutor();
  const cwd = workspace();
  try {
    const probe = [
      'import os, socket, json',
      'out = {}',
      'try:',
      '    socket.create_connection(("1.1.1.1", 53), timeout=3); out["network"] = "open"',
      'except OSError:',
      '    out["network"] = "denied"',
      'try:',
      '    open("/etc/probe", "w"); out["root"] = "writable"',
      'except OSError:',
      '    out["root"] = "denied"',
      `out["repo"] = os.path.exists(${JSON.stringify(resolve('examples/coding-v1/tasks'))})`,
      'out["uid"] = os.getuid()',
      'out["files"] = sorted(os.listdir("."))',
      'print(json.dumps(out))',
    ].join('\n');
    writeFileSync(join(cwd, 'input.txt'), 'x');
    const outcome = await execute({ argv: python(probe), cwd, env: {}, timeoutMs: 20000 });
    assert.equal(outcome.code, 0);
    const seen = JSON.parse(String(outcome.stdout).trim().split('\n').at(-1)!);
    assert.deepEqual([seen.network, seen.root, seen.repo, seen.files], ['denied', 'denied', false, ['input.txt']]);
    assert.notEqual(seen.uid, 0);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
  assert.equal(leftovers(), '');
});

test('the container boundary kills a timed-out case and a memory hog, leaving no container', needsEngine, async () => {
  const execute = containerExecutor();
  const cwd = workspace();
  try {
    const started = Date.now();
    const looping = await execute({ argv: python('while True: pass'), cwd, env: {}, timeoutMs: 1500 });
    assert.equal(looping.timedOut, true);
    assert.ok(Date.now() - started < 15000);
    assert.equal(leftovers(), '');
    const hog = await execute({ argv: python('x = bytearray(1024 * 1024 * 1024)'), cwd, env: {}, timeoutMs: 20000 });
    assert.equal(hog.timedOut, false);
    assert.notEqual(hog.code, 0);
    assert.equal(leftovers(), '');
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('the runner refuses to run without a container engine', async () => {
  const execute = containerExecutor({ docker: '/nonexistent/docker' });
  await assert.rejects(
    (async () => {
      const cwd = workspace();
      try {
        return await execute({ argv: python('pass'), cwd, env: {}, timeoutMs: 1000 });
      } finally {
        rmSync(cwd, { recursive: true, force: true });
      }
    })(),
    /container engine unavailable/,
  );
});

const until = async (check: () => boolean, ms: number) => {
  for (const end = Date.now() + ms; Date.now() < end; await new Promise((resolve) => setTimeout(resolve, 250)))
    if (check()) return true;
  return check();
};

test('a SIGKILLed runner leaves no container behind', needsEngine, async () => {
  const cwd = workspace();
  const script = [
    `const { containerExecutor } = await import(${JSON.stringify(resolve('examples/coding-v1/container-executor.mjs'))});`,
    `await containerExecutor()({ argv: ['python3', '-I', '-c', 'while True: pass'], cwd: ${JSON.stringify(cwd)}, env: {}, timeoutMs: 4000 });`,
  ].join('\n');
  const child = spawn(process.execPath, ['--input-type=module', '-e', script], { detached: true, stdio: 'ignore' });
  try {
    assert.ok(await until(() => leftovers() !== '', 60000), 'container started');
    process.kill(-child.pid!, 'SIGKILL');
    assert.ok(await until(() => leftovers() === '', 12000), 'container gone within the in-container limit');
  } finally {
    try {
      process.kill(-child.pid!, 'SIGKILL');
    } catch {}
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('a candidate cannot write to its workspace or the host disk', needsEngine, async () => {
  const execute = containerExecutor();
  const cwd = workspace();
  try {
    const outcome = await execute({
      argv: python('open("big", "wb").write(bytes(200 * 1024 * 1024))'),
      cwd,
      env: {},
      timeoutMs: 20000,
    });
    assert.notEqual(outcome.code, 0);
    assert.equal(existsSync(join(cwd, 'big')), false);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('stale containers from a killed runner are swept before the next case', needsEngine, async () => {
  execFileSync('docker', [
    'run',
    '-d',
    '--rm',
    '--label',
    'gauntlet.coding=1',
    '--label',
    'gauntlet.coding.deadline=1',
    'python:3.12-alpine@sha256:c5ba3deef00c7758561a0f03c26f44f10589263d40e732b8748e0d1f38f6dd89',
    'sleep',
    '300',
  ]);
  assert.notEqual(leftovers(), '');
  const cwd = workspace();
  try {
    await containerExecutor()({ argv: python('pass'), cwd, env: {}, timeoutMs: 20000 });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
  assert.ok(await until(() => leftovers() === '', 10000));
});

test('image pulls happen before the case timer and runs keep no logs', async () => {
  const log = join(workspace(), 'calls.jsonl');
  process.env.FAKE_DOCKER_LOG = log;
  try {
    const graded = await gradeCandidate({
      taskDir: 'examples/coding-v1/tasks/parse-duration-regression',
      candidate: '',
      execute: containerExecutor({ docker: resolve('test/fixtures/fake-docker.mjs') }),
      timeoutMs: 1000,
    });
    assert.equal(graded.reason, 'malformed-results');
    const calls = readFileSync(log, 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line) as string[]);
    const runArgs = calls.find((call) => call[0] === 'run')!;
    for (const flag of [
      ['--log-driver', 'none'],
      ['--network', 'none'],
    ])
      assert.ok(
        runArgs.some((arg, index) => arg === flag[0] && runArgs[index + 1] === flag[1]),
        flag.join(' '),
      );
    assert.ok(runArgs.some((arg) => arg.startsWith('type=bind,') && arg.endsWith(',readonly')));
    const image = runArgs.findIndex((arg) => arg.startsWith('python:'));
    assert.deepEqual(runArgs.slice(image + 1, image + 4), ['timeout', '-s', 'KILL']);
  } finally {
    delete process.env.FAKE_DOCKER_LOG;
    rmSync(dirname(log), { recursive: true, force: true });
  }
});

const profile = (endpoint: string): Profile => ({
  schemaVersion: 1,
  id: 'coding-runner-fixture',
  model: 'fixture:1b',
  quantization: 'Q4_K_M',
  endpoint,
  context: 8192,
  maxOutputTokens: 1024,
  temperature: 0,
  topP: null,
  topK: null,
  seed: 7,
  think: null,
  parallel: 1,
  hardware: 'neutral',
  cache: 'neutral',
});

// A local stand-in for Ollama that answers each chat with a committed candidate for the task named in the prompt.
async function fakeModel(variant: 'reference' | 'wrong', requests: string[]) {
  const ids = readdirSync('examples/coding-v1/tasks');
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
      const send = (value: unknown) => response.end(JSON.stringify(value));
      if (request.url === '/api/version') return send({ version: 'fixture-v1' });
      if (request.url === '/api/tags') return send({ models: [{ name: 'fixture:1b', digest: 'b'.repeat(64) }] });
      requests.push(body);
      const prompt = (JSON.parse(body).messages as { content: string }[]).map((m) => m.content).join('\n');
      const id = ids.find((candidate) => prompt.includes(readTask(join('examples/coding-v1/tasks', candidate)).prompt));
      const { entry } = readTask(join('examples/coding-v1/tasks', String(id)));
      const code = readFileSync(
        join('test/fixtures/coding-v1', String(id), variant + entry.slice(entry.lastIndexOf('.'))),
        'utf8',
      );
      send({
        model: 'fixture:1b',
        message: { role: 'assistant', content: 'Here is the file.\n\n```\n' + code + '```\n' },
        done: true,
        done_reason: 'stop',
        eval_count: 40,
      });
    });
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const address = server.address() as { port: number };
  return { server, endpoint: 'http://127.0.0.1:' + address.port };
}

const registry = validateRegistry(
  {
    schemaVersion: 1,
    runners: {
      'coding-reference': {
        command: process.execPath,
        args: [resolve('examples/coding-v1/runner.mjs'), '{report}', '{configuration}', '{budget}', '{case}'],
        cwd: process.cwd(),
        layers: ['coding'],
        allowModels: true,
      },
    },
  },
  process.cwd(),
);

test('the reference runner asks the model, grades in containers and reports per case', needsEngine, async () => {
  const pack = validatePack(JSON.parse(readFileSync('examples/coding-v1.json', 'utf8')));
  const limits = { ...defaults, caseMs: 120000, suiteMs: 600000 };
  for (const [variant, expected] of [
    ['reference', true],
    ['wrong', false],
  ] as const) {
    const requests: string[] = [];
    const { server, endpoint } = await fakeModel(variant, requests);
    try {
      const report = await run(pack, profile(endpoint), limits, { execute: true, allowModels: true, registry });
      assert.equal(report.passed, expected, variant);
      assert.deepEqual(
        report.results.map((result) => result.status),
        pack.cases.map(() => (expected ? 'passed' : 'failed')),
        variant,
      );
      assert.equal(requests.length, pack.cases.length);
      for (const body of requests) {
        assert.equal(JSON.parse(body).stream, false);
        assert.doesNotMatch(body, /cases\.json|"expect"/);
      }
    } finally {
      server.close();
    }
  }
  assert.equal(leftovers(), '');
});
