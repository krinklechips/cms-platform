# Serviette CMS — Operations Runbook

The rules that keep production healthy. Every one of these exists because its
absence broke something once.

## Architecture (one-way, by design)

```
LIVE SITE (roomchang.com ← clinic Supabase, current public content)
   X  legacy live→CMS imports blocked once staff editing has begun
CMS (this app, Render: serviettelab.com + <tenant>.serviettelab.com, own Supabase DB)
   │  REST API, anonymous reads TENANT-HOST ONLY (published, tenant-scoped)
   ▼
SANDBOX / UAT (roomchang-sandbox.vercel.app, CONTENT_SOURCE=payload)
```

- **Nothing the CMS does can touch the live site.** There is no CMS→live path
  until an explicit cutover is built. Never point the live Vercel project at
  `CONTENT_SOURCE=payload`.
- **The CMS owns staff editorial work.** The separate live-site database is
  not a safe source for replacing CMS records after Borin starts editing.
  Database separation alone does not prevent an import from overwriting edits.
- Anonymous API access: a host that maps to **no tenant** (serviettelab.com
  included) is **denied** in production. Consumers must call their tenant
  host. Local dev (`localhost`) keeps published-only reads.

## Deploys

- Repo: github.com/krinklechips/cms-platform → Render service `cms-platform`
  (srv-d6efr43uibrs73daurj0). Push to `main` = deploy (~4 min).
- Start chain: `payload migrate && node scripts/verify-migrations.mjs && next start`.
  The verify step **fails the deploy** if any migration file is unapplied —
  Render's own migrate has twice no-opped silently. A red deploy here means:
  apply migrations locally (below), then redeploy.
- The sandbox's production branch is **`cms-sandbox`** on the *roomchang*
  repo, not `main`. Pushing site-side changes: `git push origin main:cms-sandbox` too.

## Migrations — the four rules

1. Generate AND run with the **full prod env, including R2_\***
   (`serviette-cms/.env`). Without R2 vars the storage plugin doesn't
   register and the diff tries to `DROP COLUMN media.prefix`.
2. `DATABASE_URI="$DATABASE_URI_PROD" npx payload migrate:create <name>` —
   then **read the generated SQL** before running it (destructive statements
   belong only in `down()`).
3. Apply locally: `DATABASE_URI="$DATABASE_URI_PROD" npm run migrate`, then
   check `payload_migrations` gained the row. Do **not** rely on Render.
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

- Enquiries/Bookings in the CMS are stale snapshots from the last sync —
  the live inbox stays in the clinic dashboard.
- Media serves from `r2.dev` (rate-limited dev domain) — move to a custom
  domain before real multi-tenant traffic.
- The demo tenant "Oriental Bank" is display-only; rename or delete from
  the platform cockpit when decided.
