# CMS Platform (Phase 1)

This is a **separate project scaffold** for a future white-label / multi-customer CMS platform.
It does **not** modify Kardal's current production CMS code.

## What Phase 1 includes

- `tenants` table (customers)
- tenant branding (`tenant_branding`)
- shared users + `platform_admins`
- tenant memberships (`tenant_memberships`)
- tenant-scoped `articles` and `media` tables (`tenant_id`)
- platform admin tenant management API (`/api/platform/tenants`)
- tenant context middleware (`x-tenant-id` or `x-tenant-slug`)
- demo tenant-scoped article API (`/api/tenant/articles`)
- seed data for a `kardal` tenant (keeps Kardal as one tenant inside the future platform model)

## What Phase 1 intentionally does NOT include yet

- real password auth / invite flow migration
- tenant admin UI (React)
- platform super-admin dashboard UI
- billing/subscriptions
- domain provisioning automation

## Local setup

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
npm install
```

3. Run:

```bash
npm run dev
```

4. Dev-login as seeded platform owner (dev-only route):

```bash
curl -X POST http://localhost:4100/api/platform/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}' \
  -c /tmp/platform-cookies.txt
```

5. List tenants:

```bash
curl http://localhost:4100/api/platform/tenants -b /tmp/platform-cookies.txt
```

## Phase 2 (recommended next)

1. Build a small `Platform Admin` UI (`/platform-admin`) to:
   - create/edit tenants
   - manage branding (logo/colors/domain)
   - invite tenant admins
   - enable/disable features
2. Introduce real auth (password + reset or magic-link)
3. Add tenant-scoped versions of media/articles/users routes from your current Kardal CMS
4. Move email templates/branding to tenant settings
5. Add audit log + usage metrics

## Infra guidance (for your next moves)

### GitHub
- Create a **new repo** for this platform (do not mix with `kardal-homepage` while stabilizing).
- Keep Kardal site/CMS repo as-is.
- Suggested repo name: `white-label-cms-platform` or `multi-tenant-cms-core`.

### Render
- Start with **one Render web service** for the platform API (this project).
- Attach a **persistent disk** for the SQLite DB (`PLATFORM_DB_PATH`).
- Later add a second service for the platform admin frontend (or host frontend on Vercel).

### Vercel
- Use Vercel later for the **platform admin frontend** (React app), not required in Phase 1.
- Keep it separate from Kardal marketing site deployment.

### Cloudflare
- Keep using R2 for tenant media (good long-term choice).
- For the platform, use either:
  - one shared bucket with tenant prefixes (`tenant/<slug>/...`) (simpler), or
  - one bucket per tenant (cleaner isolation, more ops overhead)
- Add custom domains later when you support tenant CMS subdomains.

## Security note (important)

Every tenant-facing route must filter by `tenant_id`. This scaffold demonstrates that pattern in `/api/tenant/articles`.
Do not build the platform admin UI before enforcing tenant scoping consistently across all content/media/user routes.
