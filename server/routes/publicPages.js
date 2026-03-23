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

function mapPublicPage(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    template: row.template,
    sortOrder: row.sort_order,
    showInNav: Boolean(row.show_in_nav),
    navLabel: row.nav_label,
    navParentId: row.nav_parent_id,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoImage: row.seo_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBlock(row) {
  let blockData = {};
  try {
    blockData = JSON.parse(row.block_data);
  } catch {
    blockData = {};
  }
  return {
    id: row.id,
    blockType: row.block_type,
    blockData,
    sortOrder: row.sort_order,
  };
}

// GET /api/public/pages — published navigation tree
router.get('/pages', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const rows = db.prepare(`
    SELECT *
    FROM pages
    WHERE tenant_id = ?
      AND status = 'published'
      AND show_in_nav = 1
    ORDER BY sort_order ASC, title ASC
  `).all(resolved.tenant.id);

  const pages = rows.map(mapPublicPage);
  const byId = new Map(pages.map((p) => [p.id, { ...p, children: [] }]));
  const tree = [];

  for (const page of byId.values()) {
    if (page.navParentId && byId.has(page.navParentId)) {
      byId.get(page.navParentId).children.push(page);
    } else {
      tree.push(page);
    }
  }

  return res.json({
    tenant: resolved.publicTenant,
    items: tree,
  });
});

// GET /api/public/pages/:slug — single published page with blocks
router.get('/pages/:slug', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const slug = String(req.params.slug || '').trim();
  if (!slug) return res.status(400).json({ error: 'Page slug is required' });

  const row = db.prepare(`
    SELECT *
    FROM pages
    WHERE tenant_id = ?
      AND slug = ?
      AND status = 'published'
    LIMIT 1
  `).get(resolved.tenant.id, slug);

  if (!row) return res.status(404).json({ error: 'Page not found' });

  const blocks = db.prepare(`
    SELECT * FROM page_blocks
    WHERE page_id = ? AND tenant_id = ?
    ORDER BY sort_order ASC
  `).all(row.id, resolved.tenant.id);

  const page = mapPublicPage(row);
  page.blocks = blocks.map(mapBlock);

  return res.json({
    tenant: resolved.publicTenant,
    item: page,
  });
});

export default router;
