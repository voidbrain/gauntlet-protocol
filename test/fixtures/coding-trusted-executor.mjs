// Runs the coding-v1 grader's command for TRUSTED fixture candidates only (committed reference and wrong
// solutions). It bounds time and output and kills the whole process group, but it is supervision, not a sandbox:
// never pass it model-written code.
import { spawn } from 'node:child_process';

export async function trustedExecutor({ argv, cwd, env, timeoutMs }) {
  const [command, ...args] = argv;
  const child = spawn(command === 'node' ? process.execPath : command, args, {
    cwd,
    env: { PATH: process.env.PATH ?? '', HOME: cwd, TMPDIR: cwd, ...env },
    detached: true,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  let stdout = '';
  let timedOut = false;
  child.stdout.on('data', (chunk) => {
    if (stdout.length < 1_000_000) stdout += chunk;
  });
  const kill = () => {
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch {}
  };
  const timer = setTimeout(() => {
    timedOut = true;
    kill();
  }, timeoutMs);
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  }).finally(() => {
    clearTimeout(timer);
    kill();
  });
  return { code, stdout, timedOut };
}
