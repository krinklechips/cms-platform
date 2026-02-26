import express from 'express';
import { db } from '../db.js';

const router = express.Router();

function resolveTenant(req) {
  const tenantSlug = req.query.tenantSlug ? String(req.query.tenantSlug) : null;
  const tenantId = req.query.tenantId ? Number(req.query.tenantId) : null;
  if (!tenantSlug && !tenantId) return { error: 'tenantSlug or tenantId query parameter is required' };

  const tenant = tenantSlug
    ? db.prepare(`
        SELECT t.id, t.slug, t.name, t.status, b.logo_url, b.primary_color, b.support_email, b.public_site_url
        FROM tenants t
        LEFT JOIN tenant_branding b ON b.tenant_id = t.id
        WHERE t.slug = ?
      `).get(tenantSlug)
    : db.prepare(`
        SELECT t.id, t.slug, t.name, t.status, b.logo_url, b.primary_color, b.support_email, b.public_site_url
        FROM tenants t
        LEFT JOIN tenant_branding b ON b.tenant_id = t.id
        WHERE t.id = ?
      `).get(tenantId);

  if (!tenant || tenant.status !== 'active') return { error: 'Tenant not found', status: 404 };
  return {
    tenant,
    publicTenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      branding: {
        logoUrl: tenant.logo_url || null,
        primaryColor: tenant.primary_color || null,
        supportEmail: tenant.support_email || null,
        publicSiteUrl: tenant.public_site_url || null,
      },
    },
  };
}

function safeJsonParse(value, fallback = {}) {
  try {
    const parsed = JSON.parse(value || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function mapItem(row) {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    summary: row.summary,
    href: row.href,
    groupKey: row.group_key,
    groupLabel: row.group_label,
    itemType: row.item_type,
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order || 0),
    metadata: safeJsonParse(row.metadata_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/product-lines', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const groupKey = req.query.groupKey ? String(req.query.groupKey).trim().toLowerCase() : null;
  const itemType = req.query.itemType ? String(req.query.itemType).trim().toLowerCase() : null;
  const featuredOnly = req.query.featured === '1' || req.query.featured === 'true';
  const limitRaw = Number(req.query.limit || 200);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 500) : 200;

  const rows = db.prepare(`
    SELECT *
    FROM product_lines
    WHERE tenant_id = ?
      AND status = 'published'
      AND (? IS NULL OR LOWER(group_key) = ?)
      AND (? IS NULL OR LOWER(item_type) = ?)
      AND (? = 0 OR featured = 1)
    ORDER BY group_key ASC, sort_order ASC, label COLLATE NOCASE ASC, updated_at DESC
    LIMIT ?
  `).all(
    resolved.tenant.id,
    groupKey,
    groupKey,
    itemType,
    itemType,
    featuredOnly ? 1 : 0,
    limit,
  );

  const items = rows.map(mapItem);
  const groupsMap = new Map();
  for (const item of items) {
    const key = item.groupKey || 'default';
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        label: item.groupLabel || null,
        items: [],
      });
    }
    const group = groupsMap.get(key);
    if (!group.label && item.groupLabel) group.label = item.groupLabel;
    group.items.push(item);
  }

  return res.json({
    tenant: resolved.publicTenant,
    groups: Array.from(groupsMap.values()),
    items,
  });
});

router.get('/product-lines/:slug', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const slug = String(req.params.slug || '').trim();
  if (!slug) return res.status(400).json({ error: 'Product line slug is required' });

  const row = db.prepare(`
    SELECT *
    FROM product_lines
    WHERE tenant_id = ? AND slug = ? AND status = 'published'
    LIMIT 1
  `).get(resolved.tenant.id, slug);

  if (!row) return res.status(404).json({ error: 'Product line not found' });

  return res.json({
    tenant: resolved.publicTenant,
    item: mapItem(row),
  });
});

export default router;
