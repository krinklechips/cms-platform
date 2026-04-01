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
      // Look up parent in idMap first, then fall back to DB
      let parentId = idMap[page.parentSlug];
      if (!parentId) {
        const parentRow = db.prepare('SELECT id FROM pages WHERE tenant_id = ? AND slug = ?').get(tenant.id, page.parentSlug);
        if (parentRow) parentId = parentRow.id;
      }
      if (parentId) {
        updateParent.run(parentId, parentId, pageId);
      }
    }

    results.pages = inserted;
  }

  return res.json({ ok: true, tenantSlug, ...results });
});

// ── Seed content blocks for a page ──────────────────────────────
router.post('/seed-blocks', (req, res) => {
  const { tenantSlug, pageId, blocks, clearExisting } = req.body || {};
  if (!tenantSlug) return res.status(400).json({ error: 'tenantSlug is required' });
  if (!pageId) return res.status(400).json({ error: 'pageId is required' });
  if (!Array.isArray(blocks) || blocks.length === 0) return res.status(400).json({ error: 'blocks array is required' });

  const tenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(tenantSlug);
  if (!tenant) return res.status(404).json({ error: `Tenant "${tenantSlug}" not found` });

  const page = db.prepare('SELECT id FROM pages WHERE id = ? AND tenant_id = ?').get(pageId, tenant.id);
  if (!page) return res.status(404).json({ error: `Page ${pageId} not found for tenant "${tenantSlug}"` });

  try {
    if (clearExisting) {
      db.prepare('DELETE FROM page_blocks WHERE page_id = ? AND tenant_id = ?').run(page.id, tenant.id);
    }

    const insert = db.prepare(`
      INSERT INTO page_blocks (page_id, tenant_id, block_type, sort_order, block_data)
      VALUES (?, ?, ?, ?, ?)
    `);

    let inserted = 0;
    for (const block of blocks) {
      const blockType = block.blockType || block.block_type;
      const sortOrder = block.sortOrder ?? block.sort_order ?? 0;
      const blockData = typeof block.blockData === 'string' ? block.blockData : JSON.stringify(block.blockData || {});

      insert.run(page.id, tenant.id, blockType, sortOrder, blockData);
      inserted++;
    }

    return res.json({ ok: true, pageId, inserted });
  } catch (err) {
    console.error('seed-blocks error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ── Clear all blocks for a tenant ────────────────────────────────
router.post('/clear-blocks', (req, res) => {
  const { tenantSlug } = req.body || {};
  if (!tenantSlug) return res.status(400).json({ error: 'tenantSlug is required' });

  const tenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(tenantSlug);
  if (!tenant) return res.status(404).json({ error: `Tenant "${tenantSlug}" not found` });

  const result = db.prepare('DELETE FROM page_blocks WHERE tenant_id = ?').run(tenant.id);
  return res.json({ ok: true, deleted: result.changes });
});

export default router;
