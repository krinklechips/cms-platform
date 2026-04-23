import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();
router.use(requireAuth);
router.use(requireTenantContext);

function getSupabaseConfig() {
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

function mapOut(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    eyebrow: row.eyebrow ?? null,
    description: row.description ?? null,
    heroDescription: row.heroDescription ?? null,
    features: Array.isArray(row.features) ? row.features : [],
    category: row.category ?? null,
    isFeatured: Boolean(row.isFeatured),
    content: row.content ?? { sections: [] },
    sortOrder: row.order ?? 0,
    status: row.published ? 'published' : 'draft',
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

function slugify(v = '') {
  return String(v || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function buildServicePatch(body) {
  const patch = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.slug !== undefined) patch.slug = String(body.slug).trim();
  if (body.eyebrow !== undefined) patch.eyebrow = body.eyebrow || null;
  if (body.description !== undefined) patch.description = body.description || null;
  if (body.heroDescription !== undefined) patch.heroDescription = body.heroDescription || null;
  if (body.category !== undefined) patch.category = body.category || null;
  if (body.features !== undefined) patch.features = Array.isArray(body.features) ? body.features : [];
  if (body.isFeatured !== undefined) patch.isFeatured = Boolean(body.isFeatured);
  if (body.content !== undefined) patch.content = body.content;
  if (body.sortOrder !== undefined) patch.order = Number(body.sortOrder) || 0;
  if (body.status !== undefined) patch.published = body.status !== 'draft';
  patch.updatedAt = new Date().toISOString();
  return patch;
}

router.get('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/services?select=*&order=order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows.map(mapOut) : []);
  } catch (err) {
    console.error('[services] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.post('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { name, slug, eyebrow, description, heroDescription, category, features, isFeatured, content, sortOrder, status } = req.body ?? {};
  if (!String(name || '').trim()) return res.status(400).json({ error: 'name is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/services`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        name: String(name).trim(),
        slug: String(slug || slugify(name)).trim(),
        eyebrow: eyebrow || null,
        description: description || null,
        heroDescription: heroDescription || null,
        category: category || null,
        features: Array.isArray(features) ? features : [],
        isFeatured: Boolean(isFeatured),
        content: content ?? { sections: [] },
        order: Number(sortOrder) || 0,
        published: status !== 'draft',
      }),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    res.status(201).json(mapOut(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[services] create failed', err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const patch = buildServicePatch(req.body ?? {});
  try {
    const resp = await fetch(`${url}/rest/v1/services?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(mapOut(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[services] update failed', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/services?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[services] delete failed', err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
