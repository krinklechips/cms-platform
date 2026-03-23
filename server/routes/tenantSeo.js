import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = Router();
router.use(requireAuth, requireTenantContext);

// ── Page Meta CRUD ──────────────────────────────────────────────────

router.get('/pages', (req, res) => {
  const tenantId = req.tenant.id;
  const rows = db.prepare(`
    SELECT * FROM seo_page_meta WHERE tenant_id = ? ORDER BY page_path
  `).all(tenantId);
  res.json({ pages: rows });
});

router.get('/pages/:path(*)', (req, res) => {
  const tenantId = req.tenant.id;
  const pagePath = '/' + (req.params.path || '').replace(/^\/+/, '');
  const row = db.prepare(`
    SELECT * FROM seo_page_meta WHERE tenant_id = ? AND page_path = ?
  `).get(tenantId, pagePath);

  if (!row) return res.json({ page: null });

  const keywords = db.prepare(`
    SELECT * FROM seo_keyword_tracking WHERE tenant_id = ? AND page_path = ?
  `).all(tenantId, pagePath);

  res.json({ page: row, keywords });
});

router.put('/pages/:path(*)', (req, res) => {
  const tenantId = req.tenant.id;
  const pagePath = '/' + (req.params.path || '').replace(/^\/+/, '');
  const {
    title, description, ogTitle, ogDescription, ogImage,
    twitterCard, twitterTitle, twitterDescription, twitterImage,
    canonicalUrl, noindex, nofollow, jsonLdType, jsonLdJson, keywords,
  } = req.body;

  db.prepare(`
    INSERT INTO seo_page_meta (
      tenant_id, page_path, title, description, og_title, og_description, og_image,
      twitter_card, twitter_title, twitter_description, twitter_image,
      canonical_url, noindex, nofollow, json_ld_type, json_ld_json, keywords, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id, page_path) DO UPDATE SET
      title = excluded.title, description = excluded.description,
      og_title = excluded.og_title, og_description = excluded.og_description, og_image = excluded.og_image,
      twitter_card = excluded.twitter_card, twitter_title = excluded.twitter_title,
      twitter_description = excluded.twitter_description, twitter_image = excluded.twitter_image,
      canonical_url = excluded.canonical_url, noindex = excluded.noindex, nofollow = excluded.nofollow,
      json_ld_type = excluded.json_ld_type, json_ld_json = excluded.json_ld_json,
      keywords = excluded.keywords, updated_at = CURRENT_TIMESTAMP
  `).run(
    tenantId, pagePath,
    title || null, description || null, ogTitle || null, ogDescription || null, ogImage || null,
    twitterCard || 'summary_large_image', twitterTitle || null, twitterDescription || null, twitterImage || null,
    canonicalUrl || null, noindex ? 1 : 0, nofollow ? 1 : 0,
    jsonLdType || null, jsonLdJson || null, keywords || null,
  );

  // Update keyword tracking
  if (Array.isArray(req.body.trackedKeywords)) {
    db.prepare('DELETE FROM seo_keyword_tracking WHERE tenant_id = ? AND page_path = ?').run(tenantId, pagePath);
    const insertKw = db.prepare(`
      INSERT INTO seo_keyword_tracking (tenant_id, page_path, keyword, is_primary) VALUES (?, ?, ?, ?)
    `);
    for (const kw of req.body.trackedKeywords) {
      if (kw.keyword) insertKw.run(tenantId, pagePath, kw.keyword, kw.isPrimary ? 1 : 0);
    }
  }

  const updated = db.prepare('SELECT * FROM seo_page_meta WHERE tenant_id = ? AND page_path = ?').get(tenantId, pagePath);
  res.json({ ok: true, page: updated });
});

router.delete('/pages/:path(*)', (req, res) => {
  const tenantId = req.tenant.id;
  const pagePath = '/' + (req.params.path || '').replace(/^\/+/, '');
  db.prepare('DELETE FROM seo_page_meta WHERE tenant_id = ? AND page_path = ?').run(tenantId, pagePath);
  db.prepare('DELETE FROM seo_keyword_tracking WHERE tenant_id = ? AND page_path = ?').run(tenantId, pagePath);
  res.json({ ok: true });
});

// ── Redirects CRUD ──────────────────────────────────────────────────

router.get('/redirects', (req, res) => {
  const tenantId = req.tenant.id;
  const rows = db.prepare('SELECT * FROM seo_redirects WHERE tenant_id = ? ORDER BY source_path').all(tenantId);
  res.json({ redirects: rows });
});

router.post('/redirects', (req, res) => {
  const tenantId = req.tenant.id;
  const { sourcePath, targetUrl, statusCode } = req.body;

  if (!sourcePath || !targetUrl) {
    return res.status(400).json({ error: 'sourcePath and targetUrl are required' });
  }

  const normalizedPath = '/' + sourcePath.replace(/^\/+/, '');
  const code = [301, 302].includes(statusCode) ? statusCode : 301;

  try {
    const result = db.prepare(`
      INSERT INTO seo_redirects (tenant_id, source_path, target_url, status_code) VALUES (?, ?, ?, ?)
    `).run(tenantId, normalizedPath, targetUrl, code);
    const redirect = db.prepare('SELECT * FROM seo_redirects WHERE id = ?').get(result.lastInsertRowid);
    res.json({ ok: true, redirect });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'A redirect for this path already exists' });
    }
    throw err;
  }
});

