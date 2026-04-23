import express from 'express';
import { db } from '../db.js';

const router = express.Router();

function isRowActive(row) {
  return row.assignment_status === 'active' && row.content_status === 'published';
}

function isRowWithinWindows(row) {
  return isNowWithinWindow(row.starts_at, row.ends_at) &&
    isNowWithinWindow(row.publish_start_at, row.publish_end_at);
}

function groupRowsByTab(rows, tabs, maxItemsPerTab) {
  const grouped = Object.fromEntries(tabs.map((tab) => [tab, []]));
  for (const row of rows) {
    if (!isRowActive(row)) continue;
    if (!isRowWithinWindows(row)) continue;
    const tab = tabs.includes(row.tab_key) ? row.tab_key : tabs[0];
    if (grouped[tab].length >= maxItemsPerTab) continue;
    grouped[tab].push({
      id: row.id,
      type: row.type,
      title: row.title,
      summary: row.summary,
      body: row.body,
      imageUrl: row.image_url,
      location: row.location,
      ctaLabel: row.cta_label || 'Read More',
      ctaUrl: row.cta_url || '#',
      sortOrder: Number(row.sort_order || 0),
      updatedAt: row.updated_at,
    });
  }
  return grouped;
}

function isNowWithinWindow(start, end) {
  const now = Date.now();
  if (start) {
    const s = Date.parse(start);
    if (!Number.isNaN(s) && s > now) return false;
  }
  if (end) {
    const e = Date.parse(end);
    if (!Number.isNaN(e) && e < now) return false;
  }
  return true;
}

router.get('/slots/:slotKey', (req, res) => {
  const slotKey = String(req.params.slotKey || '');
  const tenantSlug = req.query.tenantSlug ? String(req.query.tenantSlug) : null;
  const tenantId = req.query.tenantId ? Number(req.query.tenantId) : null;
  if (!slotKey) return res.status(400).json({ error: 'slotKey is required' });
  if (!tenantSlug && !tenantId) {
    return res.status(400).json({ error: 'tenantSlug or tenantId query parameter is required' });
  }

  const tenant = tenantSlug
    ? db.prepare('SELECT id, slug, name, status FROM tenants WHERE slug = ?').get(tenantSlug)
    : db.prepare('SELECT id, slug, name, status FROM tenants WHERE id = ?').get(tenantId);
  if (!tenant || tenant.status !== 'active') {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  const slot = db.prepare(`
    SELECT *
    FROM page_slots
    WHERE tenant_id = ? AND slot_key = ? AND status = 'active'
  `).get(tenant.id, slotKey);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });

  let config = {};
  try {
    config = slot.config_json ? JSON.parse(slot.config_json) : {};
  } catch (_) {
    config = {};
  }
  const tabs = Array.isArray(config.tabs) && config.tabs.length ? config.tabs : ['news', 'promotions'];

  const rows = db.prepare(`
    SELECT
      si.id AS assignment_id,
      si.tab_key, si.sort_order, si.status AS assignment_status, si.starts_at, si.ends_at,
      ci.id, ci.type, ci.title, ci.summary, ci.body, ci.image_url, ci.location, ci.cta_label, ci.cta_url,
      ci.status AS content_status, ci.publish_start_at, ci.publish_end_at, ci.updated_at
    FROM slot_items si
    JOIN content_items ci ON ci.id = si.content_item_id
    WHERE si.tenant_id = ? AND si.slot_id = ?
    ORDER BY si.tab_key ASC, si.sort_order ASC, ci.updated_at DESC
  `).all(tenant.id, slot.id);

  const maxItemsPerTab = Number(config.maxItemsPerTab || 6);
  const grouped = groupRowsByTab(rows, tabs, maxItemsPerTab);

  res.json({
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
    },
    slot: {
      key: slot.slot_key,
      pageKey: slot.page_key,
      sectionKey: slot.section_key,
      title: slot.title,
      tabs,
      config,
    },
    itemsByTab: grouped,
  });
});

export default router;
