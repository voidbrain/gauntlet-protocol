import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  inspectMachine,
  validateMachineProfile,
  validateLoadScenario,
  validateExecutionEnvironment,
  validateProfile,
  validateLimits,
  run,
  executeWithEvidence,
  reuseValid,
  compare,
  plan,
  validateReport,
  defaults,
  type ExecutionEnvironment,
  type Profile,
  type Pack,
} from '../src/index.ts';
const fixture = (path: string): unknown => JSON.parse(readFileSync(resolve(path), 'utf8')) as unknown;
const scenario = {
  schemaVersion: 1 as const,
  id: 'minimal-load',
  version: '1.0.0',
  load: 'minimal' as const,
  description: 'Neutral low competition fixture',
  workloadCategories: [],
  power: 'any' as const,
};
const environment = (): ExecutionEnvironment => ({
  machine: inspectMachine('neutral-host'),
  scenario: structuredClone(scenario),
});
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
  hardware: 'neutral',
  cache: 'neutral',
};
const pack: Pack = {
  schemaVersion: 1,
  id: 'neutral',
  version: '1.0.0',
  cases: [
    {
      id: 'json',
      layer: 'model',
      split: 'regression',
      capabilities: ['json'],
      critical: true,
      expensive: false,
      messages: [{ role: 'user', content: 'Return neutral JSON' }],
      expected: { kind: 'json', value: { ok: true } },
    },
  ],
};

test('small-host presets pair sized Q4 profiles with CPU/GPU machines and slow limits', () => {
  const cpuProfile = validateProfile(fixture('examples/profiles/small-host-cpu-7b-q4.json')),
    gpuProfile = validateProfile(fixture('examples/profiles/small-host-gpu-14b-q4.json')),
    cpuMachine = validateMachineProfile(fixture('examples/machines/small-host-cpu-16gb.json')),
    gpuMachine = validateMachineProfile(fixture('examples/machines/small-host-gpu-24gb.json')),
    slow = validateLimits(fixture('examples/limits-slow-host.json'));

  assert.match(cpuProfile.model, /7b/i);
  assert.match(gpuProfile.model, /14b/i);
  assert.match(cpuProfile.quantization, /q4/i);
  assert.match(gpuProfile.quantization, /q4/i);
  assert.equal(cpuProfile.context, 4096);
  assert.equal(gpuProfile.context, 8192);
  assert.equal(cpuMachine.accelerator, 'cpu');
  assert.equal(gpuMachine.accelerator, 'discrete-gpu');
  assert.equal(plan(pack, cpuProfile, slow, { environment: { machine: cpuMachine, scenario } }).hostFit.status, 'fits');
  assert.equal(plan(pack, gpuProfile, slow, { environment: { machine: gpuMachine, scenario } }).hostFit.status, 'fits');
  assert.ok(slow.caseMs > 30_000);
  assert.ok(slow.maxCases < 10);
});

