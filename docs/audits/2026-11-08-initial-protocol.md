# Initial protocol review

Reviewed 2026-11-08T23:06:43.798Z; baseline `34371e79fae77233f93f461fb2c5a7ef278a142b` plus uncommitted initial-release changes. Full eight-area inspection; checked means reviewed, not defect-free or release accepted.

## code

Strict validators, explicit run gates, provider and process cleanup inspected; typecheck/build pass.

Limits: Initial release; review findings addressed under F-001, no exhaustive correctness claim.

## logic

Traced plan to execution to report, comparison, capability assessment and reviewed profile export. Four review repros committed before fixes.

Limits: Trusted external runner and review receipt remain attestations; no authenticated execution proof.

## tests

Thirteen deterministic tests cover no-call planning, grading, exact settings, holdouts, budget/identity errors, process failures, byte limits and append-only evidence.

Limits: Fake providers and neutral subprocesses; no live models, coding sandbox, GPU stress or device acceptance.

## documentation

README, PROTOCOL, Mac profiles, example JSON, CLI flags and area notes checked against implementation.

Limits: Model profiles are proposals; smoke cases do not establish general or coding fitness.

## harness

Core 4.2.1 copied/adapted mapping, check:rules/backlog/maintenance and template parity reviewed. Project settings only.

Limits: Initial adoption timing sample covers copy/check receipt slice, not earlier policy reading or product implementation; behavior runner unconfigured.

## security

Loopback/remote metadata checks, strict command registry, no shell, bounded bytes/time, private append-only files and neutral data inspected.

Limits: Registered code trusted; process supervision is not security isolation; no live security assessment.

## delivery

Locked TypeScript 6.0.3 and Node types 24.10.1; Node >=24; pinned Actions copied from current harness; own CI and npm artifact plan reviewed.

Limits: Local host Node26; Node24 Linux acceptance awaits CI; no public npm publication or hosted service.

## backlog

F-001 owns release implementation and independent review; foreign NERV integration excluded from release acceptance.

Limits: Pending own CI and final fresh review; no record closed from local tests.

## Findings and disposition

Independent report-only review identified generation model mismatch, fixture/holdout reuse, imported budget inconsistency and external report byte bypass. Committed reproductions in 34371e7 fail before fixes; all four pass afterward. F-001 retains final review and CI acceptance. No inherited project rules removed. No model inference, downloads, production promotion or private prompts used.
