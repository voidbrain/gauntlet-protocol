#!/usr/bin/env node
import { resolve, dirname, relative } from 'node:path';
import { existsSync, readFileSync, writeFileSync, mkdirSync, lstatSync, renameSync } from 'node:fs';
import {
  readJSON,
  readEvidence,
  validatePack,
  validateProfile,
  validateRegistry,
  validateLimits,
  defaults,
  plan,
  executeWithEvidence,
  defaultEvidenceDirectory,
  writeEvidence,
  compare,
  exportProfile,
  catalog,
  catalogMarkdown,
  inspectMachine,
  validateExecutionEnvironment,
  inspectFailures,
  emptyLedger,
  mergeRun,
  pendingCases,
  runtimeHash,
  scenarioHash,
  validateReport,
} from '../dist/index.js';
const [command, ...args] = process.argv.slice(2),
  options = {};
try {
  const allowed = {
    'inspect-failures': ['directory', 'report'],
    machine: ['id', 'version'],
    validate: ['pack', 'profile', 'registry', 'machine-profile', 'scenario'],
    index: ['packs', 'reports', 'out', 'check'],
    plan: [
      'pack',
      'profile',
      'registry',
      'limits',
      'allow-models',
      'allow-expensive',
      'machine-profile',
      'scenario',
      'only',
    ],
    run: [
      'pack',
      'profile',
      'registry',
      'limits',
      'out',
      'execute',
      'allow-models',
      'allow-expensive',
      'telemetry',
      'sample-ms',
      'fresh',
      'cache-dir',
      'max-age-hours',
      'source-key',
      'machine-profile',
      'scenario',
      'confirm-scenario',
      'capture-failures',
      'only',
      'pending',
      'ledger',
      'max-age-days',
      'resume',
    ],
    compare: ['reports'],
    ledger: ['ledger', 'report', 'pack', 'source-key'],
    identity: ['report'],
    pending: [
      'packs',
      'ledger',
      'profile',
      'max-age-days',
      'json',
      'model-digest',
      'runtime-hash',
      'scenario-hash',
      'source-key',
    ],
    qualify: ['report', 'review', 'requirements', 'out'],
  };
  if (!allowed[command])
    throw Error(
      'Use machine, validate, index, plan, run, inspect-failures, compare, qualify, ledger, identity or pending',
    );
  for (const arg of args) {
    const m = /^--([a-z-]+)(?:=(.+))?$/.exec(arg);
    if (!m || !allowed[command].includes(m[1]) || Object.hasOwn(options, m[1]))
      throw Error('Unknown or duplicate argument');
    const boolean = [
      'execute',
      'allow-models',
      'allow-expensive',
      'check',
      'fresh',
      'telemetry',
      'confirm-scenario',
      'json',
      'pending',
    ].includes(m[1]);
    if (boolean === !!m[2]) throw Error('Invalid argument value');
    options[m[1]] = boolean ? true : m[2];
  }
  const required = (k) => {
    if (typeof options[k] !== 'string') throw Error('Missing --' + k);
    return options[k];
  };
  const load = (k) => readJSON(resolve(required(k)));
  if (command === 'inspect-failures')
    console.log(
      JSON.stringify(
        inspectFailures(required('directory'), options.report ? readEvidence(options.report) : undefined),
        null,
        2,
      ),
    );
  else if (command === 'ledger') {
    // Records the cases a saved report ran into the consumer's ledger (created when missing).
    const path = resolve(required('ledger'));
    const ledger = existsSync(path) ? readJSON(path) : emptyLedger();
    if (lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink())
      throw Error('Ledger path must be a regular file, not a symlink');
    const merged = mergeRun(ledger, readEvidence(required('report')), load('pack'), {
      ...(options['source-key'] !== undefined ? { sourceKey: options['source-key'] } : {}),
    });
    const next = merged.ledger;
    const temporary = path + '.' + process.pid + '.tmp';
    writeFileSync(temporary, JSON.stringify(next, null, 2) + '\n', { flag: 'wx' });
    renameSync(temporary, path);
    console.log(JSON.stringify({ ledger: path, entries: next.entries.length, changes: merged.changes }));
  } else if (command === 'identity') {
    // Prints the run identity a saved report would record, for `pending --model-digest/--runtime-hash/--scenario-hash`.
    const report = validateReport(readEvidence(required('report')));
    console.log(
      JSON.stringify(
        {
          modelDigest: report.modelDigest,
          runtimeHash: runtimeHash(report),
          scenarioHash: scenarioHash(report.environment),
        },
        null,
        2,
      ),
    );
  } else if (command === 'pending') {
    // Lists cases with no covering run, one per line (or --json); exits 1 when any are pending.
    const days = options['max-age-days'];
    if (days !== undefined && !/^\d+$/.test(days)) throw Error('Invalid --max-age-days');
    const ledgerPath = resolve(required('ledger'));
    const list = pendingCases(
      required('packs')
        .split(',')
        .map((p) => readJSON(resolve(p))),
      existsSync(ledgerPath) ? readJSON(ledgerPath) : emptyLedger(),
      {
        ...(options.profile ? { profile: validateProfile(load('profile')) } : {}),
        ...(days !== undefined ? { maxAgeMs: Number(days) * 86400000 } : {}),
        // Intended identity (B-002): a flag left out does not constrain; --scenario-hash=none asks for a run without one.
        ...(options['model-digest'] !== undefined ? { modelDigest: options['model-digest'] } : {}),
        ...(options['runtime-hash'] !== undefined ? { runtimeHash: options['runtime-hash'] } : {}),
        ...(options['scenario-hash'] !== undefined
          ? { scenarioHash: options['scenario-hash'] === 'none' ? null : options['scenario-hash'] }
          : {}),
        ...(options['source-key'] !== undefined ? { sourceKey: options['source-key'] } : {}),
      },
    );
    if (options.json) console.log(JSON.stringify(list, null, 2));
    else for (const p of list) console.log(`${p.pack}/${p.case} (${p.reason})`);
    if (list.length) process.exitCode = 1;
  } else if (command === 'machine')
    console.log(JSON.stringify(inspectMachine(required('id'), options.version ?? '1.0.0'), null, 2));
  else if (command === 'index') {
    const entries = catalog(
      required('packs')
        .split(',')
        .map((p) => validatePack(readJSON(resolve(p)))),
      options.reports ? options.reports.split(',').map((p) => readEvidence(resolve(p))) : [],
    );
    const sourcePaths = required('packs').split(',');
    const sources = Object.fromEntries(
      sourcePaths.map((path) => {
        const pack = validatePack(readJSON(resolve(path)));
        return [
          pack.id,
          relative(options.out ? dirname(resolve(options.out)) : process.cwd(), resolve(path)).replaceAll('\\', '/'),
        ];
      }),
    );
    const rendered = catalogMarkdown(entries, sources);
    if (!options.out) console.log(rendered);
    else {
      const out = resolve(options.out);
      if (!out.endsWith('.md') || out.split(/[\\/]/).includes('.git'))
        throw Error('Index requires Markdown outside git metadata');
      if (options.check) {
        if (!existsSync(out) || readFileSync(out, 'utf8') !== rendered) throw Error('Generated test index is stale');
        console.log('Test index current');
      } else {
        if (existsSync(out) && !readFileSync(out, 'utf8').startsWith('<!-- Generated from executable packs;'))
          throw Error('Refusing to overwrite a non-generated file');
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, rendered);
        console.log(JSON.stringify({ index: out, cases: entries.length }));
      }
    }
  } else if (command === 'compare')
    console.log(
      JSON.stringify(
        compare(
          required('reports')
            .split(',')
            .map((p) => readEvidence(resolve(p))),
        ),
        null,
        2,
      ),
    );
  else if (command === 'qualify') {
    writeEvidence(
      required('out'),
      exportProfile(readEvidence(required('report')), load('review'), load('requirements')),
    );
    console.log('Reviewed profile evidence exported; production permissions unchanged.');
  } else {
    if (!!options['machine-profile'] !== !!options.scenario)
      throw Error('Machine profile and scenario must be supplied together');
    const environment = options.scenario
      ? validateExecutionEnvironment({ machine: load('machine-profile'), scenario: load('scenario') })
      : undefined;
    let pack = validatePack(load('pack'));
    if (options.only) {
      const ids = options.only.split(',');
      if (new Set(ids).size !== ids.length || ids.some((id) => !pack.cases.some((c) => c.id === id)))
        throw Error('Unknown or duplicate selected case');
      pack = { ...pack, id: pack.id + ':selected', cases: pack.cases.filter((c) => ids.includes(c.id)) };
    }
    const profile = options.profile ? validateProfile(load('profile')) : null,
      registry = options.registry ? validateRegistry(load('registry'), dirname(resolve(options.registry))) : undefined,
      limits = options.limits ? validateLimits(load('limits')) : defaults,
      flags = { allowModels: !!options['allow-models'], allowExpensive: !!options['allow-expensive'], environment };
    if (command === 'validate')
      console.log(
        JSON.stringify({
          valid: true,
          pack: pack.id,
          cases: pack.cases.length,
          profile: profile?.id ?? null,
          environment: environment ?? null,
          environmentVerified: false,
        }),
      );
    else if (command === 'plan') console.log(JSON.stringify(plan(pack, profile, limits, flags), null, 2));
    else {
      if (!options.execute) throw Error('Execution is explicit: --execute --out=new.json');
      if (!!options.pending !== !!options.ledger) throw Error('--pending and --ledger must be supplied together');
      const pendingDays = options['max-age-days'];
      if (pendingDays !== undefined && (!options.pending || !/^\d+$/.test(pendingDays)))
        throw Error('Invalid --max-age-days');
      const pendingLedgerPath = options.ledger ? resolve(options.ledger) : null;
      const result = await executeWithEvidence(pack, profile, limits, {
        ...flags,
        scenarioConfirmed: options['confirm-scenario'] === true,
        execute: true,
        registry,
        output: required('out'),
        cacheDirectory: options['cache-dir'] ?? defaultEvidenceDirectory(),
        maxAgeMs: options['max-age-hours'] ? Number(options['max-age-hours']) * 3600000 : undefined,
        forceFresh: !!options.fresh,
        captureFailures: options['capture-failures'],
        sourceKey: options['source-key'],
        telemetry: !!options.telemetry,
        sampleMs: options['sample-ms'] ? Number(options['sample-ms']) : undefined,
        ...(pendingLedgerPath
          ? {
              pendingLedger: existsSync(pendingLedgerPath) ? readJSON(pendingLedgerPath) : emptyLedger(),
              ...(pendingDays === undefined ? {} : { pendingMaxAgeMs: Number(pendingDays) * 86400000 }),
            }
          : {}),
        ...(options.resume ? { resume: readEvidence(resolve(options.resume)) } : {}),
      });
      console.log(
        JSON.stringify({
          id: result.report.id,
          kind: result.kind,
          passed: result.report.passed,
          complete: result.report.complete,
          out: options.out,
          reason: result.reason,
          performanceMeasuredNow: result.performanceMeasuredNow,
        }),
      );
      if (!result.report.passed) process.exitCode = 1;
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Gauntlet failed');
  // pending and ledger keep exit 1 for "cases pending"; their errors exit 2 so a consumer can tell them apart.
  process.exitCode = ['pending', 'ledger', 'identity'].includes(command) ? 2 : 1;
}
