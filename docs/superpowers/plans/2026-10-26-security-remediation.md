# CMS Security Remediation Implementation Plan

> Use superpowers:executing-plans and test-driven-development for this batch.

**Goal:** Close the three high-priority findings in the 25 October audit without changing staff content, drafts, database schema, or production website routing.

**Architecture:** Keep the existing Payload, PostgreSQL, tenant access, and revision-lock mechanisms. Share verified PostgreSQL connection options between the application and startup gate. Scope preview capabilities to their configured tenant. Extend the existing revision check to destructive deletes and its native client control.

**Spec:** The user-approved remediation of RCMS-001, RCMS-002, RCMS-003 in the private 25 October deep-security review.

## Global Constraints

- No hosted editorial writes, imports, schema migrations, production cutover, SMTP activation, database reboot, or secret rotation in this implementation batch.
- Use disposable local fixtures for destructive and cross-tenant tests; preserve all existing database identities, localized values, drafts, versions, and media URLs.
- Keep two-hour staff sessions and the existing native package patches.
- Commit to an isolated codex branch; do not push shared main without a deployment checkpoint.

## Review Focus

- PostgreSQL URL options and environment settings cannot silently weaken TLS or redirect a loopback exception.
- Application and CLI must agree on certificate and hostname verification; no plaintext retry after TLS failure.
- Preview authorization must use stored document ownership, not a spoofable form tenant.
- Stale deletion must preserve newer drafts and all version rows in all locales.
- Native client bundles, not only leaf source files, must pass the opened revision on deletion.

## Tasks

1. TLS: write failing real-adapter and pg configuration tests; add shared verified pool options and a bundled public Supabase CA; wire the app and migration verifier; test trusted/untrusted certificate paths and read-only hosted connectivity; document operations.
2. Preview: write cross-tenant and spoofed-owner regression tests; authorize the configured preview tenant before issuing any capability; retain correct paths in en/kh/cn; verify saved and new editors.
3. Deletion: reproduce stale deletion against isolated local records; extend backend preconditions and native client request headers; reject missing/stale revisions without losing versions; verify a deliberately fresh deletion only on fixtures.
4. Verification: run all tests, typecheck, build, diff and secret checks; record results and residual findings. Hosted changes require a separate deployment checkpoint.

## Progress

- Baseline: clean main at 4f4de72e7786668eba4485edc16e3399ec5aa6d9, matching origin; isolated remediation branch created.
- Ruling: reuse the clean audit clone rather than touch the cloud-synced Desktop checkout.
- Ruling: public certificate trust data is bundled as a server module so both Node CLI and Next server bundles use the same CA without a runtime download or missing traced file.
- Task 1 complete: actual adapter regression failed without TLS and now passes. Application and startup gate share verified TLS settings. Read-only hosted probe negotiated authorized TLS 1.3; wrong CA and hostname were rejected. No hosted writes.
- Task 2 complete: actual two-tenant fixture reproduced the grant leak; membership plus saved-document ownership now gate all preview URLs. Configured tenant is explicit and missing configuration fails closed. Authorized en/kh/cn routing passes.
- Task 3 complete: stale deletion reproduced before the fix. Missing/stale preconditions now reject with 428/409; current intentional deletion works on disposable SQLite and PostgreSQL in all locales. Leaf and shipped native UI callbacks retain dirty state on rejection and send revision plus locale.
- Ruling: retain the existing permanent-delete function with a current-revision requirement, rather than remove an existing staff action. Permanent deletion is still irreversible and requires an explicit current confirmation; a recovery-preserving archive flow remains separate work.
- Ruling: the PostgreSQL fixture must explicitly release Payload's held health-check client before closing its pool; this is fixture cleanup, not a production connection-policy change.
- Ruling: run delete revision validation in the native beforeDelete stage, after existing access/ownership checks and under the already-held record lock. This retains 403 authorization precedence and audit behavior; the full existing module-gating/PostgreSQL race tests exercise it.
- Independent whole-branch review found no actionable blocker or important issue. Older preview grants still require rotation; deliberate fresh permanent deletion still removes versions by existing policy.
- Deployment approved by the user after validation. Limit this release to CMS code plus the preview tenant environment setting; no website source/cutover changes. Preview-secret rotation was separately requested and remains pending a reply.
- Clean install succeeded with all four existing package patches retained and the expanded native UI patch applied.
- Full regression: 686 tests, 679 passed, 7 skipped, 0 failures. TypeScript and production build passed against an isolated local SQLite build fixture.
- Hosted migration preflight over verified TLS: all 23 migrations already applied; this release adds no migration or schema/type/lockfile change.
- Pending: final lint/secret check, approved configuration/deployment, hosted read-only verification. Rotation remains pending separate approval.
