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

function asTrimmedString(value, fallback = '') {
  return value === undefined || value === null ? fallback : String(value);
}

function resolveArticleStatus(bodyStatus, existingStatus) {
  if (bodyStatus === 'published') return 'published';
  if (bodyStatus === 'draft') return 'draft';
  return existingStatus;
}

function resolveArticleCategory(bodyCategory, existingCategory) {
  if (bodyCategory === undefined) return existingCategory || 'newsroom';
  return String(bodyCategory || 'newsroom').trim() || 'newsroom';
}

function resolveArticleSource(bodySource, existingSource) {
  if (bodySource === undefined) return existingSource || 'manual';
  return String(bodySource || 'manual').trim() || 'manual';
}

function resolveFirstPublish(nextStatus, existing, now, sessionEmail) {
  if (nextStatus === 'published' && !existing.first_publish_at) {
    return {
      firstPublishAt: now,
      publishedBy: sessionEmail || existing.published_by || null,
    };
  }
  return { firstPublishAt: existing.first_publish_at, publishedBy: existing.published_by };
}

function normalizeSeoPayload(input = {}) {
  const nullableTrim = (value) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    return trimmed || null;
  };
  return {
    seoTitle: nullableTrim(input.seoTitle),
    seoDescription: nullableTrim(input.seoDescription),
    seoImage: nullableTrim(input.seoImage),
    seoCanonicalUrl: nullableTrim(input.seoCanonicalUrl),
    seoNoIndex:
      input.seoNoIndex === true ||
      input.seoNoIndex === 1 ||
      input.seoNoIndex === '1' ||
      input.seoNoIndex === 'true'
        ? 1
        : 0,
  };
}

function mapMedia(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    label: row.label,
    fileUrl: row.file_url,
    mimeType: row.mime_type,
    kind: row.kind,
    size: row.size,
    createdAt: row.created_at,
  };
}

const attachmentRowsStmt = db.prepare(`
  SELECT m.id, m.tenant_id, m.label, m.file_url, m.mime_type, m.kind, m.size, am.role, am.created_at
  FROM article_media am
  JOIN media m ON m.id = am.media_id
  WHERE am.article_id = ? AND am.tenant_id = ?
  ORDER BY am.created_at DESC
`);

function fetchAttachments(articleId, tenantId) {
  return attachmentRowsStmt.all(articleId, tenantId).map((row) => ({
    ...mapMedia(row),
    role: row.role,
    linkedAt: row.created_at,
  }));
}

function mapArticle(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    status: row.status,
    category: row.category,
    source: row.source,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoImage: row.seo_image,
    seoCanonicalUrl: row.seo_canonical_url,
    seoNoIndex: Boolean(row.seo_noindex),
    publishAt: row.publish_at,
    firstPublishAt: row.first_publish_at,
    publishedBy: row.published_by,
    coverImage: row.cover_image,
    imageCaption: row.image_caption,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapArticleWithAttachments(row) {
  const article = mapArticle(row);
  if (!article) return null;
  article.attachments = fetchAttachments(article.id, article.tenantId);
  return article;
}

router.get('/', (req, res) => {
  const status = req.query.status ? String(req.query.status) : null;
  const category = req.query.category ? String(req.query.category) : null;
  const rows = db.prepare(`
    SELECT *
    FROM articles
    WHERE tenant_id = ?
      AND (? IS NULL OR status = ?)
      AND (? IS NULL OR category = ?)
    ORDER BY
      CASE WHEN publish_at IS NULL THEN 1 ELSE 0 END,
      publish_at DESC,
      updated_at DESC,
      created_at DESC
    LIMIT 500
  `).all(req.tenant.id, status, status, category, category);

  res.json(rows.map(mapArticleWithAttachments));
});

router.get('/slug/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM articles WHERE tenant_id = ? AND slug = ?').get(req.tenant.id, req.params.slug);
  if (!row) return res.status(404).json({ error: 'Article not found' });
  return res.json(mapArticleWithAttachments(row));
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid article id' });
  const row = db.prepare('SELECT * FROM articles WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  if (!row) return res.status(404).json({ error: 'Article not found' });
  return res.json(mapArticleWithAttachments(row));
});

