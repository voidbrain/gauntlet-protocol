# Gauntlet Protocol

An independent TypeScript library and CLI for capability-scoped AI evaluation. It records the tested configuration, bounded execution and independent acceptance evidence. It never grants production permission or promotes a model automatically.

Requires Node 24. Install with `npm ci`, then `npm run build`. This project adopts [project-harness](https://github.com/voidbrain/project-harness) 4.2.1 for development. The harness does not depend on Gauntlet. Consumer projects own their domain packs and adapters.

```sh
node bin/gauntlet.mjs validate --pack=examples/smoke-v1.json --profile=examples/profiles/gemma4-12b.json
node bin/gauntlet.mjs plan --pack=examples/smoke-v1.json --profile=examples/profiles/gemma4-12b.json --limits=examples/limits-day.json
```

These commands validate and plan; they do not contact a model, download weights or execute registered runners. An explicit model run looks like this:

```sh
node bin/gauntlet.mjs run --pack=examples/smoke-v1.json --profile=examples/profiles/gemma4-12b.json --limits=examples/limits-day.json --execute --allow-models --out=results/gemma-first.json
node bin/gauntlet.mjs compare --reports=results/gemma-first.json,results/qwen-first.json
```

Only run after reviewing the plan and installing the model separately. Output paths must be new JSON files. The supplied ten neutral cases are smoke tests, **not a production coding or general intelligence qualification**. Heldout labels require the owner to keep actual acceptance cases separate from tuning data; labels alone do not provide isolation.

[Protocol and runner contract](docs/PROTOCOL.md) · [Mac comparison profiles](docs/MAC-PROFILES.md) · [Procedures](docs/agents/procedures.md) · [Backlog](docs/BACKLOG.md) · [Audit register](docs/audits/README.md).

Development checks: `npm run typecheck`, `npm run build`, `npm test`. Tests use fake providers and neutral subprocess fixtures; they do not run a model. No UI, hosted service, telemetry, model downloads or global Ollama setting changes are included.
