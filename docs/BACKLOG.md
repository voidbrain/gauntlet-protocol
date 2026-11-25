# Gauntlet Protocol backlog

Current work ledger, reviewed 25 November 2026 against main `bc0c6d6`. PRs #106 to #108 merged on green CI (#106: F-018 to F-020 archived; #107: B-004, B-005; #108: release 0.11.1, published). B-004 and B-005 closed. Reconciled `project-harness v10.20.0` (committed backlog views kept).
[Roadmap](ROADMAP.md) · [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

<!-- totals:start -->
**Remaining effort:** 8.75 h agent + 1 h owner across 10 open steps of 3 features and 1 other record. Generated from the task files.
<!-- totals:end -->

## Work items

Bugs (B-) and features (F-) in one list, most urgent first.

### <a id="b-003"></a>[🐞 B-003](#top)

**Coding grader blocks at a timeout while a leftover process keeps writing**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟢 Small | 0.25 h | — | — | 🤖 | — | — |

💻 **→** Next: B-003-T01 — Timeout verdict without waiting for cleanup (Implemented; verification pending).

| | |
|---|---|
| **Issue** | On a timeout `gradeCandidate` removed the workspace synchronously while a process the executor had not stopped kept creating folders in it. The unlock walk and `rmSync` chased the growing tree and blocked the event loop, so the timeout verdict arrived only when the writer stopped. On CI the test "coding grader reports a timeout even while a leftover process keeps writing to the workspace" was cancelled at the 60 s limit on #99 and #101 (runs 45576499955, 45578902824). |
| **Reproduce** | Grade with an executor that never resolves and starts an endless folder writer in the workspace, `timeoutMs: 300`: the call does not return until the writer stops. |
| **Check** | The grader returns the timeout at once and removes the workspace when the executor resolves; until then the workspace is a leftover that `removeLeftoverWorkspaces()` retries. Regression test committed failing first. |

**Steps**

| Effort | Step | Estimate | Actual | Remaining | Status |
|---|---|---|---|---|---|
| 🟢 Small | <a id="b-003-t01"></a>B-003-T01 — Timeout verdict without waiting for cleanup | 0.5 h | 0 h | 0.25 h | Implemented; verification pending |
| 🟢 Small | **Total** | 0.5 h | 0 h (0 of 1 steps recorded) | 0.25 h | 0 of 1 completed |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/B-003.md)

| Field | Value |
|---|---|
| PR / evidence | [#99](https://github.com/voidbrain/gauntlet-protocol/pull/99) |
| Opened | 2026-11-25 |
| Verification | Pending. |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-075"></a>[✨ F-075](#top)

**Reconcile project-harness v10.20.0 → v10.21.3**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 1 h | — | — | 🤖 | — | — |

💻 **→** Next: F-075-T01 — Reconcile harness files v10.20.0 -&gt; v10.21.3 (Planned).

| | |
|---|---|
| **Issue** | `.harness.json` names v10.20.0 while the template has released up to v10.21.3. Coordinator gap review 2026-11-26, proposal 12 ("Behind the harness"), accepted by the owner. |
| **Reproduce** | `npm run check:freshness` on `main`: it reports the harness template v10.21.3 and the files to update or reconcile. |
| **Check** | `.harness.json` names v10.21.3; `check:freshness` reports no harness update; `check:fast` and CI on the PR pass. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status |
|---|---|---|---|---|---|
| 🟢 Small | <a id="f-075-t01"></a>F-075-T01 — Reconcile harness files v10.20.0 -&gt; v10.21.3 | 1 h | 0 h | 1 h | Planned |
| 🟢 Small | **Total** | 1 h | 0 h (0 of 1 steps recorded) | 1 h | 0 of 1 completed |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-075.md)

| Field | Value |
|---|---|
| PR / evidence | Opened in PR_PLACEHOLDER |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-022"></a>[✨ F-022](#top)

**Packs or recorded skips for estimation, research, scheduling-time and backlog-management**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | 1.5 h agent + 0.25 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-022-T01 — Propose packs or skips for the remaining areas (Planned).

| | |
|---|---|
| **Issue** | Four index areas have 0 mapped cases and no agreed plan: estimation, research, scheduling-time, backlog-management. |
| **Reproduce** | `npm run index:build` reports 0 mapped cases for each of the four areas. |
| **Check** | Each of the four areas has either its own planned pack record or a skip recorded with its reason in the roadmap. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="f-022-t01"></a>F-022-T01 — Propose packs or skips for the remaining areas | 1 h | 0 h | 1 h | Planned | — | [F-022-T02](#f-022-t02) | 🤖 |
| 🟢 Small | <a id="f-022-t02"></a>F-022-T02 — Decide packs or skips for the remaining areas | — | 0 h | 0 h agent + 0.25 h owner | Planned | [F-022-T01](#f-022-t01) | [F-022-T03](#f-022-t03) | ⏳ 🤔 |
| 🟢 Small | <a id="f-022-t03"></a>F-022-T03 — Record the outcome | 0.5 h | 0 h | 0.5 h | Planned | [F-022-T02](#f-022-t02) | — | ⏳ 🤖 |
| 🟡 Medium | **Total** | 1.5 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 1.5 h agent + 0.25 h owner | 0 of 3 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-022.md)

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85) |
| Opened | 2026-11-24 |
| Verification | Pending. |
| Reviewed | 2026-11-24 |

</details>

---
### <a id="f-021"></a>[✨ F-021](#top)

**image-generation-v1: runner and grader after a design decision**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🔴 Large | 6 h agent + 0.75 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-021-T01 — Draft the image-generation design decision (Planned).

| | |
|---|---|
| **Issue** | The index maps 0 cases to audio-video. Image generation needs a new runner and a grader (VLM judge or similarity) whose design is not yet chosen. |
| **Reproduce** | `npm run index:build` reports `audio-video: 0 mapped cases`. |
| **Check** | A recorded design decision, then a runner and grader as decided, and examples/image-generation-v1.json, area audio-video; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="f-021-t01"></a>F-021-T01 — Draft the image-generation design decision | 1 h | 0 h | 1 h | Planned | — | [F-021-T02](#f-021-t02) | 🤖 |
| 🟢 Small | <a id="f-021-t02"></a>F-021-T02 — Decide the image-generation design | — | 0 h | 0 h agent + 0.5 h owner | Planned | [F-021-T01](#f-021-t01) | [F-021-T03](#f-021-t03) | ⏳ 🤔 |
| 🟡 Medium | <a id="f-021-t03"></a>F-021-T03 — Image-generation runner | 3 h | 0 h | 3 h | Planned | [F-021-T02](#f-021-t02) | [F-021-T04](#f-021-t04) | ⏳ 🤖 |
| 🟡 Medium | <a id="f-021-t04"></a>F-021-T04 — Image grader and pack | 2 h | 0 h | 2 h | Planned | [F-021-T03](#f-021-t03) | [F-021-T05](#f-021-t05) | ⏳ 🤖 |
| 🟢 Small | <a id="f-021-t05"></a>F-021-T05 — Release image-generation-v1 | — | 0 h | 0 h agent + 0.25 h owner | Planned | [F-021-T04](#f-021-t04) | — | ⏳ 🧑‍🔧 |
| 🔴 Large | **Total** | 6 h (3 of 5 steps) | 0 h (0 of 5 steps recorded) | 6 h agent + 0.75 h owner | 0 of 5 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-021.md)

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85) |
| Opened | 2026-11-24 |
| Verification | Pending. |
| Reviewed | 2026-11-24 |

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
