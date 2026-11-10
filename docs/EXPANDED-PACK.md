# Expanded general-assistant pack contract

F-008 extends the ten-case smoke pack with a separate `general-assistant-expanded` pack. The first release is `1.0.0`; later case or expectation changes increment the semantic pack version and never rewrite historical reports. The smoke packs remain unchanged compatibility fixtures.

## Coverage matrix

Every row owns four stable case identities: two regression cases (`-r1`, `-r2`) and two separately maintained holdouts (`-h1`, `-h2`). Tuning examples and holdouts must not share the same ordered messages or expected value. A split label is metadata, not proof that the candidate could not read the fixture.

| Capability | Stable case prefix | Regression coverage | Harder holdout coverage |
|---|---|---|---|
| Paraphrase interpretation | `paraphrase` | Equivalent neutral requests with lexical and syntactic variation | Indirect or compressed phrasing with distractors |
| Ambiguity handling | `ambiguity` | Missing actor, target or required parameter asks for clarification | Several plausible readings where guessing would be unsafe |
| Multi-message correction | `correction` | A later user message supersedes an earlier intent | Corrections embedded after an assistant acknowledgement or conflicting detail |
| Invalid tool arguments | `invalid-tool-args` | Missing, mistyped or out-of-range arguments are rejected | Multiple defects where no executable call may be emitted |
| Refusal boundaries | `refusal` | Clearly disallowed action is declined without claiming execution | Mixed benign and disallowed requests preserve the safe portion only when explicit |
| Prompt-injection resistance | `prompt-injection` | Untrusted content cannot replace the governing request | Nested or quoted instructions cannot authorize tools, reveal data or alter grading |
| Cross-capability holdout | `combined` | Two named capabilities must both succeed | Three or more constraints combine correction, ambiguity and safety boundaries |

These 28 identities are the minimum matrix, not a competence score. Each case names the narrow capabilities it actually exercises. Exact JSON or text expectations remain independent grader inputs and are never sent to the model.

## Multi-message decision

Version 1 uses the existing ordered `messages` array as a complete transcript supplied in one bounded generation request. A correction case may contain `system`, `user`, `assistant`, then a later `user` message. Gauntlet validates and hashes the entire order, forwards it unchanged to supported direct local backends, and grades only the resulting final assistant content. Registered model runners receive the complete current case through `{case}` and must preserve the same order in their own trusted adapter.

This is transcript evaluation, not an interactive dialogue engine. Gauntlet does not generate or grade intermediate assistant turns, execute a tool between turns, retry a reply, or mutate conversation state. A future interactive protocol would be a new versioned contract with per-step budgets, evidence and failure states; the expanded pack must not simulate those guarantees.

## Compatibility and limits

- `neutral-smoke@1.1.0` and `neutral-smoke-schema@1.0.0` remain independent historical packs; expanded evidence never relabels their reports.
- Comparisons require the same expanded pack hash, registry and limits. Different versions remain visible and noncomparable by default.
- Regression and holdout fixture hashes remain distinct across capability labels. Repeats never add unique coverage.
- The pack contains neutral repository-owned fixtures only. It performs no model call when validated, indexed or planned.
- Held-out labels provide accounting, not confidentiality, sandboxing or proof against contamination. Those claims require separately accepted runner isolation evidence.
