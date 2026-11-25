# Releases

## 0.11.1 — coding runner and executor errors

Fixes found by a consumer's review of the 0.11.0 adoption (#107):

- B-004: when no container engine or image is available, `examples/coding-v1/runner.mjs` now writes an `error` result that names the fix (`complete: false`, 0 checks) before any model call. It used to ask the model and then crash without a report. The runner accepts `--docker=PATH`.
- B-005: the container executor now rejects when the engine client fails to start, instead of returning exit code `null`. The coding and OpenSCAD graders report an executor rejection as `error` (`executor-error`), never as a graded `failed` that counts as covering the case, and both reference runners report it as `error`. Exit codes never mark an executor fault, because the candidate controls its own.

The engine hash is unchanged. Pack definitions and grading of candidate output are unchanged. No real-model run.

Pack case changes since 0.11.0:

- Every pack: added none; changed none; removed none.

## 0.11.0 — domain packs: italian-quality, cad-3d, code-review

Three new independently versioned packs, each with regression and holdout cases and a deterministic grader proven by fixtures. Holdouts are public and therefore contamination-exposed (owner decision H1):

- `italian-quality@1.0.0` (area `language-translation`): `summary-service-regression`, `summary-report-holdout`, `rewrite-anglicisms-regression`, `rewrite-bureaucratic-holdout`, `register-formal-regression`, `register-informal-holdout`. Italian-only free text graded by `rubric-v1`.
- `cad-3d@1.0.0` (area `cad-3d`): `slicer-wall-layers-regression`, `slicer-flow-limit-holdout`, `material-outdoor-bracket-regression`, `material-damp-isolation-holdout`, `tolerance-clearance-pin-regression`, `tolerance-shrinkage-compensation-holdout` (exact-answer questions), and `spacer-cylinder-regression`, `l-bracket-regression`, `open-tray-holdout`, `flanged-bushing-holdout` (OpenSCAD coding tasks). The reference runner `examples/cad-3d-v1/runner.mjs` renders each candidate in a throwaway container (pinned `openscad/openscad:2021.01`, no network). The grader measures the STL bounding box and volume outside the container. A missing container engine or image gives an `error` result that names the fix. CI uses stand-ins. A real render of every fixture passed on the owner's Mac on 2026-11-25. Known limitation: only the bounding box and volume are measured, so a wrong shape with the right extents and volume passes, for example a mirrored L-bracket.
- `code-review@1.0.0` (area `code-review`): `sql-and-bounds-regression`, `race-and-leak-regression`, `path-and-nan-regression`, `command-and-retry-holdout`, `listener-and-mutation-holdout`, `token-and-cache-holdout`. Invented code excerpts with seeded security, logic, concurrency and resource defects, graded by `defects-v1`.

Also:

- New expected kind `defects`, with the deterministic defect-finding grader `src/defects.ts` (catalog grader `defects-v1`). A finding covers at most 10 lines, and every excerpt is longer than 20 lines, so whole-file or every-line answers fail.
- B-003: the coding grader now returns at its timeout.

The engine hash changes, so automatic cache reuse requires 0.11.0 evidence. The generated catalog lists 108 cases. Existing pack definitions are unchanged. No real-model run.

Pack case changes since 0.10.0:

- `italian-quality@1.0.0`, `cad-3d@1.0.0`, `code-review@1.0.0`: new packs; every case above is added.
- Every other pack: added none; changed none; removed none.

## 0.10.0 — domain packs: coding, logic-math, embedded

Three new independently versioned packs, each with regression and holdout cases and a deterministic grader proven by fixtures:

- `coding@1.0.0` (area `coding`): `parse-duration-regression`, `slugify-regression`, `merge-intervals-holdout`, `dependency-order-holdout`. Python and TypeScript functions graded out of process against expected values the candidate never sees; the reference runner `examples/coding-v1/runner.mjs` asks a loopback Ollama model and runs each candidate in a throwaway container (Docker Desktop or colima). Holdouts are public and therefore contamination-exposed (owner decision H1).
- `logic-math@1.0.0` (area `math` and `logic-planning`): `jars-total-regression`, `price-change-regression`, `multiples-sum-holdout`, `fraction-sum-holdout`, `race-order-regression`, `task-schedule-regression`, `digit-swap-holdout`, `key-box-holdout`. Exact-answer cases.
- `embedded@1.0.0` (new core area `embedded`): `blink-millis-esp32-regression`, `debounce-toggle-uno-regression`, `pwm-fade-esp32-holdout`, `serial-command-uno-holdout` (Arduino and ESP32 sketches: static checks and an arduino-cli compile against arduino:avr 1.8.6 and esp32:esp32 3.0.7, marked expensive), `led-blink-gpiozero-regression`, `pwm-servo-rpigpio-regression`, `button-toggle-gpiozero-holdout`, `edge-counter-rpigpio-holdout` (Raspberry Pi Python: byte-compilation and AST checks). Nothing is uploaded or run; the reference runner is `examples/embedded-v1/runner.mjs`.