router.put('/redirects/:id', (req, res) => {
  const tenantId = req.tenant.id;
  const { id } = req.params;
  const { sourcePath, targetUrl, statusCode, isActive } = req.body;

  const existing = db.prepare('SELECT * FROM seo_redirects WHERE id = ? AND tenant_id = ?').get(id, tenantId);
  if (!existing) return res.status(404).json({ error: 'Redirect not found' });

  db.prepare(`
    UPDATE seo_redirects SET
      source_path = ?, target_url = ?, status_code = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND tenant_id = ?
  `).run(
    sourcePath ? '/' + sourcePath.replace(/^\/+/, '') : existing.source_path,
    targetUrl || existing.target_url,
    [301, 302].includes(statusCode) ? statusCode : existing.status_code,
    isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
    id, tenantId,
  );

  const updated = db.prepare('SELECT * FROM seo_redirects WHERE id = ?').get(id);
  res.json({ ok: true, redirect: updated });
});

router.delete('/redirects/:id', (req, res) => {
  const tenantId = req.tenant.id;
  const result = db.prepare('DELETE FROM seo_redirects WHERE id = ? AND tenant_id = ?').run(req.params.id, tenantId);
  if (result.changes === 0) return res.status(404).json({ error: 'Redirect not found' });
  res.json({ ok: true });
});

// ── Keywords ────────────────────────────────────────────────────────

router.get('/keywords', (req, res) => {
  const tenantId = req.tenant.id;
  const rows = db.prepare(`
    SELECT page_path, keyword, is_primary, created_at
    FROM seo_keyword_tracking WHERE tenant_id = ? ORDER BY page_path, is_primary DESC
  `).all(tenantId);
  res.json({ keywords: rows });
});

// ── SEO Audit ───────────────────────────────────────────────────────

router.get('/audit', (req, res) => {
  const tenantId = req.tenant.id;
  const issues = [];
  let score = 100;

  // Check articles for missing SEO fields
  const articles = db.prepare(`
    SELECT id, slug, title, seo_title, seo_description, seo_image, seo_canonical_url, cover_image
    FROM articles WHERE tenant_id = ? AND status = 'published'
  `).all(tenantId);

  for (const art of articles) {
    if (!art.seo_title) {
      issues.push({ severity: 'warning', type: 'missing_seo_title', page: `/articles/${art.slug}`, message: `Article "${art.title}" is missing an SEO title` });
      score -= 3;
    }
    if (!art.seo_description) {
      issues.push({ severity: 'warning', type: 'missing_seo_description', page: `/articles/${art.slug}`, message: `Article "${art.title}" is missing an SEO description` });
      score -= 3;
    } else if (art.seo_description.length < 50) {
      issues.push({ severity: 'info', type: 'short_seo_description', page: `/articles/${art.slug}`, message: `Article "${art.title}" has a very short SEO description (${art.seo_description.length} chars)` });
      score -= 1;
    } else if (art.seo_description.length > 160) {
      issues.push({ severity: 'info', type: 'long_seo_description', page: `/articles/${art.slug}`, message: `Article "${art.title}" SEO description exceeds 160 chars` });
      score -= 1;
    }
    if (!art.seo_image && !art.cover_image) {
      issues.push({ severity: 'warning', type: 'missing_og_image', page: `/articles/${art.slug}`, message: `Article "${art.title}" has no OG image or cover image` });
      score -= 2;
    }
    if (art.seo_title && art.seo_title.length > 60) {
      issues.push({ severity: 'info', type: 'long_seo_title', page: `/articles/${art.slug}`, message: `Article "${art.title}" SEO title exceeds 60 chars` });
      score -= 1;
    }
  }

  if (articles.length === 0) {
    issues.push({ severity: 'info', type: 'no_published_articles', page: '/', message: 'No published articles found' });
  }

  // Check page meta coverage
  const pageMeta = db.prepare('SELECT page_path, title, description, og_image FROM seo_page_meta WHERE tenant_id = ?').all(tenantId);
  for (const pm of pageMeta) {
    if (!pm.title) {
      issues.push({ severity: 'critical', type: 'missing_page_title', page: pm.page_path, message: `Page "${pm.page_path}" has no title tag` });
      score -= 5;
    }
    if (!pm.description) {
      issues.push({ severity: 'warning', type: 'missing_page_description', page: pm.page_path, message: `Page "${pm.page_path}" has no meta description` });
      score -= 3;
    }
  }

  // Check for duplicate meta descriptions
  const descriptions = articles.map(a => a.seo_description).filter(Boolean);
  const dupes = descriptions.filter((d, i) => descriptions.indexOf(d) !== i);
  if (dupes.length > 0) {
    issues.push({ severity: 'warning', type: 'duplicate_descriptions', page: '/', message: `${dupes.length} articles share the same SEO description` });
    score -= 5;
  }

  // Check redirects
  const redirectCount = db.prepare('SELECT COUNT(*) as count FROM seo_redirects WHERE tenant_id = ? AND is_active = 1').get(tenantId);

  score = Math.max(0, Math.min(100, score));

  res.json({
    score,
    totalIssues: issues.length,
    criticalCount: issues.filter(i => i.severity === 'critical').length,
    warningCount: issues.filter(i => i.severity === 'warning').length,
    infoCount: issues.filter(i => i.severity === 'info').length,
    issues,
    stats: {
      publishedArticles: articles.length,
      articlesWithSeo: articles.filter(a => a.seo_title && a.seo_description).length,
      pageMetaEntries: pageMeta.length,
      activeRedirects: redirectCount.count,
    },
  });
});

export default router;
