# Gauntlet Protocol roadmap

Where the protocol is going next. Each milestone lists its records; steps and estimates live in the records. Planned 2026-11-13 and 2026-11-24 at the owner's request.

| Milestone | Scope | Records | Acceptance |
|---|---|---|---|
| 4 — Domain packs | Packs for the capability areas the index maps at 0 cases, in this order: coding with a sandboxed reference runner; embedded (Arduino, ESP32, Raspberry Pi); logic and math; Italian quality; CAD and 3D printing; code review; then image generation after a design decision, and a pack-or-skip decision for estimation, research, scheduling-time and backlog-management | F-015, F-016, F-017, F-018, F-019, F-020, F-021, F-022, F-023, F-024, F-025 | Each pack has regression and holdout splits, a deterministic grader proven by fixtures, an area from the index taxonomy, an index entry and a tagged release; each remaining area has a pack record or a recorded skip |

Consumers adopt each release in their own backlog: a new or changed case shows as pending in `gauntlet pending` until they run it.

## Recorded skips

Owner decision 2026-11-26 (F-022-T02, [remaining areas](decisions/remaining-areas.md)):

- **backlog-management**: skipped in this repository. Ordering by dependencies and keeping a status consistent with its evidence are graded by logic-planning and structured-output; the rest is the harness rules and each project's records, which belong to their owners and would duplicate logic-planning or freeze one harness version's rules in a general pack.
- **Live web research**: skipped under research. It needs a network and pages change, so it is not deterministic; research-v1 (F-025) covers supplied sources only.
