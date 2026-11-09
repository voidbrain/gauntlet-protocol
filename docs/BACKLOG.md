# Gauntlet Protocol backlog

Current work ledger, reviewed 10 November 2026 against main `90dc2b6`. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Bugs and reliability


## Features and improvements

### F-008

**Expand the common evaluation pack beyond ten smoke cases**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟡 Medium |

💻 **→ Human action required: No**<br />Prepare the reusable contracts and deterministic acceptance fixtures.

| | |
|---|---|
| **Issue** | The ten-case neutral smoke pack is too narrow to support broad capability comparisons. |
| **Reproduce** | Owner request 2026-11-10: expand reusable evaluation coverage and make candidate comparisons reproducible. |
| **Check** | Versioned coverage includes paraphrases, ambiguity, multi-turn corrections, invalid tool arguments, refusal, prompt injection and harder held-out cases. Strict semantic grading remains separate from structural validity; deterministic grader fixtures prove both correct and deliberately incorrect answers. Held-out labels alone never imply confidentiality or isolation. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Design a coverage matrix and versioned expanded pack with stable case/capability/split identities; assess multi-turn runner support before choosing an explicit contract. Preserve existing smoke versions and historical evidence. Add positive/negative grader joins, regenerate the capability index and document coverage limits. Generic contracts, packs, graders, CLI and repository-owned fixtures belong here. Consumer role packs, runtime routing and production acceptance remain consumer-owned. Release acceptance never waits for NERV adoption. Live campaigns, model downloads and installations require separately reviewed scope and budgets; registration launches none.

**Estimates:** 🟡 Medium, estimated 2026-11-10: contract design, deterministic fixtures and documentation remain unimplemented; live model availability and campaign cost are unknown.

| Field | Value |
|---|---|
| PR / evidence | [PR #14](https://github.com/voidbrain/gauntlet-protocol/pull/14) backlog registration; implementation pending |
| Opened | 2026-11-10 |
| Verification | Pending implementation; documentation registration only. |
| Reviewed | 2026-11-10 |

</details>

---

### F-009

**Define repeatable candidate comparisons**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟡 Medium |

💻 **→ Human action required: No**<br />Prepare the reusable contracts and deterministic acceptance fixtures.

| | |
|---|---|
| **Issue** | Existing report comparison needs an explicit repeatable protocol for broader candidate evaluation rather than treating one smoke pass as competence. |
| **Reproduce** | Owner request 2026-11-10: expand reusable evaluation coverage and make candidate comparisons reproducible. |
| **Check** | Preserve exact requested/actual model, runtime, context, sampling, thinking, quantization and environment identities; repeated outcomes, failures/errors/not-run, cold/warm latency and measured input/output/cache tokens retain provenance and unknown coverage. Structural validity and semantic success are reported separately. Incompatible configurations are rejected or explicitly separated; no automatic promotion follows. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Assess existing compare/repeat/report behavior, then define a bounded candidate matrix, compatible comparison dimensions, repetition policy and failure-preserving summaries. Use repository-owned fake providers/reports to verify identity, aggregate budgets, interruption, repeat accounting and unknown telemetry; retain source event identities and avoid duplicate token totals. Expanded-pack campaigns can consume F-008 after release, but comparison contract implementation can proceed independently. Generic contracts, packs, graders, CLI and repository-owned fixtures belong here. Consumer role packs, runtime routing and production acceptance remain consumer-owned. Release acceptance never waits for NERV adoption. Live campaigns, model downloads and installations require separately reviewed scope and budgets; registration launches none.

**Estimates:** 🟡 Medium, estimated 2026-11-10: contract design, deterministic fixtures and documentation remain unimplemented; live model availability and campaign cost are unknown.

| Field | Value |
|---|---|
| PR / evidence | [PR #14](https://github.com/voidbrain/gauntlet-protocol/pull/14) backlog registration; implementation pending |
| Opened | 2026-11-10 |
| Verification | Pending implementation; documentation registration only. |
| Reviewed | 2026-11-10 |

</details>

---


## Other changes

Boundary clarification2026-11-10 ([PR #13](https://github.com/voidbrain/gauntlet-protocol/pull/13)): external-runner contract supplies no coding sandbox. Worktrees/process supervision/hashes do not enforce hidden-test confidentiality; that requires independently accepted runner/grader isolation. PROTOCOL/EVIDENCE now state these limits explicitly. Documentation-only; no new isolation implementation or live campaign. README/AGENTS/area notes/backlog rules/style guide reviewed for consistency.

F-007 accepted in v0.4.1 after PR #11 / CI42686856664 and independent review;43 deterministic tests. No real-model campaign.

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
