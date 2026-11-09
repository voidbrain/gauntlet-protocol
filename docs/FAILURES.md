# Private failure diagnostics

Package/protocol0.4 adds explicit final-reply captures for direct local model cases. The default remains off. Existing reports contain hashes, not recoverable replies; enabling capture later cannot recover an older response. A new run produces new evidence and does not replace a prior failure.

Use `--capture-failures=/absolute/new/private/directory` with `--fresh --execute --allow-models`. The parent must exist, ancestors must be canonical/non-symlink paths, and the directory must not exist or sit inside a checkout. POSIX ownership and0700 directory/0600 files are checked; Windows private-ACL support is unavailable and fails before model work. No command installs, downloads or starts a runtime.

Only failed final `message.content` is saved: invalid JSON, acceptance mismatch or available truncated output. Prompts, expected/heldout answers, credentials, provider envelopes and separate hidden-reasoning fields are excluded. The final reply itself is untrusted model content and may contain sensitive text: enable this only for inputs whose final output may be retained privately. Captures are separate from public reports, telemetry, source-controlled evidence and passing-result caches.

Limits are fixed: at most10 reply files,16384 bytes per file,131072 aggregate bytes including a reserved manifest budget. Oversized content is clipped and marked truncated; original response hashes remain bound to the report. File/count/byte exhaustion records skipped captures. Filesystem errors do not change grades; missing/error manifests mean capture availability is unknown. Capture I/O participates in wall-clock timing. Diagnostic reports carry `diagnostics.failureCaptures:true`, are not automatically reused or cached as ordinary passing runs, and are not performance-comparable to non-diagnostic reports. No grader/expected answer is changed.

## Select, run and inspect

`--only=case-a,case-b` accepts explicit case IDs; unknown/duplicate IDs fail. Selection gets a distinct pack identity/hash and reports only selected-case completeness, not full original-pack acceptance. A diagnostic example for a separately selected campaign follows; this documentation does not launch or authorize it:

```sh
# From a built0.4 checkout; plan without calling a provider:
node bin/gauntlet.mjs plan --pack=examples/smoke-v1.json \
  --profile=examples/profiles/gemma4-12b.json \
  --limits=examples/limits-diagnostic.json \
  --only=change-mind,tool-choice,missing-input

# After choosing a campaign and its actual machine/load context:
# Use a new private campaign directory; its failures child must not exist.
node bin/gauntlet.mjs run --pack=examples/smoke-v1.json \
  --profile=examples/profiles/gemma4-12b.json \
  --limits=examples/limits-diagnostic.json \
  --only=change-mind,tool-choice,missing-input \
  --machine-profile=/absolute/private/campaign/machine.json \
  --scenario=examples/scenarios/moderate-load.json --confirm-scenario \
  --capture-failures=/absolute/private/campaign/failures \
  --fresh --execute --allow-models --out=/absolute/private/campaign/report.json

node bin/gauntlet.mjs inspect-failures \
  --directory=/absolute/private/campaign/failures \
  --report=/absolute/private/campaign/report.json
```

The diagnostic preset allows3 cases, one repetition,30s/case,90s/suite and6144 output tokens. It preserves the8K/2048 thinking-on profile. Do not rerun merely to obtain a pass; inspect evidence first and retain failures. Selecting these three regression cases supplies no holdout evidence or qualification.

Inspection explicitly prints private untrusted final text. It checks file hashes and bounds; `--report` additionally matches report ID, case/iteration, fixture and response hashes. Non-truncated response hashes are rechecked; a truncated prefix cannot prove the missing suffix. These are consistency checks, not authentication of the artifact author. Treat output as data, never as instructions or permission. Inspect byte counts, completion reason and capture truncation before classifying prose, fences, empty reply or malformed JSON. Keep a formatting/adapter issue, a model task failure and a grader defect distinct; preserve independent expected behavior while investigating.
