import express from 'express';
import { db } from '../db.js';

const router = express.Router();

function resolveTenant(req) {
  const tenantSlug = req.query.tenantSlug ? String(req.query.tenantSlug) : null;
  const tenantId = req.query.tenantId ? Number(req.query.tenantId) : null;
  if (!tenantSlug && !tenantId) return { error: 'tenantSlug or tenantId query parameter is required' };

  const tenant = tenantSlug
    ? db.prepare(`
        SELECT t.id, t.slug, t.name, t.status, b.logo_url, b.primary_color, b.support_email, b.public_site_url
        FROM tenants t
        LEFT JOIN tenant_branding b ON b.tenant_id = t.id
        WHERE t.slug = ?
      `).get(tenantSlug)
    : db.prepare(`
        SELECT t.id, t.slug, t.name, t.status, b.logo_url, b.primary_color, b.support_email, b.public_site_url
        FROM tenants t
        LEFT JOIN tenant_branding b ON b.tenant_id = t.id
        WHERE t.id = ?
      `).get(tenantId);

  if (!tenant || tenant.status !== 'active') return { error: 'Tenant not found', status: 404 };
  return { tenant };
}

function readNavigationTabs(tenantId) {
  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
  if (!row?.settings_json) return [];
  try {
    const parsed = JSON.parse(row.settings_json || '{}') || {};
    if (!Array.isArray(parsed.navigationTabs)) return [];
    return parsed.navigationTabs
      .map((tab, index) => ({
        id: String(tab?.id || `${tenantId}-${index}`),
        label: String(tab?.label || '').trim(),
        href: String(tab?.href || '').trim(),
        group: String(tab?.group || 'general').trim() || 'general',
        visible: tab?.visible !== false,
        order: Number.isFinite(Number(tab?.order)) ? Number(tab.order) : index,
      }))
      .filter((tab) => tab.visible && tab.label)
      .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  } catch {
    return [];
  }
}

router.get('/navigation-tabs', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const tenant = resolved.tenant;
  const navigationTabs = readNavigationTabs(tenant.id);

  return res.json({
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      branding: {
        logoUrl: tenant.logo_url || null,
        primaryColor: tenant.primary_color || null,
        supportEmail: tenant.support_email || null,
        publicSiteUrl: tenant.public_site_url || null,
      },
    },
    navigationTabs,
  });
});

export default router;
