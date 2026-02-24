import express from 'express';
import { db, ensureDefaultTenantSlots } from '../db.js';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin.js';

const router = express.Router();

router.use(requirePlatformAdmin);

function normalizeItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    type: row.type,
    title: row.title,
    summary: row.summary,
    body: row.body,
    imageUrl: row.image_url,
    location: row.location,
    ctaLabel: row.cta_label,
    ctaUrl: row.cta_url,
    status: row.status,
    publishStartAt: row.publish_start_at,
    publishEndAt: row.publish_end_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeAssignment(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    slotId: row.slot_id,
    contentItemId: row.content_item_id,
    tabKey: row.tab_key,
    sortOrder: Number(row.sort_order || 0),
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeSlot(row) {
  if (!row) return null;
  let config = {};
  try {
    config = row.config_json ? JSON.parse(row.config_json) : {};
  } catch (_) {
    config = {};
  }
  return {
    id: row.id,
    tenantId: row.tenant_id,
    slotKey: row.slot_key,
    pageKey: row.page_key,
    sectionKey: row.section_key,
    title: row.title,
    status: row.status,
    config,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getTenant(tenantId) {
  return db.prepare('SELECT id, slug, name, status FROM tenants WHERE id = ?').get(tenantId);
}

function ensureTenantSlot(tenantId, slotKey) {
  ensureDefaultTenantSlots(tenantId);
  let slot = db
    .prepare('SELECT * FROM page_slots WHERE tenant_id = ? AND slot_key = ?')
    .get(tenantId, slotKey);
  if (!slot && slotKey === 'home.news-promotions') {
    db.prepare(`
      INSERT INTO page_slots (
        tenant_id, slot_key, page_key, section_key, title, status, config_json, updated_at
      ) VALUES (?, ?, 'home', 'news-promotions', 'News & Promotions', 'active', '{"tabs":["news","promotions"],"maxItemsPerTab":6}', CURRENT_TIMESTAMP)
    `).run(tenantId, slotKey);
    slot = db.prepare('SELECT * FROM page_slots WHERE tenant_id = ? AND slot_key = ?').get(tenantId, slotKey);
  }
  return slot;
}

router.get('/tenants/:tenantId/content-items', (req, res) => {
  const tenantId = Number(req.params.tenantId);
  if (!tenantId) return res.status(400).json({ error: 'Invalid tenant id' });
  const tenant = getTenant(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const type = req.query.type ? String(req.query.type) : null;
  const status = req.query.status ? String(req.query.status) : null;
  const rows = db.prepare(`
    SELECT *
    FROM content_items
    WHERE tenant_id = ?
      AND (? IS NULL OR type = ?)
      AND (? IS NULL OR status = ?)
    ORDER BY updated_at DESC, created_at DESC
    LIMIT 200
  `).all(tenantId, type, type, status, status);

  res.json({ tenant, items: rows.map(normalizeItem) });
});

router.post('/tenants/:tenantId/content-items', (req, res) => {
  const tenantId = Number(req.params.tenantId);
  if (!tenantId) return res.status(400).json({ error: 'Invalid tenant id' });
  const tenant = getTenant(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const {
    type = 'news',
    title,
    summary = '',
    body = '',
    imageUrl = null,
    location = null,
    ctaLabel = null,
    ctaUrl = null,
    status = 'draft',
    publishStartAt = null,
    publishEndAt = null,
  } = req.body ?? {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const normalizedType = type === 'promotion' ? 'promotion' : 'news';
  const normalizedStatus = status === 'published' ? 'published' : 'draft';

  const info = db.prepare(`
    INSERT INTO content_items (
      tenant_id, type, title, summary, body, image_url, location, cta_label, cta_url, status,
      publish_start_at, publish_end_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(
    tenantId,
    normalizedType,
    String(title).trim(),
    String(summary || '').trim(),
    String(body || ''),
    imageUrl ? String(imageUrl).trim() : null,
    location ? String(location).trim() : null,
    ctaLabel ? String(ctaLabel).trim() : null,
    ctaUrl ? String(ctaUrl).trim() : null,
    normalizedStatus,
    publishStartAt || null,
    publishEndAt || null,
  );

  const row = db.prepare('SELECT * FROM content_items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(normalizeItem(row));
});

router.put('/content-items/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid content item id' });
  const existing = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Content item not found' });

  const next = {
    type: req.body?.type === 'promotion' ? 'promotion' : (req.body?.type === 'news' ? 'news' : existing.type),
    title: (req.body?.title ?? existing.title)?.toString().trim(),
    summary: (req.body?.summary ?? existing.summary ?? '').toString(),
    body: (req.body?.body ?? existing.body ?? '').toString(),
    imageUrl: req.body?.imageUrl === undefined ? existing.image_url : (req.body?.imageUrl || null),
    location: req.body?.location === undefined ? existing.location : (req.body?.location || null),
    ctaLabel: req.body?.ctaLabel === undefined ? existing.cta_label : (req.body?.ctaLabel || null),
    ctaUrl: req.body?.ctaUrl === undefined ? existing.cta_url : (req.body?.ctaUrl || null),
    status: req.body?.status === 'published' ? 'published' : (req.body?.status === 'draft' ? 'draft' : existing.status),
    publishStartAt: req.body?.publishStartAt === undefined ? existing.publish_start_at : (req.body?.publishStartAt || null),
    publishEndAt: req.body?.publishEndAt === undefined ? existing.publish_end_at : (req.body?.publishEndAt || null),
  };
  if (!next.title) return res.status(400).json({ error: 'title is required' });

  db.prepare(`
    UPDATE content_items
    SET type = ?, title = ?, summary = ?, body = ?, image_url = ?, location = ?, cta_label = ?, cta_url = ?,
        status = ?, publish_start_at = ?, publish_end_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    next.type,
    next.title,
    next.summary,
    next.body,
    next.imageUrl,
    next.location,
    next.ctaLabel,
    next.ctaUrl,
    next.status,
    next.publishStartAt,
    next.publishEndAt,
    id,
  );

  const row = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id);
  res.json(normalizeItem(row));
});

router.get('/tenants/:tenantId/slots/:slotKey', (req, res) => {
  const tenantId = Number(req.params.tenantId);
  if (!tenantId) return res.status(400).json({ error: 'Invalid tenant id' });
  const tenant = getTenant(tenantId);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const slot = ensureTenantSlot(tenantId, req.params.slotKey);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });

  const assignments = db.prepare(`
    SELECT si.*, ci.type, ci.title, ci.summary, ci.image_url, ci.location, ci.cta_label, ci.cta_url, ci.status AS content_status
    FROM slot_items si
    JOIN content_items ci ON ci.id = si.content_item_id
    WHERE si.tenant_id = ? AND si.slot_id = ?
    ORDER BY si.tab_key ASC, si.sort_order ASC, si.updated_at DESC
  `).all(tenantId, slot.id);

  const items = db.prepare(`
    SELECT *
    FROM content_items
    WHERE tenant_id = ?
    ORDER BY updated_at DESC, created_at DESC
    LIMIT 200
  `).all(tenantId);

  res.json({
    tenant,
    slot: normalizeSlot(slot),
    assignments: assignments.map((row) => ({
      ...normalizeAssignment(row),
      content: {
        id: row.content_item_id,
        type: row.type,
        title: row.title,
        summary: row.summary,
        imageUrl: row.image_url,
        location: row.location,
        ctaLabel: row.cta_label,
        ctaUrl: row.cta_url,
        status: row.content_status,
      },
    })),
    items: items.map(normalizeItem),
  });
});

router.post('/tenants/:tenantId/slots/:slotKey/assignments', (req, res) => {
  const tenantId = Number(req.params.tenantId);
  if (!tenantId) return res.status(400).json({ error: 'Invalid tenant id' });
  if (!getTenant(tenantId)) return res.status(404).json({ error: 'Tenant not found' });

  const slot = ensureTenantSlot(tenantId, req.params.slotKey);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });

  const contentItemId = Number(req.body?.contentItemId);
  if (!contentItemId) return res.status(400).json({ error: 'contentItemId is required' });

  const item = db.prepare('SELECT id, tenant_id FROM content_items WHERE id = ?').get(contentItemId);
  if (!item || item.tenant_id !== tenantId) {
    return res.status(404).json({ error: 'Content item not found for tenant' });
  }

  const tabKey = req.body?.tabKey === 'promotions' || req.body?.tabKey === 'promotion'
    ? 'promotions'
    : 'news';
  const sortOrder = Number.isFinite(Number(req.body?.sortOrder)) ? Number(req.body.sortOrder) : 0;
  const status = req.body?.status === 'hidden' ? 'hidden' : 'active';
  const startsAt = req.body?.startsAt || null;
  const endsAt = req.body?.endsAt || null;

  db.prepare(`
    INSERT INTO slot_items (
      tenant_id, slot_id, content_item_id, tab_key, sort_order, status, starts_at, ends_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(slot_id, content_item_id) DO UPDATE SET
      tab_key = excluded.tab_key,
      sort_order = excluded.sort_order,
      status = excluded.status,
      starts_at = excluded.starts_at,
      ends_at = excluded.ends_at,
      updated_at = CURRENT_TIMESTAMP
  `).run(tenantId, slot.id, contentItemId, tabKey, sortOrder, status, startsAt, endsAt);

  const row = db.prepare(`
    SELECT si.*, ci.type, ci.title, ci.summary, ci.image_url, ci.location, ci.cta_label, ci.cta_url, ci.status AS content_status
    FROM slot_items si
    JOIN content_items ci ON ci.id = si.content_item_id
    WHERE si.slot_id = ? AND si.content_item_id = ?
  `).get(slot.id, contentItemId);

  res.json({
    ...normalizeAssignment(row),
    content: {
      id: row.content_item_id,
      type: row.type,
      title: row.title,
      summary: row.summary,
      imageUrl: row.image_url,
      location: row.location,
      ctaLabel: row.cta_label,
      ctaUrl: row.cta_url,
      status: row.content_status,
    },
  });
});

router.delete('/slot-assignments/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid assignment id' });
  const info = db.prepare('DELETE FROM slot_items WHERE id = ?').run(id);
  if (!info.changes) return res.status(404).json({ error: 'Assignment not found' });
  res.json({ ok: true });
});

export default router;
