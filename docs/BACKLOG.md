# Gauntlet Protocol backlog

Current work ledger, reviewed 9 November 2026 against main `62d8072`. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Bugs and reliability


## Features and improvements

### F-002

**Generated capability index and conservative evidence reuse**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

💻 **→ Human action required: No**<br />Verify final owned CI and release; deterministic implementation and independent review complete.

| | |
|---|---|
| **Issue** | Generated capability index and conservative evidence reuse. |
| **Reproduce** | Exercise CLI/API with neutral packs and fake local runtimes. |
| **Check** | Generate a stable case/area/capability index from packs. Reuse only complete passing evidence matching current pack/grader, exact profile/runtime/model identity, environment and explicit freshness; retain original report timestamps and provenance; never reuse system results across changed sources or grant qualification. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Generate a stable case/area/capability index from packs. Reuse only complete passing evidence matching current pack/grader, exact profile/runtime/model identity, environment and explicit freshness; retain original report timestamps and provenance; never reuse system results across changed sources or grant qualification. Own strict checks, deterministic join tests, documentation and reviewed CI/release; never wait on NERV adoption or live-model acceptance.

**Estimates:** Medium remaining effort, 2–3 focused days including evidence edge cases; estimated 2026-11-09. No measured duration claimed.

| Field | Value |
|---|---|
| PR / evidence | [PR #5](https://github.com/voidbrain/gauntlet-protocol/pull/5); Review: fresh-context report-only review passed after three immutable regressions068eb6f; final CI pending. |
| Opened | 2026-11-09 |
| Verification | Local deterministic acceptance and fresh-context report-only review passed; final own CI pending. Review: docs/reviews/2026-11-09-evidence-tools.md; three findings fixed after immutable failing regressions068eb6f. |
| Reviewed | 2026-11-09 |

</details>

---

### F-003

**Measured cold/warm inference and host telemetry**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

💻 **→ Human action required: No**<br />Verify final owned CI and release; deterministic implementation and independent review complete.

| | |
|---|---|
| **Issue** | Measured cold/warm inference and host telemetry. |
| **Reproduce** | Exercise CLI/API with neutral packs and fake local runtimes. |
| **Check** | Retain provider load/prompt/generation timing and tokens, sample host/process/model allocation with declared interval/coverage/unknown GPU values, separate cold and warm calls, bound telemetry requests and cleanup. No model run is a release gate. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Retain provider load/prompt/generation timing and tokens, sample host/process/model allocation with declared interval/coverage/unknown GPU values, separate cold and warm calls, bound telemetry requests and cleanup. No model run is a release gate. Own strict checks, deterministic join tests, documentation and reviewed CI/release; never wait on NERV adoption or live-model acceptance.

**Estimates:** Medium remaining effort, 2–3 focused days including evidence edge cases; estimated 2026-11-09. No measured duration claimed.

| Field | Value |
|---|---|
| PR / evidence | [PR #5](https://github.com/voidbrain/gauntlet-protocol/pull/5); Review: fresh-context report-only review passed after three immutable regressions068eb6f; final CI pending. |
| Opened | 2026-11-09 |
| Verification | Local deterministic acceptance and fresh-context report-only review passed; final own CI pending. Review: docs/reviews/2026-11-09-evidence-tools.md; three findings fixed after immutable failing regressions068eb6f. |
| Reviewed | 2026-11-09 |

</details>

---

### F-004

**Explicit local alternative runtime adapters**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

💻 **→ Human action required: No**<br />Verify final owned CI and release; deterministic implementation and independent review complete.

| | |
|---|---|
| **Issue** | Explicit local alternative runtime adapters. |
| **Reproduce** | Exercise CLI/API with neutral packs and fake local runtimes. |
| **Check** | Add tested local llama.cpp and MLX-LM adapters with independently checked model artifacts, explicit runtime identity/configuration and capability limits. No implicit installation/download or provider changes; native Ollama remains default. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Add tested local llama.cpp and MLX-LM adapters with independently checked model artifacts, explicit runtime identity/configuration and capability limits. No implicit installation/download or provider changes; native Ollama remains default. Own strict checks, deterministic join tests, documentation and reviewed CI/release; never wait on NERV adoption or live-model acceptance.

**Estimates:** Medium remaining effort, 2–3 focused days including evidence edge cases; estimated 2026-11-09. No measured duration claimed.

| Field | Value |
|---|---|
| PR / evidence | [PR #5](https://github.com/voidbrain/gauntlet-protocol/pull/5); Review: fresh-context report-only review passed after three immutable regressions068eb6f; final CI pending. |
| Opened | 2026-11-09 |
| Verification | Local deterministic acceptance and fresh-context report-only review passed; final own CI pending. Review: docs/reviews/2026-11-09-evidence-tools.md; three findings fixed after immutable failing regressions068eb6f. |
| Reviewed | 2026-11-09 |

</details>

---




## Other changes

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
