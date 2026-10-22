# Serviette CMS — Operations Runbook

The rules that keep production healthy. Every one of these exists because its
absence broke something once.

## Architecture (content and operations are separate)

```
LEGACY CONTENT PATH (website deployments without CONTENT_SOURCE=payload ← clinic Supabase)
   X  legacy live→CMS imports blocked once staff editing has begun
CMS (this app, Render: serviettelab.com + <tenant>.serviettelab.com, own Supabase DB)
   │  REST API, anonymous reads TENANT-HOST ONLY (published, tenant-scoped)
   ▼
CMS CONTENT PATH (sandbox/UAT, and any deployment configured with CONTENT_SOURCE=payload)

WEBSITE ENQUIRIES / SLOTS / BOOKINGS → clinic Supabase (not CMS snapshots)
```

- **Publishing affects deployments that consume the CMS.** Website code has a
  `CONTENT_SOURCE=payload` path; a separate CMS database does not make publishing
  incapable of affecting a live website. Verify each deployment's environment,
  tenant API host and page consumers before making claims about its content
  source. Changing the live project's content source requires an approved,
  verified cutover; this runbook is not evidence that one has happened.
- **Operational writes remain in clinic Supabase.** Contact enquiries, slot
  availability and bookings do not use the CMS collections. A sandbox or
  preview URL is not by itself an isolated operational environment. Never
  submit patient data or exercise booking writes as a CMS preview check.
- **The CMS owns staff editorial work.** The separate live-site database is
  not a safe source for replacing CMS records after Borin starts editing.
  Database separation alone does not prevent an import from overwriting edits.
- Anonymous API access: a host that maps to **no tenant** (serviettelab.com
  included) is **denied** in production. Consumers must call their tenant
  host. Local dev (`localhost`) keeps published-only reads.

## Deploys

- Repo: github.com/krinklechips/cms-platform → Render service `cms-platform`
  (srv-d6efr43uibrs73daurj0). Push to `main` = deploy (~4 min).
- Start chain: `node scripts/verify-runtime.mjs && payload migrate && node scripts/verify-migrations.mjs && next start`.
  The verify step **fails the deploy** if any migration file is unapplied —
  Render's own migrate has twice no-opped silently. A red deploy here means:
  inspect the migration log and destination schema, rehearse the correction on
  an isolated restored database, then approve a forward correction. Do not
  bypass the gate or replay a database snapshot over staff work.
- The sandbox's production branch is **`cms-sandbox`** on the *roomchang*
  repo, not `main`. Pushing site-side changes: `git push origin main:cms-sandbox` too.

## Migrations — the four rules

1. Generate against a **disposable restored database**, with the same enabled
   configuration shape, including fixture `R2_*` settings. Without R2 vars the storage plugin doesn't
   register and the diff tries to `DROP COLUMN media.prefix`.
2. `DATABASE_URI="$DISPOSABLE_LOCAL_DATABASE_URI" npx payload migrate:create <name>` —
   then **read the generated SQL** before running it (destructive statements
   require a separate reviewed recovery plan; a `down()` function is not
   permission to discard content or drafts).
3. Restore-test the reviewed forward migration and compare existing content,
   drafts, history and media identities first. Apply through the approved
   deployment start chain and verify `payload_migrations` and the schema gate.
4. New tables get RLS automatically (`auto_enable_rls` event trigger, both
   Supabase projects). A new **live-site** table that must be publicly
   readable still needs an explicit `*_public_read` policy — it renders
   empty until then (fail-visible, by design).

## Admin components

Any new component path referenced in the config or a field
(`'/components/X#X'`) requires `npm run generate:importmap` and **committing
the regenerated importMap.js** — `next build` does not do it, and the
component silently renders empty (PublishedCell incident).

## Tenant onboarding

```
DATABASE_URI="$DATABASE_URI_PROD" npx tsx scripts/create-tenant.ts \
  --name "Clinic X" --slug clinicx --domain clinicx.serviettelab.com \
  --admin-email owner@clinicx.example
```

Creates the tenant (all modules subscribed → entitlements computed) and a
tenant-admin with a one-time password. Then: add the domain on the Render
service (+ DNS CNAME), optionally a logo in `src/components/AdminBrand.tsx`.
Host pinning, branded login, scoped nav and API all key off the domain —
no further code changes.

Users: a non-super-admin **must** belong to a tenant — saving one without a
membership is refused (an account with no tenant sees "Nothing found"
everywhere; enforced after the Borin lockout).

