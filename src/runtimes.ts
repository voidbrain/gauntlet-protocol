import { createHash } from 'node:crypto';
import { createReadStream, lstatSync } from 'node:fs';
import type { Profile } from './index.ts';
export interface Artifact {
    path: string;
    sha256: string;
}
export interface RuntimeManifest {
    version: string;
    modelDigest: string;
    context: number;
    artifacts: Artifact[];
    serverFingerprint: string | null;
    supportsThinking: boolean;
}
export interface RuntimeIdentity {
    provider: string;
    modelDigest: string;
    metadataHash: string;
    proof: 'provider-metadata' | 'owner-manifest-and-local-artifacts';
}
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function validateManifest(value: unknown): RuntimeManifest {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw Error('Runtime manifest required');
    const v = value as Record<string, unknown>;
    if (Object.keys(v).some(k => !['version', 'modelDigest', 'context', 'artifacts', 'serverFingerprint', 'supportsThinking'].includes(k)) || typeof v.version !== 'string' || !v.version || v.version.length > 100 || typeof v.modelDigest !== 'string' || !/^[a-f0-9]{64}$/.test(v.modelDigest) || !Number.isSafeInteger(v.context) || Number(v.context) < 1024 || typeof v.supportsThinking !== 'boolean' || v.serverFingerprint !== null && typeof v.serverFingerprint !== 'string' || !Array.isArray(v.artifacts) || !v.artifacts.length || v.artifacts.length > 1000)
        throw Error('Invalid runtime manifest');
    for (const a of v.artifacts) {
        if (!a || typeof a !== 'object' || Array.isArray(a) || Object.keys(a).some(k => !['path', 'sha256'].includes(k)) || typeof a.path !== 'string' || !a.path || typeof a.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(a.sha256))
            throw Error('Invalid model artifact');
    }
    const artifacts = v.artifacts as Artifact[];
    if (new Set(artifacts.map(a => a.path)).size !== artifacts.length || v.modelDigest !== (artifacts.length === 1 ? artifacts[0].sha256 : hash(artifacts.map(a => a.sha256))))
        throw Error('Manifest digest does not bind complete artifact list');
    return v as unknown as RuntimeManifest;
}
export async function verifyArtifacts(manifest: RuntimeManifest, signal: AbortSignal = AbortSignal.timeout(30000), verify = true): Promise<string> {
    const identities = [];
    for (const artifact of manifest.artifacts) {
        const stat = lstatSync(artifact.path);
        if (!stat.isFile() || stat.isSymbolicLink())
            throw Error('Model artifact must be regular');
        if (verify) {
            const digest = createHash('sha256');
            for await (const part of createReadStream(artifact.path, { signal }))
                digest.update(part);
            if (digest.digest('hex') !== artifact.sha256)
                throw Error('Model artifact digest differs');
        }
        identities.push({ sha256: artifact.sha256, size: stat.size, mtime: stat.mtimeMs });
    }
    return hash(identities);
}
export async function boundedJSON(response: Response, maxBytes: number): Promise<unknown> {
    if (!response.ok)
        throw Error('Runtime HTTP status ' + response.status);
    const reader = response.body?.getReader();
    if (!reader)
        throw Error('Missing runtime response');
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        for (;;) {
            const part = await reader.read();
            if (part.done)
                break;
            size += part.value.length;
            if (size > maxBytes)
                throw Error('Runtime byte budget exceeded');
            chunks.push(part.value);
        }
    }
    finally {
        await reader.cancel().catch(() => { });
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}
function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value))
    throw Error('Invalid runtime metadata'); return value as Record<string, unknown>; }
