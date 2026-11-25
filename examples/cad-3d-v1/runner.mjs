// Reference runner for the cad-3d-v1 OpenSCAD coding tasks, registered as `cad-3d-reference`:
//   node examples/cad-3d-v1/runner.mjs {report} {configuration} {budget} {case} [--openscad=PATH] [--docker=PATH]
// It asks the profile's local Ollama model for the complete `model.scad` (prompt and starter only; the model never
// sees the expected bounding-box or volume checks), then renders and measures the STL inside one throwaway container
// per case (`container-executor.mjs` with the pinned `openscad/openscad:2021.01` image), or with a stand-in script
// when `--openscad=PATH` is passed by contract tests. A missing container engine or image (or stand-in) is reported
// as an `error` result naming the fix, before the model is asked.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { containerExecutor, images, stopAll } from '../coding-v1/container-executor.mjs';
import { askCandidate } from '../coding-v1/ollama-candidate.mjs';
import { gradeOpenScad, readOpenScadTask, taskHash } from './grade.mjs';

const [out, configurationFile, budgetFile, caseFile, ...flags] = process.argv.slice(2);
const flag = (name) => flags.find((item) => item.startsWith(`--${name}=`))?.slice(name.length + 3);
const openscadFlag = flag('openscad');
const docker = flag('docker') ?? 'docker';
const here = dirname(fileURLToPath(import.meta.url));
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const started = Date.now();

function standInExecutor(scriptPath) {
  return async ({ argv, cwd, timeoutMs = 5000 }) => {
    try {
      const stdout = execFileSync(process.execPath, [scriptPath, ...argv.slice(1)], {
        cwd,
        encoding: 'utf8',
        timeout: timeoutMs,
      });
      return { code: 0, stdout, timedOut: false };
    } catch (err) {
      return { code: err?.status ?? 1, stdout: String(err?.stdout ?? ''), timedOut: false };
    }
  };
}

for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    void stopAll().finally(() => process.exit(1));
  });

const profile = JSON.parse(readFileSync(configurationFile, 'utf8'));
const budget = JSON.parse(readFileSync(budgetFile, 'utf8'));
const current = JSON.parse(readFileSync(caseFile, 'utf8'));
if (!/^[a-z0-9-]+$/.test(current.id) || !current.requirements?.includes('coding-sandbox'))
  throw Error('Not a cad-3d-v1 OpenSCAD case');
const taskDir = join(here, 'tasks', current.id);
const task = readOpenScadTask(taskDir);
const starter = readFileSync(join(taskDir, 'starter.scad'), 'utf8');

const report = (fields) =>
  writeFileSync(
    out,
    JSON.stringify({
      schemaVersion: 1,
      layer: 'coding',
      caseHash: hash(current),
      fixtureHash: taskHash(taskDir),
      configurationHash: hash(profile),
      sourceStable: true,
      ...fields,
    }),
  );

// Check the toolchain before the model is asked, so a missing engine costs no generation.
const execute = openscadFlag ? standInExecutor(openscadFlag) : containerExecutor({ docker });
try {
  if (openscadFlag && !existsSync(openscadFlag)) throw Error('OpenSCAD stand-in not found: ' + openscadFlag);
  await execute.prepare?.(['openscad']);
} catch (error) {
  const message = String(error?.message ?? error);
  process.stderr.write(
    (message.startsWith('container engine') || message.startsWith('OpenSCAD stand-in')
      ? message
      : 'OpenSCAD image unavailable: run `docker pull ' + images.openscad + '` while online') + '\n',
  );
  report({ complete: false, results: [{ id: current.id, status: 'error', checks: 0 }] });
  process.exit(0);
}

const asked = await askCandidate({
  profile,
  budget,
  started,
  prompt:
    task.prompt +
    '\n\nThe current ' +
    task.entry +
    ' is:\n\n```\n' +
    starter +
    '```\n\nReply with the complete ' +
    task.entry +
    ' in one fenced code block.',
});

let status;
let checks;
if (asked.truncated) {
  status = 'failed';
  checks = 4;
} else {
  const timeoutMs = Math.max(1000, Math.min(30000, budget.timeoutMs - (Date.now() - started) - 10000));
  const graded = await gradeOpenScad({ taskDir, candidate: asked.candidate, execute, timeoutMs });
  status = graded.status;
  checks = graded.checks;
}

report({
  modelDigest: asked.modelDigest,
  runtimeIdentity: 'ollama-' + asked.ollamaVersion + '+cad-3d-reference-v1',
  complete: true,
  outputTokens: asked.outputTokens,
  results: [{ id: current.id, status, checks }],
});
