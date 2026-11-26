// Reference runner for image-generation cases, registered as `image-generation-reference`:
//   node examples/image-generation-v1/runner.mjs {report} {configuration} {budget} {case}
//     [--tasks=DIR] [--out=DIR] [--ollama=URL] [--unload-ollama] [--poll-ms=N]
// One case per call: refuse while Ollama holds a model (or unload it with --unload-ollama), check ComfyUI and the three
// pinned models, generate with the committed workflow at the case's seed and size, free ComfyUI (POST /free), store the
// image and its record outside the repository (default ~/gauntlet-image-runs), then grade it (grade.mjs: structural
// checks, then the pinned judge's checklist, the judge unloaded by its request) and add the grade to the record. A
// stopped ComfyUI or Ollama, a missing model, a failed or slow generation and an unreadable judge answer are an `error`
// result naming the cause on stderr. For a phased campaign (every case, then one /free, then judge.mjs), use
// generate.mjs.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  checkOllama,
  comfyClient,
  defaultOllama,
  defaultTasks,
  modelDigest,
  outsideRepository,
  readImageTask,
  store,
  taskFixtureHash,
} from './comfy.mjs';
import { gradeImages, judgeSpec } from './grade.mjs';

const [out, configurationFile, budgetFile, caseFile, ...flags] = process.argv.slice(2);
const flag = (name) => flags.find((item) => item.startsWith(`--${name}=`))?.slice(name.length + 3);
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const started = Date.now();
const profile = JSON.parse(readFileSync(configurationFile, 'utf8'));
const budget = JSON.parse(readFileSync(budgetFile, 'utf8'));
const current = JSON.parse(readFileSync(caseFile, 'utf8'));

const report = (fields) =>
  writeFileSync(
    out,
    JSON.stringify({
      schemaVersion: 1,
      layer: 'model',
      caseHash: hash(current),
      configurationHash: hash(profile),
      sourceStable: true,
      ...fields,
    }),
  );

try {
  const task = readImageTask(flag('tasks') ?? defaultTasks, String(current.id));
  const images = outsideRepository(flag('out') ?? join(homedir(), 'gauntlet-image-runs'));
  const comfy = comfyClient(profile.endpoint);
  const ollama = flag('ollama') ?? defaultOllama;
  await checkOllama(ollama, { unload: flags.includes('--unload-ollama') });
  const identity = await comfy.identity();
  await comfy.checkModels();
  let generated;
  try {
    generated = await comfy.generate(task, {
      timeoutMs: Math.max(1000, budget.timeoutMs - (Date.now() - started) - 5000),
      pollMs: Number(flag('poll-ms') ?? 500),
    });
  } finally {
    await comfy.free();
  }
  const record = store(images, task, generated, identity);
  const judged = await gradeImages([{ task, bytes: generated.bytes }], {
    endpoint: ollama,
    timeoutMs: Math.max(1000, budget.timeoutMs - (Date.now() - started) - 2000),
  });
  const grade = { ...judged.results[0], judge: judged.identity };
  writeFileSync(record.image.replace(/\.png$/, '.json'), JSON.stringify({ ...record, grade }, null, 2) + '\n');
  process.stderr.write(
    `${task.id}: ${grade.status} in ${generated.durationMs} ms` +
      (grade.mismatches.length ? ', judge disagrees on ' + grade.mismatches.join(', ') : '') +
      (grade.reason ? ', ' + grade.reason : '') +
      `, ${record.image}\n`,
  );
  report({
    fixtureHash: hash({ task: taskFixtureHash(task), judge: judgeSpec }),
    modelDigest: modelDigest(),
    runtimeIdentity:
      identity.runtime +
      '+image-generation-reference-v1+judge-' +
      judgeSpec.model +
      '@' +
      judgeSpec.digest.slice(0, 12) +
      '+ollama-' +
      judged.identity.ollama,
    complete: grade.status !== 'error',
    outputTokens: 0,
    results: [{ id: task.id, status: grade.status, checks: grade.checks }],
  });
} catch (error) {
  process.stderr.write(String(error?.message ?? error) + '\n');
  report({ complete: false, results: [{ id: String(current.id), status: 'error', checks: 0 }] });
}
