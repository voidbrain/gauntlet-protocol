# Gauntlet Protocol backlog

Current work ledger, reviewed 27 November 2026 against main `c131b53`. PRs #123 and #126–#131 merged on green CI (#123 deps; #127, #129 harness v10.24.2; #130 coordinator prefix; #126 F-032–F-034; #128 F-035; #131 F-036). Closed B-003 (#99), B-004 (#118), F-022 (#112, #114), F-026 (#116), F-027 (#118, #122, #124) and F-021-T01/T03/T04/T06 (#113–#121).
[Roadmap](ROADMAP.md) · [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

<!-- totals:start -->
**Remaining effort:** 32 h agent + 2.25 h owner across 42 open steps of 13 features and 2 other records. Generated from the task files.
<!-- totals:end -->

## Work items

Bugs (B-) and features (F-) in one list, most urgent first.

### <a id="f-032"></a>[✨ F-032](#top)

**json-match grader: ignored paths, numeric tolerance, order-free arrays**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | 2 h agent + 0.25 h owner | — | [F-035-T04](#f-035-t04) | 🤖 | — | — |

💻 **→** Next: F-032-T01 — json-match grader with fixtures and PROTOCOL text (Planned).

| | |
|---|---|
| **Issue** | `exact-json-v1` is a deep, order-sensitive equality (`src/index.ts:1234`, `isDeepStrictEqual`), so a correct answer whose free text or free numbers differ fails: openbando's command batches (free `reply` and positions), fpvbuddy's several batteries in one phrase, nerv's planner actions with free-text arguments such as a reminder title, and research-v1's cited source ids (a set) cannot be graded fairly. The consumers' cases are in Italian and English, so the free text is often Italian. Owner decision 2026-11-26 in chat: "ok to all" (accepts proposals 1 to 3 of the shared-asset review, coordinator:F-016-T09); same message: "nerv and all modules will need to work with Italian". |
| **Reproduce** | A fixture whose answer differs from the expected only in `reply` text, or in array order, fails `exact-json-v1`. |
| **Check** | A new expected kind (`json-match`) with declared ignored paths, per-path numeric ranges and order-free arrays; deterministic, proven by fixtures (pass and fail per rule, including Italian free text with accents under an ignored path); validated by `gauntlet validate`; documented in PROTOCOL; a tagged release. Consumers (openbando:F-057, fpvbuddy:F-022, nerv:F-120-T09) adopt through their pin. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟡 Medium | <a id="f-032-t01"></a>F-032-T01 — json-match grader with fixtures and PROTOCOL text | 2 h | 0 h | 2 h | Planned | — | [F-032-T02](#f-032-t02), [F-035-T04](#f-035-t04) | 🤖 | PR #126 plan |
| 🟢 Small | <a id="f-032-t02"></a>F-032-T02 — Owner tags the release carrying json-match | 0 h | 0 h | 0 h agent + 0.25 h owner | Planned | [F-032-T01](#f-032-t01) | — | ⏳ 🧑‍🔧 | PR #126 plan |
| 🟡 Medium | **Total** | 2 h | 0 h (0 of 2 steps recorded) | 2 h agent + 0.25 h owner | 0 of 2 completed | | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-032.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-032-T01: PR #126 plan · F-032-T02: PR #126 plan. [#126](https://github.com/voidbrain/gauntlet-protocol/pull/126) (plan); [#130](https://github.com/voidbrain/gauntlet-protocol/pull/130) (coordinator prefix); [review page](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-shared-assets/gauntlet-protocol.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-27 |

</details>

---
### <a id="f-034"></a>[✨ F-034](#top)

**Guide: a project's own domain pack, in English and Italian**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟢 Small | 0.75 h | — | — | 🤖 | — | — |

💻 **→** Next: F-034-T01 — Write docs/guides/project-packs.md (Planned).

| | |
|---|---|
| **Issue** | Four projects start their first domain pack (grover, fpvbuddy, hobo, openbando), and a fifth, nerv, runs them. There is no guide. The owner uses NERV and all modules in Italian, so project packs must include Italian phrasings alongside English. Owner decision 2026-11-26 in chat: "ok to all" (accepts proposals 1 to 3 of the shared-asset review, coordinator:F-016-T09); same message: "nerv and all modules will need to work with Italian". |
| **Reproduce** | `ls docs/guides` has no project-pack guide. |
| **Check** | `docs/guides/project-packs.md` says how a project pins the package as a devDependency, keeps `evals/gauntlet/<project>-v1.json` with regression and holdout splits and invented data, runs `gauntlet validate` in CI (with `--tools` once F-033 lands), records skips, and how a consumer (NERV) runs the pack from the project's tag; and says that a project pack includes the owner's language (Italian) alongside English: every capability has Italian and English requests, with examples ("accendi la luce", "aggiungi Rocca Calascio al trip di agosto", "carica le batterie 7 e 8 blu") and a note that tool names and arguments stay the same in both. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-034-t01"></a>F-034-T01 — Write docs/guides/project-packs.md | 0.75 h | 0 h | 0.75 h | Planned | PR #126 plan |
| 🟢 Small | **Total** | 0.75 h | 0 h (0 of 1 steps recorded) | 0.75 h | 0 of 1 completed | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-034.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-034-T01: PR #126 plan. [#126](https://github.com/voidbrain/gauntlet-protocol/pull/126) (plan); [#130](https://github.com/voidbrain/gauntlet-protocol/pull/130) (coordinator prefix); [review page](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-shared-assets/gauntlet-protocol.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-27 |

</details>

---
### <a id="b-006"></a>[🐞 B-006](#top)

**The bilingual pack grades free-text replies by exact wording**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | 2.5 h agent + 0.25 h owner | — | — | 🤖 | — | — |

💻 **→** Next: B-006-T01 — Design: how a free-text reply is graded by meaning, Italian and English (Planned).

| | |
|---|---|
| **Issue** | The released `bilingual-it-en` pack (4 cases: summarize and clarify, Italian and English) expects the whole reply as exact JSON under `exact-json-v1`, including the free `reply` text (for example `The meeting moved to Tuesday.`, `Quale file devo aprire?`). Almost any correct phrasing fails, so a pass measures luck with wording, not language control. On 2026-11-27 (night run, MacBook M3 Pro 36 GB) `gemma4:12b` scored 0 of 4, every case `Independent acceptance mismatch` (report `extra-night/gemma4-12b-bilingual-it-en.json`, kept outside Git). Owner approval 2026-11-27 morning ("ok") to open this record. Related: F-032 plans `json-match` (ignored paths, ranges, order-free arrays) for the same class of case; this record decides how `reply` text is graded. |
| **Reproduce** | `gauntlet model-run --pack=bilingual-it-en` on any model that answers correctly in other words (for example `La riunione è stata spostata a martedì.`): the case fails with `Independent acceptance mismatch`. |
| **Check** | A correct paraphrase of each of the four cases, in Italian and English, passes; a wrong-meaning, wrong-language or wrong-`intent` reply fails; each rule is proven by pass and fail fixtures committed failing first; the pack carries a new version, the index is regenerated, and a recorded gemma4:12b run no longer fails on wording alone. |

**Steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="b-006-t01"></a>B-006-T01 — Design: how a free-text reply is graded by meaning, Italian and English | 0.5 h | 0 h | 0.5 h | Planned | — | [B-006-T02](#b-006-t02) | 🤖 | PR #133 plan |
| 🟡 Medium | <a id="b-006-t02"></a>B-006-T02 — Grade the reply by meaning (failing test first) | 1.5 h | 0 h | 1.5 h | Planned | [B-006-T01](#b-006-t01) | [B-006-T03](#b-006-t03) | ⏳ 🤖 | PR #133 plan |
| 🟢 Small | <a id="b-006-t03"></a>B-006-T03 — Re-measure gemma4:12b on the fixed pack and record it | 0.5 h | 0 h | 0.5 h | Planned | [B-006-T02](#b-006-t02) | [B-006-T04](#b-006-t04) | ⏳ 🤖 | PR #133 plan |
| 🟢 Small | <a id="b-006-t04"></a>B-006-T04 — Owner tags the release carrying the fixed bilingual pack | 0 h | 0 h | 0 h agent + 0.25 h owner | Planned | [B-006-T03](#b-006-t03) | — | ⏳ 🧑‍🔧 | PR #133 plan |
| 🟡 Medium | **Total** | 2.5 h | 0 h (0 of 4 steps recorded) | 2.5 h agent + 0.25 h owner | 0 of 4 completed | | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-006.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: B-006-T01: PR #133 plan · B-006-T02: PR #133 plan · B-006-T03: PR #133 plan · B-006-T04: PR #133 plan. Plan: [#133](https://github.com/voidbrain/gauntlet-protocol/pull/133); owner approval 2026-11-27 ("ok") |
| Opened | 2026-11-27 |
| Verification | Pending |
| Reviewed | 2026-11-27 |

</details>

---
### <a id="f-033"></a>[✨ F-033](#top)

**Check a pack against a tool table: gauntlet validate --tools**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | 1.5 h | — | — | 🤖 | — | — |

💻 **→** Next: F-033-T01 — gauntlet validate --tools with fixtures (Planned).

| | |
|---|---|
| **Issue** | Project packs name MCP tools and arguments (grover-v1 grover:F-027, fpvbuddy-v1 fpvbuddy:F-022, hobo-v1 hobo:F-011-T03, nerv-planner-v1 nerv:F-120-T09); when a tool is renamed the case goes stale and still validates. Owner decision 2026-11-26 in chat: "ok to all" (accepts proposals 1 to 3 of the shared-asset review, coordinator:F-016-T09); same message: "nerv and all modules will need to work with Italian". |
| **Reproduce** | Rename a tool in a pack fixture: `gauntlet validate` still passes. |
| **Check** | `gauntlet validate --tools <file>` reads a `tools/list` snapshot (name and input schema) and fails on a case whose expected tool or argument is not in it; fixtures for a renamed tool and a removed argument, with Italian-language cases included; documented. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟡 Medium | <a id="f-033-t01"></a>F-033-T01 — gauntlet validate --tools with fixtures | 1.5 h | 0 h | 1.5 h | Planned | PR #126 plan |
| 🟡 Medium | **Total** | 1.5 h | 0 h (0 of 1 steps recorded) | 1.5 h | 0 of 1 completed | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-033.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-033-T01: PR #126 plan. [#126](https://github.com/voidbrain/gauntlet-protocol/pull/126) (plan); [#130](https://github.com/voidbrain/gauntlet-protocol/pull/130) (coordinator prefix); [review page](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-shared-assets/gauntlet-protocol.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-27 |

</details>

---
### <a id="f-021"></a>[✨ F-021](#top)

**image-generation-v1: runner and grader after a design decision**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 1 h agent + 0.25 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-021-T08 — First real run: prove the judge, measure generator variance (Implemented; verification pending).

| | |
|---|---|
| **Issue** | The index maps 0 cases to audio-video. Image generation needs a new runner and a grader (VLM judge or similarity) whose design is not yet chosen. |
| **Reproduce** | `npm run index:build` reports `audio-video: 0 mapped cases`. |
| **Check** | A recorded design decision, then a runner and grader as decided, and examples/image-generation-v1.json, area audio-video; regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; consumers adopt through their pin. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-021-t08"></a>F-021-T08 — First real run: prove the judge, measure generator variance | 1 h | 0 h | 0 h | Implemented; verification pending | — | [F-021-T05](#f-021-t05), [F-021-T09](#f-021-t09) | 🤖 | PR #114 planned; PR #133 night run recorded |
| 🟢 Small | <a id="f-021-t09"></a>F-021-T09 — Make the three repeats real: ComfyUI served identical cached images | 1 h | 0 h | 1 h | Planned | [F-021-T08](#f-021-t08) | [F-021-T05](#f-021-t05) | ⏳ 🤖 | PR #133 plan |
| 🟢 Small | <a id="f-021-t05"></a>F-021-T05 — Release image-generation-v1 | — | 0 h | 0 h agent + 0.25 h owner | Planned | [F-021-T08](#f-021-t08), [F-021-T09](#f-021-t09) | — | ⏳ 🧑‍🔧 | — |
| 🟢 Small | **Total** | 9.5 h (6 of 9 steps) | 0 h (0 of 9 steps recorded) | 1 h agent + 0.25 h owner | 6 of 9 completed | | | | |

<details><summary>Done steps (6)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-021-t01"></a>F-021-T01 — Draft the image-generation design decision | 1 h | 0 h | Completed | PR #113 |
| — | <a id="f-021-t02"></a>F-021-T02 — Decide the image-generation design | — | 0 h | Completed | PR #114 decision |
| — | <a id="f-021-t03"></a>F-021-T03 — Image-generation runner | 4 h | 0 h | Completed | PR #115 re-estimate; PR #119 runner; int8 runs on MPS |
| — | <a id="f-021-t04"></a>F-021-T04 — Image grader and pack | 2 h | 0 h | Completed | PR #121 grader and pack; judge proven on fixtures |
| — | <a id="f-021-t06"></a>F-021-T06 — Host check: Ollama image generation, then record runtime A or B | 0.5 h | 0 h | Completed | PR #114 planned; PR #115 host check |
| — | <a id="f-021-t07"></a>F-021-T07 — Pull the image generator and the vision judge models | — | 0 h | Completed | PR #114 planned; PR #115 pull commands; PR #117 models pulled; Comfy Desktop |

</details>

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-021.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-021-T01: PR #113 · F-021-T02: PR #114 decision · F-021-T03: PR #115 re-estimate; PR #119 runner; int8 runs on MPS · F-021-T04: PR #121 grader and pack; judge proven on fixtures · F-021-T06: PR #114 planned; PR #115 host check · F-021-T07: PR #114 planned; PR #115 pull commands; PR #117 models pulled; Comfy Desktop · F-021-T08: PR #114 planned; PR #133 night run recorded · F-021-T09: PR #133 plan. [#133](https://github.com/voidbrain/gauntlet-protocol/pull/133) (2026-11-27 night); Owner request 2026-11-24 (approved in the consumer session): fill the roadmap with a Domain packs milestone.; [#85](https://github.com/voidbrain/gauntlet-protocol/pull/85); [#113](https://github.com/voidbrain/gauntlet-protocol/pull/113); owner decision 2026-11-26, F-021-T02 ("Do you accept these as recommended? ok"); owner approval 2026-11-26 of the widened F-021-T06 check ("Qwen Image 2.1 and Ollama check ok"); [#115](https://github.com/voidbrain/gauntlet-protocol/pull/115); [#117](https://github.com/voidbrain/gauntlet-protocol/pull/117); [#119](https://github.com/voidbrain/gauntlet-protocol/pull/119); owner approval 2026-11-26 of F-021-T04 ("ok"); [#121](https://github.com/voidbrain/gauntlet-protocol/pull/121); [evidence archive](archive/evidence-2026.md#f-021) |
| Opened | 2026-11-24 |
| Verification | Unit/integration · 2026-11-27 · F-021-T01 (#113), F-021-T03 (#119 CI 45801135303), F-021-T04 (#121 CI 45804656435) and F-021-T06 (#115) green; F-021-T08 night run recorded (18 of 18 judged passed; repeats were cache hits), F-021-T09 and F-021-T05 release pending |
| Reviewed | 2026-11-27 |

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
### <a id="f-030"></a>[✨ F-030](#top)

**Roadmap status check**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 1 h | — | — | 🤖 | — | — |

💻 **→** Next: F-030-T01 — Roadmap status tool and CI check (Planned).

| | |
|---|---|
| **Issue** | gauntlet-protocol keeps `docs/ROADMAP.md` by hand; nerv generates milestone status from the records (`tools/roadmap-status.mjs`, BACKLOG-RULES "Roadmap"), so a milestone cannot say "done" while its steps are open. Evidence: [NERV practices transfer report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md), inventory 15; class B item B3. Owner decision 2026-11-26 in chat: "NERV practices inventory accept all" (all 22 proposals of the [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); this record is proposal 21). |
| **Reproduce** | Read `docs/ROADMAP.md` of gauntlet-protocol and compare each milestone's status with its records: nothing checks them. |
| **Check** | A roadmap status tool generates milestone status from the records and `--check` in `check:fast` and CI fails when `docs/ROADMAP.md` is stale (F-030-T01). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-030-t01"></a>F-030-T01 — Roadmap status tool and CI check | 1 h | 0 h | 1 h | Planned | PR #125 plan |
| 🟢 Small | **Total** | 1 h | 0 h (0 of 1 steps recorded) | 1 h | 0 of 1 completed | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-030.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-030-T01: PR #125 plan. [#125](https://github.com/voidbrain/gauntlet-protocol/pull/125) (plan); [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-031"></a>[✨ F-031](#top)

**SBOM as a CI artifact**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 0.5 h | — | — | 🤖 | — | — |

💻 **→** Next: F-031-T01 — SBOM step in CI (Planned).

| | |
|---|---|
| **Issue** | Seven of the nine repositories attach a CycloneDX SBOM generated from the lock file to CI; gauntlet-protocol does not. Evidence: [NERV practices transfer report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md), class A item A8; missing practice M6. Owner decision 2026-11-26 in chat: "NERV practices inventory accept all" (all 22 proposals of the [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); this record is proposal 16). |
| **Reproduce** | Read `.github/workflows/ci.yml`: no SBOM step. |
| **Check** | CI generates a CycloneDX SBOM from the lock file and uploads it as an artifact (F-031-T01). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-031-t01"></a>F-031-T01 — SBOM step in CI | 0.5 h | 0 h | 0.5 h | Planned | PR #125 plan |
| 🟢 Small | **Total** | 0.5 h | 0 h (0 of 1 steps recorded) | 0.5 h | 0 of 1 completed | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-031.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-031-T01: PR #125 plan. [#125](https://github.com/voidbrain/gauntlet-protocol/pull/125) (plan); [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="b-007"></a>[🐞 B-007](#top)

**A report with unknown usage is refused as "Inconsistent token totals", and the not-run cascade is undocumented**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟠 Investigate | 🔹 P3 | 🟡 Medium | 2.25 h | — | — | 🤖 | — | — |

💻 **→** Next: B-007-T01 — Investigate: reproduce "Inconsistent token totals" and find the producing path (Planned).

| | |
|---|---|
| **Issue** | On the 2026-11-27 night a follow-up cad-3d report (`cad-3d-rest-1`, four passed model cases, `usage.outputTokens` 2013) was refused by `gauntlet ledger` with `Inconsistent token totals` (src/index.ts:1666: a non-null total with an unknown or errored result, or a total that differs from the sum). The first cad-3d report of that night had one `error` result (a 52 s case with `tokens` 2048, `Adapter failed or violated identity/budget contract`) and nine `not-run` cases with `Prior model execution has unverified consumption`, usage null, `complete` false. The saved `cad-3d-rest-1.json` validates on current main (2013 = 474+321+404+814), so the cause is not yet known. Candidate: on a resumed run the producer sets `known` from `tokens !== null` only (src/index.ts:849) while the validator also treats `status: 'error'` as unknown (:1653), so an errored result with non-null tokens gives a non-null total the validator refuses. Second question: a per-case timeout sets `known = false` (:1250) and every later non-system case becomes `not-run` (:1001); this looks intended (the budget cannot be proved) but is written nowhere. Found by the coordinator in the night run; reported to the owner 2026-11-27. |
| **Reproduce** | `node` import of `validateReport` on the saved report passes today; the refusal is not reproduced. Candidate: a resumed run whose earlier result is `error` with non-null `tokens` yields a report `validateReport` refuses (to be shown by the failing test in B-007-T01). |
| **Check** | The cause is named; a report the engine writes is a report it accepts (or the report is never written with a total), proven by a failing test first; docs/PROTOCOL.md states the not-run cascade after an error or timeout and the record says whether it stays. |

**Steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟢 Small | <a id="b-007-t01"></a>B-007-T01 — Investigate: reproduce "Inconsistent token totals" and find the producing path | 0.75 h | 0 h | 0.75 h | Planned | — | [B-007-T02](#b-007-t02) | PR #133 plan |
| 🟢 Small | <a id="b-007-t03"></a>B-007-T03 — Document the not-run cascade after an error or timeout, and decide whether it stays | 0.5 h | 0 h | 0.5 h | Planned | — | — | PR #133 plan |
| 🟢 Small | <a id="b-007-t02"></a>B-007-T02 — Make producer and validator agree on unknown usage (failing test first) | 1 h | 0 h | 1 h | Planned | [B-007-T01](#b-007-t01) | — | PR #133 plan |
| 🟡 Medium | **Total** | 2.25 h | 0 h (0 of 3 steps recorded) | 2.25 h | 0 of 3 completed | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-007.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: B-007-T01: PR #133 plan · B-007-T02: PR #133 plan · B-007-T03: PR #133 plan. Plan: [#133](https://github.com/voidbrain/gauntlet-protocol/pull/133) |
| Opened | 2026-11-27 |
| Verification | Pending |
| Reviewed | 2026-11-27 |

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
### <a id="f-028"></a>[✨ F-028](#top)

**Threat map with the NERV checker**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | 2.5 h | — | — | 🤖 | — | — |

💻 **→** Next: F-028-T01 — Threat-map checker with the closed-gap rule (Planned).

| | |
|---|---|
| **Issue** | gauntlet-protocol: it runs agents and models in containers, so model output, task input and container boundaries are the exposed surface. NERV keeps a threat map (OWASP Agentic and LLM top 10 rows, each citing a test or a gap record) and a checker (`tools/check-threat-map.mjs`, `docs/security/agentic-threats.md`); no other repository has either. NERV's map still cites closed records as gaps (report N6), so the checker here also fails on a gap that cites a closed record. Evidence: [NERV practices transfer report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md), inventory 10; class B item B1; N6. Owner decision 2026-11-26 in chat: "NERV practices inventory accept all" (all 22 proposals of the [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); this record is proposal 18). |
| **Reproduce** | Search gauntlet-protocol for a threat map or a security page naming prompt injection, tool or key misuse: none. |
| **Check** | A short threat map lists each applicable Agentic and LLM top 10 risk with the test or the gap record that covers it, and a checker in CI fails on a row without either and on a gap that cites a closed record (F-028-T01, F-028-T02). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-028-t01"></a>F-028-T01 — Threat-map checker with the closed-gap rule | 1 h | 0 h | 1 h | Planned | — | [F-028-T02](#f-028-t02) | PR #125 plan |
| 🟡 Medium | <a id="f-028-t02"></a>F-028-T02 — Write the threat map | 1.5 h | 0 h | 1.5 h | Planned | [F-028-T01](#f-028-t01) | — | PR #125 plan |
| 🟡 Medium | **Total** | 2.5 h | 0 h (0 of 2 steps recorded) | 2.5 h | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-028.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-028-T01: PR #125 plan · F-028-T02: PR #125 plan. [#125](https://github.com/voidbrain/gauntlet-protocol/pull/125) (plan); [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-029"></a>[✨ F-029](#top)

**Licence allow-list check for production dependencies**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | 2 h | — | — | 🤖 | — | — |

💻 **→** Next: F-029-T01 — Licence allow-list tool (Planned).

| | |
|---|---|
| **Issue** | gauntlet-protocol (MIT, not private, `prepack`) ships to others. is published under MIT with a `prepack` step, so its dependencies travel with what it ships. None of the nine repositories checks the licences of its production dependencies, so an incompatible one could ship unseen. Evidence: [NERV practices transfer report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md), class B item B4; missing practice M5. Owner decision 2026-11-26 in chat: "NERV practices inventory accept all" (all 22 proposals of the [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); this record is proposal 19). |
| **Reproduce** | Read the CI workflow and `package.json` scripts: no licence check. |
| **Check** | A tool reads the production dependency tree from the lock file and fails on a licence outside an allow-list or an unknown licence, with the allow-list in the repository (F-029-T01); CI runs it on every PR (F-029-T02). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟡 Medium | <a id="f-029-t01"></a>F-029-T01 — Licence allow-list tool | 1.5 h | 0 h | 1.5 h | Planned | — | [F-029-T02](#f-029-t02) | PR #125 plan |
| 🟢 Small | <a id="f-029-t02"></a>F-029-T02 — Run the licence check in CI | 0.5 h | 0 h | 0.5 h | Planned | [F-029-T01](#f-029-t01) | — | PR #125 plan |
| 🟡 Medium | **Total** | 2 h | 0 h (0 of 2 steps recorded) | 2 h | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-029.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-029-T01: PR #125 plan · F-029-T02: PR #125 plan. [#125](https://github.com/voidbrain/gauntlet-protocol/pull/125) (plan); [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-035"></a>[✨ F-035](#top)

**Image-understanding pack (vision-v1)**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🔴 Large | 5 h agent + 0.25 h owner | [F-032-T01](#f-032-t01) | — | 🤖 | — | — |

💻 **→** Next: F-035-T01 — Design: image-case format, fixtures and graders (Planned).

| | |
|---|---|
| **Issue** | Gauntlet has no pack that tests a model's understanding of an image: only `image-generation-v1`, which uses gemma4:12b as a judge. nerv:F-142 (vision in chat, parked until the owner picks a use) needs one to qualify a local vision model, and other consumers may too. Per coordinator:F-016's shared-asset rule, gauntlet owns general packs. The owner uses NERV in Italian, so every question has an Italian and an English form. Owner decision 2026-11-26 in chat: "open the Gauntlet pack record". |
| **Reproduce** | `ls examples` has no vision pack; `gauntlet validate` has no case with an image. |
| **Check** | `examples/vision-v1.json` gives an image and a question per case, in Italian and English, with regression and holdout splits; answers are graded deterministically (exact or json-match, OCR text within a stated tolerance, yes/no checklists), each rule proven by pass and fail fixtures; fixture images are drawn by code or openly licensed with the licence recorded, never model-generated (no Qwen images); a local model that accepts images (gemma4:12b on Ollama) has a recorded run; the pack has an index entry and a tagged release the owner cuts. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="f-035-t01"></a>F-035-T01 — Design: image-case format, fixtures and graders | 0.75 h | 0 h | 0.75 h | Planned | — | [F-035-T02](#f-035-t02), [F-035-T03](#f-035-t03) | 🤖 |
| 🟢 Small | <a id="f-035-t02"></a>F-035-T02 — OCR-with-tolerance and checklist graders (failing test first) | 1 h | 0 h | 1 h | Planned | [F-035-T01](#f-035-t01) | [F-035-T04](#f-035-t04) | ⏳ 🤖 |
| 🟢 Small | <a id="f-035-t03"></a>F-035-T03 — Fixture images drawn by code | 1 h | 0 h | 1 h | Planned | [F-035-T01](#f-035-t01) | [F-035-T04](#f-035-t04) | ⏳ 🤖 |
| 🟢 Small | <a id="f-035-t04"></a>F-035-T04 — Cases: image plus question, Italian and English | 1 h | 0 h | 1 h | Planned | [F-035-T02](#f-035-t02), [F-035-T03](#f-035-t03), [F-032-T01](#f-032-t01) | [F-035-T05](#f-035-t05) | ⏳ 🤖 |
| 🟢 Small | <a id="f-035-t05"></a>F-035-T05 — Pack file, runner and index entry | 0.75 h | 0 h | 0.75 h | Planned | [F-035-T04](#f-035-t04) | [F-035-T06](#f-035-t06) | ⏳ 🤖 |
| 🟢 Small | <a id="f-035-t06"></a>F-035-T06 — Run the pack against gemma4:12b | 0.5 h | 0 h | 0.5 h | Planned | [F-035-T05](#f-035-t05) | [F-035-T07](#f-035-t07) | ⏳ 🤖 |
| 🟢 Small | <a id="f-035-t07"></a>F-035-T07 — Owner tags the release carrying vision-v1 | 0 h | 0 h | 0 h agent + 0.25 h owner | Planned | [F-035-T06](#f-035-t06) | — | ⏳ 🧑‍🔧 |
| 🔴 Large | **Total** | 5 h | 0 h (0 of 7 steps recorded) | 5 h agent + 0.25 h owner | 0 of 7 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-035.md)

| Field | Value |
|---|---|
| PR / evidence | Plan: pending; nerv:F-142; [#128](https://github.com/voidbrain/gauntlet-protocol/pull/128) |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-036"></a>[✨ F-036](#top)

**Night-run planner and runner**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🔴 Large | 8 h agent + 0.5 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-036-T01 — Design: night-plan format, inputs and the 07:00 guard (Planned).

| | |
|---|---|
| **Issue** | Overnight runs on the owner's Mac (M3 Pro, 36 GB; Ollama gemma4:26b, gemma4:12b, qwen3-coder:30b, devstral-small-2:24b, qwen2.5-coder:14b; ComfyUI image runs) are queued by hand-written shell scripts: a campaign, then a planner pack, then an image campaign, then extra packs, each waiting for the previous one and skipping if it would not end before 07:00. Found on the first such night: profiles missing from the checkout, no duration estimates, hand-chained waits. Gauntlet has the ledger (what is stale or never run) and per-case `durationMs`, but nothing turns them into a queue. Owner request 2026-11-26 in the consumer session: "maybe useful to suggest, planning for nights run". Consumer: 𖣂 nerv runs its campaigns through `tools/gauntlet.mjs` and would call these commands from its own scheduler; coordinator:F-020 (process freeze) is a reference only, and this is a feature record with no new rule, procedure or check. |
| **Reproduce** | `gauntlet --help` has no command that proposes a run order for a time window; a night is queued with ad hoc shell. |
| **Check** | `gauntlet night-plan` proposes, from the ledger, saved timing history and `limits-night.json`, an ordered sequential queue that ends before the window end (default 01:00-07:00) with owner priorities (for example Italian coverage) applied, names a missing profile, pack or limits file before showing it, and runs nothing; a runner executes only an approved plan, one stage at a time, with an end-time guard and model unloading between stages, writes one report per stage and never touches the ledger; a morning summary lists what ran, what was skipped and the exact `gauntlet ledger` commands to merge reviewed reports; a test across planner, runner and summary on fake runtimes and a fake clock passes; the owner has approved and reviewed one real night. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-036-t01"></a>F-036-T01 — Design: night-plan format, inputs and the 07:00 guard | 0.75 h | 0 h | 0.75 h | Planned | — | [F-036-T02](#f-036-t02), [F-036-T03](#f-036-t03) | 🤖 | PR #133 night lessons |
| 🟢 Small | <a id="f-036-t02"></a>F-036-T02 — Duration history: per pack and model estimates from saved reports (failing test first) | 1 h | 0 h | 1 h | Planned | [F-036-T01](#f-036-t01) | [F-036-T04](#f-036-t04) | ⏳ 🤖 | — |
| 🟢 Small | <a id="f-036-t03"></a>F-036-T03 — Candidates: stale and never-run pack x model pairs with owner priorities (failing test first) | 1 h | 0 h | 1 h | Planned | [F-036-T01](#f-036-t01) | [F-036-T04](#f-036-t04) | ⏳ 🤖 | — |
| 🟡 Medium | <a id="f-036-t04"></a>F-036-T04 — Planner: fit an ordered queue to a time window (failing test first) | 1.25 h | 0 h | 1.25 h | Planned | [F-036-T02](#f-036-t02), [F-036-T03](#f-036-t03) | [F-036-T05](#f-036-t05) | ⏳ 🤖 | — |
| 🟢 Small | <a id="f-036-t05"></a>F-036-T05 — night-plan command: print the proposed queue for the owner to approve | 0.75 h | 0 h | 0.75 h | Planned | [F-036-T04](#f-036-t04) | [F-036-T06](#f-036-t06) | ⏳ 🤖 | — |
| 🟡 Medium | <a id="f-036-t06"></a>F-036-T06 — Night runner: execute an approved plan sequentially with the end-time guard (failing test first) | 1.5 h | 0 h | 1.5 h | Planned | [F-036-T05](#f-036-t05) | [F-036-T07](#f-036-t07) | ⏳ 🤖 | PR #133 night lessons |
| 🟢 Small | <a id="f-036-t07"></a>F-036-T07 — Morning summary: what ran, what was skipped, what to review | 0.75 h | 0 h | 0.75 h | Planned | [F-036-T06](#f-036-t06) | [F-036-T08](#f-036-t08) | ⏳ 🤖 | — |
| 🟢 Small | <a id="f-036-t08"></a>F-036-T08 — Join test and guide: plan, run and summarise on fake runtimes | 1 h | 0 h | 1 h | Planned | [F-036-T07](#f-036-t07) | [F-036-T09](#f-036-t09) | ⏳ 🤖 | — |
| 🟢 Small | <a id="f-036-t09"></a>F-036-T09 — Owner approves a first real night plan and reviews the morning report | 0 h | 0 h | 0 h agent + 0.5 h owner | Planned | [F-036-T08](#f-036-t08) | — | ⏳ 🧑‍🔧 | — |
| 🔴 Large | **Total** | 8 h | 0 h (0 of 9 steps recorded) | 8 h agent + 0.5 h owner | 0 of 9 completed | | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-036.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-036-T01: PR #133 night lessons · F-036-T06: PR #133 night lessons. [#133](https://github.com/voidbrain/gauntlet-protocol/pull/133) (2026-11-27 night); Plan: [#131](https://github.com/voidbrain/gauntlet-protocol/pull/131); consumer nerv |
| Opened | 2026-11-26 |
| Verification | Pending |
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
