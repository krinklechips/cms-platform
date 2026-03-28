import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { db } from '../db.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';
import { isR2Configured, uploadBufferToR2, deleteR2Object } from '../integrations/r2.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenantContext);

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

function extForMime(mime = '') {
  if (mime === 'application/pdf') return '.pdf';
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/gif') return '.gif';
  if (mime === 'image/webp') return '.webp';
  return '';
}

function kindForMime(mime = '') {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'document';
  return 'file';
}

function r2PublicUrl(objectKey) {
  const base = (env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  return `${base}/${objectKey}`;
}

function objectKeyFromUrl(fileUrl) {
  const base = (env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (!base || !fileUrl) return null;
  const raw = String(fileUrl);
  if (!raw.startsWith(base + '/')) return null;
  return raw.slice(base.length + 1);
}

function mapMediaRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    filename: row.label,
    url: row.file_url,
    mime_type: row.mime_type,
    kind: row.kind,
    size: row.size,
    created_at: row.created_at,
  };
}

// GET /api/tenant/media — list all media for this tenant
router.get('/', (req, res) => {
  const kind = req.query.kind ? String(req.query.kind) : null;
  let query = 'SELECT * FROM media WHERE tenant_id = ?';
  const params = [req.tenant.id];
  if (kind && ['image', 'document', 'file'].includes(kind)) {
    query += ' AND kind = ?';
    params.push(kind);
  }
  query += ' ORDER BY created_at DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows.map(mapMediaRow));
});

// POST /api/tenant/media/upload — upload file to R2
router.post('/upload', async (req, res) => {
  if (!isR2Configured()) {
    return res.status(503).json({ error: 'File storage is not configured. Contact your platform admin.' });
  }

  const tmpDir = os.tmpdir();
  const form = formidable({
    multiples: false,
    maxFileSize: MAX_FILE_SIZE,
    uploadDir: tmpDir,
  });

  let tmpFilePath = null;

  try {
    const { files, fields } = await new Promise((resolve, reject) => {
      form.parse(req, (err, parsedFields, parsedFiles) => {
        if (err) return reject(err);
        resolve({ files: parsedFiles, fields: parsedFields });
      });
    });

    const first = files.file ?? files.asset ?? Object.values(files)[0];
    const file = Array.isArray(first) ? first[0] : first;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    tmpFilePath = file.filepath;

    const mime = file.mimetype || file.mime || file.type || '';
    if (!ALLOWED_MIMES.includes(mime)) {
      return res.status(400).json({ error: 'Only JPG, PNG, GIF, WEBP, or PDF files are supported.' });
    }

    const ext = extForMime(mime);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const objectKey = `${req.tenant.slug}/${filename}`;

    const buffer = await fs.promises.readFile(tmpFilePath);
    await uploadBufferToR2({ objectKey, bytes: buffer, contentType: mime });

    const publicUrl = r2PublicUrl(objectKey);
    const kind = kindForMime(mime);
    const label = String(
      (Array.isArray(fields.label) ? fields.label[0] : fields.label) ||
      file.originalFilename ||
      filename
    );

    const info = db.prepare(
      'INSERT INTO media (tenant_id, label, file_url, mime_type, kind, size) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(req.tenant.id, label, publicUrl, mime, kind, buffer.length);

    const created = db.prepare('SELECT * FROM media WHERE tenant_id = ? AND id = ?')
      .get(req.tenant.id, info.lastInsertRowid);

    res.status(201).json({ media: mapMediaRow(created) });
  } catch (err) {
    console.error('[platform] tenant media upload error', err);
    if (err?.httpCode === 413 || err?.message?.includes('maxFileSize')) {
      return res.status(400).json({ error: 'File too large. Max size is 15 MB.' });
    }
    return res.status(500).json({ error: 'Failed to upload file.' });
  } finally {
    if (tmpFilePath) {
      fs.promises.unlink(tmpFilePath).catch(() => {});
    }
  }
});

// DELETE /api/tenant/media/:id — delete file from R2 and DB
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid media id' });

  const media = db.prepare('SELECT * FROM media WHERE tenant_id = ? AND id = ?')
    .get(req.tenant.id, id);
  if (!media) return res.status(404).json({ error: 'Media not found' });

  // Remove from DB first (detach from any articles etc.)
  db.prepare('DELETE FROM article_media WHERE tenant_id = ? AND media_id = ?')
    .run(req.tenant.id, id);
  db.prepare('DELETE FROM media WHERE tenant_id = ? AND id = ?')
    .run(req.tenant.id, id);

  // Best-effort delete from R2
  const objectKey = objectKeyFromUrl(media.file_url);
  if (objectKey && isR2Configured()) {
    await deleteR2Object(objectKey).catch((err) => {
      console.warn('[platform] R2 delete warning (file may already be gone):', err.message);
    });
  }

  res.json({ ok: true });
});

export default router;
