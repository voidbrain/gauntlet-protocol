// B-002: ledger coverage must follow the model digest, runtime identity, machine scenario and consumer source, not only
// the case definition and profile. Written before the fix; it fails against 0.6.0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import {
  run,
  defaults,
  hash,
  emptyLedger,
  recordRun,
  pendingCases,
  validateLedger,
  caseHash,
  inspectMachine,
  type ExecutionEnvironment,
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
const modelCase = (id: string): Pack['cases'][number] => ({
  id,
  layer: 'model',
  split: 'regression',
  capabilities: ['structured-output'],
  critical: false,
  expensive: false,
  messages: [{ role: 'user', content: 'Return {"ok":true}' }],
  expected: { kind: 'json', value: { ok: true } },
});
const systemCase = (id: string): Pack['cases'][number] => ({
  id,
  layer: 'system',
  split: 'regression',
  capabilities: ['policy'],
  critical: true,
  expensive: false,
  runner: 'policy',
});
const pack = (id: string, ...cases: Pack['cases']): Pack => ({ schemaVersion: 1, id, version: '1.0.0', cases });
const digestA = 'a'.repeat(64);
const digestB = 'b'.repeat(64);

// A local Ollama stand-in; no network, no model.
const fetcher = (async (url: unknown) => {
  const path = new URL(String(url)).pathname;
  const answers: Record<string, unknown> = {
    '/api/version': { version: 'fixture-v1' },
    '/api/show': { model_info: { 'general.file_type': 15 }, details: { quantization_level: 'Q4_K_M' } },
    '/api/tags': { models: [{ name: profile.model, size: 100, digest: digestA }] },
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
const environment = (): ExecutionEnvironment => ({
  machine: inspectMachine('neutral-host'),
  scenario: {
    schemaVersion: 1,
    id: 'minimal-load',
    version: '1.0.0',
    load: 'minimal',
    description: 'Neutral low competition fixture',
    workloadCategories: [],
    power: 'any',
  },
});
const runtimeOf = (r: Report) => hash({ identity: r.identity ?? null, runtime: r.runtime });

// A schema 2 entry with explicit identity, for pending fixtures.
const entry = (p: Pack, id: string, identity: Record<string, string | null>, profileHash: string | null) => ({
  pack: p.id,
  packVersion: p.version,
  case: id,
  caseHash: caseHash(p.cases.find((c) => c.id === id)!),
  profileHash,
  status: 'passed',
  reportHash: 'c'.repeat(64),
  finished: '2026-11-11T00:00:00.000Z',
  modelDigest: digestA,
  runtimeHash: 'd'.repeat(64),
  scenarioHash: null,
  sourceKey: null,
  ...identity,
});

test('B-002: a recorded entry carries the model digest, runtime, scenario and source key of its run', async () => {
  const smoke = pack('smoke', modelCase('a'));
  const report = (await run(smoke, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: fetcher,
  })) as Report;
  const ledger = recordRun(emptyLedger(), report, smoke, { sourceKey: 'git-0123abcd' });
  assert.equal(ledger.schemaVersion, 2);
  const e = ledger.entries[0];
  assert.equal(e.modelDigest, report.modelDigest);
  assert.equal(e.runtimeHash, runtimeOf(report));
  assert.equal(e.scenarioHash, null);
  assert.equal(e.sourceKey, 'git-0123abcd');
  // Without a key the entry says so; the key is an opaque bounded token, never free text or a path.
  assert.equal((recordRun(emptyLedger(), report, smoke) as typeof ledger).entries[0].sourceKey, null);
  assert.throws(() => recordRun(emptyLedger(), report, smoke, { sourceKey: 'a path/to/source' }), /source key/i);
  assert.throws(() => recordRun(emptyLedger(), report, smoke, { sourceKey: 'x'.repeat(129) }), /source key/i);
  assert.ok(!JSON.stringify(ledger).includes('Return'), 'the ledger holds no prompts or outputs');

  // A run under a scenario records its environment hash.
  const scenarioReport = (await run(smoke, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: fetcher,
    environment: environment(),
    scenarioConfirmed: true,
  })) as Report;
  const withScenario = recordRun(emptyLedger(), scenarioReport, smoke) as typeof ledger;
  assert.equal(withScenario.entries[0].scenarioHash, hash(scenarioReport.environment));
});

test('B-002: pending names model, runtime, scenario and source changes; unset fields do not constrain', () => {
  const models = pack('models', modelCase('m'));
  const systems = pack('systems', systemCase('s'));
  const profileHash = 'e'.repeat(64);
  const ledger = validateLedger({
    schemaVersion: 2,
    entries: [
      entry(models, 'm', { scenarioHash: 'f'.repeat(64) }, profileHash),
      entry(systems, 's', { modelDigest: null, runtimeHash: null, sourceKey: 'src-1' }, null),
    ],
  });
  const reasons = (options: Record<string, unknown>) =>
    pendingCases([models, systems], ledger, options as never).map((p) => `${p.case}:${p.reason}`);
  // Unconstrained: covered.
  assert.deepEqual(reasons({}), []);
  // Same identity: covered.
  assert.deepEqual(
    reasons({ modelDigest: digestA, runtimeHash: 'd'.repeat(64), scenarioHash: 'f'.repeat(64), sourceKey: 'src-1' }),
    ['s:scenario-changed'],
  );
  assert.deepEqual(reasons({ modelDigest: digestB }), ['m:model-changed']);
  assert.deepEqual(reasons({ runtimeHash: '0'.repeat(64) }), ['m:runtime-changed']);
  assert.deepEqual(reasons({ scenarioHash: null }), ['m:scenario-changed']);
  // System cases follow the source key and scenario, never model fields; model cases ignore the source key.
  assert.deepEqual(reasons({ sourceKey: 'src-2' }), ['s:source-changed']);
  assert.deepEqual(reasons({ modelDigest: digestB, runtimeHash: '0'.repeat(64), sourceKey: 'src-1' }), [
    'm:model-changed',
  ]);
});

test('B-002: schema 1 ledgers stay readable as unknown identity and upgrade on write', async () => {
  const models = pack('models', modelCase('m'));
  const v1 = {
    schemaVersion: 1,
    entries: [
      {
        pack: 'models',
        packVersion: '1.0.0',
        case: 'm',
        caseHash: caseHash(models.cases[0]),
        profileHash: null,
        status: 'passed',
        reportHash: 'c'.repeat(64),
        finished: '2026-11-11T00:00:00.000Z',
      },
    ],
  };
  validateLedger(v1);
  // Unknown identity never covers a constrained query, and covers an unconstrained one.
  assert.deepEqual(pendingCases([models], v1), []);
  assert.deepEqual(
    pendingCases([models], v1, { modelDigest: digestA } as never).map((p) => p.reason),
    ['model-changed'],
  );
  // Recording into a schema 1 ledger writes schema 2 and keeps the old entries as unknown identity.
  const other = pack('other', modelCase('o'));
  const report = (await run(other, profile, defaults, { execute: true, allowModels: true, fetch: fetcher })) as Report;
  const upgraded = recordRun(v1, report, other);
  assert.equal(upgraded.schemaVersion, 2);
  assert.equal(upgraded.entries.length, 2);
  const old = upgraded.entries.find((e) => e.pack === 'models')!;
  assert.equal('modelDigest' in old, false, 'a schema 1 entry keeps unknown identity');
  validateLedger(upgraded);
  // Schema 2 entries hold all four identity fields or none.
  assert.throws(
    () => validateLedger({ schemaVersion: 2, entries: [{ ...v1.entries[0], modelDigest: digestA }] }),
    /entry/,
  );
});

test('B-002: the CLI records a source key and filters pending by identity', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'gauntlet identity '));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const smoke = pack('smoke', modelCase('a'));
  const files = { pack: join(dir, 'smoke.json'), report: join(dir, 'report.json'), ledger: join(dir, 'ledger.json') };
  writeFileSync(files.pack, JSON.stringify(smoke));
  const report = (await run(smoke, profile, defaults, { execute: true, allowModels: true, fetch: fetcher })) as Report;
  writeFileSync(files.report, JSON.stringify(report));
  const cli = (...args: string[]) => spawnSync(process.execPath, ['bin/gauntlet.mjs', ...args], { encoding: 'utf8' });
  const rec = cli(
    'ledger',
    `--ledger=${files.ledger}`,
    `--report=${files.report}`,
    `--pack=${files.pack}`,
    '--source-key=rev-1',
  );
  assert.equal(rec.status, 0, rec.stderr);
  assert.equal(JSON.parse(readFileSync(files.ledger, 'utf8')).entries[0].sourceKey, 'rev-1');
  const pending = (...flags: string[]) => cli('pending', `--packs=${files.pack}`, `--ledger=${files.ledger}`, ...flags);
  assert.equal(pending().status, 0);
  assert.equal(pending(`--model-digest=${report.modelDigest}`, `--runtime-hash=${runtimeOf(report)}`).status, 0);
  const changed = pending(`--model-digest=${digestB}`);
  assert.equal(changed.status, 1);
  assert.equal(changed.stdout, 'smoke/a (model-changed)\n');
  assert.equal(pending('--scenario-hash=' + 'f'.repeat(64)).stdout, 'smoke/a (scenario-changed)\n');
  assert.equal(pending('--scenario-hash=none').status, 0);
  // Malformed identity flags are errors (exit 2), not pending cases.
  assert.equal(pending('--model-digest=not-a-digest').status, 2);
  assert.equal(pending('--runtime-hash=xyz').status, 2);
  assert.equal(pending('--source-key=has space').status, 2);
  assert.equal(
    cli('ledger', `--ledger=${files.ledger}`, `--report=${files.report}`, `--pack=${files.pack}`, '--source-key=../x')
      .status,
    2,
  );
});

