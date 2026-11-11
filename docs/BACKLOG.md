# Gauntlet Protocol backlog

Current work ledger, reviewed 11 November 2026 against main `6cca8d1`. v0.6.0 published (PR #34, CI 43020317739); B-002 opened: ledger coverage ignores model, runtime, scenario and source identity. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Bugs and reliability

### B-002

**Ledger coverage ignores model digest, runtime, machine scenario and consumer source**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟢 Small |

💻 **→ Human action required: No**<br />Add identity fields to the ledger entry and to `pending`, then release.

| | |
|---|---|
| **Issue** | F-010-T01 required ledger entries keyed by "model/profile/runtime/settings identity, machine scenario", but v0.6.0 keys coverage on case hash and profile hash only. A run stays covering after the model weights (digest), the runtime build, the machine scenario or the system under test changes, so `pending` reports nothing and a consumer reuses evidence that no longer matches. Found by voidbrain/nerv F-074-T08 on 2026-11-11. |
| **Reproduce** | Record a report in a ledger, then call `pendingCases` for the same pack and profile after changing the model digest, the runtime identity or the environment scenario of the run you intend to make: the case is not pending. A system case run against an older consumer source is also not pending. |
| **Check** | A ledger entry records, from the admitted report, the model digest, a runtime identity hash (`identity` and `runtime`), the environment/scenario hash or null, and an optional opaque `sourceKey` the consumer passes to `ledger record` (no consumer name, path or policy in Gauntlet). `pending` takes the intended identity and lists a case as pending with a named reason (`model-changed`, `runtime-changed`, `scenario-changed`, `source-changed`) when the latest covering entry differs; an unset field in the query does not constrain. Ledger schema version 2 reads version 1 entries as unknown identity, which never covers a constrained query. Metadata only. Fixtures for each reason, for v1 entries and for unconstrained queries. Released with a CHANGELOG entry. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Implement B-002-T01 (entry fields and schema 2) and B-002-T02 (`pending` reasons and CLI flags), fresh-context review, release. Closes on the release tag after green CI. Consumers adopt it in their own backlogs.

**Estimates:** Small remaining effort, about 1 focused day (B-002-T01 0.5, B-002-T02 0.5). Estimated 2026-11-11. Estimates, not measurements.

| Field | Value |
|---|---|
| PR / evidence | Planned in [PR #36](https://github.com/voidbrain/gauntlet-protocol/pull/36). Found against v0.6.0 ([PR #34](https://github.com/voidbrain/gauntlet-protocol/pull/34)): `LedgerEntry` holds `caseHash` and `profileHash` only, while the F-010-T01 acceptance (archived task file) named runtime and machine scenario. |
| Opened | 2026-11-11 |
| Verification | Pending |
| Reviewed | 2026-11-11 |

</details>

---

## Features and improvements

## Other changes

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

Each item shows its ID and title, a signal table (priority, status, remaining effort), Human action required (🧑 Yes / 💻 No), and Issue / Reproduce / Check. Expand the closed details for next actions, estimate rationale, PR history, dates and verification. Effort: 🟢 Small ≤1 day · 🟡 Medium 2–3 days · 🔴 Large ≥4 days. Status and verification evidence describe progress; effort is an estimate of work still required. A `---` line ends every item.
