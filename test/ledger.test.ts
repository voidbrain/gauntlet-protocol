import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import {
  run,
  defaults,
  emptyLedger,
  recordRun,
  pendingCases,
  validateLedger,
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
const fetcher = (async (url: unknown) => {
  const path = new URL(String(url)).pathname;
  const answers: Record<string, unknown> = {
    '/api/version': { version: 'fixture-v1' },
    '/api/show': { model_info: { 'general.file_type': 15 }, details: { quantization_level: 'Q4_K_M' } },
    '/api/tags': { models: [{ name: profile.model, size: 100, digest: 'a'.repeat(64) }] },
    '/api/ps': { models: [] },
    '/api/generate': { done: true, done_reason: 'unload' },
    '/api/chat': {
      model: profile.model,
      message: { content: '{"ok":true}' },
      done: true,
      eval_count: 3,
      prompt_eval_count: 5,
      total_duration: 6000000,
    },
  };
  if (!(path in answers)) throw Error('Unexpected endpoint ' + path);
  return new Response(JSON.stringify(answers[path]));
}) as typeof fetch;
const execute = (p: Pack, prof: Profile = profile) =>
  run(p, prof, defaults, { execute: true, allowModels: true, fetch: fetcher }) as Promise<Report>;

test('ledger: a run covers exactly the case definitions it ran, under its profile', async () => {
  const smoke = pack('smoke', modelCase('a'), modelCase('b'));
  const report = await execute(smoke);
  const ledger = recordRun(emptyLedger(), report, smoke);
  assert.equal(validateLedger(ledger).entries.length, 2);
  assert.deepEqual(Object.keys(ledger.entries[0]).sort(), [
    'case',
    'caseHash',
    'finished',
    'pack',
    'packVersion',
    'profileHash',
    'reportHash',
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
  assert.notEqual(cli('pending', `--packs=${files.smoke}`, `--ledger=${files.ledger}`, '--max-age-days=x').status, 0);
});
