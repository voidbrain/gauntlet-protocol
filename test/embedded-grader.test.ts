// Contract tests for the embedded-v1 compile grader (F-016-T02). Most run against a stand-in arduino-cli so CI needs
// no toolchain; the last test compiles every fixture with the real arduino-cli and pinned cores, and is skipped where
// they are not installed (docs/guides/arduino-cli.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, copyFileSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { checkToolchain, gradeSketch, readTask, resolveArduinoCli, taskHash } from '../examples/embedded-v1/grade.mjs';

const tasksDir = resolve('examples/embedded-v1/tasks');
const ids = [
  'blink-millis-esp32-regression',
  'debounce-toggle-uno-regression',
  'pwm-fade-esp32-holdout',
  'serial-command-uno-holdout',
];
const task = (id: string) => join(tasksDir, id);
const fixture = (path: string) => readFileSync(join('test/fixtures/embedded-v1', path), 'utf8');
const fake = resolve('test/fixtures/fake-arduino-cli.mjs');

test('embedded tasks cover both boards in regression and holdout splits', () => {
  const tasks = ids.map((id) => ({ id, ...readTask(task(id)) }));
  for (const fqbn of ['arduino:avr:uno', 'esp32:esp32:esp32'])
    assert.deepEqual(
      new Set(tasks.filter((t) => t.fqbn === fqbn).map((t) => t.id.split('-').at(-1))),
      new Set(['regression', 'holdout']),
      fqbn,
    );
  for (const id of ids) assert.match(taskHash(task(id)), /^[0-9a-f]{64}$/);
  assert.notEqual(taskHash(task(ids[0])), taskHash(task(ids[1])));
});

test('embedded grader passes the reference sketches and fails the wrong ones, deterministically', async () => {
  for (const id of ids) {
    const right = await gradeSketch({ taskDir: task(id), candidate: fixture(`${id}/reference.ino`), cli: fake });
    assert.deepEqual([id, right.status, right.reason, right.passed], [id, 'passed', 'all-passed', right.checks]);
    const wrong = await gradeSketch({ taskDir: task(id), candidate: fixture(`${id}/wrong.ino`), cli: fake });
    assert.equal(wrong.status, 'failed', id);
    assert.ok(wrong.passed < wrong.checks, id);
    const again = await gradeSketch({ taskDir: task(id), candidate: fixture(`${id}/wrong.ino`), cli: fake });
    assert.deepEqual(again, wrong, id);
  }
  const blocking = await gradeSketch({
    taskDir: task('blink-millis-esp32-regression'),
    candidate: fixture('blink-millis-esp32-regression/wrong.ino'),
    cli: fake,
  });
  assert.deepEqual(
    [blocking.reason, blocking.compile, blocking.failedChecks],
    ['static-checks', 'passed', ['millis', 'no-delay']],
  );
  const broken = await gradeSketch({
    taskDir: task('debounce-toggle-uno-regression'),
    candidate: fixture('debounce-toggle-uno-regression/wrong.ino'),
    cli: fake,
  });
  assert.deepEqual([broken.reason, broken.compile, broken.failedChecks], ['compile-error', 'failed', ['compile']]);
  assert.match(String(broken.diagnostics), /lastChange/);
});

test('embedded grader ignores comments and strings and refuses host includes without compiling', async () => {
  const decoy = await gradeSketch({
    taskDir: task('blink-millis-esp32-regression'),
    candidate: fixture('attacks/comment-decoy.ino'),
    cli: fake,
  });
  assert.equal(decoy.status, 'failed');
  assert.deepEqual(decoy.failedChecks, ['millis', 'output-pin-2', 'writes-pin-2', 'no-delay']);
  const include = await gradeSketch({
    taskDir: task('blink-millis-esp32-regression'),
    candidate: fixture('attacks/host-include.ino'),
    cli: fake,
  });
  assert.deepEqual(
    [include.status, include.reason, include.compile, include.passed],
    ['failed', 'unsafe-include', 'not-run', 0],
  );
  const literals = await gradeSketch({
    taskDir: task('serial-command-uno-holdout'),
    candidate: fixture('serial-command-uno-holdout/reference.ino').replaceAll('"ERR"', '"FAIL"'),
    cli: fake,
  });
  assert.deepEqual([literals.status, literals.failedChecks], ['failed', ['literal:ERR']]);
});

