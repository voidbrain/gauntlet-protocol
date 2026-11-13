# Gauntlet Protocol backlog

Current work ledger, reviewed 13 November 2026 against main `b2f5e76`. PR #41 (harness 6.0.0) passed CI 43209718538; roadmap planned: F-011 incremental runs, F-012 six packs, F-013 host fit. [Roadmap](ROADMAP.md) · [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

<!-- totals:start -->
**Remaining effort:** 18 h across 13 open steps of 3 features. Generated from the task files.
<!-- totals:end -->

## Work items

Bugs (B-) and features (F-) in one list, most urgent first.

### F-011

**Incremental runs: only what changed, resumable**

| Signal | Priority | Status | Effort | Remaining | Depends on | Unlocks | Human action |
|:---:|---|---|---|---|---|---|:---:|
| 🔴 | 🔶 P2 | Open | 🔴 Large | 4.5 h | — | — | 💻 No |

💻 **→** F-011-T01.

| | |
|---|---|
| **Issue** | Every campaign reruns all selected cases, even when `pending` already knows most are current; an interrupted local-model campaign starts over. Slow models on small hosts make this costly. |
| **Reproduce** | Run a pack, change one case, run again: every case runs. Interrupt a run: nothing is reusable. |
| **Check** | Only pending cases run; an interrupted run resumes to the same result; partial runs merge into the ledger; releases list changed cases per pack. |

**Feature steps** (baseline: accepted estimate; actual: effort spent, so far while open; h: agent hours, owner time apart; status is not parent acceptance)

| Step | Baseline | Actual | Remaining | Status |
|---|---|---|---|---|
| F-011-T01 — Run only pending cases | 1.5 h | 0 h | 🟢 Small — 1.5 h | Ready |
| F-011-T02 — Resume an interrupted campaign | 1.5 h | 0 h | 🟢 Small — 1.5 h | Planned |
| F-011-T03 — Merge partial runs into the ledger | 1 h | 0 h | 🟢 Small — 1 h | Planned |
| F-011-T04 — Release with a per-pack list of added and changed cases | 0.5 h | 0 h | 🟢 Small — 0.5 h | Planned |
| **Total** | 4.5 h | 0 h (0 of 4 steps recorded) | 4.5 h | 0 of 4 completed |

<details>
<summary>Next action, estimates and evidence</summary>

**Step estimates** (dated basis; generated from the task files)

- F-011-T01: 1.5 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.
- F-011-T02: 1.5 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.
- F-011-T03: 1 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.
- F-011-T04: 0.5 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.

**Next action / closure evidence:** F-011-T01. Planned 2026-11-13 at the owner's request as part of the [roadmap](ROADMAP.md); every step is in its task file.

**Estimates:** 4.5 h agent over 4 steps, estimated 2026-11-13; not a measurement.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-13: incremental runs, more packs, small-model hosts. |
| Opened | 2026-11-13 |
| Verification | Pending. |
| Reviewed | 2026-11-13 |

</details>

---
### F-012

**Six new packs: structured output, tools, bilingual, multi-step, refusal, long context**

| Signal | Priority | Status | Effort | Remaining | Depends on | Unlocks | Human action |
|:---:|---|---|---|---|---|---|:---:|
| 🔴 | 🔶 P2 | Open | 🔴 Large | 11 h | — | — | 💻 No |

💻 **→** F-012-T01, F-012-T02, F-012-T03 or F-012-T06 (independent).

| | |
|---|---|
| **Issue** | Three packs exist (smoke, smoke-schema, general-assistant-expanded). They cannot tell whether a model can choose tools, keep structured output under pressure, work in Italian, run several steps, refuse escalation or use long inputs. |
| **Reproduce** | `gauntlet packs` lists three packs. |
| **Check** | Six new packs, each with regression and holdout splits, deterministic grader fixtures and an index entry, released in a tagged version. |

