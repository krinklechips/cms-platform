import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenantContext);

function slugify(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function mapPage(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    template: row.template,
    parentId: row.parent_id,
    sortOrder: row.sort_order,
    showInNav: Boolean(row.show_in_nav),
    navLabel: row.nav_label,
    navParentId: row.nav_parent_id,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    seoImage: row.seo_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    blockCount: row.block_count !== undefined ? row.block_count : undefined,
  };
}

function mapBlock(row) {
  if (!row) return null;
  let blockData = {};
  try {
    blockData = JSON.parse(row.block_data);
  } catch {
    blockData = {};
  }
  return {
    id: row.id,
    pageId: row.page_id,
    tenantId: row.tenant_id,
    blockType: row.block_type,
    blockData,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Navigation tree ────────────────────────────────────────────────────────

router.get('/navigation', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, (SELECT COUNT(*) FROM page_blocks pb WHERE pb.page_id = p.id) AS block_count
    FROM pages p
    WHERE p.tenant_id = ? AND p.show_in_nav = 1
    ORDER BY p.sort_order ASC, p.title ASC
  `).all(req.tenant.id);

  const pages = rows.map(mapPage);
  const byId = new Map(pages.map((p) => [p.id, { ...p, children: [] }]));
  const tree = [];

  for (const page of byId.values()) {
    if (page.navParentId && byId.has(page.navParentId)) {
      byId.get(page.navParentId).children.push(page);
    } else {
      tree.push(page);
    }
  }

  return res.json(tree);
});

// ─── Pages CRUD ─────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, (SELECT COUNT(*) FROM page_blocks pb WHERE pb.page_id = p.id) AS block_count
    FROM pages p
    WHERE p.tenant_id = ?
    ORDER BY p.sort_order ASC, p.title ASC
  `).all(req.tenant.id);

  return res.json(rows.map(mapPage));
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid page id' });

  const row = db.prepare(`
    SELECT p.*, (SELECT COUNT(*) FROM page_blocks pb WHERE pb.page_id = p.id) AS block_count
    FROM pages p
    WHERE p.tenant_id = ? AND p.id = ?
  `).get(req.tenant.id, id);
  if (!row) return res.status(404).json({ error: 'Page not found' });

  const page = mapPage(row);
  const blocks = db.prepare(`
    SELECT * FROM page_blocks
    WHERE page_id = ? AND tenant_id = ?
    ORDER BY sort_order ASC
  `).all(id, req.tenant.id);
  page.blocks = blocks.map(mapBlock);

  return res.json(page);
});

