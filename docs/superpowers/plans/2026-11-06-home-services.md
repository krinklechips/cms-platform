# Services Section Release Plan

Approved by the user's 6 November request: implement the missing Services Section, test EN/KH/CN and deploy the CMS and CMS-fed test website only. Cleanup is a separate task.

## Design

Use one independent tenant-scoped `home-services` document, reusing the existing Payload draft/version/audit/concurrency and preview controls. Nine localized text fields use the website's existing keys: eyebrow, heading, seeAll, implants, crowns, aligners, cosmetic, whitening, surgery. Icons, routes, order and layout remain fixed. This document is separate from Home Hero so its publication cannot release an existing hero draft.

Its entitlement is the existing Homepage entitlement; do not rewrite tenant/module settings. Initialize only the new Roomchang record with exact current website strings, and refuse to overwrite an existing record. A missing new record preserves existing website copy. Use only the selected locale, without English fallback over a missing Khmer/Chinese field. No new runtime dependency or cleanup refactor.

## Constraints

- Keep roomchang.com, website main, email and database engine version unchanged.
- Fresh private clones only; do not edit the synced Desktop checkouts or existing staff records.
- Additive schema only. Rollback keeps new content/version tables; never replay old editorial data.
- Hosted tests may temporarily change only the newly created Services Section record, with revision checks and exact restoration. Stop rather than overwrite a concurrent staff edit.

## Steps

- [x] Baseline and failing CMS schema/entitlement/preview tests, then native locale/draft/permission tests.
- [x] Implement collection, existing singleton navigation reuse, registration, additive migration and generated schema/types. No existing record import.
- [x] Failing website tests, then a selected-locale reader and text overrides in HomeServices. Preserve all non-CMS rendering.
- [x] Native migration and locale publish/restore tests; complete tests, builds, lint and fresh review of both diffs.
- [x] Read-only editorial snapshots, reviewed CMS deployment and test-site deployment, initialize new record only.
- [x] Hosted EN/KH/CN temporary publish/verify/restore on the new record; compare old editorial rows/drafts and production source.
- [x] Deliver exact edit location, evidence and a separate list of other unconnected copy. No broad cleanup in this release.

## Verification Focus

Saved drafts must not leak; publishing one locale must not publish another locale's draft. Existing hero/content versions remain untouched. Duplicate per-tenant records are rejected. The new editor must appear for a real tenant editor with the existing homepage module, not only a super-admin. All nine values must be editable and previewed on the homepage's services anchor.

## Ledger

- User-approved scope is the small Services Section editor, not a CMS rewrite.
- Website clone was queried before its checkout finished; the initial install failed because the lockfile was not present yet. Checkout finished cleanly; no source edits had begun. Retry installation after clean status.
- CMS dependencies installed with scripts disabled first; run the repository's required postinstall patches before any tests/build. Do not remove or regenerate its security patches.
- CMS schema/entitlement/preview tests failed before implementation, then all 50 focused tests passed. Native SQLite publication tests preserve existing hero drafts and other locale drafts. Owned PostgreSQL migration tests preserve every old row across all 540 predecessor tables.
- Website rendering tests failed before implementation, then passed. Complete website suite: 793 passed. CMS complete suite: 727 passed, seven existing skips, zero failures. Both builds and type checks passed after fixing a test-fixture environment type; the website runtime fixture also verified all nine text fields and seven unchanged links in EN/KH/CN.
- Ruling: generate only the new schema objects against the predecessor snapshot, rather than accepting the CLI's unrelated legacy rename prompts. Native migration preserves all predecessor definitions and rows. The migration adds four RLS-protected tables and one nullable lock relation; its down operation refuses content deletion. Roll back application code, not editorial snapshots.
- Fresh verified-TLS read-only baseline: 531 editorial tables, 61,204 rows. Source production and test homepage sections respond 200 in all three languages; current exact strings match bundled translations.
- Fresh independent review: no P0/P1/P2 findings. Deferred minor: platform HQ's optional Open content dropdown does not expand the homepage entitlement alias; the actual Roomchang sidebar does. No tenant settings are rewritten to fix cosmetic HQ navigation in this release.
- Changed-file lint: no errors. Existing website lint errors (10) and existing warnings are outside this feature and retained for separate cleanup. Install-time low/moderate dependency findings also require a separate current review; this release does not claim a clean dependency scan.
- Hosted CMS release 3c4b18d is live; migration completed in 424ms. Only the new document was initialized with exact existing strings. All nine fields passed hosted draft/publication/restoration checks in all three languages, with the other two locales unchanged. Final initialization publishes only this new document's verified original values in all languages.
- A whole-table comparison detected Borin's concurrent Khmer Aesthetic Dentistry publication (audit 548). Ruling: keep that newer staff state, not the older baseline. All ten published field values match Borin's audit; labels appear on the test page. After that checkpoint, all 530 old content tables and all pre-existing audit rows remain unchanged through our tests. Operator audit writes target only home-services/1.
- Visual check found the new anchor heading under the sticky website header. A three-language assertion failed first, then passed after adding only scroll-mt-24 to the section. Full website suite remains 793 passed, and rebuilt production-server language checks pass. Separate code commit 771478b; no CMS data write is needed for this correction.
- Actual signed-in editor verified nine fields and locale-correct preview links in EN/KH/CN. The Chinese new-tab preview renders correctly. Embedded-frame automation remains blank; do not claim a successful side-frame visual check or a real Borin-account browser test.
- Final test deployment 771478b is READY on roomchang-sandbox.vercel.app. Fresh Khmer anchor navigation places the heading at 216px, below the header's 117px bottom edge. Production website main is still 017475d5. Full evidence and separate copy inventory are in /Users/enochphan/.codex/visualizations/2026/11/06/roomchang-home-services/release-review.md.
- This final ledger-only commit belongs on the feature branch, not CMS main, to avoid another unnecessary hosted restart. Runtime CMS code remains 3c4b18d; no editorial data or schema changes accompany the documentation.
