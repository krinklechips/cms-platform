import { Router } from 'express';
import { requireTenantContext } from '../middleware/tenantContext.js';
import { db } from '../db.js';

const router = Router();
router.use(requireTenantContext);

function readIntegrations(tenantId) {
  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
  const settings = row ? JSON.parse(row.settings_json || '{}') : {};
  return settings.integrations || {};
}

function writeIntegrations(tenantId, integrations) {
  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
  const settings = row ? JSON.parse(row.settings_json || '{}') : {};
  const next = { ...settings, integrations };
  db.prepare(`
    INSERT INTO tenant_settings (tenant_id, settings_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO UPDATE SET
      settings_json = excluded.settings_json,
      updated_at = CURRENT_TIMESTAMP
  `).run(tenantId, JSON.stringify(next));
}

// GET /api/tenant/integrations
router.get('/', (req, res) => {
  const integrations = readIntegrations(req.tenant.id);
  // Never expose raw API keys — mask them
  const masked = {};
  if (integrations.serpbear) {
    masked.serpbear = {
      url: integrations.serpbear.url || '',
      apiKey: integrations.serpbear.apiKey ? '••••••••' : '',
      configured: !!(integrations.serpbear.url && integrations.serpbear.apiKey),
    };
  } else {
    masked.serpbear = { url: '', apiKey: '', configured: false };
  }
  if (integrations.pagespeed) {
    masked.pagespeed = {
      apiKey: integrations.pagespeed.apiKey ? '••••••••' : '',
      configured: !!integrations.pagespeed.apiKey,
    };
  } else {
    masked.pagespeed = { apiKey: '', configured: false };
  }
  res.json({ ok: true, integrations: masked });
});

// PUT /api/tenant/integrations
router.put('/', (req, res) => {
  const current = readIntegrations(req.tenant.id);
  const body = req.body || {};

  const next = { ...current };

  if (body.serpbear !== undefined) {
    next.serpbear = {
      url: body.serpbear.url || current.serpbear?.url || '',
      // Only update apiKey if a real value (not masked placeholder) is sent
      apiKey: body.serpbear.apiKey && !body.serpbear.apiKey.startsWith('•')
        ? body.serpbear.apiKey
        : (current.serpbear?.apiKey || ''),
    };
  }

  if (body.pagespeed !== undefined) {
    next.pagespeed = {
      apiKey: body.pagespeed.apiKey && !body.pagespeed.apiKey.startsWith('•')
        ? body.pagespeed.apiKey
        : (current.pagespeed?.apiKey || ''),
    };
  }

  writeIntegrations(req.tenant.id, next);
  res.json({ ok: true });
});

// DELETE /api/tenant/integrations/:service — clear a service config
router.delete('/:service', (req, res) => {
  const { service } = req.params;
  if (!['serpbear', 'pagespeed'].includes(service)) {
    return res.status(400).json({ ok: false, error: 'Unknown service' });
  }
  const current = readIntegrations(req.tenant.id);
  delete current[service];
  writeIntegrations(req.tenant.id, current);
  res.json({ ok: true });
});

export default router;