**Feature steps** (baseline: accepted estimate; actual: effort spent, so far while open; h: agent hours, owner time apart; status is not parent acceptance)

| Step | Baseline | Actual | Remaining | Status |
|---|---|---|---|---|
| F-012-T01 — Structured-output robustness pack | 2 h | 0 h | 🟢 Small — 2 h | Ready |
| F-012-T02 — Tool use pack | 2 h | 0 h | 🟢 Small — 2 h | Ready |
| F-012-T03 — Bilingual (Italian and English) pack | 1.5 h | 0 h | 🟢 Small — 1.5 h | Ready |
| F-012-T04 — Multi-step agent pack | 2 h | 0 h | 🟢 Small — 2 h | Planned |
| F-012-T05 — Refusal and permission escalation pack | 1.5 h | 0 h | 🟢 Small — 1.5 h | Planned |
| F-012-T06 — Long context pack | 1.5 h | 0 h | 🟢 Small — 1.5 h | Ready |
| F-012-T07 — Release the new packs | 0.5 h | 0 h | 🟢 Small — 0.5 h | Planned |
| **Total** | 11 h | 0 h (0 of 7 steps recorded) | 11 h | 0 of 7 completed |

<details>
<summary>Next action, estimates and evidence</summary>

**Step estimates** (dated basis; generated from the task files)

- F-012-T01: 2 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.
- F-012-T02: 2 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.
- F-012-T03: 1.5 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.
- F-012-T04: 2 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.
- F-012-T05: 1.5 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.
- F-012-T06: 1.5 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.
- F-012-T07: 0.5 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.

**Next action / closure evidence:** F-012-T01, F-012-T02, F-012-T03 or F-012-T06 (independent). Planned 2026-11-13 at the owner's request as part of the [roadmap](ROADMAP.md); every step is in its task file.

**Estimates:** 11 h agent over 7 steps, estimated 2026-11-13; not a measurement.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-13: incremental runs, more packs, small-model hosts. |
| Opened | 2026-11-13 |
| Verification | Pending. |
| Reviewed | 2026-11-13 |

</details>

---
### F-013

**Host-aware profiles: a model that does not fit the host is refused before the run**

| Signal | Priority | Status | Effort | Remaining | Depends on | Unlocks | Human action |
|:---:|---|---|---|---|---|---|:---:|
| 🔴 | 🔹 P3 | Open | 🟡 Medium | 2.5 h | — | — | 💻 No |

💻 **→** F-013-T01.

| | |
|---|---|
| **Issue** | Profiles describe a model but not what it needs; a campaign on a small host discovers too late that the model does not fit or times out. |
| **Reproduce** | Plan a 30B profile against a 16 GB host: nothing warns. |
| **Check** | Profiles and environments declare size and memory; `plan` refuses or warns on a misfit; small-host example profiles and limits exist. |

**Feature steps** (baseline: accepted estimate; actual: effort spent, so far while open; h: agent hours, owner time apart; status is not parent acceptance)

| Step | Baseline | Actual | Remaining | Status |
|---|---|---|---|---|
| F-013-T01 — Host fit in model profiles | 1.5 h | 0 h | 🟢 Small — 1.5 h | Ready |
| F-013-T02 — Small-host example profiles | 1 h | 0 h | 🟢 Small — 1 h | Planned |
| **Total** | 2.5 h | 0 h (0 of 2 steps recorded) | 2.5 h | 0 of 2 completed |

<details>
<summary>Next action, estimates and evidence</summary>

**Step estimates** (dated basis; generated from the task files)

- F-013-T01: 1.5 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.
- F-013-T02: 1 h agent (2026-11-13). Estimated 2026-11-13 in the evaluation roadmap plan (owner request). Not a measurement.

**Next action / closure evidence:** F-013-T01. Planned 2026-11-13 at the owner's request as part of the [roadmap](ROADMAP.md); every step is in its task file.

**Estimates:** 2.5 h agent over 2 steps, estimated 2026-11-13; not a measurement.

