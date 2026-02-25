import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/annual-reports', (req, res) => {
  const tenantSlug = req.query.tenantSlug ? String(req.query.tenantSlug) : null;
  const tenantId = req.query.tenantId ? Number(req.query.tenantId) : null;
  if (!tenantSlug && !tenantId) {
    return res.status(400).json({ error: 'tenantSlug or tenantId query parameter is required' });
  }

  const tenant = tenantSlug
    ? db.prepare('SELECT id, slug, name, status FROM tenants WHERE slug = ?').get(tenantSlug)
    : db.prepare('SELECT id, slug, name, status FROM tenants WHERE id = ?').get(tenantId);
  if (!tenant || tenant.status !== 'active') return res.status(404).json({ error: 'Tenant not found' });

  const rows = db.prepare(`
    SELECT id, year, title, summary, file_url, status, sort_order, created_at, updated_at
    FROM annual_reports
    WHERE tenant_id = ? AND status = 'published'
    ORDER BY year DESC, sort_order ASC, updated_at DESC
  `).all(tenant.id);

  res.json({
    tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
    items: rows.map((row) => ({
      id: row.id,
      year: Number(row.year),
      title: row.title,
      summary: row.summary,
      fileUrl: row.file_url,
      sortOrder: Number(row.sort_order || 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
});

export default router;
