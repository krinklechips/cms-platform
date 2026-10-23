# CMS Functional Repair, 23 October 2026

Scope: hosted Roomchang CMS and the sandbox website. The public website remains on Borin's Vercel account and the website repository's `main` branch is not part of this deployment. Email delivery remains pending; two-hour staff sessions remain unchanged.

## Repairs

- Native Unpublish uses the revision-bearing Form submission path for protected collections, retaining explicit locale, save errors and the returned revision instead of resetting entered content to old props.
- The pinned UI patch covers both leaf modules and the actual prebundled client entrypoint. Regression checks exercise both. Earlier leaf-only Form/Publish protections are now also present in that shipped entrypoint.
- A hosted browser follow-up exposed an additional boundary: Payload strips collection-level `custom` from client configuration. The safe non-secret protection marker now uses `admin.custom`, including Unpublish, Publish All and version Restore. A regression test runs Payload's actual serializer and evaluates the native leaf/bundle protection expressions against its output.
- Unsupported bulk updates are disabled on protected editorial and media collections. Bulk Upload creation remains available.
- New uploads inherit the authorized current folder, including unvisited and later-added bulk files. Manual folder overrides and immutable existing R2 paths remain protected.
- Whole-document deletion audits cover all languages. Authorized tenant transfers append isolated source/destination ownership history in the same transaction without exposing either tenant's content to the other.
- Testimonial previews open the full testimonial page; statistic previews retain their originating page, including native form-state refreshes.
- Unsupported pricing metadata, community legacy destinations and fixed-position statistic ordering are explicitly read-only; stored values and schemas are retained.
- Companion sandbox fixes preserve doctors with no assigned department, distinct partner groups with equal titles, explicit localized partner headings, and every supported section-icon selection.

## Verification

- Before changes: 568 CMS tests passed, seven fixture-specific skips; 679 website tests passed.
- Initial repairs: 637 CMS tests passed, seven fixture-specific skips; 770 website tests passed. Both builds passed. Native PostgreSQL ownership/locking/audit tests passed, including a transfer/delete race. The serializer follow-up adds seven regression tests; final rerun results are recorded in the release journal. TypeScript and scoped lint are checked separately.
- Fresh hosted fixtures before deployment passed private drafts, authenticated previews, EN/KH/CN publishing, other-language/draft preservation, R2 byte checks and alt isolation, stale/missing revision rejection, and publish audit attribution.
- Read-only TLS-verified PostgreSQL fingerprints captured 500 tables / 58,638 rows before testing. Final comparison and post-deployment checks are recorded in the private local verification journal, not assumed from test-suite results.

## Preservation And Rollback

No schema migration, content backfill, import, reconciliation or translation rewrite is included. Existing documents, drafts, files and versions must not be restored from an older snapshot as part of this release. Only owned non-patient verification records may be edited or removed.

Rollback is code-only to the preceding compatible CMS and sandbox commits. New audit rows and current staff edits remain in place. Existing tested backups are recovery evidence, not permission to replace the live database.

## Explicit Limits

The twelve declared code-owned website areas remain outside this CMS's editable coverage. The consolidated visual partner manager and the service Hero field-layout redesign are separate unfinished UX work, not newly implemented here. Enquiries and booking slots remain imported read-only snapshots. Existing translation completeness is not a linguistic review or automatic import.

No new two-person staff-browser test is claimed because it was previously declined. The separate-tab preview opens the correct page; the browser-control tool pauses the embedded document response during automation, so its embedded-frame visual result is limited.
