import express from 'express';
import { db } from '../db.js';

const router = express.Router();

function resolveTenant(req) {
  const tenantSlug = req.query.tenantSlug ? String(req.query.tenantSlug) : null;
  const tenantId = req.query.tenantId ? Number(req.query.tenantId) : null;
  if (!tenantSlug && !tenantId) return { error: 'tenantSlug or tenantId query parameter is required' };

  const tenant = tenantSlug
    ? db.prepare('SELECT id, slug, name, status FROM tenants WHERE slug = ?').get(tenantSlug)
    : db.prepare('SELECT id, slug, name, status FROM tenants WHERE id = ?').get(tenantId);

  if (!tenant || tenant.status !== 'active') return { error: 'Tenant not found', status: 404 };
  return { tenant };
}

function mapMember(row) {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    department: row.department,
    bio: row.bio,
    photoUrl: row.photo_url,
    email: row.email,
    linkedinUrl: row.linkedin_url,
    sortOrder: row.sort_order,
  };
}

router.get('/team-members', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const rows = db.prepare(`
    SELECT * FROM team_members
    WHERE tenant_id = ? AND status = 'published'
    ORDER BY sort_order ASC, name ASC
  `).all(resolved.tenant.id);

  return res.json({ items: rows.map(mapMember) });
});

export default router;
