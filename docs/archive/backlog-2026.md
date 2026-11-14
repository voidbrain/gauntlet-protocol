# Closed records, 2026

### F-001

**Independent evaluation protocol and bounded CLI**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P1 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No remaining action. Protocol release accepted on its own deterministic evidence.

| | |
|---|---|
| **Issue** | Capability qualification needs bounded, comparable and reviewable evidence distinct from system regressions. |
| **Reproduce** | Validate and plan neutral packs, run trusted fixtures and compare frozen results. |
| **Check** | Strict inputs; explicit execution and cost opt-ins; bounded process/provider calls; unknown and skipped evidence preserved; reviewed exports; no consumer dependency. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Source/CLI and sixteen deterministic tests pass locally. Core harness 4.2.1 adopted with project settings only. First independent report-only review identified four issues; committed regressions 34371e7 failed before fixes and pass after. Follow-up review found cross-capability holdout reuse; committed reproduction precedes its global fixture-exclusion fix. Review: fresh-context report-only review completed, all five findings resolved; [review](../reviews/2026-11-09-protocol-v1.md). CI 42533767427 passed Node24 validate at exact head 824a5d9, merged in PR #1. No remaining protocol-release action; no real-model qualification claimed. NERV integration is consumer-owned and never a release gate. No live campaign is required for protocol acceptance.

**Estimates:** Small remaining effort at closure: no work remains. Initial 2–3 day estimate was not a measured duration.

