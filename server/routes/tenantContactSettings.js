import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();
router.use(requireAuth);
router.use(requireTenantContext);

const CONTACT_FIELDS = ['address', 'phone', 'mobile', 'email', 'mapEmbedUrl', 'facebook', 'instagram', 'youtube', 'whatsapp', 'telegram'];

function readContact(tenantId) {
  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
  if (!row) return {};
  try {
    const parsed = JSON.parse(row.settings_json || '{}') || {};
    return parsed.contact && typeof parsed.contact === 'object' ? parsed.contact : {};
  } catch {
    return {};
  }
}

router.get('/', (req, res) => {
  return res.json(readContact(req.tenant.id));
});

router.put('/', (req, res) => {
  const current = readContact(req.tenant.id);
  const updated = { ...current };
  for (const field of CONTACT_FIELDS) {
    if (req.body[field] !== undefined) {
      updated[field] = String(req.body[field] || '').trim();
    }
  }

  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(req.tenant.id);
  let existing = {};
  try { existing = JSON.parse(row?.settings_json || '{}') || {}; } catch { /* empty */ }

  const newJson = JSON.stringify({ ...existing, contact: updated });
  db.prepare(`
    INSERT INTO tenant_settings (tenant_id, settings_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO UPDATE SET settings_json = excluded.settings_json, updated_at = CURRENT_TIMESTAMP
  `).run(req.tenant.id, newJson);

  return res.json(updated);
});

export default router;
