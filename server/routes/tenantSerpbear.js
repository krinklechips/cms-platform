import { Router } from 'express';
import { requireTenantContext } from '../middleware/tenantContext.js';
import { db } from '../db.js';

const router = Router();
router.use(requireTenantContext);

function getSerpbearConfig(tenantId) {
  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
  const settings = row ? JSON.parse(row.settings_json || '{}') : {};
  return settings.integrations?.serpbear || null;
}

async function serpbearFetch(baseUrl, apiKey, path, options = {}) {
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'serp-api-key': apiKey,
      ...(options.headers || {}),
    },
  });
}

function requireSerpbear(req, res) {
  const config = getSerpbearConfig(req.tenant.id);
  if (!config?.url || !config?.apiKey) {
    res.status(400).json({ ok: false, error: 'Serpbear not configured. Add your Serpbear URL and API key in Integrations settings.' });
    return null;
  }
  return config;
}

// GET /api/tenant/serpbear/status
router.get('/status', (req, res) => {
  const config = getSerpbearConfig(req.tenant.id);
  res.json({
    ok: true,
    configured: !!(config?.url && config?.apiKey),
    url: config?.url || null,
  });
});

// GET /api/tenant/serpbear/domains
router.get('/domains', async (req, res) => {
  const config = requireSerpbear(req, res);
  if (!config) return;
  try {
    const r = await serpbearFetch(config.url, config.apiKey, '/api/domains');
    if (!r.ok) return res.status(r.status).json({ ok: false, error: `Serpbear error: ${r.status}` });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: `Cannot reach Serpbear: ${err.message}` });
  }
});

// GET /api/tenant/serpbear/keywords?domainID=xxx
router.get('/keywords', async (req, res) => {
  const config = requireSerpbear(req, res);
  if (!config) return;
  const { domainID } = req.query;
  if (!domainID) return res.status(400).json({ ok: false, error: 'domainID required' });
  try {
    const r = await serpbearFetch(config.url, config.apiKey, `/api/keywords?domainID=${encodeURIComponent(domainID)}`);
    if (!r.ok) return res.status(r.status).json({ ok: false, error: `Serpbear error: ${r.status}` });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: `Cannot reach Serpbear: ${err.message}` });
  }
});

// POST /api/tenant/serpbear/keywords — add keyword(s) to a domain
router.post('/keywords', async (req, res) => {
  const config = requireSerpbear(req, res);
  if (!config) return;
  try {
    const r = await serpbearFetch(config.url, config.apiKey, '/api/keyword', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    if (!r.ok) return res.status(r.status).json({ ok: false, error: `Serpbear error: ${r.status}` });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: `Cannot reach Serpbear: ${err.message}` });
  }
});

// DELETE /api/tenant/serpbear/keywords/:id
router.delete('/keywords/:id', async (req, res) => {
  const config = requireSerpbear(req, res);
  if (!config) return;
  try {
    const r = await serpbearFetch(
      config.url,
      config.apiKey,
      `/api/keyword?id=${encodeURIComponent(req.params.id)}`,
      { method: 'DELETE' },
    );
    if (!r.ok) return res.status(r.status).json({ ok: false, error: `Serpbear error: ${r.status}` });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: `Cannot reach Serpbear: ${err.message}` });
  }
});

// POST /api/tenant/serpbear/scrape — trigger fresh rank check
router.post('/scrape', async (req, res) => {
  const config = requireSerpbear(req, res);
  if (!config) return;
  try {
    const r = await serpbearFetch(config.url, config.apiKey, '/api/scrape', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    if (!r.ok) return res.status(r.status).json({ ok: false, error: `Serpbear error: ${r.status}` });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: `Cannot reach Serpbear: ${err.message}` });
  }
});

// GET /api/tenant/serpbear/history?keywordID=xxx
router.get('/history', async (req, res) => {
  const config = requireSerpbear(req, res);
  if (!config) return;
  const { keywordID } = req.query;
  if (!keywordID) return res.status(400).json({ ok: false, error: 'keywordID required' });
  try {
    const r = await serpbearFetch(
      config.url,
      config.apiKey,
      `/api/keyword/history?keywordID=${encodeURIComponent(keywordID)}`,
    );
    if (!r.ok) return res.status(r.status).json({ ok: false, error: `Serpbear error: ${r.status}` });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: `Cannot reach Serpbear: ${err.message}` });
  }
});

export default router;
