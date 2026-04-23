// Pricing Manager — proxies to Supabase pricing tables.
//
// Tables used:
//   pricing_categories  — id, title, icon, order
//   pricing_items       — id, name, price, ada, aus, categoryId, order
//   pricing_comparison_rows — id, set_id, ada, treatment, roomchang_price, australia_price, sort_order

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

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    icon: row.icon ?? null,
    sortOrder: row.order ?? 0,
  };
}

function mapItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    price: row.price ?? '',
    ada: row.ada ?? null,
    aus: row.aus ?? null,
    categoryId: row.categoryId,
    sortOrder: row.order ?? 0,
  };
}

function mapCompRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    setId: row.set_id ?? null,
    ada: row.ada ?? '',
    treatment: row.treatment ?? '',
    roomchangPrice: row.roomchang_price ?? '',
    australiaPrice: row.australia_price ?? '',
    sortOrder: row.sort_order ?? 0,
  };
}

// ─── Categories ───────────────────────────────────────────────────────────────

router.get('/categories', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(
      `${url}/rest/v1/pricing_categories?select=*&order=order.asc`,
      { headers: sbHeaders(key) },
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows.map(mapCategory) : []);
  } catch (err) {
    console.error('[pricing] fetch categories failed', err);
    res.status(500).json({ error: 'Failed to fetch pricing categories' });
  }
});

router.post('/categories', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { title, icon, sortOrder } = req.body ?? {};
  if (!String(title || '').trim()) return res.status(400).json({ error: 'title is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/pricing_categories`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        title: String(title).trim(),
        icon: icon || null,
        order: Number(sortOrder) || 0,
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return res.status(resp.status).json({ error: t });
    }
    const data = await resp.json();
    res.status(201).json(mapCategory(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[pricing] create category failed', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const body = req.body ?? {};
  const patch = {};
  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.icon !== undefined) patch.icon = body.icon || null;
  if (body.sortOrder !== undefined) patch.order = Number(body.sortOrder) || 0;
  try {
    const resp = await fetch(
      `${url}/rest/v1/pricing_categories?id=eq.${encodeURIComponent(id)}`,
      { method: 'PATCH', headers: sbHeaders(key), body: JSON.stringify(patch) },
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(mapCategory(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[pricing] update category failed', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(
      `${url}/rest/v1/pricing_categories?id=eq.${encodeURIComponent(id)}`,
      { method: 'DELETE', headers: sbHeaders(key) },
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[pricing] delete category failed', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ─── Items ────────────────────────────────────────────────────────────────────

router.get('/items', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(
      `${url}/rest/v1/pricing_items?select=*&order=order.asc`,
      { headers: sbHeaders(key) },
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows.map(mapItem) : []);
  } catch (err) {
    console.error('[pricing] fetch items failed', err);
    res.status(500).json({ error: 'Failed to fetch pricing items' });
  }
});

router.post('/items', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { name, price, ada, aus, categoryId, sortOrder } = req.body ?? {};
  if (!String(name || '').trim()) return res.status(400).json({ error: 'name is required' });
  if (!String(categoryId || '').trim()) return res.status(400).json({ error: 'categoryId is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/pricing_items`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        name: String(name).trim(),
        price: String(price || '').trim(),
        ada: ada || null,
        aus: aus || null,
        categoryId: String(categoryId).trim(),
        order: Number(sortOrder) || 0,
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return res.status(resp.status).json({ error: t });
    }
    const data = await resp.json();
    res.status(201).json(mapItem(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[pricing] create item failed', err);
    res.status(500).json({ error: 'Failed to create pricing item' });
  }
});

router.put('/items/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const body = req.body ?? {};
  const patch = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.price !== undefined) patch.price = String(body.price).trim();
  if (body.ada !== undefined) patch.ada = body.ada || null;
  if (body.aus !== undefined) patch.aus = body.aus || null;
  if (body.categoryId !== undefined) patch.categoryId = body.categoryId;
  if (body.sortOrder !== undefined) patch.order = Number(body.sortOrder) || 0;
  try {
    const resp = await fetch(
      `${url}/rest/v1/pricing_items?id=eq.${encodeURIComponent(id)}`,
      { method: 'PATCH', headers: sbHeaders(key), body: JSON.stringify(patch) },
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(mapItem(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[pricing] update item failed', err);
    res.status(500).json({ error: 'Failed to update pricing item' });
  }
});

router.delete('/items/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(
      `${url}/rest/v1/pricing_items?id=eq.${encodeURIComponent(id)}`,
      { method: 'DELETE', headers: sbHeaders(key) },
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[pricing] delete item failed', err);
    res.status(500).json({ error: 'Failed to delete pricing item' });
  }
});

// ─── Comparison rows ──────────────────────────────────────────────────────────

router.get('/comparison-rows', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(
      `${url}/rest/v1/pricing_comparison_rows?select=*&order=sort_order.asc`,
      { headers: sbHeaders(key) },
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows.map(mapCompRow) : []);
  } catch (err) {
    console.error('[pricing] fetch comparison rows failed', err);
    res.status(500).json({ error: 'Failed to fetch comparison rows' });
  }
});

router.post('/comparison-rows', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { setId, ada, treatment, roomchangPrice, australiaPrice, sortOrder } = req.body ?? {};
  if (!String(treatment || '').trim()) return res.status(400).json({ error: 'treatment is required' });
  try {
    const resp = await fetch(`${url}/rest/v1/pricing_comparison_rows`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        set_id: setId || null,
        ada: ada || null,
        treatment: String(treatment).trim(),
        roomchang_price: roomchangPrice || null,
        australia_price: australiaPrice || null,
        sort_order: Number(sortOrder) || 0,
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return res.status(resp.status).json({ error: t });
    }
    const data = await resp.json();
    res.status(201).json(mapCompRow(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[pricing] create comparison row failed', err);
    res.status(500).json({ error: 'Failed to create comparison row' });
  }
});

router.put('/comparison-rows/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const body = req.body ?? {};
  const patch = {};
  if (body.ada !== undefined) patch.ada = body.ada || null;
  if (body.treatment !== undefined) patch.treatment = String(body.treatment).trim();
  if (body.roomchangPrice !== undefined) patch.roomchang_price = body.roomchangPrice || null;
  if (body.australiaPrice !== undefined) patch.australia_price = body.australiaPrice || null;
  if (body.sortOrder !== undefined) patch.sort_order = Number(body.sortOrder) || 0;
  try {
    const resp = await fetch(
      `${url}/rest/v1/pricing_comparison_rows?id=eq.${encodeURIComponent(id)}`,
      { method: 'PATCH', headers: sbHeaders(key), body: JSON.stringify(patch) },
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(mapCompRow(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[pricing] update comparison row failed', err);
    res.status(500).json({ error: 'Failed to update comparison row' });
  }
});

router.delete('/comparison-rows/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(
      `${url}/rest/v1/pricing_comparison_rows?id=eq.${encodeURIComponent(id)}`,
      { method: 'DELETE', headers: sbHeaders(key) },
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[pricing] delete comparison row failed', err);
    res.status(500).json({ error: 'Failed to delete comparison row' });
  }
});

export default router;
