import express from 'express';
import { db } from '../db.js';

const router = express.Router();

function slugify(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

router.post('/seed', (req, res) => {
  const { tenantSlug, pages } = req.body || {};
  if (!tenantSlug) return res.status(400).json({ error: 'tenantSlug is required' });

  const tenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(tenantSlug);
  if (!tenant) return res.status(404).json({ error: `Tenant "${tenantSlug}" not found` });

  const results = {};

  // Seed pages
  if (Array.isArray(pages) && pages.length > 0) {
    const insertPage = db.prepare(`
      INSERT OR IGNORE INTO pages (tenant_id, slug, title, status, template, parent_id, sort_order, show_in_nav, nav_label, nav_parent_id, seo_title, seo_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    const idMap = {}; // slug -> id for parent references

    // First pass: insert all pages without parent references
    for (const page of pages) {
      const slug = page.slug || slugify(page.title);
      const title = String(page.title || '').trim();
      if (!title) continue;

      const result = insertPage.run(
        tenant.id,
        slug,
        title,
        page.status || 'published',
        page.template || 'default',
        null, // parent_id set in second pass
        page.sortOrder ?? 0,
        page.showInNav !== false ? 1 : 0,
        page.navLabel || null,
        null, // nav_parent_id set in second pass
        page.seoTitle || null,
        page.seoDescription || null,
      );

      if (result.changes > 0) {
        inserted++;
        idMap[slug] = result.lastInsertRowid;
      } else {
        // Already exists, fetch its id
        const existing = db.prepare('SELECT id FROM pages WHERE tenant_id = ? AND slug = ?').get(tenant.id, slug);
        if (existing) idMap[slug] = existing.id;
      }
    }

    // Second pass: set parent references
    const updateParent = db.prepare('UPDATE pages SET parent_id = ?, nav_parent_id = ? WHERE id = ?');
    for (const page of pages) {
      const slug = page.slug || slugify(page.title);
      const pageId = idMap[slug];
      if (!pageId || !page.parentSlug) continue;
      const parentId = idMap[page.parentSlug];
      if (parentId) {
        updateParent.run(parentId, parentId, pageId);
      }
    }

    results.pages = inserted;
  }

  return res.json({ ok: true, tenantSlug, ...results });
});

export default router;
