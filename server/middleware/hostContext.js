import { db } from '../db.js';
import { env } from '../config/env.js';

function normalizeHost(value) {
  if (!value) return null;
  let host = String(value).trim().toLowerCase();
  if (!host) return null;

  if (host.includes(',')) {
    host = host.split(',')[0].trim();
  }
  if (host.startsWith('http://') || host.startsWith('https://')) {
    try {
      host = new URL(host).host;
    } catch {
      host = host.replace(/^https?:\/\//, '').split('/')[0];
    }
  }
  host = host.split('/')[0].trim();
  if (host.startsWith('[') && host.includes(']')) {
    host = host.slice(1, host.indexOf(']'));
  } else if (host.includes(':')) {
    host = host.split(':')[0];
  }
  return host || null;
}

function buildPlatformHostSet() {
  const hosts = new Set(['localhost', '127.0.0.1']);
  const configured = Array.isArray(env.PLATFORM_ADMIN_HOSTS) ? env.PLATFORM_ADMIN_HOSTS : [];
  configured.forEach((host) => {
    const normalized = normalizeHost(host);
    if (normalized) hosts.add(normalized);
  });
  const renderHost = normalizeHost(process.env.RENDER_EXTERNAL_HOSTNAME || '');
  if (renderHost) hosts.add(renderHost);
  return hosts;
}

const platformHosts = buildPlatformHostSet();

function mapTenant(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    branding: {
      logoUrl: row.logo_url || null,
      primaryColor: row.primary_color || null,
      supportEmail: row.support_email || null,
      publicSiteUrl: row.public_site_url || null,
      cmsDomain: row.cms_domain || null,
    },
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getTenantByCmsHost(host) {
  if (!host) return null;
  const rows = db.prepare(`
    SELECT
      t.id, t.slug, t.name, t.status,
      b.logo_url, b.primary_color, b.support_email, b.public_site_url, b.cms_domain
    FROM tenants t
    JOIN tenant_branding b ON b.tenant_id = t.id
    WHERE b.cms_domain IS NOT NULL AND TRIM(b.cms_domain) <> ''
  `).all();

  for (const row of rows) {
    const cmsHost = normalizeHost(row.cms_domain);
    if (cmsHost && cmsHost === host) {
      return mapTenant(row);
    }
  }
  return null;
}

export function attachHostContext(req, res, next) {
  const forwardedHost = req.headers['x-forwarded-host'];
  const requestHost = normalizeHost(forwardedHost || req.headers.host || '');
  const tenant = getTenantByCmsHost(requestHost);

  let mode = 'unknown';
  if (requestHost && platformHosts.has(requestHost)) {
    mode = 'platform';
  } else if (tenant) {
    mode = 'tenant';
  }

  req.hostContext = {
    requestHost,
    mode,
    isPlatformHost: mode === 'platform',
    isTenantHost: mode === 'tenant',
    tenant,
  };
  res.locals.hostContext = req.hostContext;
  return next();
}

export function requirePlatformHost(req, res, next) {
  if (req.hostContext?.isPlatformHost) return next();
  return res.status(403).json({ error: 'Platform host required' });
}

export function requireTenantHost(req, res, next) {
  if (req.hostContext?.isTenantHost) return next();
  return res.status(403).json({ error: 'Tenant host required' });
}

export function blockPlatformAdminOnTenantHost(req, res, next) {
  if (!req.hostContext?.isTenantHost) return next();
  return res.redirect('/tenant-dashboard/login');
}

export function blockTenantLoginOnPlatformHost(req, res, next) {
  if (req.hostContext?.isTenantHost) return next();
  const mode = req.hostContext?.mode || 'unknown';
  if (mode === 'platform') return res.redirect('/platform-admin');
  const hostLabel = escapeHtml(req.hostContext?.requestHost || 'this host');
  return res.status(404).type('html').send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>CMS Host Not Mapped</title><style>body{font-family:system-ui,sans-serif;margin:0;background:#f8fafc;color:#0f172a}main{max-width:720px;margin:10vh auto;padding:24px}.card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px}h1{margin:0 0 8px;font-size:20px}p{margin:0;color:#64748b;line-height:1.5}</style></head>
<body><main><div class="card"><h1>Host not configured</h1><p><strong>${hostLabel}</strong> is not mapped to a platform admin host or tenant CMS domain yet.</p></div></main></body></html>`);
}

export function getHostContextDebug() {
  return {
    platformHosts: Array.from(platformHosts.values()).sort(),
  };
}
