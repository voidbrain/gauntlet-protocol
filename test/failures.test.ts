import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  realpathSync,
  readFileSync,
  readdirSync,
  statSync,
  rmSync,
  mkdirSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  run,
  executeWithEvidence,
  failureDestination,
  inspectFailures,
  validateReport,
  compare,
  defaults,
  type Pack,
  type Profile,
} from '../src/index.ts';
import { FAILURE_FILE_BYTES, FAILURE_TOTAL_BYTES } from '../src/failures.ts';
const profile: Profile = {
  schemaVersion: 1,
  id: 'fixture',
  model: 'fixture:1b',
  quantization: 'Q4_K_M',
  endpoint: 'http://127.0.0.1:11434',
  context: 8192,
  maxOutputTokens: 64,
  temperature: null,
  topP: null,
  topK: null,
  seed: 42,
  think: null,
  parallel: 1,
  hardware: 'fixture',
  cache: 'unknown',
};
const pack: Pack = {
  schemaVersion: 1,
  id: 'capture-fixture',
  version: '1.0.0',
  cases: [
    {
      id: 'parse',
      layer: 'model',
      split: 'regression',
      capabilities: ['structured-output'],
      critical: true,
      expensive: false,
      messages: [{ role: 'user', content: 'PROMPT_NOT_CAPTURED' }],
      expected: { kind: 'json', value: { hidden: 'EXPECTED_NOT_CAPTURED' } },
    },
    {
      id: 'mismatch',
      layer: 'model',
      split: 'holdout',
      capabilities: ['structured-output'],
      critical: true,
      expensive: false,
      messages: [{ role: 'user', content: 'Another neutral request' }],
      expected: { kind: 'json', value: { ok: true } },
    },
  ],
};
function provider(replies = ['PRIVATE_INVALID_REPLY', '{"ok":false}'], length = false) {
  let n = 0,
    calls = 0;
  const fetcher = (async (input: unknown) => {
    calls++;
    const path = new URL(String(input)).pathname;
    let value: unknown;
    if (path === '/api/version') value = { version: 'fixture-v1' };
    else if (path === '/api/show')
      value = { model_info: { 'general.file_type': 15 }, details: { quantization_level: 'Q4_K_M' } };
    else if (path === '/api/tags') value = { models: [{ name: profile.model, size: 1024, digest: 'a'.repeat(64) }] };
    else
      value = {
        model: profile.model,
        message: { content: replies[n++] ?? replies[0], thinking: 'HIDDEN_REASONING_NOT_CAPTURED' },
        done: true,
        eval_count: 1,
        done_reason: length ? 'length' : 'stop',
      };
    return new Response(JSON.stringify(value));
  }) as typeof fetch;
  return {
    fetcher,
    get calls() {
      return calls;
    },
  };
}
const fixture = () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'gauntlet-capture-')));
  return { root, dir: join(root, 'private'), close: () => rmSync(root, { recursive: true, force: true }) };
};
test('opt-in captures failed final replies privately while public grading remains unchanged and source-bound inspection works', async () => {
  const f = fixture();
  try {
    const off = await run(pack, profile, defaults, { execute: true, allowModels: true, fetch: provider().fetcher });
    assert.equal(readdirSync(f.root).length, 0);
    const on = await run(pack, profile, defaults, {
      execute: true,
      allowModels: true,
      fetch: provider().fetcher,
      captureFailures: f.dir,
    });
    validateReport(on);
    assert.equal(on.diagnostics?.failureCaptures, true);
    assert.equal(compare([off, on])[1].comparableToFirst, false);
    assert.deepEqual(
      on.results.map((r) => [r.status, r.reason, r.responseHash]),
      off.results.map((r) => [r.status, r.reason, r.responseHash]),
    );
    assert.equal(JSON.stringify(on).includes('PRIVATE_INVALID_REPLY'), false);
    const inspection = inspectFailures(f.dir, on) as { failures: { response: string; reason: string }[] };
    assert.equal(inspection.failures.length, 2);
    assert.equal(inspection.failures[0].response, 'PRIVATE_INVALID_REPLY');
    assert.equal(inspection.failures[0].reason, 'invalid-json');
    const all = readdirSync(f.dir)
      .map((p) => readFileSync(join(f.dir, p), 'utf8'))
      .join('');
    assert.equal(all.includes('PROMPT_NOT_CAPTURED'), false);
    assert.equal(all.includes('EXPECTED_NOT_CAPTURED'), false);
    assert.equal(all.includes('HIDDEN_REASONING_NOT_CAPTURED'), false);
    assert.equal(statSync(f.dir).mode & 0o777, 0o700);
    for (const p of readdirSync(f.dir)) assert.equal(statSync(join(f.dir, p)).mode & 0o777, 0o600);
    assert.throws(() => inspectFailures(f.dir, off), /match report/);
  } finally {
    f.close();
  }
});
test('capture file/count/campaign byte caps retain truncation and skipped evidence', async () => {
  const f = fixture();
  try {
    const many: Pack = {
      ...pack,
      cases: Array.from({ length: 20 }, (_, i) => ({ ...pack.cases[0], id: 'case-' + i })),
    };
    const r = await run(
      many,
      profile,
      { ...defaults, maxCases: 20, outputTokens: 1000 },
      {
        execute: true,
        allowModels: true,
        fetch: provider(['PRIVATE_' + '\u0001'.repeat(60000)]).fetcher,
        captureFailures: f.dir,
      },
    );
    assert.equal(r.results.length, 20);
    assert.equal(r.passed, false);
    const d = inspectFailures(f.dir, r) as { skipped: number; failures: { truncated: boolean }[] };
    assert.ok(d.skipped > 0);
    assert.ok(d.failures.every((x) => x.truncated));
    assert.ok(d.failures.length <= 10);
    let total = 0;
    for (const name of readdirSync(f.dir)) {
      const size = statSync(join(f.dir, name)).size;
      total += size;
      assert.ok(size <= FAILURE_FILE_BYTES);
    }
    assert.ok(total <= FAILURE_TOTAL_BYTES);
  } finally {
    f.close();
  }
});
test('unsafe destinations and capture-with-reuse fail before provider work; existing files and links are preserved', async () => {
  const f = fixture(),
    p = provider();
  try {
    mkdirSync(f.dir, { mode: 0o700 });
    await assert.rejects(
      run(pack, profile, defaults, { execute: true, allowModels: true, fetch: p.fetcher, captureFailures: f.dir }),
      /already exists/,
    );
    assert.equal(p.calls, 0);
    await assert.rejects(
      executeWithEvidence(pack, profile, defaults, {
        execute: true,
        allowModels: true,
        fetch: p.fetcher,
        output: join(f.root, 'report.json'),
        cacheDirectory: join(f.root, 'cache'),
        captureFailures: join(f.root, 'new'),
      }),
      /fresh run/,
    );
    assert.equal(p.calls, 0);
    const repo = join(f.root, 'repo');
    mkdirSync(repo);
    execFileSync('git', ['init', '-q', repo]);
    await assert.rejects(
      run(pack, profile, defaults, {
        execute: true,
        allowModels: true,
        fetch: p.fetcher,
        captureFailures: join(repo, 'raw'),
      }),
      /outside/,
    );
    const link = join(f.root, 'link');
    symlinkSync(f.dir, link);
    await assert.rejects(
      run(pack, profile, defaults, {
        execute: true,
        allowModels: true,
        fetch: p.fetcher,
        captureFailures: join(link, 'raw'),
      }),
      /symlink/,
    );
    assert.equal(p.calls, 0);
  } finally {
    f.close();
  }
});
test('truncated provider output remains an error and records only the available final content', async () => {
  const f = fixture();
  try {
    const r = await run(pack, profile, defaults, {
      execute: true,
      allowModels: true,
      fetch: provider(['short'], true).fetcher,
      captureFailures: f.dir,
    });
    assert.equal(r.results[0].status, 'error');
    const d = inspectFailures(f.dir, r) as { failures: { reason: string }[] };
    assert.equal(d.failures[0].reason, 'truncated-output');
  } finally {
    f.close();
  }
});
test('CLI plans only named cases and rejects duplicate selections without generation', () => {
  const cli = join(process.cwd(), 'bin/gauntlet.mjs');
  const args = [
    'plan',
    '--pack=examples/smoke-v1.json',
    '--profile=examples/profiles/gemma4-12b.json',
    '--limits=examples/limits-diagnostic.json',
    '--only=change-mind,tool-choice,missing-input',
  ];
  const text = execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  assert.ok(text.includes('missing-input'));
  assert.ok(!text.includes('holdout-language'));
  assert.throws(() =>
    execFileSync(process.execPath, [cli, ...args.slice(0, -1), '--only=change-mind,change-mind'], { stdio: 'pipe' }),
  );
});
test('missing Git cannot authorize private captures inside a checkout', () => {
  const old = process.env.PATH;
  try {
    process.env.PATH = '/nonexistent';
    assert.throws(() => failureDestination(join(process.cwd(), 'never-created-private-capture')), /outside/);
  } finally {
    process.env.PATH = old;
  }
});
