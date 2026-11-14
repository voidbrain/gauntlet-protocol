# Protocol version 1

## Ownership and evaluation layers

The library defines contracts, validates packs/profiles, supervises bounded execution and writes evidence. Consumers supply domain scenarios, registered runners, trusted graders and approval policies. NERV is one consumer; no NERV source import, deployment or acceptance gates a Gauntlet release.

`system` evaluates deterministic system behavior. `model` evaluates judgment or structured answers. `coding` evaluates coding-agent tasks through a registered runner. `end-to-end` evaluates complete scenarios through a registered runner. Reports keep these layers distinct; system passes cannot qualify model capabilities. No opaque overall intelligence score is generated.

The direct local provider supports Ollama's loopback API, exact installed quantization/digest checks, explicit context/output/sampling/thinking requests and independent text/JSON equality grading. Endpoint registration is trusted: a loopback URL is not proof that an administrator has not configured a proxy. Remote-backed Ollama model metadata is rejected. Generic API compatibility is not a claim that every runtime parameter is independently observable.

## Inputs and execution

Pack: `schemaVersion`, `id`, semantic `version`, `cases`. Each case has stable `id`, `layer`, `split` (regression or holdout), named `capabilities`, `critical`, `expensive`; either `runner`, or model `messages` plus independent `expected: {kind: "text"|"json", value}`. No shell commands in packs. Expectations are never sent to the direct model.

Ordered model messages may represent a complete prior transcript, including assistant content followed by a correcting user message. The array is validated, fixture-hashed and forwarded unchanged for one final generation; Gauntlet does not generate intermediate turns or execute an interactive dialogue. The [expanded-pack contract](EXPANDED-PACK.md) records the coverage matrix, versioning and holdout limits.

Profile: exact model tag/quantization, loopback endpoint, context, maximum output, nullable temperature/topP/topK/seed/think, concurrency, hardware and cache description. Null sampling settings inherit runtime defaults, so runtime version/default changes require reevaluation. Candidate profiles are configuration proposals, not qualification. The baseline executor is serial; a profile requesting parallel execution fails closed until a suitable scheduling adapter is supplied.

Limits: per-case milliseconds, whole-suite milliseconds, maximum selected cases, repeats, aggregate output-token ceiling and per-response/log bytes. Each direct call reserves its maximum output before execution; unmeasured or over-budget model execution stops later model calls. Timeouts cancel HTTP requests or kill external process groups. A client cancellation cannot independently prove an uncooperative server stopped compute. SIGINT/SIGTERM cancels the active request or owned process group and marks later cases not-run. Signal handlers are removed when the suite finishes. SIGKILL, abrupt machine loss or a separately detached descendant cannot be cleaned up by JavaScript; deployment supervisors and adapter contracts own those limits. No automatic retries. Truncation is an error; skipped or omitted work is not a pass. Separate expensive/model opt-ins are required, in addition to explicit execution.

Legacy/default calls unload after each response (`keep_alive: 0`); suite-resident profiles keep warm state between cases. See [performance measurement](PERFORMANCE.md). Durations therefore include cold-loading effects and are not steady-state throughput measurements. Provider input tokens and sampled memory/device counters are retained when telemetry is enabled. Energy and human repair/review time are not measured; do not report them as zero or infer them from output tokens. No server-wide configuration is changed.

## Registered external runners

A separately reviewed registry has `schemaVersion: 1` and a `runners` object. Entries have fixed `command`, `args`, `cwd`, accepted `layers` and `allowModels`. Relative cwd resolves from the registry's directory. There is no shell interpolation; supported argument placeholders are `{report}`, `{profile}` (ID), `{configuration}` (private JSON profile path), `{budget}` (private remaining-budget JSON path), and `{case}` (private current-case JSON path). Model/agent adapters must receive configuration, current case and remaining budget. Owner-trusted adapters enforce token limits before starting their work; the protocol verifies reported usage afterward and stops subsequent work on missing/excess usage.

