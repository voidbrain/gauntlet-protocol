// Contract tests for the cad-3d-v1 OpenSCAD build-and-measure grader and reference runner (F-019-T02).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defaults, run, validatePack, validateRegistry, type Profile } from '../src/index.ts';
import { containerExecutor } from '../examples/coding-v1/container-executor.mjs';
import { gradeOpenScad, measureAsciiStl, readOpenScadTask, taskHash } from '../examples/cad-3d-v1/grade.mjs';

const tasksDir = resolve('examples/cad-3d-v1/tasks');
const ids = [
  'spacer-cylinder-regression',
  'l-bracket-regression',
  'open-tray-holdout',
  'flanged-bushing-holdout',
];
const task = (id: string) => join(tasksDir, id);
const fixture = (path: string) => readFileSync(join('test/fixtures/cad-3d-v1', path), 'utf8');

const engine = (() => {
  try {
    execFileSync('docker', ['version', '--format', '{{.Server.Version}}'], { stdio: 'ignore', timeout: 15000 });
    return true;
  } catch {
    return false;
  }
})();
const needsEngine = { skip: engine || process.env.CI ? false : 'no container engine running' };

// Fast deterministic stand-in executor that runs test/fixtures/fake-openscad.mjs in a process group.
async function fakeExecutor({ argv, cwd }: { argv: string[]; cwd: string }) {
  try {
    const stdout = execFileSync(process.execPath, [resolve('test/fixtures/fake-openscad.mjs'), ...argv.slice(1)], {
      cwd,
      encoding: 'utf8',
      timeout: 5000,
    });
    return { code: 0, stdout, timedOut: false };
  } catch (err) {
    const e = err as { status?: number; stdout?: string };
    return { code: e.status ?? 1, stdout: String(e.stdout ?? ''), timedOut: false };
  }
}

test('cad-3d pack has model questions and OpenSCAD coding tasks in both splits', () => {
  const pack = validatePack(JSON.parse(readFileSync('examples/cad-3d-v1.json', 'utf8')));
  const coding = pack.cases.filter((c) => c.layer === 'coding');
  assert.deepEqual(
    coding.map((c) => c.id),
    ids,
  );
  assert.deepEqual(new Set(coding.map((c) => c.split)), new Set(['regression', 'holdout']));
  assert.equal(
    coding.every(
      (c) =>
        c.area === 'cad-3d' &&
        c.runner === 'cad-3d-reference' &&
        c.requirements?.includes('coding-sandbox') &&
        c.capabilities.includes('openscad'),
    ),
    true,
  );
  for (const id of ids) assert.match(taskHash(task(id)), /^[0-9a-f]{64}$/);
  assert.notEqual(taskHash(task(ids[0])), taskHash(task(ids[1])));
});

test('OpenSCAD grader passes reference models, rejects wrong dimensions, solid bounding boxes and build failures', async () => {
  for (const id of ids) {
    const spec = readOpenScadTask(task(id));
    const right = await gradeOpenScad({
      taskDir: task(id),
      candidate: fixture(`${id}/reference.scad`),
      execute: fakeExecutor,
    });
    assert.deepEqual([id, right.status, right.reason, right.passed], [id, 'passed', 'all-passed', 4]);
    for (const key of ['sizeX', 'sizeY', 'sizeZ', 'volume'] as const) {
      assert.ok(
        Math.abs(right.measured[key] - spec.expected[key].target) <= spec.expected[key].tolerance + 1e-9,
        `${id}.${key}: ${right.measured[key]}`,
      );
    }

    const wrong = await gradeOpenScad({
      taskDir: task(id),
      candidate: fixture(`${id}/wrong.scad`),
      execute: fakeExecutor,
    });
    assert.equal(wrong.status, 'failed', id);
    assert.equal(wrong.reason, 'dimension-mismatch', id);
    assert.ok(wrong.passed < 4, id);

    // Anti-gaming: a plain solid bounding-box cube([sizeX, sizeY, sizeZ]) matches the 3 outer dimensions
    // but must fail on volume so a candidate cannot game hollow/cutout tasks by returning the bounding box.
    const box = `cube([${spec.expected.sizeX.target}, ${spec.expected.sizeY.target}, ${spec.expected.sizeZ.target}]);\n`;
    const gamed = await gradeOpenScad({
      taskDir: task(id),
      candidate: box,
      execute: fakeExecutor,
    });
    assert.equal(gamed.status, 'failed', `${id} solid bounding box must fail`);
    assert.equal(gamed.reason, 'dimension-mismatch', id);
    assert.ok(gamed.failedChecks.includes('volume'), `${id}: ${gamed.failedChecks.join(', ')}`);

    const broken = await gradeOpenScad({
      taskDir: task(id),
      candidate: fixture(`${id}/broken.scad`),
      execute: fakeExecutor,
    });
    assert.deepEqual([id, broken.status, broken.reason, broken.passed], [id, 'failed', 'build-error', 0]);
  }
});

