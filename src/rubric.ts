// Deterministic rubric grading for free text (expected kind "rubric"). Every check is a pure function of the
// reply and the rubric: no model, no randomness, no network. Failures are named by check, never by reply text.
export interface Rubric {
  language?: 'it';
  minWords?: number;
  maxWords?: number;
  /** Each group passes when any of its terms appears as whole words. */
  required?: string[][];
  forbidden?: string[];
  register?: 'formal' | 'informal';
  /** The text must contain a question mark. */
  question?: boolean;
}

const italian = new Set(
  (
    'il lo la i gli le un una uno di da con su per tra fra che e è non del dello della dei degli delle al allo alla ai ' +
    'agli alle dal dalla dai nel nella nei nelle sul sulla si sono ma come anche più questo questa questi queste ci ne ' +
    'se perché o ha hanno era essere sua suo loro noi voi'
  ).split(' '),
);
const english = new Set(
  (
    'the a an and of to is are was were be been for with that this these those it not on at by from as or but have has ' +
    'will would you we they he she our your their'
  ).split(' '),
);
// Second-person informal forms; a formal (Lei) text uses none of them.
const informal = new Set('tu ti te tuo tua tuoi tue hai puoi vuoi devi sai fai vai'.split(' '));

const words = (text: string): string[] =>
  text
    .normalize('NFC')
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? [];
const includesTerm = (tokens: string[], term: string): boolean => {
  const wanted = words(term);
  if (!wanted.length) return false;
  for (let index = 0; index + wanted.length <= tokens.length; index++)
    if (wanted.every((word, offset) => tokens[index + offset] === word)) return true;
  return false;
};

const fields = ['language', 'minWords', 'maxWords', 'required', 'forbidden', 'register', 'question'];
const terms = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length <= 64 &&
  value.every((term) => typeof term === 'string' && words(term).length > 0 && term.length <= 200);
const count = (value: unknown): boolean =>
  value === undefined || (Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 100000);

export function validateRubric(input: unknown): Rubric {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid rubric');
  const v = input as Record<string, unknown>;
  if (
    !Object.keys(v).length ||
    Object.keys(v).some((key) => !fields.includes(key)) ||
    (v.language !== undefined && v.language !== 'it') ||
    !count(v.minWords) ||
    !count(v.maxWords) ||
    (v.minWords !== undefined && v.maxWords !== undefined && (v.minWords as number) > (v.maxWords as number)) ||
    (v.required !== undefined &&
      (!Array.isArray(v.required) || !v.required.length || v.required.length > 64 || !v.required.every(terms))) ||
    (v.forbidden !== undefined && !terms(v.forbidden)) ||
    (v.register !== undefined && v.register !== 'formal' && v.register !== 'informal') ||
    (v.question !== undefined && v.question !== true)
  )
    throw Error('Invalid rubric');
  return v as Rubric;
}

export function gradeRubric(text: string, rubric: Rubric): { passed: boolean; failures: string[] } {
  const tokens = words(text);
  const failures: string[] = [];
  if (rubric.language === 'it') {
    const it = tokens.filter((word) => italian.has(word)).length;
    const en = tokens.filter((word) => english.has(word)).length;
    if (it + en < 3 || it / (it + en) < 0.8) failures.push('language');
  }
  if (rubric.minWords !== undefined && tokens.length < rubric.minWords) failures.push('min-words');
  if (rubric.maxWords !== undefined && tokens.length > rubric.maxWords) failures.push('max-words');
  rubric.required?.forEach((group, index) => {
    if (!group.some((term) => includesTerm(tokens, term))) failures.push('required:' + (index + 1));
  });
  for (const term of rubric.forbidden ?? []) if (includesTerm(tokens, term)) failures.push('forbidden:' + term);
  if (rubric.register) {
    const casual = tokens.some((word) => informal.has(word));
    if (casual !== (rubric.register === 'informal')) failures.push('register');
  }
  if (rubric.question && !text.includes('?')) failures.push('question');
  return { passed: failures.length === 0, failures };
}

/** Expectation of kind "json-rubric": exact JSON fields plus one free-text field graded by a rubric. */
export interface JsonRubric {
  exact: Record<string, string | number | boolean | null>;
  field: string;
  rubric: Rubric;
}

const scalar = (value: unknown): boolean => value === null || ['string', 'number', 'boolean'].includes(typeof value);

export function validateJsonRubric(input: unknown): JsonRubric {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid json rubric');
  const v = input as Record<string, unknown>;
  const exact = v.exact as Record<string, unknown>;
  if (
    Object.keys(v).length !== 3 ||
    !exact ||
    typeof exact !== 'object' ||
    Array.isArray(exact) ||
    !Object.keys(exact).length ||
    !Object.values(exact).every(scalar) ||
    typeof v.field !== 'string' ||
    !v.field ||
    Object.hasOwn(exact, v.field)
  )
    throw Error('Invalid json rubric');
  validateRubric(v.rubric);
  return v as unknown as JsonRubric;
}

/** The reply must be an object with exactly the exact keys (equal) and the text field (rubric); no reply text is named. */
export function gradeJsonRubric(observed: unknown, expected: JsonRubric): { passed: boolean; failures: string[] } {
  if (!observed || typeof observed !== 'object' || Array.isArray(observed))
    return { passed: false, failures: ['not-an-object'] };
  const object = observed as Record<string, unknown>;
  const failures: string[] = [];
  const keys = [...Object.keys(expected.exact), expected.field];
  if (Object.keys(object).length !== keys.length || !keys.every((key) => Object.hasOwn(object, key)))
    failures.push('keys');
  for (const [key, value] of Object.entries(expected.exact)) if (object[key] !== value) failures.push('exact:' + key);
  const text = object[expected.field];
  if (typeof text !== 'string') failures.push(expected.field + ':not-text');
  else failures.push(...gradeRubric(text, expected.rubric).failures.map((name) => expected.field + ':' + name));
  return { passed: failures.length === 0, failures };
}
