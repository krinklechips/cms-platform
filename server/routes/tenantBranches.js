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
    address: row.address,
    phone: row.phone,
    mobile: row.mobile,
    email: row.email,
    hours: row.hours,
    sortOrder: row.order,
    published: row.published,
  };
}

// GET /
router.get('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);
  try {
    const resp = await fetch(`${url}/rest/v1/branches?select=*&order=order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows.map(mapRow) : []);
  } catch (err) {
    console.error('[branches] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// POST /
router.post('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { name, address, phone, hours, mobile, email, sortOrder, published } = req.body ?? {};
  if (!String(name || '').trim()) return res.status(400).json({ error: 'name is required' });
  if (!String(address || '').trim()) return res.status(400).json({ error: 'address is required' });
  if (!String(phone || '').trim()) return res.status(400).json({ error: 'phone is required' });
  if (!String(hours || '').trim()) return res.status(400).json({ error: 'hours is required' });
  try {
    const body = {
      name: String(name).trim(),
      address: String(address).trim(),
      phone: String(phone).trim(),
      hours: String(hours).trim(),
      mobile: mobile || null,
      email: email || null,
      order: Number(sortOrder) || 0,
      published: Boolean(published),
    };
    const resp = await fetch(`${url}/rest/v1/branches`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify(body),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.status(201).json(mapRow(row));
  } catch (err) {
    console.error('[branches] create failed', err);
    res.status(500).json({ error: 'Failed to create branch' });
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
  if (body.address !== undefined) patch.address = String(body.address).trim();
  if (body.phone !== undefined) patch.phone = String(body.phone).trim();
  if (body.hours !== undefined) patch.hours = String(body.hours).trim();
  if (body.mobile !== undefined) patch.mobile = body.mobile || null;
  if (body.email !== undefined) patch.email = body.email || null;
  if (body.sortOrder !== undefined) patch.order = Number(body.sortOrder) || 0;
  if (body.published !== undefined) patch.published = Boolean(body.published);
  try {
    const resp = await fetch(`${url}/rest/v1/branches?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.json(mapRow(row));
  } catch (err) {
    console.error('[branches] update failed', err);
    res.status(500).json({ error: 'Failed to update branch' });
  }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/branches?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[branches] delete failed', err);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
});

export default router;
