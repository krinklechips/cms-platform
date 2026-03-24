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

function mapTestimonial(row) {
  return {
    id: row.id,
    authorName: row.author_name,
    authorTitle: row.author_title,
    authorPhotoUrl: row.author_photo_url,
    quote: row.quote,
    youtubeUrl: row.youtube_url,
    rating: row.rating,
    isFeatured: Boolean(row.is_featured),
    sortOrder: row.sort_order,
  };
}

router.get('/testimonials', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const rows = db.prepare(`
    SELECT * FROM testimonials
    WHERE tenant_id = ? AND status = 'published'
    ORDER BY sort_order ASC
  `).all(resolved.tenant.id);

  return res.json({ items: rows.map(mapTestimonial) });
});

export default router;
