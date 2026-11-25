// Deterministic defect-finding grader for code review (expected kind "defects").
// Each seeded defect has a file path, an inclusive 1-based line range [start, end] and a category.
// The candidate answer is a JSON object { findings: [...] }; it passes when every seeded defect is matched
// by at least one finding and the number of unmatched findings stays within maxFalsePositives (default 0).
// A finding covers at most maxFindingLines lines; a wider one matches no defect, so sweeping a whole file
// cannot find every defect in it.
// Failure reasons name only defect IDs/indices and counts, never candidate text.
export interface SeededDefect {
  id?: string;
  file: string;
  lines: [number, number];
  category: string;
}

export interface DefectExpectation {
  defects: SeededDefect[];
  maxFalsePositives?: number;
}

export interface DefectGradeResult {
  passed: boolean;
  found: string[];
  missed: string[];
  falsePositives: number;
  failures: string[];
}

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,99}$/;
const categoryPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const maxFindingLines = 10;

const normalizePath = (value: string): string =>
  value
    .trim()
    .replaceAll('\\', '/')
    .replace(/^(\.\/)+/, '')
    .replace(/\/+/g, '/');

const validRelativeFile = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const normalized = normalizePath(value);
  if (!normalized || normalized.length > 256 || normalized.startsWith('/') || normalized.endsWith('/')) return false;
  const parts = normalized.split('/');
  return parts.every((part) => part.length > 0 && part !== '.' && part !== '..' && !/[\0\r\n]/.test(part));
};

const validLineRange = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length === 2 &&
  Number.isSafeInteger(value[0]) &&
  Number.isSafeInteger(value[1]) &&
  value[0] >= 1 &&
  value[1] >= value[0] &&
  value[1] <= 1_000_000;

export function validateDefects(input: unknown): DefectExpectation {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid defects expectation');
  const v = input as Record<string, unknown>;
  const keys = Object.keys(v);
  if (
    !keys.length ||
    keys.some((key) => key !== 'defects' && key !== 'maxFalsePositives') ||
    !Array.isArray(v.defects) ||
    !v.defects.length ||
    v.defects.length > 64 ||
    (v.maxFalsePositives !== undefined &&
      (!Number.isSafeInteger(v.maxFalsePositives) ||
        (v.maxFalsePositives as number) < 0 ||
        (v.maxFalsePositives as number) > 64))
  )
    throw Error('Invalid defects expectation');
  const seenIds = new Set<string>();
  const defects: SeededDefect[] = v.defects.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw Error('Invalid seeded defect');
    const d = entry as Record<string, unknown>;
    if (
      Object.keys(d).some((key) => !['id', 'file', 'lines', 'category'].includes(key)) ||
      (d.id !== undefined && (typeof d.id !== 'string' || !idPattern.test(d.id))) ||
      !validRelativeFile(d.file) ||
      !validLineRange(d.lines) ||
      typeof d.category !== 'string' ||
      !categoryPattern.test(d.category)
    )
      throw Error('Invalid seeded defect');
    const defectId = (d.id as string | undefined) ?? String(index + 1);
    if (seenIds.has(defectId)) throw Error('Duplicate seeded defect id');
    seenIds.add(defectId);
    return {
      ...(d.id !== undefined ? { id: d.id as string } : {}),
      file: normalizePath(d.file),
      lines: [d.lines[0], d.lines[1]],
      category: d.category,
    };
  });
  return {
    defects,
    maxFalsePositives: (v.maxFalsePositives as number | undefined) ?? 0,
  };
}

interface ParsedFinding {
  file: string;
  lines: [number, number];
  category: string;
}

function parseFindings(input: unknown): ParsedFinding[] | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const raw = (input as Record<string, unknown>).findings;
  if (!Array.isArray(raw) || raw.length > 256) return null;
  const out: ParsedFinding[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const f = item as Record<string, unknown>;
    if (typeof f.file !== 'string' || typeof f.category !== 'string') return null;
    const file = normalizePath(f.file);
    const category = f.category.trim().toLowerCase();
    if (!file || file.length > 256 || !categoryPattern.test(category)) return null;
    let lines: [number, number];
    if (f.line !== undefined && f.lines === undefined) {
      if (!Number.isSafeInteger(f.line) || (f.line as number) < 1 || (f.line as number) > 1_000_000) return null;
      lines = [f.line as number, f.line as number];
    } else if (f.lines !== undefined && f.line === undefined) {
      if (!validLineRange(f.lines)) return null;
      lines = [f.lines[0], f.lines[1]];
    } else return null;
    out.push({ file, lines, category });
  }
  return out;
}

const matchesDefect = (finding: ParsedFinding, defect: SeededDefect): boolean =>
  finding.lines[1] - finding.lines[0] < maxFindingLines &&
  finding.file === normalizePath(defect.file) &&
  finding.category === defect.category.toLowerCase() &&
  Math.max(finding.lines[0], defect.lines[0]) <= Math.min(finding.lines[1], defect.lines[1]);

export function gradeDefects(input: unknown, expectation: DefectExpectation): DefectGradeResult {
  const validated = validateDefects(expectation);
  const findings = parseFindings(input);
  const labels = validated.defects.map((defect, index) => defect.id ?? String(index + 1));
  if (!findings)
    return {
      passed: false,
      found: [],
      missed: labels,
      falsePositives: 0,
      failures: ['malformed-findings'],
    };
  const found: string[] = [];
  const missed: string[] = [];
  validated.defects.forEach((defect, index) => {
    const label = labels[index];
    if (findings.some((finding) => matchesDefect(finding, defect))) found.push(label);
    else missed.push(label);
  });
  const falsePositives = findings.filter(
    (finding) => !validated.defects.some((defect) => matchesDefect(finding, defect)),
  ).length;
  const maxFp = validated.maxFalsePositives ?? 0;
  const failures = [
    ...missed.map((label) => 'missed:' + label),
    ...(falsePositives > maxFp ? [`false-positives:${falsePositives}>${maxFp}`] : []),
  ];
  return {
    passed: failures.length === 0,
    found,
    missed,
    falsePositives,
    failures,
  };
}
