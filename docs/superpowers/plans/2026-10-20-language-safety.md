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
- [x] 2. Mapping/schema: add stable clinical category keys and localize visitor-copy omissions with additive, version-preserving migrations; use a disposable PostgreSQL fixture to prove preservation; commit.
- [x] 3. Website reads: make category filters use keys, wire branches/timeline to Payload in sandbox mode, prefer localized CMS stat labels consistently; add behavioral tests; commit only scoped website files.
- [ ] 4. Safe live import: compare live data, existing CMS values, history and drafts; produce a guarded field-level manifest; apply only proven-safe changes, preserving conflicts; verify all existing work and history.
- [x] 5. Verify and deploy: focused and full tests, builds, independent review; push CMS main and website cms-sandbox only; verify hosted deployments.
- [x] 6. Hosted language checks: snapshot all languages, test draft/preview/publish for en/kh/cn, verify correct pages and other-language isolation, restore only test changes with conflict checks; report content restored and remaining import conflicts.

## Progress

- Baseline: CMS 212d90e, website a4fe70a; remote branches match; CMS tree clean; website has existing untracked docs/cms/ only.
- Baseline tests from approved review: 23 CMS and 6 focused website tests pass; standalone test typing errors are known and will be addressed where touched.
- Task 1 verified: stable row-identity merges, active-locale draft restore, field-access preservation, and transaction-scoped PostgreSQL serialization. Real concurrent writers use equivalent numeric IDs; rollback releases locks. All 101 pre-import CMS unit tests passed, focused preservation tests and real fixtures pass. Clean npm ci applies both pinned patches; restricted-field restore passes on that clean installation. Type checking passed before the independent import files were introduced; full checks will run again at integration.
- Task 1 independent review found hidden/read-restricted and update-protected fields could be cleared; fixed using raw snapshots only after native authorization and current-value fallback for denied updates. Regression fixtures now pass; numeric/UUID lock identity is canonicalized.
- Task 2 local verification complete: 63 schema/key tests, real SQLite and PostgreSQL locale/draft/history writes across all 12 affected collections. Independent review found no actionable migration defects.
- Full hosted-schema backup restored locally: all 490 tables / 57,314 rows match by hash. Applying the new migration to a separate clone preserves every original column/row, adds 300 EN-only recovery rows, and maps all 11 clinical cases. After hosted deployment, all original rows/fields in those 490 tables still match; only the migration ledger gained its new entry.
- Live refresh comparison: 148 missing FAQ/career scalar translations are candidates; another 70 FAQ category cells require the new schema and a fresh blank-history check. Nonblank differences and all pre-existing drafts stay protected; no blanket sync is permitted.
- CMS core deployed at 9ee2e74; website sandbox deployed at 148fecc. All four website review follow-ups are resolved: publication-page provider bypass, shared numeric stat fallback, authoritative branch slug matching, and timeline live-preview row observation. Website build passed with 257 pages after CMS cutover; 73 focused tests pass. The full website suite retains its existing Next/Intl/server-only test-harness failures and is not reported as green.
- Hosted native UI draft/preview/publish tests passed separately for EN/KH/CN. Each marker appeared on the four intended active-language pages, never the other-language home pages. All temporary values were restored, all 12 public pages rechecked marker-free, and the test record finalized without an extra draft.
- Explicitly approved clinical-experience repair changed only inherited EN/CN display/suffix values; Khmer and every other draft field were preserved. All 11 older versions remain intact. Other stat records, including Borin's updates and history, match the pre-test backup.
- Safe-refresh helper passed independent static review. A fresh full-backup application run applied all 218 blank cells across 39 records, retained old history/content, and finished with 35 FAQ / four career published latest versions and no added drafts. An earlier FAQ preservation failure rolled back correctly; its subsequent exact retry and the fresh full run passed, but the original cause is not established.
- One complete CMS sequential suite passed 125/125, TypeScript passed, and the production build passed. Later reruns intermittently returned 124/125 because a legacy-import subprocess exceeded its timeout after emitting the expected content-write refusal; this remains a verification limitation, not an all-green latest full-suite claim.
- Hosted import is PARTIAL, not complete. PostgreSQL connections closed unexpectedly during the original apply and the first bounded continuation batch; no further writes will be attempted in this session. Independent public CMS API verification confirms exactly 48 matching cells on eight complete FAQ records, 170 blank cells on 31 untouched records, zero partial records, and zero unexpected values. The final database comparison confirms all 495 unrelated tables unchanged, including existing drafts and Borin's other work; only the eight intended FAQ parents/locales and native version pointers/entries changed. Existing nonblank differences, drafts, shared data, and old versions are not refresh candidates.
