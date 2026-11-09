# Writing and CLI style

Gauntlet Protocol uses concise plain English. Report observations and explicit limits; distinguish failed, error, not-run and unknown. CLI output is machine-readable JSON except concise validation/errors. Never print prompts, provider responses, secrets or personal host paths in evidence. There is no visual UI or colour-token system in this release.

Opted-in private failure sidecars are separate artifacts, not public report fields. Their explicit local inspector may display untrusted final response text; public reports retain only identities, hashes, grades and the diagnostic-enabled marker. Follow [failure-capture limits](FAILURES.md); exclude prompts, expected answers and separate hidden-reasoning fields.
