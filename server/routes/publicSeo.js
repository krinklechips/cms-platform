import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// ── Sitemap XML ─────────────────────────────────────────────────────

router.get('/:tenantSlug/sitemap.xml', (req, res) => {
  const { tenantSlug } = req.params;
  const tenant = db.prepare(`
    SELECT t.id, tb.public_site_url, tb.cms_domain
    FROM tenants t LEFT JOIN tenant_branding tb ON tb.tenant_id = t.id
    WHERE t.slug = ? AND t.status = 'active'
  `).get(tenantSlug);

  if (!tenant) return res.status(404).type('text/plain').send('Tenant not found');

  const baseUrl = tenant.public_site_url || `https://${tenant.cms_domain || tenantSlug + '.example.com'}`;

  const articles = db.prepare(`
    SELECT slug, updated_at FROM articles
    WHERE tenant_id = ? AND status = 'published'
    ORDER BY updated_at DESC
  `).all(tenant.id);

  const reports = db.prepare(`
    SELECT id, updated_at FROM annual_reports
    WHERE tenant_id = ? AND status = 'published'
    ORDER BY year DESC
  `).all(tenant.id);

  const products = db.prepare(`
    SELECT slug, updated_at FROM product_lines
    WHERE tenant_id = ? AND status = 'published'
    ORDER BY sort_order
  `).all(tenant.id);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Homepage
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Articles
  for (const a of articles) {
    const lastmod = a.updated_at ? `\n    <lastmod>${a.updated_at.split(' ')[0]}</lastmod>` : '';
    xml += `  <url>\n    <loc>${baseUrl}/articles/${a.slug}</loc>${lastmod}\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // Annual reports
  for (const r of reports) {
    const lastmod = r.updated_at ? `\n    <lastmod>${r.updated_at.split(' ')[0]}</lastmod>` : '';
    xml += `  <url>\n    <loc>${baseUrl}/annual-reports/${r.id}</loc>${lastmod}\n    <changefreq>yearly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  }

  // Product lines
  for (const p of products) {
    const lastmod = p.updated_at ? `\n    <lastmod>${p.updated_at.split(' ')[0]}</lastmod>` : '';
    xml += `  <url>\n    <loc>${baseUrl}/products/${p.slug}</loc>${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += '</urlset>';

  res.type('application/xml').send(xml);
});

// ── Robots.txt ──────────────────────────────────────────────────────

router.get('/:tenantSlug/robots.txt', (req, res) => {
  const { tenantSlug } = req.params;
  const tenant = db.prepare(`
    SELECT t.id, tb.public_site_url, tb.cms_domain
    FROM tenants t LEFT JOIN tenant_branding tb ON tb.tenant_id = t.id
    WHERE t.slug = ? AND t.status = 'active'
  `).get(tenantSlug);

  if (!tenant) return res.status(404).type('text/plain').send('Tenant not found');

  const baseUrl = tenant.public_site_url || `https://${tenant.cms_domain || tenantSlug + '.example.com'}`;

  let robots = 'User-agent: *\n';
  robots += 'Allow: /\n';
  robots += 'Disallow: /api/\n';
  robots += 'Disallow: /platform-admin/\n';
  robots += 'Disallow: /tenant-dashboard/\n';
  robots += '\n';
  robots += `Sitemap: ${baseUrl}/api/public/${tenantSlug}/sitemap.xml\n`;

  res.type('text/plain').send(robots);
});

// ── Page SEO Meta (for SSR / head injection) ────────────────────────

router.get('/:tenantSlug/seo-meta/:path(*)', (req, res) => {
  const { tenantSlug } = req.params;
  const pagePath = '/' + (req.params.path || '').replace(/^\/+/, '');

  const tenant = db.prepare(`
    SELECT t.id, t.name, tb.public_site_url, tb.logo_url
    FROM tenants t LEFT JOIN tenant_branding tb ON tb.tenant_id = t.id
    WHERE t.slug = ? AND t.status = 'active'
  `).get(tenantSlug);

  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  // Check page_meta first
  const pageMeta = db.prepare(`
    SELECT * FROM seo_page_meta WHERE tenant_id = ? AND page_path = ?
  `).get(tenant.id, pagePath);

  // If it's an article path, fall back to article SEO fields
  const articleMatch = pagePath.match(/^\/articles\/(.+)$/);
  let articleMeta = null;
  if (articleMatch) {
    articleMeta = db.prepare(`
      SELECT title, seo_title, seo_description, seo_image, seo_canonical_url, seo_noindex,
             cover_image, summary, slug
      FROM articles WHERE tenant_id = ? AND slug = ? AND status = 'published'
    `).get(tenant.id, articleMatch[1]);
  }

  const meta = pageMeta || {};
  const article = articleMeta || {};

  // Build JSON-LD
  let jsonLd = null;
  if (pageMeta?.json_ld_json) {
    try { jsonLd = JSON.parse(pageMeta.json_ld_json); } catch {}
  } else if (articleMeta) {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.seo_title || article.title,
      description: article.seo_description || article.summary,
      image: article.seo_image || article.cover_image,
      publisher: {
        '@type': 'Organization',
        name: tenant.name,
        logo: tenant.logo_url ? { '@type': 'ImageObject', url: tenant.logo_url } : undefined,
      },
    };
  }

  res.json({
    title: meta.title || article.seo_title || article.title || null,
    description: meta.description || article.seo_description || article.summary || null,
    og: {
      title: meta.og_title || meta.title || article.seo_title || article.title || null,
      description: meta.og_description || meta.description || article.seo_description || null,
      image: meta.og_image || article.seo_image || article.cover_image || null,
    },
    twitter: {
      card: meta.twitter_card || 'summary_large_image',
      title: meta.twitter_title || meta.og_title || meta.title || article.seo_title || null,
      description: meta.twitter_description || meta.og_description || article.seo_description || null,
      image: meta.twitter_image || meta.og_image || article.seo_image || null,
    },
    canonical: meta.canonical_url || article.seo_canonical_url || null,
    noindex: !!(meta.noindex || article.seo_noindex),
    nofollow: !!meta.nofollow,
    jsonLd,
  });
});

export default router;
