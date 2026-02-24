import express from 'express';
import { db, ensureDefaultTenantSlots } from '../db.js';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin.js';

const router = express.Router();

function mapTenant(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    branding: {
      logoUrl: row.logo_url,
      primaryColor: row.primary_color,
      supportEmail: row.support_email,
      publicSiteUrl: row.public_site_url,
      cmsDomain: row.cms_domain,
    },
    articleCount: Number(row.article_count || 0),
    contentItemCount: Number(row.content_item_count || 0),
    mediaCount: Number(row.media_count || 0),
    userCount: Number(row.user_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.use(requirePlatformAdmin);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT
      t.*,
      b.logo_url, b.primary_color, b.support_email, b.public_site_url, b.cms_domain,
      (SELECT COUNT(*) FROM articles a WHERE a.tenant_id = t.id) AS article_count,
      (SELECT COUNT(*) FROM content_items ci WHERE ci.tenant_id = t.id) AS content_item_count,
      (SELECT COUNT(*) FROM media m WHERE m.tenant_id = t.id) AS media_count,
      (SELECT COUNT(*) FROM tenant_memberships tm WHERE tm.tenant_id = t.id AND tm.status = 'active') AS user_count
    FROM tenants t
    LEFT JOIN tenant_branding b ON b.tenant_id = t.id
    ORDER BY t.created_at DESC
  `).all();

  res.json(rows.map(mapTenant));
});

router.post('/', (req, res) => {
  const {
    slug,
    name,
    status = 'active',
    branding = {},
  } = req.body ?? {};

  if (!slug || !name) {
    return res.status(400).json({ error: 'slug and name are required' });
  }

  const normalizedSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!normalizedSlug) {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  try {
    const info = db
      .prepare(`
        INSERT INTO tenants (slug, name, status, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `)
      .run(normalizedSlug, String(name).trim(), status === 'disabled' ? 'disabled' : 'active');

    const tenantId = info.lastInsertRowid;
    db.prepare(`
      INSERT INTO tenant_branding (
        tenant_id, logo_url, primary_color, support_email, public_site_url, cms_domain, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      tenantId,
      branding.logoUrl || null,
      branding.primaryColor || null,
      branding.supportEmail || null,
      branding.publicSiteUrl || null,
      branding.cmsDomain || null,
    );
    db.prepare(`
      INSERT INTO tenant_settings (tenant_id, settings_json, updated_at)
      VALUES (?, '{}', CURRENT_TIMESTAMP)
    `).run(tenantId);
    ensureDefaultTenantSlots(tenantId);

    const row = db.prepare(`
      SELECT t.*, b.logo_url, b.primary_color, b.support_email, b.public_site_url, b.cms_domain
      FROM tenants t
      LEFT JOIN tenant_branding b ON b.tenant_id = t.id
      WHERE t.id = ?
    `).get(tenantId);
    return res.status(201).json(mapTenant(row));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Tenant slug already exists' });
    }
    console.error('[platform] create tenant failed', err);
    return res.status(500).json({ error: 'Failed to create tenant' });
  }
});

router.put('/:id', (req, res) => {
  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const { name, status, branding = {} } = req.body ?? {};
  db.prepare(`
    UPDATE tenants
    SET name = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name?.trim() || tenant.name,
    status === 'disabled' ? 'disabled' : 'active',
    tenant.id,
  );

  db.prepare(`
    INSERT INTO tenant_branding (
      tenant_id, logo_url, primary_color, support_email, public_site_url, cms_domain, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO UPDATE SET
      logo_url = COALESCE(excluded.logo_url, tenant_branding.logo_url),
      primary_color = COALESCE(excluded.primary_color, tenant_branding.primary_color),
      support_email = COALESCE(excluded.support_email, tenant_branding.support_email),
      public_site_url = COALESCE(excluded.public_site_url, tenant_branding.public_site_url),
      cms_domain = COALESCE(excluded.cms_domain, tenant_branding.cms_domain),
      updated_at = CURRENT_TIMESTAMP
  `).run(
    tenant.id,
    branding.logoUrl ?? null,
    branding.primaryColor ?? null,
    branding.supportEmail ?? null,
    branding.publicSiteUrl ?? null,
    branding.cmsDomain ?? null,
  );

  const row = db.prepare(`
    SELECT t.*, b.logo_url, b.primary_color, b.support_email, b.public_site_url, b.cms_domain
    FROM tenants t
    LEFT JOIN tenant_branding b ON b.tenant_id = t.id
    WHERE t.id = ?
  `).get(tenant.id);
  return res.json(mapTenant(row));
});

export default router;
