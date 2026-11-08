# Service Editor Layout Implementation Plan

**Goal:** Make the Service editor follow the rendered page and support bounded per-section spacing without changing existing wording, order, translations or drafts.

**Architecture:** Keep every existing field name and data path. Use an unnamed Hero container before the section editor, with eyebrow, name, heroDescription and the shared image in page order. Keep overview-card copy separate. Clone only Service top-level block definitions to add an optional spacing selector; Technology and nested blocks remain unchanged. Add nullable storage only, with no content backfill or destructive down migration.

**Stack:** Existing Payload 3.91, PostgreSQL migrations, Next.js and current test helpers. No new dependencies.

## Execution

1. Baseline tests; failing schema/order and section-spacing renderer tests.
2. Reorder schema-neutral field containers, add Service-only Default/Compact/None selectors and additive migration/snapshot/types. Missing spacing must retain the existing 32px mobile / 64px desktop gaps.
3. Native EN/KH/CN save-draft/publish tests must retain all other locale drafts and published fields, block IDs/order, media references and original text. Test invalid spacing rejection and tenant authorization.
4. PostgreSQL migration tests compare every predecessor column/row, including versions, then verify new storage. Code rollback retains columns and user-selected spacing.
5. Website reader/render tests verify all three locales, both legacy and block inputs, no empty-block gap regression, and unchanged nested/Technology behavior. Visual checks cover desktop/mobile and the unchanged default.
6. Type checks, full tests/builds, scoped review. Capture a fresh private recoverable snapshot and protected-column fingerprints, deploy CMS then only cms-sandbox, verify exact releases and read-only published pages. Compare predecessor columns, ignoring only new nullable layout columns and known volatile tables.

## Boundaries

- No website main push, production switch, Publications migration, email setup or database-engine upgrade.
- No import, backfill, automatic translation, content repair, real record publication or R2 object write. Hosted checks are read-only; save/publish controls are exercised on owned local fixtures.
- The translation investigation is separate and read-only. Present a source/mapping/recovery plan before any translation change. Screenshot photo requests are not authorized image updates.

## Pre-Deployment Verification

- Complete CMS suite: 744 tests, 737 passed, seven pre-existing fixture skips, zero failures. Complete website suite: 817 passed, zero failures.
- TypeScript and changed-file lint passed. CMS full lint has zero errors and 175 existing warnings. The website's unrelated existing full-lint failures are outside this change.
- CMS optimized Webpack build and website optimized build passed. Local CMS Turbopack hit an existing font-loader resolver failure; the hosted Linux build must pass before release verification.
- Chromium checked EN/KH/CN Hero order and locale preview URLs. Desktop/mobile spacing measured 64/32/0px and 32/16/0px; an empty media wrapper had zero height. Publication used a synthetic local account and owned local database only.
- Fresh private snapshot was restored to a separate local PostgreSQL instance and verified. A read-only baseline covers all 535 protected tables and six test-site Service pages. Deployment acceptance requires unchanged predecessor data and nullable new settings, not restoring old data over staff edits.
- The generated Media storage fields are retained; no storage, authentication, session, translation or dependency changes are included.
