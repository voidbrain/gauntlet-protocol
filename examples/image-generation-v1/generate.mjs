// Batch image generation for a phased campaign (memory plan in docs/decisions/image-generation.md):
//   node examples/image-generation-v1/generate.mjs --profile=FILE --cases=ID[,ID...] --confirm-costly
//     [--repeat=N] [--tasks=DIR] [--out=DIR] [--ollama=URL] [--unload-ollama] [--timeout-ms=N] [--poll-ms=N]
// Checks Ollama holds no model once, generates every case and repeat with the committed workflow, then frees ComfyUI
// once (POST /free), so the judge can load next. Images and their records go outside the repository (default
// ~/gauntlet-image-runs); the manifest path is printed on stdout. Real generation is costly: it needs --confirm-costly.
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
  workflowSha256,
} from './comfy.mjs';

const flags = process.argv.slice(2);
const flag = (name) => flags.find((item) => item.startsWith(`--${name}=`))?.slice(name.length + 3);
const fail = (message, code = 1) => {
  process.stderr.write(message + '\n');
  process.exit(code);
};
if (!flags.includes('--confirm-costly'))
  fail('Image generation loads about 17 GB of weights and runs for minutes: pass --confirm-costly to run it', 2);
const repeat = Number(flag('repeat') ?? 1);
if (!Number.isSafeInteger(repeat) || repeat < 1 || repeat > 10) fail('--repeat must be 1 to 10', 2);
if (!flag('profile') || !flag('cases')) fail('Pass --profile=FILE and --cases=ID[,ID...]', 2);

const started = new Date();
const profile = JSON.parse(readFileSync(flag('profile'), 'utf8'));
const tasks = flag('cases')
  .split(',')
  .map((id) => readImageTask(flag('tasks') ?? defaultTasks, id));
const images = outsideRepository(flag('out') ?? join(homedir(), 'gauntlet-image-runs'));
const comfy = comfyClient(profile.endpoint);
const results = [];
let identity;
try {
  await checkOllama(flag('ollama') ?? defaultOllama, { unload: flags.includes('--unload-ollama') });
  identity = await comfy.identity();
  await comfy.checkModels();
} catch (error) {
  fail(String(error?.message ?? error));
}
try {
  for (const task of tasks)
    for (let iteration = 1; iteration <= repeat; iteration++) {
      const generated = await comfy.generate(task, {
        timeoutMs: Number(flag('timeout-ms') ?? 600000),
        pollMs: Number(flag('poll-ms') ?? 500),
      });
      const record = store(images, task, generated, identity, iteration);
      process.stderr.write(`${task.id} #${iteration}: ${generated.durationMs} ms, ${record.image}\n`);
      results.push(record);
    }
} catch (error) {
  process.exitCode = 1;
  process.stderr.write(String(error?.message ?? error) + '\n');
} finally {
  await comfy.free().catch((error) => process.stderr.write('ComfyUI /free failed: ' + error.message + '\n'));
}
const manifest = join(images, 'manifest-' + started.toISOString().replace(/[:.]/g, '-') + '.json');
writeFileSync(
  manifest,
  JSON.stringify(
    {
      schemaVersion: 1,
      profile: profile.id,
      started: started.toISOString(),
      finished: new Date().toISOString(),
      runtime: identity.runtime,
      device: identity.device,
      modelDigest: modelDigest(),
      workflowSha256,
      complete: results.length === tasks.length * repeat,
      results,
    },
    null,
    2,
  ) + '\n',
);
process.stdout.write(manifest + '\n');
