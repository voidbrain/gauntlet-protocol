# Gauntlet Protocol

Version 0.10.0 adds the coding, logic-math and embedded domain packs; version 0.9.0 added six focused evaluation packs; version 0.8.0 added incremental pending-only runs, private checkpoints, interrupted-campaign resume and observable partial ledger merges. Version 0.4.0 added [bounded private failure captures and selected diagnostics](docs/FAILURES.md); earlier releases added [reusable machine/load-scenario contracts](docs/ENVIRONMENTS.md), a [generated capability index](docs/test-index.md), [conservative evidence reuse](docs/EVIDENCE.md), [performance telemetry](docs/PERFORMANCE.md) and [local runtime adapters](docs/RUNTIMES.md).

An independent TypeScript library and CLI for capability-scoped AI evaluation. It records the tested configuration, bounded execution and independent acceptance evidence. It never grants production permission or promotes a model automatically.

The [expanded general-assistant pack](docs/EXPANDED-PACK.md) defines 28 stable coverage identities and transcript-based correction cases without claiming interactive execution or hidden-test isolation.

The generated [pack catalog](docs/test-index.md) also lists six focused 1.0.0 packs with regression and holdout coverage:

- `structured-output-robustness` — six constrained JSON and schema cases;
- `tool-use` — six tool-selection and argument cases;
- `bilingual-it-en` — four Italian/English language-control cases;
- `multi-step-agent` — four deterministic scripted-runner cases;
- `refusal-permission` — four refusal and permission-boundary cases;
- `long-context` — four retrieval cases with facts at varied context depths.

The `coding` pack holds four Python and TypeScript tasks on the coding layer, graded out of process against expected values the candidate never sees. The reference runner (`examples/coding-v1/runner.mjs`) asks a local model and grades each case in a throwaway container, so running it needs Docker Desktop or colima ([setup](docs/guides/container-engine.md)); its public holdout cases are contamination-exposed ([coding grader](docs/PROTOCOL.md#coding-pack-grader)).

The `embedded` pack holds Arduino and ESP32 sketches graded by static checks and an arduino-cli compile against pinned cores, and Raspberry Pi Python graded by byte-compilation and AST checks; nothing runs on hardware. Its reference runner (`examples/embedded-v1/runner.mjs`) asks a local model; sketch cases need arduino-cli with the pinned cores ([setup](docs/guides/arduino-cli.md), [runner](docs/PROTOCOL.md#embedded-pack-runner)).

The `logic-math` pack holds eight exact-answer cases: arithmetic under `math`, puzzles, constraints and scheduling under `logic-planning`. Holdout cases in these public packs are exposed examples, not unseen holdouts.

The [run ledger](docs/LEDGER.md) lets a consumer list the cases of the packs it consumes that it has not run in their current definition, or under the model, runtime, machine scenario or consumer source it now intends (`pending`), without storing evidence.
Use `run --pending --ledger=results/ledger.json` to execute only those cases while retaining the complete pack identity in the report; ledger-current cases are explicitly reported as `not-run / skipped-current`.
Runs atomically checkpoint each finished case to their private output. Resume an interrupted campaign with `run --resume=results/interrupted.json` and a new `--out`; the pack, source and execution identity must still match.
Recording a partial or resumed report merges only its graded cases into the ledger and reports whether each entry was added, replaced, unchanged or kept because existing evidence was newer.

The [repeatable comparison contract](docs/COMPARISONS.md) defines candidate identity, compatibility and repetition rules without running a campaign or selecting a winner.

Requires Node 24. Install with `npm ci`, then `npm run build`. This project adopts [project-harness](https://github.com/voidbrain/project-harness) 4.8.0 for development. The harness does not depend on Gauntlet. Consumer projects own their domain packs and adapters.

```sh
node bin/gauntlet.mjs validate --pack=examples/smoke-v1.json --profile=examples/profiles/gemma4-12b.json
node bin/gauntlet.mjs validate --pack=examples/general-assistant-expanded-v1.json --profile=examples/profiles/gemma4-12b.json
node bin/gauntlet.mjs compare --reports=results/candidate-a.json,results/candidate-b.json
node bin/gauntlet.mjs plan --pack=examples/smoke-v1.json --profile=examples/profiles/gemma4-12b.json --limits=examples/limits-day.json
```

These commands validate and plan; they do not contact a model, download weights or execute registered runners. An explicit model run looks like this:

```sh
node bin/gauntlet.mjs run --pack=examples/smoke-v1.json --profile=examples/profiles/gemma4-12b.json --limits=examples/limits-day.json --execute --allow-models --telemetry --fresh --out=results/gemma-first.json
node bin/gauntlet.mjs run --pack=examples/smoke-v1.json --profile=examples/profiles/gemma4-12b.json --limits=examples/limits-day.json --execute --allow-models --pending --ledger=results/ledger.json --out=results/gemma-pending.json
node bin/gauntlet.mjs compare --reports=results/gemma-first.json,results/qwen-first.json
```

Only run after reviewing the plan and installing the model separately. Output paths must be new JSON files. The supplied ten neutral cases are smoke tests, **not a production coding or general intelligence qualification**. Heldout labels require the owner to keep actual acceptance cases separate from tuning data; labels alone do not provide isolation.

[Protocol and runner contract](docs/PROTOCOL.md) · [Mac comparison profiles](docs/MAC-PROFILES.md) · [Procedures](docs/agents/procedures.md) · [Backlog](docs/BACKLOG.md) · [Audit register](docs/audits/README.md).

Development checks: `npm run typecheck`, `npm run build`, `npm test`. Tests use fake providers and neutral subprocess fixtures; they do not run a model. No UI, hosted service, telemetry, model downloads or global Ollama setting changes are included.

Failure captures are off by default and separate from public evidence. Use a new external private directory and explicit fresh execution; [diagnostic selection/inspection](docs/FAILURES.md) preserves grading and records only failed final replies, not prompts or hidden reasoning. Development job telemetry follows the optional [shared rule](docs/agents/work-usage.md); native client counters remain unknown until actually exposed.

Ollama structured outputs are explicit per case: `responseFormat: "json"` or an object schema. The separate `examples/smoke-schema-v1.json` pack tests schema-constrained answers without changing the original smoke pack. Plan it with `node bin/gauntlet.mjs plan --pack=examples/smoke-schema-v1.json --profile=examples/profiles/gemma4-12b.json --allow-models`. See [format contracts](docs/PROTOCOL.md#ollama-response-formats). Planning makes no model calls.

Development backlog records live in `docs/work/records`; task JSON owns upfront steps, effort and status. Run `npm run work:build` after source changes and `npm run check:work` to validate the generated ledger. [Planning rules](docs/BACKLOG-RULES.md#optional-upfront-feature-plans) preserve parent acceptance and owner agreement for material changes; [usage guidance](docs/agents/work-usage.md) covers private step-level development metadata independently of evaluation runtime telemetry.
