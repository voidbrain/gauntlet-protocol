# Gauntlet Protocol backlog

Current work ledger, reviewed 26 November 2026 against main `f209281`. PRs #112, #113 and #114 merged on green CI (#112: F-022 proposals, F-075 archived; #113: F-021 design draft; #114: F-021 and F-022 owner decisions). F-021-T06 host check recorded: runtime B.
[Roadmap](ROADMAP.md) · [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

<!-- totals:start -->
**Remaining effort:** 12.75 h agent + 1.5 h owner across 17 open steps of 6 features and 1 other record. Generated from the task files.
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
### <a id="f-022"></a>[✨ F-022](#top)

**Packs or recorded skips for estimation, research, scheduling-time and backlog-management**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 1 h | — | — | 🤖 | — | — |

💻 **→** Next: F-022-T01 — Propose packs or skips for the remaining areas (Implemented; verification pending).

| | |
|---|---|
| **Issue** | Four index areas have 0 mapped cases and no agreed plan: estimation, research, scheduling-time, backlog-management. |
| **Reproduce** | `npm run index:build` reports 0 mapped cases for each of the four areas. |
| **Check** | Each of the four areas has either its own planned pack record or a skip recorded with its reason in the roadmap. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Who | PRs |
|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-022-t01"></a>F-022-T01 — Propose packs or skips for the remaining areas | 1 h | 0 h | 1 h | Implemented; verification pending | 🤖 | PR #112 |
| 🟢 Small | <a id="f-022-t03"></a>F-022-T03 — Record the outcome | 0.5 h | 0 h | 0 h | Implemented; verification pending | 🤖 | PR #114 records and roadmap skips |
| 🟢 Small | **Total** | 1.5 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 1 h | 1 of 3 completed | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-022-t02"></a>F-022-T02 — Decide packs or skips for the remaining areas | — | 0 h | Completed | PR #114 decision |

</details>

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-022.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-022-T01: PR #112 · F-022-T02: PR #114 decision · F-022-T03: PR #114 records and roadmap skips. Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85); [#112](https://github.com/voidbrain/gauntlet-protocol/pull/112); owner decision 2026-11-26, F-022-T02 ("Do you accept these as recommended? ok") |
| Opened | 2026-11-24 |
| Verification | Pending. |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-023"></a>[✨ F-023](#top)

**scheduling-time-v1: date and time arithmetic**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 1 h agent + 0.25 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-023-T01 — scheduling-time-v1 pack with exact date and time answers (Planned).

| | |
|---|---|
| **Issue** | The index maps 0 cases to scheduling-time. |
| **Reproduce** | `npm run index:build` reports `scheduling-time: 0 mapped cases`. |
| **Check** | examples/scheduling-time-v1.json with exact-answer date and time questions on the existing exact-json grader. Regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="f-023-t01"></a>F-023-T01 — scheduling-time-v1 pack with exact date and time answers | 1 h | 0 h | 1 h | Planned | — | [F-023-T02](#f-023-t02) | 🤖 |
| 🟢 Small | <a id="f-023-t02"></a>F-023-T02 — Release scheduling-time-v1 | — | 0 h | 0 h agent + 0.25 h owner | Planned | [F-023-T01](#f-023-t01) | — | ⏳ 🧑‍🔧 |
| 🟢 Small | **Total** | 1 h (1 of 2 steps) | 0 h (0 of 2 steps recorded) | 1 h agent + 0.25 h owner | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-023.md)

| Field | Value |
|---|---|
| PR / evidence | Owner decision 2026-11-26, F-022-T02 ("Do you accept these as recommended? ok") |
| Opened | 2026-11-26 |
| Verification | Pending. |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-024"></a>[✨ F-024](#top)

**estimation-v1: evidence in the prompt, decline on missing figures**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 0.75 h agent + 0.25 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-024-T01 — estimation-v1 pack: evidence in the prompt, decline on missing figures (Planned).

| | |
|---|---|
| **Issue** | The index maps 0 cases to estimation. |
| **Reproduce** | `npm run index:build` reports `estimation: 0 mapped cases`. |
| **Check** | examples/estimation-v1.json with exact-answer estimation questions on the existing exact-json grader. Regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="f-024-t01"></a>F-024-T01 — estimation-v1 pack: evidence in the prompt, decline on missing figures | 0.75 h | 0 h | 0.75 h | Planned | — | [F-024-T02](#f-024-t02) | 🤖 |
| 🟢 Small | <a id="f-024-t02"></a>F-024-T02 — Release estimation-v1 | — | 0 h | 0 h agent + 0.25 h owner | Planned | [F-024-T01](#f-024-t01) | — | ⏳ 🧑‍🔧 |
| 🟢 Small | **Total** | 0.75 h (1 of 2 steps) | 0 h (0 of 2 steps recorded) | 0.75 h agent + 0.25 h owner | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-024.md)

| Field | Value |
|---|---|
| PR / evidence | Owner decision 2026-11-26, F-022-T02 ("Do you accept these as recommended? ok") |
| Opened | 2026-11-26 |
| Verification | Pending. |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-026"></a>[✨ F-026](#top)

**Turn audit enforcement on**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 0 h | — | — | 🤖 | — | — |

💻 **→** Next: F-026-T01 — Turn audit.enforce on (Implemented; verification pending).

| | |
|---|---|
| **Issue** | Full audit baselines exist (manifest kind full, latest 2026-11-22) but `audit.enforce` was off, so a due audit only warned. The 2026-11-26 cross-project audit (coordinator, docs/audits/2026-11-26-cross-project.md, proposal 17) proposes turning it on. |
| **Reproduce** | `.harness.json` had `"audit": {"days": 7, "enforce": false}`. |
| **Check** | `audit.enforce` is true and `npm run check:audits` and `npm run check:freshness` pass. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-026-t01"></a>F-026-T01 — Turn audit.enforce on | 0.25 h | 0 h | 0 h | Implemented; verification pending | PR #116 audit.enforce true |
| 🟢 Small | **Total** | 0.25 h | 0 h (0 of 1 steps recorded) | 0 h | 0 of 1 completed | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-026.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-026-T01: PR #116 audit.enforce true. [#116](https://github.com/voidbrain/gauntlet-protocol/pull/116) |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-025"></a>[✨ F-025](#top)

**research-v1: answers from supplied sources with cited ids**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | 1.25 h agent + 0.25 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-025-T01 — research-v1 pack over supplied sources with cited ids (Planned).

| | |
|---|---|
| **Issue** | The index maps 0 cases to research. |
| **Reproduce** | `npm run index:build` reports `research: 0 mapped cases`. |
| **Check** | examples/research-v1.json with closed-corpus questions graded on the answer and the cited source ids, on the existing exact-json grader. Regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟡 Medium | <a id="f-025-t01"></a>F-025-T01 — research-v1 pack over supplied sources with cited ids | 1.25 h | 0 h | 1.25 h | Planned | — | [F-025-T02](#f-025-t02) | 🤖 |
| 🟢 Small | <a id="f-025-t02"></a>F-025-T02 — Release research-v1 | — | 0 h | 0 h agent + 0.25 h owner | Planned | [F-025-T01](#f-025-t01) | — | ⏳ 🧑‍🔧 |
| 🟡 Medium | **Total** | 1.25 h (1 of 2 steps) | 0 h (0 of 2 steps recorded) | 1.25 h agent + 0.25 h owner | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-025.md)

| Field | Value |
|---|---|
| PR / evidence | Owner decision 2026-11-26, F-022-T02 ("Do you accept these as recommended? ok") |
| Opened | 2026-11-26 |
| Verification | Pending. |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-021"></a>[✨ F-021](#top)

**image-generation-v1: runner and grader after a design decision**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟣 Very large | 8.5 h agent + 0.75 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-021-T01 — Draft the image-generation design decision (Implemented; verification pending).

| | |
|---|---|
| **Issue** | The index maps 0 cases to audio-video. Image generation needs a new runner and a grader (VLM judge or similarity) whose design is not yet chosen. |
| **Reproduce** | `npm run index:build` reports `audio-video: 0 mapped cases`. |
| **Check** | A recorded design decision, then a runner and grader as decided, and examples/image-generation-v1.json, area audio-video; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-021-t01"></a>F-021-T01 — Draft the image-generation design decision | 1 h | 0 h | 1 h | Implemented; verification pending | — | — | 🤖 | PR #113 |
| 🟢 Small | <a id="f-021-t06"></a>F-021-T06 — Host check: Ollama image generation, then record runtime A or B | 0.5 h | 0 h | 0.5 h | Implemented; verification pending | — | [F-021-T03](#f-021-t03), [F-021-T07](#f-021-t07) | 🤖 | PR #114 planned; PR #115 host check |
| 🟡 Medium | <a id="f-021-t03"></a>F-021-T03 — Image-generation runner | 4 h | 0 h | 4 h | Planned | [F-021-T06](#f-021-t06) | [F-021-T04](#f-021-t04) | ⏳ 🤖 | PR #115 re-estimate |
| 🟡 Medium | <a id="f-021-t04"></a>F-021-T04 — Image grader and pack | 2 h | 0 h | 2 h | Planned | [F-021-T03](#f-021-t03) | [F-021-T08](#f-021-t08) | ⏳ 🤖 | — |
| 🟢 Small | <a id="f-021-t07"></a>F-021-T07 — Pull the image generator and the vision judge models | — | 0 h | 0 h agent + 0.5 h owner | Planned | [F-021-T06](#f-021-t06) | [F-021-T08](#f-021-t08) | ⏳ 🧑‍🔧 | PR #114 planned; PR #115 pull commands |
| 🟢 Small | <a id="f-021-t08"></a>F-021-T08 — First real run: prove the judge, measure generator variance | 1 h | 0 h | 1 h | Planned | [F-021-T04](#f-021-t04), [F-021-T07](#f-021-t07) | [F-021-T05](#f-021-t05) | ⏳ 🤖 | PR #114 planned |
| 🟢 Small | <a id="f-021-t05"></a>F-021-T05 — Release image-generation-v1 | — | 0 h | 0 h agent + 0.25 h owner | Planned | [F-021-T08](#f-021-t08) | — | ⏳ 🧑‍🔧 | — |
| 🟣 Very large | **Total** | 8.5 h (5 of 8 steps) | 0 h (0 of 8 steps recorded) | 8.5 h agent + 0.75 h owner | 1 of 8 completed | | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-021-t02"></a>F-021-T02 — Decide the image-generation design | — | 0 h | Completed | PR #114 decision |

</details>

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-021.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-021-T01: PR #113 · F-021-T02: PR #114 decision · F-021-T03: PR #115 re-estimate · F-021-T06: PR #114 planned; PR #115 host check · F-021-T07: PR #114 planned; PR #115 pull commands · F-021-T08: PR #114 planned. Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85); [#113](https://github.com/voidbrain/gauntlet-protocol/pull/113); owner decision 2026-11-26, F-021-T02 ("Do you accept these as recommended? ok"); owner approval 2026-11-26 of the widened F-021-T06 check ("Qwen Image 2.1 and Ollama check ok"); [#115](https://github.com/voidbrain/gauntlet-protocol/pull/115) |
| Opened | 2026-11-24 |
| Verification | Pending. |
| Reviewed | 2026-11-26 |

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
