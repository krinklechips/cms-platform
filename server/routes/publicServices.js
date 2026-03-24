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

function parseFeaturesJson(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapService(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    priceNote: row.price_note,
    features: parseFeaturesJson(row.features_json),
    category: row.category,
    isFeatured: Boolean(row.is_featured),
    sortOrder: row.sort_order,
  };
}

router.get('/services', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const rows = db.prepare(`
    SELECT * FROM services
    WHERE tenant_id = ? AND status = 'published'
    ORDER BY sort_order ASC
  `).all(resolved.tenant.id);

  return res.json({ items: rows.map(mapService) });
});

export default router;
