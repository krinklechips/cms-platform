import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenantContext);

// ---------------------------------------------------------------------------
// Supabase REST proxy for hero_slides
//
// Credentials are read from tenant_settings.settings_json → supabase { url, serviceKey, anonKey }
// This means each tenant can have their OWN Supabase project.
// Falls back to server-level env vars (SUPABASE_URL / SUPABASE_SERVICE_KEY)
// if no tenant-specific config is present — useful for the default tenant.
// ---------------------------------------------------------------------------

function getSupabaseConfig(tenantId) {
  // 1. Try per-tenant settings
  try {
    const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
    if (row) {
      const settings = JSON.parse(row.settings_json || '{}');
      const sb = settings.supabase ?? {};
      if (sb.url && (sb.serviceKey || sb.anonKey)) {
        return { url: sb.url, key: sb.serviceKey || sb.anonKey };
      }
    }
  } catch { /* ignore parse errors */ }

  // 2. Fall back to server-level env vars
  return {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
  };
}

function sbHeaders(key) {
  return {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Prefer': 'return=representation',
  };
}

// GET /api/tenant/hero/slides
router.get('/slides', async (req, res) => {
  const { url, key } = getSupabaseConfig(req.tenant.id);
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(
      `${url}/rest/v1/hero_slides?select=*&order=order`,
      { headers: sbHeaders(key) },
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('[hero] fetch slides failed', err);
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
});

// POST /api/tenant/hero/slides
router.post('/slides', async (req, res) => {
  const { url, key } = getSupabaseConfig(req.tenant.id);
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });

  const {
    imageSrc,
    eyebrow = '',
    title = '',
    description = '',
    imageAlt = '',
    imagePosition = 'center center',
    imageSize = null,
    preserveFullImage = false,
    order = 0,
    published = true,
  } = req.body ?? {};

  if (!String(imageSrc || '').trim()) {
    return res.status(400).json({ error: 'imageSrc is required' });
  }

  try {
    const resp = await fetch(`${url}/rest/v1/hero_slides`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        imageSrc,
        eyebrow,
        title,
        description,
        imageAlt,
        imagePosition,
        imageSize,
        preserveFullImage,
        order: Number(order) || 0,
        published: Boolean(published),
      }),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.status(201).json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    console.error('[hero] create slide failed', err);
    res.status(500).json({ error: 'Failed to create slide' });
  }
});

// PUT /api/tenant/hero/slides/:id
router.put('/slides/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig(req.tenant.id);
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });

  const { id } = req.params;
  const allowed = ['imageSrc','eyebrow','title','description','imageAlt','imagePosition','imageSize','preserveFullImage','order','published'];
  const patch = {};
  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body ?? {}, field)) {
      patch[field] = req.body[field];
    }
  }

  try {
    const resp = await fetch(`${url}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    console.error('[hero] update slide failed', err);
    res.status(500).json({ error: 'Failed to update slide' });
  }
});

// DELETE /api/tenant/hero/slides/:id
router.delete('/slides/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig(req.tenant.id);
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });

  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/hero_slides?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[hero] delete slide failed', err);
    res.status(500).json({ error: 'Failed to delete slide' });
  }
});

export default router;
