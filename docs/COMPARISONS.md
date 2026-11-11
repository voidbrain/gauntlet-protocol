# Repeatable candidate comparison contract

Gauntlet compares frozen reports; comparison never executes a provider, reruns a case, selects a winner or promotes a candidate. F-009 adds a bounded, identity-preserving summary for reproducible candidate matrices.

## Candidate matrix

A comparison accepts 2–64 validated reports. Each row is one report from one exact candidate configuration and environment. A matrix may vary model, quantization, runtime, context, sampling, thinking or residency, because those are the candidate dimensions being compared; every variation stays explicit.

Each row preserves:

- requested profile ID, model tag, backend, quantization, context, maximum output, temperature, top-p, top-k, seed, thinking, concurrency, residency, hardware and cache declaration;
- requested profile hash plus the report’s observed model digest, provider/runtime identity, engine hash and environment identity/hash;
- pack/version/hash, registry hash, limits including repeat count, diagnostic instrumentation and report timestamps;
- passed, failed, error and not-run counts; completeness and overall pass remain separate;
- total duration, cold/warm/unknown latency summaries and measured input/output/cache-token coverage, retaining unknown values rather than converting them to zero.

Source report and result identities remain authoritative. A summary does not duplicate source-event token totals across rows or repetitions.

## Compatibility

Reports are comparable only when pack hash, registry hash, limits, engine hash, environment and diagnostic instrumentation match. Candidate configuration differences remain visible but do not by themselves make rows noncomparable. A mismatch returns explicit reason codes; it is never silently averaged.

The first report is the declared baseline for pairwise compatibility. Ordering is input order, not a ranking. Mixed complete/incomplete reports remain comparable when their task contracts match so failures can be studied, but completeness and every failure state stay visible.

## Repetition policy

Repetitions are executed by the existing bounded run contract and recorded as iterations inside one report. Comparison does not synthesize independent cases from repeats. It reports iteration count and distribution inputs only when measurements exist. Cold, warm and unknown phases remain separate; no percentile is claimed from a missing or single-value sample.

Aggregate budgets apply to the whole report. Missing or exceeded usage stops later work under the existing engine rules. Comparison preserves unknown token coverage and never estimates provider cache tokens that the source report did not measure.

## Limits

The comparison summary is deterministic repository-owned data. It does not prove model quality, hardware equivalence, statistical significance, authenticated authorship or production fitness. Live campaigns, model downloads and consumer promotion remain separately authorized.
