import { Router } from 'express';
import dns from 'dns/promises';
import { db } from '../db.js';
import { requirePlatformHost } from '../middleware/hostContext.js';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin.js';

const router = Router();
router.use(requirePlatformHost, requirePlatformAdmin);

const STEPS = [
  { key: 'tenant_created',       label: 'Tenant Created',          description: 'Tenant account has been created in the platform.' },
  { key: 'cms_domain_set',       label: 'CMS Domain Configured',   description: 'A CMS subdomain has been assigned (e.g. client.epcms.com).' },
  { key: 'dns_verified',         label: 'DNS / CNAME Verified',    description: 'The CMS domain resolves correctly to this server.' },
  { key: 'admin_invited',        label: 'Admin User Invited',      description: 'At least one user has been provisioned for the tenant.' },
  { key: 'client_logged_in',     label: 'Client First Login',      description: 'The client has logged into their CMS for the first time.' },
  { key: 'branding_configured',  label: 'Branding Set Up',         description: 'Logo and brand colours have been configured.' },
  { key: 'website_url_set',      label: 'Website URL Set',         description: 'The public website URL has been linked to the tenant.' },
  { key: 'first_content',        label: 'First Content Created',   description: 'At least one page or article has been created.' },
  { key: 'seo_configured',       label: 'SEO Configured',          description: 'At least one SEO page meta entry has been set up.' },
  { key: 'go_live',              label: 'Go Live',                 description: 'Client has been handed over and is live.' },
];

function computeStepStatus(tenantId, overrides) {
  const branding = db.prepare('SELECT * FROM tenant_branding WHERE tenant_id = ?').get(tenantId);
  const memberCount = db.prepare('SELECT COUNT(*) as c FROM tenant_memberships WHERE tenant_id = ?').get(tenantId)?.c || 0;
  const articleCount = db.prepare('SELECT COUNT(*) as c FROM articles WHERE tenant_id = ? AND status = "published"').get(tenantId)?.c || 0;
  const pageCount = db.prepare('SELECT COUNT(*) as c FROM pages WHERE tenant_id = ?').get(tenantId)?.c || 0;
  const seoCount = db.prepare('SELECT COUNT(*) as c FROM seo_page_meta WHERE tenant_id = ?').get(tenantId)?.c || 0;

  // Check if any tenant member has logged in
  const loggedIn = db.prepare(`
    SELECT COUNT(*) as c FROM users u
    JOIN tenant_memberships tm ON u.id = tm.user_id
    WHERE tm.tenant_id = ? AND u.last_login_at IS NOT NULL
  `).get(tenantId)?.c || 0;

  const auto = {
    tenant_created:      'complete',
    cms_domain_set:      branding?.cms_domain ? 'complete' : 'pending',
    dns_verified:        overrides.dns_verified?.status || 'pending',
    admin_invited:       memberCount > 0 ? 'complete' : 'pending',
    client_logged_in:    loggedIn > 0 ? 'complete' : 'pending',
    branding_configured: (branding?.logo_url && branding?.primary_color) ? 'complete' : 'pending',
    website_url_set:     branding?.public_site_url ? 'complete' : 'pending',
    first_content:       (articleCount + pageCount) > 0 ? 'complete' : 'pending',
    seo_configured:      seoCount > 0 ? 'complete' : 'pending',
    go_live:             overrides.go_live?.status || 'pending',
  };

  return STEPS.map((step) => ({
    ...step,
    status: overrides[step.key]?.status || auto[step.key] || 'pending',
    notes: overrides[step.key]?.notes || null,
    completedAt: overrides[step.key]?.completed_at || null,
    auto: !['dns_verified', 'go_live'].includes(step.key),
  }));
}

// GET /api/platform/tenants/:id/onboarding
router.get('/tenants/:id/onboarding', (req, res) => {
  const tenantId = Number(req.params.id);
  const tenant = db.prepare('SELECT id FROM tenants WHERE id = ?').get(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const rows = db.prepare('SELECT * FROM tenant_onboarding WHERE tenant_id = ?').all(tenantId);
  const overrides = Object.fromEntries(rows.map((r) => [r.step, r]));
  const steps = computeStepStatus(tenantId, overrides);
  const completed = steps.filter((s) => s.status === 'complete').length;

  return res.json({ ok: true, steps, progress: { completed, total: steps.length } });
});

// POST /api/platform/tenants/:id/onboarding/:step/complete
router.post('/tenants/:id/onboarding/:step/complete', (req, res) => {
  const tenantId = Number(req.params.id);
  const { step } = req.params;
  const { notes } = req.body;
  if (!STEPS.find((s) => s.key === step)) return res.status(400).json({ error: 'Unknown step' });

  db.prepare(`
    INSERT INTO tenant_onboarding (tenant_id, step, status, notes, completed_at, updated_at)
    VALUES (?, ?, 'complete', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id, step) DO UPDATE SET
      status = 'complete', notes = excluded.notes,
      completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
  `).run(tenantId, step, notes || null);

  return res.json({ ok: true });
});

// POST /api/platform/tenants/:id/onboarding/:step/reset
router.post('/tenants/:id/onboarding/:step/reset', (req, res) => {
  const tenantId = Number(req.params.id);
  const { step } = req.params;
  db.prepare('DELETE FROM tenant_onboarding WHERE tenant_id = ? AND step = ?').run(tenantId, step);
  return res.json({ ok: true });
});

// POST /api/platform/tenants/:id/onboarding/check-dns
router.post('/tenants/:id/onboarding/check-dns', async (req, res) => {
  const tenantId = Number(req.params.id);
  const branding = db.prepare('SELECT cms_domain FROM tenant_branding WHERE tenant_id = ?').get(tenantId);
  if (!branding?.cms_domain) return res.status(400).json({ error: 'No CMS domain configured' });

  let hostname = branding.cms_domain.trim();
  if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
    hostname = new URL(hostname).hostname;
  }

  try {
    const addresses = await dns.resolve(hostname, 'CNAME').catch(() => null)
      || await dns.resolve(hostname, 'A').catch(() => null);

    const resolved = addresses && addresses.length > 0;
    const status = resolved ? 'complete' : 'pending';
    const notes = resolved ? `Resolved: ${addresses.join(', ')}` : 'DNS not yet resolving';

    db.prepare(`
      INSERT INTO tenant_onboarding (tenant_id, step, status, notes, completed_at, updated_at)
      VALUES (?, 'dns_verified', ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(tenant_id, step) DO UPDATE SET
        status = excluded.status, notes = excluded.notes,
        completed_at = excluded.completed_at, updated_at = CURRENT_TIMESTAMP
    `).run(tenantId, status, notes, resolved ? new Date().toISOString() : null);

    return res.json({ ok: true, resolved, hostname, addresses: addresses || [], status });
  } catch (err) {
    return res.json({ ok: true, resolved: false, hostname, addresses: [], status: 'pending', error: err.message });
  }
});

export default router;
