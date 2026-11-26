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
| PR / evidence | [PR #63](https://github.com/voidbrain/gauntlet-protocol/pull/63) closure; [PR #62](https://github.com/voidbrain/gauntlet-protocol/pull/62) release; [PR #60](https://github.com/voidbrain/gauntlet-protocol/pull/60) partial ledger merges; [PR #58](https://github.com/voidbrain/gauntlet-protocol/pull/58) checkpoint/resume; [PR #56](https://github.com/voidbrain/gauntlet-protocol/pull/56) pending-only runs; reconciliation PRs #57, #59 and #61; roadmap request PR #42. |
| Opened | 2026-11-13 |
| Closed | 2026-11-14 |
| Verification | PR #56 CI 43621050710, PR #58 CI 43621909103, PR #60 CI 43622559868 and release PR #62 CI 43623044929 passed typecheck, build, deterministic tests and required repository checks. Package 0.8.0 and its GitHub release are published; no real-model qualification claimed. |
| Reviewed | 2026-11-14 |

</details>

---

### F-012

**Six new packs: structured output, tools, bilingual, multi-step, refusal, long context**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No action remains; focused-pack release 0.9.0 is published.

| | |
|---|---|
| **Issue** | Three packs existed (smoke, smoke-schema, general-assistant-expanded). They could not tell whether a model could choose tools, keep structured output under pressure, work in Italian, run several steps, refuse escalation or use long inputs. |
| **Reproduce** | `gauntlet packs` listed three packs. |
| **Check** | Six new packs, each with regression and holdout splits, deterministic grader fixtures and an index entry, released in a tagged version. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-14 after all six packs passed deterministic regressions, PR #71 passed green CI and merged, and release [v0.9.0](https://github.com/voidbrain/gauntlet-protocol/releases/tag/v0.9.0) was published. No real-model run or consumer adoption gates this reusable release.

**Estimates:** Zero remaining. The seven scoped steps retain their original baselines and measured elapsed effort in their task files.

| Field | Value |
|---|---|
| PR / evidence | [PR #72](https://github.com/voidbrain/gauntlet-protocol/pull/72) closure; [PR #71](https://github.com/voidbrain/gauntlet-protocol/pull/71) release; [PR #70](https://github.com/voidbrain/gauntlet-protocol/pull/70) release readiness; [PR #64](https://github.com/voidbrain/gauntlet-protocol/pull/64), [#65](https://github.com/voidbrain/gauntlet-protocol/pull/65), [#66](https://github.com/voidbrain/gauntlet-protocol/pull/66), [#67](https://github.com/voidbrain/gauntlet-protocol/pull/67), [#68](https://github.com/voidbrain/gauntlet-protocol/pull/68) and [#69](https://github.com/voidbrain/gauntlet-protocol/pull/69) implement the six packs; roadmap request PR #42. |
| Opened | 2026-11-13 |
| Closed | 2026-11-14 |
| Verification | PR #64–#69 CI passed the deterministic pack regressions. Release PR #71 passed required CI before merge; package 0.9.0 and its GitHub release are published. The generated catalog lists all 66 cases. No real-model qualification claimed. |
| Reviewed | 2026-11-14 |

</details>

---

### F-013

**Host-aware profiles: a model that does not fit the host is refused before the run**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />No action remains; host-fit admission and small-host presets are available.

| | |
|---|---|
| **Issue** | Profiles described a model but not what it needed; a campaign on a small host discovered too late that the model did not fit or timed out. |
| **Reproduce** | Plan a 30B profile against a 16 GB host: nothing warned. |
| **Check** | Profiles and environments declare size and memory; `plan` refuses or warns on a misfit; small-host example profiles and limits exist. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-14 after plan-time and execution-time memory admission, accelerator declarations, sized Q4 CPU/GPU profiles and slow-host limits passed deterministic tests and required CI. No model was contacted and no real-model fit was claimed.

**Estimates:** Zero remaining. Both scoped steps retain their original baselines and measured elapsed effort in their task files.

| Field | Value |
|---|---|
| PR / evidence | [PR #76](https://github.com/voidbrain/gauntlet-protocol/pull/76) closure; [PR #75](https://github.com/voidbrain/gauntlet-protocol/pull/75) small-host presets; [PR #74](https://github.com/voidbrain/gauntlet-protocol/pull/74) T02 readiness; [PR #73](https://github.com/voidbrain/gauntlet-protocol/pull/73) host-fit admission; roadmap request PR #42. |
| Opened | 2026-11-13 |
| Closed | 2026-11-14 |
| Verification | PR #73 CI 43650034832 passed 71 deterministic tests and required checks. PR #75 CI 43650490173 passed 72 deterministic tests and required checks. No real-model run. |
| Reviewed | 2026-11-14 |

</details>

---

## Closed 2026-11-24

### F-014

**First skill discovery review**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-24: Merged in #83 on green CI; fresh-context review: no blockers, its should-fix figures corrected; check:freshness no longer asks for the skills review; the PR-naming proposal shipped in project-harness v10.9.0 (work:pr), adopted here.

| | |
|---|---|
| **Issue** | The owner turned on the periodic skill discovery review (`reviews.skills.days`: 30) on 2026-11-24; the first run is due. |
| **Reproduce** | `npm run check:freshness` warns that `docs/reviews/skills/<date>.md` is missing. |
| **Check** | [docs/reviews/skills/2026-11-24.md](../reviews/skills/2026-11-24.md) records the sources read and an outcome for every candidate; each implemented outcome is in the repository; `check:freshness` no longer asks for the review. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-24: Merged in #83 on green CI; fresh-context review: no blockers, its should-fix figures corrected; check:freshness no longer asks for the skills review; the PR-naming proposal shipped in project-harness v10.9.0 (work:pr), adopted here. 2026-11-24: review written. Outcomes: the evaluation-pack recipe added to AGENTS "Adding things" (project line); a helper that names a PR in its record proposed to the template owner as a harness proposal (60 follow-up commits since 2026-10-25), with no project change; reconcile, release preparation and skill drift need no skill. Shipped with the harness 10.8.0 reconcile. Close once this PR merges on green CI.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#83](https://github.com/voidbrain/gauntlet-protocol/pull/83) |
| Opened | 2026-11-24 |
| Verification | Script: check:freshness, check:backlog, CI #83 green (2026-11-24) |
| Reviewed | 2026-11-24 |

</details>

---

## Closed 2026-11-25

### F-015

**coding-v1: coding pack and sandboxed reference runner**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🔴 Large |

💻 **→ Human action required: No**<br />Closed 2026-11-25: released in v0.10.0.

| | |
|---|---|
| **Issue** | The capability index maps 0 cases to the coding area. The coding layer exists only as a bridge (PROTOCOL.md, "Registered external runners"): no pack uses it and no runner meets its sandbox and candidate/test separation contract. |
| **Reproduce** | `npm run index:build` reports `coding: 0 mapped cases`; `gauntlet packs` lists no coding-layer pack. |
| **Check** | examples/coding-v1.json with Python and TypeScript tasks graded out of process against expected values the candidate never sees; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. A reference runner runs model-written code only inside the owner-chosen boundary (no network, time and memory limits) with contract tests proving each limit; grading stays outside the candidate's process. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-25: Released in v0.10.0 (tag on dcc176b, release PR #97, main CI green; https://github.com/voidbrain/gauntlet-protocol/releases/tag/v0.10.0); released in v0.10.0. 2026-11-25: F-015-T06 closed: on the owner's instruction, Docker Desktop (server 29.8.0) runs on the owner's Mac; [container engine](../guides/container-engine.md) step 2 gave `OK`, `BLOCKED` (wget: bad address 'example.com') and `exit 137`. F-015-T03 implemented: `examples/coding-v1/container-executor.mjs` (one throwaway container per case from pinned images; no network, read-only root, non-root user, memory, process and CPU limits, only the workspace mounted, container removed before the call resolves) and `examples/coding-v1/runner.mjs` (asks the local model, grades out of process). Merged in #91 after the security review's fixes, on green CI. 2026-11-25: F-015-T03 closed: the container contract tests pass 9/9 on the owner's Mac (Docker Desktop 29.8.0) and are required in CI; a run against a real local model is not done (needs an explicit run request). Earlier: F-015-T01 closed (PR #86); F-015-T02 sandbox A; F-015-T05 holdouts H1 (public, exposed). Release PR [#97](https://github.com/voidbrain/gauntlet-protocol/pull/97) for 0.10.0 ships coding-v1; next: F-015-T04, the owner tags v0.10.0 ([release](../guides/release.md) step 2). Planned 2026-11-24 as part of the [roadmap](../ROADMAP.md) milestone "Domain packs"; every step is in its task file.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85); [#86](https://github.com/voidbrain/gauntlet-protocol/pull/86); [#87](https://github.com/voidbrain/gauntlet-protocol/pull/87); [#88](https://github.com/voidbrain/gauntlet-protocol/pull/88); [#91](https://github.com/voidbrain/gauntlet-protocol/pull/91); [#95](https://github.com/voidbrain/gauntlet-protocol/pull/95) (F-015-T03 verification) |
| Opened | 2026-11-24 |
| Verification | Unit/integration, 2026-11-25: pack, grader and runner contract tests green in CI and locally; Human (release), 2026-11-25: v0.10.0 tagged and published. |
| Reviewed | 2026-11-25 |

</details>

---

### F-017

**logic-math-v1: puzzles, arithmetic and constraints**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-25: released in v0.10.0.

| | |
|---|---|
| **Issue** | The index maps 0 cases to logic-planning and to math. |
| **Reproduce** | `npm run index:build` reports `math: 0 mapped cases` and `logic-planning: 0 mapped cases`. |
| **Check** | examples/logic-math-v1.json with exact-answer puzzles, arithmetic and constraint problems on the existing exact-json grader; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-25: Released in v0.10.0 (tag on dcc176b, release PR #97, main CI green; https://github.com/voidbrain/gauntlet-protocol/releases/tag/v0.10.0); released in v0.10.0. 2026-11-25: F-017-T01 closed: PR #89 merged on green CI. Release PR [#97](https://github.com/voidbrain/gauntlet-protocol/pull/97) for 0.10.0 ships logic-math-v1; next: F-017-T02, the owner tags v0.10.0 ([release](../guides/release.md) step 2). Planned 2026-11-24 as part of the [roadmap](../ROADMAP.md) milestone "Domain packs"; every step is in its task file.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85); [#89](https://github.com/voidbrain/gauntlet-protocol/pull/89); [#91](https://github.com/voidbrain/gauntlet-protocol/pull/91) |
| Opened | 2026-11-24 |
| Verification | Unit/integration, 2026-11-25: pack, grader and runner contract tests green in CI and locally; Human (release), 2026-11-25: v0.10.0 tagged and published. |
| Reviewed | 2026-11-25 |

</details>

---

### F-016

**embedded-v1: Arduino, ESP32 and Raspberry Pi pack**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🔴 Large |

💻 **→ Human action required: No**<br />Closed 2026-11-25: released in v0.10.0.

| | |
|---|---|
| **Issue** | No pack covers embedded code. NERV wants models qualified for Arduino/ESP32 sketches and Raspberry Pi Python without hardware in the loop. |
| **Reproduce** | `npm run index:build` lists no embedded case; the taxonomy in src/catalog.ts has no embedded area. |
| **Check** | examples/embedded-v1.json graded by compile (pinned arduino-cli or PlatformIO ESP32 core) and static checks, no hardware; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. The area choice is recorded. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-25: Released in v0.10.0 (tag on dcc176b, release PR #97, main CI green; https://github.com/voidbrain/gauntlet-protocol/releases/tag/v0.10.0); released in v0.10.0. 2026-11-24: owner decision, F-016-T01 closed: area **A, a new core area `embedded`**; toolchain **arduino-cli with a pinned ESP32 core** ([decision](../decisions/domain-packs.md#embedded-area)). F-015-T01 closed (PR #86), so F-016-T03 can start; F-016-T04 adds the area to the taxonomy. 2026-11-25: F-016-T06 closed: arduino-cli 1.6.0 with arduino:avr 1.8.6 and esp32:esp32 3.0.7 installed on the owner's Mac by the agent (owner-approved); the [guide](../guides/arduino-cli.md)'s Blink sketch compiles for arduino:avr:uno and esp32:esp32:esp32. 2026-11-25: F-016-T02 implemented in #93: four sketch tasks and a compile grader (`examples/embedded-v1/grade.mjs`, [grader](../PROTOCOL.md#embedded-sketch-grader)); CI checks it against a stand-in arduino-cli, since CI has no toolchain; real compiles of every fixture run where arduino-cli and the pinned cores are installed (the owner's Mac). **Owner decision 2026-11-25:** no real arduino-cli or ESP32 compiles in CI (the core download is too large per run); CI keeps the stand-in compiler and real compiles run on the owner's Mac only ([guide](../guides/arduino-cli.md)). 2026-11-25: F-016-T03 implemented in #94: four Raspberry Pi Python tasks graded by byte-compilation and AST checks, nothing executed ([grader](../PROTOCOL.md#raspberry-pi-static-grader)). 2026-11-25: F-016-T02 and F-016-T03 closed on green CI and local runs (real compiles on the owner's Mac). 2026-11-25: F-016-T04 implemented in #96: area `embedded`, `examples/embedded-v1.json` and its reference runner ([runner](../PROTOCOL.md#embedded-pack-runner)), index entry. F-016-T04 closed on green CI (main run 45569195046) and 107/107 locally. Release PR [#97](https://github.com/voidbrain/gauntlet-protocol/pull/97) for 0.10.0 ships embedded-v1; next: F-016-T05, the owner tags v0.10.0 ([release](../guides/release.md) step 2). Planned 2026-11-24 as part of the [roadmap](../ROADMAP.md) milestone "Domain packs"; every step is in its task file.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85); [#87](https://github.com/voidbrain/gauntlet-protocol/pull/87); [#89](https://github.com/voidbrain/gauntlet-protocol/pull/89); [#92](https://github.com/voidbrain/gauntlet-protocol/pull/92) (F-016-T06 evidence); [#93](https://github.com/voidbrain/gauntlet-protocol/pull/93) (F-016-T02); [#94](https://github.com/voidbrain/gauntlet-protocol/pull/94) (F-016-T03, CI decision); [#95](https://github.com/voidbrain/gauntlet-protocol/pull/95) (F-016-T02, F-016-T03 closed); [#96](https://github.com/voidbrain/gauntlet-protocol/pull/96) (F-016-T04) |
| Opened | 2026-11-24 |
| Verification | Unit/integration, 2026-11-25: pack, grader and runner contract tests green in CI and locally, real arduino-cli compiles on the owner's Mac; Human (release), 2026-11-25: v0.10.0 tagged and published. |
| Reviewed | 2026-11-25 |

</details>

---

### F-018

**italian-quality-v1: Italian summary, rewrite and register**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟡 Medium |

💻 **→ Human action required: No**<br />Closed 2026-11-25: released in v0.11.0.

| | |
|---|---|
| **Issue** | bilingual-it-en-v1 checks language choice, not Italian quality. Free text cannot be graded by exact equality. |
| **Reproduce** | `npm run index:build` lists no case with capability italian-quality. |
| **Check** | A deterministic rubric grader (required and forbidden terms, Italian share, length, register markers) and examples/italian-quality-v1.json, area language-translation, capability italian-quality; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-25: Release v0.11.0 (tag on c7202ae, release PR #105 merged on green CI, main CI green; published by the owner 2026-11-25); Closed 2026-11-25; released in v0.11.0. 2026-11-25: F-018-T01 closed: PR #90 merged on green CI (expected kind `rubric`, grader `rubric-v1`). F-018-T02 implemented: `examples/italian-quality-v1.json` (six Italian summary, rewrite and register cases across regression and holdout splits under `language-translation` with capability `italian-quality`), `test/fixtures/italian-quality-v1.json` (agent-written references and failing fixtures per case, checked in review in #99; no native-speaker review yet), pack and catalog tests and index entry; it closes on green CI after merge, then F-018-T03 releases `italian-quality-v1`. Native client token counters are not exposed by the host; usage job recorded with unknown token coverage. Planned 2026-11-24 as part of the [roadmap](../ROADMAP.md) milestone "Domain packs"; every step is in its task file.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85); [#90](https://github.com/voidbrain/gauntlet-protocol/pull/90); [#91](https://github.com/voidbrain/gauntlet-protocol/pull/91); [#99](https://github.com/voidbrain/gauntlet-protocol/pull/99) |
| Opened | 2026-11-24 |
| Verification | Pending. |
| Reviewed | 2026-11-25 |

</details>

---

### F-019

**cad-3d-v1: OpenSCAD build-and-measure and printing questions**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-25: released in v0.11.0.

| | |
|---|---|
| **Issue** | The index maps 0 cases to cad-3d. |
| **Reproduce** | `npm run index:build` reports `cad-3d: 0 mapped cases`. |
| **Check** | Exact-answer slicer, material and tolerance questions, and OpenSCAD tasks rendered in the coding runner's sandbox and graded by measured dimensions; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-25: Release v0.11.0 (tag on c7202ae, release PR #105 merged on green CI, main CI green; published by the owner 2026-11-25); Closed 2026-11-25; released in v0.11.0. 2026-11-25: F-019-T01 closed on #100. F-019-T02 closed: PR #103 merged on green CI (OpenSCAD grader, container runner, four tasks; CI uses stand-ins). Real render 2026-11-25 on the owner's Mac (Docker 29.8.0, arm64, no model call): the pinned digest sha256:147e4852... resolves on Docker Hub (multi-arch list with linux/arm64 and linux/amd64) and pulls; through gradeOpenScad with containerExecutor, all four reference.scad fixtures pass (spacer 12/12/15 mm, 1270.30 mm3; L-bracket 40/25/30, 8125; tray 50/30/20, 8472; bushing 24/24/16, 2709.98), every wrong.scad fails dimension-mismatch and every broken.scad fails build-error, about 0.3 s per render. Known limitation: only bounding box and volume are measured, so a wrong shape with the right extents and volume passes (an L-bracket with its wall at X = 35 instead of X = 0 measured 40/25/30, 8125, passed). Next: F-019-T03 releases cad-3d-v1. Native client token counters are not exposed by the host; usage job recorded with unknown token coverage. Planned 2026-11-24 as part of the [roadmap](../ROADMAP.md) milestone "Domain packs"; every step is in its task file.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85); [#100](https://github.com/voidbrain/gauntlet-protocol/pull/100); [#103](https://github.com/voidbrain/gauntlet-protocol/pull/103); [#104](https://github.com/voidbrain/gauntlet-protocol/pull/104) |
| Opened | 2026-11-24 |
| Verification | Pending. |
| Reviewed | 2026-11-25 |

</details>

---

### F-020

**code-review-v1: seeded-defect diffs**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-25: released in v0.11.0.

| | |
|---|---|
| **Issue** | The index maps 0 cases to code-review. Finding defects needs a grader that matches a set of findings, not exact equality. |
| **Reproduce** | `npm run index:build` reports `code-review: 0 mapped cases`. |
| **Check** | A deterministic defect-finding grader (seeded defects by file, line range and category; bounded false positives) and examples/code-review-v1.json; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-25: Release v0.11.0 (tag on c7202ae, release PR #105 merged on green CI, main CI green; published by the owner 2026-11-25); Closed 2026-11-25; released in v0.11.0. 2026-11-25: F-020-T01 closed: PR #101 merged on green CI (expected kind `defects`, grader `defects-v1`; findings cover at most 10 lines, so a whole-file finding cannot match every defect). F-020-T02 implemented: `examples/code-review-v1.json` (six invented diffs with seeded security, logic, concurrency and resource defects across regression and holdout splits under `code-review`), `test/fixtures/code-review-v1.json` (agent-written passing, missed-defect, noisy and whole-file sweeping fixtures per case; no human review yet), pack and catalog tests and index entry; review in a fresh Claude Code session found every excerpt fit inside one 10-line finding, so a whole-excerpt answer per category passed; excerpts now exceed 20 lines and a test rejects tiled and every-line findings; it closes on green CI after merge, then F-020-T03 releases `code-review-v1`. Native client token counters are not exposed by the host; usage job recorded with unknown token coverage. Planned 2026-11-24 as part of the [roadmap](../ROADMAP.md) milestone "Domain packs"; every step is in its task file.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85); [#101](https://github.com/voidbrain/gauntlet-protocol/pull/101); [#102](https://github.com/voidbrain/gauntlet-protocol/pull/102) |
| Opened | 2026-11-24 |
| Verification | Pending. |
| Reviewed | 2026-11-25 |

</details>

---

### B-004

**Coding runner asks the model, then crashes without a report, when no container engine is available**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-25: Merged in #107 on green CI 2026-11-25 (regression test failing first, a720f99); shipped in v0.11.1 (#108).

| | |
|---|---|
| **Issue** | `examples/coding-v1/runner.mjs` asks the model first and only then reaches the executor, whose `prepare` throws "container engine unavailable"; the runner exits without a report, so the case shows an adapter failure instead of an `error` naming the fix, and a model generation is wasted. Found by NERV's review of the 0.11.0 adoption; the embedded and cad-3d runners already check first. |
| **Reproduce** | Run the runner on a coding case with no container engine (`--docker=test/fixtures/no-docker.mjs`): the model is asked, then the process exits non-zero with no report. |
| **Check** | The runner checks the engine and image before asking the model and writes an `error` result (`complete: false`, 0 checks) with the fix on stderr. Regression test committed failing first. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-25: Merged in #107 on green CI 2026-11-25 (regression test failing first, a720f99); shipped in v0.11.1 (#108). 2026-11-25: closed. B-004-T01 merged in #107 on green CI (regression test failing first, a720f99); shipped in v0.11.1 (#108). Every check is automated, so #107's green CI run is the evidence.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | NERV review of the 0.11.0 adoption (2026-11-25); [#107](https://github.com/voidbrain/gauntlet-protocol/pull/107) |
| Opened | 2026-11-25 |
| Verification | 2026-11-25: #107 CI green; release v0.11.1 published. |
| Reviewed | 2026-11-25 |

</details>

---

### B-005

**An engine client that fails to start is graded as a failure**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-25: Merged in #107 on green CI 2026-11-25 (regression test failing first, a720f99); shipped in v0.11.1 (#108).

| | |
|---|---|
| **Issue** | `examples/coding-v1/container-executor.mjs` resolved a Docker client `spawn` error as exit code `null`, so the coding grader returned `failed` (`no-results`) and the OpenSCAD grader `failed` (`build-error`): an infrastructure fault became a graded result that counts as covering the case. Found by NERV's review of the 0.11.0 adoption. |
| **Reproduce** | Grade with a container executor whose engine client cannot be started (ENOENT on spawn): the result is `failed`, not `error`. |
| **Check** | The executor rejects when the engine client fails to start, and both graders turn an executor rejection into `error` (`executor-error`, with the message), which the runners report as `error`. The candidate controls its exit code, so exit codes never mark an executor error. Regression tests committed failing first. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-25: Merged in #107 on green CI 2026-11-25 (regression test failing first, a720f99); shipped in v0.11.1 (#108). 2026-11-25: closed. B-005-T01 merged in #107 on green CI (regression test failing first, a720f99); shipped in v0.11.1 (#108). Every check is automated, so #107's green CI run is the evidence.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | NERV review of the 0.11.0 adoption (2026-11-25); [#107](https://github.com/voidbrain/gauntlet-protocol/pull/107) |
| Opened | 2026-11-25 |
| Verification | 2026-11-25: #107 CI green; release v0.11.1 published. |
| Reviewed | 2026-11-25 |

</details>

---

## Closed 2026-11-26

### F-075

**Reconcile project-harness v10.20.0 → v10.21.4**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-26: Merged in PR #111 on green CI (ci:status: success); check-harness --strict matched v10.21.4; check:freshness reports no harness update.

| | |
|---|---|
| **Issue** | `.harness.json` names v10.20.0 while the template has released up to v10.21.4. Coordinator gap review 2026-11-26, proposal 12 ("Behind the harness"), accepted by the owner. |
| **Reproduce** | `npm run check:freshness` on `main`: it reports the harness template v10.21.4 and the files to update or reconcile. |
| **Check** | `.harness.json` names v10.21.4; `check:freshness` reports no harness update; `check:fast` and CI on the PR pass. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-26: Merged in PR #111 on green CI (ci:status: success); check-harness --strict matched v10.21.4; check:freshness reports no harness update. Opened 2026-11-26 from the coordinator gap review (proposal 12, owner accepted all proposals). F-075-T01 does the reconcile in a session of this repository, under APPLY.md. 2026-11-26: retargeted to v10.21.4 (released after the record opened). Copied `tools/impact-map.mjs`, `tools/work-items.mjs`, `docs/agents/solution-profile.md`, `solution-refresh.md` and `solution-gaps.md` from the tag; reconciled `docs/agents/pull-requests.md` by hand (the publish-hooks sentence); `version` 10.21.4. Skipped: `backlog-views.yml` and `tools/solution.mjs` (not adopted here: committed views, no coordinator role). Closes on this PR's green CI.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Opened in [#110](https://github.com/voidbrain/gauntlet-protocol/pull/110); [#111](https://github.com/voidbrain/gauntlet-protocol/pull/111) |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