router.post('/', (req, res) => {
  const {
    title,
    summary = '',
    body = '',
    status = 'draft',
    category = 'newsroom',
    source = 'manual',
    seoTitle,
    seoDescription,
    seoImage,
    seoCanonicalUrl,
    seoNoIndex,
    publishAt = null,
    coverImage = '',
    imageCaption = '',
    attachments = [],
  } = req.body ?? {};

  if (!String(title || '').trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  const slug = slugifyLocal(req.body?.slug || title);
  if (!slug) return res.status(400).json({ error: 'A valid slug could not be generated' });

  const now = new Date().toISOString();
  const normalizedStatus = status === 'published' ? 'published' : 'draft';
  const normalizedCategory = String(category || 'newsroom').trim() || 'newsroom';
  const articleSource = String(source || 'manual').trim() || 'manual';
  const seo = normalizeSeoPayload({ seoTitle, seoDescription, seoImage, seoCanonicalUrl, seoNoIndex });
  const firstPublishAt = normalizedStatus === 'published' ? now : null;
  const publishedBy = normalizedStatus === 'published' ? (req.session?.user?.email || null) : null;

  try {
    const info = db.prepare(`
      INSERT INTO articles (
        tenant_id, slug, title, summary, body, status, category, source,
        seo_title, seo_description, seo_image, seo_canonical_url, seo_noindex,
        publish_at, first_publish_at, published_by, cover_image, image_caption,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.tenant.id,
      slug,
      String(title).trim(),
      asTrimmedString(summary, ''),
      asTrimmedString(body, ''),
      normalizedStatus,
      normalizedCategory,
      articleSource,
      seo.seoTitle,
      seo.seoDescription,
      seo.seoImage,
      seo.seoCanonicalUrl,
      seo.seoNoIndex,
      publishAt || null,
      firstPublishAt,
      publishedBy,
      asTrimmedString(coverImage, '').trim(),
      asTrimmedString(imageCaption, '').trim(),
      now,
      now,
    );

    syncArticleAttachments({
      tenantId: req.tenant.id,
      articleId: Number(info.lastInsertRowid),
      attachmentIds: attachments,
    });

    const row = db.prepare('SELECT * FROM articles WHERE tenant_id = ? AND id = ?').get(req.tenant.id, info.lastInsertRowid);
    return res.status(201).json(mapArticleWithAttachments(row));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Slug already exists for this tenant' });
    }
    console.error('[tenant] create article failed', err);
    return res.status(500).json({ error: 'Failed to create article' });
  }
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid article id' });
  const existing = db.prepare('SELECT * FROM articles WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  if (!existing) return res.status(404).json({ error: 'Article not found' });

  const nextTitle = req.body?.title !== undefined ? String(req.body.title).trim() : existing.title;
  if (!nextTitle) return res.status(400).json({ error: 'title is required' });
  const nextSlug = req.body?.slug !== undefined
    ? slugifyLocal(req.body.slug || nextTitle)
    : (req.body?.title !== undefined ? slugifyLocal(nextTitle) : existing.slug);
  if (!nextSlug) return res.status(400).json({ error: 'A valid slug could not be generated' });

  const nextStatus = resolveArticleStatus(req.body?.status, existing.status);
  const seo = normalizeSeoPayload({
    seoTitle: req.body?.seoTitle,
    seoDescription: req.body?.seoDescription,
    seoImage: req.body?.seoImage,
    seoCanonicalUrl: req.body?.seoCanonicalUrl,
    seoNoIndex: req.body?.seoNoIndex,
  });

  const now = new Date().toISOString();
  const { firstPublishAt, publishedBy } = resolveFirstPublish(nextStatus, existing, now, req.session?.user?.email);

  try {
    db.prepare(`
      UPDATE articles
      SET slug = ?, title = ?, summary = ?, body = ?, status = ?, category = ?, source = ?,
          seo_title = ?, seo_description = ?, seo_image = ?, seo_canonical_url = ?, seo_noindex = ?,
          publish_at = ?, first_publish_at = ?, published_by = ?, cover_image = ?, image_caption = ?, updated_at = ?
      WHERE tenant_id = ? AND id = ?
    `).run(
      nextSlug,
      nextTitle,
      req.body?.summary !== undefined ? asTrimmedString(req.body.summary, '') : (existing.summary ?? ''),
      req.body?.body !== undefined ? asTrimmedString(req.body.body, '') : (existing.body ?? ''),
      nextStatus,
      resolveArticleCategory(req.body?.category, existing.category),
      resolveArticleSource(req.body?.source, existing.source),
      req.body?.seoTitle !== undefined ? seo.seoTitle : existing.seo_title,
      req.body?.seoDescription !== undefined ? seo.seoDescription : existing.seo_description,
      req.body?.seoImage !== undefined ? seo.seoImage : existing.seo_image,
      req.body?.seoCanonicalUrl !== undefined ? seo.seoCanonicalUrl : existing.seo_canonical_url,
      req.body?.seoNoIndex !== undefined ? seo.seoNoIndex : (existing.seo_noindex ?? 0),
      req.body?.publishAt !== undefined ? (req.body.publishAt || null) : existing.publish_at,
      firstPublishAt,
      publishedBy,
      req.body?.coverImage !== undefined ? asTrimmedString(req.body.coverImage, '').trim() : (existing.cover_image || ''),
      req.body?.imageCaption !== undefined ? asTrimmedString(req.body.imageCaption, '').trim() : (existing.image_caption || ''),
      now,
      req.tenant.id,
      id,
    );

    if (Array.isArray(req.body?.attachments)) {
      syncArticleAttachments({
        tenantId: req.tenant.id,
        articleId: id,
        attachmentIds: req.body.attachments,
      });
    }

    const row = db.prepare('SELECT * FROM articles WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
    return res.json(mapArticleWithAttachments(row));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Slug already exists for this tenant' });
    }
    console.error('[tenant] update article failed', err);
    return res.status(500).json({ error: 'Failed to update article' });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid article id' });
  const info = db.prepare('DELETE FROM articles WHERE tenant_id = ? AND id = ?').run(req.tenant.id, id);
  if (!info.changes) return res.status(404).json({ error: 'Article not found' });
  return res.json({ ok: true });
});

function syncArticleAttachments({ tenantId, articleId, attachmentIds }) {
  const normalizedIds = Array.isArray(attachmentIds)
    ? [...new Set(attachmentIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))]
    : [];
  db.prepare('DELETE FROM article_media WHERE tenant_id = ? AND article_id = ?').run(tenantId, articleId);
  if (!normalizedIds.length) return;

  const validMediaIds = db.prepare(`
    SELECT id
    FROM media
    WHERE tenant_id = ?
      AND id IN (${normalizedIds.map(() => '?').join(',')})
  `).all(tenantId, ...normalizedIds).map((row) => row.id);

  const insertLink = db.prepare(`
    INSERT OR IGNORE INTO article_media (tenant_id, article_id, media_id, role)
    VALUES (?, ?, ?, 'attachment')
  `);
  validMediaIds.forEach((mediaId) => insertLink.run(tenantId, articleId, mediaId));
}

export default router;