| Field | Value |
|---|---|
| PR / evidence | [PR #1](https://github.com/voidbrain/gauntlet-protocol/pull/1); failing review regressions 34371e7; local 16-test acceptance |
| Opened | 2026-11-09 |
| Verification | Unit/integration: 16 deterministic tests, typecheck/build and harness checks passed in CI 42533767427 on 2026-11-08 UTC. Review: independent report-only review, five findings resolved. |
| Reviewed | 2026-11-09 |

</details>

---

## Reconciliation addendum, 2026-11-09

F-001 was archived by [PR #2](https://github.com/voidbrain/gauntlet-protocol/pull/2), CI 42534060898 validate passed. The original record remains unchanged. Subsequent cancellation repair is separately owned by B-001.


### B-001

**Owner cancellation leaves detached evaluation runners alive**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P1 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No remaining action. Cancellation fix released as v0.1.1.

| | |
|---|---|
| **Issue** | SIGINT/SIGTERM of the outer CLI bypassed detached runner cleanup and its deadline timer. |
| **Reproduce** | Launch a sleeping registered runner, signal its owner and probe the runner PID. |
| **Check** | Both signals terminate and reap the active owned process group, leave later cases not-run, preserve incomplete evidence and remove signal handlers; no model calls. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Catch suite SIGINT/SIGTERM with an abort controller, combine HTTP cancellation signals, kill/reap owned external groups, stop subsequent work and remove listeners in finally. Upstream 0.1.1; no consumer adoption gate. SIGKILL/machine-loss and independently detached descendants remain explicit platform limits. Review: fresh-context report-only review found no remaining issues; both signal regressions and independent fake-provider abort/listener probe pass. [Review](../reviews/2026-11-09-cancellation.md). CI 42534614317 validate passed Node24 at exact head 7c8d87e, merged in PR #3; v0.1.1 published. No remaining upstream action.

**Estimates:** Small remaining effort at closure: no work remains; initial under-one-day estimate was not a measured campaign duration.

| Field | Value |
|---|---|
| PR / evidence | [PR #3](https://github.com/voidbrain/gauntlet-protocol/pull/3); Test: test/cancellation.test.ts; f062c28 committed both failing signal regressions before fix. |
| Opened | 2026-11-09 |
| Verification | Unit/integration: both immutable signal regressions pass locally after fix; Review: independent report-only review passed; CI 42534614317 passed all 18 deterministic tests and build/typecheck/harness checks on Node24. |
| Reviewed | 2026-11-09 |

</details>

---

B-001 reconciliation: [PR #4](https://github.com/voidbrain/gauntlet-protocol/pull/4), documentation only; implementation acceptance remains PR #3 / CI 42534614317.


### F-002

**Generated capability index and conservative evidence reuse**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No remaining owned implementation action; released as v0.2.0.

| | |
|---|---|
| **Issue** | Generated capability index and conservative evidence reuse. |
| **Reproduce** | Exercise CLI/API with neutral packs and fake local runtimes. |
| **Check** | Generate a stable case/area/capability index from packs. Reuse only complete passing evidence matching current pack/grader, exact profile/runtime/model identity, environment and explicit freshness; retain original report timestamps and provenance; never reuse system results across changed sources or grant qualification. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Generate a stable case/area/capability index from packs. Reuse only complete passing evidence matching current pack/grader, exact profile/runtime/model identity, environment and explicit freshness; retain original report timestamps and provenance; never reuse system results across changed sources or grant qualification. Owned strict checks, deterministic join tests, documentation, independent review and Node24 CI42572655186 passed. Closed 2026-11-09 on v0.2.0; no downstream acceptance gate.

**Estimates:** Small remaining effort at closure: no work remains. Original 2–3 day estimate was not measured elapsed/token cost.

| Field | Value |
|---|---|
| PR / evidence | [PR #5](https://github.com/voidbrain/gauntlet-protocol/pull/5); Review: fresh-context report-only review passed after three immutable regressions068eb6f; CI42572655186 passed, merged PR #5, tagged v0.2.0. |
| Opened | 2026-11-09 |
| Verification | 2026-11-09 Unit/integration: CI42572655186 validate passed Node24 typecheck/build and all28 deterministic tests. Review: fresh-context report-only recheck passed after three immutable failing regressions068eb6f. Released v0.2.0; no live-model or consumer acceptance claimed. |
| Reviewed | 2026-11-09 |

</details>

---


### F-003

**Measured cold/warm inference and host telemetry**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No remaining owned implementation action; released as v0.2.0.

| | |
|---|---|
| **Issue** | Measured cold/warm inference and host telemetry. |
| **Reproduce** | Exercise CLI/API with neutral packs and fake local runtimes. |
| **Check** | Retain provider load/prompt/generation timing and tokens, sample host/process/model allocation with declared interval/coverage/unknown GPU values, separate cold and warm calls, bound telemetry requests and cleanup. No model run is a release gate. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Retain provider load/prompt/generation timing and tokens, sample host/process/model allocation with declared interval/coverage/unknown GPU values, separate cold and warm calls, bound telemetry requests and cleanup. No model run is a release gate. Owned strict checks, deterministic join tests, documentation, independent review and Node24 CI42572655186 passed. Closed 2026-11-09 on v0.2.0; no downstream acceptance gate.

**Estimates:** Small remaining effort at closure: no work remains. Original 2–3 day estimate was not measured elapsed/token cost.

| Field | Value |
|---|---|
| PR / evidence | [PR #5](https://github.com/voidbrain/gauntlet-protocol/pull/5); Review: fresh-context report-only review passed after three immutable regressions068eb6f; CI42572655186 passed, merged PR #5, tagged v0.2.0. |
| Opened | 2026-11-09 |
| Verification | 2026-11-09 Unit/integration: CI42572655186 validate passed Node24 typecheck/build and all28 deterministic tests. Review: fresh-context report-only recheck passed after three immutable failing regressions068eb6f. Released v0.2.0; no live-model or consumer acceptance claimed. |
| Reviewed | 2026-11-09 |

</details>

---


### F-004

**Explicit local alternative runtime adapters**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No remaining owned implementation action; released as v0.2.0.

| | |
|---|---|
| **Issue** | Explicit local alternative runtime adapters. |
| **Reproduce** | Exercise CLI/API with neutral packs and fake local runtimes. |
| **Check** | Add tested local llama.cpp and MLX-LM adapters with independently checked model artifacts, explicit runtime identity/configuration and capability limits. No implicit installation/download or provider changes; native Ollama remains default. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Add tested local llama.cpp and MLX-LM adapters with independently checked model artifacts, explicit runtime identity/configuration and capability limits. No implicit installation/download or provider changes; native Ollama remains default. Owned strict checks, deterministic join tests, documentation, independent review and Node24 CI42572655186 passed. Closed 2026-11-09 on v0.2.0; no downstream acceptance gate.

**Estimates:** Small remaining effort at closure: no work remains. Original 2–3 day estimate was not measured elapsed/token cost.

| Field | Value |
|---|---|
| PR / evidence | [PR #5](https://github.com/voidbrain/gauntlet-protocol/pull/5); Review: fresh-context report-only review passed after three immutable regressions068eb6f; CI42572655186 passed, merged PR #5, tagged v0.2.0. |
| Opened | 2026-11-09 |
| Verification | 2026-11-09 Unit/integration: CI42572655186 validate passed Node24 typecheck/build and all28 deterministic tests. Review: fresh-context report-only recheck passed after three immutable failing regressions068eb6f. Released v0.2.0; no live-model or consumer acceptance claimed. |
| Reviewed | 2026-11-09 |

</details>

---

F-002/F-003/F-004 acceptance reconciliation: [PR #6](https://github.com/voidbrain/gauntlet-protocol/pull/6), documentation only; implementation acceptance is PR #5 / CI42572655186.


## Closed 2026-11-09

### F-005

**Reusable machine profiles and load-scenario evidence scope**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No remaining owned implementation action; publishedv0.3.0 after owned CI/review.

| | |
|---|---|
| **Issue** | Common evaluation results can serve several consumers, but machine/load declarations need reusable contracts and explicit evidence identity rather than duplicated consumer-only plans. |
| **Reproduce** | Plan and run a neutral fixture with machine/scenario declarations, then request reuse from another consumer, a different scenario and a mismatched host. |
| **Check** | Strict non-executable machine/scenario contracts; local host compatibility and explicit owner load confirmation before probes/reuse; report/cache/compare/export preserve scope; full definition changes and unscoped evidence cannot stand in for requested conditions. CLI and library fixtures verify the joins; legacy evidence stays readable; no app, model or power setting is changed. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Implemented for0.3.0: [reusable environment contract](../ENVIRONMENTS.md), neutral load examples, machine inspection and explicit current owner scenario confirmation. Complete definitions bind evidence; original host/runtime/source identity and authorization remain. Performance comparisons require fresh measurements; declarations are not independent load verification. Publishedv0.3.0 at b605107 after PR7 exacthead170611f / CI42607576561 passed. Closed 2026-11-09 on the published tag, independently of consumers.

**Estimates:** Small remaining effort, estimated2026-11-09: implementation and seven focused neutral joins pass; independent review, final CI and publication are complete; no remaining effort. No live campaign estimate or spend is implied.

| Field | Value |
|---|---|
| PR / evidence | [PR #7](https://github.com/voidbrain/gauntlet-protocol/pull/7); Acceptance reconcile: [PR #8](https://github.com/voidbrain/gauntlet-protocol/pull/8); Test: test/environments.test.ts; Review: [fresh-context report](../reviews/2026-11-09-environments-independent.md), strict-enum finding fixed after unchanged failing regressione7f7183; seven focused tests pass, no remaining findings. |
| Opened | 2026-11-09 |
| Verification | Unit/integration: seven machine/scenario/CLI/reuse fixtures pass, all35 deterministic tests plus typecheck/build/index/backlog/rule checks passed locally; CI42607576561 passed typecheck/build, all35 tests, index, packaged CLI and harness/record checks. Releasedv0.3.0. No real load/model qualification. |
| Reviewed | 2026-11-09 |

</details>

---

## Closed 2026-11-09

### F-006

**Private failed-reply diagnostics and selected reruns**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed2026-11-09 on published0.4.0 and automated private-diagnostic acceptance.

| | |
|---|---|
| **Issue** | A failed structured-output result stores only a response hash, so its final reply cannot be inspected or recovered from the report. |
| **Reproduce** | Run an invented malformed-JSON reply; inspect its report and optional new private capture directory. |
| **Check** | Explicit new external private directory, default off, final failed reply only, no prompts/expected answers/hidden reasoning; file/count/aggregate caps and no overwrite/link/checkout writes; hashes bind report/case/fixture/response; failure grades unchanged; source-qualified selected cases and fresh execution; no live model call or consumer adoption gate. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Implemented optional private sidecars and bounded inspector plus explicit case selection. Wire reports advance to0.4 with a diagnostic marker and retain older evidence reading; prepared package0.4.0 invalidates engine-mismatched reuse correctly. No old response can be recovered from its hash. Closed2026-11-09 after PR #9 exacthead886cf0c / CI42679371024 passed41 deterministic fixtures and packaging/static checks, mergedmain77f766d; v0.4.0 published. Independent fresh-context discovery gap was fixed after committed failing regression and rechecked6/6 without blocker. Adopt released harness4.4.1 optional registration rule/metadata ledger, preserving project execution/privacy requirements and marking native counters unknown.

**Estimates:** Small at closure2026-11-09; no implementation or acceptance remains. No real campaign required.

| Field | Value |
|---|---|
| PR / evidence | Release acceptance: [PR #10](https://github.com/voidbrain/gauntlet-protocol/pull/10); [PR #9](https://github.com/voidbrain/gauntlet-protocol/pull/9); Review: independent fresh-context Git-discovery finding fixed after committed regression and rechecked without blocker; |
| Opened | 2026-11-09 |
| Verification | Unit/integration: 2026-11-09 Unit/integration: PR9 exacthead886cf0c / CI42679371024 passed41 fixtures/typecheck/build/packaging/static checks, mergedmain77f766d and publishedv0.4.0. Independent recheck6/6 found no blocker. No live model or client-loading acceptance. |
| Reviewed | 2026-11-09 |

</details>

---

## Closed 2026-11-09

### F-007

**Explicit Ollama structured-output contracts**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No remaining reusable release work.

| | |
|---|---|
| **Issue** | Prompt-only JSON smoke failures do not establish schema-constrained Ollama behavior. |
| **Reproduce** | Plan/run the original smoke pack and the separate schema smoke pack with the same model profile. |
| **Check** | Explicit JSON/schema forwarding; bounded local schemas; no answer leakage; unsupported backends reject; mode changes pack/cache identity; independent grading and private captures unchanged; deterministic tests, CLI and release evidence. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed2026-11-09 after PR #11, CI42686856664 at4ea30d3, merged8d99d9f and releasedv0.4.1.43 deterministic tests/typecheck/build/package checks passed. Review: fresh-context report found preflight metadata admission ordering; unchanged committed regression316d28b fails before fix4ea30d3 and now passes; independent valid-manifest fetch spy confirmed zero probes. No remaining release action; consumer adoption is not a release gate. Optional per-case responseFormat selects JSON mode or a bounded object schema; omission preserves the original request. Separate neutral-smoke-schema pack supplies structural types without answer enums/constants. No real model call authorized or executed. Public reports retain pack identity and grades; no raw responses added. Existing identical-prompt holdout exclusions remain intact across format modes.

**Estimates:** Small at closure2026-11-09: no remaining release effort; provider support checked against official Ollama documentation, live Gemma acceptance remains unknown.

| Field | Value |
|---|---|
| PR / evidence | [PR #11](https://github.com/voidbrain/gauntlet-protocol/pull/11);42 deterministic fixtures |
| Opened | 2026-11-09 |
| Verification | Unit/integration:43 deterministic tests, typecheck/build and package checks passed CI42686856664 on2026-11-09. Review: independent report-only review, admission finding resolved. Documentation consistency reviewed against README, AGENTS, area notes, backlog rules and style guide. |
| Reviewed | 2026-11-09 |

</details>

---

## Closed 2026-11-11

### F-008

**Expand the common evaluation pack beyond ten smoke cases**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No remaining owned action. The expanded pack and deterministic release acceptance are complete.

| | |
|---|---|
| **Issue** | The ten-case neutral smoke pack is too narrow to support broad capability comparisons. |
| **Reproduce** | Owner request 2026-11-10: expand reusable evaluation coverage and make candidate comparisons reproducible. |
| **Check** | Versioned coverage includes paraphrases, ambiguity, multi-turn corrections, invalid tool arguments, refusal, prompt injection and harder held-out cases. Strict semantic grading remains separate from structural validity; deterministic grader fixtures prove both correct and deliberately incorrect answers. Held-out labels alone never imply confidentiality or isolation. |

<details>
<summary>Next action, estimates and evidence</summary>

**Initial plan 2026-11-10:** Three source-owned tasks covered contract assessment, implementation and deterministic release acceptance. No model acceptance advanced because a plan existed.

**Next action / closure evidence:** Closed 2026-11-11 after T01 defined the 28-identity general-assistant-expanded@1.0.0 matrix and transcript boundary, T02 implemented the separate pack and generated index, and T03 proved exact positive semantics across all seven capability groups plus a structurally valid negative result. PR #22 merged as f7214ec; CI 42928961766 passed all 46 deterministic tests and required validation. Original smoke packs and evidence remain unchanged. No consumer adoption, live model campaign, download or installation gates this reusable release.

**Estimates:** Small at closure: no remaining owned work. Live model availability and campaign cost remain unknown and separately scoped.

| Field | Value |
|---|---|
| PR / evidence | [PR #23](https://github.com/voidbrain/gauntlet-protocol/pull/23) closure reconciliation; [PR #22](https://github.com/voidbrain/gauntlet-protocol/pull/22) T03 acceptance; [PR #20](https://github.com/voidbrain/gauntlet-protocol/pull/20) T02 expanded pack; [PR #18](https://github.com/voidbrain/gauntlet-protocol/pull/18) T01 contract; reconciliation PRs #19 and #21 |
| Opened | 2026-11-10 |
| Closed | 2026-11-11 |
| Verification | CI 42928961766 passed 46 deterministic tests, typecheck, build, generated index and required repository checks at merged PR #22. Earlier T01/T02 CI runs 42927563424 and 42928393224 passed. No real-model qualification claimed. |
| Reviewed | 2026-11-11 |

</details>

---

## Closed 2026-11-11

### F-009

**Define repeatable candidate comparisons**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No remaining owned action. The comparison contract, summary and deterministic acceptance are complete and released in v0.5.0.

| | |
|---|---|
| **Issue** | Existing report comparison needs an explicit repeatable protocol for broader candidate evaluation rather than treating one smoke pass as competence. |
| **Reproduce** | Owner request 2026-11-10: expand reusable evaluation coverage and make candidate comparisons reproducible. |
| **Check** | Preserve exact requested/actual model, runtime, context, sampling, thinking, quantization and environment identities; repeated outcomes, failures/errors/not-run, cold/warm latency and measured input/output/cache tokens retain provenance and unknown coverage. Structural validity and semantic success are reported separately. Incompatible configurations are rejected or explicitly separated; no automatic promotion follows. |

<details>
<summary>Next action, estimates and evidence</summary>

**Initial plan 2026-11-10:** Three source-owned tasks now cover contract assessment, implementation and deterministic release acceptance. Effort is remaining work, with assumptions/uncertainty in each task; no implementation or model acceptance advances because a plan exists. Material expansion or distinct outcome splitting requires owner agreement.

**Next action / closure evidence:** Closed 2026-11-11 after T01 defined the bounded candidate matrix, compatible comparison dimensions and repetition policy (docs/COMPARISONS.md), T02 implemented the identity-rich bounded summary with explicit mismatch reasons, and T03 proved that a successful baseline stays beside explicit error and not-run counts, incomplete state and unknown output/cache usage, with a documented CLI comparison. PR #28 merged as eba3c05; CI 42973260515 passed 48 deterministic tests and required validation. No automatic promotion follows a comparison. Released in v0.5.0. No consumer adoption, live model campaign, download or installation gates this reusable release; expanded-pack campaigns remain separately scoped consumer work.

**Estimates:** Small at closure: no remaining owned work. Live model availability and campaign cost remain unknown and separately scoped.

| Field | Value |
|---|---|
| PR / evidence | [PR #29](https://github.com/voidbrain/gauntlet-protocol/pull/29) closure reconciliation and v0.5.0 release; [PR #28](https://github.com/voidbrain/gauntlet-protocol/pull/28) T03 acceptance; [PR #27](https://github.com/voidbrain/gauntlet-protocol/pull/27) reconciles T02 verification; [PR #26](https://github.com/voidbrain/gauntlet-protocol/pull/26) implements T02 comparison summary; [PR #25](https://github.com/voidbrain/gauntlet-protocol/pull/25) reconciles T01 verification; [PR #24](https://github.com/voidbrain/gauntlet-protocol/pull/24) implements T01 comparison contract; [PR #15](https://github.com/voidbrain/gauntlet-protocol/pull/15) upfront plan and harness4.7.0 reconciliation; [PR #14](https://github.com/voidbrain/gauntlet-protocol/pull/14) backlog registration |
| Opened | 2026-11-10 |
| Closed | 2026-11-11 |
| Verification | CI 42973260515 passed 48 deterministic tests, typecheck, build, generated index and required repository checks at merged PR #28. Earlier T01/T02 CI runs 42972124601 and 42972801436 passed. No real-model qualification claimed. |
| Reviewed | 2026-11-11 |

</details>

---

## Closed 2026-11-11

### F-010

**Report pending cases against a consumer’s run ledger**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No action remains; release 0.6.0 is published.

| | |
|---|---|
| **Issue** | A consumer that pins a release cannot tell which cases it has never run: NERV pinned 0.5.0 and its 28 new `general-assistant-expanded` cases went unrun and unindexed (voidbrain/nerv F-074). Each consumer would otherwise rewrite the same comparison. |
| **Reproduce** | Pin a release that adds or changes a pack in a consumer with earlier admitted reports; nothing lists the cases that lack a matching run. |
| **Check** | `gauntlet pending --packs=… --ledger=…` lists every new, changed and stale case (by pack id, version and case hash) and exits non-zero when any are pending; `gauntlet ledger record` adds entries only from admitted reports; the ledger holds metadata only. Consumer-agnostic: no consumer name, path or policy in Gauntlet. Released with a CHANGELOG entry. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-11 after PR #34 / CI 43020317739 passed, merged fc6ec02, and v0.6.0 was tagged and published on GitHub. Consumers adopt it in their own backlogs (voidbrain/nerv F-074-T07).

**Estimates:** Small remaining effort: zero; released.

| Field | Value |
|---|---|
| PR / evidence | [PR #34](https://github.com/voidbrain/gauntlet-protocol/pull/34). Test: test/ledger.test.ts. Review: fresh-context design review (Opus): one blocker (an error result from an unanswering runtime counted as covering the case, so a campaign against a down endpoint cleared every pending case) and should-fix items (errors exited 1 like pending cases; system cases stayed pending under a profile; missing repeat, newer-run and tie tests), all fixed in #34: only graded results cover, errors exit 2, system cases covered by profile-less runs, ties broken by report hash, symlinked ledger refused and writes atomic. |
| Opened | 2026-11-11 |
| Closed | 2026-11-11 |
| Verification | 2026-11-11 Unit/integration: test/ledger.test.ts (coverage by case definition and profile; new, changed, stale and other-profile; refusal of another pack definition, duplicates and extra fields; idempotent recording; CLI record and pending with exit codes 0/1/2, error results that cover nothing, repeats, newer-run-wins and ties, system cases under a profile, symlinked ledger refused, through saved reports from a fixture runtime); npm test passes. No real-model run. |
| Reviewed | 2026-11-11 |

</details>

---

## Closed 2026-11-11

### B-002

**Ledger coverage ignores model digest, runtime, machine scenario and consumer source**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No action remains; release 0.7.0 is published.

| | |
|---|---|
| **Issue** | F-010-T01 required ledger entries keyed by "model/profile/runtime/settings identity, machine scenario", but v0.6.0 keys coverage on case hash and profile hash only. A run stays covering after the model weights (digest), the runtime build, the machine scenario or the system under test changes, so `pending` reports nothing and a consumer reuses evidence that no longer matches. Found by voidbrain/nerv F-074-T08 on 2026-11-11. |
| **Reproduce** | Record a report in a ledger, then call `pendingCases` for the same pack and profile after changing the model digest, the runtime identity or the environment scenario of the run you intend to make: the case is not pending. A system case run against an older consumer source is also not pending. |
| **Check** | A ledger entry records, from the admitted report, the model digest, a runtime identity hash (`identity` and `runtime`), the environment/scenario hash or null, and an optional opaque `sourceKey` the consumer passes to `ledger record` (no consumer name, path or policy in Gauntlet). `pending` takes the intended identity and lists a case as pending with a named reason (`model-changed`, `runtime-changed`, `scenario-changed`, `source-changed`) when the latest covering entry differs; an unset field in the query does not constrain. Ledger schema version 2 reads version 1 entries as unknown identity, which never covers a constrained query. Metadata only. Fixtures for each reason, for v1 entries and for unconstrained queries. Released with a CHANGELOG entry. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-11 after PR #37 (CI 43061373995) and PR #38 merged, main CI 43062377867 passed on 5a2af1d, and v0.7.0 was tagged and published on GitHub. Consumers adopt it in their own backlogs (voidbrain/nerv F-074-T10).

**Estimates:** Small remaining effort: zero; released. Initial estimate about 1 focused day.

| Field | Value |
|---|---|
| PR / evidence | [PR #37](https://github.com/voidbrain/gauntlet-protocol/pull/37). Test: test/ledger-identity.test.ts, committed failing before the fix (adb0122). The 0.6.0 entry key-set expectation in test/ledger.test.ts changed because this record's Check adds the identity fields. Review: fresh-context design review (Opus) of PR #37: no blocker; should-fix items, all fixed in [PR #38](https://github.com/voidbrain/gauntlet-protocol/pull/38) (PR #37 was green, so no work was pushed to it): runner cases on coding/end-to-end layers ignored the source key, re-recording a report could rewrite its source key, no CLI to obtain the runtime and scenario hashes (`gauntlet identity`); notes applied (Node version in the runtime hash stated, `sha256:` prefix normalised). Their regressions were committed failing first. Planned in [PR #36](https://github.com/voidbrain/gauntlet-protocol/pull/36) (CI 43027105309 success). Found against v0.6.0 ([PR #34](https://github.com/voidbrain/gauntlet-protocol/pull/34)): `LedgerEntry` holds `caseHash` and `profileHash` only, while the F-010-T01 acceptance (archived task file) named runtime and machine scenario. |
| Opened | 2026-11-11 |
| Closed | 2026-11-11 |
| Verification | 2026-11-11 Unit/integration: test/ledger-identity.test.ts (identity recorded from fixture-runtime reports with and without a scenario and source key; refusal of path-like and unbounded keys; model-changed, runtime-changed, scenario-changed and source-changed; unconstrained queries; system cases ignore model fields and model cases ignore the source key; schema 1 read as unknown identity and upgraded on write; all-or-none identity fields; CLI record and pending with exit codes 0/1/2); npm test 61/61 after the review fixes (runner cases on every layer, re-recording, digest prefixes, schema 1 with identity fields, `identity` command, runtime-changed through the CLI). No real-model run. |
| Reviewed | 2026-11-11 |

</details>

---

## Closed 2026-11-14

### F-011

**Incremental runs: only what changed, resumable**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No action remains; incremental evaluation release 0.8.0 is published.

| | |
|---|---|
| **Issue** | Every campaign reran all selected cases, even when `pending` already knew most were current; an interrupted local-model campaign started over. Slow models on small hosts made this costly. |
| **Reproduce** | Run a pack, change one case, run again; interrupt a run after one case; record its partial or resumed report in an existing ledger. |
| **Check** | Only pending cases run; an interrupted run resumes to the same result; partial runs merge into the ledger; releases list changed cases per pack. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-14 after pending-only execution, atomic checkpoints/resume and observable partial-ledger merges passed deterministic regressions and green CI. PR #62 passed CI run 43623044929, merged as 2f8df89, and release [v0.8.0](https://github.com/voidbrain/gauntlet-protocol/releases/tag/v0.8.0) was published with per-pack added/changed/removed lists. No real-model run or consumer adoption gates this reusable release.

**Estimates:** Zero remaining. The four scoped steps retain their original baselines and measured elapsed effort in their task files.

| Field | Value |
|---|---|
| PR / evidence | [PR #62](https://github.com/voidbrain/gauntlet-protocol/pull/62) release; [PR #60](https://github.com/voidbrain/gauntlet-protocol/pull/60) partial ledger merges; [PR #58](https://github.com/voidbrain/gauntlet-protocol/pull/58) checkpoint/resume; [PR #56](https://github.com/voidbrain/gauntlet-protocol/pull/56) pending-only runs; reconciliation PRs #57, #59 and #61; roadmap request PR #42. |
| Opened | 2026-11-13 |
| Closed | 2026-11-14 |
| Verification | PR #56 CI 43621050710, PR #58 CI 43621909103, PR #60 CI 43622559868 and release PR #62 CI 43623044929 passed typecheck, build, deterministic tests and required repository checks. Package 0.8.0 and its GitHub release are published; no real-model qualification claimed. |
| Reviewed | 2026-11-14 |

</details>

---
