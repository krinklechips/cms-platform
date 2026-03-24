import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenantContext);

function mapMember(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    title: row.title,
    department: row.department,
    bio: row.bio,
    photoUrl: row.photo_url,
    email: row.email,
    linkedinUrl: row.linkedin_url,
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM team_members
    WHERE tenant_id = ?
    ORDER BY sort_order ASC, name ASC
  `).all(req.tenant.id);
  res.json(rows.map(mapMember));
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const row = db.prepare('SELECT * FROM team_members WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  if (!row) return res.status(404).json({ error: 'Team member not found' });
  return res.json(mapMember(row));
});

router.post('/', (req, res) => {
  const {
    name,
    title = null,
    department = null,
    bio = null,
    photoUrl = null,
    email = null,
    linkedinUrl = null,
    sortOrder = 0,
    status = 'published',
  } = req.body ?? {};

  if (!String(name || '').trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const now = new Date().toISOString();
  const info = db.prepare(`
    INSERT INTO team_members (tenant_id, name, title, department, bio, photo_url, email, linkedin_url, sort_order, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.tenant.id,
    String(name).trim(),
    title ? String(title).trim() : null,
    department ? String(department).trim() : null,
    bio ? String(bio).trim() : null,
    photoUrl ? String(photoUrl).trim() : null,
    email ? String(email).trim() : null,
    linkedinUrl ? String(linkedinUrl).trim() : null,
    Number(sortOrder) || 0,
    status === 'draft' ? 'draft' : 'published',
    now,
    now,
  );

  const row = db.prepare('SELECT * FROM team_members WHERE id = ?').get(info.lastInsertRowid);
  return res.status(201).json(mapMember(row));
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const existing = db.prepare('SELECT * FROM team_members WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  if (!existing) return res.status(404).json({ error: 'Team member not found' });

  const name = req.body?.name !== undefined ? String(req.body.name).trim() : existing.name;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE team_members
    SET name = ?, title = ?, department = ?, bio = ?, photo_url = ?, email = ?, linkedin_url = ?, sort_order = ?, status = ?, updated_at = ?
    WHERE tenant_id = ? AND id = ?
  `).run(
    name,
    req.body?.title !== undefined ? (req.body.title ? String(req.body.title).trim() : null) : existing.title,
    req.body?.department !== undefined ? (req.body.department ? String(req.body.department).trim() : null) : existing.department,
    req.body?.bio !== undefined ? (req.body.bio ? String(req.body.bio).trim() : null) : existing.bio,
    req.body?.photoUrl !== undefined ? (req.body.photoUrl ? String(req.body.photoUrl).trim() : null) : existing.photo_url,
    req.body?.email !== undefined ? (req.body.email ? String(req.body.email).trim() : null) : existing.email,
    req.body?.linkedinUrl !== undefined ? (req.body.linkedinUrl ? String(req.body.linkedinUrl).trim() : null) : existing.linkedin_url,
    req.body?.sortOrder !== undefined ? (Number(req.body.sortOrder) || 0) : existing.sort_order,
    req.body?.status === 'draft' ? 'draft' : (req.body?.status === 'published' ? 'published' : existing.status),
    now,
    req.tenant.id,
    id,
  );

  const row = db.prepare('SELECT * FROM team_members WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  return res.json(mapMember(row));
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const info = db.prepare('DELETE FROM team_members WHERE tenant_id = ? AND id = ?').run(req.tenant.id, id);
  if (!info.changes) return res.status(404).json({ error: 'Team member not found' });
  return res.json({ ok: true });
});

export default router;
