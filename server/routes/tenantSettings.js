import express from 'express';
import { db } from '../db.js';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(requirePlatformAdmin);
router.use(requireTenantContext);

function readSettings(tenantId) {
  const row = db
    .prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?')
    .get(tenantId);
  if (!row) return {};
  try {
    return JSON.parse(row.settings_json || '{}') || {};
  } catch {
    return {};
  }
}

function defaultModuleAccess() {
  return {
    homepagePlacements: true,
    articles: true,
    libraries: true,
    annualReports: true,
    navigationTabs: true,
  };
}

function normalizeModuleAccess(input, current) {
  const base = {
    ...defaultModuleAccess(),
    ...(current && typeof current === 'object' ? current : {}),
  };
  if (!input || typeof input !== 'object') return base;
  const next = { ...base };
  Object.keys(base).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      next[key] = Boolean(input[key]);
    }
  });
  return next;
}

function normalizeNavigationTabs(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((item, index) => {
      const label = String(item?.label || '').trim();
      const href = String(item?.href || '').trim();
      const group = String(item?.group || 'general').trim() || 'general';
      const visible = item?.visible !== false;
      const order = Number.isFinite(Number(item?.order)) ? Number(item.order) : index;
      if (!label) return null;
      return {
        id: String(item?.id || `${Date.now()}-${index}`),
        label,
        href,
        group,
        visible,
        order,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

function normalizeSiteNavigationLink(input, { fallbackIdPrefix = 'nav-link', fallbackOrder = 0 } = {}) {
  const label = String(input?.label || '').trim();
  const href = String(input?.href || '').trim();
  const visible = input?.visible !== false;
  const order = Number.isFinite(Number(input?.order)) ? Number(input.order) : fallbackOrder;
  if (!label) return null;
  return {
    id: String(input?.id || `${fallbackIdPrefix}-${Date.now()}-${fallbackOrder}`),
    label,
    href,
    visible,
    order,
    description: String(input?.description || '').trim(),
  };
}

function normalizeSiteNavigationColumn(input, index) {
  const title = String(input?.title || '').trim();
  const visible = input?.visible !== false;
  const order = Number.isFinite(Number(input?.order)) ? Number(input.order) : index;
  const rawItems = Array.isArray(input?.items) ? input.items : [];
  const items = rawItems
    .map((item, itemIndex) =>
      normalizeSiteNavigationLink(item, {
        fallbackIdPrefix: `nav-col-item-${index}`,
        fallbackOrder: itemIndex,
      }),
    )
    .filter(Boolean)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

  if (!title && !items.length) return null;
  return {
    id: String(input?.id || `nav-col-${Date.now()}-${index}`),
    title,
    visible,
    order,
    items,
  };
}

function normalizeSiteNavigationItem(input, index) {
  const label = String(input?.label || '').trim();
  const href = String(input?.href || '').trim();
  const visible = input?.visible !== false;
  const order = Number.isFinite(Number(input?.order)) ? Number(input.order) : index;
  const type = input?.type === 'mega' ? 'mega' : 'link';
  if (!label) return null;

  const columns = Array.isArray(input?.columns)
    ? input.columns
        .map((column, columnIndex) => normalizeSiteNavigationColumn(column, columnIndex))
        .filter(Boolean)
        .sort((a, b) => a.order - b.order || String(a.title || '').localeCompare(String(b.title || '')))
    : [];

  return {
    id: String(input?.id || `nav-item-${Date.now()}-${index}`),
    label,
    href,
    visible,
    order,
    type: columns.length ? 'mega' : type,
    description: String(input?.description || '').trim(),
    columns,
  };
}

function normalizeSiteNavigation(input, current) {
  const currentValue = current && typeof current === 'object' ? current : {};
  const source = input && typeof input === 'object' ? input : currentValue;

  const primary = Array.isArray(source.primary)
    ? source.primary
        .map((item, index) => normalizeSiteNavigationItem(item, index))
        .filter(Boolean)
        .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    : [];

  const cta =
    source.cta && typeof source.cta === 'object'
      ? {
          label: String(source.cta.label || '').trim(),
          href: String(source.cta.href || '').trim(),
          visible: source.cta.visible !== false,
        }
      : null;

  const safeCta = cta && cta.label ? cta : null;

  return {
    version: 1,
    primary,
    cta: safeCta,
  };
}

router.get('/', (req, res) => {
  const settings = readSettings(req.tenant.id);
  return res.json({
    tenantId: req.tenant.id,
    navigationTabs: Array.isArray(settings.navigationTabs) ? settings.navigationTabs : [],
    siteNavigation: normalizeSiteNavigation(settings.siteNavigation, settings.siteNavigation),
    moduleAccess: normalizeModuleAccess(settings.moduleAccess, settings.moduleAccess),
  });
});

router.put('/', (req, res) => {
  const current = readSettings(req.tenant.id);
  const hasNavigationTabs = Object.prototype.hasOwnProperty.call(req.body || {}, 'navigationTabs');
  const incomingTabs = hasNavigationTabs
    ? normalizeNavigationTabs(req.body?.navigationTabs)
    : (Array.isArray(current.navigationTabs) ? current.navigationTabs : []);
  const hasSiteNavigation = Object.prototype.hasOwnProperty.call(req.body || {}, 'siteNavigation');
  const siteNavigation = hasSiteNavigation
    ? normalizeSiteNavigation(req.body?.siteNavigation, current.siteNavigation)
    : normalizeSiteNavigation(current.siteNavigation, current.siteNavigation);
  const moduleAccess = normalizeModuleAccess(req.body?.moduleAccess, current.moduleAccess);
  const next = {
    ...current,
    navigationTabs: incomingTabs,
    siteNavigation,
    moduleAccess,
  };

  db.prepare(`
    INSERT INTO tenant_settings (tenant_id, settings_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO UPDATE SET
      settings_json = excluded.settings_json,
      updated_at = CURRENT_TIMESTAMP
  `).run(req.tenant.id, JSON.stringify(next));

  return res.json({
    ok: true,
    tenantId: req.tenant.id,
    navigationTabs: incomingTabs,
    siteNavigation,
    moduleAccess,
  });
});

export default router;
