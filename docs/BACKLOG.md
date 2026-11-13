# Gauntlet Protocol backlog

Current work ledger, reviewed 13 November 2026 against main `b4a8c63`. PR #44 (concise Other changes) passed CI 43479963697. Aligned to harness v8.6.0 (including v8.5.1): copied check-harness.mjs and reconcile-preview.mjs, updated CI ref and stamp to v8.6.0.
[Roadmap](ROADMAP.md) · [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

<!-- totals:start -->
**Remaining effort:** 6 h across 13 open steps of 3 features. Generated from the task files.
<!-- totals:end -->

## Work items

Bugs (B-) and features (F-) in one list, most urgent first.

### <a id="f-011"></a>[✨ F-011](#top)

**Incremental runs: only what changed, resumable**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | 1.75 h | — | — | — | — |

💻 **→** F-011-T01.

| | |
|---|---|
| **Issue** | Every campaign reruns all selected cases, even when `pending` already knows most are current; an interrupted local-model campaign starts over. Slow models on small hosts make this costly. |
| **Reproduce** | Run a pack, change one case, run again: every case runs. Interrupt a run: nothing is reusable. |
| **Check** | Only pending cases run; an interrupted run resumes to the same result; partial runs merge into the ledger; releases list changed cases per pack. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status |
|---|---|---|---|---|---|
| 🟢 Small | F-011-T01 — Run only pending cases | 0.5 h | 0 h | 0.5 h | Ready |
| 🟢 Small | F-011-T02 — Resume an interrupted campaign | 0.5 h | 0 h | 0.5 h | Planned |
| 🟢 Small | F-011-T03 — Merge partial runs into the ledger | 0.5 h | 0 h | 0.5 h | Planned |
| 🟢 Small | F-011-T04 — Release with a per-pack list of added and changed cases | 0.25 h | 0 h | 0.25 h | Planned |
| 🟡 Medium | **Total** | 1.75 h | 0 h (0 of 4 steps recorded) | 1.75 h | 0 of 4 completed |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-011.md)

| Field | Value |
|---|---|
| PR / evidence | [PR #42](https://github.com/voidbrain/gauntlet-protocol/pull/42); owner request 2026-11-13: incremental runs, more packs, small-model hosts. |
| Opened | 2026-11-13 |
| Verification | Pending. |
| Reviewed | 2026-11-13 |

</details>

---
### <a id="f-012"></a>[✨ F-012](#top)

**Six new packs: structured output, tools, bilingual, multi-step, refusal, long context**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | 3.25 h | — | — | — | — |

💻 **→** F-012-T01, F-012-T02, F-012-T03 or F-012-T06 (independent).

| | |
|---|---|
| **Issue** | Three packs exist (smoke, smoke-schema, general-assistant-expanded). They cannot tell whether a model can choose tools, keep structured output under pressure, work in Italian, run several steps, refuse escalation or use long inputs. |
| **Reproduce** | `gauntlet packs` lists three packs. |
| **Check** | Six new packs, each with regression and holdout splits, deterministic grader fixtures and an index entry, released in a tagged version. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status |
|---|---|---|---|---|---|
| 🟢 Small | F-012-T01 — Structured-output robustness pack | 0.5 h | 0 h | 0.5 h | Ready |
| 🟢 Small | F-012-T02 — Tool use pack | 0.5 h | 0 h | 0.5 h | Ready |
| 🟢 Small | F-012-T03 — Bilingual (Italian and English) pack | 0.5 h | 0 h | 0.5 h | Ready |
| 🟢 Small | F-012-T04 — Multi-step agent pack | 0.5 h | 0 h | 0.5 h | Planned |
| 🟢 Small | F-012-T05 — Refusal and permission escalation pack | 0.5 h | 0 h | 0.5 h | Planned |
| 🟢 Small | F-012-T06 — Long context pack | 0.5 h | 0 h | 0.5 h | Ready |
| 🟢 Small | F-012-T07 — Release the new packs | 0.25 h | 0 h | 0.25 h | Planned |
| 🟡 Medium | **Total** | 3.25 h | 0 h (0 of 7 steps recorded) | 3.25 h | 0 of 7 completed |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-012.md)

