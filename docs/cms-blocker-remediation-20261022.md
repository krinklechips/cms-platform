# CMS Blocker Remediation

Scope: fix RCM-SEC-002 and RCM-FUN-001/002/003 from the 22 October review, remediate dependency advisories, and deploy the hosted CMS used by the test website. Email delivery stays pending. Production website cutover is excluded.

## Protection Rules

- No reconciliation, seed, legacy import, or live translation refresh is run.
- Never edit, publish, restore, rename, or delete existing staff content/drafts for verification.
- Capture hashes of existing content/media/version rows before deployment and compare afterwards.
- The page-address migration only adds uniqueness. Abort on existing conflicts rather than rewriting them.
- Hosted workflow tests use uniquely marked non-patient records; cleanup only those exact records and their own assets.

## Implementation and Verification

- [x] Fix target-tenant module entitlements with membership-order, transfer, anonymous and bulk denial tests. Independent native proofs confirm that parent/latest-draft owners are both checked, authorized editing/restores work, and disabled/unassigned ownership fails closed.
- [x] Enforce tenant/page-address uniqueness with transaction-scoped allocation, a duplicate-preflight migration and concurrency tests. Six tests pass, including six concurrent native PostgreSQL writers and preservation of all 500 predecessor tables.
- [x] Align initial parent/version timestamps; prove create-response revision works in EN/KH/CN and stale writes remain rejected. Six forced-clock failures reproduced before the patch; 34 focused revision/restore/legacy-preview tests now pass.
- [x] Pass validated revisions through guarded translation refresh; prove stale snapshots still fail closed without running an import. Forty integrated refresh tests pass, including native PostgreSQL snapshots and whole-transaction rollback.
- [x] Apply narrow dependency fixes; verify clean installation and record any upstream limitations. Clean install applies all four patches. DOMPurify/esbuild fixed releases selected; braces has no upstream fix and retains a scanner-visible advisory with a tested local recursion guard.
- [x] Run complete suite, build, type checks, dependency scan and independent final diff review. Latest full run: 522 tests, 511 passed, 11 optional typography skips, zero failures/cancellations; both opt-in PostgreSQL fixtures executed. Six CMS typography cases passed separately using isolated jsdom with unchanged website sources. All 22 migrations and the startup migration gate passed on a disposable PostgreSQL database. Final build/type gates are retained in the release evidence.
- [ ] Deploy exact tested commit to existing hosted CMS; verify migration/index, supported preview routes, and isolated EN/KH/CN publishing/upload flows.
- [ ] Compare all pre-existing row hashes and publish a bounded evidence-backed readiness result.

## Review Focus

Membership order must not change authorization. A tenant transfer must check both owners. Concurrent creates must retain all records and stable old addresses. A refresh must not acquire an unvalidated revision to evade a conflict. Publication of one locale must retain other-locale drafts and published values.

## Release Constraints and Remaining Maintenance

- Deletes now hold the shared PostgreSQL record lock before ownership and audit reads. Protected editorial bulk deletion is disabled in API/Admin; staff can delete individual records. This closes the independently reproduced delete-versus-new-draft race.
- Tests loading the full config use Payload CLI's static Lexical export resolver, avoiding intermittent top-level dynamic-import stalls under tsx. No assertions were relaxed or new skips added.
- DOMPurify and esbuild fixed releases are selected. Braces has a tested local recursion guard, but its unfixed upstream version remains scanner-visible (15 npm metavulnerability rows representing one advisory, not 15 distinct exploits).
- Lint now runs; it still reports 45 pre-existing errors outside this change. Changed application/test files have no lint errors. Do not claim the whole repository is lint-clean or audit-clean.
- The 11 optional typography/site tests need separate DOM/site prerequisites; six CMS-specific cases were additionally exercised. This is not a full browser or OS/container security certification.
- Email delivery and a production website cutover remain excluded. A real two-account browser session test was previously waived; native two-actor regression coverage remains in the suite.

Evidence: `/tmp/roomchang-cms-blocker-fixes-20261022/`. Prior review: `/tmp/roomchang-cms-section-audit-20261022/`.
