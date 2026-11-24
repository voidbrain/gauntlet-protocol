// Runs inside the candidate's sandbox. It holds no reference answers: it calls the candidate's function on each input
// from inputs.json and prints what came back (or the error thrown) as the last stdout line. Everything here is
// candidate-controlled once the candidate is imported; the grader outside compares the results.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(readFileSync(join(here, 'inputs.json'), 'utf8'));
const failure = (error) => {
  const kinds = [];
  for (
    let proto = Object.getPrototypeOf(Object(error));
    proto && proto !== Object.prototype;
    proto = Object.getPrototypeOf(proto)
  )
    kinds.push(String(proto.constructor?.name ?? ''));
  return { error: kinds, message: String(error?.message ?? error).slice(0, 200) };
};
let fn;
let loaded;
try {
  fn = (await import('./solution.ts'))[spec.function];
  if (typeof fn !== 'function') throw new TypeError('missing function ' + spec.function);
} catch (error) {
  loaded = failure(error);
}
const results = spec.inputs.map((args) => {
  if (loaded) return loaded;
  try {
    const value = fn(...args);
    if (value !== undefined) JSON.stringify(value);
    return { ok: value ?? null };
  } catch (error) {
    return failure(error);
  }
});
process.stdout.write('\nGAUNTLET-RESULTS ' + JSON.stringify(results) + '\n');