| Field | Value |
|---|---|
| PR / evidence | [PR #42](https://github.com/voidbrain/gauntlet-protocol/pull/42); owner request 2026-11-13: incremental runs, more packs, small-model hosts. |
| Opened | 2026-11-13 |
| Verification | Pending. |
| Reviewed | 2026-11-13 |

</details>

---
### <a id="f-013"></a>[✨ F-013](#top)

**Host-aware profiles: a model that does not fit the host is refused before the run**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 1 h | — | — | — | — |

💻 **→** F-013-T01.

| | |
|---|---|
| **Issue** | Profiles describe a model but not what it needs; a campaign on a small host discovers too late that the model does not fit or times out. |
| **Reproduce** | Plan a 30B profile against a 16 GB host: nothing warns. |
| **Check** | Profiles and environments declare size and memory; `plan` refuses or warns on a misfit; small-host example profiles and limits exist. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status |
|---|---|---|---|---|---|
| 🟢 Small | F-013-T01 — Host fit in model profiles | 0.5 h | 0 h | 0.5 h | Ready |
| 🟢 Small | F-013-T02 — Small-host example profiles | 0.5 h | 0 h | 0.5 h | Planned |
| 🟢 Small | **Total** | 1 h | 0 h (0 of 2 steps recorded) | 1 h | 0 of 2 completed |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-013.md)

| Field | Value |
|---|---|
| PR / evidence | [PR #42](https://github.com/voidbrain/gauntlet-protocol/pull/42); owner request 2026-11-13: incremental runs, more packs, small-model hosts. |
| Opened | 2026-11-13 |
| Verification | Pending. |
| Reviewed | 2026-11-13 |

</details>

---

## Other changes

Earlier reconciliations and release notes (PR #1 – v8.5.0) are archived in [Reconciliation log](archive/reconciliation-2026.md#archived-other-changes-moved-from-backlogmd-on-2026-11-13).

## How to use this file

| Status | Requirements | Next statuses and conditions | Priority cue |
|---|---|---|---|
| **🔴 Open** | Reproducible bug or agreed capability; scope and next action recorded. | - **Investigate** if cause/scope is uncertain<br>- **Implemented** when code is complete<br>- **Blocked** if a named dependency prevents progress<br>- **Closed** if cancelled/superseded, with reason. | Coloured |
| **🟠 Investigate** | Report and unanswered question recorded; next diagnostic identified. | - **Open** when scope/cause is established<br>- **Implemented** when fixed<br>- **Blocked** if evidence/dependency is unavailable<br>- **Closed** if duplicate/not reproducible after documented investigation, with reason. | Coloured |
| **🟡 Implemented** | Code exists; required verification remains pending. | - **Verified** when all acceptance checks pass (automated ones: the merged PR's green CI run)<br>- Open or Investigate if a check fails<br>- **Blocked** if a required check cannot proceed. | Coloured |
| **🟢 Verified** | All acceptance checks passed; date, method and evidence recorded, including human/device checks when required. | - **Closed** when no action remains and resolution is recorded<br>- **Open** or **Investigate** if new evidence invalidates verification. Do not leave completed items here indefinitely. | Coloured |
| **🟣 Blocked** | Specific blocker, affected work/check and resume condition recorded. | - Return to **Open**, **Investigate** or **Implemented** when unblocked<br>- **Verified** only after all checks pass<br>- **Closed** if cancelled/superseded, with reason. | Grey ◻️ |
| **🔵 Closed** | Resolution recorded and item archived. | - **Open** or **Investigate** if reopened by new evidence<br>Retain ID, original Opened date and historical closure record. | Grey ◻️ |

Follow [Backlog rules](BACKLOG-RULES.md) for updating records, reconciling PR/CI evidence, stale-state review, closure/archiving, human dependencies and table validation. Preserve stable IDs and existing user edits.

Each item shows its ID and title, a summary table (status with its colour, priority, effort size; with source-owned records also remaining time, Depends on, Unlocks and Procedures and Decisions, 🧑 where the record or one of its ready steps waits on that kind of human action), the human or next action, and Issue / Reproduce / Check. Expand the closed details for next actions, estimate rationale, PR history, dates and verification. Effort, from the remaining agent hours (owner time apart): 🟢 Small ≤1 h · 🟡 Medium ≤4 h · 🔴 Large ≤8 h · 🟣 Very large more; work still estimated in days: 🟢 Small ≤1 day · 🟡 Medium 2–3 days · 🔴 Large ≥4 days. Status and verification evidence describe progress; effort is an estimate of work still required. A `---` line ends every item.
