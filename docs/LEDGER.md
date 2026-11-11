# Run ledger and pending cases

A consumer that pins a Gauntlet release needs to know which cases of the packs it consumes it has never run, or ran in an older definition. The run ledger answers that without storing evidence: it is a small, metadata-only JSON file the **consumer** owns and commits, and Gauntlet only reads and updates it on request. Gauntlet knows no consumer; packs, ledger and profile are arguments.

## Ledger

```json
{ "schemaVersion": 2, "entries": [
  { "pack": "smoke", "packVersion": "1.0.0", "case": "json", "caseHash": "<sha256>", "profileHash": "<sha256 or null>",
    "status": "passed", "reportHash": "<sha256>", "finished": "2026-11-11T10:00:00.000Z",
    "modelDigest": "<digest or null>", "runtimeHash": "<sha256>", "scenarioHash": "<sha256 or null>",
    "sourceKey": "<opaque token or null>" } ] }
```

- One entry per pack, case and profile: the latest run. `caseHash` is the hash of the full case definition; `profileHash` the evidence profile hash (null for system cases run without a model profile).
- `status` is passed or failed: a failed case was still run and graded. A result with status error (the runtime or adapter never answered) or not-run covers nothing; with repeats, every iteration must be graded.
- No prompts, outputs, timings, credentials or paths. `reportHash` links to the private report the consumer keeps.

### Run identity (schema 2)

Each entry records the identity of the run that covered it, taken from the admitted report (and the `ledger` call for the source key):

| Field | Value | Changes when |
|---|---|---|
| `modelDigest` | the report's model digest, or null | the model weights change (a re-pull, another quantization file) |
| `runtimeHash` | `runtimeHash(report)`: sha256 of the report's `identity` (provider identity proof, or null) and `runtime` (provider, Node, platform, architecture) | the provider or its version, Node, the platform or architecture, or the model metadata proof change |
| `scenarioHash` | `scenarioHash(report.environment)`: sha256 of the machine profile and load scenario, or null for a run without one | the machine profile or the declared load scenario changes |
| `sourceKey` | the consumer's opaque token from `--source-key`, or null | the consumer's system under test changes (the consumer decides; Gauntlet only compares) |

The source key is a bounded token (letters, digits and `. _ : + -`, up to 128 characters, no spaces or path separators), such as a commit, a content hash or the sha256 `run --source-key` already takes. It is never a consumer name, a path or free text.

A schema 1 ledger still validates. Its entries are read as unknown identity: they cover a query that sets no identity field and never cover one that does. Recording into it writes schema 2 and keeps those entries as they were, without identity fields. In schema 2 an entry holds all four identity fields or none.

`node bin/gauntlet.mjs ledger --ledger=evals/ledger.json --report=results/run.json --pack=packs/smoke.json [--source-key=<token>]` validates the saved report, refuses it unless it ran exactly that pack definition (id, version and pack hash), and records its cases. Recording the same report twice changes nothing, and recording it again with a different `--source-key` is refused (the report does not carry the key, so the first recording binds it); an older report never replaces a newer entry.

## Pending cases

`node bin/gauntlet.mjs pending --packs=a.json,b.json --ledger=evals/ledger.json [--profile=profile.json] [--max-age-days=30] [--model-digest=<digest>] [--runtime-hash=<sha256>] [--scenario-hash=<sha256|none>] [--source-key=<token>] [--json]` prints one line per case with no covering run and exits 1 when any are pending, 0 otherwise:

- Exit codes: 0 nothing pending, 1 pending cases listed, 2 an error (bad arguments, unreadable pack or ledger); `ledger` also exits 2 on errors. A ledger path that is a symlink is refused; the ledger is replaced atomically.
- `new`: no run of the case; `changed`: the case definition changed since its last run; `stale`: the last run is older than `--max-age-days`; `other-profile`: only other profiles ran it (with `--profile`). System cases need no model, so a run without a profile covers them under any `--profile`.
- Identity, checked after the reasons above and before `stale`, in this order: `model-changed` and `runtime-changed` for every case outside the system layer (it may call a model), `scenario-changed` for all, and `source-changed` for every case with a runner (it runs the consumer's code, on any layer). `sha256:<hex>` and `<hex>` are the same model digest. A reason applies when its flag is given and the latest covering entry differs from it, or has unknown identity. A flag left out does not constrain; `--scenario-hash=none` asks for a run without a scenario. A malformed flag is an error (exit 2).
- The consumer supplies the intended identity: `node bin/gauntlet.mjs identity --report=<saved report>` prints the `modelDigest`, `runtimeHash` and `scenarioHash` a report records (exit 2 on an error), so a consumer can take them from its latest report; `scenarioHash` of the environment it will select, and its own source key. The API takes the same fields as `pendingCases(packs, ledger, { modelDigest, runtimeHash, scenarioHash, sourceKey })`.

Coverage depends on the case definition, profile and run identity, not on the engine: a new Gauntlet engine does not make cases pending, while cache reuse (`run`) still requires the same engine. The consumer decides what pending means for it: a session-start reminder, a failing CI step, or a backlog record (the project harness's "Evaluation dependencies" setting runs this command). Running real models stays the consumer's owner-approved campaign.
