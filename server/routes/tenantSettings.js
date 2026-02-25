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

router.get('/', (req, res) => {
  const settings = readSettings(req.tenant.id);
  return res.json({
    tenantId: req.tenant.id,
    navigationTabs: Array.isArray(settings.navigationTabs) ? settings.navigationTabs : [],
  });
});

router.put('/', (req, res) => {
  const current = readSettings(req.tenant.id);
  const incomingTabs = normalizeNavigationTabs(req.body?.navigationTabs);
  const next = {
    ...current,
    navigationTabs: incomingTabs,
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
  });
});

export default router;
