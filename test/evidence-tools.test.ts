import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, realpathSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import {
  run,
  validateReport,
  validatePack,
  catalog,
  catalogMarkdown,
  executeWithEvidence,
  readEvidence,
  reuseValid,
  defaults,
  validateRegistry,
  type Profile,
  type Pack,
} from '../src/index.ts';
import { ollamaStream } from '../src/runtimes.ts';
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
const pack: Pack = {
  schemaVersion: 1,
  id: 'indexed',
  version: '1.0.0',
  cases: [
    {
      id: 'json',
      area: 'general-assistant',
      layer: 'model',
      split: 'regression',
      capabilities: ['structured-output'],
      requirements: ['local-model-runtime'],
      critical: true,
      expensive: false,
      messages: [{ role: 'user', content: 'Return {"ok":true}' }],
      expected: { kind: 'json', value: { ok: true } },
    },
  ],
};
function fake() {
  let calls = 0,
    resident = false,
    version = 'fixture-v1';
  const bodies: Record<string, unknown>[] = [];
  const fetcher = (async (url: unknown, init?: RequestInit) => {
    const path = new URL(String(url)).pathname;
    let value: unknown;
    if (path === '/api/version') value = { version };
    else if (path === '/api/show')
      value = {
        model_info: { 'general.file_type': 15 },
        details: { quantization_level: 'Q4_K_M' },
        capabilities: ['thinking'],
      };
    else if (path === '/api/tags') value = { models: [{ name: profile.model, size: 100, digest: 'a'.repeat(64) }] };
    else if (path === '/api/ps') value = { models: resident ? [{ name: profile.model, size_vram: 128 }] : [] };
    else if (path === '/api/generate') {
      resident = false;
      value = { done: true, done_reason: 'unload' };
    } else if (path === '/api/chat') {
      calls++;
      resident = true;
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      bodies.push(body);
      const final = {
        model: profile.model,
        message: { content: body.stream ? '' : '{"ok":true}' },
        done: true,
        eval_count: 3,
        prompt_eval_count: 5,
        load_duration: 1000000,
        prompt_eval_duration: 2000000,
        eval_duration: 3000000,
        total_duration: 6000000,
      };
      if (body.stream)
        return new Response(
          [
            { model: profile.model, message: { content: '', thinking: 'private reasoning' }, done: false },
            { model: profile.model, message: { content: '{"ok":true}' }, done: false },
            final,
          ]
            .map((x) => JSON.stringify(x))
            .join('\n') + '\n',
        );
      value = final;
    } else throw Error('Unexpected endpoint');
    return new Response(JSON.stringify(value));
  }) as typeof fetch;
  return {
    fetcher,
    bodies,
    get calls() {
      return calls;
    },
    setVersion: (v: string) => {
      version = v;
    },
    get resident() {
      return resident;
    },
  };
}
test('generated catalog maps cases and evidence without claiming unmeasured areas', async () => {
  const f = fake();
  const report = await run(pack, profile, defaults, { execute: true, allowModels: true, fetch: f.fetcher });
  const entries = catalog([pack], [report]);
  assert.equal(entries[0].area, 'general-assistant');
  assert.equal(entries[0].evidence[0].report, report.id);
  assert.match(catalogMarkdown(entries), /math: 0 mapped cases/);
  assert.throws(() => catalog([pack, pack]));
  assert.throws(() => validatePack({ ...pack, cases: [{ ...pack.cases[0], area: 'made-up' }] }));
  const generated = readFileSync('docs/test-index.md', 'utf8');
  const smoke = validatePack(JSON.parse(readFileSync('examples/smoke-v1.json', 'utf8'))),
    expanded = validatePack(JSON.parse(readFileSync('examples/general-assistant-expanded-v1.json', 'utf8'))),
    structured = validatePack(JSON.parse(readFileSync('examples/structured-output-robustness-v1.json', 'utf8'))),
    tools = validatePack(JSON.parse(readFileSync('examples/tool-use-v1.json', 'utf8'))),
    bilingual = validatePack(JSON.parse(readFileSync('examples/bilingual-it-en-v1.json', 'utf8'))),
    multiStep = validatePack(JSON.parse(readFileSync('examples/multi-step-agent-v1.json', 'utf8'))),
    refusal = validatePack(JSON.parse(readFileSync('examples/refusal-permission-v1.json', 'utf8'))),
    longContext = validatePack(JSON.parse(readFileSync('examples/long-context-v1.json', 'utf8'))),
    coding = validatePack(JSON.parse(readFileSync('examples/coding-v1.json', 'utf8')));
  assert.equal(
    generated,
    catalogMarkdown(catalog([smoke, expanded, structured, tools, bilingual, multiStep, refusal, longContext, coding]), {
      'neutral-smoke': '../examples/smoke-v1.json',
      'general-assistant-expanded': '../examples/general-assistant-expanded-v1.json',
      'structured-output-robustness': '../examples/structured-output-robustness-v1.json',
      'tool-use': '../examples/tool-use-v1.json',
      'bilingual-it-en': '../examples/bilingual-it-en-v1.json',
      'multi-step-agent': '../examples/multi-step-agent-v1.json',
      'refusal-permission': '../examples/refusal-permission-v1.json',
      'long-context': '../examples/long-context-v1.json',
      coding: '../examples/coding-v1.json',
    }),
  );
});
test('exact fresh evidence skips generation; changed runtime, profile, pack, age and explicit fresh do not', async () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'evidence-cache-'));
  try {
    const f = fake();
    let count = 0;
    const options = () => ({
      execute: true,
      allowModels: true,
      fetch: f.fetcher,
      cacheDirectory: join(root, 'cache'),
      output: join(root, 'out-' + ++count + '.json'),
      environmentKey: 'controlled-fixture',
    });
    const first = await executeWithEvidence(pack, profile, defaults, options());
    assert.equal(first.kind, 'executed');
    assert.equal(f.calls, 1);
    const second = await executeWithEvidence(pack, profile, defaults, options());
    assert.equal(second.kind, 'reused');
    assert.equal(f.calls, 1);
    assert.equal(second.report.finished, first.report.finished);
    assert.equal(second.performanceMeasuredNow, false);
    assert.equal(readEvidence(second.evidenceFile).id, first.report.id);
    const ref = readEvidence(join(root, 'out-2.json'));
    assert.equal(ref.id, first.report.id);
    await executeWithEvidence(pack, profile, defaults, { ...options(), forceFresh: true });
    assert.equal(f.calls, 2);
    f.setVersion('fixture-v2');
    await executeWithEvidence(pack, profile, defaults, options());
    assert.equal(f.calls, 3);
    await executeWithEvidence(pack, { ...profile, temperature: 0.6 }, defaults, options());
    assert.equal(f.calls, 4);
    await executeWithEvidence({ ...pack, version: '1.0.1' }, profile, defaults, options());
    assert.equal(f.calls, 5);
    assert.equal(
      reuseValid(
        first.report,
        { pack, profile, limits: defaults, identity: first.report.identity },
        0,
        Date.parse(first.report.finished) + 1,
      ),
      false,
    );
    const existing = { ...options(), output: join(root, 'out-1.json') };
    await assert.rejects(executeWithEvidence(pack, profile, defaults, existing), /exists/);
    assert.equal(f.calls, 5);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test('system cache needs current source identity and changes invalidate previous passes', async () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'system-cache-'));
  try {
    const counter = join(root, 'count'),
      script = join(root, 'runner.mjs');
    writeFileSync(
      script,
      "import{readFileSync,writeFileSync,existsSync}from'node:fs';const[n,out]=process.argv.slice(2);writeFileSync(n,String(existsSync(n)?Number(readFileSync(n))+1:1));writeFileSync(out,JSON.stringify({schemaVersion:1,layer:'system',sourceStable:true,complete:true,results:[{id:'test',status:'passed',checks:1}]}));",
    );
    const registry = validateRegistry(
      {
        schemaVersion: 1,
        runners: {
          fixture: {
            command: 'node',
            args: [script, counter, '{report}'],
            cwd: root,
            layers: ['system'],
            allowModels: false,
          },
        },
      },
      root,
    );
    const p: Pack = {
      schemaVersion: 1,
      id: 'system',
      version: '1.0.0',
      cases: [
        {
          id: 'test',
          layer: 'system',
          split: 'regression',
          capabilities: ['fixture'],
          critical: true,
          expensive: false,
          runner: 'fixture',
        },
      ],
    };
    const o = {
      execute: true,
      registry,
      cacheDirectory: join(root, 'cache'),
      output: join(root, 'one.json'),
      environmentKey: 'fixture',
    };
    await assert.rejects(executeWithEvidence(p, null, defaults, o), /source fingerprint/);
    await executeWithEvidence(p, null, defaults, { ...o, sourceKey: 'a'.repeat(64) });
    await executeWithEvidence(p, null, defaults, { ...o, output: join(root, 'two.json'), sourceKey: 'a'.repeat(64) });
    assert.equal(readFileSync(counter, 'utf8'), '1');
    await executeWithEvidence(p, null, defaults, { ...o, output: join(root, 'three.json'), sourceKey: 'b'.repeat(64) });
    assert.equal(readFileSync(counter, 'utf8'), '2');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test('instrumented stream retains timing, cold/warm state and sampled allocation; reasoning is not retained', async () => {
  const f = fake();
  const p = { ...profile, residency: 'suite' as const };
  const cases = { ...pack, cases: [pack.cases[0], { ...pack.cases[0], id: 'second' }] };
  const r = await run(cases, p, defaults, { execute: true, allowModels: true, fetch: f.fetcher, telemetry: true });
  validateReport(r);
  assert.equal(r.passed, true);
  assert.deepEqual(
    r.results.map((x) => x.performance?.phase),
    ['cold-model', 'warm-model'],
  );
  assert.equal(r.results[0].performance?.loadMs, 1);
  assert.equal(r.results[0].performance?.promptMs, 2);
  assert.equal(r.results[0].performance?.tokensPerSecond, 1000);
  assert.equal(typeof r.results[0].performance?.timeToFirstTokenMs, 'number');
  assert.equal(r.resources?.peakModelAllocatedBytes, 128);
  assert.equal(r.resources?.samples[0].modelAllocatedBytes, 0);
  assert.equal(r.residencyCleanup?.status, 'released');
  assert.equal(f.resident, false);
  assert.equal(JSON.stringify(r).includes('private reasoning'), false);
  assert.equal(f.bodies[0].keep_alive, '5m');
  assert.throws(() => validateReport({ ...r, resources: { ...r.resources, peakModelAllocatedBytes: 999 } }));
});
test('stream truncation and model switches fail closed', async () => {
  await assert.rejects(
    ollamaStream(new Response('{"model":"one","message":{"content":"x"},"done":false}\n'), 1024, performance.now()),
    /terminal/,
  );
  await assert.rejects(
    ollamaStream(
      new Response(
        '{"model":"one","message":{"content":"x"},"done":false}\n{"model":"two","message":{"content":""},"done":true}\n',
      ),
      1024,
      performance.now(),
    ),
    /identity/,
  );
});
for (const backend of ['llama.cpp', 'mlx-lm'] as const)
  test(backend + ' adapter binds local artifacts, live model, settings, context and fingerprint', async () => {
    const root = mkdtempSync(join(realpathSync(tmpdir()), 'runtime-adapter-'));
    try {
      const path = join(root, 'neutral.weights');
      writeFileSync(path, 'neutral');
      const sha256 = createHash('sha256').update('neutral').digest('hex');
      const p: Profile = {
        ...profile,
        backend,
        residency: 'suite',
        runtimeManifest: {
          version: 'fixture-build',
          modelDigest: sha256,
          context: 8192,
          artifacts: [{ path, sha256 }],
          serverFingerprint: 'fixture-fingerprint',
          supportsThinking: false,
        },
      };
      let calls = 0;
      let observed: Record<string, unknown> | null = null;
      const fetcher = (async (url: unknown, init?: RequestInit) => {
        const route = new URL(String(url)).pathname;
        let value: unknown;
        if (route === '/v1/models') value = { data: [{ id: profile.model }] };
        else if (route === '/props')
          value = {
            default_generation_settings: { n_ctx: 8192, params: { seed: 42 } },
            model_path: 'neutral.weights',
            chat_template: 'fixture',
          };
        else if (route === '/v1/chat/completions') {
          calls++;
          observed = JSON.parse(String(init?.body));
          value = {
            model: profile.model,
            system_fingerprint: 'fixture-fingerprint',
            choices: [{ message: { content: '{"ok":true}' }, finish_reason: 'stop' }],
            usage: { prompt_tokens: 5, completion_tokens: 3 },
          };
        } else throw Error('Unexpected');
        return new Response(JSON.stringify(value));
      }) as typeof fetch;
      const r = await run(pack, p, defaults, { execute: true, allowModels: true, fetch: fetcher });
      validateReport(r);
      assert.equal(r.passed, true);
      assert.equal(calls, 1);
      assert.equal((observed as Record<string, unknown> | null)?.max_tokens, 64);
      assert.equal(r.identity?.proof, 'owner-manifest-and-local-artifacts');
      assert.equal(JSON.stringify(r).includes(path), false);
      writeFileSync(path, 'tampered');
      const bad = await run(pack, p, defaults, { execute: true, allowModels: true, fetch: fetcher });
      assert.equal(bad.passed, false);
      assert.equal(calls, 1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
test('review: cache reuse cannot bypass current model/cost admission, and invalid options do no metadata work', async () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'admission-'));
  try {
    const f = fake();
    let requests = 0;
    const fetcher = (async (...args: Parameters<typeof fetch>) => {
      requests++;
      return f.fetcher(...args);
    }) as typeof fetch;
    const expensive = { ...pack, cases: pack.cases.map((c) => ({ ...c, expensive: true })) };
    const options = {
      execute: true,
      allowModels: true,
      allowExpensive: true,
      fetch: fetcher,
      cacheDirectory: join(root, 'cache'),
      output: join(root, 'one.json'),
      environmentKey: 'fixture',
    };
    await executeWithEvidence(expensive, profile, defaults, options);
    const before = requests;
    await assert.rejects(
      executeWithEvidence(expensive, profile, defaults, {
        ...options,
        output: join(root, 'two.json'),
        allowModels: false,
        allowExpensive: false,
      }),
    );
    assert.equal(requests, before);
    await assert.rejects(
      executeWithEvidence(pack, profile, defaults, { ...options, output: join(root, 'three.json'), sampleMs: 0 }),
    );
    assert.equal(requests, before);
    await assert.rejects(
      executeWithEvidence(
        pack,
        profile,
        { ...defaults, outputTokens: 1 },
        { ...options, output: join(root, 'four.json') },
      ),
    );
    assert.equal(requests, before);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test('review: metadata preflight shares campaign deadline', async () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'preflight-deadline-'));
  try {
    const f = fake();
    let requests = 0;
    const fetcher = (async (...args: Parameters<typeof fetch>) => {
      requests++;
      await new Promise<void>((done, fail) => {
        const timer = setTimeout(done, 100);
        const signal = args[1]?.signal;
        signal?.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            fail(Error('aborted'));
          },
          { once: true },
        );
        if (signal?.aborted) {
          clearTimeout(timer);
          fail(Error('aborted'));
        }
      });
      return f.fetcher(...args);
    }) as typeof fetch;
    await assert.rejects(
      executeWithEvidence(
        pack,
        profile,
        { ...defaults, suiteMs: 10 },
        {
          execute: true,
          allowModels: true,
          fetch: fetcher,
          cacheDirectory: join(root, 'cache'),
          output: join(root, 'one.json'),
          environmentKey: 'fixture',
        },
      ),
    );
    assert.equal(requests, 1);
    assert.equal(f.calls, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
test('review: registered model runner preserves evidence without local built-in identity probing', async () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'external-profile-'));
  try {
    let probes = 0;
    const registry = validateRegistry(
      {
        schemaVersion: 1,
        runners: {
          fixture: {
            command: 'node',
            args: [
              join(process.cwd(), 'test/fixtures/model-runner.mjs'),
              '{report}',
              '{configuration}',
              '{budget}',
              '{case}',
              'same',
            ],
            cwd: root,
            layers: ['model'],
            allowModels: true,
          },
        },
      },
      root,
    );
    const p: Pack = {
      schemaVersion: 1,
      id: 'external-profile',
      version: '1.0.0',
      cases: [
        {
          id: 'fixture',
          runner: 'fixture',
          layer: 'model',
          split: 'regression',
          capabilities: ['fixture'],
          critical: true,
          expensive: false,
        },
      ],
    };
    const result = await executeWithEvidence(p, profile, defaults, {
      execute: true,
      allowModels: true,
      registry,
      fetch: (async () => {
        probes++;
        throw Error('No built-in provider');
      }) as typeof fetch,
      sourceKey: 'a'.repeat(64),
      environmentKey: 'fixture',
      cacheDirectory: join(root, 'cache'),
      output: join(root, 'out.json'),
    });
    assert.equal(result.kind, 'executed');
    assert.equal(result.report.passed, true);
    assert.equal(probes, 0);
    assert.equal(readEvidence(join(root, 'out.json')).passed, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('structured format rejects valid alternative runtime before any metadata work', async () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'format-admission-'));
  try {
    const path = join(root, 'neutral.weights');
    writeFileSync(path, 'neutral');
    const sha256 = createHash('sha256').update('neutral').digest('hex');
    const alternative: Profile = {
      ...profile,
      backend: 'mlx-lm',
      residency: 'suite',
      runtimeManifest: {
        version: 'fixture-build',
        modelDigest: sha256,
        context: 8192,
        artifacts: [{ path, sha256 }],
        serverFingerprint: 'fixture',
        supportsThinking: false,
      },
    };
    const p = structuredClone(pack);
    p.cases[0].responseFormat = 'json';
    let requests = 0;
    const fetcher = (async () => {
      requests++;
      throw Error('unexpected metadata');
    }) as typeof fetch;
    await assert.rejects(
      executeWithEvidence(p, alternative, defaults, {
        execute: true,
        allowModels: true,
        fetch: fetcher,
        output: join(root, 'out.json'),
        cacheDirectory: join(root, 'cache'),
      }),
      /Response format currently requires Ollama/,
    );
    assert.equal(requests, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
