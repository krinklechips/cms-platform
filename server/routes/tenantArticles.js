import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenantContext);

// Phase 1 demo route showing tenant-scoped content queries.
// Every tenant-facing content route should filter by req.tenant.id.
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT id, tenant_id, slug, title, summary, status, category, created_at, updated_at
    FROM articles
    WHERE tenant_id = ?
    ORDER BY updated_at DESC, created_at DESC
  `).all(req.tenant.id);

  res.json(
    rows.map((row) => ({
      id: row.id,
      tenantId: row.tenant_id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      status: row.status,
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  );
});

router.post('/', (req, res) => {
  const { slug, title, summary = '', body = '', status = 'draft', category = 'newsroom' } = req.body ?? {};
  if (!slug || !title) {
    return res.status(400).json({ error: 'slug and title are required' });
  }

  try {
    const info = db.prepare(`
      INSERT INTO articles (
        tenant_id, slug, title, summary, body, status, category, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(req.tenant.id, slug, title, summary, body, status, category);

    const row = db.prepare(`
      SELECT id, tenant_id, slug, title, summary, body, status, category, created_at, updated_at
      FROM articles
      WHERE id = ?
    `).get(info.lastInsertRowid);
    return res.status(201).json({
      id: row.id,
      tenantId: row.tenant_id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      body: row.body,
      status: row.status,
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Slug already exists for this tenant' });
    }
    console.error('[tenant] create article failed', err);
    return res.status(500).json({ error: 'Failed to create article' });
  }
});

export default router;
