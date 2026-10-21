# CMS Readiness Remediation

Approved brief: the 21 October read-only readiness review and the user's request to fix, validate, and rescan.

## Constraints

- Preserve all hosted editorial values, latest drafts, versions, file bytes, and locale identities.
- No replay of old snapshots, unguarded import, or production content-source switch.
- Keep existing Payload/Supabase responsibilities explicit; do not invent a new operational backend.
- Existing locale schema remains canonical. Fill translated blanks only from a reviewed source with concurrency checks.
- Work in the existing isolated CMS clone and website worktree. Do not change the synced Desktop checkout.

## Execution Ledger

- [verified locally] Media: native metadata-edit corruption reproduced and repaired; immutable file identity and early replacement/deletion guards tested.
- [verified locally] Typography: localized fields, website labels and navigation; real browser checks at 390/1280/1536/1920px. Khmer full navigation held until 1800px after a visual wrapping defect was found.
- [verified locally] Preview: actual destinations, missing collections, read-only operational snapshots and current guidance. Unconnected video categories return no misleading preview.
- [verified locally] Image controls: explicit tenant-filtered Media Library selection and upload drawer on existing URL fields; explicit selection required, not an incidental upload callback.
- [verified locally] Website validation: tests and types repaired; existing newly enforced lint failures remain documented, not suppressed.
- [verified locally] Content ownership/discovery: shared Team stats, CMS Careers/Dentist Talks consumers, current relationship mappings, public published-only sitemap and selected-source SEO.
- [partly complete] Reliability: explicit CMS failures, timeouts and source-aware health. TLS email adapter tested with a fake transport; real delivery remains pending by the user's explicit instruction.
- [partly complete] Security: Payload 3.91.0, Next 16.4.2, React 19.2.6, sharp 0.35.5 and nodemailer 10.1.7; access, locale restoration and concurrency patches rebased and native-tested. Runtime audit still reports transitive high advisories (CMS 12; website 12), zero critical.
- [in progress] Preservation: read-only hashes cover 480 editorial/version tables and 57,283 rows. No hosted editorial writes/imports have been performed; compare after deployment as well.
- [verified locally] Verification: final runs 219 CMS and 255 website tests, no skips; both TypeScript checks and production builds passed. Native SQLite locale restoration plus real PostgreSQL concurrency/migration fixtures passed again after a fresh clean install.
- [in progress] Deployment: website commit 3b922de targets cms-sandbox only. Hosted CMS deployment, post-deploy preservation comparison and non-patient upload verification are next.

## Independent Review Closure

- Pristine-install patch failure: fixed by regenerating only four custom JavaScript diffs against official 3.91 tarballs. Fresh `npm ci` applied both patches successfully; upstream authorization and upload sanitization remain in place.
- Missing upgrade schema: migration 20261021_120000_payload_391_schema adds nullable media._objectkey and users.reset_password_requested_at without backfills. Full R2-enabled schema checked against every prior migration; all old values/drafts remain equal. Legacy null-key URLs and existing keyed URLs survive EN/KH/CN metadata edits.
- Noncanonical branch sitemap URLs: discovery now uses the same branch identity resolver as the page, with a failing-then-passing regression for imported and slugless branches.

## Remaining Readiness Gaps

- Real hosted upload/select/publish verification needs an authenticated CMS session; local behavior and native storage preservation are verified but are not a substitute for this check.
- Missing translations remain content work: 27/35 FAQ rows per KH/CN, comparison labels, timeline/partner/video text and most stat labels. No auto-translations or existing drafts were rewritten.
- The CMS has 21 videos overall, only six categorized dentist-talk, versus 24 bundled Dentist Talks entries. Review and import missing source records with concurrency checks before production cutover; do not reclassify unrelated records automatically.
- Video testimonials are still bundled. One bundled FAQ supplement, global/static headings, navigation, footer, director/vision/legal copy and the playlist link remain owned by website code. Do not claim every visible string is CMS-editable.
- Enquiries and Booking Slots are explicitly read-only CMS snapshots. Operational website writes remain Supabase-backed, and test-domain naming alone does not prove a separate operational database.
- SMTP configuration and delivery are pending. Sandbox health correctly remains unhealthy for unavailable email delivery, rather than masking that dependency.
- Website source lint retains seven pre-existing stricter React-rule errors and eleven warnings; repository lint additionally reports old script require-style errors. Tests/types/build passing does not make lint green.

## Rulings

- The approved report is the remediation brief. These are bounded repairs to existing flows; new architecture and production cutover remain outside this batch.
- Use a Media Library URL picker rather than introducing image relationships/migrations where the existing URL field can safely support selection. This preserves drafts and current mappings.
- Treat operational CMS collections as explicit read-only snapshots until an actual live integration is approved and tested; do not imply that snapshot edits control bookings.
- Images use immutable objects: new upload for replacement; no normal API deletion. An explicit trusted maintenance context is required for server-side cleanup.

## Rollback and Release Gates

Code rollback must not replace the database. Any additive schema change requires a reviewed forward migration and preservation proof. Each correctness fix needs a failing test before implementation, then focused/full validation. A test-site deployment is not production cutover. Record remaining environment/content blockers honestly.
