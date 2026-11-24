// Container boundary for the coding-v1 grader (owner decision 2026-11-24: one throwaway container per case).
// Each call runs one command in a fresh container from a pinned image with no network, a read-only root, all
// capabilities dropped, no privilege gain, a non-root user and memory, process and CPU limits. Only the grader's
// workspace is mounted (at /work): never the repository, the task directory or the grader. The call resolves only
// after the container is gone, also on timeout. Without a reachable engine it refuses; it never falls back to
// running code on the host.
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

export function containerExecutor({ docker = 'docker', limits = defaultLimits } = {}) {
  const ready = new Map();
  const prepare = (image) => {
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
    return ready.get(image);
  };
  return async function execute({ argv, cwd, env = {}, timeoutMs }) {
    const image = images[argv[0]];
    if (!image) throw Error('No pinned image for ' + argv[0]);
    const workspace = realpathSync(cwd);
    if (!workspace.startsWith(realpathSync(tmpdir()) + sep)) throw Error('Only a temporary workspace can be mounted');
    // Pulling and engine checks happen before the case's time starts.
    await prepare(image).catch((error) => {
      ready.delete(image);
      throw error;
    });
    const name = 'gauntlet-coding-' + randomBytes(8).toString('hex');
    const user = typeof process.getuid === 'function' ? process.getuid() + ':' + process.getgid() : '65534:65534';
    const args = [
      'run',
      '--rm',
      '--name',
      name,
      '--label',
      label + '=1',
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
      '--cap-drop',
      'ALL',
      '--security-opt',
      'no-new-privileges',
      '--user',
      user,
      '--env',
      'HOME=/tmp',
      ...Object.entries(env).flatMap(([key, value]) => ['--env', key + '=' + value]),
      '--volume',
      workspace + ':/work:rw',
      '--workdir',
      '/work',
      image,
      ...argv,
    ];
    active.add(name);
    const child = spawn(docker, args, { stdio: 'ignore' });
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
    return { code, timedOut };
  };
}
