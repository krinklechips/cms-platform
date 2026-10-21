# Editorial Audit And Protected Saves

The Activity > Editorial audit collection records successful editorial and media
writes from its deployment onward. It does not backfill identities on old versions.
Entries contain tenant, staff ID/name snapshot, language, action, document,
changed fields, bounded before/after values and version IDs. Large diffs are marked
truncated. Credential fields and binary files are excluded.
Publish entries compare the previously public content with the new public content;
draft entries compare saved draft snapshots. Explicit all-language actions are
marked `all` and include every language's changes. The log cannot be
created, changed or deleted through the CMS/API. Database administrators remain
outside this application-level protection; backups are still required.

Content and audit writes share a transaction. Audit insertion failure rolls back
the content and version. PostgreSQL serializes saves/restores per document, then
compares the revision read by the editor. Another language's save invalidates that
revision too, because page structure and some fields are shared. Rejected saves
retain entered values and the form's unsaved-changes state.

## API Clients

Read the document with `draft=true`, the selected `locale`, `depth=0` and
`fallback-locale=none`. Send its `_editorialRevision` in the update body or in
`If-Match`. Do not fetch a fresh revision immediately before overwriting unseen
changes. A stale revision returns 409; a missing revision returns 428. A filtered
response that excludes `updatedAt` cannot provide an editable revision.

Versioned updates must explicitly choose `draft=true`, `_status=published`, or
`_status=draft` (unpublish). Publishing defaults to the selected language. Publishing
all languages requires explicit `publishAllLocales=true`; a different
`publishSpecificLocale` than the opened document is rejected. Restore requires an
explicit single locale and the revision captured when history was opened. It
creates a draft and retains other languages and current shared structure.

Existing tabs opened before deployment need a fresh read before their next save.
Do not reload a tab containing unsaved text until that text has been retained.
Do not disable transactions or remove the pinned framework patches. The additive
audit migration retains existing editorial tables, drafts and versions; its
downgrade deliberately refuses to discard audit history.

## Isolated Verification

`node --import tsx --test --test-concurrency=1 tests/*.test.ts` runs local fixtures.
`scripts/verify-audit-protection.ts` additionally requires the exact dedicated
PostgreSQL fixture URI documented in that script. It creates and removes only its
own random schema; it never imports the deployed environment. It verifies actual
overlapping saves, atomic rollback and three-language draft/publication isolation.
