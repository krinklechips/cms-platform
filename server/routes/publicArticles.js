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

function isPublishedNow(publishAt) {
  if (!publishAt) return true;
  const ts = Date.parse(publishAt);
  if (Number.isNaN(ts)) return true;
  return ts <= Date.now();
}

function mapAttachment(row) {
  return {
    id: row.id,
    label: row.label,
    fileUrl: row.file_url,
    mimeType: row.mime_type,
    kind: row.kind,
    size: row.size,
    role: row.role,
    linkedAt: row.linked_at,
    createdAt: row.created_at,
  };
}

function fetchAttachments(articleId, tenantId) {
  return db.prepare(`
    SELECT
      m.id, m.label, m.file_url, m.mime_type, m.kind, m.size, m.created_at,
      am.role, am.created_at AS linked_at
    FROM article_media am
    JOIN media m ON m.id = am.media_id
    WHERE am.article_id = ? AND am.tenant_id = ?
    ORDER BY am.created_at DESC
  `).all(articleId, tenantId).map(mapAttachment);
}

function mapPublicArticle(row, { includeBody = false, includeAttachments = false } = {}) {
  const article = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.category,
    source: row.source,
    coverImage: row.cover_image,
    imageCaption: row.image_caption,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoImage: row.seo_image,
    seoCanonicalUrl: row.seo_canonical_url,
    seoNoIndex: Boolean(row.seo_noindex),
    publishAt: row.publish_at,
    firstPublishAt: row.first_publish_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (includeBody) article.body = row.body;
  if (includeAttachments) article.attachments = fetchAttachments(row.id, row.tenant_id);
  return article;
}

router.get('/articles', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const category = req.query.category ? String(req.query.category).trim() : null;
  const limitRaw = Number(req.query.limit || 20);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 100) : 20;

  const rows = db.prepare(`
    SELECT *
    FROM articles
    WHERE tenant_id = ?
      AND status = 'published'
      AND (? IS NULL OR category = ?)
    ORDER BY
      CASE WHEN publish_at IS NULL THEN 1 ELSE 0 END,
      publish_at DESC,
      updated_at DESC,
      created_at DESC
    LIMIT ?
  `).all(resolved.tenant.id, category, category, limit * 2);

  const items = rows
    .filter((row) => isPublishedNow(row.publish_at))
    .slice(0, limit)
    .map((row) => mapPublicArticle(row));

  return res.json({
    tenant: resolved.publicTenant,
    items,
  });
});

router.get('/articles/:slug', (req, res) => {
  const resolved = resolveTenant(req);
  if (resolved.error) return res.status(resolved.status || 400).json({ error: resolved.error });

  const slug = String(req.params.slug || '').trim();
  if (!slug) return res.status(400).json({ error: 'Article slug is required' });

  const row = db.prepare(`
    SELECT *
    FROM articles
    WHERE tenant_id = ?
      AND slug = ?
      AND status = 'published'
    LIMIT 1
  `).get(resolved.tenant.id, slug);

  if (!row || !isPublishedNow(row.publish_at)) {
    return res.status(404).json({ error: 'Article not found' });
  }

  return res.json({
    tenant: resolved.publicTenant,
    item: mapPublicArticle(row, { includeBody: true, includeAttachments: true }),
  });
});

export default router;
