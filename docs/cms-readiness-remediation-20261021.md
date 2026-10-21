# CMS Readiness Remediation

Approved brief: the 21 October read-only readiness review and the user's request to fix, validate, and rescan.

## Constraints

- Preserve all hosted editorial values, latest drafts, versions, file bytes, and locale identities.
- No replay of old snapshots, unguarded import, or production content-source switch.
- Keep existing Payload/Supabase responsibilities explicit; do not invent a new operational backend.
- Existing locale schema remains canonical. Fill translated blanks only from a reviewed source with concurrency checks.
- Work in the existing isolated CMS clone and website worktree. Do not change the synced Desktop checkout.

## Execution Ledger

- [in progress] Media: reproduce metadata-only corruption; preserve identity and block destructive file operations; verify native fixture.
- [in progress] Typography: locale-aware readable fields and website labels/navigation without a layout redesign.
- [in progress] Preview: actual destinations, missing collections, honest read-only operational snapshots, current guidance.
- [in progress] Image controls: explicit Media Library selection and useful errors on existing URL fields, preserving stored values.
- [in progress] Website validation: repair test harness/fixtures and real lint/type defects without suppressing assertions.
- [pending] Content ownership/discovery: shared Team statistics, FAQ/static ownership, selected-source sitemap and SEO.
- [pending] Reliability: explicit CMS failures and source-aware health; configure a real CMS email adapter if safe existing delivery configuration is available.
- [pending] Security: triage and upgrade compatible dependencies, preserving/rebasing access and concurrency patches.
- [pending] Preservation: compare read-only hosted content/draft snapshots; finish only guarded blank-field refreshes if appropriate.
- [pending] Verification: full tests/types/lint/build, hosted non-patient workflow where permitted, new incomplete-module scan, independent final review.

## Rulings

- The approved report is the remediation brief. These are bounded repairs to existing flows; new architecture and production cutover remain outside this batch.
- Use a Media Library URL picker rather than introducing image relationships/migrations where the existing URL field can safely support selection. This preserves drafts and current mappings.
- Treat operational CMS collections as explicit read-only snapshots until an actual live integration is approved and tested; do not imply that snapshot edits control bookings.
- Images use immutable objects: new upload for replacement; no normal API deletion. An explicit trusted maintenance context is required for server-side cleanup.

## Rollback and Release Gates

Code rollback must not replace the database. Any additive schema change requires a reviewed forward migration and preservation proof. Each correctness fix needs a failing test before implementation, then focused/full validation. A test-site deployment is not production cutover. Record remaining environment/content blockers honestly.