## Protecting staff edits (since 2026-10-20)

Legacy bulk writes are retired on shared databases. The guard runs before
Payload opens the destination database. `--apply` and `--force` do not bypass it.
Protected commands:

- `sync-roomchang.ts`, `seed-homepage.ts`, `reconcile-live.ts --apply`
- `convert-sections-to-blocks.ts`, `align-feature-cards-locales.ts`,
  `align-homepage-locales.ts`, `copy-doctor-names.ts`, `restore-doctor-names-en.ts`
- `seed-initial-versions.ts`, `verify-editor-access.ts`, `functional-battery.ts`

`npx tsx scripts/reconcile-live.ts` remains available as a read-only dry run.
Review differences per document with the content owner; do not replace the CMS
from the older live-site snapshot. Any migration/cutover that changes content
needs a reviewed plan, a verified backup and the content owner's approval.

For deliberately disposable local SQLite fixtures only, a legacy command can
be unlocked explicitly (never use a shared or valuable file):

```sh
DATABASE_URI=file:./disposable-import.db NODE_ENV=development \
  npx tsx scripts/convert-sections-to-blocks.ts --allow-local-content-overwrite
```

The override requires an explicit `file:` destination and a non-production
environment. It cannot unlock PostgreSQL or remote libSQL destinations. This
CLI policy does not protect against arbitrary SQL, older checkouts or new
unguarded scripts; normal access controls and migration review still apply.

Making a field localized on an existing collection: the generated migration
DROPS the old column before adding the locales column — hand-insert
`UPDATE locales SET col = parent.col … WHERE _locale='en'` (plus INSERT for
missing rows) ahead of the drops, for the `_v` tables too
(20260914_043717 is the template). Push the code in the SAME step as
applying the migration: between the two, the API for that collection is down.

## Verifying after a deploy

- Run the regression tests and isolated, self-cleaning editorial fixtures:

  ```sh
  npx tsx --test tests/*.test.ts
  DATABASE_URI=file:./content-protection-demo.db PAYLOAD_SECRET=local-test-only \
    npx tsx scripts/verify-content-protection.ts
  DATABASE_URI=file:./publishing-ux-demo.db PAYLOAD_SECRET=local-test-only \
    npx tsx scripts/verify-publishing-ux.ts
  ```

  Each fixture refuses other database destinations. Do not use the retired
  production smoke-test commands: their updates to existing records can
  replace a saved draft even if they subsequently restore the published title.

- `https://<tenant>.serviettelab.com/admin/login` → 200/307, tenant-branded.
- Anonymous isolation: tenant host `/api/services?limit=1` returns docs;
  `https://serviettelab.com/api/services` returns a 403-style refusal.
- Sandbox renders: `/en`, `/en/services`, a service detail, and the demo
  custom page `/en/welcome-to-roomchang` (Media Library image from R2).
- `get_advisors(security)` on both Supabase projects: WARN-free; the many
  `rls_enabled_no_policy` INFOs on CMS tables are the deny-all design.

## Drafts & publishing (since 2026-09-09)

- Every editorial collection has Payload versions with drafts. **Save draft**
  writes a version only; the parent row keeps the last published content, so
  the public API and sandbox keep serving what was published. **Publish**
  updates the parent (`_status = published`). Never-published docs have
  `_status = draft` and are filtered out for anonymous readers in
  `module-gating` — Payload does not do this by itself.
- Each document retains **up to 100 revisions**, including draft and published
  saves. Editors can inspect and restore them through Versions. This is bounded
  history, not an independent backup; raising the cap cannot recover revisions
  already pruned under the old limit of 20. Database and media backup/restore
  must be verified separately before a production cutover.
- Recovery evidence and the code-versus-database rollback procedure are in
  [Test Release and Recovery Verification](cms-release-recovery-20261022.md).
  The 22 October rehearsal restored the CMS public schema and Roomchang media
  into isolation. It does not certify recurring provider backups or authorize
  a production restore. Never store database dumps or environment secrets in
  the public R2 media bucket.
- The legacy `published` checkbox is hidden, not dropped; its values were
  backfilled into `_status`. Backfill lesson: the migration adds `_status`
  with **DEFAULT 'draft'** — backfill ALL rows, never `WHERE _status IS NULL`.