test('embedded grader bounds compile time', async () => {
  const slow = await gradeSketch({
    taskDir: task('blink-millis-esp32-regression'),
    candidate: fixture('blink-millis-esp32-regression/reference.ino') + '\n// FAKE_SLOW\n',
    cli: fake,
    timeoutMs: 1000,
  });
  assert.deepEqual([slow.status, slow.reason, slow.compile], ['failed', 'timeout', 'failed']);
});

test('embedded grader reports a missing toolchain or unpinned core as an error, not a failed candidate', async () => {
  const reference = fixture('blink-millis-esp32-regression/reference.ino');
  const missing = await gradeSketch({
    taskDir: task('blink-millis-esp32-regression'),
    candidate: reference,
    cli: '/nonexistent/arduino-cli',
  });
  assert.deepEqual([missing.status, missing.reason], ['error', 'toolchain-missing']);
  assert.match(String(missing.message), /GAUNTLET_ARDUINO_CLI/);
  assert.match(String(missing.message), /docs\/guides\/arduino-cli\.md/);
  const absent = await gradeSketch({
    taskDir: task('blink-millis-esp32-regression'),
    candidate: reference,
    cli: fake,
    env: { FAKE_ARDUINO_CORES: '{"arduino:avr":"1.8.6"}' },
  });
  assert.deepEqual([absent.status, absent.reason], ['error', 'core-missing']);
  assert.match(String(absent.message), /esp32:esp32@3\.0\.7/);
  const drifted = await gradeSketch({
    taskDir: task('debounce-toggle-uno-regression'),
    candidate: fixture('debounce-toggle-uno-regression/reference.ino'),
    cli: fake,
    env: { FAKE_ARDUINO_CORES: '{"arduino:avr":"1.8.8","esp32:esp32":"3.0.7"}' },
  });
  assert.deepEqual([drifted.status, drifted.reason], ['error', 'core-version-mismatch']);
  assert.match(String(drifted.message), /arduino:avr 1\.8\.8.*1\.8\.6/);
});

test('arduino-cli resolves from GAUNTLET_ARDUINO_CLI, then the default locations, then PATH', () => {
  const bin = mkdtempSync(join(realpathSync(tmpdir()), 'arduino-path-'));
  try {
    copyFileSync(fake, join(bin, 'arduino-cli'));
    chmodSync(join(bin, 'arduino-cli'), 0o755);
    assert.equal(resolveArduinoCli({ env: { GAUNTLET_ARDUINO_CLI: fake, PATH: bin }, defaults: [] }), fake);
    assert.equal(resolveArduinoCli({ env: { PATH: bin }, defaults: [fake] }), fake);
    assert.equal(
      resolveArduinoCli({ env: { PATH: bin }, defaults: ['/nonexistent/arduino-cli'] }),
      join(bin, 'arduino-cli'),
    );
    assert.equal(resolveArduinoCli({ env: { PATH: '' }, defaults: [] }), undefined);
  } finally {
    rmSync(bin, { recursive: true, force: true });
  }
});

const real = resolveArduinoCli();
const ready = real ? await checkToolchain({ cli: real }) : undefined;
const needsToolchain = {
  skip: ready?.ok ? false : `arduino-cli with the pinned cores is not installed (${ready?.message ?? 'not found'})`,
  timeout: 900000,
};

test('real arduino-cli compiles the reference sketches and rejects the wrong ones', needsToolchain, async () => {
  const expected: Record<string, string> = {
    'blink-millis-esp32-regression': 'static-checks',
    'debounce-toggle-uno-regression': 'compile-error',
    'pwm-fade-esp32-holdout': 'compile-error',
    'serial-command-uno-holdout': 'static-checks',
  };
  for (const id of ids) {
    const right = await gradeSketch({ taskDir: task(id), candidate: fixture(`${id}/reference.ino`) });
    assert.deepEqual([id, right.status, right.reason], [id, 'passed', 'all-passed'], right.diagnostics);
    const wrong = await gradeSketch({ taskDir: task(id), candidate: fixture(`${id}/wrong.ino`) });
    assert.deepEqual([id, wrong.status, wrong.reason], [id, 'failed', expected[id]]);
  }
});
