// Reference runner for the embedded-v1 pack, registered as `embedded-reference`:
//   node examples/embedded-v1/runner.mjs {report} {configuration} {budget} {case} [--arduino-cli=PATH] [--python=PATH]
// It asks the profile's local Ollama model for the sketch or Python file (prompt and starter only; the model never
// sees the checks), then grades it: a sketch with grade.mjs (static checks and an arduino-cli compile against the
// pinned cores), a Raspberry Pi solution with pi-grade.mjs (byte-compilation and AST checks). Nothing is uploaded,
// imported or run. The registry passes tool paths as fixed arguments, because registered runners get no extra
// environment; without --arduino-cli the grader looks in the Homebrew locations, then PATH. A missing toolchain is
// reported as an `error` result before the model is asked.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { askCandidate } from '../coding-v1/ollama-candidate.mjs';
import { checkToolchain, gradeSketch, readTask, resolveArduinoCli, taskHash } from './grade.mjs';
import { gradePiSolution, piTaskHash, readPiTask } from './pi-grade.mjs';

const [out, configurationFile, budgetFile, caseFile, ...flags] = process.argv.slice(2);
const option = (name) => flags.find((flag) => flag.startsWith(`--${name}=`))?.slice(name.length + 3) || undefined;
if (flags.some((flag) => !/^--(arduino-cli|python)=./.test(flag))) throw Error('Unknown runner option');
const here = dirname(fileURLToPath(import.meta.url));
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const started = Date.now();

const profile = JSON.parse(readFileSync(configurationFile, 'utf8'));
const budget = JSON.parse(readFileSync(budgetFile, 'utf8'));
const current = JSON.parse(readFileSync(caseFile, 'utf8'));
if (!/^[a-z0-9-]+$/.test(current.id)) throw Error('Not an embedded-v1 case');
const sketch = existsSync(join(here, 'tasks', current.id));
const taskDir = join(here, sketch ? 'tasks' : 'pi-tasks', current.id);
if (!existsSync(join(taskDir, 'task.json'))) throw Error('Not an embedded-v1 case');
const task = sketch ? readTask(taskDir) : readPiTask(taskDir);
const file = sketch ? 'sketch.ino' : 'solution.py';
const starter = readFileSync(join(taskDir, sketch ? 'starter.ino' : 'starter.py'), 'utf8');
const cli = option('arduino-cli') ?? resolveArduinoCli();

const report = (fields) =>
  writeFileSync(
    out,
    JSON.stringify({
      schemaVersion: 1,
      layer: 'coding',
      caseHash: hash(current),
      fixtureHash: sketch ? taskHash(taskDir) : piTaskHash(taskDir),
      configurationHash: hash(profile),
      sourceStable: true,
      ...fields,
    }),
  );

if (sketch) {
  const ready = await checkToolchain({ cli });
  if (!ready.ok) {
    process.stderr.write(ready.message + '\n');
    report({ complete: false, results: [{ id: current.id, status: 'error', checks: 0 }] });
    process.exit(0);
  }
}

const asked = await askCandidate({
  profile,
  budget,
  started,
  prompt:
    task.prompt +
    '\n\nThe current ' +
    file +
    ' is:\n\n```\n' +
    starter +
    '```\n\nReply with the complete ' +
    file +
    ' in one fenced code block.',
});

let graded;
if (asked.truncated) graded = { status: 'failed', checks: 1 };
else if (sketch) {
  const timeoutMs = Math.max(1000, Math.min(300000, budget.timeoutMs - (Date.now() - started) - 10000));
  graded = await gradeSketch({ taskDir, candidate: asked.candidate, cli, timeoutMs });
} else graded = await gradePiSolution({ taskDir, candidate: asked.candidate, python: option('python') });
if (graded.status === 'error') process.stderr.write((graded.message ?? graded.reason) + '\n');
report({
  modelDigest: asked.modelDigest,
  runtimeIdentity: 'ollama-' + asked.ollamaVersion + '+embedded-reference-v1',
  complete: graded.status !== 'error',
  outputTokens: asked.outputTokens,
  results: [{ id: current.id, status: graded.status, checks: graded.status === 'error' ? 0 : graded.checks }],
});
