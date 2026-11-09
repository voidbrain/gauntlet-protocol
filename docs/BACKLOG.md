# Gauntlet Protocol backlog

Current work ledger, reviewed 9 November 2026 against main `67cb511`. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Bugs and reliability


## Features and improvements

### F-005

**Reusable machine profiles and load-scenario evidence scope**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

💻 **→ Human action required: No**<br />Finish independent review/CI and publish0.3.0; no consumer adoption or live model campaign gates release.

| | |
|---|---|
| **Issue** | Common evaluation results can serve several consumers, but machine/load declarations need reusable contracts and explicit evidence identity rather than duplicated consumer-only plans. |
| **Reproduce** | Plan and run a neutral fixture with machine/scenario declarations, then request reuse from another consumer, a different scenario and a mismatched host. |
| **Check** | Strict non-executable machine/scenario contracts; local host compatibility and explicit owner load confirmation before probes/reuse; report/cache/compare/export preserve scope; full definition changes and unscoped evidence cannot stand in for requested conditions. CLI and library fixtures verify the joins; legacy evidence stays readable; no app, model or power setting is changed. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Implemented for0.3.0: [reusable environment contract](ENVIRONMENTS.md), neutral load examples, machine inspection and explicit current owner scenario confirmation. Complete definitions bind evidence; original host/runtime/source identity and authorization remain. Performance comparisons require fresh measurements; declarations are not independent load verification. Publish after owned tests/CI and fresh-context review; closes on the published tag, independently of consumers.

**Estimates:** Small remaining effort, estimated2026-11-09: implementation and seven focused neutral joins pass; independent review, final CI and publication remain. No live campaign estimate or spend is implied.

| Field | Value |
|---|---|
| PR / evidence | [PR #7](https://github.com/voidbrain/gauntlet-protocol/pull/7); Test: test/environments.test.ts; Review: [fresh-context report](reviews/2026-11-09-environments-independent.md), strict-enum finding fixed after unchanged failing regressione7f7183; seven focused tests pass, no remaining findings. |
| Opened | 2026-11-09 |
| Verification | Unit/integration: seven machine/scenario/CLI/reuse fixtures pass, all35 deterministic tests plus typecheck/build/index/backlog/rule checks passed locally; final CI recorded before release. No real load/model qualification. |
| Reviewed | 2026-11-09 |

</details>

---








## Other changes

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
