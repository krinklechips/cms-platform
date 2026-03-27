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
    authorName: row.authorName,
    authorTitle: row.authorTitle ?? null,
    authorPhotoUrl: row.authorPhotoUrl ?? null,
    quote: row.quote,
    youtubeUrl: null,
    rating: row.rating ?? 5,
    isFeatured: Boolean(row.isFeatured),
    sortOrder: row.order ?? 0,
    status: row.published ? 'published' : 'draft',
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

router.get('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/testimonials?select=*&order=order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows.map(mapOut) : []);
  } catch (err) {
    console.error('[testimonials] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

router.post('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { authorName, authorTitle, authorPhotoUrl, quote, rating, isFeatured, sortOrder, status } = req.body ?? {};
  if (!String(authorName || '').trim()) return res.status(400).json({ error: 'authorName is required' });
  if (!String(quote || '').trim()) return res.status(400).json({ error: 'quote is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/testimonials`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        authorName: String(authorName).trim(),
        authorTitle: authorTitle || null,
        authorPhotoUrl: authorPhotoUrl || null,
        quote: String(quote).trim(),
        rating: Number(rating) || 5,
        isFeatured: Boolean(isFeatured),
        order: Number(sortOrder) || 0,
        published: status !== 'draft',
      }),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    res.status(201).json(mapOut(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[testimonials] create failed', err);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

router.put('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const body = req.body ?? {};
  const patch = {};
  if (body.authorName !== undefined) patch.authorName = String(body.authorName).trim();
  if (body.authorTitle !== undefined) patch.authorTitle = body.authorTitle || null;
  if (body.authorPhotoUrl !== undefined) patch.authorPhotoUrl = body.authorPhotoUrl || null;
  if (body.quote !== undefined) patch.quote = String(body.quote).trim();
  if (body.rating !== undefined) patch.rating = Number(body.rating) || 5;
  if (body.isFeatured !== undefined) patch.isFeatured = Boolean(body.isFeatured);
  if (body.sortOrder !== undefined) patch.order = Number(body.sortOrder) || 0;
  if (body.status !== undefined) patch.published = body.status !== 'draft';
  patch.updatedAt = new Date().toISOString();
  try {
    const resp = await fetch(`${url}/rest/v1/testimonials?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(mapOut(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[testimonials] update failed', err);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

router.delete('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/testimonials?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[testimonials] delete failed', err);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

export default router;
