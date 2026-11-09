# Gauntlet Protocol backlog

Current work ledger, reviewed 9 November 2026 against main `6f02768`. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Bugs and reliability


## Features and improvements

### F-007

**Explicit Ollama structured-output contracts**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

💻 **→ Human action required: No**<br />Verify and release the reusable format contract.

| | |
|---|---|
| **Issue** | Prompt-only JSON smoke failures do not establish schema-constrained Ollama behavior. |
| **Reproduce** | Plan/run the original smoke pack and the separate schema smoke pack with the same model profile. |
| **Check** | Explicit JSON/schema forwarding; bounded local schemas; no answer leakage; unsupported backends reject; mode changes pack/cache identity; independent grading and private captures unchanged; deterministic tests, CLI and release evidence. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Verify and publish reusable support; consumer adoption is not a release gate. Optional per-case responseFormat selects JSON mode or a bounded object schema; omission preserves the original request. Separate neutral-smoke-schema pack supplies structural types without answer enums/constants. No real model call authorized or executed. Public reports retain pack identity and grades; no raw responses added. Existing identical-prompt holdout exclusions remain intact across format modes.

**Estimates:** Small remaining effort, estimated2026-11-09: release verification and documentation; provider support checked against official Ollama documentation, live Gemma acceptance remains unknown.

| Field | Value |
|---|---|
| PR / evidence | [PR #11](https://github.com/voidbrain/gauntlet-protocol/pull/11);42 deterministic fixtures |
| Opened | 2026-11-09 |
| Verification | Unit/integration:42 deterministic tests and typecheck passed2026-11-09; final CI pending. Documentation consistency reviewed against README, AGENTS, area notes, backlog rules and style guide. |
| Reviewed | 2026-11-09 |

</details>

---

## Other changes

F-006 released in v0.4.0 after PR #9 / CI42679371024 and independent report-only review;41 deterministic fixtures and packaging/static checks passed. Private capture and selected diagnostics are accepted independently of consumer adoption. No live model campaign or native client source verification.


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
