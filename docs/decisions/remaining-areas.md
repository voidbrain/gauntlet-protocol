# Remaining areas: pack or skip

Proposal for the owner, drafted 2026-11-26 (F-022-T01). Four index areas have 0 mapped cases: estimation, research, scheduling-time and backlog-management. For each, this page gives a deterministic pack sketch or a skip reason, says what is general (this repository: runners, graders, general packs) and what belongs to a consumer's own domain cases (`evals/gauntlet/<project>-v1.json` in that project), and recommends. The owner decides in F-022-T02; nothing here is adopted yet.

Common ground for every pack below: invented neutral inputs given in the prompt, a fixed reference date where time matters, regression and holdout splits, the existing exact-JSON grader (no new grader, no network, no new runner), an area already in the index taxonomy, and about 1 h agent per pack plus its share of a release, as for logic-math. None needs a new grader, so a consolidated packs and graders proposal adds nothing here beyond these packs.

## Summary

| Area | Recommendation | General (this repository) | Consumer domain cases |
|---|---|---|---|
| scheduling-time | **Pack** `scheduling-time-v1` | Date and time arithmetic on given facts | Trip timings and connections; reminder phrases turned into timestamps |
| estimation | **Pack** `estimation-v1` | Arithmetic over given evidence; abstaining when evidence is missing | A project's own calibration data and estimate rules |
| research | **Pack** `research-v1`, closed corpus only | Answering from supplied sources with source ids; "not in sources" | Domain documents, such as long tender texts |
| backlog-management | **Skip** in this repository | None beyond logic-planning and structured-output | The harness backlog rules and each project's records |

## Scheduling-time

**Sketch.** Each prompt fixes a reference instant and time zone ("Today is Tuesday 2026-03-24, 18:00 Europe/Rome") and asks for JSON. Cases: the weekday of a date; a duration across midnight; "next Thursday" and "in 10 days" from the reference; the overlap of two invented slots; a meeting time converted between two zones; a span across the Europe/Rome summer-time change. Answers are canonical (ISO 8601 date or instant, minutes as an integer), so exact JSON grades them. Holdout cases change dates and zones, not the kind of question.

**Ownership.** The pack is general: any assistant that sets reminders or plans trips needs it. Domain cases stay with consumers: timetable connections, layovers and trip day plans belong to the trip-planning project's own cases; free-text reminder phrases parsed into a due instant belong to the assistant project that schedules reminders. Both reuse the same grader and pin this pack for the general skill.

**Recommendation: pack.** It is the cheapest of the four to grade deterministically and has two known consumers.

## Estimation

**Sketch.** Estimation judgement has no single right answer, so the pack tests the deterministic part: working from evidence given in the prompt. Cases: total effort of a task list with a parallel and a sequential part (critical path); applying a stated calibration ratio (estimates ran 1.4 times over) to a new estimate; turning three-point estimates into the stated formula's expected value; choosing the right unit (agent hours versus owner hours) from labelled rows; and returning `{"answer": null, "reason": "missing"}` when a needed figure is absent instead of inventing one. All answers are numbers or null, graded by exact JSON with values chosen to avoid rounding ambiguity.

**Ownership.** The arithmetic and the abstention are general. Calibration data and a project's estimate rules (what counts as an hour, which steps carry owner time) are that project's domain cases.

**Recommendation: pack**, small (four regression, two holdout). Overlap with math is real; what it adds is reading labelled evidence and refusing to estimate without it. If the owner prefers fewer packs, this is the one to fold into logic-math instead (a capability `estimation` on new logic-math cases, counted under `estimation`).

## Research

**Sketch.** Live web research is not deterministic (pages change, needs network), so it is out. The pack is closed-corpus: the prompt supplies three to five short invented documents with ids, and asks a question whose answer needs two of them. The JSON answer carries the value and the ids it relies on; the grader checks both exactly. Cases include a conflict between two sources resolved by a stated rule (newest date wins), and a question the sources do not answer, expecting `{"answer": null, "sources": []}`.

**Ownership.** Grounding and citing supplied sources is general. Domain corpora (long tender documents in Italian, product manuals) are the consumer's own cases, which may lean on long-context and italian-quality as well.

**Recommendation: pack**, closed corpus only, with the skip of live web research recorded in the roadmap alongside it. Alternative: skip the whole area as covered by long-context and documents-data; this loses the source-citation check, which those packs do not grade.

## Backlog-management

**Skip reason.** The general skills behind it, ordering by dependencies and priority and keeping a status consistent with its evidence, are already graded by logic-planning and structured-output. What is specific to backlog management is a set of rules (statuses, human-action cues, closure evidence) that lives in the project harness and each project's records, so cases written here would either duplicate logic-planning or encode one harness version's rules into a general pack. Those cases belong with whoever owns the rules: the harness template's own checks, or a consumer that uses a model to edit its backlog.

**Recommendation: skip**, recorded in the roadmap with this reason. Alternative: a three-case pack (topological order of invented items, the blocked item, the next ready item); cheap, but it mostly re-measures logic-planning.

## To answer

Reply per area, for example `scheduling-time: pack`, `estimation: pack` (or `fold into logic-math`), `research: pack` (or `skip`), `backlog-management: skip` (or `pack`). F-022-T03 then opens one planned record per chosen pack and records each skip with its reason in the roadmap.
