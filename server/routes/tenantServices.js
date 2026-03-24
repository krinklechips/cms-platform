import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenantContext);

function slugify(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
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
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    priceNote: row.price_note,
    features: parseFeaturesJson(row.features_json),
    category: row.category,
    isFeatured: Boolean(row.is_featured),
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM services
    WHERE tenant_id = ?
    ORDER BY sort_order ASC
  `).all(req.tenant.id);
  res.json(rows.map(mapService));
});

router.post('/', (req, res) => {
  const {
    name,
    slug,
    description = null,
    price = null,
    priceNote = null,
    features = [],
    category = null,
    isFeatured = false,
    sortOrder = 0,
    status = 'published',
  } = req.body ?? {};

  if (!String(name || '').trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const nextName = String(name).trim();
  const nextSlug = slugify(slug || nextName);
  if (!nextSlug) return res.status(400).json({ error: 'A valid slug could not be generated' });

  const featuresArray = Array.isArray(features) ? features : [];
  const now = new Date().toISOString();

  try {
    const info = db.prepare(`
      INSERT INTO services (tenant_id, name, slug, description, price, price_note, features_json, category, is_featured, sort_order, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.tenant.id,
      nextName,
      nextSlug,
      description ? String(description).trim() : null,
      price ? String(price).trim() : null,
      priceNote ? String(priceNote).trim() : null,
      JSON.stringify(featuresArray),
      category ? String(category).trim() : null,
      isFeatured ? 1 : 0,
      Number(sortOrder) || 0,
      status === 'draft' ? 'draft' : 'published',
      now,
      now,
    );

    const row = db.prepare('SELECT * FROM services WHERE id = ?').get(info.lastInsertRowid);
    return res.status(201).json(mapService(row));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Slug already exists for this tenant' });
    }
    console.error('[tenant] create service failed', err);
    return res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const existing = db.prepare('SELECT * FROM services WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  if (!existing) return res.status(404).json({ error: 'Service not found' });

  const name = req.body?.name !== undefined ? String(req.body.name).trim() : existing.name;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const nextSlug = req.body?.slug !== undefined
    ? slugify(req.body.slug || name)
    : existing.slug;
  if (!nextSlug) return res.status(400).json({ error: 'A valid slug could not be generated' });

  const featuresArray = req.body?.features !== undefined
    ? (Array.isArray(req.body.features) ? req.body.features : [])
    : parseFeaturesJson(existing.features_json);

  const now = new Date().toISOString();

  try {
    db.prepare(`
      UPDATE services
      SET name = ?, slug = ?, description = ?, price = ?, price_note = ?, features_json = ?, category = ?, is_featured = ?, sort_order = ?, status = ?, updated_at = ?
      WHERE tenant_id = ? AND id = ?
    `).run(
      name,
      nextSlug,
      req.body?.description !== undefined ? (req.body.description ? String(req.body.description).trim() : null) : existing.description,
      req.body?.price !== undefined ? (req.body.price ? String(req.body.price).trim() : null) : existing.price,
      req.body?.priceNote !== undefined ? (req.body.priceNote ? String(req.body.priceNote).trim() : null) : existing.price_note,
      JSON.stringify(featuresArray),
      req.body?.category !== undefined ? (req.body.category ? String(req.body.category).trim() : null) : existing.category,
      req.body?.isFeatured !== undefined ? (req.body.isFeatured ? 1 : 0) : existing.is_featured,
      req.body?.sortOrder !== undefined ? (Number(req.body.sortOrder) || 0) : existing.sort_order,
      req.body?.status === 'draft' ? 'draft' : (req.body?.status === 'published' ? 'published' : existing.status),
      now,
      req.tenant.id,
      id,
    );
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Slug already exists for this tenant' });
    }
    console.error('[tenant] update service failed', err);
    return res.status(500).json({ error: 'Failed to update service' });
  }

  const row = db.prepare('SELECT * FROM services WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  return res.json(mapService(row));
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const info = db.prepare('DELETE FROM services WHERE tenant_id = ? AND id = ?').run(req.tenant.id, id);
  if (!info.changes) return res.status(404).json({ error: 'Service not found' });
  return res.json({ ok: true });
});

export default router;
