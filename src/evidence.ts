import { failureDestination } from './failures.ts';
import { admitEnvironment, type ExecutionEnvironment } from './environments.ts';
import { engineIdentity } from './engine.ts';
import { readdirSync, existsSync, mkdirSync, lstatSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { arch, platform, hostname, totalmem, cpus, homedir } from 'node:os';
import {
  hash,
  run,
  validatePack,
  validateProfile,
  validateLimits,
  evidenceProfile,
  evidenceDestination,
  readJSON,
  writeEvidence,
  validateReport,
  type Pack,
  type Profile,
  type Limits,
  type Registry,
  type Report,
} from './index.ts';
import { inspectRuntime, boundedJSON, type RuntimeIdentity } from './runtimes.ts';
import { pendingCases, runtimeHash, scenarioHash } from './ledger.ts';
import { serverProcessAsync } from './telemetry.ts';
export interface EvidenceOptions {
  execute: boolean;
  environment?: ExecutionEnvironment;
  scenarioConfirmed?: boolean;
  allowModels?: boolean;
  allowExpensive?: boolean;
  registry?: Registry;
  fetch?: typeof fetch;
  telemetry?: boolean;
  sampleMs?: number;
  output: string;
  cacheDirectory: string;
  maxAgeMs?: number;
  forceFresh?: boolean;
  captureFailures?: string;
  sourceKey?: string;
  /** Trusted owner-supplied environment attestation; primarily for controlled adapters and fixtures. */
  environmentKey?: string;
  pendingLedger?: unknown;
  pendingMaxAgeMs?: number;
}
export interface EvidenceResult {
  kind: 'executed' | 'reused';
  report: Report;
  reportHash: string;
  evidenceFile: string;
  reason: string;
  performanceMeasuredNow: boolean;
}
export function reuseValid(
  report: Report,
  expected: {
    pack: Pack;
    profile: Profile | null;
    limits: Limits;
    registry?: Registry;
    identity?: RuntimeIdentity;
    environment?: ExecutionEnvironment;
  },
  maxAgeMs: number,
  now = Date.now(),
): boolean {
  try {
    validateReport(report);
  } catch {
    return false;
  }
  const age = now - Date.parse(report.finished);
  const cases = new Map(expected.pack.cases.map((c) => [c.id, c]));
  const manifestMatches =
    report.caseCount === expected.pack.cases.length &&
    report.results.length === expected.pack.cases.length * expected.limits.repeat &&
    report.results.every((r) => {
      const c = cases.get(r.id);
      return (
        !!c &&
        r.layer === c.layer &&
        r.split === c.split &&
        r.critical === c.critical &&
        hash(r.capabilities) === hash(c.capabilities) &&
        r.iteration >= 1 &&
        r.iteration <= expected.limits.repeat &&
        (!c.messages || r.fixtureHash === hash(c.messages))
      );
    });
  return (
    hash(report.environment ?? null) === hash(expected.environment ?? null) &&
    manifestMatches &&
    report.engineHash === engineIdentity() &&
    report.protocolVersion === '0.4.0' &&
    !report.diagnostics &&
    report.passed &&
    report.complete &&
    report.sourceStable &&
    report.usage.outputTokens !== null &&
    age >= 0 &&
    age <= maxAgeMs &&
    report.packHash === hash(expected.pack) &&
    report.profileHash === (expected.profile ? hash(evidenceProfile(expected.profile)) : null) &&
    hash(report.limits) === hash(expected.limits) &&
    report.registryHash === (expected.registry ? hash(expected.registry) : null) &&
    (!expected.profile || (!!expected.identity && hash(report.identity) === hash(expected.identity)))
  );
}
export async function executeWithEvidence(
  pack: Pack,
  profile: Profile | null,
  limits: Limits,
  options: EvidenceOptions,
): Promise<EvidenceResult> {
  validatePack(pack);
  if (pack.cases.some((c) => c.responseFormat !== undefined) && profile?.backend && profile.backend !== 'ollama')
    throw Error('Response format currently requires Ollama');
  if (profile) validateProfile(profile);
  validateLimits(limits);
  if (options.execute !== true) throw Error('Execution must be explicit');
  admitEnvironment(options.environment, options.scenarioConfirmed);
  if (options.captureFailures !== undefined) {
    if (options.forceFresh !== true) throw Error('Failure capture requires an explicit fresh run');
    failureDestination(options.captureFailures);
  }
  const executionEnvironment = options.environment ? structuredClone(options.environment) : undefined,
    environmentBefore = hash(executionEnvironment ?? null);
  for (const flag of ['allowModels', 'allowExpensive', 'telemetry', 'forceFresh'] as const)
    if (options[flag] !== undefined && typeof options[flag] !== 'boolean')
      throw Error('Execution flags must be booleans');
  if (
    options.sampleMs !== undefined &&
    (!Number.isSafeInteger(options.sampleMs) || options.sampleMs < 250 || options.sampleMs > 10000)
  )
    throw Error('Invalid telemetry interval');
  const selected = pack.cases.slice(0, limits.maxCases);
  for (const c of selected) {
    if (options.pendingLedger === undefined) {
      if (c.expensive && !options.allowExpensive) throw Error('Selected expensive case requires explicit opt-in');
      if (c.layer !== 'system' && !options.allowModels)
        throw Error('Selected model/agent case requires explicit opt-in');
    }
    if (c.runner) {
      const runner = options.registry?.runners[c.runner];
      if (!runner || !runner.layers.includes(c.layer)) throw Error('Selected runner not registered for layer');
      if (options.pendingLedger === undefined && runner.allowModels && !options.allowModels)
        throw Error('Selected runner requires model opt-in');
    }
  }
  const directModel = !!profile && selected.some((c) => !c.runner && c.layer === 'model');
  if (selected.some((c) => !c.runner) && !profile) throw Error('Selected direct model cases need a profile');
  if (directModel && limits.outputTokens < profile!.maxOutputTokens)
    throw Error('Insufficient token budget for bounded generation');
  if (
    options.environmentKey !== undefined &&
    (typeof options.environmentKey !== 'string' || !options.environmentKey || options.environmentKey.length > 256)
  )
    throw Error('Invalid owner environment attestation');
  if (options.sourceKey !== undefined && !/^[a-f0-9]{64}$/.test(options.sourceKey))
    throw Error('Invalid source fingerprint');
  if (directModel && profile!.parallel !== 1) throw Error('Direct runtime executor is serial');
  const campaignStarted = new Date().toISOString();
  const controller = new AbortController(),
    cancel = () => controller.abort();
  process.on('SIGINT', cancel);
  process.on('SIGTERM', cancel);
  const deadline = Date.now() + limits.suiteMs,
    preflightDeadline = Math.min(deadline, Date.now() + limits.caseMs);
  const remaining = () => {
    if (controller.signal.aborted) throw Error('Campaign cancelled');
    const ms = preflightDeadline - Date.now();
    if (ms <= 0) throw Error('Campaign preflight deadline exhausted');
    return ms;
  };
  try {
    const output = evidenceDestination(options.output);
    const maxAge = options.maxAgeMs ?? 7 * 86400000;
    if (!Number.isSafeInteger(maxAge) || maxAge < 0 || maxAge > 30 * 86400000)
      throw Error('Evidence age must be 0–30 days');
    const hasRunner = pack.cases.some((c) => !!c.runner);
    if (hasRunner && (!options.sourceKey || !/^[a-f0-9]{64}$/.test(options.sourceKey)))
      throw Error('System/agent runner reuse requires a current source fingerprint');
    const directory = resolve(options.cacheDirectory);
    if (directory.split(/[\\/]/).includes('.git')) throw Error('Git metadata cannot be an evidence cache');
    if (existsSync(directory)) {
      const stat = lstatSync(directory);
      if (!stat.isDirectory() || stat.isSymbolicLink()) throw Error('Invalid evidence cache directory');
      if (process.platform !== 'win32' && ((stat.mode & 0o077) !== 0 || stat.uid !== process.getuid?.()))
        throw Error('Evidence cache must be private and owned by the current user');
    }
    let identity: RuntimeIdentity | undefined;
    if (directModel && profile) {
      const request = async (path: string, body?: unknown) =>
        boundedJSON(
          await (options.fetch ?? fetch)(new URL(path, profile.endpoint), {
            method: body ? 'POST' : 'GET',
            headers: body ? { 'content-type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
            redirect: 'error',
            signal: AbortSignal.any([controller.signal, AbortSignal.timeout(Math.max(1, Math.min(5000, remaining())))]),
          }),
          limits.maxBytes,
        );
      identity = await inspectRuntime(profile, request, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(remaining())]),
      });
    }
    const pending =
      options.pendingLedger === undefined
        ? null
        : pendingCases([pack], options.pendingLedger, {
            profile,
            ...(options.pendingMaxAgeMs === undefined ? {} : { maxAgeMs: options.pendingMaxAgeMs }),
            ...(identity
              ? {
                  modelDigest: identity.modelDigest,
                  runtimeHash: runtimeHash({
                    identity,
                    runtime: {
                      provider: identity.provider,
                      node: process.version,
                      platform: process.platform,
                      arch: process.arch,
                    },
                  }),
                }
              : {}),
            scenarioHash: scenarioHash(executionEnvironment),
            ...(options.sourceKey === undefined ? {} : { sourceKey: options.sourceKey }),
          });
    const pendingIds = pending ? new Set(pending.map((entry) => entry.case)) : null;
    const skipCurrent = pendingIds ? selected.filter((c) => !pendingIds.has(c.id)).map((c) => c.id) : [];
    const executing = pendingIds ? selected.filter((c) => pendingIds.has(c.id)) : selected;
    if (options.pendingLedger !== undefined)
      for (const c of executing) {
        if (c.expensive && !options.allowExpensive) throw Error('Selected expensive case requires explicit opt-in');
        if (c.layer !== 'system' && !options.allowModels)
          throw Error('Selected model/agent case requires explicit opt-in');
        if (c.runner && options.registry?.runners[c.runner]?.allowModels && !options.allowModels)
          throw Error('Selected runner requires model opt-in');
      }
    const server =
      directModel && profile
        ? await serverProcessAsync(new URL(profile.endpoint).port || '80', controller.signal, remaining())
        : null;
    remaining();
    if (hash(options.environment ?? null) !== environmentBefore) throw Error('Environment changed during preflight');
    const canReuse = !profile || directModel;
    const environment = canReuse
      ? (options.environmentKey ??
        (!profile || server
          ? hash({
              host: hostname(),
              platform: platform(),
              arch: arch(),
              memory: totalmem(),
              cpu: cpus()[0]?.model ?? 'unknown',
              server,
              node: process.version,
            })
          : null))
      : null;
    const key = hash({
      engineHash: engineIdentity(),
      protocol: '0.4.0',
      executionEnvironment: executionEnvironment ?? null,
      grader: 'exact-v1',
      pack,
      profile,
      limits,
      registry: options.registry ?? null,
      source: options.sourceKey ?? null,
      identity: identity ?? null,
      environment,
      telemetry: options.telemetry ?? false,
      sampleMs: options.sampleMs ?? 500,
    });
    if (!options.forceFresh && options.pendingLedger === undefined && environment && existsSync(directory)) {
      const files = readdirSync(directory)
        .filter((n) => /^evidence-[a-f0-9-]+\.json$/.test(n))
        .sort()
        .reverse()
        .slice(0, 200);
      for (const file of files)
        try {
          remaining();
          const raw = readJSON(join(directory, file));
          if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
          const cached = raw as Record<string, unknown>;
          if (
            Object.keys(cached).some((k) => !['schemaVersion', 'key', 'reportHash', 'report'].includes(k)) ||
            cached.schemaVersion !== 1 ||
            cached.key !== key ||
            cached.reportHash !== hash(cached.report)
          )
            continue;
          const report = validateReport(cached.report);
          if (
            !reuseValid(
              report,
              { pack, profile, limits, registry: options.registry, identity, environment: executionEnvironment },
              maxAge,
            )
          )
            continue;
          // A reference is not a freshly executed report; preserve the original timestamp and timings.
          const result: EvidenceResult = {
            kind: 'reused',
            report,
            reportHash: hash(report),
            evidenceFile: join(directory, file),
            reason: 'Exact fresh passing evidence; no generation/test runner executed',
            performanceMeasuredNow: false,
          };
          writeEvidence(output, {
            schemaVersion: 1,
            kind: 'evidence-reference',
            reportHash: result.reportHash,
            evidenceFile: basename(result.evidenceFile),
            originalFinished: report.finished,
            performanceMeasuredNow: false,
            report,
          });
          return result;
        } catch {
          /* Malformed, missing, stale or incompatible evidence never authorizes a skip. */
        }
    }
    remaining();
    const report = await run(pack, profile, limits, {
      ...options,
      skipCurrent,
      environment: executionEnvironment,
      deadline,
      signal: controller.signal,
    });
    // Preflight identity must survive actual execution before evidence enters the cache.
    report.started = campaignStarted;
    const serverAfter =
      directModel && profile
        ? await serverProcessAsync(
            new URL(profile.endpoint).port || '80',
            controller.signal,
            Math.max(1, deadline - Date.now()),
          )
        : null;
    if (hash(options.environment ?? null) !== environmentBefore) {
      report.sourceStable = false;
      report.passed = false;
    }
    if (server && hash(server) !== hash(serverAfter)) {
      report.sourceStable = false;
      report.passed = false;
    }
    if (identity && (!report.identity || hash(report.identity) !== hash(identity))) {
      report.sourceStable = false;
      report.passed = false;
    }
    report.finished = new Date().toISOString();
    writeEvidence(output, report);
    if (
      report.passed &&
      report.complete &&
      report.results.every((result) => result.status === 'passed') &&
      environment &&
      !options.captureFailures
    ) {
      mkdirSync(directory, { recursive: true, mode: 0o700 });
      writeEvidence(join(directory, 'evidence-' + Date.parse(report.finished) + '-' + report.id + '.json'), {
        schemaVersion: 1,
        key,
        reportHash: hash(report),
        report,
      });
    }
    return {
      kind: 'executed',
      report,
      reportHash: hash(report),
      evidenceFile: output,
      reason: options.forceFresh
        ? 'Explicit fresh run'
        : environment
          ? 'No valid matching evidence'
          : 'Daemon identity unavailable; automatic reuse disabled',
      performanceMeasuredNow: !!report.resources,
    };
  } finally {
    process.removeListener('SIGINT', cancel);
    process.removeListener('SIGTERM', cancel);
  }
}
export function readEvidence(path: string): Report {
  const input = readJSON(path);
  if (input && typeof input === 'object' && !Array.isArray(input) && Object.hasOwn(input, 'key')) {
    const value = input as Record<string, unknown>;
    if (
      Object.keys(value).some((k) => !['schemaVersion', 'key', 'reportHash', 'report'].includes(k)) ||
      value.schemaVersion !== 1 ||
      typeof value.key !== 'string' ||
      value.reportHash !== hash(value.report)
    )
      throw Error('Invalid cached evidence');
    return validateReport(value.report);
  }
  if (
    input &&
    typeof input === 'object' &&
    !Array.isArray(input) &&
    (input as Record<string, unknown>).kind === 'evidence-reference'
  ) {
    const value = input as Record<string, unknown>;
    if (value.reportHash !== hash(value.report) || value.performanceMeasuredNow !== false)
      throw Error('Invalid evidence reference');
    const report = validateReport(value.report);
    if (value.originalFinished !== report.finished) throw Error('Reference changes original timestamp');
    return report;
  }
  return validateReport(input);
}
export function defaultEvidenceDirectory(): string {
  return join(homedir(), '.cache', 'gauntlet-protocol', 'evidence');
}
