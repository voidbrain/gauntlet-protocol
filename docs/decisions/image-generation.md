# Image generation: owner decision

Proposal for the owner, drafted 2026-11-26 (F-021-T01). The `image-generation-v1` pack (area `audio-video`) needs a runner that drives a local image generator and a grader that turns an image into a pass or fail. This page sets out the generator runtime, the grader, determinism and host cost, with a recommendation. The owner decided in F-021-T02 on 2026-11-26; see Decision below. Sizes and timings below are estimates for the Apple M3 Pro 36 GiB host in [Mac profiles](../MAC-PROFILES.md), not measurements.

## Decision

Recorded 2026-11-26 (F-021-T02). The owner accepted the recommendations as written: asked "Do you accept these as recommended?", the owner answered "ok".

- **Runtime: A**, Ollama image generation, if a host check confirms it (F-021-T06, read-only, no download); otherwise **B**, ComfyUI on loopback, which adds about 1 to 2 h to F-021-T03 and F-021-T04. **F-021-T06 found no Ollama image generation (removed in Ollama 0.32.6): runtime B**, generator Qwen Image 2.1 Turbo, judge `gemma4:12b`; see Host check.
- **Grader: S+V**: structural checks as a gate, then a checklist judged by a pinned local vision model, proven on committed pass and fail fixtures.
- Follow-up: F-021-T06 host check and A/B record, F-021-T07 owner pulls the models by digest, F-021-T03 runner, F-021-T04 grader and pack, F-021-T08 first real run, F-021-T05 release.

## Host check (F-021-T06)

Checked 2026-11-26 on the Apple M3 Pro 36 GiB host, read-only: no model pulled, nothing installed. The owner widened the check the same day ("Qwen Image 2.1 and Ollama check ok") to Qwen Image 2.1 as generator.

**Result: runtime B (ComfyUI on loopback).** Ollama offers no image generation on this host or in any current release, so the rule above ("A if a host check confirms it, otherwise B") gives B.