test('profiles and environments declare host-fit inputs and plan rejects a memory misfit', async () => {
  const sizedProfile = validateProfile({
      ...profile,
      weightsBytes: 8_000_000_000,
      minimumMemoryBytes: 12_000_000_000,
    }),
    smallHost = validateExecutionEnvironment({
      ...environment(),
      machine: {
        ...environment().machine,
        memoryBytes: 8_000_000_000,
        accelerator: 'cpu',
      },
    }),
    result = plan(pack, sizedProfile, defaults, {
      environment: smallHost,
      allowModels: true,
    });

  assert.deepEqual(result.hostFit, {
    status: 'misfit',
    reason: 'Profile requires 12000000000 bytes but host declares 8000000000 bytes',
  });
  assert.equal(result.cases[0].eligible, false);
  assert.equal(result.cases[0].reason, 'Profile does not fit the declared host memory');
  let requests = 0;
  const currentHost = validateExecutionEnvironment({
    ...environment(),
    machine: { ...environment().machine, accelerator: 'cpu' },
  });
  await assert.rejects(
    run(
      pack,
      {
        ...sizedProfile,
        minimumMemoryBytes: currentHost.machine.memoryBytes + 1,
      },
      defaults,
      {
        execute: true,
        allowModels: true,
        environment: currentHost,
        scenarioConfirmed: true,
        fetch: provider(() => requests++).fetcher,
      },
    ),
    /does not fit/,
  );
  assert.equal(requests, 0);
  assert.throws(() => validateProfile({ ...profile, weightsBytes: 0, minimumMemoryBytes: 1 }));
  assert.throws(() =>
    validateExecutionEnvironment({
      ...environment(),
      machine: { ...environment().machine, accelerator: 'unknown-device' },
    }),
  );
});
function provider(onRequest = () => {}) {
  let calls = 0;
  const fetcher = (async (url: unknown) => {
    onRequest();
    const path = new URL(String(url)).pathname;
    let value: unknown;
    if (path === '/api/version') value = { version: 'fixture-v1' };
    else if (path === '/api/show')
      value = { model_info: { 'general.file_type': 15 }, details: { quantization_level: 'Q4_K_M' } };
    else if (path === '/api/tags') value = { models: [{ name: profile.model, size: 100, digest: 'a'.repeat(64) }] };
    else if (path === '/api/ps') value = { models: [] };
    else if (path === '/api/generate') value = { done: true };
    else if (path === '/api/chat') {
      calls++;
      value = {
        model: profile.model,
        message: { content: '{"ok":true}' },
        done: true,
        done_reason: 'stop',
        eval_count: 3,
      };
    } else throw Error('Unexpected fixture endpoint');
    return new Response(JSON.stringify(value));
  }) as typeof fetch;
  return {
    fetcher,
    get calls() {
      return calls;
    },
  };
}

test('machine/scenario contracts reject executable, ambiguous and invalid declarations; plan is not host verification', () => {
  const env = environment();
  validateMachineProfile(env.machine);
  validateLoadScenario(env.scenario);
  validateExecutionEnvironment(env);
  assert.throws(() => validateLoadScenario({ ...scenario, command: 'arbitrary' }));
  assert.throws(() => validateLoadScenario({ ...scenario, load: 'night' }));
  assert.throws(() => validateLoadScenario({ ...scenario, workloadCategories: ['browser', 'browser'] }));
  assert.throws(() => validateMachineProfile({ ...env.machine, memoryBytes: 0 }));
  assert.throws(() => validateExecutionEnvironment({ ...env, secret: 'no' }));
  assert.equal(plan(pack, profile, defaults, { environment: env }).environmentVerified, false);
  assert.equal(JSON.stringify(env.machine).includes('hostname'), false);
});

