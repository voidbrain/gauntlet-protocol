// Contract tests for the embedded-v1 Raspberry Pi grader (F-016-T03): byte-compilation and AST checks only; the
// candidate is never imported or run.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { gradePiSolution, piTaskHash, readPiTask } from '../examples/embedded-v1/pi-grade.mjs';

const tasksDir = resolve('examples/embedded-v1/pi-tasks');
const ids = [
  'led-blink-gpiozero-regression',
  'pwm-servo-rpigpio-regression',
  'button-toggle-gpiozero-holdout',
  'edge-counter-rpigpio-holdout',
];
const task = (id: string) => join(tasksDir, id);
const fixture = (path: string) => readFileSync(join('test/fixtures/embedded-v1-pi', path), 'utf8');

test('Pi tasks cover gpiozero and RPi.GPIO in regression and holdout splits', () => {
  const library = (id: string) => (id.includes('gpiozero') ? 'gpiozero' : 'RPi.GPIO');
  for (const name of ['gpiozero', 'RPi.GPIO'])
    assert.deepEqual(
      new Set(ids.filter((id) => library(id) === name).map((id) => id.split('-').at(-1))),
      new Set(['regression', 'holdout']),
    );
  for (const id of ids) {
    assert.ok(readPiTask(task(id)).prompt);
    assert.match(piTaskHash(task(id)), /^[0-9a-f]{64}$/);
  }
});

test('Pi grader passes the references and fails the wrong solutions, deterministically', async () => {
  const expected: Record<string, [string, string[]]> = {
    'led-blink-gpiozero-regression': ['static-checks', ['blink-timing', 'pause', 'no-busy-loop']],
    'pwm-servo-rpigpio-regression': [
      'static-checks',
      ['bcm-mode', 'output-18', 'pwm-18-50hz', 'cleanup-in-finally', 'no-board-mode'],
    ],
    'button-toggle-gpiozero-holdout': ['static-checks', ['when-pressed', 'pause', 'no-polling', 'no-busy-loop']],
    'edge-counter-rpigpio-holdout': ['syntax-error', ['syntax']],
  };
  for (const id of ids) {
    const right = await gradePiSolution({ taskDir: task(id), candidate: fixture(`${id}/reference.py`) });
    assert.deepEqual([id, right.status, right.reason, right.passed], [id, 'passed', 'all-passed', right.checks]);
    const wrong = await gradePiSolution({ taskDir: task(id), candidate: fixture(`${id}/wrong.py`) });
    assert.deepEqual([id, wrong.status, wrong.reason, wrong.failedChecks], [id, 'failed', ...expected[id]]);
    assert.ok(wrong.passed < wrong.checks, id);
    assert.deepEqual(await gradePiSolution({ taskDir: task(id), candidate: fixture(`${id}/wrong.py`) }), wrong);
  }
});

test('Pi grader never runs the candidate and ignores names in comments and strings', async () => {
  const dir = mkdtempSync(join(realpathSync(tmpdir()), 'pi-marker-'));
  const marker = join(dir, 'ran');
  try {
    const graded = await gradePiSolution({
      taskDir: task('led-blink-gpiozero-regression'),
      candidate: fixture('attacks/side-effect.py'),
      env: { GAUNTLET_PI_MARKER: marker },
    });
    assert.equal(graded.status, 'failed');
    assert.equal(existsSync(marker), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const decoy = await gradePiSolution({
    taskDir: task('led-blink-gpiozero-regression'),
    candidate: fixture('attacks/comment-decoy.py'),
  });
  assert.deepEqual(decoy.failedChecks, ['led-17', 'blink-timing', 'pause', 'no-busy-loop']);
});

test('Pi grader accepts keyword pins and rejects a wrong pin', async () => {
  const keyword = await gradePiSolution({
    taskDir: task('led-blink-gpiozero-regression'),
    candidate: fixture('led-blink-gpiozero-regression/reference.py').replace('LED(17)', 'LED(pin=17)'),
  });
  assert.equal(keyword.status, 'passed');
  const pin = await gradePiSolution({
    taskDir: task('led-blink-gpiozero-regression'),
    candidate: fixture('led-blink-gpiozero-regression/reference.py').replace('LED(17)', 'LED(18)'),
  });
  assert.deepEqual(pin.failedChecks, ['led-17']);
});

test('Pi grader reports a missing Python as an error, not a failed candidate', async () => {
  const missing = await gradePiSolution({
    taskDir: task('led-blink-gpiozero-regression'),
    candidate: fixture('led-blink-gpiozero-regression/reference.py'),
    python: '/nonexistent/python3',
  });
  assert.deepEqual([missing.status, missing.reason], ['error', 'toolchain-missing']);
  assert.match(String(missing.message), /GAUNTLET_PYTHON/);
});
