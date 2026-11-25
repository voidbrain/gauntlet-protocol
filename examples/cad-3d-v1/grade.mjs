// Deterministic OpenSCAD build-and-measure grader for the cad-3d-v1 pack (F-019-T02).
// The candidate OpenSCAD source (model.scad) is rendered to an ASCII STL inside the coding runner's container sandbox
// (`openscad -q -o - --export-format asciistl model.scad`), with no expected dimensions or grader code inside the
// workspace. This grader, outside the container, parses the STL triangles and computes the bounding-box extents
// (sizeX, sizeY, sizeZ) and signed mesh volume. A candidate passes only when all four measured quantities lie within
// the task's tolerance. Because volume is checked alongside the three bounding-box dimensions, a plain solid bounding
// box cube([sizeX, sizeY, sizeZ]) cannot game hollow, stepped or L-shaped tasks.
import { createHash } from 'node:crypto';
import {
  chmodSync,
  lstatSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dimensionKeys = ['sizeX', 'sizeY', 'sizeZ', 'volume'];
const openscadArgv = ['openscad', '-q', '-o', '-', '--export-format', 'asciistl', 'model.scad'];
const maxStlBytes = 2_000_000;

const plain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const only = (value, keys) => plain(value) && Object.keys(value).every((key) => keys.includes(key));
const validBound = (bound) =>
  only(bound, ['target', 'tolerance']) &&
  typeof bound.target === 'number' &&
  Number.isFinite(bound.target) &&
  bound.target > 0 &&
  typeof bound.tolerance === 'number' &&
  Number.isFinite(bound.tolerance) &&
  bound.tolerance > 0;

export function readOpenScadTask(taskDir) {
  const task = JSON.parse(readFileSync(join(taskDir, 'task.json'), 'utf8'));
  if (
    !only(task, ['schemaVersion', 'entry', 'prompt', 'expected']) ||
    task.schemaVersion !== 1 ||
    task.entry !== 'model.scad' ||
    typeof task.prompt !== 'string' ||
    !task.prompt ||
    !only(task.expected, dimensionKeys) ||
    !dimensionKeys.every((key) => validBound(task.expected[key]))
  )
    throw Error('Invalid OpenSCAD task');
  return task;
}

export function taskHash(taskDir) {
  readOpenScadTask(taskDir);
  const digest = createHash('sha256');
  for (const name of ['task.json', 'starter.scad'])
    digest.update(name + '\0' + readFileSync(join(taskDir, name), 'utf8') + '\0');
  return digest.digest('hex');
}

// Removes comments and string literal contents so directive checks inspect code only.
export function stripScadCommentsAndStrings(source) {
  let code = '';
  for (let i = 0; i < source.length;) {
    const two = source.slice(i, i + 2);
    if (two === '//') {
      while (i < source.length && source[i] !== '\n') i++;
    } else if (two === '/*') {
      const end = source.indexOf('*/', i + 2);
      const stop = end < 0 ? source.length : end + 2;
      code += source.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
    } else if (source[i] === '"') {
      i++;
      while (i < source.length && source[i] !== '"' && source[i] !== '\n') {
        if (source[i] === '\\' && i + 1 < source.length) i++;
        i++;
      }
      i++;
      code += '""';
    } else code += source[i++];
  }
  return code;
}

// Candidates are self-contained parametric models: refuse external file includes/imports.
export function hasUnsafeDirective(source) {
  const code = stripScadCommentsAndStrings(source);
  return /\b(include|use)\s*<[^>]*>|\b(import|surface)\s*\(/.test(code);
}

// Parses an ASCII STL and returns { triangles, sizeX, sizeY, sizeZ, volume } or null if malformed/empty.
export function measureAsciiStl(stl) {
  if (typeof stl !== 'string' || !stl.length || Buffer.byteLength(stl) > maxStlBytes) return null;
  const trimmed = stl.trim();
  if (!/^solid\b/.test(trimmed) || !/\bendsolid\b[^\n]*$/.test(trimmed)) return null;
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;
  let signedVolume6 = 0;
  let triangles = 0;
  const vertices = [];
  for (const raw of trimmed.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('solid') || line.startsWith('endsolid')) continue;
    if (line.startsWith('facet normal ') || line === 'outer loop' || line === 'endloop' || line === 'endfacet')
      continue;
    const match = /^vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)$/.exec(line);
    if (!match) return null;
    const x = Number(match[1]);
    const y = Number(match[2]);
    const z = Number(match[3]);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
    vertices.push([x, y, z]);
    if (vertices.length === 3) {
      const [a, b, c] = vertices.splice(0, 3);
      signedVolume6 +=
        a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
      triangles++;
    }
  }
  if (triangles < 4 || vertices.length !== 0) return null;
  const sizeX = maxX - minX;
  const sizeY = maxY - minY;
  const sizeZ = maxZ - minZ;
  const volume = Math.abs(signedVolume6) / 6;
  if (!(sizeX > 0 && sizeY > 0 && sizeZ > 0 && volume > 0)) return null;
  return { triangles, sizeX, sizeY, sizeZ, volume };
}

