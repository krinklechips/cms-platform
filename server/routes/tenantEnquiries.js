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
    email: row.email,
    phone: row.phone,
    country: row.country,
    treatment: row.treatment,
    branch: row.branch,
    date: row.date,
    message: row.message,
    read: row.read,
    agentCode: row.agent_code,
    doctor: row.doctor,
    createdAt: row.createdAt,
  };
}

// GET / — list enquiries, optional ?read=true|false filter
router.get('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.json([]);

  let endpoint = `${url}/rest/v1/enquiries?select=*&order=createdAt.desc`;
  if (req.query.read === 'true') endpoint += '&read=eq.true';
  if (req.query.read === 'false') endpoint += '&read=eq.false';

  try {
    const resp = await fetch(endpoint, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows.map(mapRow) : []);
  } catch (err) {
    console.error('[enquiries] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

// PATCH /:id/read — mark as read/unread
router.patch('/:id/read', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const read = req.body?.read !== undefined ? Boolean(req.body.read) : true;

  try {
    const resp = await fetch(`${url}/rest/v1/enquiries?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify({ read }),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    const row = Array.isArray(data) ? data[0] : data;
    res.json(mapRow(row));
  } catch (err) {
    console.error('[enquiries] mark-read failed', err);
    res.status(500).json({ error: 'Failed to update enquiry' });
  }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;

  try {
    const resp = await fetch(`${url}/rest/v1/enquiries?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[enquiries] delete failed', err);
    res.status(500).json({ error: 'Failed to delete enquiry' });
  }
});

export default router;
