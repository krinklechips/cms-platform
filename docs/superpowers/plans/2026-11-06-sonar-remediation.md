# Targeted Sonar Remediation

The user's 6 November request authorizes efficient remediation of all 451 Sonar findings, including maintainability. Confirmed false positives may be documented and closed after review. The latest instruction explicitly forbids removing Borin's changes/data or affecting the UI. Preserve those constraints even if they prevent closing a real UI-related finding; do not mislabel it as a false positive. Start with the 37 linked security/reliability findings; do not suppress rules or broaden production access.

## Constraints

- Keep production website main unchanged, email and PostgreSQL engine upgrade pending.
- No hosted editorial writes, imports, draft publication, translations, schema changes or R2 writes.
- Separate the preview-button feature and English rollout plan from this security branch.
- Freeze production UI/interaction behavior. Preview-button work is deferred. Accessibility or other findings that require UI changes stay open and are reported, not silently changed or dismissed.
- Preserve recovery/import hash ordering and tenant/transaction behavior. Do not follow generic locale sorting advice if it changes existing fingerprints.
- Keep the four required vendor patches. Ignoring dependency lifecycle scripts must not omit the repository's reviewed postinstall patch step.

## Batches

- [x] Runtime: simplify trailing-character regexes without renaming existing addresses; explicit deterministic sort comparators. Address, three-language preview and existing recovery-hash compatibility checks pass.
- [x] CLI boundaries: constrain typography source reads and non-overwriting evidence writes, use structured loopback database options, preserve original and cleanup failures. Local PostgreSQL error-preservation regression failed before the fix and passed afterwards.
- [x] Test scripts: fresh random disposable passwords, explicit promise handling, assertions inside native test lifecycle hooks. Built-in imports use node: prefixes; direct script entries use top-level await without changing import/write guards.
- [x] Docker recipe: use actual npm lockfile, disable implicit install scripts, explicitly apply checked-in patches, exec startup and align existing Node pin. Exclude credentials, local dependencies and editorial files from build context. Static recipe checks pass. Docker execution is unavailable locally; a real Alpine image build remains unverified.
- [x] Review trusted local component-fixture loader: four literal checked-in component paths, no CLI/network/editorial code input, never imported by the application. Sonar issue AaF2YLuMGh8uurdkKd3S documented and resolved FALSE_POSITIVE with the user's approval; public API confirms status and comment. No eval workaround or rule suppression added.
- [ ] Media labels/focus and other actual UI findings: OPEN under the user's UI freeze, not dismissed.
- [ ] All 451 per-issue dispositions, including intentionally sequential loops and immutable migration/generated code; do not represent partial remediation as full closure.
- [ ] Re-run focused and complete tests, lint, TypeScript/build, fresh whole-branch review and Sonar analysis. Preserve all unresolved findings and validation limits explicitly.

## Targeted Audit Sequence

This is Sonar-finding remediation, not a complete new platform/dependency security audit.

1. Completed: repository instructions and clean worktree checked; isolated codex branch from current origin/main 3c4b18d.
2. Completed: src/lib, src/components, collections, scripts, tests and Docker targets mapped; generated migrations/types and vendor files excluded from manual edits.
3. Completed: Payload 3.91, Next 16.4.2, Node pin 22.23.4, npm lockfile, four patch-package patches and existing test commands identified.
4. Completed: Payload hooks/config, CLI entry points and fixture loaders traced for the 37 targets.
5. Completed: safe native test/build/lint commands identified; no hosted fixture script will be executed.
6. Completed: baseline 734 tests, 727 passed, seven existing skips, zero failed (38.5 seconds).
7. In progress: existing analyzer export captured; local validation and remote rescan required. No Docker executable available.
8. Completed, bounded: duplicate targeted sort/fixture patterns compared; no consolidation proposed merely for similarity.
9. Completed, bounded: fingerprint sorting compared against display sorting; preserve their different contracts.
10. Completed: each finding remains with its existing module owner; no new service or general abstraction layer.
11. Not applicable: no dead-code/dependency removal requested or inferred from Sonar text.
12. Completed, bounded: CLI helpers remain in scripts; no runtime dependency on test tooling.
13. In progress, targeted only: URL allocator, preview origin and media controls regressions must retain authorization/tenant behavior. No claim of a fresh whole-authentication audit.
14. Completed, bounded: no migration or schema edit proposed; hash/recovery and local-only database guard contracts retained.
15. In progress: security findings separated from runtime, test and build-tool reliability findings. Scanner severity is not proof of a reachable public exploit.
16. Completed: this scoped report and the saved issue export precede remediation edits.
17. In progress: failing regression/characterization checks first; small batches only.
18. Pending: repeat validation and rescan before declaring closure.