| Field | Value |
|---|---|
| PR / evidence | Owner request 2026-11-13: incremental runs, more packs, small-model hosts. |
| Opened | 2026-11-13 |
| Verification | Pending. |
| Reviewed | 2026-11-13 |

</details>

---

## Other changes

**Harness v6.0.0 reconciliation (5.5.0 and 5.6.0 included), 2026-11-12.** `tools/work-items.mjs`, `check-backlog.mjs`, `backlog-queue.mjs`, `backlog-dependencies.mjs` and `check-freshness.mjs` copied byte-identically from v6.0.0; the Record and evidence requirements, Linked prerequisites, Optional work queue, Optional upfront feature plans and Estimate calibration paragraphs of BACKLOG-RULES carried from the template diff v5.4.0..v6.0.0. The layout lists bugs and features as one `Work items` list (`{"records": "all"}`); records now show Remaining, Depends on, Unlocks and Human action in their summary table, and with feature plans every record, bugs included, needs a task step. No active record exists, so nothing is re-estimated in agent hours (5.6.0) and no step was added; `workItems.estimation.since` set to today so day-era samples stop counting. No generated queue or dependency page or script existed to retire (5.5.0). CI still checks out template v5.1.1, as before. Reconciles merged PR #40 / CI 43072438199 (success). [PR #41](https://github.com/voidbrain/gauntlet-protocol/pull/41). Review: fresh-context mechanical review (Haiku), all checks pass: copies byte-identical to v6.0.0, BACKLOG-RULES equals the template diff, layout and stamp changes only as stated, ledger reproduces from sources.

