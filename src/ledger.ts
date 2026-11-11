// Run ledger and pending cases (F-010). A consumer keeps a metadata-only ledger of which case definitions it has run, under
// which profile, and asks which cases of the packs it consumes have no covering run. Gauntlet knows no consumer: packs,
// ledger and profile are arguments; the consumer owns the ledger file, its policy and its budgets.
import { hash, validatePack, validateReport, evidenceProfile, type Pack, type Profile, type Report } from './index.ts';

export interface LedgerEntry {
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
  schemaVersion: 1;
  entries: LedgerEntry[];
}
export type PendingReason = 'new' | 'changed' | 'stale' | 'other-profile';
export interface PendingCase {
  pack: string;
  case: string;
  reason: PendingReason;
  last: LedgerEntry | null;
}

const statuses = new Set(['passed', 'failed']);
const sha = /^[0-9a-f]{64}$/;

export function caseHash(c: Pack['cases'][number]): string {
  return hash(c);
}
export function emptyLedger(): Ledger {
  return { schemaVersion: 1, entries: [] };
}
export function validateLedger(input: unknown): Ledger {
  const l = input as Ledger;
  if (!l || typeof l !== 'object' || l.schemaVersion !== 1 || !Array.isArray(l.entries)) throw Error('Invalid ledger');
  const keys = new Set<string>();
  for (const e of l.entries) {
    const known = ['pack', 'packVersion', 'case', 'caseHash', 'profileHash', 'status', 'reportHash', 'finished'];
    if (
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
  return l;
}
const entryKey = (e: { pack: string; case: string; profileHash: string | null }) =>
  JSON.stringify([e.pack, e.case, e.profileHash]);
const order = (a: LedgerEntry, b: LedgerEntry) => (entryKey(a) < entryKey(b) ? -1 : entryKey(a) > entryKey(b) ? 1 : 0);

// Adds the cases a report actually ran. The report must validate and must have run exactly this pack definition.
// Only graded results cover a case: passed or failed. An error (the runtime or adapter never answered) and not-run
// cover nothing. With repeats, a case is covered when every iteration was graded, and passed when every one passed.
// A newer run of the same case and profile replaces the older entry; on equal times the larger report hash wins, so the
// result does not depend on recording order.
export function recordRun(ledgerInput: unknown, reportInput: unknown, packInput: unknown): Ledger {
  const ledger = validateLedger(ledgerInput);
  const report: Report = validateReport(reportInput);
  const pack = validatePack(packInput);
  if (report.pack !== pack.id || report.packVersion !== pack.version || report.packHash !== hash(pack))
    throw Error('Report did not run this pack definition');
  const cases = new Map(pack.cases.map((c) => [c.id, c]));
  const profileHash = report.profile ? hash(evidenceProfile(report.profile)) : null;
  if (report.profileHash !== profileHash) throw Error('Report profile hash does not match its profile');
  const reportHash = hash(report);
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
      });
  const entries = new Map(ledger.entries.map((e) => [entryKey(e), e]));
  const newer = (a: LedgerEntry, b: LedgerEntry) =>
    Date.parse(a.finished) > Date.parse(b.finished) ||
    (Date.parse(a.finished) === Date.parse(b.finished) && a.reportHash > b.reportHash);
  for (const e of ran) {
    const old = entries.get(entryKey(e));
    if (!old || old.reportHash === e.reportHash || newer(e, old)) entries.set(entryKey(e), e);
  }
  return { schemaVersion: 1, entries: [...entries.values()].sort(order) };
}

// Lists the cases of the given packs with no covering run. With a profile, only runs under that exact profile cover a
// model case (other-profile when only other profiles ran it); system cases run without a model, so a run without a
// profile covers them under any profile. Without a profile, any run covers a case. maxAgeMs makes older runs
// stale. The consumer decides what pending means for it (warn, fail CI, raise a record).
export function pendingCases(
  packInputs: unknown[],
  ledgerInput: unknown,
  options: { profile?: Profile | null; maxAgeMs?: number; now?: number } = {},
): PendingCase[] {
  const ledger = validateLedger(ledgerInput);
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
      let reason: PendingReason | null = null;
      if (!last) reason = all.length ? 'other-profile' : 'new';
      else if (last.caseHash !== caseHash(c)) reason = 'changed';
      else if (options.maxAgeMs !== undefined && now - Date.parse(last.finished) > options.maxAgeMs) reason = 'stale';
      if (reason) out.push({ pack: pack.id, case: c.id, reason, last: last ?? latest(all) });
    }
  }
  return out;
}
