# Machines, load scenarios and shared evidence

Gauntlet owns reusable machine profiles, load-scenario definitions and their evidence identity. Consumers select those definitions and keep their own machine assignments, task requirements, permissions and acceptance thresholds. Definitions are data: no app commands, stress generators, schedules or access grants.

## Machine profile

`gauntlet machine --id=workstation` prints a versioned local evaluation-host profile: platform, architecture, CPU model, total memory bytes and an accelerator declaration. Inspection cannot identify every accelerator reliably, so it emits `other`; the owner reviews and may replace that value with `cpu`, `integrated-gpu`, `discrete-gpu` or `unified-memory-gpu`. No hostname, serial, paths, app titles or credentials are collected. Save the output privately and review its explicit ID/version before reuse. Machine IDs are owner labels, not authenticated device identities. Two equivalent machines can still have distinct host identity in the existing private cache key.

The profile must match the current evaluation host before execution or cache lookup. This is a local hardware compatibility check, not remote-worker attestation, a device trust registry or an inference-host selector. A registered remote adapter still needs its own independently current runtime/execution identity; it cannot inherit remote trust from this profile.

## Load scenarios

`examples/scenarios/` supplies baseline, minimal, moderate and heavy competing-load definitions. Each has a versioned ID, description, coarse workload categories and declared power condition. These are portable examples, not claims that a particular app mix produces the same contention on every host. Copy/change a definition deliberately for a different workload; the full definition participates in evidence matching even if its ID/version is unchanged.

Time/location labels such as office, home or night belong to a consumer's assignment map. An awake workstation with minimal competition is different from a sleeping/unavailable workstation. A dedicated home host usually needs one baseline, not a duplicated day/night matrix.

Workload categories and power are explicitly **owner-declared**, not independently detected or proven by this API. Plan/validate report `environmentVerified:false`. Execution requires `--confirm-scenario` (API: `scenarioConfirmed:true`) for the selected machine/scenario pair. The owner must check the real condition at run time. Host/device telemetry, when enabled, records observations with its existing attribution/sampling limits; it does not automatically classify or certify stress. No apps are launched/closed and no power/sleep settings are changed.

```sh
# Inspection and planning only: no model generation.
gauntlet machine --id=workstation > /private/tmp/gauntlet-machine.json
gauntlet plan --pack=examples/smoke-v1.json --profile=examples/profiles/gemma4-12b.json --machine-profile=/private/tmp/gauntlet-machine.json --scenario=examples/scenarios/moderate-load.json --limits=examples/limits-day.json
```

A separately authorized run uses the same arguments plus `--execute --allow-models --confirm-scenario --telemetry --fresh --out=<new-private-report.json>`. Case/model/expensive execution flags and budgets still apply; confirmation grants no tool/production permission. Invalid or wrong-host declarations fail before model metadata or execution. Mutation during preflight/generation invalidates the request/acceptance.

Profiles may declare both `weightsBytes` and `minimumMemoryBytes`; they are an inseparable pair, and minimum memory cannot be smaller than the weights. When both a sized profile and an environment are supplied, `plan` reports `hostFit` as `fits` or `misfit`. Every case in a memory-misfit plan is ineligible, and direct execution rejects the same mismatch before any provider request. Legacy profiles without sizing remain valid but produce `hostFit: unknown`; this is not evidence that they fit.

## Small-host presets

The example profiles `small-host-cpu-7b-q4.json` and `small-host-gpu-14b-q4.json` pair 7B/14B Q4 configurations with 4K/8K contexts and explicit memory requirements. Their matching files under `examples/machines/` demonstrate CPU and small discrete-GPU declarations. These are portable shapes, not detected hardware or promises that a particular model build uses exactly the stated bytes: replace the generic model, measured weight size and machine identity with owner-reviewed values before execution.

`examples/limits-slow-host.json` allows three minutes per case but selects at most four cases in a suite. Use a deliberate `--only` selection when a larger pack needs coverage across several bounded runs; the preset does not redefine the pack or turn partial evidence into qualification.

## Reuse and comparison

Reports retain the machine and scenario definitions. Complete matching definitions are included in the cache key, alongside existing evaluator/case/grader/profile/runtime/source/limits/host identity. Common evidence can therefore be reused by multiple authorized consumers of the same cache; each applies its own acceptance criteria. This does not require a shared online service or copying project-private test data.

A different machine/scenario definition, or scoped versus unscoped evidence, cannot silently reuse the result. Legacy0.2 evidence remains readable but does not enter current automatic reuse; historical evidence without a scenario is not evidence for any requested load. Reuse preserves the original timestamp and `performanceMeasuredNow:false`. Run `--fresh` for each new performance observation, even when a functional result is reusable. Matching labels and owner confirmation are not proof that current CPU/memory pressure equals the original observation.

`compare` retains environment definitions/hash and `taskContractMatchesFirst` separately from `comparableToFirst`. Changed scenarios may share the same task contract for an intentional load comparison, while they are not equivalent execution environments. It neither chooses a winner nor normalizes resource costs across different machines. Reviewed exports retain the declared environment scope; consumers must decide whether it meets their role's requirements.

Use equal tasks/model settings and total budgets for an initial load comparison. Day/night files are time/repetition/token **budgets**, not environment definitions. Longer endurance, cold/warm residency, battery operation and sleep/wake recovery are separate, deliberately selected dimensions. Avoid a full Cartesian product; screen useful candidates first. Load results remain unmeasured until an actual authorized campaign records them.
