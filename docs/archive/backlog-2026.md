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
