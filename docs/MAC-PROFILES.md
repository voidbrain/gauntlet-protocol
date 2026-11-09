# Mac comparison profiles

Starting proposals for an Apple M3 Pro with 36 GiB unified RAM. Memory is shared with the desktop, browser, calls, VMs and context caches; model weight size is not total runtime memory. These profiles have not been benchmarked or qualified.

| Profile | Weight target | Suggested use | Initial context / parallel requests |
|---|---|---|---|
| Gemma 4 12B | Q4_K_M, approximately 8 GB | Existing baseline, structured decisions and general tasks | 8K / 1 |
| Qwen2.5-Coder 14B | Q4_K_M, approximately 9 GB | Existing bounded coding comparison | 8K / 1 |
| Devstral Small 2 24B | Q4_K_M, approximately 15 GB | Larger coding-agent candidate with other apps reduced | 8K / 1 |
| Qwen3-Coder 30B | Q4_K_M, approximately 19 GB | Overnight coding candidate; total weights still matter despite sparse active parameters | 16K / 1 |

Profiles live in `examples/profiles/`. Model tags/availability and approximate sizes are proposals based on the evaluated source inventory, not downloadable guarantees or accepted performance results. `gemma4:e2b-it-q4_K_M` is not automatically a dramatically smaller memory option: its installed package was about 7.2 GB in the source inventory. Downloads remain separate explicit actions.

Start with runtime sampling defaults and record their runtime version. Then compare temperature 0.2 versus 0.6 for a focused subset; Gemma thinking on/off is a separate configuration. Preserve top-p/top-k defaults initially. Seed 42 supports repeatable requests but does not guarantee deterministic runtime behavior. Output starts at 2K; use 4K only for tasks needing it and increase the suite token ceiling deliberately.

Daytime: 8K context, one resident model, one request, short per-case budgets. Overnight: close unnecessary apps/VMs, serial larger candidates, longer per-case budgets and three repeats. Increase to 16K then 32K only after measuring memory pressure and task benefit. `limits-night.json` increases time/repetition budgets, not physical RAM or permission. Parallel execution is deferred until an adapter measures combined memory pressure and comparable quality; it is not enabled by setting a profile field alone.

Tune one dimension at a time: weights/quantization, context, output, sampling, thinking, seed/repeats, cache precision, concurrency and scaffold/tool set. Log hardware load and runtime/cache defaults separately; no global Ollama variables are changed. Evaluate task success, critical failures, resource pressure and review/repair cost. Avoid a full parameter Cartesian product.

Use the shared [machine/load-scenario contract](ENVIRONMENTS.md) to distinguish representative heavy, moderate and minimal competing load independently from these model profiles. A dedicated host can use one baseline. Consumer time/location and role mappings do not belong in shared definitions; day/night budgets alone do not establish load.
