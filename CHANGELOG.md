# Releases

## 0.6.0

Run ledger and pending cases (F-010, docs/LEDGER.md): `gauntlet ledger` records into a consumer-owned, metadata-only ledger the cases a saved report ran, refusing reports of another pack definition; `gauntlet pending` lists new, changed, stale or other-profile cases of the given packs and exits 1 when any are pending. Consumer-agnostic. Grading, packs and protocol 0.4 evidence are unchanged; the engine hash changes with the new exports, so cache reuse needs evidence produced by 0.6.0 (ledger coverage does not depend on the engine). No real-model run.

## 0.5.0

Separate 28-case `general-assistant-expanded@1.0.0` pack with transcript contract and generated index (F-008). Repeatable candidate comparisons: bounded summary with full requested and observed identity, repeat/result identities, explicit mismatch reasons, error/not-run counts, incomplete state and unknown output/cache usage; no automatic promotion (F-009, docs/COMPARISONS.md). Original smoke packs, grading and protocol 0.4 evidence are unchanged. No real-model run.

## 0.4.1

Explicit per-case Ollama JSON/schema response formats, separate structural smoke pack, mode-visible plans and conservative pack/cache identity. Unconstrained defaults, semantic grading and failure captures remain unchanged. Other backends reject unsupported formats. No real-model run.

## 0.4.0

Opt-in private final-reply failure sidecars, fixed file/count/byte caps, source-bound bounded inspection, explicit case selection and a three-case diagnostic budget. Grading unchanged; public reports mark diagnostic instrumentation and ordinary reuse excludes it. Protocol0.4 reads earlier0.2/0.3 evidence without claiming engine-equivalent reuse. Adopt released harness4.4.1 optional metadata accounting/entry bridges; no native client source verification or real-model run.

## 0.3.0

Reusable local machine profiles and owner-declared load scenarios, machine inspection/compatibility admission, CLI/API environment selection and complete scope binding in reports/cache/comparison/reviewed exports. Shared common evidence retains original host/runtime/source and authorization checks. Legacy0.2 reports remain readable; only0.3 matching evidence is reused. No workload generator, schedule, model campaign or independent stress attestation.

## 0.2.0

Generated case/area/capability index, conservative private evidence reuse with evaluator/runtime/source identity, current admission gates and shared preflight cancellation/budget. Streaming Ollama timings, bounded host/device/model samples and cold/warm residency reporting. Local llama.cpp and MLX-LM adapters with owner manifests and checked artifacts. Real runtime installations and model campaigns remain separately measured consumer work.

## 0.1.1

SIGINT/SIGTERM now cancels active HTTP/runner work, reaps the owned process group and leaves later cases not-run. Signal handlers are removed after the suite. B-001; committed failing signal regressions precede the fix. No consumer adoption is required for release.

## 0.1.0

Independent evaluation contracts and CLI, direct local Ollama cases, registered runner bridge, bounded evidence, fixture-aware holdout assessment and reviewed profile exports. Core project-harness 4.2.1 adoption. No live model qualification or built-in coding sandbox.
