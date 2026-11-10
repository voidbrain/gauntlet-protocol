<!-- Written by tools/impact-map.mjs from the "impact" rows of .harness.json: change the rows, then run it. -->

# Impact map

What must follow a change, and what must run again after it (docs/agents/change-impact.md). `npm run check:freshness` lists, on every PR, the rows a branch sets off and the order to run them.

**More detail:** [Development impact map](impact-map.md) (Project-owned derived outputs and verification obligations)

| Id | When these change | Made of (content) | This must follow | Command | Runs again after | Checked by |
|---|---|---|---|---|---|---|
| protocol | `src/**`, `bin/**`, `test/**`, `examples/**`, `package*.json`, `tsconfig*.json` |  | Verify protocol and CLI joins; reconcile protocol guide, examples and README. | `npm run typecheck && npm test && npm run build` |  | Deterministic fake-provider and subprocess fixtures only; no model campaign. |
| capability-index | `examples/**`, `src/catalog.ts`, `docs/test-index.md` |  | Regenerate executable-pack capability index and verify drift without model execution. | `npm run index:build && npm run check:index` |  | Exact generated-index contract in deterministic tests; no capability qualification inferred. |
| work-items | `docs/work/**`, `docs/agents/model-profiles.json`, `tools/work-items.mjs` |  | Regenerate the source-owned backlog and validate upfront feature steps, effort and status. | `node tools/work-items.mjs build` |  | npm run check:work and check:backlog in CI |

## Content dependencies

What each output is made of, besides code: change one of these and the output is out of date.

| Output | Made of | Redo with |
|---|---|---|
| (none listed) | | |

## Value couplings

A value that lives in more than one place: change it in one, change it in all. Best kept by one shared source, else by a test.

| Value | Where | Kept equal by |
|---|---|---|
| (none listed) | | |

## Outside the repository

What can change an output with no commit here, and how we would notice.

| What | Affects | Noticed by |
|---|---|---|
| (none listed) | | |
