# Gauntlet Protocol backlog

Current work ledger, reviewed 9 November 2026 against main `b605107`. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Bugs and reliability


## Features and improvements

### F-006

**Private failed-reply diagnostics and selected reruns**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

💻 **→ Human action required: No**<br />Verify bounded opt-in captures, private inspection and final CI before release.

| | |
|---|---|
| **Issue** | A failed structured-output result stores only a response hash, so its final reply cannot be inspected or recovered from the report. |
| **Reproduce** | Run an invented malformed-JSON reply; inspect its report and optional new private capture directory. |
| **Check** | Explicit new external private directory, default off, final failed reply only, no prompts/expected answers/hidden reasoning; file/count/aggregate caps and no overwrite/link/checkout writes; hashes bind report/case/fixture/response; failure grades unchanged; source-qualified selected cases and fresh execution; no live model call or consumer adoption gate. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Implemented optional private sidecars and bounded inspector plus explicit case selection. Wire reports advance to0.4 with a diagnostic marker and retain older evidence reading; prepared package0.4.0 invalidates engine-mismatched reuse correctly. No old response can be recovered from its hash. Neutral tests, independent fresh-context review, final CI and publication remain required. Adopt released harness4.4.1 optional registration rule/metadata ledger, preserving project execution/privacy requirements and marking native counters unknown.

**Estimates:** Small remaining effort, assessed2026-11-09: deterministic fixtures, review, final CI and release. No real campaign required.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-09 |
| Verification | Unit/integration: 41 deterministic fixtures pass after build, including six capture/privacy/budget/CLI joins. Independent fresh-context Git-discovery finding fixed after committed regression and rechecked without blocker. Final CI/release pending. No live model or client-loading acceptance. |
| Reviewed | 2026-11-09 |

</details>

---

## Other changes

F-005 released in [v0.3.0](https://github.com/voidbrain/gauntlet-protocol/tree/v0.3.0) after PR7 exacthead170611f / CI42607576561 passed all35 deterministic tests and owned packaging/contract checks. Fresh-context strict-enum finding fixed after committed failing regressione7f7183 and rechecked. No model/load campaign or consumer adoption gates the release.

F-002/F-003/F-004 released in v0.2.0 from PR #5, CI42572655186 and independent report-only review; neutral deterministic acceptance only. No consumer adoption or live model qualifies the shared release.

B-001 closed against PR #3, CI 42534614317 and independent report-only review; release v0.1.1. This documentation reconciliation adds no runtime work.

PR #1 implemented the independent protocol; CI 42533767427 and fresh-context review accepted it. F-001 archived in [2026](archive/backlog-2026.md). PR #2 reconciled and archived F-001 with CI 42534060898 passed; no model qualified.

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

Each item shows its ID and title, a signal table (priority, status, remaining effort), Human action required (🧑 Yes / 💻 No), and Issue / Reproduce / Check. Expand the closed details for next actions, estimate rationale, PR history, dates and verification. Effort: 🟢 Small ≤1 day · 🟡 Medium 2–3 days · 🔴 Large ≥4 days. Status and verification evidence describe progress; effort is an estimate of work still required. A `---` line ends every item.
