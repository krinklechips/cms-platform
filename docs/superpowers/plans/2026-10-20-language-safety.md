# Roomchang Language Safety Implementation Plan

**Goal:** Fix the approved language-mapping review, deploy only the CMS and test website, and import provably safe live-site deltas without replacing editorial work.

**Architecture:** Keep one CMS with native en/kh/cn localization and stable shared identifiers. Preserve published content and pending drafts separately. Apply narrowly version-pinned upstream fixes where Payload itself loses row identity; keep restore policy and import decisions in application-owned code.

**Spec:** User-approved Roomchang CMS language mapping review, https://chatgpt.com/space/page_4409f98217a4819194760a5096ce3710.

## Constraints

- Reuse the existing CMS clone and website worktree; leave the desktop checkout and existing untracked documentation untouched.
- Never execute the blocked legacy import/reconciliation scripts on the hosted database.
- No production website deployment or production source switch.
- Do not replace nonempty CMS values or pending drafts merely because live content differs.
- Preserve record and array-row IDs, current translations, version history and shared facts through additive migrations.
- Use isolated local fixtures for destructive verification; hosted tests require a fresh snapshot and conflict-checked, locale-only restoration.
- Ruling: the approved report supplies the design and execution approval; do not repeat approval gates for these existing-flow fixes.
- Ruling: shared homepage structure remains shared; text must follow stable row IDs across all languages.

## Review Focus

- Reordered/inserted/deleted homepage rows with other-language pending drafts.
- Locale restore must not resurrect deleted shared rows or alter another language's published content or draft.
- Stable categories must work for existing imported translations and CMS-created cases.
- Empty/fallback text must not mask the wrong data source or overwrite a reviewed CMS translation.
- Import plans must reject stale targets and any record with protected editorial changes or drafts.

## Tasks

- [x] 1. Preservation: write failing real-Payload tests for array identity and locale restore; implement minimal fixes; package version-pinned patches; run all CMS tests and TypeScript checks; commit.
- [ ] 2. Mapping/schema: add stable clinical category keys and localize visitor-copy omissions with additive, version-preserving migrations; use a disposable PostgreSQL fixture to prove preservation; commit.
- [ ] 3. Website reads: make category filters use keys, wire branches/timeline to Payload in sandbox mode, prefer localized CMS stat labels consistently; add behavioral tests; commit only scoped website files.
- [ ] 4. Safe live import: compare live data, existing CMS values, history and drafts; produce a guarded field-level manifest; apply only proven-safe changes, preserving conflicts; verify all existing work and history.
- [ ] 5. Verify and deploy: focused and full tests, builds, independent review; push CMS main and website cms-sandbox only; verify hosted deployments.
- [ ] 6. Hosted language checks: snapshot all languages, test draft/preview/publish for en/kh/cn, verify correct pages and other-language isolation, restore only test changes with conflict checks; report content restored and remaining import conflicts.

## Progress

- Baseline: CMS 212d90e, website a4fe70a; remote branches match; CMS tree clean; website has existing untracked docs/cms/ only.
- Baseline tests from approved review: 23 CMS and 6 focused website tests pass; standalone test typing errors are known and will be addressed where touched.
- Task 1 verified: stable row-identity merges, active-locale draft restore, field-access preservation, and transaction-scoped PostgreSQL serialization. Real concurrent writers use equivalent numeric IDs; rollback releases locks. All 101 pre-import CMS unit tests passed, focused preservation tests and real fixtures pass. Clean npm ci applies both pinned patches; restricted-field restore passes on that clean installation. Type checking passed before the independent import files were introduced; full checks will run again at integration.
- Task 1 independent review found hidden/read-restricted and update-protected fields could be cleared; fixed using raw snapshots only after native authorization and current-value fallback for denied updates. Regression fixtures now pass; numeric/UUID lock identity is canonicalized.
- Task 2 local verification complete: 63 schema/key tests, real SQLite and PostgreSQL locale/draft/history writes across all 12 affected collections. Independent review found no actionable migration defects.
- Full hosted-schema backup restored locally: all 490 tables / 57,314 rows match by hash. Applying the new migration to a separate clone preserves every original column/row, adds 300 EN-only recovery rows, and maps all 11 clinical cases. Hosted database is still unchanged.
- Live refresh comparison: 148 missing FAQ/career scalar translations are candidates; another 70 FAQ category cells require the new schema and a fresh blank-history check. Nonblank differences and all pre-existing drafts stay protected; no blanket sync is permitted.
