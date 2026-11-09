import { engineIdentity } from './engine.ts';
import { areas, type Area } from './catalog.ts';
import { inspectRuntime, compatibleBody, validateManifest, ollamaStream, type RuntimeManifest, type RuntimeIdentity } from './runtimes.ts';
import { monitorResources, type Resources } from './telemetry.ts';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, lstatSync, realpathSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
export type Layer = 'system' | 'model' | 'coding' | 'end-to-end';
export type Status = 'passed' | 'failed' | 'error' | 'not-run';
export interface Profile {
    schemaVersion: 1;
    id: string;
    model: string;
    quantization: string;
    endpoint: string;
    context: number;
    maxOutputTokens: number;
    temperature: number | null;
    topP: number | null;
    topK: number | null;
    seed: number | null;
    think: boolean | null;
    parallel: 1 | 2;
    hardware: string;
    cache: string;
    backend?: "ollama" | "llama.cpp" | "mlx-lm";
    residency?: "case" | "suite";
    runtimeManifest?: RuntimeManifest;
}
export interface Case {
    area?: Area;
    requirements?: string[];
    id: string;
    layer: Layer;
    split: 'regression' | 'holdout';
    capabilities: string[];
    critical: boolean;
    expensive: boolean;
    runner?: string;
    messages?: {
        role: 'system' | 'user' | 'assistant';
        content: string;
    }[];
    expected?: {
        kind: 'text' | 'json';
        value: unknown;
    };
}
export interface Pack {
    schemaVersion: 1;
    id: string;
    version: string;
    cases: Case[];
}
export interface Limits {
    caseMs: number;
    suiteMs: number;
    maxCases: number;
    repeat: number;
    outputTokens: number;
    maxBytes: number;
}
export interface Result {
    id: string;
    iteration: number;
    layer: Layer;
    split: Case['split'];
    capabilities: string[];
    critical: boolean;
    status: Status;
    durationMs: number;
    performance?: {
        phase: "cold-model" | "warm-model" | "unknown";
        loadMs: number | null;
        promptMs: number | null;
        generationMs: number | null;
        providerTotalMs: number | null;
        inputTokens: number | null;
        outputTokens: number | null;
        tokensPerSecond: number | null;
        timeToFirstTokenMs: number | null;
    };
    tokens: number | null;
    reason: string | null;
    fixtureHash?: string;
    responseHash?: string;
    adapterHash?: string;
    checks?: number;
}
export interface Report {
    schemaVersion: 1;
    id: string;
    protocolVersion?: string;
    engineHash?: string;
    resources?: Resources;
    identity?: RuntimeIdentity;
    residencyCleanup?: {
        attempted: boolean;
        status: "not-needed" | "released" | "unknown";
    };
    pack: string;
    packVersion: string;
    caseCount: number;
    packHash: string;
    registryHash: string | null;
    profile: Profile | null;
    profileHash: string | null;
    modelDigest: string | null;
    started: string;
    finished: string;
    sourceStable: boolean;
    limits: Limits;
    results: Result[];
    passed: boolean;
    complete: boolean;
    promotion: false;
    usage: {
        outputTokens: number | null;
    };
    runtime: {
        provider: string | null;
        node: string;
        platform: string;
        arch: string;
    };
}
export interface Runner {
    command: string;
    args: string[];
    cwd: string;
    layers: Layer[];
    allowModels: boolean;
}
export interface Registry {
    schemaVersion: 1;
    runners: Record<string, Runner>;
}
export const defaults: Limits = { caseMs: 30000, suiteMs: 300000, maxCases: 30, repeat: 1, outputTokens: 16384, maxBytes: 1048576 };
const id = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,99}$/;
function record(v: unknown): Record<string, unknown> {
    if (!v || typeof v !== 'object' || Array.isArray(v))
        throw Error('Expected object');
    return v as Record<string, unknown>;
}
function fields(v: Record<string, unknown>, allowed: string[]) {
    for (const key of Object.keys(v))
        if (!allowed.includes(key))
            throw Error('Unknown field: ' + key);
}
function integer(v: unknown, min: number, max: number): v is number { return typeof v === 'number' && Number.isSafeInteger(v) && v >= min && v <= max; }
function strings(v: unknown): v is string[] { return Array.isArray(v) && v.length > 0 && v.length <= 64 && v.every(x => typeof x === 'string' && id.test(x)) && new Set(v).size === v.length; }
export function hash(value: unknown): string { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
export function readJSON(path: string): unknown {
    const s = lstatSync(path);
    if (!s.isFile() || s.isSymbolicLink() || s.size > 8 * 1024 * 1024)
        throw Error('Expected bounded regular JSON file');
    return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}
export function evidenceDestination(path: string): string {
    path = resolve(path);
    if (!path.endsWith('.json') || path.split(/[\\/]/).includes('.git'))
        throw Error('Evidence requires new JSON outside git metadata');
    try {
        lstatSync(path);
        throw Error('Evidence output already exists');
    }
    catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
            throw error;
    }
    for (let parent = dirname(path); parent !== dirname(parent); parent = dirname(parent)) {
        try {
            if (lstatSync(parent).isSymbolicLink())
                throw Error('Symlink evidence parent');
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
                throw error;
        }
    }
    return path;
}
export function writeEvidence(path: string, value: unknown) { path = evidenceDestination(path); mkdirSync(dirname(path), { recursive: true, mode: 0o700 }); writeFileSync(path, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 }); }
export function evidenceProfile(profile: Profile): Profile { return profile.runtimeManifest ? { ...profile, runtimeManifest: { ...profile.runtimeManifest, artifacts: profile.runtimeManifest.artifacts.map(a => ({ path: 'artifact:' + a.sha256, sha256: a.sha256 })) } } : profile; }
export function validateProfile(input: unknown): Profile {
    const v = record(input);
    fields(v, ['schemaVersion', 'id', 'model', 'quantization', 'endpoint', 'context', 'maxOutputTokens', 'temperature', 'topP', 'topK', 'seed', 'think', 'parallel', 'hardware', 'cache', 'backend', 'residency', 'runtimeManifest']);
    if (v.schemaVersion !== 1 || typeof v.id !== 'string' || !id.test(v.id) || typeof v.model !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._/:+-]{0,199}$/.test(v.model) || /cloud/i.test(v.model) || typeof v.quantization !== 'string' || !v.quantization || typeof v.hardware !== 'string' || !v.hardware || typeof v.cache !== 'string' || !v.cache)
        throw Error('Invalid profile identity');
    if (v.backend !== undefined && !['ollama', 'llama.cpp', 'mlx-lm'].includes(String(v.backend)) || v.residency !== undefined && !['case', 'suite'].includes(String(v.residency)))
        throw Error('Invalid runtime/residency');
    if (v.runtimeManifest !== undefined)
        validateManifest(v.runtimeManifest);
    if (v.backend && v.backend !== 'ollama' && !v.runtimeManifest)
        throw Error('Alternative runtime needs reviewed local-artifact manifest');
    if (v.backend && v.backend !== 'ollama' && v.residency === 'case')
        throw Error('Alternative server residency is externally managed; case unload unsupported');
    const u = new URL(String(v.endpoint));
    if (!['http:', 'https:'].includes(u.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(u.hostname) || u.username || u.password || u.search || u.hash || u.pathname !== '/')
        throw Error('Model endpoint must be credential-free loopback root');
    if (!integer(v.context, 1024, 1048576) || !integer(v.maxOutputTokens, 1, 65536) || v.maxOutputTokens >= v.context || v.parallel !== 1 && v.parallel !== 2)
        throw Error('Invalid context/output/concurrency');
    for (const [key, max] of [['temperature', 2], ['topP', 1]] as const)
        if (v[key] !== null && (typeof v[key] !== 'number' || !Number.isFinite(v[key]) || (v[key] as number) < 0 || (v[key] as number) > max))
            throw Error('Invalid sampling option');
    if (v.topK !== null && !integer(v.topK, 0, 1000) || v.seed !== null && !integer(v.seed, 0, 4294967295) || v.think !== null && typeof v.think !== 'boolean')
        throw Error('Invalid sampling/thinking');
    return v as unknown as Profile;
}
export function validatePack(input: unknown): Pack {
    const v = record(input);
    fields(v, ['schemaVersion', 'id', 'version', 'cases']);
    if (v.schemaVersion !== 1 || typeof v.id !== 'string' || !id.test(v.id) || typeof v.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(v.version) || !Array.isArray(v.cases) || !v.cases.length || v.cases.length > 1000)
        throw Error('Invalid pack');
    const seen = new Set<string>();
    for (const entry of v.cases) {
        const c = record(entry);
        fields(c, ['id', 'layer', 'split', 'capabilities', 'critical', 'expensive', 'runner', 'messages', 'expected', 'area', 'requirements']);
        if (typeof c.id !== 'string' || !id.test(c.id) || seen.has(c.id) || !['system', 'model', 'coding', 'end-to-end'].includes(String(c.layer)) || !['regression', 'holdout'].includes(String(c.split)) || !strings(c.capabilities) || typeof c.critical !== 'boolean' || typeof c.expensive !== 'boolean')
            throw Error('Invalid/duplicate case');
        if (c.area !== undefined && !(areas as readonly string[]).includes(String(c.area)) && !(typeof c.area === 'string' && /^x:[a-z0-9-]+:[a-z0-9-]+$/.test(c.area)) || c.requirements !== undefined && !strings(c.requirements))
            throw Error('Invalid case classification');
        seen.add(c.id);
        if (c.runner !== undefined) {
            if (typeof c.runner !== 'string' || !id.test(c.runner) || c.messages !== undefined || c.expected !== undefined)
                throw Error('Runner cases cannot supply commands or model prompts');
        }
        else {
            if (c.layer !== 'model' || !Array.isArray(c.messages) || !c.messages.length || c.messages.length > 64)
                throw Error('Model cases need bounded messages');
            let size = 0;
            for (const input of c.messages) {
                const m = record(input);
                fields(m, ['role', 'content']);
                if (!['system', 'user', 'assistant'].includes(String(m.role)) || typeof m.content !== 'string')
                    throw Error('Invalid message');
                size += Buffer.byteLength(m.content);
            }
            if (size > 262144)
                throw Error('Prompt too large');
            const e = record(c.expected);
            fields(e, ['kind', 'value']);
            if (!['text', 'json'].includes(String(e.kind)) || !Object.hasOwn(e, 'value') || e.kind === 'text' && typeof e.value !== 'string')
                throw Error('Invalid independent expectation');
        }
    }
    return v as unknown as Pack;
}
export function validateLimits(input: unknown): Limits {
    const v = record(input);
    fields(v, Object.keys(defaults));
    for (const [key, min, max] of [['caseMs', 10, 900000], ['suiteMs', 10, 3600000], ['maxCases', 1, 1000], ['repeat', 1, 10], ['outputTokens', 1, 1000000], ['maxBytes', 1024, 8388608]] as const)
        if (!integer(v[key], min, max))
            throw Error('Invalid budget: ' + key);
    return v as unknown as Limits;
}
export function validateRegistry(input: unknown, at: string): Registry {
    const v = record(input);
    fields(v, ['schemaVersion', 'runners']);
    if (v.schemaVersion !== 1)
        throw Error('Invalid runner registry');
    const runners = record(v.runners), out: Record<string, Runner> = {};
    for (const [name, value] of Object.entries(runners)) {
        const x = record(value);
        fields(x, ['command', 'args', 'cwd', 'layers', 'allowModels']);
        if (!id.test(name) || typeof x.command !== 'string' || !x.command || !Array.isArray(x.args) || x.args.length > 64 || x.args.some(a => typeof a !== 'string' || a.length > 4096 || /[{}]/.test(a.replaceAll('{report}', '').replaceAll('{profile}', '').replaceAll('{configuration}', '').replaceAll('{budget}', '').replaceAll('{case}', ''))) || typeof x.cwd !== 'string' || !Array.isArray(x.layers) || !x.layers.length || x.layers.some(l => !['system', 'model', 'coding', 'end-to-end'].includes(String(l))) || typeof x.allowModels !== 'boolean')
            throw Error('Invalid trusted runner');
        const cwd = realpathSync(resolve(at, x.cwd));
        out[name] = { command: x.command, args: x.args as string[], cwd, layers: x.layers as Layer[], allowModels: x.allowModels };
    }
    return { schemaVersion: 1, runners: out };
}
export function plan(pack: Pack, profile: Profile | null, limits: Limits, options: {
    allowModels?: boolean;
    allowExpensive?: boolean;
} = {}) {
    return { pack: pack.id, profile: profile?.id ?? null, limits, modelCallsAuthorized: !!options.allowModels, cases: pack.cases.slice(0, limits.maxCases).map(c => ({ id: c.id, layer: c.layer, runner: c.runner ?? null, eligible: (!c.expensive || !!options.allowExpensive) && (c.layer === 'system' || !!options.allowModels), reason: c.expensive && !options.allowExpensive ? 'Expensive case requires explicit opt-in' : c.layer !== 'system' && !options.allowModels ? 'Model/agent execution requires explicit opt-in' : null })), notSelected: pack.cases.slice(limits.maxCases).map(c => c.id), promotion: false };
}
async function boundedJSON(response: Response, maxBytes: number): Promise<unknown> {
    if (!response.ok)
        throw Error('Adapter HTTP status ' + response.status);
    const reader = response.body?.getReader();
    if (!reader)
        throw Error('Missing response');
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        while (true) {
            const part = await reader.read();
            if (part.done)
                break;
            size += part.value.length;
            if (size > maxBytes)
                throw Error('Adapter output budget exceeded');
            chunks.push(part.value);
        }
    }
    finally {
        await reader.cancel().catch(() => { });
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}
export interface ExternalEvidence {
    runtimeIdentity?: string;
    caseHash?: string;
    fixtureHash?: string;
    schemaVersion: 1;
    layer: Layer;
    sourceStable: boolean;
    complete: boolean;
    results: {
        id: string;
        status: Status;
        checks: number;
    }[];
    configurationHash?: string;
    modelDigest?: string;
    outputTokens?: number;
}
export function validateExternal(input: unknown, layer: Layer): ExternalEvidence {
    const x = record(input);
    fields(x, ['schemaVersion', 'layer', 'sourceStable', 'complete', 'results', 'configurationHash', 'modelDigest', 'outputTokens', 'caseHash', 'fixtureHash', 'runtimeIdentity']);
    if (x.schemaVersion !== 1 || x.layer !== layer || typeof x.sourceStable !== 'boolean' || typeof x.complete !== 'boolean' || !Array.isArray(x.results) || !x.results.length || x.results.length > 10000)
        throw Error('Invalid external evidence');
    if (x.runtimeIdentity !== undefined && (typeof x.runtimeIdentity !== 'string' || !x.runtimeIdentity || x.runtimeIdentity.length > 256))
        throw Error('Invalid adapter runtime identity');
    const seen = new Set();
    for (const y of x.results) {
        const r = record(y);
        fields(r, ['id', 'status', 'checks']);
        if (typeof r.id !== 'string' || !id.test(r.id) || seen.has(r.id) || !['passed', 'failed', 'error', 'not-run'].includes(String(r.status)) || !integer(r.checks, 0, 1000000))
            throw Error('Invalid adapter result');
        seen.add(r.id);
    }
    if (x.outputTokens !== undefined && !integer(x.outputTokens, 0, 1000000))
        throw Error('Invalid token measurement');
    for (const k of ['configurationHash', 'modelDigest', 'caseHash', 'fixtureHash'])
        if (x[k] !== undefined && (typeof x[k] !== 'string' || !/^([a-f0-9]{64}|sha256:[a-f0-9]{64})$/.test(String(x[k]))))
            throw Error('Invalid external provenance');
    return x as unknown as ExternalEvidence;
}
async function external(runner: Runner, profile: Profile | null, layer: Layer, timeout: number, maxBytes: number, tokenBudget: number, currentCase: Case, signal: AbortSignal): Promise<ExternalEvidence> {
    if (process.platform === 'win32')
        throw Error('External execution needs POSIX process groups; Windows adapter supervision unavailable');
    const root = mkdtempSync(join(realpathSync(tmpdir()), 'gauntlet-')), out = join(root, 'evidence.json'), configuration = join(root, 'configuration.json'), budget = join(root, 'budget.json'), caseFile = join(root, 'case.json');
    writeEvidence(caseFile, currentCase);
    writeEvidence(configuration, profile);
    writeEvidence(budget, { timeoutMs: timeout, outputTokens: tokenBudget, maxBytes });
    const args = runner.args.map(a => a.replaceAll('{report}', out).replaceAll('{profile}', profile?.id ?? '').replaceAll('{configuration}', configuration).replaceAll('{budget}', budget).replaceAll('{case}', caseFile));
    if (layer !== 'system' && (!runner.args.some(a => a.includes('{budget}')) || !runner.args.some(a => a.includes('{configuration}')) || !runner.args.some(a => a.includes('{case}')))) {
        rmSync(root, { recursive: true, force: true });
        throw Error('Model adapter needs explicit configuration and remaining budget inputs');
    }
    try {
        if (signal.aborted)
            throw Error('Campaign cancelled');
        await new Promise<void>((done, fail) => {
            const env: NodeJS.ProcessEnv = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR };
            const child = spawn(runner.command === 'node' ? process.execPath : runner.command, args, { cwd: runner.cwd, env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
            let bytes = 0, failure: Error | null = null;
            const kill = () => { try {
                if (child.pid)
                    process.kill(-child.pid, 'SIGKILL');
            }
            catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ESRCH')
                    failure = Error('Runner cleanup failed');
            } };
            // Wait for close after killing: the owned child is reaped before returning evidence.
            const stop = (message: string) => { failure ??= Error(message); kill(); };
            const abort = () => stop('Campaign cancelled');
            const timer = setTimeout(() => stop('Runner time budget exceeded'), timeout);
            signal.addEventListener('abort', abort, { once: true });
            if (signal.aborted)
                abort();
            const cleanup = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); };
            const capture = (part: Buffer) => { bytes += part.length; if (bytes > maxBytes)
                stop('Runner log budget exceeded'); };
            child.stdout.on('data', capture);
            child.stderr.on('data', capture);
            child.once('error', () => { cleanup(); fail(Error('Registered runner could not start')); });
            child.once('close', code => { cleanup(); kill(); if (failure)
                fail(failure);
            else if (code !== 0)
                fail(Error('Runner failed'));
            else
                done(); });
        });
        if (lstatSync(out).size > maxBytes)
            throw Error('Evidence byte budget exceeded');
        const e = validateExternal(readJSON(out), layer);
        if (layer !== 'system' && (e.caseHash !== hash(currentCase) || !e.fixtureHash || !e.runtimeIdentity))
            throw Error('Evidence lacks case and fixture identity');
        if (layer !== 'system' && (!profile || e.configurationHash !== hash(profile) || !e.modelDigest))
            throw Error('Model/agent evidence lacks exact configuration identity');
        return e;
    }
    finally {
        rmSync(root, { recursive: true, force: true });
    }
}
export async function run(pack: Pack, profile: Profile | null, limits: Limits, options: {
    execute: boolean;
    allowModels?: boolean;
    allowExpensive?: boolean;
    registry?: Registry;
    fetch?: typeof fetch;
    telemetry?: boolean;
    sampleMs?: number;
    deadline?: number;
    signal?: AbortSignal;
}): Promise<Report> {
    validatePack(pack);
    if (profile)
        validateProfile(profile);
    validateLimits(limits);
    if (options.execute !== true)
        throw Error('Run requires explicit execution');
    if (options.sampleMs !== undefined && !integer(options.sampleMs, 250, 10000))
        throw Error('Invalid telemetry interval');
    if (options.deadline !== undefined && (!Number.isSafeInteger(options.deadline) || options.deadline < 0))
        throw Error('Invalid campaign deadline');
    const cancellation = new AbortController();
    let monitor: Awaited<ReturnType<typeof monitorResources>> | null = null;
    let resources: Resources | undefined;
    let runtimeIdentity: RuntimeIdentity | undefined;
    let initiallyResident: boolean | null = null;
    let suiteModelRequested = false;
    const residencyCleanup: {
        attempted: boolean;
        status: "not-needed" | "released" | "unknown";
    } = { attempted: false, status: "not-needed" };
    const cancel = () => cancellation.abort();
    process.on('SIGINT', cancel);
    process.on('SIGTERM', cancel);
    options.signal?.addEventListener('abort', cancel, { once: true });
    if (options.signal?.aborted)
        cancel();
    const releaseOwnedModel = async () => { if (residencyCleanup.attempted || profile?.residency !== 'suite' || (profile.backend ?? 'ollama') !== 'ollama' || initiallyResident !== false || !suiteModelRequested)
        return; residencyCleanup.attempted = true; residencyCleanup.status = 'unknown'; try {
        const released = record(await boundedJSON(await (options.fetch ?? fetch)(new URL('/api/generate', profile.endpoint), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model: profile.model, keep_alive: 0 }), redirect: 'error', signal: AbortSignal.timeout(1000) }), 65536));
        if (released.done === true && released.done_reason === 'unload')
            residencyCleanup.status = 'released';
    }
    catch { /* No forced service restart on cleanup uncertainty. */ } };
    try {
        const evaluatorBefore = engineIdentity();
        const before = hash(pack), profileBefore = profile ? hash(profile) : null, started = new Date().toISOString(), deadline = Math.min(Date.now() + limits.suiteMs, options.deadline ?? Number.MAX_SAFE_INTEGER), results: Result[] = [];
        let tokens = 0, known = true, digest: string | null = null, modelReady = false, providerIdentity: string | null = null;
        let caseDeadline = 0;
        const remaining = () => {
            if (cancellation.signal.aborted)
                throw Error('Campaign cancelled');
            const ms = Math.min(caseDeadline, deadline) - Date.now();
            if (ms <= 0)
                throw Error('Execution deadline exhausted');
            return ms;
        };
        const request = async (path: string, body: unknown, timeout: number) => boundedJSON(await (options.fetch ?? fetch)(new URL(path, profile!.endpoint), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.any([cancellation.signal, AbortSignal.timeout(Math.max(1, Math.min(timeout, remaining())))]) }), limits.maxBytes);
        const metadataRequest = async (path: string, body?: unknown) => boundedJSON(await (options.fetch ?? fetch)(new URL(path, profile!.endpoint), { method: body ? 'POST' : 'GET', headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, redirect: 'error', signal: AbortSignal.any([cancellation.signal, AbortSignal.timeout(Math.max(1, remaining()))]) }), limits.maxBytes);
        const allocation = async () => { if (!profile || (profile.backend ?? 'ollama') !== 'ollama')
            return null; try {
            const state = record(await boundedJSON(await (options.fetch ?? fetch)(new URL('/api/ps', profile.endpoint), { redirect: 'error', signal: AbortSignal.any([cancellation.signal, AbortSignal.timeout(250)]) }), limits.maxBytes));
            const models = Array.isArray(state.models) ? state.models.map(record) : [];
            const model = models.find(m => m.name === profile.model);
            return model && typeof model.size_vram === 'number' ? model.size_vram : 0;
        }
        catch {
            return null;
        } };
        if (!cancellation.signal.aborted && Date.now() < deadline && (options.telemetry || profile?.residency === 'suite') && profile && options.allowModels && pack.cases.some(c => !c.runner && c.layer === 'model')) {
            caseDeadline = Date.now() + Math.min(5000, limits.caseMs);
            if ((profile.backend ?? 'ollama') === 'ollama')
                try {
                    const ps = record(await metadataRequest('/api/ps'));
                    initiallyResident = Array.isArray(ps.models) && ps.models.map(record).some(m => m.name === profile.model);
                }
                catch {
                    initiallyResident = null;
                }
            if (options.telemetry)
                monitor = await monitorResources({ port: new URL(profile.endpoint).port || '80', intervalMs: options.sampleMs ?? 500, allocation });
        }
        for (let iteration = 1; iteration <= limits.repeat; iteration++)
            for (const c of pack.cases.slice(0, limits.maxCases)) {
                const begin = performance.now(), r: Result = { id: c.id, iteration, layer: c.layer, split: c.split, capabilities: [...c.capabilities], critical: c.critical, status: 'not-run', durationMs: 0, tokens: null, reason: null };
                results.push(r);
                if (cancellation.signal.aborted) {
                    r.reason = 'Campaign cancelled';
                    continue;
                }
                caseDeadline = Date.now() + limits.caseMs;
                const timeout = Math.min(limits.caseMs, deadline - Date.now());
                if (c.layer !== 'system' && !known) {
                    r.reason = 'Prior model execution has unverified consumption';
                    continue;
                }
                if (timeout <= 0) {
                    r.reason = 'Suite deadline exhausted';
                    continue;
                }
                if (c.expensive && !options.allowExpensive) {
                    r.reason = 'Expensive execution not authorized';
                    continue;
                }
                if (c.layer !== 'system' && !options.allowModels) {
                    r.reason = 'Model/agent execution not authorized';
                    continue;
                }
                try {
                    if (c.runner) {
                        const runner = options.registry?.runners[c.runner];
                        if (!runner || !runner.layers.includes(c.layer))
                            throw Error('Runner not registered for this layer');
                        if (runner.allowModels && !options.allowModels)
                            throw Error('Runner model execution not authorized');
                        if (c.layer !== 'system' && tokens >= limits.outputTokens)
                            throw Error('Suite token budget exhausted');
                        const e = await external(runner, profile, c.layer, timeout, limits.maxBytes, limits.outputTokens - tokens, c, cancellation.signal);
                        r.adapterHash = hash(e);
                        r.fixtureHash = e.fixtureHash;
                        r.checks = e.results.reduce((n, x) => n + x.checks, 0);
                        r.status = e.sourceStable && e.complete && r.checks > 0 && e.results.every(x => x.status === 'passed') ? 'passed' : 'failed';
                        r.reason = r.status === 'passed' ? null : 'Adapter incomplete, changed source or failing checks';
                        if (c.layer !== 'system') {
                            if (e.outputTokens === undefined) {
                                known = false;
                                r.status = 'error';
                                r.reason = 'Agent token usage unknown; budget cannot be verified';
                            }
                            else {
                                tokens += e.outputTokens;
                                r.tokens = e.outputTokens;
                                if (tokens > limits.outputTokens) {
                                    known = false;
                                    r.status = 'error';
                                    r.reason = 'Adapter exceeded token budget';
                                }
                            }
                            if (digest && e.modelDigest !== digest)
                                throw Error('Model identity changed');
                            digest = e.modelDigest ?? digest;
                            if (providerIdentity && providerIdentity !== e.runtimeIdentity)
                                throw Error('Adapter runtime changed');
                            providerIdentity = e.runtimeIdentity ?? providerIdentity;
                        }
                    }
                    else {
                        if (!profile)
                            throw Error('Model profile required');
                        if (profile.parallel !== 1)
                            throw Error('Parallel profile execution needs a qualified scheduling adapter; baseline runner is serial');
                        if (tokens + profile.maxOutputTokens > limits.outputTokens) {
                            r.reason = 'Insufficient token budget for another bounded generation';
                            continue;
                        }
                        if (!modelReady) {
                            runtimeIdentity = await inspectRuntime(profile, metadataRequest, { signal: AbortSignal.any([cancellation.signal, AbortSignal.timeout(remaining())]) });
                            digest = runtimeIdentity.modelDigest;
                            providerIdentity = runtimeIdentity.provider;
                            modelReady = true;
                        }
                        const optionsBody: Record<string, unknown> = { num_ctx: profile.context, num_predict: profile.maxOutputTokens };
                        for (const [k, v] of [['temperature', profile.temperature], ['top_p', profile.topP], ['top_k', profile.topK], ['seed', profile.seed]] as const)
                            if (v !== null)
                                optionsBody[k] = v;
                        r.fixtureHash = hash(c.messages);
                        const backend = profile.backend ?? 'ollama';
                        let response: Record<string, unknown>;
                        let firstTokenMs: number | null = null;
                        let observedResident: boolean | null = null;
                        if (options.telemetry)
                            try {
                                if (backend === 'ollama') {
                                    const state = record(await metadataRequest('/api/ps'));
                                    if (Array.isArray(state.models))
                                        observedResident = state.models.map(record).some(m => m.name === profile.model);
                                }
                                else if (backend === 'llama.cpp') {
                                    const state = record(await metadataRequest('/props'));
                                    if (typeof state.is_sleeping === 'boolean')
                                        observedResident = !state.is_sleeping;
                                }
                            }
                            catch { /* Unknown residency stays unknown. */ }
                        if (backend === 'ollama') {
                            if (profile.residency === 'suite')
                                suiteModelRequested = true;
                            const body = { model: profile.model, messages: c.messages, stream: !!options.telemetry, keep_alive: profile.residency === 'suite' ? '5m' : 0, ...(profile.think !== null ? { think: profile.think } : {}), options: optionsBody };
                            if (options.telemetry) {
                                const begin = performance.now();
                                const stream = await ollamaStream(await (options.fetch ?? fetch)(new URL('/api/chat', profile.endpoint), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.any([cancellation.signal, AbortSignal.timeout(remaining())]) }), limits.maxBytes, begin);
                                response = stream.value;
                                firstTokenMs = stream.firstTokenMs;
                            }
                            else
                                response = record(await request('/api/chat', body, remaining()));
                        }
                        else {
                            const raw = record(await request('/v1/chat/completions', compatibleBody(profile, c.messages), remaining()));
                            if (profile.runtimeManifest?.serverFingerprint !== null && raw.system_fingerprint !== profile.runtimeManifest?.serverFingerprint)
                                throw Error('Alternative runtime fingerprint differs');
                            const choices = Array.isArray(raw.choices) ? raw.choices.map(record) : [];
                            if (choices.length !== 1)
                                throw Error('Expected one bounded completion');
                            const usage = record(raw.usage);
                            if (!integer(usage.prompt_tokens, 0, 1048576) || !integer(usage.completion_tokens, 0, 1000000) || usage.prompt_tokens + profile.maxOutputTokens > profile.context)
                                throw Error('Alternative context/usage unverified');
                            response = { model: raw.model, message: choices[0].message, done: choices[0].finish_reason === 'stop', done_reason: choices[0].finish_reason, eval_count: usage.completion_tokens, prompt_eval_count: usage.prompt_tokens };
                        }
                        if (response.model !== profile.model)
                            throw Error('Generation model identity differs');
                        const finalIdentity = await inspectRuntime(profile, metadataRequest, { verifyFiles: false, signal: AbortSignal.any([cancellation.signal, AbortSignal.timeout(remaining())]) });
                        if (hash(finalIdentity) !== hash(runtimeIdentity))
                            throw Error('Runtime identity changed during generation');
                        const message = record(response.message);
                        if (typeof message.content !== 'string' || response.done !== true || !integer(response.eval_count, 0, 1000000))
                            throw Error('Incomplete or unmeasured model response');
                        const milliseconds = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value / 1000000 : null;
                        const generationMs = milliseconds(response.eval_duration);
                        r.performance = { phase: observedResident === null ? 'unknown' : observedResident ? 'warm-model' : 'cold-model', loadMs: milliseconds(response.load_duration), promptMs: milliseconds(response.prompt_eval_duration), generationMs, providerTotalMs: milliseconds(response.total_duration), inputTokens: integer(response.prompt_eval_count, 0, 1048576) ? response.prompt_eval_count : null, outputTokens: response.eval_count, tokensPerSecond: generationMs && generationMs > 0 ? response.eval_count / (generationMs / 1000) : null, timeToFirstTokenMs: firstTokenMs };
                        tokens += response.eval_count;
                        r.tokens = response.eval_count;
                        r.responseHash = hash(message.content);
                        if (tokens > limits.outputTokens || response.eval_count > profile.maxOutputTokens)
                            throw Error('Generation exceeded output budget');
                        if (response.done_reason === 'length')
                            throw Error('Output truncated');
                        let observed: unknown = message.content.trim();
                        if (c.expected!.kind === 'json') {
                            try {
                                observed = JSON.parse(message.content) as unknown;
                            }
                            catch {
                                r.status = 'failed';
                                r.reason = 'Invalid structured output';
                                continue;
                            }
                        }
                        r.status = isDeepStrictEqual(observed, c.expected!.value) ? 'passed' : 'failed';
                        r.reason = r.status === 'passed' ? null : 'Independent acceptance mismatch';
                    }
                }
                catch {
                    r.status = 'error';
                    r.reason = 'Adapter failed or violated identity/budget contract';
                    if (c.layer !== 'system')
                        known = false;
                }
                finally {
                    r.durationMs = Math.round(performance.now() - begin);
                    if (monitor)
                        await monitor.sample();
                }
            }
        await releaseOwnedModel();
        if (monitor) {
            resources = await monitor.stop();
            monitor = null;
        }
        const sourceStable = evaluatorBefore === engineIdentity() && before === hash(pack) && profileBefore === (profile ? hash(profile) : null), complete = results.length === pack.cases.length * limits.repeat && results.every(x => x.status !== 'not-run' && x.status !== 'error');
        return { schemaVersion: 1, id: randomUUID(), protocolVersion: '0.2.0', engineHash: evaluatorBefore, residencyCleanup, ...(resources ? { resources } : {}), ...(runtimeIdentity ? { identity: runtimeIdentity } : {}), pack: pack.id, packVersion: pack.version, caseCount: pack.cases.length, packHash: before, registryHash: options.registry ? hash(options.registry) : null, profile: profile ? evidenceProfile(profile) : null, profileHash: profile ? hash(evidenceProfile(profile)) : null, modelDigest: digest, started, finished: new Date().toISOString(), sourceStable, limits, results, passed: sourceStable && complete && results.every(x => x.status === 'passed'), complete, promotion: false, usage: { outputTokens: known ? tokens : null }, runtime: { provider: providerIdentity, node: process.version, platform: process.platform, arch: process.arch } };
    }
    finally {
        await releaseOwnedModel();
        if (monitor)
            await monitor.stop();
        process.removeListener('SIGINT', cancel);
        process.removeListener('SIGTERM', cancel);
        options.signal?.removeEventListener('abort', cancel);
    }
}
export interface Requirements {
    capabilities: string[];
    minimumCases: number;
    minimumHoldout: number;
    minimumPassRate: number;
}
export function assess(report: Report, requirements: Requirements) {
    validateReport(report);
    fields(record(requirements), ['capabilities', 'minimumCases', 'minimumHoldout', 'minimumPassRate']);
    if (!strings(requirements.capabilities) || !integer(requirements.minimumCases, 1, 1000) || !integer(requirements.minimumHoldout, 1, 1000) || !Number.isFinite(requirements.minimumPassRate) || requirements.minimumPassRate < 0 || requirements.minimumPassRate > 1)
        throw Error('Invalid qualification requirements');
    const reasons: string[] = [];
    if (report.protocolVersion === '0.2.0' && report.engineHash !== engineIdentity())
        reasons.push('Evaluator implementation changed; reevaluation required');
    if (!report.profile || report.profileHash !== hash(report.profile) || !report.modelDigest || !report.runtime.provider || !report.sourceStable || !report.complete || report.promotion !== false || report.results.some(r => r.critical && r.status !== 'passed') || report.usage.outputTokens === null)
        reasons.push('Missing stable configuration, identity, complete evidence or critical pass');
    for (const cap of requirements.capabilities) {
        const rows = report.results.filter(r => r.layer !== 'system' && r.capabilities.includes(cap)), unique = new Set(rows.map(r => r.fixtureHash)), regression = new Set(report.results.filter(r => r.split === 'regression').map(r => r.fixtureHash)), holdout = new Set(rows.filter(r => r.split === 'holdout' && !regression.has(r.fixtureHash)).map(r => r.fixtureHash));
        if (unique.size < requirements.minimumCases || holdout.size < requirements.minimumHoldout || !rows.length || rows.filter(r => r.status === 'passed').length / rows.length < requirements.minimumPassRate || rows.some(r => !r.fixtureHash || r.status === 'error' || r.status === 'not-run'))
            reasons.push('Insufficient evidence: ' + cap);
    }
    return { eligible: reasons.length === 0, reasons, automaticPromotion: false };
}
export function exportProfile(report: Report, review: unknown, requirements: Requirements) {
    const r = record(review);
    fields(r, ['schemaVersion', 'reportHash', 'reviewer', 'accepted', 'capabilities', 'reviewed', 'evidence']);
    const reviewed = Date.parse(String(r.reviewed));
    if (r.schemaVersion !== 1 || r.reportHash !== hash(report) || typeof r.reviewer !== 'string' || !r.reviewer.trim() || r.accepted !== true || !strings(r.capabilities) || requirements.capabilities.some(c => !(r.capabilities as string[]).includes(c)) || !Number.isFinite(reviewed) || reviewed < Date.parse(report.finished) || reviewed > Date.now() + 60000 || typeof r.evidence !== 'string' || !r.evidence.trim())
        throw Error('Independent review receipt does not match evidence');
    const result = assess(report, requirements);
    if (!result.eligible)
        throw Error(result.reasons.join('; '));
    return { version: 1, profiles: [{ id: report.profile!.id, model: `${report.profile!.model} ${report.profile!.quantization} ${report.modelDigest}`, status: 'qualified', capabilities: requirements.capabilities, evidence: [`Runtime ${report.runtime.provider}; configuration ${JSON.stringify(report.profile)}; registry ${report.registryHash ?? 'direct'}`, `Gauntlet report ${hash(report)}; configuration ${report.profileHash}; pack ${report.pack}@${report.packVersion}; reviewed ${r.reviewed}`, r.evidence] }] };
}
export function compare(reports: Report[]) {
    if (!Array.isArray(reports) || reports.length < 1 || reports.length > 100)
        throw Error('Provide 1–100 reports');
    reports.forEach(validateReport);
    return reports.map(r => ({ id: r.id, profile: r.profile?.id ?? null, configuration: r.profileHash, pack: r.pack, version: r.packVersion, packHash: r.packHash, complete: r.complete, passed: r.passed, counts: Object.fromEntries(['passed', 'failed', 'error', 'not-run'].map(s => [s, r.results.filter(x => x.status === s).length])), tokens: r.usage.outputTokens, performance: performanceSummary(r), durationMs: Date.parse(r.finished) - Date.parse(r.started), comparableToFirst: reports.length > 0 && r.packHash === reports[0].packHash && r.registryHash === reports[0].registryHash && hash(r.limits) === hash(reports[0].limits) && r.engineHash === reports[0].engineHash, automaticPromotion: false }));
}
/** Structural checks detect malformed or internally inconsistent evidence; they do not authenticate its author. */
export function validateReport(input: unknown): Report {
    const v = record(input);
    fields(v, ['schemaVersion', 'id', 'protocolVersion', 'engineHash', 'resources', 'identity', 'residencyCleanup', 'pack', 'packVersion', 'caseCount', 'packHash', 'registryHash', 'profile', 'profileHash', 'modelDigest', 'started', 'finished', 'sourceStable', 'limits', 'results', 'passed', 'complete', 'promotion', 'usage', 'runtime']);
    const digest = (x: unknown) => typeof x === 'string' && /^(sha256:)?[a-f0-9]{64}$/.test(x);
    if (v.schemaVersion !== 1 || typeof v.id !== 'string' || !v.id || typeof v.pack !== 'string' || !id.test(v.pack) || typeof v.packVersion !== 'string' || !/^\d+\.\d+\.\d+$/.test(v.packVersion) || !digest(v.packHash) || typeof v.sourceStable !== 'boolean' || typeof v.complete !== 'boolean' || typeof v.passed !== 'boolean' || v.promotion !== false)
        throw Error('Invalid report identity');
    if (v.residencyCleanup !== undefined) {
        const cleanup = record(v.residencyCleanup);
        fields(cleanup, ['attempted', 'status']);
        if (typeof cleanup.attempted !== 'boolean' || !['not-needed', 'released', 'unknown'].includes(String(cleanup.status)))
            throw Error('Invalid residency cleanup evidence');
    }
    if (v.engineHash !== undefined && !digest(v.engineHash))
        throw Error('Invalid engine hash');
    if (v.protocolVersion === '0.2.0' && !digest(v.engineHash))
        throw Error('Current evidence needs engine identity');
    if (v.protocolVersion !== undefined && v.protocolVersion !== '0.2.0')
        throw Error('Unsupported protocol evidence version');
    if (v.identity !== undefined) {
        const identity = record(v.identity);
        fields(identity, ['provider', 'modelDigest', 'metadataHash', 'proof']);
        if (typeof identity.provider !== 'string' || identity.provider !== record(v.runtime).provider || identity.modelDigest !== v.modelDigest || !digest(identity.metadataHash) || !['provider-metadata', 'owner-manifest-and-local-artifacts'].includes(String(identity.proof)))
            throw Error('Invalid runtime identity evidence');
    }
    if (v.resources !== undefined) {
        const resource = record(v.resources);
        fields(resource, ['intervalMs', 'samples', 'sampleErrors', 'samplingTimeMs', 'peakProcessRssBytes', 'peakGpuDevicePercent', 'peakGpuDeviceMemoryBytes', 'peakModelAllocatedBytes', 'scope', 'gpuSource', 'memoryTotalBytes']);
        if (!integer(resource.intervalMs, 250, 10000) || !Array.isArray(resource.samples) || resource.samples.length > 10000 || !integer(resource.sampleErrors, 0, 1000000) || typeof resource.scope !== 'string' || typeof resource.gpuSource !== 'string' || !integer(resource.samplingTimeMs, 0, 3600000) || !integer(resource.memoryTotalBytes, 0, Number.MAX_SAFE_INTEGER))
            throw Error('Invalid resource evidence');
        for (const sample of resource.samples) {
            const row = record(sample);
            fields(row, ['elapsedMs', 'systemFreeBytes', 'systemLoad1', 'processRssBytes', 'processCpuPercent', 'gpuDevicePercent', 'gpuDeviceMemoryBytes', 'modelAllocatedBytes']);
            for (const [key, value] of Object.entries(row))
                if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER))
                    throw Error('Invalid resource sample');
        }
        const peaks = { peakProcessRssBytes: 'processRssBytes', peakGpuDevicePercent: 'gpuDevicePercent', peakGpuDeviceMemoryBytes: 'gpuDeviceMemoryBytes', peakModelAllocatedBytes: 'modelAllocatedBytes' };
        for (const [peak, key] of Object.entries(peaks)) {
            const values = resource.samples.map(x => record(x)[key]).filter((x): x is number => typeof x === 'number');
            if (resource[peak] !== (values.length ? Math.max(...values) : null))
                throw Error('Inconsistent sampled peak');
        }
    }
    const started = Date.parse(String(v.started)), finished = Date.parse(String(v.finished));
    if (!Number.isFinite(started) || !Number.isFinite(finished) || finished < started)
        throw Error('Invalid report dates');
    if (v.registryHash !== null && !digest(v.registryHash))
        throw Error('Invalid runner registry hash');
    if (!integer(v.caseCount, 1, 1000))
        throw Error('Invalid case count');
    const limits = validateLimits(v.limits);
    if (v.profile !== null) {
        const p = validateProfile(v.profile);
        if (v.profileHash !== hash(p))
            throw Error('Configuration hash mismatch');
    }
    else if (v.profileHash !== null)
        throw Error('Unexpected configuration hash');
    if (v.modelDigest !== null && !digest(v.modelDigest))
        throw Error('Invalid model digest');
    if (!Array.isArray(v.results) || !v.results.length || v.results.length > limits.maxCases * limits.repeat)
        throw Error('Invalid result count');
    const seen = new Set<string>();
    let tokens = 0, unknown = false;
    for (const value of v.results) {
        const r = record(value);
        fields(r, ['id', 'iteration', 'layer', 'split', 'capabilities', 'critical', 'status', 'durationMs', 'performance', 'tokens', 'reason', 'fixtureHash', 'responseHash', 'adapterHash', 'checks']);
        if (typeof r.id !== 'string' || !id.test(r.id) || !integer(r.iteration, 1, limits.repeat) || !['system', 'model', 'coding', 'end-to-end'].includes(String(r.layer)) || !['regression', 'holdout'].includes(String(r.split)) || !strings(r.capabilities) || typeof r.critical !== 'boolean' || !['passed', 'failed', 'error', 'not-run'].includes(String(r.status)) || !integer(r.durationMs, 0, 3600000) || r.reason !== null && typeof r.reason !== 'string')
            throw Error('Invalid result');
        if (r.performance !== undefined) {
            const perf = record(r.performance);
            fields(perf, ['phase', 'loadMs', 'promptMs', 'generationMs', 'providerTotalMs', 'inputTokens', 'outputTokens', 'tokensPerSecond', 'timeToFirstTokenMs']);
            if (!['cold-model', 'warm-model', 'unknown'].includes(String(perf.phase)))
                throw Error('Invalid cold/warm phase');
            for (const [key, value] of Object.entries(perf))
                if (key !== 'phase' && value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0))
                    throw Error('Invalid performance metric');
            if (perf.outputTokens !== r.tokens)
                throw Error('Performance token mismatch');
        }
        const key = r.id + ':' + r.iteration;
        if (seen.has(key))
            throw Error('Duplicate result');
        seen.add(key);
        if (r.tokens !== null && !integer(r.tokens, 0, 1000000))
            throw Error('Invalid result usage');
        if (r.layer !== 'system' && r.status !== 'not-run') {
            if (r.tokens === null || r.status === 'error')
                unknown = true;
            else
                tokens += r.tokens as number;
        }
        for (const k of ['fixtureHash', 'responseHash', 'adapterHash'])
            if (r[k] !== undefined && !digest(r[k]))
                throw Error('Invalid result hash');
        if (r.checks !== undefined && !integer(r.checks, 0, 1000000))
            throw Error('Invalid check count');
        if (r.status === 'passed' && !r.responseHash && !r.adapterHash)
            throw Error('Passing result lacks evidence identity');
    }
    const usage = record(v.usage);
    fields(usage, ['outputTokens']);
    if (usage.outputTokens !== null && !integer(usage.outputTokens, 0, 1000000))
        throw Error('Invalid report usage');
    if (unknown && usage.outputTokens !== null || usage.outputTokens !== null && usage.outputTokens !== tokens)
        throw Error('Inconsistent token totals');
    if (v.complete && usage.outputTokens !== null && (usage.outputTokens as number) > limits.outputTokens)
        throw Error('Complete evidence exceeds token budget');
    if (v.complete && v.results.length !== v.caseCount * limits.repeat)
        throw Error('Missing declared cases');
    if (v.complete && v.results.some(x => ['error', 'not-run'].includes(String(record(x).status))))
        throw Error('Incomplete evidence marked complete');
    if (v.passed !== !!(v.sourceStable && v.complete && v.results.every(x => record(x).status === 'passed')))
        throw Error('Inconsistent pass flag');
    const runtime = record(v.runtime);
    fields(runtime, ['provider', 'node', 'platform', 'arch']);
    if (runtime.provider !== null && (typeof runtime.provider !== 'string' || !runtime.provider || runtime.provider.length > 256))
        throw Error('Invalid provider runtime');
    if (['node', 'platform', 'arch'].some(k => typeof runtime[k] !== 'string' || !runtime[k]))
        throw Error('Invalid runtime identity');
    return v as unknown as Report;
}
export { catalog, catalogMarkdown, areas } from './catalog.ts';
export { inspectRuntime, verifyArtifacts, validateManifest } from './runtimes.ts';
export { serverProcess } from './telemetry.ts';
export { executeWithEvidence, reuseValid, readEvidence, defaultEvidenceDirectory } from './evidence.ts';
export function performanceSummary(report: Report) {
    const measured = report.results.flatMap(r => r.performance ? [r.performance] : []);
    const median = (values: (number | null)[]) => { const sorted = values.filter((x): x is number => x !== null).sort((a, b) => a - b); if (!sorted.length)
        return null; const middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2; };
    return { coldCases: measured.filter(x => x.phase === 'cold-model').length, warmCases: measured.filter(x => x.phase === 'warm-model').length, unknownResidencyCases: measured.filter(x => x.phase === 'unknown').length, firstLoadMs: measured[0]?.loadMs ?? null, medianTimeToFirstTokenMs: median(measured.map(x => x.timeToFirstTokenMs)), medianGenerationTokensPerSecond: median(measured.map(x => x.tokensPerSecond)), peakProcessRssBytes: report.resources?.peakProcessRssBytes ?? null, peakGpuDevicePercent: report.resources?.peakGpuDevicePercent ?? null, peakGpuDeviceMemoryBytes: report.resources?.peakGpuDeviceMemoryBytes ?? null, peakModelAllocatedBytes: report.resources?.peakModelAllocatedBytes ?? null, samples: report.resources?.samples.length ?? 0, sampledPeaks: true };
}
