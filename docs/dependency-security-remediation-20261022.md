# Dependency blocker remediation, 2026-10-22

## Scope and handoff

- Source: `ef747d0df7b2c06d309f9a1bcb8ffefbac629cf5`, initially clean shared checkout `/tmp/roomchang-platform-readiness-20261019`.
- All installation, resolution, audit and build work took place in the private clone `/tmp/roomchang-dependency-remediation-20261022-u0ng6J`. Shared `node_modules` was not changed. No commit, push, deployment or email action was performed.
- Deliverable changes are only `package.json`, `package-lock.json`, a new `patches/braces+3.0.3.patch`, and new dependency-security tests/docs. Existing Payload/Next/UI patches and application code are not part of the handoff patch.
- Private verification environment: macOS arm64, Node `22.22.1`, npm `10.9.4`. Linux binary execution, final container/image and deployed artifact were not verified by this sidecar. Native optional-package lockfile coverage tests pass.
- Parent changes made after the private snapshot, including the parent-owned Payload patch, must be verified after integration. No claim here clears those later changes.

## Implemented changes

| Component | Exact remediation | Compatibility constraint |
| --- | --- | --- |
| Monaco DOMPurify | Override `monaco-editor@0.57.0 > dompurify` to `3.4.16` | Only the existing affected parent is overridden; no Monaco/Payload downgrade. |
| Legacy Drizzle loaders | Override `@esbuild-kit/core-utils@3.3.2 > esbuild` and `esbuild-register@3.6.0 > esbuild` to `0.25.12` | Reuses the stable esbuild family already used by Drizzle. Existing tsx/Payload esbuild `0.28.2` paths are unchanged. |
| braces | Keep `3.0.3` with a five-file patch-package depth guard | Hard maximum 100 nested AST containers; both brace and parenthesis parsing and all three direct AST walkers are guarded. No caller option disables the cap. |
| Lint | Declare `eslint-config-next@16.4.2` and `eslint@9.39.5`; add `npm run lint` | Uses the already-present flat Next config. ESLint 10 is outside the React/import/jsx-a11y plugins' declared peer ranges and raises the Node engine floor. ESLint 9 is deprecated/EOL; this is a maintenance follow-up, not a current matched advisory. |
| Test entry point | Add `npm test` as `node --import tsx --test tests/*.test.ts`, plus `test:dependency-security` | No existing tests or lint rules are relaxed. |
| DOM test runtime | Declare `happy-dom@21.0.4` as an exact devDependency | UI regressions remain runnable after `npm ci`, rather than resolving an extraneous ancestor installation. |

The lockfile changes only existing DOMPurify/esbuild versions and their corresponding native packages, plus the dependency closure for the newly declared lint/test tooling. Payload `3.91.0`, Next `16.4.2`, React and the existing application dependencies are not downgraded or blanket-updated.

## Advisory disposition

The original scan contained **four unique advisories**, not 20 distinct vulnerabilities. Final npm audit reports **15 high package/metavulnerability rows, one unique advisory**; production-only audit reports **12 high rows, the same one advisory**. No critical, moderate or low matches remain. The production-only command must override `.npmrc`'s `include=dev`: use `npm audit --include=prod --omit=dev --json`. Bare `--omit=dev` still includes dev dependencies in this repository.

