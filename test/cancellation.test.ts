import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, realpathSync, readFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as delay } from 'node:timers/promises';
for (const signal of ['SIGTERM', 'SIGINT'] as const)
  test(`owner ${signal} kills active runner and leaves later cases unrun`, async () => {
    const root = mkdtempSync(join(realpathSync(tmpdir()), 'gauntlet-cancel-'));
    const pidFile = join(root, 'runner.pid'),
      output = join(root, 'report.json');
    let runnerPid: number | undefined;
    const host = spawn(
      process.execPath,
      ['test/fixtures/cancel-host.mjs', resolve('test/fixtures/sleeper.mjs'), pidFile, output],
      { stdio: 'ignore' },
    );
    const closed = new Promise<void>((resolve) => host.once('close', () => resolve()));
    try {
      const until = Date.now() + 5000;
      while (!existsSync(pidFile) && Date.now() < until) await delay(10);
      assert.equal(existsSync(pidFile), true, 'Runner started');
      runnerPid = Number(readFileSync(pidFile, 'utf8'));
      host.kill(signal);
      await Promise.race([
        closed,
        delay(3000).then(() => {
          throw Error('Host failed to stop');
        }),
      ]);
      let alive = true;
      try {
        process.kill(runnerPid, 0);
      } catch {
        alive = false;
      }
      assert.equal(alive, false, 'Detached runner must not outlive owner cancellation');
      const report = JSON.parse(readFileSync(output, 'utf8'));
      assert.equal(report.passed, false);
      assert.equal(report.results[0].status, 'error');
      assert.equal(report.results[1].status, 'not-run');
    } finally {
      host.kill('SIGKILL');
      if (runnerPid)
        try {
          process.kill(-runnerPid, 'SIGKILL');
        } catch {}
      rmSync(root, { recursive: true, force: true });
    }
  });

test('an interrupted CLI run checkpoints and resumes only unfinished cases', async (t) => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'gauntlet-resume-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const pack = join(root, 'pack.json'),
    registry = join(root, 'registry.json'),
    interrupted = join(root, 'interrupted.json'),
    resumed = join(root, 'resumed.json'),
    uninterrupted = join(root, 'uninterrupted.json'),
    log = join(root, 'runs.log'),
    cache = join(root, 'cache'),
    sourceKey = 'd'.repeat(64);
  writeFileSync(
    pack,
    JSON.stringify({
      schemaVersion: 1,
      id: 'resume',
      version: '1.0.0',
      cases: ['first', 'second'].map((id) => ({
        id,
        layer: 'system',
        split: 'regression',
        capabilities: ['fixture'],
        critical: true,
        expensive: false,
        runner: 'resume',
      })),
    }),
  );
  writeFileSync(
    registry,
    JSON.stringify({
      schemaVersion: 1,
      runners: {
        resume: {
          command: process.execPath,
          args: [resolve('test/fixtures/resume-runner.mjs'), '{case}', '{report}', log],
          cwd: process.cwd(),
          layers: ['system'],
          allowModels: false,
        },
      },
    }),
  );
  const args = (out: string) => [
    'bin/gauntlet.mjs',
    'run',
    `--pack=${pack}`,
    `--registry=${registry}`,
    `--out=${out}`,
    `--cache-dir=${cache}`,
    `--source-key=${sourceKey}`,
    '--execute',
  ];
  const host = spawn(process.execPath, args(interrupted), { stdio: 'ignore' });
  const until = Date.now() + 5000;
  while ((!existsSync(log) || readFileSync(log, 'utf8') !== 'first\nsecond\n') && Date.now() < until) await delay(10);
  assert.equal(readFileSync(log, 'utf8'), 'first\nsecond\n');
  host.kill('SIGTERM');
  await new Promise<void>((resolve) => host.once('close', () => resolve()));
  const partial = JSON.parse(readFileSync(interrupted, 'utf8'));
  assert.equal(partial.results[0].status, 'passed');
  assert.equal(partial.results[1].status, 'error');

  const resume = spawnSync(process.execPath, [...args(resumed), `--resume=${interrupted}`], { encoding: 'utf8' });
  assert.equal(resume.status, 0, resume.stderr);
  assert.deepEqual(readFileSync(log, 'utf8').trim().split('\n'), ['first', 'second', 'second']);
  const full = spawnSync(process.execPath, args(uninterrupted), { encoding: 'utf8' });
  assert.equal(full.status, 0, full.stderr);
  const resumedReport = JSON.parse(readFileSync(resumed, 'utf8'));
  const uninterruptedReport = JSON.parse(readFileSync(uninterrupted, 'utf8'));
  assert.deepEqual(
    resumedReport.results.map(({ id, status }: { id: string; status: string }) => [id, status]),
    uninterruptedReport.results.map(({ id, status }: { id: string; status: string }) => [id, status]),
  );
});