Also: the deterministic rubric grader for free text (`src/rubric.ts`), and the area taxonomy gains `embedded` (minor protocol change). The engine hash changes, so automatic cache reuse requires 0.10.0 evidence. The generated catalog lists 86 cases. Existing pack definitions and grading are unchanged. No real-model run.

Pack case changes since 0.9.3:

- `coding@1.0.0`, `logic-math@1.0.0`, `embedded@1.0.0`: new packs; every case above is added.
- Every other pack: added none; changed none; removed none.

## 0.9.1 — harness 8.17.0

Development harness reconciled to `8.17.0` (suggested pauses in `work-usage`, done-steps table and Who/Agent cell rules, and `check:freshness` empty-backlog milestone prompt). No package code, protocol, grading or evidence change; the engine hash is unchanged. No real-model run.

## 0.9.0 — focused evaluation packs

Six independently versioned packs add focused regression and holdout coverage: `structured-output-robustness@1.0.0` (six constrained JSON/schema cases), `tool-use@1.0.0` (six selection/argument cases), `bilingual-it-en@1.0.0` (four Italian/English cases), `multi-step-agent@1.0.0` (four deterministic scripted-runner cases), `refusal-permission@1.0.0` (four refusal/permission cases) and `long-context@1.0.0` (four varied-depth retrieval cases). The generated catalog contains all 66 cases. Existing pack definitions, grading and evidence remain unchanged. No real-model run.

## 0.8.0 — incremental runs

Incremental campaigns (F-011): `run --pending --ledger=<file>` executes new, changed, stale or identity-mismatched cases while listing ledger-current cases as the neutral `not-run / skipped-current`; ordinary report shape and pass/fail exit semantics remain intact. Private run reports are atomically checkpointed after each finished case, and `run --resume=<report>` carries forward only graded results when the source, pack, evaluator, configuration, registry, scenario and available runtime/model identity still match. Partial and resumed reports merge only their graded cases into a ledger; the API and CLI report `added`, `replaced`, `kept-newer` or `unchanged`, with newer evidence and a deterministic equal-time report-hash tie-breaker winning conflicts. The engine hash changes, so automatic cache reuse requires 0.8.0 evidence. No real-model run.

Pack case changes since 0.7.1:

- `general-assistant-expanded@1.0.0`: added none; changed none; removed none.
- `neutral-smoke-schema@1.0.0`: added none; changed none; removed none.
- `neutral-smoke@1.1.0`: added none; changed none; removed none.

## 0.7.1

Development harness reconciled to 5.4.0 (effort totals, estimate calibration reminder, actual effort column, queue-ordered backlog). No package code, protocol, grading or evidence change; the engine hash is unchanged. No real-model run.

## 0.7.0

Identity-bound ledger coverage (B-002, docs/LEDGER.md): ledger schema 2 records each run's model digest, runtime hash (`runtimeHash(report)`: identity proof and runtime), scenario hash (`scenarioHash(environment)` or null) and an optional opaque consumer `--source-key`; `gauntlet pending` and `pendingCases` take the intended identity (`--model-digest`, `--runtime-hash`, `--scenario-hash=<sha256|none>`, `--source-key`) and name `model-changed`, `runtime-changed`, `scenario-changed` or `source-changed`. Unset fields do not constrain. Every case outside the system layer follows the model digest and runtime, every case follows the scenario, and every runner case (any layer) follows the source key. The runtime hash includes the Node version, so a Node upgrade makes model cases `runtime-changed` for a consumer that passes `--runtime-hash`. `gauntlet identity --report=…` prints the identity a report records. Recording the same report again with a different source key is refused; `sha256:` digest prefixes compare equal. Schema 1 ledgers stay readable as unknown identity, which never covers a constrained query; recording upgrades the file to schema 2. Consumers adopt it by passing the identity they intend to run under; without it, behaviour matches 0.6.0. `docs/LEDGER.md` now ships in the package. The engine hash changes with the new exports, so cache reuse needs evidence produced by 0.7.0. No real-model run.

## 0.6.0

Run ledger and pending cases (F-010, docs/LEDGER.md): `gauntlet ledger` records into a consumer-owned, metadata-only ledger the cases a saved report ran, refusing reports of another pack definition; `gauntlet pending` lists new, changed, stale or other-profile cases of the given packs and exits 1 when any are pending, 2 on an error. Only graded results (passed or failed) cover a case: an error from an unanswering runtime covers nothing. System cases run without a profile stay covered under any model profile. Consumer-agnostic. Grading, packs and protocol 0.4 evidence are unchanged; the engine hash changes with the new exports, so cache reuse needs evidence produced by 0.6.0 (ledger coverage does not depend on the engine). No real-model run.

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
