import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { db } from '../db.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';
import { isR2Configured, uploadBufferToR2, deleteR2Object, listR2Objects } from '../integrations/r2.js';

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

function mimeFromExt(ext) {
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf',
    '.svg': 'image/svg+xml',
  };
  return map[ext?.toLowerCase()] || 'application/octet-stream';
}

function folderFromObjectKey(objectKey, tenantSlug) {
  // objectKey = "roomchang/subfolder/file.jpg" -> folder = "subfolder"
  const prefix = `${tenantSlug}/`;
  const rest = objectKey.startsWith(prefix) ? objectKey.slice(prefix.length) : objectKey;
  const lastSlash = rest.lastIndexOf('/');
  return lastSlash >= 0 ? rest.slice(0, lastSlash) : '';
}

function filenameFromObjectKey(objectKey) {
  const lastSlash = objectKey.lastIndexOf('/');
  return lastSlash >= 0 ? objectKey.slice(lastSlash + 1) : objectKey;
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
    folder: row.folder || '',
    created_at: row.created_at,
  };
}

function getMediaUsageCounts(tenantId) {
  const counts = {};
  const allMedia = db.prepare('SELECT id, file_url FROM media WHERE tenant_id = ?').all(tenantId);
  if (!allMedia.length) return counts;

  // Safely query tables that may or may not have certain columns
  function safeAll(sql) {
    try { return db.prepare(sql).all(tenantId); } catch { return []; }
  }

  const searchTexts = [
    ...safeAll('SELECT block_data AS t FROM page_blocks WHERE tenant_id = ?').map((r) => r.t || ''),
    ...safeAll('SELECT photo_url AS t FROM team_members WHERE tenant_id = ?').map((r) => r.t || ''),
    ...safeAll("SELECT COALESCE(featured_image_url,'') || ' ' || COALESCE(body,'') AS t FROM articles WHERE tenant_id = ?").map((r) => r.t || ''),
    ...safeAll("SELECT COALESCE(author_photo_url,'') AS t FROM testimonials WHERE tenant_id = ?").map((r) => r.t || ''),
    ...safeAll("SELECT COALESCE(description,'') AS t FROM services WHERE tenant_id = ?").map((r) => r.t || ''),
  ];

  for (const m of allMedia) {
    let count = 0;
    for (const text of searchTexts) {
      if (text.includes(m.file_url)) count++;
    }
    counts[m.id] = count;
  }

  return counts;
}

// GET /api/tenant/media — list all media for this tenant
router.get('/', (req, res) => {
  const kind = req.query.kind ? String(req.query.kind) : null;
  const folder = req.query.folder !== undefined ? String(req.query.folder) : null;
  let query = 'SELECT * FROM media WHERE tenant_id = ?';
  const params = [req.tenant.id];
  if (kind && ['image', 'document', 'file'].includes(kind)) {
    query += ' AND kind = ?';
    params.push(kind);
  }
  if (folder !== null) {
    query += ' AND (folder = ? OR folder IS NULL AND ? = \'\')';
    params.push(folder, folder);
  }
  query += ' ORDER BY created_at DESC';
  const rows = db.prepare(query).all(...params);

  const usageCounts = getMediaUsageCounts(req.tenant.id);
  const items = rows.map((row) => ({
    ...mapMediaRow(row),
    usageCount: usageCounts[row.id] || 0,
  }));

  // Also return folder list
  const folderRows = db.prepare(
    'SELECT DISTINCT folder FROM media WHERE tenant_id = ? AND folder IS NOT NULL AND folder != \'\' ORDER BY folder'
  ).all(req.tenant.id);
  const folders = folderRows.map((r) => r.folder);

  res.json({ items, folders });
});

// POST /api/tenant/media/sync — sync existing R2 files into the DB
router.post('/sync', async (req, res) => {
  if (!isR2Configured()) {
    return res.status(503).json({ error: 'File storage is not configured.' });
  }

  try {
    const prefix = `${req.tenant.slug}/`;
    const { files } = await listR2Objects(prefix, '');

    // Get existing URLs
    const existing = new Set(
      db.prepare('SELECT file_url FROM media WHERE tenant_id = ?')
        .all(req.tenant.id)
        .map((r) => r.file_url)
    );

    let imported = 0;
    const insert = db.prepare(
      'INSERT INTO media (tenant_id, label, file_url, mime_type, kind, size, folder) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    for (const file of files) {
      const publicUrl = r2PublicUrl(file.key);
      if (existing.has(publicUrl)) continue;

      const filename = filenameFromObjectKey(file.key);
      const ext = path.extname(filename).toLowerCase();
      const mime = mimeFromExt(ext);
      const kind = kindForMime(mime);
      const folder = folderFromObjectKey(file.key, req.tenant.slug);

      insert.run(req.tenant.id, filename, publicUrl, mime, kind, file.size, folder);
      imported++;
    }

    res.json({ ok: true, imported, total: files.length });
  } catch (err) {
    console.error('[platform] R2 sync error', err);
    res.status(500).json({ error: 'Failed to sync from storage' });
  }
});

// POST /api/tenant/media/folder — create a folder
router.post('/folder', async (req, res) => {
  const folderName = String(req.body?.name || '').trim().replace(/[^a-zA-Z0-9_\-/]/g, '-').replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
  if (!folderName) return res.status(400).json({ error: 'Folder name is required' });

  // Create a zero-byte marker in R2
  if (isR2Configured()) {
    try {
      const objectKey = `${req.tenant.slug}/${folderName}/.folder`;
      await uploadBufferToR2({ objectKey, bytes: Buffer.from(''), contentType: 'application/x-empty' });
    } catch (err) {
      console.warn('[platform] folder marker upload warning:', err.message);
    }
  }

  res.json({ ok: true, folder: folderName });
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
    const uploadFolder = String(
      (Array.isArray(fields.folder) ? fields.folder[0] : fields.folder) || ''
    ).trim().replace(/^\/|\/$/g, '');
    const folderPath = uploadFolder ? `${uploadFolder}/` : '';
    const objectKey = `${req.tenant.slug}/${folderPath}${filename}`;

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
      'INSERT INTO media (tenant_id, label, file_url, mime_type, kind, size, folder) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(req.tenant.id, label, publicUrl, mime, kind, buffer.length, uploadFolder);

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

// PATCH /api/tenant/media/:id/move — move file to a different folder
router.patch('/:id/move', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid media id' });

  const folder = String(req.body?.folder ?? '').trim().replace(/^\/|\/$/g, '');

  const media = db.prepare('SELECT * FROM media WHERE tenant_id = ? AND id = ?')
    .get(req.tenant.id, id);
  if (!media) return res.status(404).json({ error: 'Media not found' });

  db.prepare('UPDATE media SET folder = ? WHERE tenant_id = ? AND id = ?')
    .run(folder, req.tenant.id, id);

  res.json({ ok: true, id, folder });
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
