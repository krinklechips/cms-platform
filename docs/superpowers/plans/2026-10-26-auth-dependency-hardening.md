# Remaining CMS Security Hardening

**Goal:** Remediate the remaining approved CMS findings, starting with authentication and dependency patches, and deploy only the hosted CMS/test integration.

**Baseline:** c19cb6e53a9e72c4d9dd7da9956469b2750bddba; preview-secret rotation already completed. Preserve findings RCMS-004 through RCMS-011 from the 25 October register.

## Constraints

- Do not switch roomchang.com, import content/translations, edit staff records/drafts, rotate staff passwords, activate SMTP, or perform a provider database upgrade/reboot.
- Use disposable fixtures for every authentication, upload, mutation, reset-token and concurrency test. Hosted validation stays read-only.
- Preserve two-hour sessions, verified database TLS, tenant-bound previews, audit/concurrency hooks and all four native patches.
- Introduce only forward, non-destructive database safeguards after duplicate preflight and an isolated rehearsal. Never rename/merge/replace staff content to make a migration pass.

## Ordered Tasks

1. Authentication: reproduce cookie-based sibling-origin writes; configure exact approved CMS origins; reject unsafe browser-origin writes without breaking anonymous reads, native server actions or header-authenticated server integrations. Mark production auth cookies Secure. Add compatible anti-framing, transport and referrer headers. Keep broad CSP report-only until browser validation.
2. Dependencies: separately validate/patch the resolved Undici, DOMPurify and production-nested Happy DOM copies. Preserve framework versions and native patches. Record exact inventory, current primary advisories, scanner outputs and isolated original-condition plus legitimate-flow regressions.
3. Password recovery: generate absolute trusted HTTPS reset URLs without enabling SMTP; test captured local emails, forged hosts, reset-token scope, expiry and single use.
4. Address integrity: protect Service/Technology detail URLs using the existing tenant-lock and published/latest-draft reservation model. Reject duplicate new addresses clearly; do not rewrite existing staff addresses. Validate updates/restores/concurrent creates and retained rows on disposable PostgreSQL.
5. Provider/backup follow-up: inspect available read-only patch/recovery evidence. Record any provider-access or approved-maintenance requirement as open; do not upgrade or reboot Supabase.
6. Release: clean install, complete suite, typecheck, lint, build, dependency rescans, independent review and secret checks. Apply only approved deployment settings; deploy CMS/test changes, verify EN/KH/CN and record data-preservation boundaries and rollback instructions.

## Decisions And Progress

- Work in the existing clean isolated CMS clone, on codex/cms-auth-dependency-hardening-20261026. Desktop checkouts remain untouched.
- Reuse the prior audit evidence and IDs; this is remediation, not a claim that every previously unscanned layer has now been audited.
- Delegate the independent dependency batch into a separate clean clone, so package installation cannot change the authentication test runtime mid-test.
- Authentication and deployment decisions remain owned by the parent task; dependency worker may not access hosted systems or deploy.