| Advisory | Upstream assessment and prerequisites | Implemented status |
| --- | --- | --- |
| [GHSA-p98j-92pf-mc4p](https://github.com/cure53/DOMPurify/security/advisories/GHSA-p98j-92pf-mc4p) | Vendor low; DOMPurify `3.4.13` through `3.4.15`; live DOM `IN_PLACE` sanitization plus an after-sanitize hook detaching a subtree. First fixed `3.4.16`. | Fixed version selected. Both after-hook hazards reproduce on `3.4.15`, fail to reproduce on `3.4.16`, and legitimate markup is retained. |
| [GHSA-6688-9rhm-gjv2](https://github.com/cure53/DOMPurify/security/advisories/GHSA-6688-9rhm-gjv2) | Vendor low; DOMPurify through `3.4.15`; forbidden rawtext root returned after `IN_PLACE` sanitization and subsequently serialized/reparsed as HTML. First fixed `3.4.16`. | Fixed version selected. Baseline rawtext reparse retains an armed handler; `3.4.16` rejects the root with `TypeError`. |
| [GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99) | Vendor moderate, CVSS 3.1 5.3; esbuild through `0.24.2`; victim must run an esbuild serve endpoint and visit an attacker-controlled website. First fixed `0.25.0`. | All four locked esbuild locations are `0.25.12` or `0.28.2`. Real local HTTP serve checks with an arbitrary Origin return the bundle without granting CORS access. Both old Drizzle loader APIs still transpile TypeScript successfully. |
| [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | GitHub reviewed high (current CVSS 4.0 8.7); npm reports high, CVSS 3.1 7.5. Deep attacker-controlled patterns trigger recursive AST stack exhaustion. Registry latest remains `3.0.3`; advisory has no patched version as of retrieval. | **Upstream/scanner unresolved; locally mitigated for the reported recursion trigger.** A tested, fail-fast depth guard replaces uncontrolled recursion with a bounded `SyntaxError`, including direct/internal AST APIs. This is not an upstream version fix or a zero-audit result. |

braces production paths include Payload Next -> Sass -> chokidar -> braces; Payload S3 -> plugin-cloud-storage -> find-node-modules -> findup-sync -> micromatch -> braces; and patch-package -> find-yarn-workspace-root -> micromatch -> braces. The new lint path is eslint-config-next -> Next ESLint plugin -> fast-glob -> micromatch -> braces. All resolve to the single patched root copy; tests enumerate every locked braces location to catch future nested, unpatched copies.

The [upstream braces issue](https://github.com/micromatch/braces/issues/70) includes maintainer disagreement with the advisory. That disagreement is not used as closure: the baseline here actually throws `RangeError: Maximum call stack size exceeded` for 4,000 levels in an 8,001-character pattern. The patch prevents that trigger. It does not claim to solve arbitrary regex complexity, expansion-output exhaustion, malformed hand-built ASTs or unsafe callers that fail to handle ordinary syntax errors.

### Safe/excluded paths

- DOMPurify's two matched versions are removed, not merely declared unreachable. Monaco is a browser/admin dependency; no public application exploit was asserted or tested against live data.
- esbuild is installed in the production dependency closure because Drizzle participates in migrations; it is not automatically excluded as dev-only. All affected old resolutions are removed even though transpilation, not an exposed esbuild server, is the relevant application use.
- happy-dom is dev-only and selected outside the five published affected ranges: [module compiler injection](https://github.com/capricorn86/happy-dom/security/advisories/GHSA-6q6h-j7hj-3r64), [cookie origin leak](https://github.com/capricorn86/happy-dom/security/advisories/GHSA-w4gp-fjgq-3q4g), [prototype/VM isolation](https://github.com/capricorn86/happy-dom/security/advisories/GHSA-qpm2-6cq5-7pq5), [VM escape](https://github.com/capricorn86/happy-dom/security/advisories/GHSA-37j7-fg3j-429f), and [script execution](https://github.com/capricorn86/happy-dom/security/advisories/GHSA-96g7-g7g9-jxw8). npm audit and OSV contain no selected happy-dom advisory. Tests must not use DOM emulators as security sandboxes for untrusted code.
- Email remains pending. No email delivery or deployed-service testing is claimed. Application authorization, parent-owned source fixes, website changes, operating-system packages and deployed infrastructure are outside this dependency artifact.

## Verification and residual blockers

| Command/check | Actual result |
| --- | --- |
| Baseline new regressions before fixes | Failed for old DOMPurify, absent nesting guards/AST stack exhaustion and missing ESLint. |
| `npm ci --no-fund --audit=false` | Exit 0. All four patches apply: `@payloadcms/next`, `@payloadcms/ui`, `braces`, `payload`. 766 packages installed. |
| `npm run test:dependency-security` | Exit 0, 24 tests pass, including 15 separately named public braces entry-point subtests and the existing two native optional-platform lockfile tests. |
| `npm test` | Exit 0; 459 tests, 446 pass, 13 skip, zero failures. Happy-dom UI tests execute. These are private-snapshot results, not results for the later parent-integrated source. |
| Production `npm run build` | Exit 0, Next compile/typecheck/static generation completes with a disposable local SQLite URI and synthetic secret, telemetry disabled. |
| `npm ls --all --json` | Exit 0; resolved inventory saved. |
| `npm audit --json` | Exit 1, expected: 15 high metavulnerability rows, only the version-based braces advisory. |
| `npm audit --include=prod --omit=dev --json` | Exit 1, expected: 12 high rows, the same braces advisory. |
| OSV querybatch cross-check | 861 unique locked package/version pairs accepted; only `braces@3.0.3` matches `GHSA-vfj7-8cjw-p6xm`. Includes cross-platform optional lockfile entries, not just installed macOS binaries. Same-feed agreement is not independent exploit research. |
| DOMPurify DOM regression | Isolated jsdom `29.1.1` harness: before false, after true for all six checks, including legitimate-markup control. Fixture: `tests/dependency-security-browser.js`. Not a full browser end-to-end test. |
| Existing ESLint config | Now resolves; representative clean TypeScript fixture passes. Whole repository lint still fails on 45 pre-existing errors outside sidecar ownership. Exact files/lines/rules are in `lint-summary-final.json`; no lint rules were suppressed. |
| Changed test files lint | `eslint tests/dependency-security.test.ts tests/dependency-security-browser.js --max-warnings 0` exits 0 with zero errors/warnings. The earlier whole-repository raw lint baseline is retained unchanged. |
| Optional coverage | Two PostgreSQL fixture tests and 11 typography/site tests skip without their environment prerequisites. Parent observed actual-site jsdom resolution hanging in the cloud-synced website checkout. No website regression was established. |

Do not label this artifact fully lint-clean or audit-clean. The missing lint dependency/config resolution blocker is corrected; the remaining lint work includes `PlatformDashboard` error-boundary rules, component ref/state rules, internal admin anchors, legacy test/verification variables named `module`, and one `prefer-const` in `Invoices`. These application/test files belong to the parent/other agents.

Typography resolves `jsdom` explicitly from `ROOMCHANG_TYPOGRAPHY_SITE_ROOT`, not from CMS dependencies. Adding jsdom here would not resolve that site's dependency-loading problem, so no jsdom CMS dependency was added. The isolated advisory harness initially tried jsdom 30.0.1, whose engine requires Node 22.22.2 or later; it was replaced with compatible jsdom 29.1.1 before producing the recorded result. Happy DOM was unsuitable for the DOMPurify reproducer because it rejects the ordinary root; those initial attempts are not claimed as coverage.

## Artifact identity and installation

- Final `package-lock.json` SHA-256: `04207d5d3757714d260adf8c6e532d40e65360f48064da3683a65ce7cb83fb34`.
- Final `package.json` SHA-256: `4ad7f8b0fa9e81003211dbfbc1ab718bd339dc6b8b0304b8259cf705c43e0b1e`.
- Braces patch SHA-256: `966d0c2298927f2c13933545710472329e49c1a2ec0da656ca1910c912def356`.
- Existing patches used for private clean-install verification: Payload `98ed4aff667a58e4a2c4728d826606759933d688d52f45202551bdc04fa3fb99`; UI `270f74bb176bb55beea75e02ef4a16c25b0dd122b623f569dc6aad4232000b2f`; Next `33ab230b45bf727c53721a9d51a76ac8738e1a78b9b160c555bc57f993df0d46`. These files are deliberately omitted from the artifact patch so later parent edits cannot be overwritten.

The private artifact `dependency-remediation.patch` contains the two package files and only the four new patch/test/doc files. Apply it before running a parent-controlled clean install, after other agents have stopped using the shared dependency tree. Keep `postinstall: patch-package --error-on-fail`; never use `--ignore-scripts` for the actual install. Then run `npm run test:dependency-security`, `npm test`, and the parent integration build. An install that skips patches is not remediated even if its lockfile is identical.

Raw evidence in the private artifact directory: `npm-ci-final.log`, `dependency-security-final.log`, `suite-final.log`, `build-final.log`, `resolved-inventory-final.json`, `npm-audit-final.json`, `npm-audit-production-final.json`, `osv-crosscheck-final.json`, `primary-advisories-final.json`, `braces-before.json`, `dompurify-dom-regression.json`, `lint-final.json`, `lint-summary-final.json`, and `changed-files-lint.log`. GitHub advisory API snapshots include retrieval times, vendor/range metadata and the differing current severity records. OSV records the input lockfile hash and per-pair results.

## Shared integration and exact guard check

On 2026-10-22, the six owned files were integrated into the shared checkout: the manifest and four new patch/test/doc files through `apply_patch`, and the generated lockfile through a mechanical copy. No existing Payload/Next/UI patch or other worker file was overwritten. All 14 captured worker files were byte-identical immediately after package/patch/test integration. The parent-owned Payload patch remained SHA-256 `3a22585a16797715ce298e5cdf51836ad08c2518dd603136081c4e1ba5a73732`.

The parent has started shared `npm ci` after confirming the package, lockfile and braces patch match the artifacts. This sidecar ran no shared install and makes no claim about the in-progress install or integrated suite/build. No shared-checkout commands are run while that install is in progress. Only this owned documentation is being finalized.

After the parent install completes, the exact focused command is:

```sh
node --import tsx --test --test-name-pattern='every installed braces entry point|direct braces AST walkers|bounded legitimate brace patterns' tests/dependency-security.test.ts
```

This command passed in the private copy. For every locked braces installation, it individually names and invokes `braces()`, `braces.parse()`, `braces.compile()`, `braces.expand()` and `braces.stringify()` on each of three inputs: 4,000 nested braces, 4,000 nested parentheses, and 2,000 mixed brace/parenthesis pairs. Each input is 8,001 characters, below the original character limit. Every invocation must throw the controlled depth `SyntaxError`, not a stack-exhaustion `RangeError`. Public and internal AST walkers are also called directly with a 4,000-level AST to prove parsing cannot be bypassed. Legitimate patterns, escapes, quoted literals, character classes and the 100/101 depth boundary are checked separately.

Updated raw results: `dependency-security-distinct-entrypoints.log` (24 passing tests), `brace-guard-distinct.log` (focused guard checks), and `suite-distinct-entrypoints.log` (446 passed, 13 skipped). The original logs and whole-repository lint baseline remain intact. Changed test files pass ESLint with `--max-warnings 0`.

`GHSA-vfj7-8cjw-p6xm` remains an **unresolved upstream/version-scanner advisory with a locally tested mitigation of its recursion trigger**. Installing a patch against unchanged package version `3.0.3` is not scanner closure, upstream remediation or proof that arbitrary untrusted glob/AST inputs are safe.
