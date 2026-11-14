import { arch, cpus, platform, totalmem } from 'node:os';
export interface MachineProfile {
  schemaVersion: 1;
  id: string;
  version: string;
  platform: string;
  arch: string;
  cpu: string;
  memoryBytes: number;
  accelerator?: 'cpu' | 'integrated-gpu' | 'discrete-gpu' | 'unified-memory-gpu' | 'other';
}
export interface LoadScenario {
  schemaVersion: 1;
  id: string;
  version: string;
  load: 'baseline' | 'minimal' | 'moderate' | 'heavy';
  description: string;
  workloadCategories: string[];
  power: 'mains' | 'battery' | 'any';
}
/** Describes the local evaluation host. Workload/power are owner declarations, not independently verified measurements. */
export interface ExecutionEnvironment {
  machine: MachineProfile;
  scenario: LoadScenario;
}
const identifier = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,99}$/;
function object(input: unknown, keys: string[]): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Expected environment object');
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some((key) => !keys.includes(key))) throw Error('Unknown environment field');
  return value;
}
function identity(value: Record<string, unknown>): void {
  if (
    value.schemaVersion !== 1 ||
    typeof value.id !== 'string' ||
    !identifier.test(value.id) ||
    typeof value.version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(value.version)
  )
    throw Error('Invalid environment identity');
}
export function validateMachineProfile(input: unknown): MachineProfile {
  const v = object(input, ['schemaVersion', 'id', 'version', 'platform', 'arch', 'cpu', 'memoryBytes', 'accelerator']);
  identity(v);
  if (
    typeof v.platform !== 'string' ||
    !['darwin', 'linux', 'win32', 'freebsd', 'openbsd', 'aix', 'sunos', 'android'].includes(v.platform) ||
    typeof v.arch !== 'string' ||
    !['arm64', 'x64', 'arm', 'ia32', 'ppc64', 's390x', 'riscv64', 'loong64', 'mips', 'mipsel'].includes(v.arch) ||
    typeof v.cpu !== 'string' ||
    !v.cpu.trim() ||
    v.cpu.length > 200 ||
    !Number.isSafeInteger(v.memoryBytes) ||
    (v.memoryBytes as number) < 1 ||
    (v.accelerator !== undefined &&
      !['cpu', 'integrated-gpu', 'discrete-gpu', 'unified-memory-gpu', 'other'].includes(String(v.accelerator)))
  )
    throw Error('Invalid machine profile');
  return v as unknown as MachineProfile;
}
export function validateLoadScenario(input: unknown): LoadScenario {
  const v = object(input, ['schemaVersion', 'id', 'version', 'load', 'description', 'workloadCategories', 'power']);
  identity(v);
  if (
    typeof v.load !== 'string' ||
    !['baseline', 'minimal', 'moderate', 'heavy'].includes(v.load) ||
    typeof v.description !== 'string' ||
    !v.description.trim() ||
    v.description.length > 500 ||
    !Array.isArray(v.workloadCategories) ||
    v.workloadCategories.length > 20 ||
    v.workloadCategories.some((x) => typeof x !== 'string' || !identifier.test(x)) ||
    new Set(v.workloadCategories).size !== v.workloadCategories.length ||
    typeof v.power !== 'string' ||
    !['mains', 'battery', 'any'].includes(v.power)
  )
    throw Error('Invalid load scenario');
  return v as unknown as LoadScenario;
}
export function validateExecutionEnvironment(input: unknown): ExecutionEnvironment {
  const v = object(input, ['machine', 'scenario']);
  validateMachineProfile(v.machine);
  validateLoadScenario(v.scenario);
  return v as unknown as ExecutionEnvironment;
}
/** No hostname, serial number, paths, app titles or credentials. ID/version are explicit owner labels. */
export function inspectMachine(id: string, version = '1.0.0'): MachineProfile {
  return validateMachineProfile({
    schemaVersion: 1,
    id,
    version,
    platform: platform(),
    arch: arch(),
    cpu: cpus()[0]?.model ?? 'unknown',
    memoryBytes: totalmem(),
    accelerator: 'other',
  });
}
export function assertCurrentMachine(machine: MachineProfile): void {
  validateMachineProfile(machine);
  const actual = inspectMachine(machine.id, machine.version);
  if (
    actual.platform !== machine.platform ||
    actual.arch !== machine.arch ||
    actual.cpu !== machine.cpu ||
    actual.memoryBytes !== machine.memoryBytes
  )
    throw Error('Machine profile does not match the current evaluation host');
}
export function admitEnvironment(environment: ExecutionEnvironment | undefined, confirmed: boolean | undefined): void {
  if (confirmed !== undefined && typeof confirmed !== 'boolean') throw Error('Scenario confirmation must be boolean');
  if (!environment) {
    if (confirmed) throw Error('Scenario confirmation needs machine and scenario');
    return;
  }
  validateExecutionEnvironment(environment);
  if (confirmed !== true) throw Error('Execution needs explicit current scenario confirmation');
  assertCurrentMachine(environment.machine);
}
