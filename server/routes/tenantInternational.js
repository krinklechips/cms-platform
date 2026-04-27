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

// ─── Steps ───────────────────────────────────────────────────────────────────

router.get('/steps', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/international_steps?select=*&order=sort_order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error('[international/steps] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch steps' });
  }
});

router.post('/steps', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { step_label, title, description, sort_order } = req.body ?? {};
  if (!String(title || '').trim()) return res.status(400).json({ error: 'title is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/international_steps`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        step_label: step_label || null,
        title: String(title).trim(),
        description: description || null,
        sort_order: Number(sort_order) || 0,
      }),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    res.status(201).json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    console.error('[international/steps] create failed', err);
    res.status(500).json({ error: 'Failed to create step' });
  }
});

router.put('/steps/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const patch = {};
  const body = req.body ?? {};
  if (body.step_label !== undefined) patch.step_label = body.step_label || null;
  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.description !== undefined) patch.description = body.description || null;
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0;
  try {
    const resp = await fetch(`${url}/rest/v1/international_steps?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    console.error('[international/steps] update failed', err);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

router.delete('/steps/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/international_steps?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[international/steps] delete failed', err);
    res.status(500).json({ error: 'Failed to delete step' });
  }
});

// ─── Why Items ────────────────────────────────────────────────────────────────

router.get('/why-items', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/international_why_items?select=*&order=sort_order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error('[international/why-items] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch why items' });
  }
});

router.post('/why-items', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { title, description, sort_order } = req.body ?? {};
  if (!String(title || '').trim()) return res.status(400).json({ error: 'title is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/international_why_items`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        title: String(title).trim(),
        description: description || null,
        sort_order: Number(sort_order) || 0,
      }),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    res.status(201).json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    console.error('[international/why-items] create failed', err);
    res.status(500).json({ error: 'Failed to create why item' });
  }
});

router.put('/why-items/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const patch = {};
  const body = req.body ?? {};
  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.description !== undefined) patch.description = body.description || null;
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0;
  try {
    const resp = await fetch(`${url}/rest/v1/international_why_items?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    console.error('[international/why-items] update failed', err);
    res.status(500).json({ error: 'Failed to update why item' });
  }
});

router.delete('/why-items/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/international_why_items?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[international/why-items] delete failed', err);
    res.status(500).json({ error: 'Failed to delete why item' });
  }
});

// ─── Popular Treatments ───────────────────────────────────────────────────────

router.get('/popular-treatments', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/international_popular_treatments?select=*&order=sort_order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error('[international/popular-treatments] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch popular treatments' });
  }
});

router.post('/popular-treatments', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { name, saving, sort_order } = req.body ?? {};
  if (!String(name || '').trim()) return res.status(400).json({ error: 'name is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/international_popular_treatments`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        name: String(name).trim(),
        saving: saving || null,
        sort_order: Number(sort_order) || 0,
      }),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    res.status(201).json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    console.error('[international/popular-treatments] create failed', err);
    res.status(500).json({ error: 'Failed to create popular treatment' });
  }
});

router.put('/popular-treatments/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const patch = {};
  const body = req.body ?? {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.saving !== undefined) patch.saving = body.saving || null;
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order) || 0;
  try {
    const resp = await fetch(`${url}/rest/v1/international_popular_treatments?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    console.error('[international/popular-treatments] update failed', err);
    res.status(500).json({ error: 'Failed to update popular treatment' });
  }
});

router.delete('/popular-treatments/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/international_popular_treatments?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[international/popular-treatments] delete failed', err);
    res.status(500).json({ error: 'Failed to delete popular treatment' });
  }
});

export default router;
