import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.resolve(path.join(__dirname, '..', '..', env.DB_PATH));
const dbDir = path.dirname(dbFile);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_admins (
  user_id INTEGER PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_branding (
  tenant_id INTEGER PRIMARY KEY,
  logo_url TEXT,
  primary_color TEXT,
  support_email TEXT,
  public_site_url TEXT,
  cms_domain TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tenant_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, user_id),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id INTEGER PRIMARY KEY,
  settings_json TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  category TEXT NOT NULL DEFAULT 'newsroom',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, slug),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  label TEXT,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  kind TEXT,
  size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);
`);

function ensureColumn(table, column, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) db.exec(ddl);
}

// Phase 1 migration safety for future schema evolution.
ensureColumn('articles', 'tenant_id', 'ALTER TABLE articles ADD COLUMN tenant_id INTEGER');
ensureColumn('media', 'tenant_id', 'ALTER TABLE media ADD COLUMN tenant_id INTEGER');

export function seedPlatformDefaults() {
  const insertUser = db.prepare(`
    INSERT INTO users (email, status) VALUES (?, 'active')
    ON CONFLICT(email) DO NOTHING
  `);
  insertUser.run(env.PLATFORM_OWNER_EMAIL);
  const owner = db.prepare('SELECT id FROM users WHERE email = ?').get(env.PLATFORM_OWNER_EMAIL);
  if (owner) {
    db.prepare(`
      INSERT INTO platform_admins (user_id, role)
      VALUES (?, 'owner')
      ON CONFLICT(user_id) DO NOTHING
    `).run(owner.id);
  }

  db.prepare(`
    INSERT INTO tenants (slug, name, status, updated_at)
    VALUES (?, ?, 'active', CURRENT_TIMESTAMP)
    ON CONFLICT(slug) DO UPDATE SET name = excluded.name, updated_at = CURRENT_TIMESTAMP
  `).run(env.SEED_TENANT.slug, env.SEED_TENANT.name);

  const tenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get(env.SEED_TENANT.slug);
  if (!tenant) return;

  db.prepare(`
    INSERT INTO tenant_branding (
      tenant_id, logo_url, primary_color, support_email, public_site_url, cms_domain, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO UPDATE SET
      logo_url = excluded.logo_url,
      primary_color = excluded.primary_color,
      support_email = excluded.support_email,
      public_site_url = excluded.public_site_url,
      cms_domain = excluded.cms_domain,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    tenant.id,
    env.SEED_TENANT.logoUrl,
    env.SEED_TENANT.primaryColor,
    env.SEED_TENANT.supportEmail,
    env.SEED_TENANT.publicSiteUrl,
    env.SEED_TENANT.cmsDomain,
  );

  db.prepare(`
    INSERT INTO tenant_settings (tenant_id, settings_json, updated_at)
    VALUES (?, '{}', CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO NOTHING
  `).run(tenant.id);
}
