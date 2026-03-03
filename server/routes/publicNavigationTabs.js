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
  const settings = readTenantSettings(tenantId);
  const siteSections = normalizePublicSiteSections(settings?.siteSections);
  const tabs = Array.isArray(settings.navigationTabs)
    ? settings.navigationTabs
    .map((tab, index) => ({
      id: String(tab?.id || `${tenantId}-${index}`),
      label: String(tab?.label || '').trim(),
      href: String(tab?.href || '').trim(),
      group: String(tab?.group || 'general').trim() || 'general',
      visible: tab?.visible !== false,
      order: Number.isFinite(Number(tab?.order)) ? Number(tab.order) : index,
    }))
    .filter((tab) => tab.visible && tab.label)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    : [];

  return ensureInsightsNavigationTab(tabs, siteSections, tenantId);
}

function readTenantSettings(tenantId) {
  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
  if (!row?.settings_json) return {};
  try {
    return JSON.parse(row.settings_json || '{}') || {};
  } catch {
    return {};
  }
}

function defaultPublicSiteSections() {
  return {
    homeInsights: {
      enabled: true,
      navbarEnabled: true,
      navbarOrder: 3,
      eyebrow: 'Insights',
      title: 'Latest updates from your CMS-powered editorial feed.',
      subtitle: 'This section reads published articles from the tenant CMS while keeping layout stable in site code.',
    },
  };
}

function normalizePublicSiteSections(input) {
  const defaults = defaultPublicSiteSections();
  const source = input && typeof input === 'object' ? input : {};
  const rawHomeInsights = source.homeInsights && typeof source.homeInsights === 'object' ? source.homeInsights : {};
  return {
    homeInsights: {
      enabled: Object.prototype.hasOwnProperty.call(rawHomeInsights, 'enabled')
        ? Boolean(rawHomeInsights.enabled)
        : true,
      navbarEnabled: Object.prototype.hasOwnProperty.call(rawHomeInsights, 'navbarEnabled')
        ? Boolean(rawHomeInsights.navbarEnabled)
        : Boolean(defaults.homeInsights.navbarEnabled),
      navbarOrder: (() => {
        const value = Object.prototype.hasOwnProperty.call(rawHomeInsights, 'navbarOrder')
          ? Number(rawHomeInsights.navbarOrder)
          : Number(defaults.homeInsights.navbarOrder);
        if (!Number.isFinite(value) || value < 0) return Number(defaults.homeInsights.navbarOrder) || 3;
        return Math.floor(value);
      })(),
      eyebrow: String(rawHomeInsights.eyebrow || '').trim() || defaults.homeInsights.eyebrow,
      title: String(rawHomeInsights.title || '').trim() || defaults.homeInsights.title,
      subtitle: String(rawHomeInsights.subtitle || '').trim() || defaults.homeInsights.subtitle,
    },
  };
}

function readSiteSections(tenantId) {
  const settings = readTenantSettings(tenantId);
  return normalizePublicSiteSections(settings?.siteSections);
}

function normalizePublicNavLink(input, index, fallbackPrefix) {
  const label = String(input?.label || '').trim();
  if (!label) return null;
  return {
    id: String(input?.id || `${fallbackPrefix}-${index}`),
    label,
    href: String(input?.href || '').trim(),
    visible: input?.visible !== false,
    order: Number.isFinite(Number(input?.order)) ? Number(input.order) : index,
    description: String(input?.description || '').trim() || null,
  };
}

function ensureInsightsNavItem(primary, siteSections, tenantId) {
  const list = Array.isArray(primary) ? [...primary] : [];
  const enabled = Boolean(siteSections?.homeInsights?.enabled) && Boolean(siteSections?.homeInsights?.navbarEnabled);
  if (!enabled) {
    return list.filter((item) => {
      const label = String(item?.label || '').trim().toLowerCase();
      const href = String(item?.href || '').trim().toLowerCase();
      return !(label === 'insights' || href === '/insights' || href.endsWith('/insights'));
    });
  }

  const hasInsights = list.some((item) => {
    const label = String(item?.label || '').trim().toLowerCase();
    const href = String(item?.href || '').trim().toLowerCase();
    return label === 'insights' || href === '/insights' || href.endsWith('/insights');
  });
  if (hasInsights) return list;

  const nextOrder = list.reduce((max, item) => {
    const order = Number(item?.order);
    return Number.isFinite(order) ? Math.max(max, order) : max;
  }, -1) + 1;
  const configuredOrder = Number(siteSections?.homeInsights?.navbarOrder);
  const targetOrder = Number.isFinite(configuredOrder) && configuredOrder >= 0
    ? Math.floor(configuredOrder)
    : nextOrder;

  list.push({
    id: `auto-insights-${tenantId}`,
    label: 'Insights',
    href: '/insights',
    visible: true,
    order: targetOrder,
    description: 'CMS-managed insights section',
    type: 'link',
    columns: [],
  });
  return list;
}

