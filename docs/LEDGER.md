# Run ledger and pending cases

A consumer that pins a Gauntlet release needs to know which cases of the packs it consumes it has never run, or ran in an older definition. The run ledger answers that without storing evidence: it is a small, metadata-only JSON file the **consumer** owns and commits, and Gauntlet only reads and updates it on request. Gauntlet knows no consumer; packs, ledger and profile are arguments.

## Ledger

```json
{ "schemaVersion": 1, "entries": [
  { "pack": "smoke", "packVersion": "1.0.0", "case": "json", "caseHash": "<sha256>", "profileHash": "<sha256 or null>",
    "status": "passed", "reportHash": "<sha256>", "finished": "2026-11-11T10:00:00.000Z" } ] }
```

- One entry per pack, case and profile: the latest run. `caseHash` is the hash of the full case definition; `profileHash` the evidence profile hash (null for system cases run without a model profile).
- `status` is passed or failed: a failed case was still run and graded. A result with status error (the runtime or adapter never answered) or not-run covers nothing; with repeats, every iteration must be graded.
- No prompts, outputs, timings, credentials or paths. `reportHash` links to the private report the consumer keeps.

`node bin/gauntlet.mjs ledger --ledger=evals/ledger.json --report=results/run.json --pack=packs/smoke.json` validates the saved report, refuses it unless it ran exactly that pack definition (id, version and pack hash), and records its cases. Recording the same report twice changes nothing; an older report never replaces a newer entry.

## Pending cases

`node bin/gauntlet.mjs pending --packs=a.json,b.json --ledger=evals/ledger.json [--profile=profile.json] [--max-age-days=30] [--json]` prints one line per case with no covering run and exits 1 when any are pending, 0 otherwise:

- Exit codes: 0 nothing pending, 1 pending cases listed, 2 an error (bad arguments, unreadable pack or ledger); `ledger` also exits 2 on errors. A ledger path that is a symlink is refused; the ledger is replaced atomically.
- `new`: no run of the case; `changed`: the case definition changed since its last run; `stale`: the last run is older than `--max-age-days`; `other-profile`: only other profiles ran it (with `--profile`). System cases need no model, so a run without a profile covers them under any `--profile`.

Coverage depends on the case definition and profile, not on the engine: a new Gauntlet engine does not make cases pending, while cache reuse (`run`) still requires the same engine. The consumer decides what pending means for it: a session-start reminder, a failing CI step, or a backlog record (the project harness's "Evaluation dependencies" setting runs this command). Running real models stays the consumer's owner-approved campaign.
