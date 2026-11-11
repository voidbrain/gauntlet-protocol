import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
export function engineIdentity(): string {
  const extension = import.meta.url.endsWith('.ts') ? 'ts' : 'js';
  const digest = createHash('sha256');
  for (const name of ['index', 'catalog', 'evidence', 'runtimes', 'telemetry', 'environments', 'failures', 'engine'])
    digest.update(name).update(readFileSync(new URL('./' + name + '.' + extension, import.meta.url)));
  return digest.digest('hex');
}
