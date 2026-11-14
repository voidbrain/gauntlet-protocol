# Gauntlet Protocol backlog

Current work ledger, reviewed 14 November 2026 against main `ea71bef`. Harness 8.14.3 reconciled: reconcile-draft (F-066 entry heading), rule-load (generated pages), re-estimation sentence. #54 (harness 8.14.2) merged on green CI; this update is [#55](https://github.com/voidbrain/gauntlet-protocol/pull/55).
[Roadmap](ROADMAP.md) · [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

<!-- totals:start -->
**Remaining effort:** 0.5 h across 1 open step of 1 feature. 0.25 h of actual effort recorded on 1 step. Generated from the task files.
<!-- totals:end -->

## Work items

Bugs (B-) and features (F-) in one list, most urgent first.

### <a id="f-013"></a>[✨ F-013](#top)

**Host-aware profiles: a model that does not fit the host is refused before the run**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 0.5 h | — | — | 🤖 | — | — |

💻 **→** F-013-T02.

| | |
|---|---|
| **Issue** | Profiles describe a model but not what it needs; a campaign on a small host discovers too late that the model does not fit or times out. |
| **Reproduce** | Plan a 30B profile against a 16 GB host: nothing warns. |
| **Check** | Profiles and environments declare size and memory; `plan` refuses or warns on a misfit; small-host example profiles and limits exist. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status |
|---|---|---|---|---|---|
| 🟢 Small | <a id="f-013-t02"></a>F-013-T02 — Small-host example profiles | 0.5 h | 0 h | 0.5 h | Ready |
| — | <a id="f-013-t01"></a>F-013-T01 — Host fit in model profiles | 0.5 h | 0.25 h (measured) | 0 h | Completed |
| 🟢 Small | **Total** | 1 h | 0.25 h (1 of 2 steps recorded) | 0.5 h | 1 of 2 completed |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-013.md)

| Field | Value |
|---|---|
| PR / evidence | [PR #74](https://github.com/voidbrain/gauntlet-protocol/pull/74) readies T02; [PR #73](https://github.com/voidbrain/gauntlet-protocol/pull/73) implements plan-time host fit; [PR #42](https://github.com/voidbrain/gauntlet-protocol/pull/42) records the roadmap request. |
| Opened | 2026-11-13 |
| Verification | T01 passed 71 deterministic tests and required checks in PR #73 CI run 43650034832. |
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
