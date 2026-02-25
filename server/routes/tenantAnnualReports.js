import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenantContext);

function mapAnnualReport(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    year: Number(row.year),
    title: row.title,
    summary: row.summary,
    fileUrl: row.file_url,
    mediaId: row.media_id,
    status: row.status,
    sortOrder: Number(row.sort_order || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function loadTenantPdfMedia(tenantId, mediaId) {
  if (!mediaId) return null;
  return db.prepare(`
    SELECT id, tenant_id, file_url, mime_type, kind
    FROM media
    WHERE tenant_id = ? AND id = ?
  `).get(tenantId, mediaId);
}

router.get('/', (req, res) => {
  const status = req.query.status ? String(req.query.status) : null;
  const rows = db.prepare(`
    SELECT *
    FROM annual_reports
    WHERE tenant_id = ?
      AND (? IS NULL OR status = ?)
    ORDER BY year DESC, sort_order ASC, updated_at DESC
  `).all(req.tenant.id, status, status);
  res.json(rows.map(mapAnnualReport));
});

router.post('/', (req, res) => {
  const {
    year,
    title,
    summary = '',
    fileUrl,
    mediaId = null,
    status = 'published',
    sortOrder = 0,
  } = req.body ?? {};

  const parsedYear = Number(year);
  if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 3000) {
    return res.status(400).json({ error: 'Valid year is required' });
  }
  if (!String(title || '').trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  let resolvedFileUrl = typeof fileUrl === 'string' ? fileUrl.trim() : '';
  let resolvedMediaId = mediaId ? Number(mediaId) : null;
  if (resolvedMediaId) {
    const media = loadTenantPdfMedia(req.tenant.id, resolvedMediaId);
    if (!media) return res.status(404).json({ error: 'Selected media not found' });
    const isPdf = media.kind === 'document' || media.mime_type === 'application/pdf';
    if (!isPdf) return res.status(400).json({ error: 'Selected media must be a PDF' });
    resolvedFileUrl = media.file_url;
  }
  if (!resolvedFileUrl) {
    return res.status(400).json({ error: 'fileUrl or a PDF media selection is required' });
  }

  const info = db.prepare(`
    INSERT INTO annual_reports (
      tenant_id, year, title, summary, file_url, media_id, status, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(
    req.tenant.id,
    parsedYear,
    String(title).trim(),
    String(summary || '').trim(),
    resolvedFileUrl,
    resolvedMediaId || null,
    status === 'draft' ? 'draft' : 'published',
    Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
  );

  const row = db.prepare('SELECT * FROM annual_reports WHERE tenant_id = ? AND id = ?').get(req.tenant.id, info.lastInsertRowid);
  res.status(201).json(mapAnnualReport(row));
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid annual report id' });
  const existing = db.prepare('SELECT * FROM annual_reports WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  if (!existing) return res.status(404).json({ error: 'Annual report not found' });

  const nextYear = req.body?.year !== undefined ? Number(req.body.year) : Number(existing.year);
  if (!Number.isInteger(nextYear) || nextYear < 1900 || nextYear > 3000) {
    return res.status(400).json({ error: 'Valid year is required' });
  }
  const nextTitle = req.body?.title !== undefined ? String(req.body.title).trim() : existing.title;
  if (!nextTitle) return res.status(400).json({ error: 'title is required' });

  let nextMediaId = req.body?.mediaId !== undefined
    ? (req.body.mediaId ? Number(req.body.mediaId) : null)
    : (existing.media_id || null);
  let nextFileUrl = req.body?.fileUrl !== undefined
    ? String(req.body.fileUrl || '').trim()
    : (existing.file_url || '');
  if (nextMediaId) {
    const media = loadTenantPdfMedia(req.tenant.id, nextMediaId);
    if (!media) return res.status(404).json({ error: 'Selected media not found' });
    const isPdf = media.kind === 'document' || media.mime_type === 'application/pdf';
    if (!isPdf) return res.status(400).json({ error: 'Selected media must be a PDF' });
    nextFileUrl = media.file_url;
  }
  if (!nextFileUrl) return res.status(400).json({ error: 'fileUrl or a PDF media selection is required' });

  db.prepare(`
    UPDATE annual_reports
    SET year = ?, title = ?, summary = ?, file_url = ?, media_id = ?, status = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE tenant_id = ? AND id = ?
  `).run(
    nextYear,
    nextTitle,
    req.body?.summary !== undefined ? String(req.body.summary || '').trim() : (existing.summary || ''),
    nextFileUrl,
    nextMediaId || null,
    req.body?.status === 'draft' ? 'draft' : (req.body?.status === 'published' ? 'published' : (existing.status || 'published')),
    req.body?.sortOrder !== undefined ? (Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0) : Number(existing.sort_order || 0),
    req.tenant.id,
    id,
  );

  const row = db.prepare('SELECT * FROM annual_reports WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  res.json(mapAnnualReport(row));
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid annual report id' });
  const info = db.prepare('DELETE FROM annual_reports WHERE tenant_id = ? AND id = ?').run(req.tenant.id, id);
  if (!info.changes) return res.status(404).json({ error: 'Annual report not found' });
  res.json({ ok: true });
});

export default router;
