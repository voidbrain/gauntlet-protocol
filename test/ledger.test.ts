import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, symlinkSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import {
  run,
  defaults,
  emptyLedger,
  recordRun,
  mergeRun,
  pendingCases,
  validateLedger,
  caseHash,
  validateReport,
  type Pack,
  type Profile,
  type Report,
} from '../src/index.ts';

const profile: Profile = {
  schemaVersion: 1,
  id: 'fixture',
  model: 'fixture:1b',
  quantization: 'Q4_K_M',
  endpoint: 'http://127.0.0.1:11434',
  context: 8192,
  maxOutputTokens: 64,
  temperature: 0.2,
  topP: null,
  topK: null,
  seed: 42,
  think: null,
  parallel: 1,
  hardware: 'neutral',
  cache: 'neutral',
};
const modelCase = (id: string, content = 'Return {"ok":true}'): Pack['cases'][number] => ({
  id,
  layer: 'model',
  split: 'regression',
  capabilities: ['structured-output'],
  critical: false,
  expensive: false,
  messages: [{ role: 'user', content }],
  expected: { kind: 'json', value: { ok: true } },
});
const pack = (id: string, ...cases: Pack['cases']): Pack => ({ schemaVersion: 1, id, version: '1.0.0', cases });

// A local Ollama stand-in that answers {"ok":true}; no network, no model.
const answering = (answer: () => string | Error) =>
  (async (url: unknown) => {
    const path = new URL(String(url)).pathname;
    const answers: Record<string, unknown> = {
      '/api/version': { version: 'fixture-v1' },
      '/api/show': { model_info: { 'general.file_type': 15 }, details: { quantization_level: 'Q4_K_M' } },
      '/api/tags': { models: [{ name: profile.model, size: 100, digest: 'a'.repeat(64) }] },
      '/api/ps': { models: [] },
      '/api/generate': { done: true, done_reason: 'unload' },
      '/api/chat': {
        model: profile.model,
        message: { content: '' },
        done: true,
        eval_count: 3,
        prompt_eval_count: 5,
        total_duration: 6000000,
      },
    };
    if (!(path in answers)) throw Error('Unexpected endpoint ' + path);
    if (path === '/api/chat') {
      const a = answer();
      if (a instanceof Error) throw a;
      (answers[path] as { message: { content: string } }).message.content = a;
    }
    return new Response(JSON.stringify(answers[path]));
  }) as typeof fetch;
const fetcher = answering(() => '{"ok":true}');
const execute = (p: Pack, prof: Profile = profile, f: typeof fetch = fetcher, repeat = 1) =>
  run(p, prof, { ...defaults, repeat }, { execute: true, allowModels: true, fetch: f }) as Promise<Report>;

test('ledger: a run covers exactly the case definitions it ran, under its profile', async () => {
  const smoke = pack('smoke', modelCase('a'), modelCase('b'));
  const report = await execute(smoke);
  const ledger = recordRun(emptyLedger(), report, smoke);
  assert.equal(validateLedger(ledger).entries.length, 2);
  assert.deepEqual(Object.keys(ledger.entries[0]).sort(), [
    'case',
    'caseHash',
    'finished',
    // B-002 deliberately added the run identity to every entry.
    'modelDigest',
    'pack',
    'packVersion',
    'profileHash',
    'reportHash',
    'runtimeHash',
    'scenarioHash',
    'sourceKey',
    'status',
  ]);
  assert.ok(!JSON.stringify(ledger).includes('Return'), 'the ledger holds no prompts or outputs');
  assert.deepEqual(pendingCases([smoke], ledger, { profile }), []);

  // A release adds a pack and changes a case: new and changed are listed, unchanged stays covered.
  const changed = pack('smoke', modelCase('a'), modelCase('b', 'Return {"ok":true} now'));
  const expanded = pack('expanded', modelCase('c'));
  assert.deepEqual(
    pendingCases([changed, expanded], ledger, { profile }).map((p) => [p.pack, p.case, p.reason]),
    [
      ['smoke', 'b', 'changed'],
      ['expanded', 'c', 'new'],
    ],
  );
  // Another profile ran nothing yet; without a profile, any run covers.
  const other = { ...profile, id: 'other', seed: 7 };
  assert.deepEqual(
    pendingCases([smoke], ledger, { profile: other }).map((p) => p.reason),
    ['other-profile', 'other-profile'],
  );
  assert.deepEqual(pendingCases([smoke], ledger), []);
  // Age makes runs stale.
  const later = Date.parse(report.finished) + 31 * 86400000;
  assert.deepEqual(
    pendingCases([smoke], ledger, { maxAgeMs: 30 * 86400000, now: later }).map((p) => p.reason),
    ['stale', 'stale'],
  );
});

