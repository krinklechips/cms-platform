// Proxies to Supabase `doctors` table.
// CMS field `title` maps to Supabase `role` (the doctor's readable position).
// CMS field `department` must be one of the Supabase enum values:
//   DIRECTOR | IMPLANTOLOGY | COSMETIC | ORTHODONTICS | PEDIATRICS |
//   GENERAL  | SENIOR_CONSULTANT | PERIODONTICS
// Fields not in the doctors table (email, linkedinUrl) are ignored on write.

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

function autoInitials(name) {
  return String(name || '').split(/\s+/).map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '??';
}

function mapOut(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    title: row.role ?? row.credentials ?? null,   // show role as the "title"
    department: row.department ?? null,
    bio: row.bio ?? null,
    photoUrl: row.photoUrl ?? null,
    email: null,
    linkedinUrl: null,
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
    const resp = await fetch(`${url}/rest/v1/doctors?select=*&order=order.asc`, { headers: sbHeaders(key) });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const rows = await resp.json();
    res.json(Array.isArray(rows) ? rows.map(mapOut) : []);
  } catch (err) {
    console.error('[team] fetch failed', err);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

router.post('/', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { name, title, department, bio, photoUrl, sortOrder, status } = req.body ?? {};
  if (!String(name || '').trim()) return res.status(400).json({ error: 'name is required' });
  const nm = String(name).trim();
  try {
    const resp = await fetch(`${url}/rest/v1/doctors`, {
      method: 'POST',
      headers: sbHeaders(key),
      body: JSON.stringify({
        name: nm,
        role: title || null,
        credentials: '',
        initials: autoInitials(nm),
        department: department || 'GENERAL',
        bio: bio || null,
        photoUrl: photoUrl || null,
        specialty: [],
        languages: [],
        order: Number(sortOrder) || 0,
        published: status !== 'draft',
      }),
    });
    if (!resp.ok) { const t = await resp.text(); return res.status(resp.status).json({ error: t }); }
    const data = await resp.json();
    res.status(201).json(mapOut(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[team] create failed', err);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

router.put('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  const body = req.body ?? {};
  const patch = {};
  if (body.name !== undefined) {
    patch.name = String(body.name).trim();
    patch.initials = autoInitials(patch.name);
  }
  if (body.title !== undefined) patch.role = body.title || null;
  if (body.department !== undefined) patch.department = body.department || 'GENERAL';
  if (body.bio !== undefined) patch.bio = body.bio || null;
  if (body.photoUrl !== undefined) patch.photoUrl = body.photoUrl || null;
  if (body.sortOrder !== undefined) patch.order = Number(body.sortOrder) || 0;
  if (body.status !== undefined) patch.published = body.status !== 'draft';
  patch.updatedAt = new Date().toISOString();
  try {
    const resp = await fetch(`${url}/rest/v1/doctors?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: sbHeaders(key),
      body: JSON.stringify(patch),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    const data = await resp.json();
    res.json(mapOut(Array.isArray(data) ? data[0] : data));
  } catch (err) {
    console.error('[team] update failed', err);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

router.delete('/:id', async (req, res) => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return res.status(503).json({ error: 'Supabase not configured' });
  const { id } = req.params;
  try {
    const resp = await fetch(`${url}/rest/v1/doctors?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: sbHeaders(key),
    });
    if (!resp.ok) return res.status(resp.status).json({ error: 'Supabase error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[team] delete failed', err);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

export default router;