Processes receive PATH, HOME and TMPDIR only. Model credentials are not inherited. Commands are **trusted executable code**, not candidate-controlled input. POSIX process-group supervision bounds runtime/output and cleans descendants; it is not a security sandbox. Windows external execution is unavailable until a Job Object adapter is implemented. Direct local-provider and schema operations remain portable.

Coding runners must supply an independently enforced sandbox/worktree, candidate/test separation and trusted acceptance tests. This release provides the bridge, not a built-in coding sandbox or Inspect installation. Inspect AI and other established runners can normalize their results into this contract; compatibility is not claimed until a particular adapter is implemented and tested.

The adapter writes a new report at `{report}`:

```json
{"schemaVersion":1,"layer":"system","sourceStable":true,"complete":true,"results":[{"id":"policy","status":"passed","checks":3}]}
```

Statuses: passed, failed, error, not-run. Empty/zero-check/incomplete evidence cannot pass. Non-system reports also need `configurationHash` (SHA256 of `JSON.stringify(profile)`), `modelDigest` measured `outputTokens`, `runtimeIdentity`, `caseHash` (hash of the current case), and `fixtureHash` (the independently evaluated input/fixture identity). Distinct case IDs or regression/holdout labels do not create independent coverage when fixture hashes repeat. A holdout fingerprint also used for regression does not count as heldout. A nonzero runner exit is an error even if its output claims success. Evidence hashes identify bytes/configuration; they are not cryptographic attestations of truthful measurement or authenticated authorship. The registered runner/grader remains part of the trusted computing base.

## Evidence and qualification

Reports include pack/profile/registry hashes, declared case count, model digest, runtime identity, selection results, iterations, layer/capability tags, timing, response or adapter hashes, token measurements, complete/pass/source-stability flags and `promotion: false`. Source/profile mutation invalidates acceptance. Responses/prompts and raw process logs are not copied into reports. Existing evidence is never overwritten.

A pending-only run preserves the full pack hash and result shape. Cases proven current by the supplied ledger are `not-run` with reason `skipped-current`; this one explicit reason is neutral for report completeness and pass/fail calculation. Other skipped, unauthorized, cancelled or omitted work remains incomplete and cannot pass. Pending-only execution bypasses automatic full-report cache reuse so every case classified pending is actually executed. See [run ledger and pending cases](LEDGER.md).

Execution atomically checkpoints the private output report after each case. A resumed campaign admits only graded results from a matching checkpoint; interrupted errors and unrun cases execute again. Source, full pack and case metadata, evaluator/protocol, limits, registry, profile, scenario and available runtime/model identity must match before any result is carried forward. Resume writes a new report and does not weaken model, cost or scenario admission. See [evidence checkpoints and reuse](EVIDENCE.md).

`compare --reports=a.json,b.json` preserves errors/not-run counts and unknown usage. Different pack/registry/budget contracts are marked noncomparable. Configuration changes remain visible; comparison alone chooses no winner. The [repeatable comparison contract](COMPARISONS.md) defines the bounded candidate matrix, identity fields, compatibility dimensions and repetition limits.

`qualify --report=report.json --review=receipt.json --requirements=examples/requirements.json --out=results/reviewed-profile.json` exports a harness-compatible profile only when stable complete model evidence meets each capability's minimum unique cases, minimum unique holdouts and pass rate, with all critical cases passed and known usage. Repeats do not inflate unique-case coverage. Capability minima are owner-authored and task-specific; meeting a small smoke threshold does not establish broader fitness.

A receipt has `schemaVersion: 1`, `reportHash`, nonempty `reviewer`, `accepted: true`, reviewed `capabilities`, ISO `reviewed` timestamp after report completion, and a nonempty `evidence` reference. It is an explicit owner attestation, not an authenticated independent identity. A qualified export is reviewable data; it never edits a consumer's profile registry, changes permissions, runs a task or approves a production promotion.

## Improvement cycle