**Harness v5.1.1 reconciliation, 2026-11-11 ([PR #31](https://github.com/voidbrain/gauntlet-protocol/pull/31)).** Covers template releases 5.0.1, 5.0.2, 5.1.0 and 5.1.1. 5.0.1 and 5.0.2 need nothing here: the ESLint and Prettier ignores already exclude `.harness/` (PR #30), and the Angular change does not apply to this core-only project. 5.1.0: `tools/check-harness.mjs` (new `--strict` flag) and the reviewer agents `.claude/agents/mechanical-reviewer.md` (Haiku) and `design-reviewer.md` (Opus) are copied byte-identically from tag v5.1.1 and listed under `copied`; `node tools/check-harness.mjs --strict` passes. The Independent review paragraph of BACKLOG-RULES and its pointer in AGENTS.md are reconciled by hand: a copy-only reconcile needs no reviewer when `--strict` passes, and reviews are matched to the change; no check, never or ask-first rule, or safeguard is removed. 5.1.1: `.gitignore` ignores `node_modules` without the trailing slash, so a worktree symlink is ignored (none was committed). CI checks the copies against v5.1.1. Fresh-context review (Opus): no blockers. Its should-fix, applied in a follow-up PR because #31 was already green: `.gitignore` lacked the template's `.claude/settings.local.json` and `.claude/worktrees/` lines (missing since before 5.0.0), which matter now that `.claude/agents/` is versioned. ESLint still ignores all of `tools/**` instead of the copied tools by path (APPLY 5.0.1); every file there is a copied tool, so nothing project-owned escapes lint, but a project tool added later must be un-ignored. No behaviour runner is configured.

**Harness v5.0.0 reconciliation, 2026-11-11 ([PR #30](https://github.com/voidbrain/gauntlet-protocol/pull/30)).** Copies the 26 changed tools and the new `check-tooling.mjs` from tag v5.0.0, and adopts its two changes. (1) Formatter and linter, now required for every stack: Prettier 3.9.10 and ESLint 10.14.0 with typescript-eslint, `format`, `format:check`, `lint` and `check:tooling` scripts and a CI step. `src/`, `bin/` and `test/` were reformatted mechanically (18 files; a trivia-free TypeScript syntax-tree fingerprint of each is equal before and after), then four lint findings were fixed by hand (two unused imports, one unused binding, one useless initialiser). Protocol behaviour is unchanged and 48 deterministic tests pass, with one consequence: the engine hash is computed from the text of the engine files, so it changes with the reformat. From the next release, v0.5.0 reports stop being reusable as cached evidence, qualification asks for re-evaluation and `compare` reports an `engine` mismatch against them, as after any engine change. The published v0.5.0 artifact is unchanged and no release follows now. An independent review confirmed the copies, the reformat and the four edits, and found that the first revision failed CI because ESLint walked into the template checkout under `.harness/`; fixed by ignoring it. (2) Reconciliation is folded into the next working PR; a reconciliation-only PR is due at 10 merged PRs or one day behind. Rule sentences in AGENTS.md and BACKLOG-RULES reconciled by hand. Also reconciles merged PR #29 / CI 42973762775 (F-009 closed, v0.5.0 tagged) and releases the stale F-009-T03 claim. No model campaign; no behaviour runner is configured.

F-009 closed 2026-11-11 and released in v0.5.0 with F-008 after PR #28 / CI 42973260515 passed 48 deterministic tests and owned checks. Repeatable candidate comparisons keep full requested and observed identity, explicit mismatch reasons, error/not-run counts and unknown usage; no automatic promotion, live model campaign or consumer adoption gate.

F-008 closed 2026-11-11 after PR #22 / CI 42928961766 passed 46 deterministic tests and owned checks. The 28-case expanded pack, transcript contract, strict semantic joins and generated index are accepted without a live model campaign or consumer adoption gate.

**Harness v4.8.0 reconciliation, 2026-11-11 ([PR #16](https://github.com/voidbrain/gauntlet-protocol/pull/16)).** Adopt the published subscription-usage release by copying the updated work-usage tool and guide byte-identically and advancing the project stamp. Existing private stores require no migration; no client setting, collector, model call, allowance capture or export is enabled or run. Reconciled merged PR #15 / CI 42888597710 and advanced the ledger header to main `197531a`. Merged as `58c45b8` after CI 42926423088 passed. A report-only fresh-context review completed after merge and found no content, privacy or security blocker; because PR #16 merged before that review completed, it did not satisfy the required pre-merge review timing. [PR #17](https://github.com/voidbrain/gauntlet-protocol/pull/17) reconciles that evidence and the merged-branch cleanup. Copied files match published v4.8.0; no optional collector/client configuration/model call/export was exercised and no behaviour runner is configured. README, AGENTS, area notes, backlog rules and style guide reviewed with no further affected claim.

**Harness reconciliation and upfront plans, 2026-11-10 ([PR #15](https://github.com/voidbrain/gauntlet-protocol/pull/15)).** Adopt published v4.7.0 (harness PR97/98/99), source-owned records and optional featurePlans enforcement. Initial exact migration preserved all ledger bytes before enabling derived step tables. F-008/F-009 each have three anticipated steps with dated effort, status, dependencies and uncertainty. Native metadata imports/optional explicit launcher preserve source/privacy limits; no model call, download, client configuration, native exporter or production permission follows. No behaviour runner is configured; rule-following and actual session tokens remain unmeasured. Shared reconciliation work spans both features and is explicitly unallocated rather than duplicated. Validation:43 deterministic tests, typecheck/build/index, work/backlog/rules/harness/audit/integration and impact checks pass. Review: independent fresh-context consumer_plans_review found no content blocker; no app/model acceptance claimed.

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

Each item shows its ID and title, a signal table (priority, status, effort size, remaining time, Depends on, Unlocks and Human action 🧑 Yes / 💻 No), the human or next action, and Issue / Reproduce / Check. Expand the closed details for next actions, estimate rationale, PR history, dates and verification. Effort: 🟢 Small ≤1 day · 🟡 Medium 2–3 days · 🔴 Large ≥4 days. Status and verification evidence describe progress; effort is an estimate of work still required. A `---` line ends every item.
