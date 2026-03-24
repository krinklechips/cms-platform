import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenantContext);

function mapTestimonial(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    authorName: row.author_name,
    authorTitle: row.author_title,
    authorPhotoUrl: row.author_photo_url,
    quote: row.quote,
    youtubeUrl: row.youtube_url,
    rating: row.rating,
    isFeatured: Boolean(row.is_featured),
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM testimonials
    WHERE tenant_id = ?
    ORDER BY sort_order ASC
  `).all(req.tenant.id);
  res.json(rows.map(mapTestimonial));
});

router.post('/', (req, res) => {
  const {
    authorName,
    quote,
    authorTitle = null,
    authorPhotoUrl = null,
    youtubeUrl = null,
    rating = 5,
    isFeatured = false,
    sortOrder = 0,
    status = 'published',
  } = req.body ?? {};

  if (!String(authorName || '').trim()) {
    return res.status(400).json({ error: 'author_name is required' });
  }
  if (!String(quote || '').trim()) {
    return res.status(400).json({ error: 'quote is required' });
  }

  const now = new Date().toISOString();
  const info = db.prepare(`
    INSERT INTO testimonials (tenant_id, author_name, author_title, author_photo_url, quote, youtube_url, rating, is_featured, sort_order, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.tenant.id,
    String(authorName).trim(),
    authorTitle ? String(authorTitle).trim() : null,
    authorPhotoUrl ? String(authorPhotoUrl).trim() : null,
    String(quote).trim(),
    youtubeUrl ? String(youtubeUrl).trim() : null,
    Math.min(5, Math.max(1, Number(rating) || 5)),
    isFeatured ? 1 : 0,
    Number(sortOrder) || 0,
    status === 'draft' ? 'draft' : 'published',
    now,
    now,
  );

  const row = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(info.lastInsertRowid);
  return res.status(201).json(mapTestimonial(row));
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const existing = db.prepare('SELECT * FROM testimonials WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  if (!existing) return res.status(404).json({ error: 'Testimonial not found' });

  const authorName = req.body?.authorName !== undefined ? String(req.body.authorName).trim() : existing.author_name;
  if (!authorName) return res.status(400).json({ error: 'author_name is required' });
  const quote = req.body?.quote !== undefined ? String(req.body.quote).trim() : existing.quote;
  if (!quote) return res.status(400).json({ error: 'quote is required' });

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE testimonials
    SET author_name = ?, author_title = ?, author_photo_url = ?, quote = ?, youtube_url = ?, rating = ?, is_featured = ?, sort_order = ?, status = ?, updated_at = ?
    WHERE tenant_id = ? AND id = ?
  `).run(
    authorName,
    req.body?.authorTitle !== undefined ? (req.body.authorTitle ? String(req.body.authorTitle).trim() : null) : existing.author_title,
    req.body?.authorPhotoUrl !== undefined ? (req.body.authorPhotoUrl ? String(req.body.authorPhotoUrl).trim() : null) : existing.author_photo_url,
    quote,
    req.body?.youtubeUrl !== undefined ? (req.body.youtubeUrl ? String(req.body.youtubeUrl).trim() : null) : existing.youtube_url,
    req.body?.rating !== undefined ? Math.min(5, Math.max(1, Number(req.body.rating) || 5)) : existing.rating,
    req.body?.isFeatured !== undefined ? (req.body.isFeatured ? 1 : 0) : existing.is_featured,
    req.body?.sortOrder !== undefined ? (Number(req.body.sortOrder) || 0) : existing.sort_order,
    req.body?.status === 'draft' ? 'draft' : (req.body?.status === 'published' ? 'published' : existing.status),
    now,
    req.tenant.id,
    id,
  );

  const row = db.prepare('SELECT * FROM testimonials WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  return res.json(mapTestimonial(row));
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const info = db.prepare('DELETE FROM testimonials WHERE tenant_id = ? AND id = ?').run(req.tenant.id, id);
  if (!info.changes) return res.status(404).json({ error: 'Testimonial not found' });
  return res.json({ ok: true });
});

export default router;
