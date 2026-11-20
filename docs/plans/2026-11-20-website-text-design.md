# Website Text And Footer Design

Approved direction: one Website Text menu, page-based records, Navigation and Footer records, existing language publishing/version/audit controls. Public layouts and link destinations stay unchanged.

## Ownership

The website already shares Navigation translation keys between the header and part of the footer. Keep those keys shared. Footer-only headings, introduction, address, copyright and footer-specific labels remain separate. Do not turn every footer value into a menu item or duplicate shared menu wording.

The reviewed 171 page-copy keys (342 Khmer/Chinese values) have no native CMS controls. They may be added to this collection. Existing Home Hero, Services Section, feature cards, statistics, timeline, service/doctor/technology content and their drafts remain authoritative and are excluded from the new key registry. Legal bodies, unresolved hero captions and professional-language claims are excluded.

## Storage And Editor

One tenant-scoped `website-text` collection, one record per page/common area. A fixed page selector identifies its permitted keys. A localized JSON map stores plain text, rendered as individually labelled native textareas rather than a raw JSON editor. The same registry supplies the labels, English reference text, allowed keys and preview routes. No generic content-builder or new publishing framework.

Reuse tenant/entitlement gates, locale-specific native drafts, 100 versions, audit diffs and optimistic overwrite protection. Inherit the Website Content (`pages`) entitlement without rewriting tenant settings. Prevent changes to a saved record's page identity. A database unique index rejects duplicate tenant/page records.

## Website Read Path

In Payload mode only, load published copy (or authorized draft-preview copy) with an explicit locale and no language fallback. Overlay only registered keys onto the existing next-intl catalogue. Explicit empty strings clear text; absent keys, invalid data or unavailable CMS retain the existing catalogue. Existing JSX and ICU formatting remain in place, so the layout and destinations do not change. Shared Navigation keys automatically update both current consumers.

The public website main branch, content-source flags and production environment are not changed. The sandbox receives the reader and the hosted CMS receives the editor.

## Data Protection And Recovery

The migration creates only new storage/indexes plus the native document-lock relationship. It does not seed, import, translate, overwrite, rename or delete existing records. Application rollback retains new editorial tables. Take a fresh certificate-verified read-only backup and restore-test before deployment. Enter approved baseline text through native CMS forms only, re-read current records before saves, and never replace nonempty values or publish unrelated drafts. Later Borin CMS wording always wins.

## Validation

Test registry ownership, unknown/prototype keys, ICU syntax/arguments, tenant/page uniqueness, immutable identities, locale isolation, native draft/publish/audit/concurrency behavior, preview routes, missing/outage fallback and immutable base catalogues. Run migration against predecessor tables in an owned PostgreSQL fixture and prove all predecessor rows unchanged. Verify hosted forms, footer/menu consistency and English/Khmer/Chinese test pages with screenshots and CSV audit evidence.
