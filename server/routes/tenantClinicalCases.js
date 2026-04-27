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
    slug: row.slug,
    title: row.title,
    category: row.category ?? null,
    tag: row.tag ?? null,
    treatment: row.treatment ?? null,
    duration: row.duration ?? null,
    description: row.description ?? null,
    fullText: row.fullText ?? null,
    cardImage: row.imageUrl ?? null,
    images: Array.isArray(row.images) ? row.images : [],
    sortOrder: row.order ?? 0,
    status: row.published ? 'published' : 'draft',
  };
}

function slugify(v = '') {
  return String(v || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function buildPatch(body) {
  const patch = {};
  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.slug !== undefined) patch.slug = String(body.slug).trim();
  if (body.category !== undefined) patch.category = body.category || null;
  if (body.tag !== undefined) patch.tag = body.tag || null;
  if (body.treatment !== undefined) patch.treatment = body.treatment || null;
  if (body.duration !== undefined) patch.duration = body.duration || null;
  if (body.description !== undefined) patch.description = body.description || null;
  if (body.fullText !== undefined) patch.fullText = body.fullText || null;
  if (body.cardImage !== undefined) patch.imageUrl = body.cardImage || null;
  if (body.images !== undefined) patch.images = Array.isArray(body.images) ? body.images : [];
  if (body.sortOrder !== undefined) patch.order = Number(body.sortOrder) || 0;
  if (body.status !== undefined) patch.published = body.status !== 'draft';
  return patch;
}

router.get('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/clinical_cases?select=*&order=order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows.map(mapOut) : []);
  } catch (err) {
    console.error('[clinical-cases] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch clinical cases' });
  }
});

router.post('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { title, slug, category, tag, treatment, duration, description, fullText, cardImage, images, sortOrder, status } = req.body ?? {};
  if (!String(title || '').trim()) return res.status(400).json({ error: 'title is required' });
  const generatedSlug = String(slug || slugify(title)).trim();
  try {
    const resp = await fetch(`${url}/rest/v1/clinical_cases`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        id: generatedSlug,
        slug: generatedSlug,
        title: String(title).trim(),
        category: category || null,
        tag: tag || null,
        treatment: treatment || null,
        duration: duration || null,
        description: description || null,
        fullText: fullText || null,
        imageUrl: cardImage || null,
        images: Array.isArray(images) ? images : [],
        order: Number(sortOrder) || 0,
        published: status !== 'draft',
      }),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    res.status(201).json(mapOut(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[clinical-cases] create failed', err);
    res.status(500).json({ error: 'Failed to create clinical case' });
  }
});

router.put('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const patch = buildPatch(req.body ?? {});
  try {
    const resp = await fetch(`${url}/rest/v1/clinical_cases?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(mapOut(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[clinical-cases] update failed', err);
    res.status(500).json({ error: 'Failed to update clinical case' });
  }
});

router.delete('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/clinical_cases?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[clinical-cases] delete failed', err);
    res.status(500).json({ error: 'Failed to delete clinical case' });
  }
});

export default router;
