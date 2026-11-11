# Gauntlet Protocol

Version0.4.0 adds [bounded private failure captures and selected diagnostics](docs/FAILURES.md). Version 0.3.0 adds [reusable machine/load-scenario contracts](docs/ENVIRONMENTS.md) and scoped evidence reuse. Version 0.2.0 introduced a [generated capability index](docs/test-index.md), [conservative evidence reuse](docs/EVIDENCE.md), [performance telemetry](docs/PERFORMANCE.md) and [local runtime adapters](docs/RUNTIMES.md).

An independent TypeScript library and CLI for capability-scoped AI evaluation. It records the tested configuration, bounded execution and independent acceptance evidence. It never grants production permission or promotes a model automatically.

The [expanded general-assistant pack](docs/EXPANDED-PACK.md) defines 28 stable coverage identities and transcript-based correction cases without claiming interactive execution or hidden-test isolation.

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
node bin/gauntlet.mjs compare --reports=results/gemma-first.json,results/qwen-first.json
```

Only run after reviewing the plan and installing the model separately. Output paths must be new JSON files. The supplied ten neutral cases are smoke tests, **not a production coding or general intelligence qualification**. Heldout labels require the owner to keep actual acceptance cases separate from tuning data; labels alone do not provide isolation.

[Protocol and runner contract](docs/PROTOCOL.md) · [Mac comparison profiles](docs/MAC-PROFILES.md) · [Procedures](docs/agents/procedures.md) · [Backlog](docs/BACKLOG.md) · [Audit register](docs/audits/README.md).

Development checks: `npm run typecheck`, `npm run build`, `npm test`. Tests use fake providers and neutral subprocess fixtures; they do not run a model. No UI, hosted service, telemetry, model downloads or global Ollama setting changes are included.

Failure captures are off by default and separate from public evidence. Use a new external private directory and explicit fresh execution; [diagnostic selection/inspection](docs/FAILURES.md) preserves grading and records only failed final replies, not prompts or hidden reasoning. Development job telemetry follows the optional [shared rule](docs/agents/work-usage.md); native client counters remain unknown until actually exposed.

Ollama structured outputs are explicit per case: `responseFormat: "json"` or an object schema. The separate `examples/smoke-schema-v1.json` pack tests schema-constrained answers without changing the original smoke pack. Plan it with `node bin/gauntlet.mjs plan --pack=examples/smoke-schema-v1.json --profile=examples/profiles/gemma4-12b.json --allow-models`. See [format contracts](docs/PROTOCOL.md#ollama-response-formats). Planning makes no model calls.

Development backlog records live in `docs/work/records`; task JSON owns upfront steps, effort and status. Run `npm run work:build` after source changes and `npm run check:work` to validate the generated ledger. [Planning rules](docs/BACKLOG-RULES.md#optional-upfront-feature-plans) preserve parent acceptance and owner agreement for material changes; [usage guidance](docs/agents/work-usage.md) covers private step-level development metadata independently of evaluation runtime telemetry.
