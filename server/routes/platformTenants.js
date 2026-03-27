import express from 'express';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { db, ensureDefaultTenantSlots } from '../db.js';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin.js';
import { isR2Configured, uploadBufferToR2 } from '../integrations/r2.js';
import { env } from '../config/env.js';

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
    domainProvisioning: {
      status: row.domain_status || null,
      verifiedAt: row.domain_verified_at || null,
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
      td.status AS domain_status,
      td.verified_at AS domain_verified_at,
      (SELECT COUNT(*) FROM articles a WHERE a.tenant_id = t.id) AS article_count,
      (SELECT COUNT(*) FROM content_items ci WHERE ci.tenant_id = t.id) AS content_item_count,
      (SELECT COUNT(*) FROM media m WHERE m.tenant_id = t.id) AS media_count,
      (SELECT COUNT(*) FROM tenant_memberships tm WHERE tm.tenant_id = t.id AND tm.status = 'active') AS user_count
    FROM tenants t
    LEFT JOIN tenant_branding b ON b.tenant_id = t.id
    LEFT JOIN tenant_domains td ON td.tenant_id = t.id
    ORDER BY t.created_at DESC
  `).all();

  res.json(rows.map(mapTenant));
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT
      t.*,
      b.logo_url, b.primary_color, b.support_email, b.public_site_url, b.cms_domain,
      td.status AS domain_status,
      td.verified_at AS domain_verified_at,
      (SELECT COUNT(*) FROM articles a WHERE a.tenant_id = t.id) AS article_count,
      (SELECT COUNT(*) FROM content_items ci WHERE ci.tenant_id = t.id) AS content_item_count,
      (SELECT COUNT(*) FROM media m WHERE m.tenant_id = t.id) AS media_count,
      (SELECT COUNT(*) FROM tenant_memberships tm WHERE tm.tenant_id = t.id AND tm.status = 'active') AS user_count
    FROM tenants t
    LEFT JOIN tenant_branding b ON b.tenant_id = t.id
    LEFT JOIN tenant_domains td ON td.tenant_id = t.id
    WHERE t.id = ?
  `).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Tenant not found' });
  res.json(mapTenant(row));
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
      .run(normalizedSlug, String(name).trim(), ['active','pending','inactive','suspended','disabled'].includes(status) ? status : 'active');

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
    ['active','pending','inactive','suspended','disabled'].includes(status) ? status : tenant.status,
    tenant.id,
  );

  // Merge incoming branding with existing values so partial saves don't wipe fields
  const existing = db.prepare('SELECT * FROM tenant_branding WHERE tenant_id = ?').get(tenant.id) || {};
  const merged = {
    logoUrl: branding.logoUrl !== undefined ? branding.logoUrl : (existing.logo_url || null),
    primaryColor: branding.primaryColor !== undefined ? branding.primaryColor : (existing.primary_color || null),
    supportEmail: branding.supportEmail !== undefined ? branding.supportEmail : (existing.support_email || null),
    publicSiteUrl: branding.publicSiteUrl !== undefined ? branding.publicSiteUrl : (existing.public_site_url || null),
    cmsDomain: branding.cmsDomain !== undefined ? branding.cmsDomain : (existing.cms_domain || null),
  };

  db.prepare(`
    INSERT INTO tenant_branding (
      tenant_id, logo_url, primary_color, support_email, public_site_url, cms_domain, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO UPDATE SET
      logo_url = excluded.logo_url,
      primary_color = excluded.primary_color,
      support_email = excluded.support_email,
      public_site_url = excluded.public_site_url,
      cms_domain = excluded.cms_domain,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    tenant.id,
    merged.logoUrl,
    merged.primaryColor,
    merged.supportEmail,
    merged.publicSiteUrl,
    merged.cmsDomain,
  );

  const row = db.prepare(`
    SELECT t.*, b.logo_url, b.primary_color, b.support_email, b.public_site_url, b.cms_domain
    FROM tenants t
    LEFT JOIN tenant_branding b ON b.tenant_id = t.id
    WHERE t.id = ?
  `).get(tenant.id);
  return res.json(mapTenant(row));
});

/* ------------------------------------------------------------------ */
/*  Logo upload                                                        */
/* ------------------------------------------------------------------ */

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']);

function r2PublicUrl(objectKey) {
  const base = (env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  return `${base}/${objectKey}`;
}

router.post('/:id/logo', async (req, res) => {
  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  if (!isR2Configured()) {
    return res.status(503).json({ error: 'File storage (R2) is not configured' });
  }

  try {
    const { default: formidable } = await import('formidable');
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5 MB for logos
      uploadDir: os.tmpdir(),
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const mime = file.mimetype || '';
    if (!ALLOWED_IMAGE_TYPES.has(mime)) {
      return res.status(400).json({ error: `Unsupported image type: ${mime}` });
    }

    const ext = path.extname(file.originalFilename || '.png');
    const objectKey = `tenants/${tenant.slug}/branding/logo${ext}`;
    const buffer = await fs.promises.readFile(file.filepath);

    await uploadBufferToR2({ objectKey, bytes: buffer, contentType: mime });
    const publicUrl = r2PublicUrl(objectKey);

    // Update tenant_branding.logo_url
    db.prepare(`
      UPDATE tenant_branding SET logo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ?
    `).run(publicUrl, tenant.id);

    // Clean up temp file
    fs.promises.unlink(file.filepath).catch(() => {});

    return res.json({ ok: true, logoUrl: publicUrl });
  } catch (err) {
    console.error('[platform] logo upload failed', err);
    return res.status(500).json({ error: 'Logo upload failed' });
  }
});

// ── Supabase integration config (per-tenant) ────────────────────────────────

function readTenantSettings(tenantId) {
  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
  try { return JSON.parse(row?.settings_json || '{}'); } catch { return {}; }
}

function writeTenantSettings(tenantId, next) {
  db.prepare(`
    INSERT INTO tenant_settings (tenant_id, settings_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO UPDATE SET
      settings_json = excluded.settings_json,
      updated_at    = CURRENT_TIMESTAMP
  `).run(tenantId, JSON.stringify(next));
}

// GET /api/platform/tenants/:id/supabase
router.get('/:id/supabase', (req, res) => {
  const tenant = db.prepare('SELECT id FROM tenants WHERE id = ?').get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const settings = readTenantSettings(tenant.id);
  const sb = settings.supabase ?? {};
  res.json({
    supabaseUrl:        sb.url        ?? '',
    supabaseAnonKey:    sb.anonKey    ?? '',
    // return whether service key is set without exposing the value
    hasServiceKey:      Boolean(sb.serviceKey),
  });
});

// PUT /api/platform/tenants/:id/supabase
router.put('/:id/supabase', (req, res) => {
  const tenant = db.prepare('SELECT id FROM tenants WHERE id = ?').get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } = req.body ?? {};
  const current = readTenantSettings(tenant.id);

  const existing = current.supabase ?? {};
  current.supabase = {
    url:        supabaseUrl        !== undefined ? String(supabaseUrl || '').trim()        : (existing.url        ?? ''),
    anonKey:    supabaseAnonKey    !== undefined ? String(supabaseAnonKey || '').trim()    : (existing.anonKey    ?? ''),
    // Only update serviceKey if explicitly provided (empty string = clear it)
    serviceKey: supabaseServiceKey !== undefined ? String(supabaseServiceKey || '').trim() : (existing.serviceKey ?? ''),
  };

  writeTenantSettings(tenant.id, current);
  res.json({ ok: true, supabaseUrl: current.supabase.url, hasServiceKey: Boolean(current.supabase.serviceKey) });
});

export default router;