// Review of PR #37 (fresh context): runner cases on any layer run the consumer's code, so they follow its source key.
test('B-002 review: every runner case follows the source key; non-system cases follow model fields', () => {
  const runnerCase = (id: string, layer: 'model' | 'coding' | 'end-to-end'): Pack['cases'][number] => ({
    ...systemCase(id),
    layer,
  });
  const agents = pack('agents', runnerCase('c', 'coding'), runnerCase('e', 'end-to-end'), runnerCase('r', 'model'));
  const ledger = validateLedger({
    schemaVersion: 2,
    entries: ['c', 'e', 'r'].map((id) => entry(agents, id, { sourceKey: 'rev-1' }, null)),
  });
  const reasons = (options: Record<string, unknown>) =>
    pendingCases([agents], ledger, options as never).map((p) => `${p.case}:${p.reason}`);
  assert.deepEqual(reasons({ sourceKey: 'rev-1' }), []);
  assert.deepEqual(reasons({ sourceKey: 'rev-2' }), ['c:source-changed', 'e:source-changed', 'r:source-changed']);
  assert.deepEqual(reasons({ modelDigest: digestB }), ['c:model-changed', 'e:model-changed', 'r:model-changed']);
});

test('B-002 review: re-recording a report cannot rewrite its source key', async () => {
  const smoke = pack('smoke', modelCase('a'));
  const report = (await run(smoke, profile, defaults, { execute: true, allowModels: true, fetch: fetcher })) as Report;
  const first = recordRun(emptyLedger(), report, smoke, { sourceKey: 'rev-1' });
  assert.deepEqual(recordRun(first, report, smoke, { sourceKey: 'rev-1' }), first);
  assert.throws(() => recordRun(first, report, smoke, { sourceKey: 'rev-2' }), /source key/i);
  assert.throws(() => recordRun(first, report, smoke), /source key/i);
});

