import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenantContext);

function slugifyLocal(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function normalizeStatus(value, fallback = 'published') {
  if (value === 'draft') return 'draft';
  if (value === 'archived') return 'archived';
  if (value === 'published') return 'published';
  return fallback;
}

function normalizeBool(value) {
  return value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0;
}

function normalizeInt(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.trunc(num) : fallback;
}

function normalizeMetadata(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
}

function safeJsonParse(value, fallback = {}) {
  try {
    const parsed = JSON.parse(value || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function mapProductLine(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    slug: row.slug,
    label: row.label,
    summary: row.summary,
    href: row.href,
    groupKey: row.group_key,
    groupLabel: row.group_label,
    itemType: row.item_type,
    status: row.status,
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order || 0),
    metadata: safeJsonParse(row.metadata_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/', (req, res) => {
  const status = req.query.status ? String(req.query.status).trim() : null;
  const groupKey = req.query.groupKey ? String(req.query.groupKey).trim() : null;
  const itemType = req.query.itemType ? String(req.query.itemType).trim() : null;

  const rows = db.prepare(`
    SELECT *
    FROM product_lines
    WHERE tenant_id = ?
      AND (? IS NULL OR status = ?)
      AND (? IS NULL OR group_key = ?)
      AND (? IS NULL OR item_type = ?)
    ORDER BY group_key ASC, sort_order ASC, label COLLATE NOCASE ASC, updated_at DESC
  `).all(req.tenant.id, status, status, groupKey, groupKey, itemType, itemType);

  res.json(rows.map(mapProductLine));
});

router.post('/', (req, res) => {
  const {
    label,
    slug,
    summary = '',
    href = '',
    groupKey = 'equipment',
    groupLabel = '',
    itemType = 'product',
    status = 'published',
    featured = false,
    sortOrder = 0,
    metadata = {},
  } = req.body ?? {};

  const nextLabel = String(label || '').trim();
  if (!nextLabel) return res.status(400).json({ error: 'label is required' });

  const nextSlug = slugifyLocal(slug || nextLabel);
  if (!nextSlug) return res.status(400).json({ error: 'A valid slug could not be generated' });

  const nextGroupKey = slugifyLocal(groupKey || 'equipment') || 'equipment';
  const now = new Date().toISOString();

  try {
    const info = db.prepare(`
      INSERT INTO product_lines (
        tenant_id, slug, label, summary, href, group_key, group_label, item_type, status,
        featured, sort_order, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.tenant.id,
      nextSlug,
      nextLabel,
      String(summary || '').trim(),
      String(href || '').trim(),
      nextGroupKey,
      String(groupLabel || '').trim() || null,
      slugifyLocal(itemType || 'product') || 'product',
      normalizeStatus(status, 'published'),
      normalizeBool(featured),
      normalizeInt(sortOrder, 0),
      JSON.stringify(normalizeMetadata(metadata)),
      now,
      now,
    );

    const row = db.prepare('SELECT * FROM product_lines WHERE tenant_id = ? AND id = ?').get(req.tenant.id, info.lastInsertRowid);
    return res.status(201).json(mapProductLine(row));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Slug already exists for this tenant' });
    }
    console.error('[tenant] create product line failed', err);
    return res.status(500).json({ error: 'Failed to create product line' });
  }
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid product line id' });

  const existing = db.prepare('SELECT * FROM product_lines WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  if (!existing) return res.status(404).json({ error: 'Product line not found' });

  const nextLabel = req.body?.label !== undefined ? String(req.body.label || '').trim() : existing.label;
  if (!nextLabel) return res.status(400).json({ error: 'label is required' });

  const nextSlug = req.body?.slug !== undefined
    ? slugifyLocal(req.body.slug || nextLabel)
    : (req.body?.label !== undefined ? slugifyLocal(nextLabel) : existing.slug);
  if (!nextSlug) return res.status(400).json({ error: 'A valid slug could not be generated' });

  const nextGroupKey = req.body?.groupKey !== undefined
    ? (slugifyLocal(req.body.groupKey || 'equipment') || 'equipment')
    : existing.group_key;
  const nextItemType = req.body?.itemType !== undefined
    ? (slugifyLocal(req.body.itemType || 'product') || 'product')
    : existing.item_type;
  const nextMetadata = req.body?.metadata !== undefined
    ? JSON.stringify(normalizeMetadata(req.body.metadata))
    : (existing.metadata_json || '{}');

  try {
    db.prepare(`
      UPDATE product_lines
      SET slug = ?, label = ?, summary = ?, href = ?, group_key = ?, group_label = ?, item_type = ?,
          status = ?, featured = ?, sort_order = ?, metadata_json = ?, updated_at = ?
      WHERE tenant_id = ? AND id = ?
    `).run(
      nextSlug,
      nextLabel,
      req.body?.summary !== undefined ? String(req.body.summary || '').trim() : (existing.summary || ''),
      req.body?.href !== undefined ? String(req.body.href || '').trim() : (existing.href || ''),
      nextGroupKey,
      req.body?.groupLabel !== undefined ? (String(req.body.groupLabel || '').trim() || null) : existing.group_label,
      nextItemType,
      req.body?.status !== undefined ? normalizeStatus(req.body.status, existing.status) : existing.status,
      req.body?.featured !== undefined ? normalizeBool(req.body.featured) : Number(existing.featured || 0),
      req.body?.sortOrder !== undefined ? normalizeInt(req.body.sortOrder, Number(existing.sort_order || 0)) : Number(existing.sort_order || 0),
      nextMetadata,
      new Date().toISOString(),
      req.tenant.id,
      id,
    );
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Slug already exists for this tenant' });
    }
    console.error('[tenant] update product line failed', err);
    return res.status(500).json({ error: 'Failed to update product line' });
  }

  const row = db.prepare('SELECT * FROM product_lines WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  return res.json(mapProductLine(row));
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid product line id' });
  const info = db.prepare('DELETE FROM product_lines WHERE tenant_id = ? AND id = ?').run(req.tenant.id, id);
  if (!info.changes) return res.status(404).json({ error: 'Product line not found' });
  return res.json({ ok: true });
});

export default router;
