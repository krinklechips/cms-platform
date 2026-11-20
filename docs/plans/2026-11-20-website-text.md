# Website Text Implementation Plan

> Implement inline using the executing-plans workflow, with focused tests before production code.

**Goal:** Make reviewed page copy, shared menu labels and footer-only text editable without changing layouts or existing editorial content.

**Architecture:** One page-keyed localized collection using native Payload safeguards; an allowlisted next-intl catalogue overlay on the sandbox. Existing content collections retain ownership.

**Tech Stack:** Payload 3.91, Next.js, next-intl, PostgreSQL, node:test, Vitest.

## 1. Registry And Validation

- Create `src/lib/website-text-registry.json` from the reviewed 171 keys plus current Navigation/Footer leaf keys. Group page namespaces by their actual route.
- Create `src/lib/website-text.ts` and `tests/website-text.test.ts`.
- First fail tests for unimplemented allowlisting, immutability and message validation. Implement only those functions. Use the existing FormatJS message parser version already locked by the website; preserve message arguments/tags.

## 2. Native Collection And Editor

- Add `src/collections/WebsiteText.ts`, `src/components/WebsiteTextFields.tsx` and a new additive migration/snapshot.
- Register the collection in `src/payload.config.ts`, `src/lib/content-collections.ts`, preview mappings and page inventory. Reuse all existing wrappers.
- Use individually labelled textareas for JSON entries and the normal selected locale. Do not add a parallel save/publish mechanism.
- Test native locale saves, draft visibility, actor audit diffs, stale saves, tenant gates and duplicate page rejection. Test migration preservation across all predecessor tables and refusal of destructive rollback.

## 3. Sandbox Catalogue Reader

- Mirror the registry into the website with a parity check.
- Add `src/lib/website-text.ts` and tests for exact allowlisted overlay, base immutability, missing/outage behavior, blank text and invalid data.
- Add explicit-locale reading to the existing Payload adapter; do not recursively resolve next-intl locale during request-config creation.
- Merge the copy in `src/i18n/request.ts` only in Payload mode. Add a stable footer anchor without changing its layout/links.
- Test published and draft reads in all three languages and legacy non-Payload isolation.

## 4. Validation And Deployment

- Run clean installs, targeted tests, complete suites, TypeScript, builds and diff checks. Preserve existing dependency patches.
- Take and restore-test a fresh hosted backup before the additive migration. Read the latest audit log and retain Borin's new values.
- Commit isolated changes, deploy the hosted CMS and sandbox branch only. Do not push website main or change production flags.

## 5. Baseline Entry And Evidence

- Recheck registered keys do not overlap native CMS-owned fields.
- Prepare exact English baseline from current website text and supplied Khmer/Chinese from the approved workbook hierarchy; identify unavailable/unreviewed entries separately.
- Create only missing page records through native CMS forms; retain any nonempty concurrent work and drafts. Publish only verified baseline values.
- Verify database-backed reads and rendered pages, export before/after audit CSV, and save CMS/test-site screenshots. Report any incomplete scope explicitly.
