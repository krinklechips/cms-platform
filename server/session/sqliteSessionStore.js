import session from 'express-session';
import { db } from '../db.js';

const DEFAULT_FALLBACK_TTL_MS = 1000 * 60 * 60 * 8;
const DEFAULT_PRUNE_INTERVAL_MS = 1000 * 60 * 5;

db.exec(`
CREATE TABLE IF NOT EXISTS platform_sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000)
);
CREATE INDEX IF NOT EXISTS idx_platform_sessions_expires_at ON platform_sessions(expires_at);
`);

const stmtGet = db.prepare('SELECT sid, sess, expires_at FROM platform_sessions WHERE sid = ?');
const stmtSet = db.prepare(`
  INSERT INTO platform_sessions (sid, sess, expires_at, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(sid) DO UPDATE SET
    sess = excluded.sess,
    expires_at = excluded.expires_at,
    updated_at = excluded.updated_at
`);
const stmtTouch = db.prepare(`
  UPDATE platform_sessions
  SET expires_at = ?, updated_at = ?
  WHERE sid = ?
`);
const stmtDelete = db.prepare('DELETE FROM platform_sessions WHERE sid = ?');
const stmtDeleteExpired = db.prepare('DELETE FROM platform_sessions WHERE expires_at <= ?');
const stmtClear = db.prepare('DELETE FROM platform_sessions');

function getExpiresAtMs(sess) {
  const now = Date.now();
  const expiresValue = sess?.cookie?.expires;
  if (expiresValue) {
    const parsed = new Date(expiresValue).getTime();
    if (Number.isFinite(parsed)) return parsed;
  }
  const maxAge = Number(sess?.cookie?.originalMaxAge ?? sess?.cookie?.maxAge);
  if (Number.isFinite(maxAge) && maxAge > 0) {
    return now + maxAge;
  }
  return now + DEFAULT_FALLBACK_TTL_MS;
}

function safeCallback(cb, err, value) {
  if (typeof cb !== 'function') return;
  cb(err, value);
}

export default class SQLiteSessionStore extends session.Store {
  constructor(options = {}) {
    super();
    this.pruneIntervalMs = Number(options.pruneIntervalMs) || DEFAULT_PRUNE_INTERVAL_MS;
    this.lastPruneAt = 0;
  }

  maybePruneExpired() {
    const now = Date.now();
    if (now - this.lastPruneAt < this.pruneIntervalMs) return;
    this.lastPruneAt = now;
    try {
      stmtDeleteExpired.run(now);
    } catch (err) {
      console.warn('[platform] Failed to prune expired sessions', err?.message || err);
    }
  }

  get(sid, cb) {
    try {
      this.maybePruneExpired();
      const row = stmtGet.get(String(sid));
      if (!row) return safeCallback(cb, null, null);
      if (Number(row.expires_at || 0) <= Date.now()) {
        stmtDelete.run(String(sid));
        return safeCallback(cb, null, null);
      }
      const sess = JSON.parse(row.sess);
      return safeCallback(cb, null, sess);
    } catch (err) {
      return safeCallback(cb, err);
    }
  }

  set(sid, sess, cb) {
    try {
      this.maybePruneExpired();
      const now = Date.now();
      stmtSet.run(String(sid), JSON.stringify(sess || {}), getExpiresAtMs(sess), now);
      return safeCallback(cb, null);
    } catch (err) {
      return safeCallback(cb, err);
    }
  }

  destroy(sid, cb) {
    try {
      stmtDelete.run(String(sid));
      return safeCallback(cb, null);
    } catch (err) {
      return safeCallback(cb, err);
    }
  }

  touch(sid, sess, cb) {
    try {
      stmtTouch.run(getExpiresAtMs(sess), Date.now(), String(sid));
      return safeCallback(cb, null);
    } catch (err) {
      return safeCallback(cb, err);
    }
  }

  clear(cb) {
    try {
      stmtClear.run();
      return safeCallback(cb, null);
    } catch (err) {
      return safeCallback(cb, err);
    }
  }
}
