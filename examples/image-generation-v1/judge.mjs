// Judge phase of a phased campaign (memory plan in docs/decisions/image-generation.md, step 4):
//   node examples/image-generation-v1/judge.mjs --confirm-costly CASE=IMAGE.png [CASE=IMAGE.png ...]
//     [--manifest=FILE] [--tasks=DIR] [--ollama=URL] [--unload-ollama] [--timeout-ms=N] [--out=FILE]
// Grades each image against its case's task (grade.mjs): structural checks for all, then the pinned judge for those that
// pass, the last request unloading it. Images come as CASE=PATH pairs and from a generate.mjs manifest. Ollama must
// hold no model when it starts (or pass --unload-ollama); free ComfyUI first (generate.mjs does). Writes the verdicts as
// JSON to --out or stdout; exits 1 when any image is an error. Loading the judge is costly: it needs --confirm-costly.
import { readFileSync, writeFileSync } from 'node:fs';
import { checkOllama, defaultOllama, defaultTasks, readImageTask } from './comfy.mjs';
import { gradeImages, judgePrompt } from './grade.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.find((item) => item.startsWith(`--${name}=`))?.slice(name.length + 3);
const fail = (message, code = 1) => {
  process.stderr.write(message + '\n');
  process.exit(code);
};
if (!args.includes('--confirm-costly'))
  fail('Judging loads the vision judge (about 8 GB) and runs for minutes: pass --confirm-costly to run it', 2);

const started = new Date();
const tasks = flag('tasks') ?? defaultTasks;
const ollama = flag('ollama') ?? defaultOllama;
const pairs = args
  .filter((item) => !item.startsWith('--'))
  .map((item) => {
    const at = item.indexOf('=');
    if (at < 1) fail('Pass images as CASE=PATH, not ' + item, 2);
    return [item.slice(0, at), item.slice(at + 1)];
  });
if (flag('manifest'))
  for (const result of JSON.parse(readFileSync(flag('manifest'), 'utf8')).results ?? [])
    pairs.push([String(result.case), String(result.image)]);
if (!pairs.length) fail('Pass CASE=PATH images or --manifest=FILE', 2);

let items;
try {
  items = pairs.map(([id, image]) => ({ task: readImageTask(tasks, id), bytes: readFileSync(image), image }));
  await checkOllama(ollama, { unload: args.includes('--unload-ollama') });
} catch (error) {
  fail(String(error?.message ?? error));
}
let graded;
try {
  graded = await gradeImages(items, { endpoint: ollama, timeoutMs: Number(flag('timeout-ms') ?? 300000) });
} catch (error) {
  fail(String(error?.message ?? error));
}
const results = graded.results.map((result, i) => ({ ...result, image: items[i].image }));
for (const result of results)
  process.stderr.write(
    `${result.case}: ${result.status}` +
      (result.judgeMs !== undefined ? ` (judge ${result.judgeMs} ms)` : '') +
      (result.mismatches.length ? ', judge disagrees on ' + result.mismatches.join(', ') : '') +
      (result.reason ? ', ' + result.reason : '') +
      ` ${result.image}\n`,
  );
const report = {
  schemaVersion: 1,
  started: started.toISOString(),
  finished: new Date().toISOString(),
  durationMs: Date.now() - started.getTime(),
  judge: graded.identity,
  prompts: Object.fromEntries(items.map((item) => [item.task.id, judgePrompt(item.task)])),
  results,
};
const text = JSON.stringify(report, null, 2) + '\n';
if (flag('out')) writeFileSync(flag('out'), text);
else process.stdout.write(text);
if (results.some((result) => result.status === 'error')) process.exitCode = 1;