function unlock(path) {
  try {
    if (!lstatSync(path).isDirectory()) return;
    chmodSync(path, 0o700);
    for (const name of readdirSync(path)) unlock(join(path, name));
  } catch {}
}

function removeWorkspace(workspace) {
  try {
    unlock(workspace);
    rmSync(workspace, { recursive: true, force: true, maxRetries: 3 });
  } catch {}
}

// An executor that rejects (engine missing or its client failing to start) is an infrastructure fault: an `error`
// result that never counts as covering the case.
const executorError = (error, checks) => ({
  status: 'error',
  reason: 'executor-error',
  failedChecks: [],
  message: String(error?.message ?? error),
  checks,
  passed: 0,
  measured: null,
});

export async function gradeOpenScad({ taskDir, candidate, execute, timeoutMs = 30000 }) {
  if (typeof candidate !== 'string' || typeof execute !== 'function')
    throw Error('Candidate OpenSCAD source and executor required');
  const task = readOpenScadTask(taskDir);
  const checks = dimensionKeys.length;
  if (!candidate.trim() || hasUnsafeDirective(candidate))
    return {
      status: 'failed',
      reason: hasUnsafeDirective(candidate) ? 'unsafe-directive' : 'build-error',
      failedChecks: hasUnsafeDirective(candidate) ? ['unsafe-directive'] : ['build'],
      checks,
      passed: 0,
      measured: null,
    };
  const workspace = mkdtempSync(join(realpathSync(tmpdir()), 'gauntlet-openscad-'));
  let timer;
  let cleanupDeferred = false;
  try {
    writeFileSync(join(workspace, task.entry), candidate);
    try {
      await execute.prepare?.(openscadArgv);
    } catch (error) {
      return executorError(error, checks);
    }
    const deadline = new Promise((resolve) => {
      timer = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
    });
    const executing = Promise.resolve().then(() => execute({ argv: openscadArgv, cwd: workspace, env: {}, timeoutMs }));
    let outcome;
    try {
      outcome = await Promise.race([executing, deadline]);
    } catch (error) {
      return executorError(error, checks);
    }
    if (outcome?.timedOut) {
      cleanupDeferred = true;
      const cleanup = () => removeWorkspace(workspace);
      executing.then(cleanup, cleanup);
      return {
        status: 'failed',
        reason: 'timeout',
        failedChecks: ['timeout'],
        checks,
        passed: 0,
        measured: null,
      };
    }
    const measured = outcome?.code === 0 ? measureAsciiStl(String(outcome.stdout ?? '')) : null;
    if (!measured)
      return {
        status: 'failed',
        reason: 'build-error',
        failedChecks: ['build'],
        checks,
        passed: 0,
        measured: null,
      };
    const failedChecks = dimensionKeys.filter((key) => {
      const { target, tolerance } = task.expected[key];
      return Math.abs(measured[key] - target) > tolerance + 1e-9;
    });
    return {
      status: failedChecks.length === 0 ? 'passed' : 'failed',
      reason: failedChecks.length === 0 ? 'all-passed' : 'dimension-mismatch',
      failedChecks,
      checks,
      passed: checks - failedChecks.length,
      measured,
    };
  } finally {
    clearTimeout(timer);
    if (!cleanupDeferred) removeWorkspace(workspace);
  }
}