function ensureInsightsNavigationTab(tabs, siteSections, tenantId) {
  const list = Array.isArray(tabs) ? [...tabs] : [];
  const enabled = Boolean(siteSections?.homeInsights?.enabled) && Boolean(siteSections?.homeInsights?.navbarEnabled);
  if (!enabled) {
    return list.filter((item) => {
      const label = String(item?.label || '').trim().toLowerCase();
      const href = String(item?.href || '').trim().toLowerCase();
      return !(label === 'insights' || href === '/insights' || href.endsWith('/insights'));
    });
  }

  const hasInsights = list.some((item) => {
    const label = String(item?.label || '').trim().toLowerCase();
    const href = String(item?.href || '').trim().toLowerCase();
    return label === 'insights' || href === '/insights' || href.endsWith('/insights');
  });
  if (hasInsights) return list;

  const nextOrder = list.reduce((max, item) => {
    const order = Number(item?.order);
    return Number.isFinite(order) ? Math.max(max, order) : max;
  }, -1) + 1;
  const configuredOrder = Number(siteSections?.homeInsights?.navbarOrder);
  const targetOrder = Number.isFinite(configuredOrder) && configuredOrder >= 0
    ? Math.floor(configuredOrder)
    : nextOrder;

  list.push({
    id: `auto-insights-tab-${tenantId}`,
    label: 'Insights',
    href: '/insights',
    group: 'general',
    visible: true,
    order: targetOrder,
    description: 'CMS-managed insights section',
  });
  return list;
}

function readSiteNavigation(tenantId) {
  const settings = readTenantSettings(tenantId);
  const siteSections = normalizePublicSiteSections(settings?.siteSections);
  const source = settings?.siteNavigation && typeof settings.siteNavigation === 'object'
    ? settings.siteNavigation
    : {};

  const primary = Array.isArray(source.primary)
    ? source.primary
        .map((item, index) => {
          const link = normalizePublicNavLink(item, index, `top-${tenantId}`);
          if (!link) return null;
          const columns = Array.isArray(item?.columns)
            ? item.columns
                .map((col, colIndex) => {
                  const title = String(col?.title || '').trim();
                  const visible = col?.visible !== false;
                  const order = Number.isFinite(Number(col?.order)) ? Number(col.order) : colIndex;
                  const items = Array.isArray(col?.items)
                    ? col.items
                        .map((subItem, itemIndex) =>
                          normalizePublicNavLink(subItem, itemIndex, `col-${tenantId}-${index}-${colIndex}`),
                        )
                        .filter((subItem) => subItem && subItem.visible)
                        .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
                    : [];
                  if (!title && !items.length) return null;
                  return {
                    id: String(col?.id || `col-${tenantId}-${index}-${colIndex}`),
                    title,
                    visible,
                    order,
                    items,
                  };
                })
                .filter((col) => col && col.visible)
                .sort((a, b) => a.order - b.order || String(a.title || '').localeCompare(String(b.title || '')))
            : [];

          return {
            ...link,
            type: columns.length ? 'mega' : (item?.type === 'mega' ? 'mega' : 'link'),
            columns,
          };
        })
        .filter((item) => item && item.visible)
        .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    : [];

  const cta = source?.cta && typeof source.cta === 'object' && source.cta.visible !== false && String(source.cta.label || '').trim()
    ? {
        label: String(source.cta.label || '').trim(),
        href: String(source.cta.href || '').trim(),
        visible: true,
      }
    : null;

  return {
    version: Number(source?.version || 1) || 1,
    primary: ensureInsightsNavItem(primary, siteSections, tenantId),
    cta,
  };
}

router.get('/navigation-tabs', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const tenant = resolved.tenant;
  const navigationTabs = readNavigationTabs(tenant.id);
  const siteNavigation = readSiteNavigation(tenant.id);
  const siteSections = readSiteSections(tenant.id);

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
    siteNavigation,
    siteSections,
  });
});

router.get('/site-navigation', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const tenant = resolved.tenant;
  const siteNavigation = readSiteNavigation(tenant.id);
  const siteSections = readSiteSections(tenant.id);

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
    siteNavigation,
    siteSections,
  });
});

router.get('/site-sections', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const tenant = resolved.tenant;
  const siteSections = readSiteSections(tenant.id);
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
    siteSections,
  });
});

export default router;