| Checked | Found | Source |
|---|---|---|
| `ollama --version` | 0.40.16 (latest release 0.40.18, 2026-11-24) | host; [Ollama releases](https://github.com/ollama/ollama/releases) |
| Ollama image generation | Removed: "Experimental image generation has been temporarily removed. Continue using 0.32.5 for image generation support" (v0.32.6, 2026-08-04); no release since brings it back. On the host, `ollama run --help` has no image flags and `POST /v1/images/generations` on loopback answers 404; the docs list no image-generation capability; the library's image category shows 0 models | [v0.32.6 notes](https://github.com/ollama/ollama/releases/tag/v0.32.6); host; [docs/capabilities](https://github.com/ollama/ollama/tree/main/docs/capabilities) |
| Pinning Ollama 0.32.5 instead | Rejected: an old runtime beside the one every other pack uses, its image models (`x/z-image-turbo`, `x/flux2-klein`) only, and no Qwen Image | release notes |
| `ollama list` (vision-capable, via `ollama show`) | `gemma4:12b` (8.0 GB, Q4_K_M, ID `6114515d63c1`), `gemma4:26b` (16 GB, nvfp4), `gemma4:e2b-it-q4_K_M` (7.2 GB); text-only coders `qwen3-coder:30b` (18 GB), `devstral-small-2:24b` (15 GB), `qwen2.5-coder:14b` (9.0 GB) | host |
| Qwen Image 2.1: model card | Official `Qwen/Qwen-Image-2.1` (released 2026-09-20) and `Qwen/Qwen-Image-2.1-Turbo` (2026-10-09): a 7B diffusion transformer (32 layers) with a Qwen3-VL 8B text encoder; text-to-image and editing, RGBA output | [Qwen/Qwen-Image-2.1](https://huggingface.co/Qwen/Qwen-Image-2.1); [QwenLM/Qwen-Image-2.1](https://github.com/QwenLM/Qwen-Image-2.1) |
| Qwen Image 2.1: licence | **Qwen Research License Agreement: non-commercial only** ("for research or evaluation purposes only"); commercial use needs a separate licence; copies keep a Notice file. Evaluation here fits; no weights and no generated image go into this repository, and fixtures stay hand-made | [LICENSE](https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE) |
| Qwen Image 2.1: sizes | Official repo, bf16: transformer 14.23 GB, text encoder 17.53 GB (Turbo; 17.54 GB in 4 shards on the base), VAE 0.68 GB (Turbo) / 1.35 GB (base), about 32.5 GB in all. ComfyUI repackage `Comfy-Org/Qwen-Image-2.1`: transformer bf16 14.23 GB or int8 7.26 GB; Qwen3-VL 8B text encoder bf16 17.53 GB, int8 9.35 GB or w4a8 6.31 GB; VAE 0.68 GB; optional prompt enhancer (Qwen3.5 9B) 9.47 GB int8. Community GGUF (Unsloth, transformer only): Q4_K_M 4.20 GB, Q5_K_M 5.39 GB, Q6_K 6.27 GB, Q8_0 7.64 GB, F16 14.23 GB | Hugging Face API file listings, 2026-11-26 |
| Qwen Image 2.1: memory | The model card gives no figure; it recommends CPU offload "for GPUs with limited memory". Estimate for the chosen int8 set: about 17.3 GB of weights, about 20 GB peak with 1024 px activations; bf16 (about 32.5 GB) is out on this host by the 20 GB rule above | model card; estimate, not a measurement |
| Qwen Image 2.1: runtimes | Diffusers, ComfyUI (native from day 0, official workflow templates), vLLM-Omni, SGLang, LightX2V (a macOS app for Turbo), OpenVINO. **Not Ollama**: no library entry (`ollama.com/library/qwen-image` 404) and no image runtime. **ComfyUI supports it** (option B) | model card README, "ComfyUI"; [workflow templates](https://github.com/Comfy-Org/workflow_templates) |

### Judge

The grader section above names no model, only "a vision model (about 8 GB)". On this host that is **`gemma4:12b`**, already installed: vision-capable (`ollama show`), 8.0 GB, Q4_K_M, ID `6114515d63c1`, no download. It is pinned as the judge once F-021-T04 proves it on the pass and fail fixtures. Inkling 2 Mini (about 20 GB, Apache 2.0) was considered as judge and set aside by the owner on 2026-11-26 ("no Inkling for now").

### Memory plan for 36 GiB

The generator (about 20 GB peak), the judge (`gemma4:12b`, about 8 GB plus a small context) and a coding model (`qwen3-coder:30b`, 18 GB) cannot all be resident together; macOS also keeps part of unified memory for itself and the desktop. Run in phases, not per case, so each model loads once:

1. Before a run: `ollama ps`; stop any resident model (`ollama stop <name>`). No coding run in parallel.
2. Generate: ComfyUI loads the text encoder, encodes, then the transformer and VAE; it generates every case and repeat, and writes the images and their SHA-256 outside the repository.
3. Free the generator: `POST http://127.0.0.1:8188/free` with `{"unload_models": true, "free_memory": true}`; check memory has fallen before going on.
4. Judge: Ollama loads the judge once, grades every image at temperature 0, and the last request sends `"keep_alive": 0` so it unloads.
5. Afterwards: the coding model loads again on its next request.

Peak is about 20 to 22 GB (the generator phase), one of the three at a time. This replaces the "8 to 12 GB" estimate in Host cost below, which assumed a smaller generator.

## Pull the models

Written by F-021-T06 for F-021-T07: the owner runs these on the host. Each starts a download; nothing runs in CI. Ollama does not pull by digest, so the installed judge is checked against its manifest digest (the model ID in `ollama list` is that digest's first 12 characters); Hugging Face files are fetched at a fixed commit and checked against their SHA-256.

New disk: 17.29 GB of weights (the Qwen Image 2.1 Turbo int8 set) plus a ComfyUI Python environment of a few GB; the host has about 142 GiB free. The judge `gemma4:12b` is already installed (8.0 GB, no download).

```bash
# 1. Judge: gemma4:12b, already installed (no pull); check its digest
shasum -a 256 ~/.ollama/models/manifests/registry.ollama.ai/library/gemma4/12b
# expect 6114515d63c17436a7c0417d82820ac65ad643e2806c5a3c89cb62846436ed0b

# 2. ComfyUI v0.46.0 (commit a277b5bf213e8a44fa34817b7770b54f86ef4cea) in its own Python 3.13 environment
#    outside this repository; the host's Python is 3.9 and ComfyUI needs 3.10 or later.
curl -LsSf https://astral.sh/uv/0.13.10/install.sh | sh
git clone --branch v0.46.0 --depth 1 https://github.com/Comfy-Org/ComfyUI.git ~/gauntlet-comfyui
cd ~/gauntlet-comfyui && git rev-parse HEAD   # expect a277b5bf213e8a44fa34817b7770b54f86ef4cea
uv venv --python 3.13 .venv && uv pip install --python .venv -r requirements.txt

# 3. Generator: Qwen Image 2.1 Turbo, int8, from Comfy-Org/Qwen-Image-2.1 at commit aacf31a6d48e707f352ecba714cee0680da3479b
#    (the files of the official turbo text-to-image workflow, without the optional prompt enhancer)
R=https://huggingface.co/Comfy-Org/Qwen-Image-2.1/resolve/aacf31a6d48e707f352ecba714cee0680da3479b
M=~/gauntlet-comfyui/models
curl -fL -o $M/diffusion_models/qwen_image_2.1_turbo_int8_convrot.safetensors $R/diffusion_models/qwen_image_2.1_turbo_int8_convrot.safetensors
curl -fL -o $M/text_encoders/qwen3vl_8b_int8_convrot.safetensors $R/text_encoders/qwen3vl_8b_int8_convrot.safetensors
curl -fL -o $M/vae/qwen_image_2.1_vae_bf16.safetensors $R/vae/qwen_image_2.1_vae_bf16.safetensors
cd $M && shasum -a 256 -c <<'EOF'
8144a0182964aa8403ad6dbc011db837304167d235161b9aabaa8532e967314c  diffusion_models/qwen_image_2.1_turbo_int8_convrot.safetensors
8bfd0f6e12abf2d2d697ecc888e5e90b0d6741d6708f05799f53afa560452e8f  text_encoders/qwen3vl_8b_int8_convrot.safetensors
bb21f7473051e1ac368515dd3f2e15cd44d7a11748ee8823e1ddca3e4876b7c9  vae/qwen_image_2.1_vae_bf16.safetensors
EOF
```

Accepted alternative (F-021-T07, 2026-11-26): the free, local Comfy Desktop app instead of the pinned checkout in step 2 (not Comfy Cloud). It bundles its own ComfyUI (0.46.3 was used, not 0.46.0; record the version you run) and Python, and serves on 127.0.0.1:8188. Fetch the models in step 3 into any folder and point the app at it with an `extra_model_paths.yaml` in its ComfyUI folder:

```yaml
gauntlet:
  base_path: ~/gauntlet-comfyui/models
  diffusion_models: diffusion_models
  text_encoders: text_encoders
  vae: vae
```

Restart the app, then check that `curl -s 127.0.0.1:8188/models/diffusion_models` (and `text_encoders`, `vae`) lists the three files.

Expected: every `shasum` line matches or prints `OK`; report the judge digest, the ComfyUI commit and the three file hashes for the F-021 record.

Not verified on this host: the int8 "convrot" weights are the official workflow's choice and ComfyUI's quantised layers run without CUDA through a generic path, but a Mac run is unproven until F-021-T03 loads the workflow. If they fail on MPS, the fallback is the bf16 transformer (`qwen_image_2.1_turbo_bf16.safetensors`, 14.23 GB, sha256 `8b74237a7f505773e2c66726fa696444b4c704585c93a347cff9044937f7914a`) with the bf16 text encoder (`qwen3vl_8b_bf16.safetensors`, 17.53 GB, sha256 `68bdc82bc1b66851162ae656225e7e2068166b603db19bd5d5a3b90eb12669a9`), loaded one after the other (about 18 GB peak, 32.4 GB on disk), which F-021-T03 records before the first real run.

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
