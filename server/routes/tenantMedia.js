import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { db } from '../db.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireTenantContext } from '../middleware/tenantContext.js';

const router = express.Router();
const uploadsDir = path.isAbsolute(env.UPLOADS_DIR)
  ? env.UPLOADS_DIR
  : path.resolve(path.join(process.cwd(), env.UPLOADS_DIR));
const resolvedUploadsDir = path.resolve(uploadsDir);

router.use(requireAuth);
router.use(requireTenantContext);

function extForMime(mime = '') {
  if (mime === 'application/pdf') return '.pdf';
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/gif') return '.gif';
  if (mime === 'image/webp') return '.webp';
  return '';
}

function tenantUploadsDir(tenantId) {
  const id = Number(tenantId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return path.resolve(resolvedUploadsDir, `tenant-${id}`);
}

function resolvePathInsideUploads(relativePath) {
  const raw = String(relativePath || '').replace(/\\/g, '/');
  if (!raw) return null;
  const normalized = path.posix.normalize(raw).replace(/^\/+/, '');
  if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized.includes('/../')) {
    return null;
  }
  const targetPath = path.resolve(resolvedUploadsDir, normalized);
  if (targetPath !== resolvedUploadsDir && !targetPath.startsWith(resolvedUploadsDir + path.sep)) {
    return null;
  }
  return targetPath;
}

function extractRelativeUploadPath(fileUrl) {
  const raw = String(fileUrl || '').trim();
  if (!raw) return null;

  const prefix = '/uploads/';
  const safeDecode = (value) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return null;
    }
  };
  try {
    const parsed = new URL(raw);
    if (!parsed.pathname.startsWith(prefix)) return null;
    return safeDecode(parsed.pathname.slice(prefix.length));
  } catch {
    const idx = raw.indexOf(prefix);
    if (idx < 0) return null;
    return safeDecode(raw.slice(idx + prefix.length));
  }
}

function mapMediaRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    label: row.label,
    fileUrl: row.file_url,
    mimeType: row.mime_type,
    kind: row.kind,
    size: row.size,
    createdAt: row.created_at,
  };
}

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

router.post('/upload', async (req, res) => {
  const tenantDir = tenantUploadsDir(req.tenant.id);
  if (!tenantDir) {
    return res.status(400).json({ error: 'Invalid tenant upload destination.' });
  }

  await fs.promises.mkdir(tenantDir, { recursive: true });

  const form = formidable({
    multiples: false,
    maxFileSize: 15 * 1024 * 1024,
    uploadDir: tenantDir,
  });

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

    const mime = file.mimetype || file.mime || file.type || '';
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowed.includes(mime)) {
      return res.status(400).json({ error: 'Only JPG, PNG, GIF, WEBP, or PDF files are supported.' });
    }

    const ext = extForMime(mime);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const targetPath = path.resolve(tenantDir, filename);
    if (!targetPath.startsWith(tenantDir + path.sep)) {
      return res.status(400).json({ error: 'Invalid upload path.' });
    }

    await fs.promises.copyFile(file.filepath, targetPath);
    await fs.promises.chmod(targetPath, 0o644);
    await fs.promises.unlink(file.filepath).catch(() => {});

    const stats = await fs.promises.stat(targetPath);
    const forwardedProto = req.headers['x-forwarded-proto'];
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : (forwardedProto?.split(',')[0] || req.protocol);
    const relativeUploadPath = path.posix.join(`tenant-${req.tenant.id}`, filename);
    const publicUrl = `${proto}://${req.get('host')}/uploads/${relativeUploadPath}`;
    const kind = mime.startsWith('image/') ? 'image' : (mime === 'application/pdf' ? 'document' : 'file');

    const info = db.prepare(
      'INSERT INTO media (tenant_id, label, file_url, mime_type, kind, size) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(
      req.tenant.id,
      String(fields.label || file.originalFilename || filename),
      publicUrl,
      mime,
      kind,
      Number(stats.size || 0),
    );
    const created = db.prepare('SELECT * FROM media WHERE tenant_id = ? AND id = ?').get(req.tenant.id, info.lastInsertRowid);

    res.status(201).json({ media: mapMediaRow(created) });
  } catch (err) {
    console.error('[platform] tenant media upload error', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max size is 15MB.' });
    }
    return res.status(500).json({ error: 'Failed to upload media.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid media id' });

  const media = db.prepare('SELECT * FROM media WHERE tenant_id = ? AND id = ?').get(req.tenant.id, id);
  if (!media) return res.status(404).json({ error: 'Media not found' });

  db.prepare('DELETE FROM article_media WHERE tenant_id = ? AND media_id = ?').run(req.tenant.id, id);
  db.prepare('DELETE FROM media WHERE tenant_id = ? AND id = ?').run(req.tenant.id, id);

  const relativePath = extractRelativeUploadPath(media.file_url);
  const filePath = relativePath ? resolvePathInsideUploads(relativePath) : null;
  if (filePath) {
    await fs.promises.unlink(filePath).catch(() => {});
  }

  res.json({ ok: true });
});

export default router;