export async function inspectRuntime(profile: Profile, request: (path: string, body?: unknown) => Promise<unknown>, options: {
    signal?: AbortSignal;
    verifyFiles?: boolean;
} = {}): Promise<RuntimeIdentity> {
    const backend = profile.backend ?? 'ollama';
    if (backend === 'ollama') {
        const version = object(await request('/api/version')), show = object(await request('/api/show', { model: profile.model })), tags = object(await request('/api/tags'));
        const model = Array.isArray(tags.models) ? tags.models.map(object).find(m => m.name === profile.model) : undefined;
        const details = object(show.details);
        if (typeof version.version !== 'string' || !version.version || show.remote_host || show.remote_model || model?.remote_host || !model || typeof model.digest !== 'string' || !/^(sha256:)?[a-f0-9]{64}$/.test(model.digest) || typeof model.size !== 'number' || model.size <= 0 || details.quantization_level !== profile.quantization)
            throw Error('Local model/runtime identity unavailable');
        if (profile.think !== null && (!Array.isArray(show.capabilities) || !show.capabilities.includes('thinking')))
            throw Error('Requested thinking unsupported');
        return { provider: 'ollama:' + version.version, modelDigest: model.digest, metadataHash: hash({ version: version.version, digest: model.digest, details, parameters: show.parameters ?? null, template: show.template ?? null, capabilities: show.capabilities ?? [] }), proof: 'provider-metadata' };
    }
    const manifest = validateManifest(profile.runtimeManifest);
    if (manifest.context !== profile.context)
        throw Error('Server context must match profile');
    if (profile.think !== null && !manifest.supportsThinking)
        throw Error('Runtime manifest does not establish thinking support');
    const artifactsHash = await verifyArtifacts(manifest, options.signal, options.verifyFiles !== false), models = object(await request('/v1/models'));
    if (!Array.isArray(models.data) || !models.data.map(object).some(m => m.id === profile.model))
        throw Error('Requested model is not already served');
    let propsHash: string | null = null;
    if (backend === 'llama.cpp') {
        const props = object(await request('/props')), settings = object(props.default_generation_settings);
        if (settings.n_ctx !== profile.context)
            throw Error('llama.cpp live context differs');
        propsHash = hash({ modelPath: props.model_path, context: settings.n_ctx, template: props.chat_template, params: settings.params });
    }
    return { provider: backend + ':' + manifest.version, modelDigest: manifest.modelDigest, metadataHash: hash({ backend, manifest, artifactsHash, propsHash, model: profile.model }), proof: 'owner-manifest-and-local-artifacts' };
}
export function compatibleBody(profile: Profile, messages: unknown): Record<string, unknown> {
    const body: Record<string, unknown> = { model: profile.model, messages, stream: false, max_tokens: profile.maxOutputTokens };
    for (const [key, value] of [['temperature', profile.temperature], ['top_p', profile.topP], ['top_k', profile.topK], ['seed', profile.seed]] as const)
        if (value !== null)
            body[key] = value;
    if (profile.think !== null)
        body.chat_template_kwargs = { enable_thinking: profile.think };
    return body;
}
export async function ollamaStream(response: Response, maxBytes: number, started: number): Promise<{
    value: Record<string, unknown>;
    firstTokenMs: number | null;
}> {
    if (!response.ok)
        throw Error('Runtime stream HTTP status ' + response.status);
    const reader = response.body?.getReader();
    if (!reader)
        throw Error('Missing stream');
    const decoder = new TextDecoder();
    let bytes = 0, pending = '', content = '', firstTokenMs: number | null = null, final: Record<string, unknown> | null = null, model: string | null = null;
    const line = (text: string) => { if (!text.trim())
        return; const part = object(JSON.parse(text)); if (final)
        throw Error('Data after terminal runtime response'); if (typeof part.model !== 'string' || model && model !== part.model)
        throw Error('Stream model identity changed'); model = part.model; const message = object(part.message); if (typeof message.content !== 'string' || message.thinking !== undefined && typeof message.thinking !== 'string')
        throw Error('Invalid stream message'); if (firstTokenMs === null && (message.content || message.thinking))
        firstTokenMs = performance.now() - started; content += message.content; if (part.done === true)
        final = part; };
    try {
        for (;;) {
            const part = await reader.read();
            if (part.done)
                break;
            bytes += part.value.length;
            if (bytes > maxBytes)
                throw Error('Stream byte budget exceeded');
            pending += decoder.decode(part.value, { stream: true });
            for (let at; (at = pending.indexOf('\n')) >= 0;) {
                line(pending.slice(0, at));
                pending = pending.slice(at + 1);
            }
        }
        pending += decoder.decode();
        if (pending.trim())
            line(pending);
    }
    finally {
        await reader.cancel().catch(() => { });
    }
    if (!final)
        throw Error('Stream ended without terminal response');
    const value = final as Record<string, unknown>;
    return { value: { ...value, message: { content } }, firstTokenMs };
}