## Ledger

- Public issue export: /Users/enochphan/.codex/visualizations/2026/11/06/roomchang-sonar/filtered-issues.json.
- Preview alignment changes remain outside this branch. No components, app markup/CSS, migrations, package manifests, lockfile or vendor patches have changed.
- No hosted editorial reads/writes, import runs, translations, publications, account changes, R2 operations, schema migrations or deployments performed in this pass. Native write tests use only newly owned loopback PostgreSQL/SQLite fixtures.
- Characterization: 121 focused runtime tests passed; 81 native form/branding/hydration tests passed. First full validation: 738 tests, 731 passed, seven existing skips, zero failed. TypeScript passes; lint has zero errors and 174 warnings. Additional preservation tests and final build/suite still pending.
- CLI path/output and Docker recipe regressions failed before implementation and pass after. Original form assertions remain, now inside before hooks; no checks removed.
- Native PostgreSQL concurrency regression: original failure was hidden by a writer cleanup error; now AggregateError retains both and clears the verification gate. Existing native concurrent publish/restore/rollback cases pass. Source application concurrency hooks are unchanged.
- Decision: preserve UTF-16 code-unit sorting for hash and enabled-collection contracts; do not apply localeCompare, which would change existing fingerprints.
- Decision: do not parallelize transaction, ordered fixture or preservation loops solely to reduce scanner counts. Review individual evidence first.
- Final first-batch validation: 744 tests total, 737 passed, seven existing skips, zero failed. TypeScript and production build pass. Lint: zero errors, 174 warnings. Clean npm install with implicit scripts disabled, explicit four-patch application and real Sharp/esbuild probes passes on macOS; not an Alpine-image certification.
- Fresh whole-branch reviewer found no new actionable correctness/security regression, UI/interaction change or editorial write; independently ran 179 focused tests. Reviewer did not independently rerun full suite/native PG. Existing Docker gaps remain: standalone output is not configured and direct server startup bypasses normal runtime/migration gates. Docker is not claimed release-ready.
- Seven confirmed false positives are documented and resolved in Sonar: one trusted fixture loader, four SSRF negative-test/DNS constants and two URL-blocking patterns. API confirms all seven resolutions and comments. No rule/profile exclusions or blanket issue acceptance.
- Current inventory covers all 451 keys, not all resolved: 83 mapped to source changes pending fresh analysis; seven resolved false positives; 158 separately retained sequential findings; 34 frozen UI findings; 34 immutable migration/generated findings; 16 optional read-efficiency candidates; four unresolved legacy reconciliation completeness findings; four narrowly reviewed-safe findings; one dead binding; 110 further reviews pending. Overlapping loop/migration reviews are deduplicated in this count.
- Reconciliation risk is contained by the unchanged shared-database write guard: writes are allowed only for explicitly opted-in non-production local SQLite fixtures. Do not run this retired tool against staff data. Source completeness and tenant-scoped planning must be redesigned before any separately approved reuse, not patched by parallelizing its destructive loop.
- Audit verification timeout cleanup needs follow-up; it is a disposable fixture-script concern, not evidence that the application audit transaction fails. No broad audit-hook refactor is included.
- Reports: /Users/enochphan/.codex/visualizations/2026/11/06/roomchang-sonar/{dispositions,await-review,frozen-review}.json. All 451 unique exported keys are represented. Sonar main still references unchanged source until this branch is separately integrated; passing local tests is not a fresh remote analysis.
