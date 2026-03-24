import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.isAbsolute(env.DB_PATH)
  ? env.DB_PATH
  : path.resolve(path.join(__dirname, '..', '..', env.DB_PATH));
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

CREATE TABLE IF NOT EXISTS tenant_domains (
  tenant_id INTEGER PRIMARY KEY,
  hostname TEXT UNIQUE,
  dns_mode TEXT NOT NULL DEFAULT 'customer_managed',
  dns_provider TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  render_custom_domain_id TEXT,
  render_custom_domain_name TEXT,
  render_status TEXT,
  dns_records_json TEXT,
  render_response_json TEXT,
  last_error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_checked_at DATETIME,
  verified_at DATETIME,
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS platform_db_backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL DEFAULT 'r2',
  object_key TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  checksum_sha256 TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_by_user_id INTEGER,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  metadata_json TEXT,
  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
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
  source TEXT DEFAULT 'manual',
  seo_title TEXT,
  seo_description TEXT,
  seo_image TEXT,
  seo_canonical_url TEXT,
  seo_noindex INTEGER NOT NULL DEFAULT 0,
  publish_at DATETIME,
  first_publish_at DATETIME,
  published_by TEXT,
  cover_image TEXT,
  image_caption TEXT,
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

CREATE TABLE IF NOT EXISTS article_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  role TEXT DEFAULT 'attachment',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_id, media_id),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS annual_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  file_url TEXT NOT NULL,
  media_id INTEGER,
  status TEXT NOT NULL DEFAULT 'published',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  summary TEXT,
  href TEXT,
  group_key TEXT NOT NULL DEFAULT 'equipment',
  group_label TEXT,
  item_type TEXT NOT NULL DEFAULT 'product',
  status TEXT NOT NULL DEFAULT 'published',
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, slug),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'news',
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  image_url TEXT,
  location TEXT,
  cta_label TEXT,
  cta_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  publish_start_at DATETIME,
  publish_end_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS page_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  slot_key TEXT NOT NULL,
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  config_json TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, slot_key),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS slot_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  slot_id INTEGER NOT NULL,
  content_item_id INTEGER NOT NULL,
  tab_key TEXT NOT NULL DEFAULT 'news',
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  starts_at DATETIME,
  ends_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slot_id, content_item_id),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY(slot_id) REFERENCES page_slots(id) ON DELETE CASCADE,
  FOREIGN KEY(content_item_id) REFERENCES content_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seo_redirects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  source_path TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  is_active INTEGER NOT NULL DEFAULT 1,
  hits INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, source_path),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seo_page_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  page_path TEXT NOT NULL,
  title TEXT,
  description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  noindex INTEGER NOT NULL DEFAULT 0,
  nofollow INTEGER NOT NULL DEFAULT 0,
  json_ld_type TEXT,
  json_ld_json TEXT,
  keywords TEXT,
  seo_score INTEGER,
  last_audited_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, page_path),
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seo_keyword_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  page_path TEXT NOT NULL,
  keyword TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  template TEXT DEFAULT 'default',
  parent_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  show_in_nav INTEGER DEFAULT 1,
  nav_label TEXT,
  nav_parent_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
  seo_title TEXT,
  seo_description TEXT,
  seo_image TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS page_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  block_type TEXT NOT NULL DEFAULT 'text',
  block_data TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  department TEXT,
  bio TEXT,
  photo_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_photo_url TEXT,
  quote TEXT NOT NULL,
  youtube_url TEXT,
  rating INTEGER DEFAULT 5,
  is_featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price TEXT,
  price_note TEXT,
  features_json TEXT NOT NULL DEFAULT '[]',
  category TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, slug)
);
`);

function ensureColumn(table, column, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) db.exec(ddl);
}

// Phase 1 migration safety for future schema evolution.
ensureColumn('articles', 'tenant_id', 'ALTER TABLE articles ADD COLUMN tenant_id INTEGER');
ensureColumn('media', 'tenant_id', 'ALTER TABLE media ADD COLUMN tenant_id INTEGER');
ensureColumn('articles', 'source', "ALTER TABLE articles ADD COLUMN source TEXT DEFAULT 'manual'");
ensureColumn('articles', 'seo_title', 'ALTER TABLE articles ADD COLUMN seo_title TEXT');
ensureColumn('articles', 'seo_description', 'ALTER TABLE articles ADD COLUMN seo_description TEXT');
ensureColumn('articles', 'seo_image', 'ALTER TABLE articles ADD COLUMN seo_image TEXT');
ensureColumn('articles', 'seo_canonical_url', 'ALTER TABLE articles ADD COLUMN seo_canonical_url TEXT');
ensureColumn('articles', 'seo_noindex', 'ALTER TABLE articles ADD COLUMN seo_noindex INTEGER NOT NULL DEFAULT 0');
ensureColumn('articles', 'publish_at', 'ALTER TABLE articles ADD COLUMN publish_at DATETIME');
ensureColumn('articles', 'first_publish_at', 'ALTER TABLE articles ADD COLUMN first_publish_at DATETIME');
ensureColumn('articles', 'published_by', 'ALTER TABLE articles ADD COLUMN published_by TEXT');
ensureColumn('articles', 'cover_image', 'ALTER TABLE articles ADD COLUMN cover_image TEXT');
ensureColumn('articles', 'image_caption', 'ALTER TABLE articles ADD COLUMN image_caption TEXT');
ensureColumn('annual_reports', 'summary', 'ALTER TABLE annual_reports ADD COLUMN summary TEXT');
ensureColumn('annual_reports', 'media_id', 'ALTER TABLE annual_reports ADD COLUMN media_id INTEGER');
ensureColumn('annual_reports', 'status', "ALTER TABLE annual_reports ADD COLUMN status TEXT NOT NULL DEFAULT 'published'");
ensureColumn('annual_reports', 'sort_order', 'ALTER TABLE annual_reports ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0');
ensureColumn('tenant_domains', 'dns_mode', "ALTER TABLE tenant_domains ADD COLUMN dns_mode TEXT NOT NULL DEFAULT 'customer_managed'");
ensureColumn('tenant_domains', 'dns_provider', 'ALTER TABLE tenant_domains ADD COLUMN dns_provider TEXT');
ensureColumn('tenant_domains', 'status', "ALTER TABLE tenant_domains ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'");
ensureColumn('tenant_domains', 'render_custom_domain_id', 'ALTER TABLE tenant_domains ADD COLUMN render_custom_domain_id TEXT');
ensureColumn('tenant_domains', 'render_custom_domain_name', 'ALTER TABLE tenant_domains ADD COLUMN render_custom_domain_name TEXT');
ensureColumn('tenant_domains', 'render_status', 'ALTER TABLE tenant_domains ADD COLUMN render_status TEXT');
ensureColumn('tenant_domains', 'dns_records_json', 'ALTER TABLE tenant_domains ADD COLUMN dns_records_json TEXT');
ensureColumn('tenant_domains', 'render_response_json', 'ALTER TABLE tenant_domains ADD COLUMN render_response_json TEXT');
ensureColumn('tenant_domains', 'last_error', 'ALTER TABLE tenant_domains ADD COLUMN last_error TEXT');
ensureColumn('tenant_domains', 'last_checked_at', 'ALTER TABLE tenant_domains ADD COLUMN last_checked_at DATETIME');
ensureColumn('tenant_domains', 'verified_at', 'ALTER TABLE tenant_domains ADD COLUMN verified_at DATETIME');
ensureColumn('platform_db_backups', 'provider', "ALTER TABLE platform_db_backups ADD COLUMN provider TEXT NOT NULL DEFAULT 'r2'");
ensureColumn('platform_db_backups', 'object_key', "ALTER TABLE platform_db_backups ADD COLUMN object_key TEXT NOT NULL DEFAULT ''");
ensureColumn('platform_db_backups', 'file_size', 'ALTER TABLE platform_db_backups ADD COLUMN file_size INTEGER NOT NULL DEFAULT 0');
ensureColumn('platform_db_backups', 'checksum_sha256', 'ALTER TABLE platform_db_backups ADD COLUMN checksum_sha256 TEXT');
ensureColumn('platform_db_backups', 'status', "ALTER TABLE platform_db_backups ADD COLUMN status TEXT NOT NULL DEFAULT 'completed'");
ensureColumn('platform_db_backups', 'created_by_user_id', 'ALTER TABLE platform_db_backups ADD COLUMN created_by_user_id INTEGER');
ensureColumn('platform_db_backups', 'error_message', 'ALTER TABLE platform_db_backups ADD COLUMN error_message TEXT');
ensureColumn('platform_db_backups', 'completed_at', 'ALTER TABLE platform_db_backups ADD COLUMN completed_at DATETIME');
ensureColumn('platform_db_backups', 'metadata_json', 'ALTER TABLE platform_db_backups ADD COLUMN metadata_json TEXT');
ensureColumn('users', 'must_change_password', 'ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0');

function ensureDefaultTenantSlots(tenantId) {
  db.prepare(`
    INSERT INTO page_slots (
      tenant_id, slot_key, page_key, section_key, title, status, config_json, updated_at
    ) VALUES (?, 'home.news-promotions', 'home', 'news-promotions', 'News & Promotions', 'active', '{"tabs":["news","promotions"],"maxItemsPerTab":6}', CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id, slot_key) DO NOTHING
  `).run(tenantId);
}

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

  ensureDefaultTenantSlots(tenant.id);
}

export { ensureDefaultTenantSlots };
export { dbFile, dbDir };