- Draft preview on the sandbox: the CMS Live Preview URL goes through
  `roomchang-sandbox.vercel.app/api/preview?secret=…&redirect=…` (Next draft
  mode). The site then fetches with `draft=true` as the service user
  `preview@serviettelab.com` (API key, tenant-1 editor). Secrets:
  `PREVIEW_SECRET` on Render = `PAYLOAD_PREVIEW_SECRET` on the sandbox;
  `PAYLOAD_PREVIEW_API_KEY` on the sandbox. Rotate the key with
  `scripts/create-preview-user.ts` (prints once), then update the Vercel env.
- Draft-mode reads come from the versions tables. Historical initial-version
  seeding is now guarded; enabling drafts on another collection requires a
  reviewed migration that preserves existing drafts and published content.
- API keys are hashed with `PAYLOAD_SECRET`. A key issued from a machine whose
  `.env` secret differs from Render's never authenticates — issue keys with
  `PAYLOAD_SECRET` set to the production value.
- Test draft/save/publish/restore with the isolated fixtures above, not by
  impersonating an editor and writing to their existing documents.

## Localized statistics (2026-10-20)

`site-stats.displayValue`, `suffix` and `label` are language-specific; the
numeric count remains shared. A record's Appears on field and preview target
come from `src/lib/stat-pages.ts`. Clinical experience belongs to Clinical
Results, not the home page; homepage years of experience is a separate record.
Publishing defaults to the active language rather than publishing saved drafts
from other languages. Publishing all languages remains an explicit submenu action.

Migration `20261020_095018_stat_values_localized` copies each existing parent
and version's own display value/suffix into all locales, without changing
labels, statuses, IDs or timestamps. It retains the original global columns
as recovery data. `originalDisplayValue` records pre-migration formatting so
the homepage continues its existing count-up output until a localized display
value changes. The raw legacy columns are not used for future editing.

Do not run migration down or roll back to old code after staff start using
localized values: that would hide their newer edits. The down function refuses
destructive removal. Use a reviewed forward recovery instead. New schema
snapshots describe the active schema; do not manually drop the retained columns
as incidental cleanup.

Verification fixtures refuse shared destinations:

```sh
DATABASE_URI=file:./stat-locales-demo.db PAYLOAD_SECRET=local-test-only \
  npx tsx scripts/verify-stat-locales.ts
MIGRATION_TEST_DATABASE_URI=postgres://cms_fixture@127.0.0.1:55438/postgres \
  npx tsx scripts/verify-stat-migration.ts
```

The Postgres fixture requires a disposable local server with that test user;
it creates/removes only `stat_migration_fixture`. For hosted tests, use a
record with no saved draft, capture the published baseline, publish a temporary
change in one locale, verify other locales, then restore only that locale.

## Known deliberate limits (v1)

- Enquiries and Booking Slots in the CMS are read-only snapshots from the last
  approved import, not a live inbox or availability manager. They may be stale;
  CMS timestamps and read flags do not establish freshness in Supabase. Manage
  new enquiries, read status, bookings, cancellations and availability in the
  clinic dashboard. Normal CMS/API create, update and delete are denied;
  trusted Local API imports may still explicitly bypass access checks with
  `overrideAccess`. This is not permission to run a legacy import.
- Live Preview selects the record's website route and active URL locale
  (`en`, `kh`, `cn`). Comparison sets open either the implants comparison or
  full international comparison; rows resolve their set relationship with the
  current request and access checks. Missing/inaccessible sets offer no preview
  instead of silently opening the main price list. Draft mode still requires
  the matching preview secrets and website preview credentials; without the
  CMS preview secret configured, the URL opens the ordinary published page.
- Known imported branches retain the website's canonical source-ID-based
  routes, not their name-derived CMS slugs. Keep the resolver's branch identity
  map aligned with `SOURCE_BRANCH_SLUGS` in the website's `src/lib/branches.ts`.
  Comparison-row preview and website grouping follow the current CMS set
  relationship. A cleared relationship remains unassigned; legacy source IDs
  are fallback provenance only when no relationship field is present.
- Correct preview routing does not prove a page consumes CMS data. In the
  website source, Publications, Careers and Dentist Talks consume CMS records
  in Payload mode, as do branch details (with bundled branch-field fallbacks).
  Dentist Talks consumes only videos categorized `dentist-talk`; other video
  categories have no connected page consumer or preview. Existing CMS coverage
  does not yet match the bundled public video catalog, so review missing
  records before production cutover rather than replaying an old import.
- Media serves from `r2.dev` (rate-limited dev domain) — move to a custom
  domain before real multi-tenant traffic.
- The demo tenant "Oriental Bank" is display-only; rename or delete from
  the platform cockpit when decided.
