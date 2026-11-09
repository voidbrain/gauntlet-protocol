# Independent report-only review: F-002–F-004

Fresh-context review covered exact evidence reuse, authorization, preflight/cancellation deadlines, runtime/artifact identity, sampled performance telemetry and project-only harness/index settings.

Three reproducible issues were found: current execution opt-ins could be bypassed by a cache hit; preflight had an independent deadline and validated options late; and profile-only registered runners could probe the wrong provider or crash on absent built-in identity. Immutable failing regressions were committed in 068eb6f before fixes.

Recheck passed all ten targeted deterministic tests and index/rules/backlog checks; no additional blocking issues remained. Admission precedes metadata/reuse, preflight shares the campaign deadline/signal, registered runners persist evidence without unrelated provider probes, and their model evidence reuse remains disabled absent independently current identity. Shared safeguards remain intact. Documentation labels owner attestations, reused measurements, sampled peaks and unverified real installations.

No live models, installations, downloads, reviewer edits, approvals or merges. Review does not establish real alternative-runtime compatibility. Source formatting after review preserves the same TypeScript AST; final CI remains the release acceptance.