test('ledger: refuses a report of another pack definition and a tampered ledger', async () => {
  const smoke = pack('smoke', modelCase('a'));
  const report = await execute(smoke);
  assert.throws(
    () => recordRun(emptyLedger(), report, pack('smoke', modelCase('a', 'different'))),
    /this pack definition/,
  );
  assert.throws(() => recordRun(emptyLedger(), { ...report, results: [] }, smoke));
  const ledger = recordRun(emptyLedger(), report, smoke);
  assert.throws(() => validateLedger({ ...ledger, entries: [...ledger.entries, ledger.entries[0]] }), /Duplicate/);
  assert.throws(() => validateLedger({ ...ledger, entries: [{ ...ledger.entries[0], output: 'x' }] }), /entry/);
  // Recording the same report twice is idempotent.
  assert.deepEqual(recordRun(ledger, report, smoke), ledger);
});

test('ledger: partial merges retain other cases and report newer conflicts', async () => {
  const smoke = pack('smoke', modelCase('a'), modelCase('b'));
  const original = await execute(smoke);
  const ledger = recordRun(emptyLedger(), original, smoke);
  const partial = validateReport({
    ...original,
    id: 'partial-newer',
    finished: new Date(Date.parse(original.finished) + 1000).toISOString(),
    results: [original.results[0]],
    complete: false,
    passed: false,
    usage: { outputTokens: original.results[0].tokens },
  });
  const newer = mergeRun(ledger, partial, smoke);
  assert.equal(newer.ledger.entries.length, 2);
  assert.deepEqual(
    newer.changes.map((change) => [change.case, change.outcome]),
    [['a', 'replaced']],
  );
  assert.equal(newer.ledger.entries.find((entry) => entry.case === 'b')?.reportHash, ledger.entries[1].reportHash);

  const older = mergeRun(newer.ledger, original, smoke);
  assert.deepEqual(older.ledger, newer.ledger);
  assert.deepEqual(
    older.changes.map((change) => [change.case, change.outcome]),
    [
      ['a', 'kept-newer'],
      ['b', 'unchanged'],
    ],
  );
});

