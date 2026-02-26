import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { db, dbFile } from '../db.js';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin.js';
import { getR2ConfigSummary, isR2Configured, uploadBufferToR2 } from '../integrations/r2.js';

const router = express.Router();

router.use(requirePlatformAdmin);

function mapBackupRow(row) {
  if (!row) return null;
  let metadata = null;
  try {
    metadata = row.metadata_json ? JSON.parse(row.metadata_json) : null;
  } catch {
    metadata = null;
  }
  return {
    id: row.id,
    provider: row.provider,
    objectKey: row.object_key,
    fileSize: row.file_size,
    checksumSha256: row.checksum_sha256,
    status: row.status,
    errorMessage: row.error_message || null,
    createdByUserId: row.created_by_user_id || null,
    createdAt: row.created_at,
    completedAt: row.completed_at || null,
    metadata,
  };
}

function sqlStringLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function getDbStorageDiagnostics() {
  const stats = fs.existsSync(dbFile) ? fs.statSync(dbFile) : null;
  const walFile = `${dbFile}-wal`;
  const shmFile = `${dbFile}-shm`;
  const walStats = fs.existsSync(walFile) ? fs.statSync(walFile) : null;
  const shmStats = fs.existsSync(shmFile) ? fs.statSync(shmFile) : null;

  let journalMode = null;
  try {
    journalMode = db.pragma('journal_mode', { simple: true });
  } catch {
    journalMode = null;
  }

  return {
    resolvedDbPath: dbFile,
    dbExists: Boolean(stats),
    dbSize: stats?.size || 0,
    dbUpdatedAt: stats?.mtime?.toISOString?.() || null,
    dbOnVarData: dbFile.startsWith('/var/data/'),
    walFileExists: Boolean(walStats),
    walFileSize: walStats?.size || 0,
    shmFileExists: Boolean(shmStats),
    shmFileSize: shmStats?.size || 0,
    journalMode,
  };
}

function getRecentBackups(limit = 10) {
  const rows = db.prepare(`
    SELECT
      id, provider, object_key, file_size, checksum_sha256, status,
      created_by_user_id, error_message, created_at, completed_at, metadata_json
    FROM platform_db_backups
    ORDER BY id DESC
    LIMIT ?
  `).all(limit);
  return rows.map(mapBackupRow);
}

router.get('/db', (req, res) => {
  res.json({
    ok: true,
    storage: getDbStorageDiagnostics(),
    r2: getR2ConfigSummary(),
    backups: getRecentBackups(12),
  });
});

router.post('/db', async (req, res) => {
  if (!isR2Configured()) {
    return res.status(503).json({
      error: 'R2 is not configured for backups',
      r2: getR2ConfigSummary(),
      storage: getDbStorageDiagnostics(),
    });
  }

  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const tmpSnapshotPath = path.join(os.tmpdir(), `cms-platform-db-backup-${stamp}-${process.pid}.sqlite3`);
  const prefix = String(getR2ConfigSummary().backupPrefix || 'cms-platform/backups/db').replace(/^\/+|\/+$/g, '');
  const datePath = now.toISOString().slice(0, 10).replace(/-/g, '/');
  const objectKey = `${prefix}/${datePath}/platform-${stamp}.sqlite3`;

  let checksumSha256 = null;
  let uploadedSize = 0;
  let checkpointResult = null;
  let metadata = null;

  try {
    try {
      checkpointResult = db.pragma('wal_checkpoint(TRUNCATE)');
    } catch {
      checkpointResult = null;
    }

    db.exec(`VACUUM INTO ${sqlStringLiteral(tmpSnapshotPath)}`);
    const bytes = await fs.promises.readFile(tmpSnapshotPath);
    uploadedSize = bytes.length;
    checksumSha256 = crypto.createHash('sha256').update(bytes).digest('hex');

    await uploadBufferToR2({
      objectKey,
      bytes,
      contentType: 'application/x-sqlite3',
    });

    metadata = {
      dbPath: dbFile,
      checkpointResult,
      snapshotMethod: 'VACUUM INTO',
    };

    const info = db.prepare(`
      INSERT INTO platform_db_backups (
        provider, object_key, file_size, checksum_sha256, status,
        created_by_user_id, error_message, completed_at, metadata_json
      ) VALUES ('r2', ?, ?, ?, 'completed', ?, NULL, CURRENT_TIMESTAMP, ?)
    `).run(
      objectKey,
      uploadedSize,
      checksumSha256,
      req.platformAdmin?.userId || null,
      JSON.stringify(metadata),
    );

    const created = db.prepare(`
      SELECT
        id, provider, object_key, file_size, checksum_sha256, status,
        created_by_user_id, error_message, created_at, completed_at, metadata_json
      FROM platform_db_backups
      WHERE id = ?
    `).get(info.lastInsertRowid);

    return res.status(201).json({
      ok: true,
      backup: mapBackupRow(created),
      storage: getDbStorageDiagnostics(),
      r2: getR2ConfigSummary(),
    });
  } catch (err) {
    db.prepare(`
      INSERT INTO platform_db_backups (
        provider, object_key, file_size, checksum_sha256, status,
        created_by_user_id, error_message, completed_at, metadata_json
      ) VALUES ('r2', ?, ?, ?, 'failed', ?, ?, CURRENT_TIMESTAMP, ?)
    `).run(
      objectKey,
      uploadedSize || 0,
      checksumSha256,
      req.platformAdmin?.userId || null,
      err.message || 'Backup failed',
      JSON.stringify({
        dbPath: dbFile,
        checkpointResult,
        snapshotMethod: 'VACUUM INTO',
      }),
    );

    return res.status(500).json({
      error: err.message || 'Failed to back up database to R2',
      storage: getDbStorageDiagnostics(),
      r2: getR2ConfigSummary(),
      backups: getRecentBackups(12),
    });
  } finally {
    await fs.promises.unlink(tmpSnapshotPath).catch(() => {});
  }
});

export default router;