test('OpenSCAD grader refuses unsafe file directives and forged or empty STL output', async () => {
  for (const directive of [
    'include <../../etc/passwd>\ncube([10, 10, 10]);\n',
    'use </etc/hosts>\ncube([10, 10, 10]);\n',
    'surface(file = "secret.dat");\n',
    'import("other.stl");\n',
  ]) {
    const unsafe = await gradeOpenScad({
      taskDir: task('spacer-cylinder-regression'),
      candidate: directive,
      execute: fakeExecutor,
    });
    assert.deepEqual([unsafe.status, unsafe.reason, unsafe.passed], ['failed', 'unsafe-directive', 0]);
  }
  assert.equal(measureAsciiStl('not an stl'), null);
  assert.equal(measureAsciiStl('solid empty\nendsolid empty\n'), null);
});

test('OpenSCAD container sandbox renders reference models and rejects wrong and broken fixtures', needsEngine, async () => {
  const execute = containerExecutor();
  for (const id of ids) {
    const right = await gradeOpenScad({
      taskDir: task(id),
      candidate: fixture(`${id}/reference.scad`),
      execute,
      timeoutMs: 30000,
    });
    assert.deepEqual([id, right.status, right.reason], [id, 'passed', 'all-passed']);
    const wrong = await gradeOpenScad({
      taskDir: task(id),
      candidate: fixture(`${id}/wrong.scad`),
      execute,
      timeoutMs: 30000,
    });
    assert.deepEqual([id, wrong.status, wrong.reason], [id, 'failed', 'dimension-mismatch']);
    const broken = await gradeOpenScad({
      taskDir: task(id),
      candidate: fixture(`${id}/broken.scad`),
      execute,
      timeoutMs: 30000,
    });
    assert.deepEqual([id, broken.status, broken.reason], [id, 'failed', 'build-error']);
  }
});

const profile = (endpoint: string): Profile => ({
  schemaVersion: 1,
  id: 'cad-3d-runner-fixture',
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

async function fakeModel(variant: 'reference' | 'wrong', requests: string[]) {
  const server = createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
      const send = (value: unknown) => response.end(JSON.stringify(value));
      if (request.url === '/api/version') return send({ version: 'fixture-v1' });
      if (request.url === '/api/tags') return send({ models: [{ name: 'fixture:1b', digest: 'b'.repeat(64) }] });
      requests.push(body);
      const prompt = (JSON.parse(body).messages as { content: string }[]).map((m) => m.content).join('\n');
      const id = ids.find((caseId) => prompt.includes(readOpenScadTask(task(caseId)).prompt));
      const code = fixture(`${String(id)}/${variant}.scad`);
      send({
        model: 'fixture:1b',
        message: { role: 'assistant', content: 'Here is the OpenSCAD model.\n\n```openscad\n' + code + '```\n' },
        done: true,
        done_reason: 'stop',
        eval_count: 35,
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
      'cad-3d-reference': {
        command: process.execPath,
        args: [resolve('examples/cad-3d-v1/runner.mjs'), '{report}', '{configuration}', '{budget}', '{case}'],
        cwd: process.cwd(),
        layers: ['coding'],
        allowModels: true,
      },
    },
  },
  process.cwd(),
);

test('cad-3d reference runner asks the model, renders in the container sandbox and grades each OpenSCAD task', needsEngine, async () => {
  const full = validatePack(JSON.parse(readFileSync('examples/cad-3d-v1.json', 'utf8')));
  const codingOnly = validatePack({ ...full, cases: full.cases.filter((c) => c.layer === 'coding') });
  const limits = { ...defaults, caseMs: 120000, suiteMs: 600000 };
  for (const [variant, expected] of [
    ['reference', true],
    ['wrong', false],
  ] as const) {
    const requests: string[] = [];
    const { server, endpoint } = await fakeModel(variant, requests);
    try {
      const report = await run(codingOnly, profile(endpoint), limits, {
        execute: true,
        allowModels: true,
        registry,
      });
      assert.equal(report.passed, expected, variant);
      assert.deepEqual(
        report.results.map((r) => r.status),
        codingOnly.cases.map(() => (expected ? 'passed' : 'failed')),
        variant,
      );
      assert.equal(requests.length, codingOnly.cases.length);
      for (const body of requests) assert.doesNotMatch(body, /"tolerance"|"volume"/);
    } finally {
      server.close();
    }
  }
});
