# Gauntlet Protocol backlog

Current work ledger, reviewed 9 November 2026 against main `2d004de`. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Bugs and reliability

### B-001

**Owner cancellation leaves detached evaluation runners alive**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔺 P1 | Implemented | 🟢 Small |

💻 **→ Human action required: No**<br />Independently review the cancellation fix and verify its own release CI.

| | |
|---|---|
| **Issue** | SIGINT/SIGTERM of the outer CLI bypassed detached runner cleanup and its deadline timer. |
| **Reproduce** | Launch a sleeping registered runner, signal its owner and probe the runner PID. |
| **Check** | Both signals terminate and reap the active owned process group, leave later cases not-run, preserve incomplete evidence and remove signal handlers; no model calls. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Catch suite SIGINT/SIGTERM with an abort controller, combine HTTP cancellation signals, kill/reap owned external groups, stop subsequent work and remove listeners in finally. Upstream 0.1.1; no consumer adoption gate. SIGKILL/machine-loss and independently detached descendants remain explicit platform limits. Review: fresh-context report-only review found no remaining issues; both signal regressions and independent fake-provider abort/listener probe pass. [Review](reviews/2026-11-09-cancellation.md). Own CI pending.

**Estimates:** Small remaining effort, under one day for review/CI; estimated 2026-11-09. Not a measured campaign duration.

| Field | Value |
|---|---|
| PR / evidence | Test: test/cancellation.test.ts; f062c28 committed both failing signal regressions before fix. |
| Opened | 2026-11-09 |
| Verification | Unit/integration: both immutable signal regressions pass locally after fix; Review: independent report-only review passed; own CI pending. |
| Reviewed | 2026-11-09 |

</details>

---

## Features and improvements



## Other changes

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