Capture a failure, add a regression and separately maintained holdout, prepare an isolated candidate configuration, compare under the same acceptance contract, independently review, then let the consumer's existing owner process decide promotion. Preserve the prior configuration and rollback/monitoring evidence. This supports measured self-improvement without automatic weight training, evaluator rewriting or self-granted permissions.

## Version 0.2 additions

Optional area/requirements metadata, backend/residency/owner artifact manifests, versioned runtime identity, streaming phase timings, bounded sampled resources and explicit residency cleanup extend the contracts. See [index/reuse](EVIDENCE.md), [telemetry](PERFORMANCE.md) and [runtimes](RUNTIMES.md). Legacy reports remain readable; only current-version matching reports enter automatic reuse.

## Version 0.3 additions

[Machine/scenario contracts](ENVIRONMENTS.md) describe local evaluation-host hardware and explicitly owner-declared workload/power conditions. Optional `environment` evidence participates in matching; execution requires explicit scenario confirmation and matching current hardware. Plan/validate never verify load. Reusable definitions/examples stay here; consumer role assignments, device trust, acceptance and promotion remain consumer-owned. Legacy0.2 reports remain readable, current automatic reuse is0.3 only.

## Protocol0.4 diagnostic instrumentation

Reports optionally carry `diagnostics:{failureCaptures:true}` for explicitly requested private final-reply capture. No raw response/path enters the report. Diagnostic runs are fresh, excluded from ordinary automatic reuse/cache and performance-comparable only with the same instrumentation marker. Selected cases have a distinct pack identity/hash; selected completeness never establishes omitted original cases. [Private capture and inspection](FAILURES.md) defines bounded sidecars and source matching;0.2/0.3 reports remain readable as historical evidence.

## Ollama response formats

Direct model cases may set `responseFormat` to `"json"` or a JSON object schema (`type: "object"`, at most16KiB). Omit it for unconstrained generation. Reference/resolution keywords are rejected; schemas are passed to local Ollama, never fetched. The schema's semantic validity is ultimately checked by Ollama; invalid provider requests remain errors. This release does not implement a general JSON Schema validator. JSON grading is required; runner cases cannot set this field. Other runtime backends reject it before provider work instead of silently dropping it.

The adapter forwards this field as `/api/chat`'s `format` for streaming and non-streaming requests. Planning labels unconstrained/json/schema. Pack hashes include the exact format, separating cache/report identity. Prompt fixture hashes remain prompt-based so format changes cannot manufacture independent holdout coverage. Expected answers are never sent by the grader. Schemas are public test inputs: do not encode the expected answer through const/enum or other semantic constraints unless that is explicitly the task being evaluated.

`examples/smoke-schema-v1.json` is a separate ten-case structural variant of `smoke-v1.json`; only keys/types/required/additionalProperties are constrained. It preserves prompts and independent expected answers. Valid JSON can still be wrong: exact semantic grading and private failed-final capture remain unchanged. Historical unconstrained reports are not reclassified. Across modes, compare observations with configuration differences explicit; automatic equivalence is false.

Ollama documents `format: "json"` and JSON schemas at https://docs.ollama.com/capabilities/structured-outputs. Native local Ollama is the supported boundary here; no cloud claim follows.

## Coding isolation and holdout limits

Gauntlet provides an external-runner contract, not coding isolation. A worktree separates files for coordination; it does not enforce access restrictions. The selected runner must implement an independently enforced execution boundary, protected workspaces, candidate/test separation and trusted grading outside candidate control. Process supervision, hashes and owner registration do not supply those safeguards.

Holdout integrity is procedural in the protocol itself. Separate maintenance, fixture identities and configuration hashes identify declared inputs and prevent duplicate coverage from being counted as independent; they cannot prove that an agent never read hidden tests, expected answers or grader code. Claims of inaccessible holdouts require runner-specific evidence of an enforced boundary, including denied filesystem/network/tool access and a grader outside the agent's authority. Until such a runner is implemented and accepted, report coding isolation and hidden-test access prevention as unverified. A successful contract fixture or qualification export does not establish either property.