test('B-002 review: digest prefixes compare equal; schema 1 refuses identity fields', () => {
  const models = pack('models', modelCase('m'));
  const ledger = validateLedger({ schemaVersion: 2, entries: [entry(models, 'm', {}, null)] });
  assert.deepEqual(pendingCases([models], ledger, { modelDigest: 'sha256:' + digestA } as never), []);
  const prefixed = validateLedger({
    schemaVersion: 2,
    entries: [entry(models, 'm', { modelDigest: 'sha256:' + digestA }, null)],
  });
  assert.deepEqual(pendingCases([models], prefixed, { modelDigest: digestA } as never), []);
  assert.throws(() => validateLedger({ schemaVersion: 1, entries: [entry(models, 'm', {}, null)] }), /entry/);
});

test('B-002 review: the CLI prints a report identity and names runtime and source changes', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'gauntlet identity cli '));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const smoke = pack('smoke', modelCase('a'));
  const files = { pack: join(dir, 'p.json'), report: join(dir, 'r.json'), ledger: join(dir, 'l.json') };
  writeFileSync(files.pack, JSON.stringify(smoke));
  const report = (await run(smoke, profile, defaults, { execute: true, allowModels: true, fetch: fetcher })) as Report;
  writeFileSync(files.report, JSON.stringify(report));
  const cli = (...args: string[]) => spawnSync(process.execPath, ['bin/gauntlet.mjs', ...args], { encoding: 'utf8' });
  const id = cli('identity', `--report=${files.report}`);
  assert.equal(id.status, 0, id.stderr);
  assert.deepEqual(JSON.parse(id.stdout), {
    modelDigest: report.modelDigest,
    runtimeHash: runtimeOf(report),
    scenarioHash: null,
  });
  assert.equal(cli('identity').status, 2);
  cli('ledger', `--ledger=${files.ledger}`, `--report=${files.report}`, `--pack=${files.pack}`);
  const pending = (...flags: string[]) => cli('pending', `--packs=${files.pack}`, `--ledger=${files.ledger}`, ...flags);
  assert.equal(pending('--runtime-hash=' + '0'.repeat(64)).stdout, 'smoke/a (runtime-changed)\n');
});
