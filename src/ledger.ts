// Run ledger and pending cases (F-010). A consumer keeps a metadata-only ledger of which case definitions it has run, under
// which profile, and asks which cases of the packs it consumes have no covering run. Gauntlet knows no consumer: packs,
// ledger and profile are arguments; the consumer owns the ledger file, its policy and its budgets.
// Coverage also follows identity (B-002): an entry records the model digest, the runtime identity, the machine scenario
// and an opaque consumer source key of its run, and `pendingCases` names the field that changed.
import { hash, validatePack, validateReport, evidenceProfile, type Pack, type Profile, type Report } from './index.ts';
import type { ExecutionEnvironment } from './environments.ts';

// The identity of a run. Absent on an entry carried over from a schema 1 ledger: unknown identity.
export interface LedgerIdentity {
  modelDigest: string | null;
  runtimeHash: string | null;
  scenarioHash: string | null;
  sourceKey: string | null;
}
export interface LedgerEntry extends Partial<LedgerIdentity> {
  pack: string;
  packVersion: string;
  case: string;
  caseHash: string;
  profileHash: string | null;
  status: 'passed' | 'failed';
  reportHash: string;
  finished: string;
}
export interface Ledger {
  schemaVersion: 2;
  entries: LedgerEntry[];
}
export type PendingReason =
  | 'new'
  | 'changed'
  | 'stale'
  | 'other-profile'
  | 'model-changed'
  | 'runtime-changed'
  | 'scenario-changed'
  | 'source-changed';
// The identity a consumer intends to run under. A field left undefined does not constrain; null means "none" (a
// scenario-free run, no model digest, no source key).
export interface IntendedIdentity {
  modelDigest?: string | null;
  runtimeHash?: string | null;
  scenarioHash?: string | null;
  sourceKey?: string | null;
}
export interface PendingCase {
  pack: string;
  case: string;
  reason: PendingReason;
  last: LedgerEntry | null;
}

const statuses = new Set(['passed', 'failed']);
const sha = /^[0-9a-f]{64}$/;
const modelDigestPattern = /^(sha256:)?[a-f0-9]{64}$/;
// An opaque consumer token (a commit, a content hash, a version): no spaces, no path separators, bounded.
const sourceKeyPattern = /^[A-Za-z0-9][A-Za-z0-9._:+-]{0,127}$/;
const identityFields = ['modelDigest', 'runtimeHash', 'scenarioHash', 'sourceKey'] as const;
const nullOr = (test: (v: string) => boolean) => (v: unknown) => v === null || (typeof v === 'string' && test(v));
const identityChecks: Record<(typeof identityFields)[number], (v: unknown) => boolean> = {
  modelDigest: nullOr((v) => modelDigestPattern.test(v)),
  runtimeHash: nullOr((v) => sha.test(v)),
  scenarioHash: nullOr((v) => sha.test(v)),
  sourceKey: nullOr((v) => sourceKeyPattern.test(v)),
};

// The runtime identity of a report: its provider identity proof and runtime (provider, Node, platform, architecture).
// A provider, Node or platform change, or a new model metadata proof, changes it.
export function runtimeHash(report: Pick<Report, 'identity' | 'runtime'>): string {
  return hash({ identity: report.identity ?? null, runtime: report.runtime });
}
// The machine scenario of a run: the hash of its execution environment, or null for a run without one.
export function scenarioHash(environment: ExecutionEnvironment | null | undefined): string | null {
  return environment ? hash(environment) : null;
}
export function validateIntendedIdentity(input: IntendedIdentity): IntendedIdentity {
  for (const k of identityFields)
    if (input[k] !== undefined && !identityChecks[k](input[k])) throw Error(`Invalid intended ${k}`);
  return input;
}

