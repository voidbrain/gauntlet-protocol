# Image generation: owner decision

Proposal for the owner, drafted 2026-11-26 (F-021-T01). The `image-generation-v1` pack (area `audio-video`) needs a runner that drives a local image generator and a grader that turns an image into a pass or fail. This page sets out the generator runtime, the grader, determinism and host cost, with a recommendation. The owner decided in F-021-T02 on 2026-11-26; see Decision below. Sizes and timings below are estimates for the Apple M3 Pro 36 GiB host in [Mac profiles](../MAC-PROFILES.md), not measurements.

## Decision

Recorded 2026-11-26 (F-021-T02). The owner accepted the recommendations as written: asked "Do you accept these as recommended?", the owner answered "ok".

- **Runtime: A**, Ollama image generation, if a host check confirms it (F-021-T06, read-only, no download); otherwise **B**, ComfyUI on loopback, which adds about 1 to 2 h to F-021-T03 and F-021-T04.
- **Grader: S+V**: structural checks as a gate, then a checklist judged by a pinned local vision model, proven on committed pass and fail fixtures.
- Follow-up: F-021-T06 host check and A/B record, F-021-T07 owner pulls the models by digest, F-021-T03 runner, F-021-T04 grader and pack, F-021-T08 first real run, F-021-T05 release.

## Pull the models

Written by F-021-T06 once the runtime is chosen: the exact pull commands, the generator and judge models and their digests.

What any choice must keep, as for the other packs: invented neutral prompts; regression and holdout splits; a grader proven by committed fixtures (images that must pass and images that must fail); no real model and no download in CI (a fixture generator and a fixture judge stand in); a loopback-only runtime with no credentials; real runs only on an explicit request, marked costly.

## Question 1: generator runtime

| Option | What it is | Gives | Costs |
|---|---|---|---|
| **A. Ollama image generation** (recommended, if the host's Ollama offers it) | The existing loopback Ollama endpoint with an image model pulled by digest | One runtime for every pack; the runner reuses the loopback, no-redirect, no-proxy client the coding runner already has; model pinned by digest | The feature is recent and macOS-first, so the model list and API may move; to verify on the host before choosing (`ollama --version` and a test pull) |
| **B. ComfyUI on loopback** | A pinned ComfyUI install serving its HTTP API, driven with one committed workflow JSON (model hash, sampler, steps, seed, size) | Any open model, every generation setting explicit and pinned in the workflow | A Python install and custom-node surface to keep pinned; a second runtime beside Ollama; a larger attack surface on the host |
| **C. diffusers script** | A pinned Python environment running one model through Hugging Face diffusers, called by the runner as a trusted command | Smallest moving part; CPU mode is bit-reproducible | CPU is slow (minutes per image); MPS mode is faster but not bit-reproducible; weights and Python dependencies to pin by hand |
| **D. Hosted API** | A provider's image endpoint | No local cost | Rejected: not local, needs credentials, results change without notice, not reproducible |

Model choice is separate from runtime: a distilled few-step model (about 6 to 12 GB of weights, a few seconds to half a minute per 1024 px image on this host) fits beside other work; a large model above 20 GB does not fit beside a judge and is out for this pack.

## Question 2: grader

| Option | How it grades | Deterministic | Measures | Costs |
|---|---|---|---|---|
| **S. Structural checks** | Decode the image and check size, format, not blank, and simple pixel facts set by the prompt (dominant colour in a region, a background colour, aspect) | Yes, for a given image | Only simple, mechanical prompts | Small: an image decoder, no model |
| **C. Text-image similarity** | A pinned embedding model (CLIP family) scores image against prompt; pass above a threshold | Yes on CPU for a fixed model | Loose topical match; weak on counts, positions and text | A second model (about 1 GB); the threshold is arbitrary and needs calibration per model |
| **R. Reference-image similarity** | Perceptual distance (SSIM or LPIPS) to a reference image | Yes | Closeness to one picture | Rejected: a valid different picture of the same prompt fails |
| **V. VLM checklist judge** (recommended, with S) | A pinned local vision model answers fixed yes/no or count questions per case ("Is there exactly one red cube?", "Does the sign read OPEN?") as JSON at temperature 0; the grader compares the answers with expectations only it holds | Yes for a fixed judge model, image and seed; recorded with the judge's digest | Counts, colours, positions, rendered text: the things prompts ask for | A vision model (about 8 GB) loaded after the generator, not beside it; the judge can be wrong, so it is itself proven on the fixture images before it grades |

An OCR check (pinned Tesseract) is a cheaper alternative to the judge for the text-rendering cases only.

## Determinism

The generator is not reliably reproducible: a fixed seed repeats on the same runtime, model and backend, but GPU (MPS) kernels and runtime upgrades change pixels. So determinism is required of the grader, not the generator: the runner records the generator's model digest, seed, size and steps and the image's SHA-256 with each result; the grader's verdict is a pure function of that image and the pinned judge. Variance of the generator is measured with repeats (three, as the night profile does), not assumed away.

## Host cost

Per case, sequential: load generator, generate, unload; load judge, judge, unload. Peak memory is the larger of the two models, about 8 to 12 GB, never both. A six-case run is estimated at a few minutes plus model loads. Weights are downloads the owner starts explicitly. Generated images stay outside the repository; only small invented fixture images (a few kilobytes each) are committed.

## Recommendation

Runtime **A** (Ollama image generation) if the host check confirms it, else **B** (ComfyUI); grader **S + V**: structural checks as a gate, then a checklist judged by a pinned local vision model, both proven by committed pass and fail fixtures. Six to eight cases split regression and holdout, with checklist questions a correct image answers unambiguously. This fits F-021-T03 (runner, 3 h) and F-021-T04 (grader and pack, 2 h) as planned; option B or adding C would add about 1 to 2 h.

## To answer

Reply `Image runtime: A` (or B, C) and `Image grader: S+V` (or S, S+C, S+OCR), and name the generator and judge models if you have a preference. The agent records the answer and its date in F-021.
