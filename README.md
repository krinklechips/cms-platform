# EP CMS Platform

A **multi-tenant SaaS CMS** that serves all client websites from a single Render instance. Each client gets their own subdomain (`clientname.serviettelab.com`) with isolated content, branding, SEO tools, and keyword tracking.

---

## Architecture Overview

```
Browser (client or admin)
        │
        ▼
Cloudflare Worker (*.serviettelab.com/*)
  - Proxies all traffic to Render
  - Sets x-forwarded-host header so Render knows which tenant is being accessed
  - Passes 302 redirects through to browser (redirect: 'manual')
        │
        ▼
Render Web Service  (cms-platform-ap62.onrender.com)
  Node.js / Express  ·  SQLite (persistent disk)
        │
        ├── /platform-admin  →  Platform Admin React SPA
        │     Manage tenants, branding, users, onboarding
        │     Host: serviettelab.com (PLATFORM_ADMIN_HOSTS)
        │
        ├── /tenant-dashboard  →  Tenant React SPA
        │     Content, SEO, media, integrations per client
        │     Host: *.serviettelab.com (tenant host)
        │
        └── /api  →  Express API
              /api/platform/*   Platform admin routes (requirePlatformAdmin)
              /api/tenant/*     Tenant-scoped routes (requireTenantSession)
              /api/public/*     Public read-only routes (no auth, CORS open)
```

---

## How Multi-Tenancy Works

**Host-based routing** — the Express middleware (`attachHostContext`) reads the `x-forwarded-host` header set by the Cloudflare Worker and resolves:

| Host | Mode | What loads |
|---|---|---|
| `serviettelab.com` | platform | Platform admin SPA + platform API |
| `clientname.serviettelab.com` | tenant | Tenant dashboard SPA + tenant API |
| `cms-platform-ap62.onrender.com` | platform | Direct Render URL (platform admin) |

Tenant subdomains are matched against `tenant_branding.cms_domain` in the database.

---

## Production Infrastructure

| Service | Purpose |
|---|---|
| **Render** (`cms-platform-ap62.onrender.com`) | Single Express server + SQLite DB + file uploads |
| **Cloudflare Worker** (`cms-router`) on `serviettelab.com` | Wildcard proxy — handles all client subdomains forever, no per-client Render domains needed |
| **SerpBear** (`epcms-serpbear.onrender.com`) | Keyword rank tracking, shared across all tenants |
| **Serper.dev** | Google search scraper API for SerpBear (free tier: 2,500/mo) |
| **Cloudflare R2** | Tenant media uploads (long-term) |

**Why Cloudflare Worker instead of Render custom domains:** Render's free plan allows only 2 custom domains. The Worker handles `*.serviettelab.com` wildcard for free, routing every tenant subdomain to the same Render service via `x-forwarded-host`.

---

## Key Env Vars (Render)

| Var | Purpose |
|---|---|
| `PLATFORM_ADMIN_HOSTS` | Comma-separated hostnames treated as platform admin (e.g. `serviettelab.com,cms-platform-ap62.onrender.com`) |
| `SESSION_SECRET` | Express session signing key |
| `BOOTSTRAP_SECRET` | One-time platform admin login secret |
| `PLATFORM_OWNER_EMAIL` | Seed email for platform admin user |
| `DB_PATH` | SQLite file path (on persistent disk, e.g. `/var/data/cms.db`) |
| `UPLOADS_DIR` | Media upload directory (on persistent disk) |
| `CORS_ORIGINS` | Allowed cross-origin hosts |

---

## Database Schema (SQLite)

```
users                   — shared user pool (platform admins + tenant users)
platform_admins         — marks users as platform admins (role: owner/admin)
tenants                 — one row per client
tenant_branding         — logo, colors, cms_domain, public_site_url per tenant
tenant_memberships      — links users to tenants with a role
tenant_settings         — arbitrary JSON settings per tenant
tenant_onboarding       — per-step onboarding status per tenant
articles                — tenant-scoped blog/news articles
pages                   — tenant-scoped CMS pages
media                   — tenant-scoped media uploads
seo_page_meta           — per-URL title/description/OG/JSON-LD overrides
seo_keywords            — keyword tracking entries (linked to SerpBear)
seo_redirects           — 301/302 redirect rules
team_members            — tenant team bios
testimonials            — tenant testimonials
services                — tenant service listings
product_lines           — tenant product catalogue
annual_reports          — tenant annual report PDFs
contact_settings        — tenant contact page config
placements              — platform-level content placements
tenant_integrations     — SerpBear / Lighthouse config per tenant
```

