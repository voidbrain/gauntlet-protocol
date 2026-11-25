# Gauntlet Protocol backlog

Current work ledger, reviewed 25 November 2026 against main `f47e853`. PR #98 merged on green CI (F-015, F-016 and F-017 archived on v0.10.0).
[Roadmap](ROADMAP.md) · [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

<!-- totals:start -->
**Remaining effort:** 14.75 h agent + 1.75 h owner across 16 open steps of 5 features. Generated from the task files.
<!-- totals:end -->

## Work items

Bugs (B-) and features (F-) in one list, most urgent first.

### <a id="f-018"></a>[✨ F-018](#top)

**italian-quality-v1: Italian summary, rewrite and register**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | 1.5 h agent + 0.25 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-018-T02 — Italian summary, rewrite and register tasks (Planned).

| | |
|---|---|
| **Issue** | bilingual-it-en-v1 checks language choice, not Italian quality. Free text cannot be graded by exact equality. |
| **Reproduce** | `npm run index:build` lists no case with capability italian-quality. |
| **Check** | A deterministic rubric grader (required and forbidden terms, Italian share, length, register markers) and examples/italian-quality-v1.json, area language-translation, capability italian-quality; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟡 Medium | <a id="f-018-t02"></a>F-018-T02 — Italian summary, rewrite and register tasks | 1.5 h | 0 h | 1.5 h | Planned | — | [F-018-T03](#f-018-t03) | 🤖 |
| 🟢 Small | <a id="f-018-t03"></a>F-018-T03 — Release italian-quality-v1 | — | 0 h | 0 h agent + 0.25 h owner | Planned | [F-018-T02](#f-018-t02) | — | ⏳ 🧑‍🔧 |
| 🟡 Medium | **Total** | 3.5 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 1.5 h agent + 0.25 h owner | 1 of 3 completed | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status |
|---|---|---|---|---|
| — | <a id="f-018-t01"></a>F-018-T01 — Deterministic rubric grader | 2 h | 0 h | Completed |

</details>

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-018.md)

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85); [#90](https://github.com/voidbrain/gauntlet-protocol/pull/90); [#91](https://github.com/voidbrain/gauntlet-protocol/pull/91) |
| Opened | 2026-11-24 |
| Verification | Pending. |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-019"></a>[✨ F-019](#top)

**cad-3d-v1: OpenSCAD build-and-measure and printing questions**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | 4 h agent + 0.25 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-019-T01 — Slicer, material and tolerance questions (Planned).

| | |
|---|---|
| **Issue** | The index maps 0 cases to cad-3d. |
| **Reproduce** | `npm run index:build` reports `cad-3d: 0 mapped cases`. |
| **Check** | Exact-answer slicer, material and tolerance questions, and OpenSCAD tasks rendered in the coding runner's sandbox and graded by measured dimensions; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="f-019-t01"></a>F-019-T01 — Slicer, material and tolerance questions | 1 h | 0 h | 1 h | Planned | — | [F-019-T03](#f-019-t03) | 🤖 |
| 🟡 Medium | <a id="f-019-t02"></a>F-019-T02 — OpenSCAD build-and-measure grader and tasks | 3 h | 0 h | 3 h | Planned | — | [F-019-T03](#f-019-t03) | 🤖 |
| 🟢 Small | <a id="f-019-t03"></a>F-019-T03 — Release cad-3d-v1 | — | 0 h | 0 h agent + 0.25 h owner | Planned | [F-019-T01](#f-019-t01), [F-019-T02](#f-019-t02) | — | ⏳ 🧑‍🔧 |
| 🟡 Medium | **Total** | 4 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 4 h agent + 0.25 h owner | 0 of 3 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-019.md)

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85) |
| Opened | 2026-11-24 |
| Verification | Pending. |
| Reviewed | 2026-11-24 |

</details>

---
### <a id="f-020"></a>[✨ F-020](#top)

**code-review-v1: seeded-defect diffs**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | 1.75 h agent + 0.25 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-020-T01 — Defect-finding grader (Implemented; verification pending).

| | |
|---|---|
| **Issue** | The index maps 0 cases to code-review. Finding defects needs a grader that matches a set of findings, not exact equality. |
| **Reproduce** | `npm run index:build` reports `code-review: 0 mapped cases`. |
| **Check** | A deterministic defect-finding grader (seeded defects by file, line range and category; bounded false positives) and examples/code-review-v1.json; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="f-020-t01"></a>F-020-T01 — Defect-finding grader | 2 h | 0 h | 0.25 h | Implemented; verification pending | — | [F-020-T02](#f-020-t02) | 🤖 |
| 🟡 Medium | <a id="f-020-t02"></a>F-020-T02 — Seeded-defect diff cases | 1.5 h | 0 h | 1.5 h | Planned | [F-020-T01](#f-020-t01) | [F-020-T03](#f-020-t03) | ⏳ 🤖 |
| 🟢 Small | <a id="f-020-t03"></a>F-020-T03 — Release code-review-v1 | — | 0 h | 0 h agent + 0.25 h owner | Planned | [F-020-T02](#f-020-t02) | — | ⏳ 🧑‍🔧 |
| 🟡 Medium | **Total** | 3.5 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 1.75 h agent + 0.25 h owner | 0 of 3 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-020.md)

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85) |
| Opened | 2026-11-24 |
| Verification | Pending. |
| Reviewed | 2026-11-25 |

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