export function caseHash(c: Pack['cases'][number]): string {
  return hash(c);
}
export function emptyLedger(): Ledger {
  return { schemaVersion: 2, entries: [] };
}
// Validates a schema 2 ledger, or a schema 1 ledger whose entries are then read as unknown identity. Returns the
// entries as given; `recordRun` writes schema 2.
export function validateLedger(input: unknown): Ledger | { schemaVersion: 1; entries: LedgerEntry[] } {
  const l = input as { schemaVersion: unknown; entries: LedgerEntry[] };
  if (!l || typeof l !== 'object' || (l.schemaVersion !== 1 && l.schemaVersion !== 2) || !Array.isArray(l.entries))
    throw Error('Invalid ledger');
  const keys = new Set<string>();
  for (const e of l.entries) {
    const known = ['pack', 'packVersion', 'case', 'caseHash', 'profileHash', 'status', 'reportHash', 'finished'];
    const present = e && typeof e === 'object' ? identityFields.filter((k) => k in e) : [];
    // Schema 2: all four identity fields or none (an entry carried over from schema 1). Schema 1: none.
    if (present.length && (l.schemaVersion === 1 || present.length !== identityFields.length))
      throw Error('Invalid ledger entry');
    if (present.length) known.push(...identityFields);
    if (
      present.some((k) => !identityChecks[k](e[k])) ||
      !e ||
      typeof e !== 'object' ||
      Object.keys(e).some((k) => !known.includes(k)) ||
      typeof e.pack !== 'string' ||
      typeof e.packVersion !== 'string' ||
      typeof e.case !== 'string' ||
      !sha.test(e.caseHash) ||
      !(e.profileHash === null || sha.test(e.profileHash)) ||
      !statuses.has(e.status) ||
      !sha.test(e.reportHash) ||
      Number.isNaN(Date.parse(e.finished))
    )
      throw Error('Invalid ledger entry');
    const key = entryKey(e);
    if (keys.has(key)) throw Error('Duplicate ledger entry');
    keys.add(key);
  }
  return l as Ledger;
}
const entryKey = (e: { pack: string; case: string; profileHash: string | null }) =>
  JSON.stringify([e.pack, e.case, e.profileHash]);
const order = (a: LedgerEntry, b: LedgerEntry) => (entryKey(a) < entryKey(b) ? -1 : entryKey(a) > entryKey(b) ? 1 : 0);

// Adds the cases a report actually ran. The report must validate and must have run exactly this pack definition.
// Only graded results cover a case: passed or failed. An error (the runtime or adapter never answered) and not-run
// cover nothing. With repeats, a case is covered when every iteration was graded, and passed when every one passed.
// A newer run of the same case and profile replaces the older entry; on equal times the larger report hash wins, so the
// result does not depend on recording order. Each new entry records the run's identity: model digest, runtime hash,
// scenario hash, and the consumer's opaque `sourceKey` (the version of its system under test), or null. The result is
// schema 2; entries carried over from schema 1 keep unknown identity.
export function recordRun(
  ledgerInput: unknown,
  reportInput: unknown,
  packInput: unknown,
  options: { sourceKey?: string | null } = {},
): Ledger {
  const sourceKey = options.sourceKey ?? null;
  if (!identityChecks.sourceKey(sourceKey)) throw Error('Invalid source key: use a bounded opaque token, not a path');
  const ledger = validateLedger(ledgerInput);
  const report: Report = validateReport(reportInput);
  const pack = validatePack(packInput);
  if (report.pack !== pack.id || report.packVersion !== pack.version || report.packHash !== hash(pack))
    throw Error('Report did not run this pack definition');
  const cases = new Map(pack.cases.map((c) => [c.id, c]));
  const profileHash = report.profile ? hash(evidenceProfile(report.profile)) : null;
  if (report.profileHash !== profileHash) throw Error('Report profile hash does not match its profile');
  const reportHash = hash(report);
  const identity: LedgerIdentity = {
    modelDigest: report.modelDigest,
    runtimeHash: runtimeHash(report),
    scenarioHash: scenarioHash(report.environment),
    sourceKey,
  };
  const graded = new Map<string, { status: LedgerEntry['status']; ungraded: boolean }>();
  for (const r of report.results) {
    if (!cases.has(r.id)) throw Error('Report result for a case outside the pack');
    const prev = graded.get(r.id) ?? { status: 'passed' as LedgerEntry['status'], ungraded: false };
    if (r.status === 'passed' || r.status === 'failed')
      graded.set(r.id, { ...prev, status: prev.status === 'failed' || r.status === 'failed' ? 'failed' : 'passed' });
    else graded.set(r.id, { ...prev, ungraded: true });
  }
  const ran: LedgerEntry[] = [];
  for (const [id, g] of graded)
    if (!g.ungraded)
      ran.push({
        pack: pack.id,
        packVersion: pack.version,
        case: id,
        caseHash: caseHash(cases.get(id)!),
        profileHash,
        status: g.status,
        reportHash,
        finished: report.finished,
        ...identity,
      });
  const entries = new Map(ledger.entries.map((e) => [entryKey(e), e]));
  const newer = (a: LedgerEntry, b: LedgerEntry) =>
    Date.parse(a.finished) > Date.parse(b.finished) ||
    (Date.parse(a.finished) === Date.parse(b.finished) && a.reportHash > b.reportHash);
  for (const e of ran) {
    const old = entries.get(entryKey(e));
    if (!old || old.reportHash === e.reportHash || newer(e, old)) entries.set(entryKey(e), e);
  }
  return { schemaVersion: 2, entries: [...entries.values()].sort(order) };
}