router.post('/', (req, res) => {
  const {
    title,
    status = 'draft',
    template = 'default',
    parentId = null,
    sortOrder = 0,
    showInNav = 1,
    navLabel = null,
    navParentId = null,
    seoTitle = null,
    seoDescription = null,
    seoImage = null,
  } = req.body ?? {};

  if (!String(title || '').trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  const slug = slugify(req.body?.slug || title);
  if (!slug) return res.status(400).json({ error: 'A valid slug could not be generated' });

  const now = new Date().toISOString();

  try {
    const info = db.prepare(`
      INSERT INTO pages (
        tenant_id, slug, title, status, template, parent_id, sort_order,
        show_in_nav, nav_label, nav_parent_id,
        seo_title, seo_description, seo_image,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.tenant.id,
      slug,
      String(title).trim(),
      status === 'published' ? 'published' : 'draft',
      String(template || 'default').trim(),
      parentId || null,
      Number(sortOrder) || 0,
      showInNav ? 1 : 0,
      navLabel ? String(navLabel).trim() : null,
      navParentId || null,
      seoTitle ? String(seoTitle).trim() : null,
      seoDescription ? String(seoDescription).trim() : null,
      seoImage ? String(seoImage).trim() : null,
      now,
      now,
    );

    const row = db.prepare(`
      SELECT p.*, (SELECT COUNT(*) FROM page_blocks pb WHERE pb.page_id = p.id) AS block_count
      FROM pages p
      WHERE p.tenant_id = ? AND p.id = ?
    `).get(req.tenant.id, info.lastInsertRowid);
    return res.status(201).json(mapPage(row));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Slug already exists for this tenant' });
    }
    console.error('[tenant] create page failed', err);
    return res.status(500).json({ error: 'Failed to create page' });
  }
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid page id' });

  const existing = db.prepare('SELECT * FROM pages WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  if (!existing) return res.status(404).json({ error: 'Page not found' });

  const nextTitle = req.body?.title !== undefined ? String(req.body.title).trim() : existing.title;
  if (!nextTitle) return res.status(400).json({ error: 'title is required' });

  const nextSlug = req.body?.slug !== undefined
    ? slugify(req.body.slug || nextTitle)
    : (req.body?.title !== undefined ? slugify(nextTitle) : existing.slug);
  if (!nextSlug) return res.status(400).json({ error: 'A valid slug could not be generated' });

  const now = new Date().toISOString();

  try {
    db.prepare(`
      UPDATE pages
      SET slug = ?, title = ?, status = ?, template = ?, parent_id = ?, sort_order = ?,
          show_in_nav = ?, nav_label = ?, nav_parent_id = ?,
          seo_title = ?, seo_description = ?, seo_image = ?,
          updated_at = ?
      WHERE tenant_id = ? AND id = ?
    `).run(
      nextSlug,
      nextTitle,
      req.body?.status !== undefined ? (req.body.status === 'published' ? 'published' : 'draft') : existing.status,
      req.body?.template !== undefined ? String(req.body.template || 'default').trim() : existing.template,
      req.body?.parentId !== undefined ? (req.body.parentId || null) : existing.parent_id,
      req.body?.sortOrder !== undefined ? (Number(req.body.sortOrder) || 0) : existing.sort_order,
      req.body?.showInNav !== undefined ? (req.body.showInNav ? 1 : 0) : existing.show_in_nav,
      req.body?.navLabel !== undefined ? (req.body.navLabel ? String(req.body.navLabel).trim() : null) : existing.nav_label,
      req.body?.navParentId !== undefined ? (req.body.navParentId || null) : existing.nav_parent_id,
      req.body?.seoTitle !== undefined ? (req.body.seoTitle ? String(req.body.seoTitle).trim() : null) : existing.seo_title,
      req.body?.seoDescription !== undefined ? (req.body.seoDescription ? String(req.body.seoDescription).trim() : null) : existing.seo_description,
      req.body?.seoImage !== undefined ? (req.body.seoImage ? String(req.body.seoImage).trim() : null) : existing.seo_image,
      now,
      req.tenant.id,
      id,
    );

    const row = db.prepare(`
      SELECT p.*, (SELECT COUNT(*) FROM page_blocks pb WHERE pb.page_id = p.id) AS block_count
      FROM pages p
      WHERE p.tenant_id = ? AND p.id = ?
    `).get(req.tenant.id, id);
    return res.json(mapPage(row));
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Slug already exists for this tenant' });
    }
    console.error('[tenant] update page failed', err);
    return res.status(500).json({ error: 'Failed to update page' });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid page id' });
  const info = db.prepare('DELETE FROM pages WHERE tenant_id = ? AND id = ?').run(req.tenant.id, id);
  if (!info.changes) return res.status(404).json({ error: 'Page not found' });
  return res.json({ ok: true });
});

// ─── Blocks CRUD ────────────────────────────────────────────────────────────

router.get('/:pageId/blocks', (req, res) => {
  const pageId = Number(req.params.pageId);
  if (!pageId) return res.status(400).json({ error: 'Invalid page id' });

  const page = db.prepare('SELECT id FROM pages WHERE tenant_id = ? AND id = ?').get(req.tenant.id, pageId);
  if (!page) return res.status(404).json({ error: 'Page not found' });

  const rows = db.prepare(`
    SELECT * FROM page_blocks
    WHERE page_id = ? AND tenant_id = ?
    ORDER BY sort_order ASC
  `).all(pageId, req.tenant.id);

  return res.json(rows.map(mapBlock));
});

router.post('/:pageId/blocks', (req, res) => {
  const pageId = Number(req.params.pageId);
  if (!pageId) return res.status(400).json({ error: 'Invalid page id' });

  const page = db.prepare('SELECT id FROM pages WHERE tenant_id = ? AND id = ?').get(req.tenant.id, pageId);
  if (!page) return res.status(404).json({ error: 'Page not found' });

  const {
    blockType = 'text',
    blockData = {},
    sortOrder = 0,
  } = req.body ?? {};

  const now = new Date().toISOString();
  const dataStr = typeof blockData === 'string' ? blockData : JSON.stringify(blockData);

  const info = db.prepare(`
    INSERT INTO page_blocks (page_id, tenant_id, block_type, block_data, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(pageId, req.tenant.id, String(blockType).trim() || 'text', dataStr, Number(sortOrder) || 0, now, now);

  const row = db.prepare('SELECT * FROM page_blocks WHERE id = ?').get(info.lastInsertRowid);
  return res.status(201).json(mapBlock(row));
});

// Reorder blocks — must be before /:pageId/blocks/:blockId to avoid route conflict
router.put('/:pageId/blocks/reorder', (req, res) => {
  const pageId = Number(req.params.pageId);
  if (!pageId) return res.status(400).json({ error: 'Invalid page id' });

  const page = db.prepare('SELECT id FROM pages WHERE tenant_id = ? AND id = ?').get(req.tenant.id, pageId);
  if (!page) return res.status(404).json({ error: 'Page not found' });

  const { blockIds } = req.body ?? {};
  if (!Array.isArray(blockIds)) {
    return res.status(400).json({ error: 'blockIds array is required' });
  }

  const now = new Date().toISOString();
  const updateStmt = db.prepare('UPDATE page_blocks SET sort_order = ?, updated_at = ? WHERE id = ? AND page_id = ? AND tenant_id = ?');
  const tx = db.transaction(() => {
    blockIds.forEach((blockId, index) => {
      updateStmt.run(index, now, Number(blockId), pageId, req.tenant.id);
    });
  });
  tx();

  const rows = db.prepare(`
    SELECT * FROM page_blocks
    WHERE page_id = ? AND tenant_id = ?
    ORDER BY sort_order ASC
  `).all(pageId, req.tenant.id);

  return res.json(rows.map(mapBlock));
});

router.put('/:pageId/blocks/:blockId', (req, res) => {
  const pageId = Number(req.params.pageId);
  const blockId = Number(req.params.blockId);
  if (!pageId || !blockId) return res.status(400).json({ error: 'Invalid page or block id' });

  const existing = db.prepare('SELECT * FROM page_blocks WHERE id = ? AND page_id = ? AND tenant_id = ?').get(blockId, pageId, req.tenant.id);
  if (!existing) return res.status(404).json({ error: 'Block not found' });

  const now = new Date().toISOString();
  const nextType = req.body?.blockType !== undefined ? String(req.body.blockType).trim() || 'text' : existing.block_type;
  const nextData = req.body?.blockData !== undefined
    ? (typeof req.body.blockData === 'string' ? req.body.blockData : JSON.stringify(req.body.blockData))
    : existing.block_data;
  const nextSort = req.body?.sortOrder !== undefined ? Number(req.body.sortOrder) || 0 : existing.sort_order;

  db.prepare('UPDATE page_blocks SET block_type = ?, block_data = ?, sort_order = ?, updated_at = ? WHERE id = ?').run(
    nextType,
    nextData,
    nextSort,
    now,
    blockId,
  );

  const row = db.prepare('SELECT * FROM page_blocks WHERE id = ?').get(blockId);
  return res.json(mapBlock(row));
});

router.delete('/:pageId/blocks/:blockId', (req, res) => {
  const pageId = Number(req.params.pageId);
  const blockId = Number(req.params.blockId);
  if (!pageId || !blockId) return res.status(400).json({ error: 'Invalid page or block id' });

  const info = db.prepare('DELETE FROM page_blocks WHERE id = ? AND page_id = ? AND tenant_id = ?').run(blockId, pageId, req.tenant.id);
  if (!info.changes) return res.status(404).json({ error: 'Block not found' });
  return res.json({ ok: true });
});

export default router;
