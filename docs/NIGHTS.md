# Planned nights

Owner record: [F-036](work/records/F-036.md) (night-run planner and runner).


Approved by the owner on 2026-11-27 ("ok"), recorded here so the plan shows on the coordinator dashboard. Until F-036's planner exists (F-036-T05, F-036-T06), Claude runs these queues by hand under these rules: start 01:00; stages one at a time; no stage starts after about 06:00; reports only (no code or record edits overnight); the ledger is merged by a reviewed PR the next morning. Claude starts `caffeinate` itself. The owner keeps the lid open, the charger in, Docker and VS Code running. Each morning's review adjusts the next night: the table is a plan, not a promise. Refs carry the project prefix (nerv: or gauntlet:).

| Night | What | Why | Prerequisites | Serves |
|---|---|---|---|---|
| 2026-11-28 (tonight, queued) | 𖣂 nerv:F-120-T17 12-case rerun on gemma4:12b; cad-3d on gemma4:26b; italian-quality and code-review retried; image repeats if gauntlet:F-021-T09 landed; then 𖣂 nerv:F-120-T14 capture run | The 2026-11-27 night left the 12b cases unmeasured and two packs timed out on the cold first case; images repeat only if the harness for them exists | Models pulled; for the image repeats gauntlet:F-021-T09 landed (otherwise skipped) | 𖣂 nerv:F-120-T17, 𖣂 nerv:F-120-T14, gauntlet:F-021-T09 |
| 2026-11-29 (+1) | 1. `gauntlet all` on gemma4:12b; 2. Grover dose skill evaluation on 26b and 12b (owner yes 2026-11-27) | Full comparison with the 2026-11-27 26b night, to choose NERV's main model on evidence; the dose skill measured on both models | Previous morning's review done | 𖣂 nerv:F-126-T07, 𖣂 nerv:F-153-T03 |
| Later (no date) | 26b with a 4,096 reply cap and without thinking | Measures the cap and thinking effect on 26b | Owner picks the night after the 12b comparison | 𖣂 nerv:F-126-T06 |
| 2026-11-30 (+2) | qwen3-coder:30b on embedded and cad-3d; nerv:B-174 behaviour rerun (name-the-pr x10, ambiguous-request x10) | qwen3-coder:30b was the best coder on 2026-11-27 (coding 4/4) and is untested on the other packs; B-174 needs fresh behaviour evidence | B-174 uses Claude sessions, not local models, so it can run alongside no model load | nerv:F-120-T17, nerv:B-174 |
| 2026-12-01 (+3) | nerv:F-144-T05 cold vs warm first-reply timings on the live NERV-01 service; images again if needed | Cold-first-case timeouts need real timings from the live service | Live service up (`~/.nerv-app`); owner not using it that night | nerv:F-144-T05 |

Later, when built or approved (no date):

- gauntlet:B-006-T03 bilingual re-measure (owner OK needed).
- gauntlet:F-035 vision pack, once built.
- Project packs for grover, fpvbuddy and hobo, with Italian cases, once built.
- nerv:F-120-T08 expensive system cases (owner OK needed).