// Lists the cases of the given packs with no covering run. With a profile, only runs under that exact profile cover a
// model case (other-profile when only other profiles ran it); system cases run without a model, so a run without a
// profile covers them under any profile. Without a profile, any run covers a case. Then identity: each intended field
// that is set must match the latest covering entry (model-changed, runtime-changed, scenario-changed, source-changed,
// in that order); an entry of unknown identity (schema 1) never matches a set field. Model cases follow the model
// digest, runtime and scenario; system cases run no model and follow the scenario and source key. maxAgeMs makes older
// runs stale. The consumer decides what pending means for it (warn, fail CI, raise a record).
export function pendingCases(
  packInputs: unknown[],
  ledgerInput: unknown,
  options: { profile?: Profile | null; maxAgeMs?: number; now?: number } & IntendedIdentity = {},
): PendingCase[] {
  const ledger = validateLedger(ledgerInput);
  validateIntendedIdentity(options);
  const checks: Record<'model' | 'system', [(typeof identityFields)[number], PendingReason][]> = {
    model: [
      ['modelDigest', 'model-changed'],
      ['runtimeHash', 'runtime-changed'],
      ['scenarioHash', 'scenario-changed'],
    ],
    system: [
      ['scenarioHash', 'scenario-changed'],
      ['sourceKey', 'source-changed'],
    ],
  };
  const now = options.now ?? Date.now();
  const wanted =
    options.profile === undefined ? undefined : options.profile ? hash(evidenceProfile(options.profile)) : null;
  const out: PendingCase[] = [];
  for (const input of packInputs) {
    const pack = validatePack(input);
    for (const c of pack.cases) {
      const all = ledger.entries.filter((e) => e.pack === pack.id && e.case === c.id);
      const mine =
        wanted === undefined
          ? all
          : all.filter((e) => e.profileHash === wanted || (c.layer === 'system' && e.profileHash === null));
      const latest = (list: LedgerEntry[]) =>
        list.reduce<LedgerEntry | null>(
          (a, e) => (!a || Date.parse(e.finished) > Date.parse(a.finished) ? e : a),
          null,
        );
      const last = latest(mine);
      const identityChanged = (e: LedgerEntry) =>
        checks[c.layer === 'system' ? 'system' : 'model'].find(
          ([k]) => options[k] !== undefined && (!(k in e) || e[k] !== options[k]),
        )?.[1] ?? null;
      const stale = (e: LedgerEntry) =>
        options.maxAgeMs !== undefined && now - Date.parse(e.finished) > options.maxAgeMs ? 'stale' : null;
      const reason: PendingReason | null = !last
        ? all.length
          ? 'other-profile'
          : 'new'
        : last.caseHash !== caseHash(c)
          ? 'changed'
          : (identityChanged(last) ?? stale(last));
      if (reason) out.push({ pack: pack.id, case: c.id, reason, last: last ?? latest(all) });
    }
  }
  return out;
}