test('unconfirmed or wrong-host scenario cannot probe providers or reuse an old result', async () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'environment-admission-'));
  try {
    let requests = 0;
    const f = provider(() => {
        requests++;
      }),
      env = environment(),
      options = {
        execute: true,
        allowModels: true,
        fetch: f.fetcher,
        environment: env,
        scenarioConfirmed: true,
        environmentKey: 'neutral-fixture',
        cacheDirectory: join(root, 'cache'),
        output: join(root, 'first.json'),
      };
    await executeWithEvidence(pack, profile, defaults, options);
    const before = requests;
    await assert.rejects(
      executeWithEvidence(pack, profile, defaults, {
        ...options,
        scenarioConfirmed: false,
        output: join(root, 'unconfirmed.json'),
      }),
      /confirmation/,
    );
    await assert.rejects(
      executeWithEvidence(pack, profile, defaults, {
        ...options,
        environment: { ...env, machine: { ...env.machine, memoryBytes: 1 } },
        output: join(root, 'wrong-host.json'),
      }),
      /does not match/,
    );
    assert.equal(requests, before);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('shared evidence reuses once across consumers only for matching complete machine/scenario definitions', async () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'environment-reuse-'));
  try {
    const f = provider(),
      env = environment();
    let n = 0;
    const options = () => ({
      execute: true,
      allowModels: true,
      fetch: f.fetcher,
      environment: env,
      scenarioConfirmed: true,
      environmentKey: 'neutral-fixture',
      cacheDirectory: join(root, 'cache'),
      output: join(root, 'consumer-' + ++n + '.json'),
    });
    const first = await executeWithEvidence(pack, profile, defaults, options());
    validateReport(first.report);
    assert.deepEqual(first.report.environment, env);
    const reused = await executeWithEvidence(pack, profile, defaults, options());
    assert.equal(reused.kind, 'reused');
    assert.equal(f.calls, 1);
    assert.equal(reused.report.finished, first.report.finished);
    assert.equal(reused.performanceMeasuredNow, false);
    const changed = structuredClone(env);
    changed.scenario.load = 'moderate'; // same ID/version still must not mask a changed definition
    const other = await executeWithEvidence(pack, profile, defaults, { ...options(), environment: changed });
    assert.equal(other.kind, 'executed');
    assert.equal(f.calls, 2);
    const renamed = structuredClone(env);
    renamed.machine.id = 'another-machine';
    assert.equal(
      (await executeWithEvidence(pack, profile, defaults, { ...options(), environment: renamed })).kind,
      'executed',
    );
    assert.equal(
      reuseValid(first.report, { pack, profile, limits: defaults, identity: first.report.identity }, 86400000),
      false,
    );
    assert.equal(
      reuseValid(
        first.report,
        { pack, profile, limits: defaults, identity: first.report.identity, environment: env },
        86400000,
      ),
      true,
    );
    const comparison = compare([first.report, other.report]);
    assert.equal(comparison[1].taskContractMatchesFirst, true);
    assert.equal(comparison[1].comparableToFirst, false);
    assert.throws(() =>
      validateReport({ ...first.report, environment: { ...env, machine: { ...env.machine, memoryBytes: 0 } } }),
    );
    assert.equal(
      (await executeWithEvidence(pack, profile, defaults, { ...options(), forceFresh: true })).kind,
      'executed',
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('changing environment during generation invalidates acceptance and preserves original declared scope', async () => {
  const env = environment(),
    original = structuredClone(env),
    f = provider(() => {
      env.scenario.version = '1.0.1';
    });
  const report = await run(pack, profile, defaults, {
    execute: true,
    allowModels: true,
    fetch: f.fetcher,
    environment: env,
    scenarioConfirmed: true,
  });
  assert.equal(report.sourceStable, false);
  assert.equal(report.passed, false);
  assert.deepEqual(report.environment, original);
});

test('packaged CLI inspects, validates and plans context without generation; execution requires current confirmation', () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'environment-cli-'));
  try {
    const cli = resolve('bin/gauntlet.mjs'),
      machine = spawnSync(process.execPath, [cli, 'machine', '--id=fixture-host'], { encoding: 'utf8' });
    assert.equal(machine.status, 0, machine.stderr);
    const machinePath = join(root, 'machine.json');
    writeFileSync(machinePath, machine.stdout);
    const flags = [
      '--pack=examples/smoke-v1.json',
      '--profile=examples/profiles/gemma4-12b.json',
      '--machine-profile=' + machinePath,
      '--scenario=examples/scenarios/moderate-load.json',
    ];
    const planned = spawnSync(process.execPath, [cli, 'plan', ...flags], { encoding: 'utf8' });
    assert.equal(planned.status, 0, planned.stderr);
    assert.equal(JSON.parse(planned.stdout).environment.scenario.load, 'moderate');
    assert.equal(JSON.parse(planned.stdout).environmentVerified, false);
    const denied = spawnSync(
      process.execPath,
      [cli, 'run', ...flags, '--execute', '--allow-models', '--out=' + join(root, 'no.json')],
      { encoding: 'utf8' },
    );
    assert.notEqual(denied.status, 0);
    assert.match(denied.stderr, /confirmation/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('environment mutation during metadata preflight cannot reuse or relabel existing evidence', async () => {
  const root = mkdtempSync(join(realpathSync(tmpdir()), 'environment-preflight-'));
  try {
    const env = environment(),
      f = provider(() => {
        env.scenario.version = '1.0.1';
      });
    await assert.rejects(
      executeWithEvidence(pack, profile, defaults, {
        execute: true,
        allowModels: true,
        fetch: f.fetcher,
        environment: env,
        scenarioConfirmed: true,
        environmentKey: 'neutral-fixture',
        cacheDirectory: join(root, 'cache'),
        output: join(root, 'no.json'),
      }),
      /changed during preflight/,
    );
    assert.equal(f.calls, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('review: JSON arrays cannot impersonate load and power enum strings', () => {
  assert.throws(() => validateLoadScenario({ ...scenario, load: ['minimal'] }));
  assert.throws(() => validateLoadScenario({ ...scenario, power: ['any'] }));
});
