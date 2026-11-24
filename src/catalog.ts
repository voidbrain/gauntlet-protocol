import { validatePack, hash, type Pack, type Report } from './index.ts';
export const areas = [
  'unclassified',
  'general-assistant',
  'coding',
  'code-review',
  'math',
  'logic-planning',
  'cad-3d',
  'backlog-management',
  'estimation',
  'ci-operations',
  'research',
  'tools',
  'conversation-memory',
  'distributed-coordination',
  'ui-visual',
  'security-permissions',
  'documents-data',
  'language-translation',
  'audio-video',
  'scheduling-time',
] as const;
export type Area = (typeof areas)[number] | `x:${string}:${string}`;
export interface CatalogEntry {
  pack: string;
  packVersion: string;
  packHash: string;
  caseId: string;
  area: Area;
  capabilities: string[];
  layer: string;
  split: string;
  critical: boolean;
  expensive: boolean;
  grader: string;
  requirements: string[];
  evidence: {
    report: string;
    finished: string;
    status: string;
    configuration: string | null;
  }[];
}
export function catalog(packs: Pack[], reports: Report[] = []): CatalogEntry[] {
  const seen = new Set<string>();
  return packs.flatMap((pack) => {
    validatePack(pack);
    const packHash = hash(pack);
    return pack.cases.map((c) => {
      const key = pack.id + '@' + pack.version + '/' + c.id;
      if (seen.has(key)) throw Error('Duplicate catalog identity');
      seen.add(key);
      return {
        pack: pack.id,
        packVersion: pack.version,
        packHash,
        caseId: c.id,
        area: c.area ?? 'unclassified',
        capabilities: c.capabilities,
        layer: c.layer,
        split: c.split,
        critical: c.critical,
        expensive: c.expensive,
        grader: c.runner
          ? 'registered:' + c.runner
          : c.expected!.kind === 'rubric'
            ? 'rubric-v1'
            : 'exact-' + c.expected!.kind + '-v1',
        requirements: c.requirements ?? [],
        evidence: reports
          .filter((r) => r.packHash === packHash)
          .flatMap((r) =>
            r.results
              .filter((x) => x.id === c.id)
              .map((x) => ({ report: r.id, finished: r.finished, status: x.status, configuration: r.profileHash })),
          ),
      };
    });
  });
}
export function catalogMarkdown(entries: CatalogEntry[], sources: Record<string, string> = {}): string {
  const label = (entry: CatalogEntry) => {
    const text = entry.pack + '@' + entry.packVersion + ' / ' + entry.caseId;
    const target = sources[entry.pack];
    return target ? '[' + text + '](' + encodeURI(target).replaceAll('(', '%28').replaceAll(')', '%29') + ')' : text;
  };
  const safe = (value: string) => value.replaceAll('|', '\\|').replaceAll('\n', ' ');
  return (
    '<!-- Generated from executable packs; do not edit. -->\n# Test-to-capability index\n\nMapped cases are implemented coverage, not model qualification. Evidence retains its actual run date/configuration; missing evidence means unmeasured.\n\n| Pack / case | Area | Capabilities | Layer / split | Critical / costly | Grader / requirements | Evidence |\n|---|---|---|---|---|---|---|\n' +
    entries
      .map(
        (c) =>
          '| ' +
          [
            label(c),
            c.area,
            c.capabilities.join(', '),
            c.layer + ' / ' + c.split,
            String(c.critical) + ' / ' + String(c.expensive),
            c.grader + ' / ' + (c.requirements.join(', ') || 'none declared'),
            c.evidence.length
              ? c.evidence.map((e) => e.status + ' ' + e.finished + ' report:' + e.report).join('; ')
              : 'Unmeasured',
          ]
            .map(safe)
            .join(' | ') +
          ' |',
      )
      .join('\n') +
    '\n\n## Area coverage\n\n' +
    [...new Set<string>([...areas, ...entries.map((c) => c.area)])]
      .map((area) => '- ' + area + ': ' + entries.filter((c) => c.area === area).length + ' mapped cases')
      .join('\n') +
    '\n'
  );
}