test('ledger: only graded runs cover; repeats, newer runs and ties are deterministic', async () => {
  const smoke = pack('smoke', modelCase('a'));
  // The runtime never answered: an error covers nothing.
  const down = await execute(
    smoke,
    profile,
    answering(() => new Error('connect ECONNREFUSED')),
  );
  assert.equal(down.results[0].status, 'error');
  assert.deepEqual(recordRun(emptyLedger(), down, smoke).entries, []);
  // A failed answer is a graded run: covered, recorded as failed.
  const wrong = await execute(
    smoke,
    profile,
    answering(() => '{"ok":false}'),
  );
  const failed = recordRun(emptyLedger(), wrong, smoke);
  assert.equal(failed.entries[0].status, 'failed');
  assert.deepEqual(pendingCases([smoke], failed, { profile }), []);
  // Repeats: one failed iteration makes the case failed; an ungraded iteration leaves it uncovered.
  let n = 0;
  const mixed = await execute(
    smoke,
    profile,
    answering(() => (n++ % 2 ? '{"ok":false}' : '{"ok":true}')),
    2,
  );
  assert.equal(recordRun(emptyLedger(), mixed, smoke).entries[0].status, 'failed');
  let m = 0;
  const flaky = await execute(
    smoke,
    profile,
    answering(() => (m++ % 2 ? new Error('reset') : '{"ok":true}')),
    2,
  );
  assert.deepEqual(recordRun(emptyLedger(), flaky, smoke).entries, []);
  // A newer run replaces an older one; recording the older one later does not undo it.
  const older = { ...wrong, started: '2026-01-01T00:00:00.000Z', finished: '2026-01-01T00:00:01.000Z' };
  const newer = await execute(smoke);
  const forward = recordRun(recordRun(emptyLedger(), older, smoke), newer, smoke);
  const backward = recordRun(recordRun(emptyLedger(), newer, smoke), older, smoke);
  assert.deepEqual(forward, backward);
  assert.equal(forward.entries[0].status, 'passed');
  // Equal times: the order of recording does not matter.
  const twin = { ...wrong, started: newer.started, finished: newer.finished };
  assert.deepEqual(
    recordRun(recordRun(emptyLedger(), twin, smoke), newer, smoke),
    recordRun(recordRun(emptyLedger(), newer, smoke), twin, smoke),
  );
});

test('ledger: system cases run without a profile stay covered under any model profile', () => {
  const system: Pack = pack('system', {
    id: 's',
    layer: 'system',
    split: 'regression',
    capabilities: ['policy'],
    critical: true,
    expensive: false,
    runner: 'policy',
  });
  const ledger = validateLedger({
    schemaVersion: 1,
    entries: [
      {
        pack: 'system',
        packVersion: '1.0.0',
        case: 's',
        caseHash: caseHash(system.cases[0]),
        profileHash: null,
        status: 'passed',
        reportHash: 'b'.repeat(64),
        finished: '2026-11-11T00:00:00.000Z',
      },
    ],
  });
  assert.deepEqual(pendingCases([system], ledger, { profile }), []);
  // A model case run without a profile does not cover a profiled request.
  const model = pack('m', modelCase('x'));
  const modelLedger = validateLedger({
    schemaVersion: 1,
    entries: [{ ...ledger.entries[0], pack: 'm', case: 'x', caseHash: caseHash(model.cases[0]) }],
  });
  assert.deepEqual(
    pendingCases([model], modelLedger, { profile }).map((p) => p.reason),
    ['other-profile'],
  );
});

test('ledger: the CLI records a saved report and lists pending cases with exit 1', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'gauntlet ledger '));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const smoke = pack('smoke', modelCase('a'));
  const expanded = pack('expanded', modelCase('c'));
  const files = {
    smoke: join(dir, 'smoke.json'),
    expanded: join(dir, 'expanded.json'),
    report: join(dir, 'report.json'),
    ledger: join(dir, 'ledger.json'),
  };
  writeFileSync(files.smoke, JSON.stringify(smoke));
  writeFileSync(files.expanded, JSON.stringify(expanded));
  writeFileSync(files.report, JSON.stringify(await execute(smoke)));
  const cli = (...args: string[]) => spawnSync(process.execPath, ['bin/gauntlet.mjs', ...args], { encoding: 'utf8' });
  const before = cli('pending', `--packs=${files.smoke},${files.expanded}`, `--ledger=${files.ledger}`);
  assert.equal(before.status, 1);
  assert.equal(before.stdout, 'smoke/a (new)\nexpanded/c (new)\n');
  const rec = cli('ledger', `--ledger=${files.ledger}`, `--report=${files.report}`, `--pack=${files.smoke}`);
  assert.equal(rec.status, 0, rec.stderr);
  assert.equal(JSON.parse(readFileSync(files.ledger, 'utf8')).entries.length, 1);
  const after = cli('pending', `--packs=${files.smoke},${files.expanded}`, `--ledger=${files.ledger}`, '--json');
  assert.equal(after.status, 1);
  assert.deepEqual(
    JSON.parse(after.stdout).map((p: { case: string }) => p.case),
    ['c'],
  );
  assert.equal(cli('pending', `--packs=${files.smoke}`, `--ledger=${files.ledger}`).status, 0);
  // Errors exit 2, never 1, so a consumer cannot mistake them for pending cases.
  assert.equal(cli('pending', `--packs=${files.smoke}`, `--ledger=${files.ledger}`, '--max-age-days=x').status, 2);
  assert.equal(cli('pending', `--packs=${join(dir, 'missing.json')}`, `--ledger=${files.ledger}`).status, 2);
  writeFileSync(join(dir, 'bad-ledger.json'), '{"schemaVersion":1,"entries":[{"x":1}]}');
  assert.equal(cli('pending', `--packs=${files.smoke}`, `--ledger=${join(dir, 'bad-ledger.json')}`).status, 2);
  symlinkSync(join(dir, 'elsewhere.json'), join(dir, 'link.json'));
  assert.equal(
    cli('ledger', `--ledger=${join(dir, 'link.json')}`, `--report=${files.report}`, `--pack=${files.smoke}`).status,
    2,
  );
});

