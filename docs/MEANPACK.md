# Mean Pack website integration

Mean Pack is a separate tenant on the existing Serviette Payload service.
Its `meanpack-websites` collection is enabled by a dedicated zero-price
entitlement; Roomchang subscriptions and editorial rows are not imported or
updated. Existing platform administrators retain their normal access. No new
human accounts or shared Roomchang preview credentials are created.

The one-document-per-tenant editor holds page copy, identity/contact links,
gallery entries, crop catalogue, process stages and supporting lists. Uploaded
files belong to the document tenant. Image surfaces require images; the hero
film and video gallery entries require MP4. Required publication fields match
the consuming website contract. Incomplete drafts may be saved; invalid public
content must not be published. Phase identifiers stay fixed, while phase copy
and ordering are editable.

The public website reads only published content from the Mean Pack tenant host
and verifies `CMS_TENANT_ID`. It uses 60-second ISR. No CMS credential is shipped
to the public site. Its enquiry form still composes messages in the browser.
Legal-policy body, form/navigation labels and layout remain code-owned.
The Roomchang iframe preview integration is not reused for Mean Pack.

## First import

Run `scripts/onboard-meanpack.ts --website-source <Meanpack checkout>` with an
explicit CMS database and storage configuration. The script uses the existing
Enoch platform administrator for the editorial audit trail, creates the tenant
and entitlement when missing, and imports the current source files and content.
It refuses to replace an existing website document, including saved drafts.
It creates no staff passwords or keys. Never rerun it to refresh staff content.

`--metadata-only-fixture` is restricted to loopback databases and is only for
disposable storage-independent tests. It must never be used for the public site.

## Migration and verification

`20261102_063727_meanpack_website` adds 40 website/version/locale tables and one
nullable document-lock relation. It enables RLS on the new tables. The generated
unrelated removals of legacy nested-block tables were deliberately excluded.
The predecessor's schema entries remain in the new snapshot. Existing tables,
drafts and media are retained. Roll back the application if necessary; the down
migration refuses to discard editorial data.

A local restored-database rehearsal verified 58,996 predecessor rows across
500 tables unchanged, same-tenant reads, cross-tenant denial and draft/publish
separation. The historical detail-address test applies later additive
migrations only after its original predecessor/index assertions, so its runtime
uses a schema matching current collection configuration.

The portal needs its custom domain on the existing Render service and an exact
`https://meanpack.serviettelab.com` entry in `CMS_TRUSTED_ORIGINS`. Tenant host
navigation uses persisted entitlements plus the shared media library.
