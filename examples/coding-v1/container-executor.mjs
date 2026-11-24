// Container boundary for the coding-v1 grader (owner decision 2026-11-24: one throwaway container per case).
// Each call runs one command in a fresh container from a pinned image: no network, read-only root and read-only
// workspace, a small no-exec /tmp, all capabilities dropped, no privilege gain, a non-root user, memory, process and
// CPU limits, no engine log. Only the grader's temporary workspace is mounted (read-only, at /work): never the
// repository, the task directory or the grader. The candidate's results come back on stdout, capped.
// Three layers stop a container: an init process plus `timeout -s KILL` inside the container (it dies on its own
// even if the runner is SIGKILLed), the host-side timer that removes it, and a sweep of labelled containers whose
// deadline has passed, run before every case. Without a reachable engine it refuses; it never runs code on the host.
import { execFile, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { sep } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

export const images = {
  python3: 'python:3.12-alpine@sha256:c5ba3deef00c7758561a0f03c26f44f10589263d40e732b8748e0d1f38f6dd89',
  node: 'node:24-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5',
};
export const defaultLimits = { memory: '256m', pids: 64, cpus: '1', tmpfs: '16m' };
export const label = 'gauntlet.coding';
const deadlineLabel = label + '.deadline';
const maxStdoutBytes = 2_000_000;

const active = new Set();

// Removes every container this process started; the runner calls it on SIGTERM and SIGINT.
export async function stopAll(docker = 'docker') {
  await Promise.all([...active].map((name) => remove(docker, name)));
}

async function remove(docker, name) {
  try {
    await exec(docker, ['rm', '-f', name], { timeout: 30000 });
  } catch {}
  active.delete(name);
}

// Removes labelled containers whose deadline has passed, such as those of a runner that was killed.
export async function sweepStale(docker = 'docker', now = Date.now()) {
  const { stdout } = await exec(
    docker,
    ['ps', '-a', '--filter', 'label=' + label, '--format', '{{.ID}} {{.Label "' + deadlineLabel + '"}}'],
    { timeout: 30000 },
  );
  const stale = stdout
    .split('\n')
    .map((line) => line.trim().split(' '))
    .filter(([id, deadline]) => id && !(Number(deadline) > now))
    .map(([id]) => id);
  if (stale.length) await exec(docker, ['rm', '-f', ...stale], { timeout: 30000 }).catch(() => {});
}

export function containerExecutor({ docker = 'docker', limits = defaultLimits } = {}) {
  const ready = new Map();
  const imageFor = (argv) => {
    if (!Object.hasOwn(images, argv[0])) throw Error('No pinned image for ' + argv[0]);
    return images[argv[0]];
  };
  // Engine check, image pull and sweep: the grader awaits this before the case's time starts.
  const prepare = async (argv) => {
    const image = imageFor(argv);
    if (!ready.has(image))
      ready.set(
        image,
        (async () => {
          try {
            await exec(docker, ['version', '--format', '{{.Server.Version}}'], { timeout: 15000 });
          } catch {
            throw Error('container engine unavailable: start Docker Desktop or colima');
          }
          try {
            await exec(docker, ['image', 'inspect', image], { timeout: 15000 });
          } catch {
            await exec(docker, ['pull', '-q', image], { timeout: 600000 });
          }
        })(),
      );
    try {
      await ready.get(image);
    } catch (error) {
      ready.delete(image);
      throw error;
    }
    await sweepStale(docker);
  };
  async function execute({ argv, cwd, env = {}, timeoutMs }) {
    const image = imageFor(argv);
    const workspace = realpathSync(cwd);
    if (!workspace.startsWith(realpathSync(tmpdir()) + sep) || /[,"=\n]/.test(workspace))
      throw Error('Only a plain temporary workspace can be mounted');
    await prepare(argv);
    const name = 'gauntlet-coding-' + randomBytes(8).toString('hex');
    const user = typeof process.getuid === 'function' ? process.getuid() + ':' + process.getgid() : '65534:65534';
    const seconds = Math.max(1, Math.ceil(timeoutMs / 1000));
    // Kernel-enforced CPU time: a candidate can neither kill nor raise it.
    const cpuSeconds = Math.min(seconds, limits.cpuSeconds ?? seconds);
    const args = [
      'run',
      '--rm',
      '--init',
      '--name',
      name,
      '--label',
      label + '=1',
      '--label',
      deadlineLabel + '=' + (Date.now() + (seconds + 30) * 1000),
      '--log-driver',
      'none',
      '--network',
      'none',
      '--read-only',
      '--tmpfs',
      '/tmp:rw,noexec,nosuid,size=' + limits.tmpfs,
      '--memory',
      limits.memory,
      '--memory-swap',
      limits.memory,
      '--pids-limit',
      String(limits.pids),
      '--cpus',
      limits.cpus,
      '--ulimit',
      'cpu=' + cpuSeconds + ':' + cpuSeconds,
      '--cap-drop',
      'ALL',
      '--security-opt',
      'no-new-privileges',
      '--user',
      user,
      '--env',
      'HOME=/tmp',
      ...Object.entries(env).flatMap(([key, value]) => ['--env', key + '=' + value]),
      '--mount',
      'type=bind,src=' + workspace + ',dst=/work,readonly',
      '--workdir',
      '/work',
      image,
      'timeout',
      '-s',
      'KILL',
      String(seconds),
      ...argv,
    ];
    active.add(name);
    const child = spawn(docker, args, { stdio: ['ignore', 'pipe', 'ignore'] });
    let stdout = '';
    let bytes = 0;
    child.stdout.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes <= maxStdoutBytes) stdout += chunk;
    });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      void remove(docker, name);
    }, timeoutMs);
    const code = await new Promise((resolve) => {
      child.on('error', () => resolve(null));
      child.on('close', resolve);
    });
    clearTimeout(timer);
    // The client exiting does not prove the container stopped: remove it before resolving.
    await remove(docker, name);
    return { code, timedOut, stdout: bytes <= maxStdoutBytes ? stdout : '' };
  }
  execute.prepare = prepare;
  return execute;
}
