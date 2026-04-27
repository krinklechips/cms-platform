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

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    highlights: row.highlights,
    imageSrc: row.imageSrc,
    sortOrder: row.order,
    published: row.published,
    content: row.content,
  };
}

// GET /
router.get('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/technology?select=*&order=order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows.map(mapRow) : []);
  } catch (err) {
    console.error('[technology] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch technology items' });
  }
});

// POST /
router.post('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { name, category, slug, description, highlights, imageSrc, sortOrder, published, content } = req.body ?? {};
  if (!String(name || '').trim()) return res.status(400).json({ error: 'name is required' });
  if (!String(category || '').trim()) return res.status(400).json({ error: 'category is required' });
  try {
    const body = {
      name: String(name).trim(),
      category: String(category).trim(),
      slug: slug || null,
      description: description || null,
      highlights: Array.isArray(highlights) ? highlights : [],
      imageSrc: imageSrc || null,
      order: Number(sortOrder) || 0,
      published: Boolean(published),
      content: content ?? null,
    };
    const resp = await fetch(`${url}/rest/v1/technology`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify(body),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.status(201).json(mapRow(row));
  } catch (err) {
    console.error('[technology] create failed', err);
    res.status(500).json({ error: 'Failed to create technology item' });
  }
});

// PUT /:id
router.put('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const body = req.body ?? {};
  const patch = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.category !== undefined) patch.category = String(body.category).trim();
  if (body.slug !== undefined) patch.slug = body.slug || null;
  if (body.description !== undefined) patch.description = body.description || null;
  if (body.highlights !== undefined) patch.highlights = Array.isArray(body.highlights) ? body.highlights : [];
  if (body.imageSrc !== undefined) patch.imageSrc = body.imageSrc || null;
  if (body.sortOrder !== undefined) patch.order = Number(body.sortOrder) || 0;
  if (body.published !== undefined) patch.published = Boolean(body.published);
  if (body.content !== undefined) patch.content = body.content ?? null;
  try {
    const resp = await fetch(`${url}/rest/v1/technology?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.json(mapRow(row));
  } catch (err) {
    console.error('[technology] update failed', err);
    res.status(500).json({ error: 'Failed to update technology item' });
  }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/technology?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[technology] delete failed', err);
    res.status(500).json({ error: 'Failed to delete technology item' });
  }
});

export default router;