---

## Tenant Onboarding Flow

10-step checklist tracked per tenant in `tenant_onboarding`:

| Step | Auto-detected? |
|---|---|
| Tenant Created | ✅ Always complete |
| CMS Domain Configured | ✅ Checks `tenant_branding.cms_domain` |
| DNS / CNAME Verified | ❌ Manual — triggers real DNS lookup via Node `dns/promises` |
| Admin User Invited | ✅ Checks `tenant_memberships` count |
| Client First Login | ✅ Checks `users.last_login_at` via membership join |
| Branding Set Up | ✅ Checks logo_url + primary_color |
| Website URL Set | ✅ Checks `public_site_url` |
| First Content Created | ✅ Checks articles + pages count |
| SEO Configured | ✅ Checks `seo_page_meta` count |
| Go Live | ❌ Manual — platform admin marks when client is live |

---

## Auth Flows

### Platform Admin
- **Login**: `POST /api/platform/auth/login` (email + password)
- **Force password change**: Users provisioned with `must_change_password=1` are redirected to `/change-password` on first login
- **Bootstrap login** (fallback): `POST /api/platform/auth/bootstrap-login` using `BOOTSTRAP_SECRET`

### Tenant Users
- **Login**: `POST /api/tenant/auth/login`
- **Force password change**: Same `must_change_password` flag — prompts on first login
- Provisioned by platform admin with a temporary password

---

## DNS Setup for a New Client

1. Platform admin creates tenant and sets CMS domain (e.g. `macadent.serviettelab.com`)
2. Send client their CNAME record:
   - **Type**: CNAME
   - **Name**: `macadent` (subdomain prefix)
   - **Value**: `your-cms-platform.onrender.com`
3. Use "Check DNS Now" in the Onboarding tab to verify resolution
4. The Cloudflare Worker automatically handles routing — no extra Render domain needed

> **Migrating an existing client** (e.g. `cms.macadent.com.my` → `macadent.serviettelab.com`):
> Update `cms_domain` in platform admin branding tab → remove old Render custom domain → update client's DNS CNAME

---

## Local Development

```bash
# Install
npm install
cd client && npm install && cd ..

# Run (server on :4100, Vite on :5173)
npm run dev

# Build client for production
npm run build:client

# Dev login (dev only — skips password)
curl -X POST http://localhost:4100/api/platform/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}' \
  -c /tmp/cookies.txt
```

Access:
- Platform admin: `http://localhost:4100/platform-admin/` (or proxied via Vite at `http://localhost:5173/platform-admin/`)
- Tenant dashboard: `http://localhost:4100/tenant-dashboard/`

---

## SerpBear Integration

SerpBear is deployed separately on Render at `epcms-serpbear.onrender.com`.

- Tenants link their SerpBear domain + API key in **Integrations** settings
- Keywords are managed in SerpBear; the CMS **Keyword Tracking** page reads rankings via SerpBear API
- Scraping uses Serper.dev (set `SERPER_API_KEY` in SerpBear env vars)

SerpBear env vars: `USER_NAME`, `PASSWORD`, `SECRET`, `APIKEY`, `NEXT_PUBLIC_APP_URL`

---

## Project Structure

```
cms-platform/
├── server/
│   ├── index.js              Entry point, Express setup, route registration
│   ├── db.js                 SQLite schema + migrations (ensureColumn pattern)
│   ├── config/env.js         Env var validation
│   ├── middleware/
│   │   ├── hostContext.js    Resolves platform vs tenant from request host
│   │   ├── requirePlatformAdmin.js
│   │   └── requireTenantSession.js
│   ├── routes/
│   │   ├── platform*.js      Platform admin API routes
│   │   ├── tenant*.js        Tenant-scoped API routes
│   │   └── public*.js        Public read-only API routes
│   └── auth/passwords.js     bcrypt hash/verify helpers
│
├── client/
│   └── src/
│       ├── app/
│       │   ├── components/   Shared UI + layout components
│       │   ├── pages/
│       │   │   ├── platform/ Platform admin pages
│       │   │   └── tenant/   Tenant dashboard pages
│       │   └── routers/      React Router configs (platform + tenant)
│       └── lib/
│           ├── api.ts        Fetch wrapper
│           ├── auth-context.tsx  Platform auth state
│           └── query-client.ts   TanStack Query setup
│
└── public/                   Built client assets (committed, served by Express)
    ├── platform-admin/
    ├── tenant-dashboard/
    └── tenant-login/
```
