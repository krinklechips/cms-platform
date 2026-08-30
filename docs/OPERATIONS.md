# Serviette CMS — Operations Runbook

The rules that keep production healthy. Every one of these exists because its
absence broke something once.

## Architecture (one-way, by design)

```
LIVE SITE (roomchang.com ← clinic Supabase, source of truth)
   │  one-way manual sync (scripts/sync-roomchang.ts — CLOBBERS CMS edits)
   ▼
CMS (this app, Render: serviettelab.com + <tenant>.serviettelab.com, own Supabase DB)
   │  REST API, anonymous reads TENANT-HOST ONLY (published, tenant-scoped)
   ▼
SANDBOX / UAT (roomchang-sandbox.vercel.app, CONTENT_SOURCE=payload)
```

- **Nothing the CMS does can touch the live site.** There is no CMS→live path
  until an explicit cutover is built. Never point the live Vercel project at
  `CONTENT_SOURCE=payload`.
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

## Verifying after a deploy

- `https://<tenant>.serviettelab.com/admin/login` → 200/307, tenant-branded.
- Anonymous isolation: tenant host `/api/services?limit=1` returns docs;
  `https://serviettelab.com/api/services` returns a 403-style refusal.
- Sandbox renders: `/en`, `/en/services`, a service detail, and the demo
  custom page `/en/welcome-to-roomchang` (Media Library image from R2).
- `get_advisors(security)` on both Supabase projects: WARN-free; the many
  `rls_enabled_no_policy` INFOs on CMS tables are the deny-all design.

## Known deliberate limits (v1)

- No drafts/preview-before-publish: `published` is the only gate; the
  sandbox site is the preview. Payload versions are the v2 path.
- Enquiries/Bookings in the CMS are stale snapshots from the last sync —
  the live inbox stays in the clinic dashboard.
- Media serves from `r2.dev` (rate-limited dev domain) — move to a custom
  domain before real multi-tenant traffic.
- The demo tenant "Oriental Bank" is display-only; rename or delete from
  the platform cockpit when decided.
