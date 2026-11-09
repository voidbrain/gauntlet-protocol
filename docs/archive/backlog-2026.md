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