test('ledger: run --pending executes pending cases and neutrally lists current cases', async (t) => {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'gauntlet-incremental-')));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const systemCase = (id: string): Pack['cases'][number] => ({
    id,
    layer: 'system',
    split: 'regression',
    capabilities: ['policy'],
    critical: true,
    expensive: false,
    runner: 'policy',
  });
  const current = pack('incremental', systemCase('current'));
  const expanded = pack('incremental', systemCase('current'), systemCase('new'));
  const files = {
    current: join(dir, 'current.json'),
    expanded: join(dir, 'expanded.json'),
    registry: join(dir, 'registry.json'),
    full: join(dir, 'full.json'),
    incremental: join(dir, 'incremental.json'),
    ledger: join(dir, 'ledger.json'),
    cache: join(dir, 'cache'),
  };
  writeFileSync(files.current, JSON.stringify(current));
  writeFileSync(files.expanded, JSON.stringify(expanded));
  writeFileSync(
    files.registry,
    JSON.stringify({
      schemaVersion: 1,
      runners: {
        policy: {
          command: process.execPath,
          args: [join(process.cwd(), 'test/fixtures/runner.mjs'), 'pass', '{report}'],
          cwd: process.cwd(),
          layers: ['system'],
          allowModels: false,
        },
      },
    }),
  );
  const cli = (...args: string[]) => spawnSync(process.execPath, ['bin/gauntlet.mjs', ...args], { encoding: 'utf8' });
  const sourceKey = 'c'.repeat(64);
  const common = [`--registry=${files.registry}`, '--execute', `--source-key=${sourceKey}`];
  const full = cli('run', `--pack=${files.current}`, `--out=${files.full}`, `--cache-dir=${files.cache}`, ...common);
  assert.equal(full.status, 0, full.stderr);
  assert.equal(
    cli(
      'ledger',
      `--ledger=${files.ledger}`,
      `--report=${files.full}`,
      `--pack=${files.current}`,
      `--source-key=${sourceKey}`,
    ).status,
    0,
  );

  const incremental = cli(
    'run',
    `--pack=${files.expanded}`,
    `--out=${files.incremental}`,
    `--cache-dir=${files.cache}`,
    `--ledger=${files.ledger}`,
    '--pending',
    ...common,
  );
  assert.equal(incremental.status, 0, incremental.stderr);
  const report = validateReport(JSON.parse(readFileSync(files.incremental, 'utf8')));
  assert.equal(report.complete, true);
  assert.equal(report.passed, true);
  assert.deepEqual(
    report.results.map((result) => [result.id, result.status, result.reason]),
    [
      ['current', 'not-run', 'skipped-current'],
      ['new', 'passed', null],
    ],
  );
});
