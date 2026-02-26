import dotenv from 'dotenv';

dotenv.config({ path: process.env.PLATFORM_ENV_PATH || '.env.local' });

function splitCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4100),
  DB_PATH: process.env.PLATFORM_DB_PATH || './server/data/platform.db',
  UPLOADS_DIR: process.env.PLATFORM_UPLOADS_DIR || './server/data/uploads',
  SESSION_SECRET: process.env.PLATFORM_SESSION_SECRET || 'change-me-platform-session-secret',
  BOOTSTRAP_SECRET: process.env.PLATFORM_BOOTSTRAP_SECRET || '',
  CORS_ORIGINS: splitCsv(process.env.PLATFORM_CORS_ORIGIN || 'http://localhost:5173'),
  PLATFORM_ADMIN_HOSTS: splitCsv(process.env.PLATFORM_ADMIN_HOSTS || ''),
  RENDER_API_BASE_URL: process.env.RENDER_API_BASE_URL || 'https://api.render.com/v1',
  RENDER_API_TOKEN: process.env.RENDER_API_TOKEN || '',
  RENDER_SERVICE_ID: process.env.RENDER_SERVICE_ID || '',
  RENDER_SERVICE_CANONICAL_HOSTNAME:
    process.env.RENDER_SERVICE_CANONICAL_HOSTNAME || process.env.RENDER_EXTERNAL_HOSTNAME || '',
  PLATFORM_OWNER_EMAIL: process.env.PLATFORM_OWNER_EMAIL || 'owner@example.com',
  SEED_TENANT: {
    slug: process.env.SEED_TENANT_SLUG || 'demo',
    name: process.env.SEED_TENANT_NAME || 'Demo Tenant',
    publicSiteUrl: process.env.SEED_TENANT_PUBLIC_SITE_URL || 'https://example.com',
    cmsDomain: process.env.SEED_TENANT_CMS_DOMAIN || 'https://cms.example.com',
    logoUrl: process.env.SEED_TENANT_LOGO_URL || '/logo.png',
    supportEmail: process.env.SEED_TENANT_SUPPORT_EMAIL || 'support@example.com',
    primaryColor: process.env.SEED_TENANT_PRIMARY_COLOR || '#2563EB',
  },
};

if (!process.env.PLATFORM_SESSION_SECRET) {
  console.warn('[platform] Using fallback PLATFORM_SESSION_SECRET. Set a secure secret before production.');
}

if (env.NODE_ENV === 'production' && !env.BOOTSTRAP_SECRET) {
  console.warn('[platform] PLATFORM_BOOTSTRAP_SECRET is not set. Platform Admin bootstrap login will be unavailable.');
}

if (env.NODE_ENV === 'production' && (!env.RENDER_API_TOKEN || !env.RENDER_SERVICE_ID)) {
  console.warn('[platform] Render domain provisioning API is not fully configured (RENDER_API_TOKEN / RENDER_SERVICE_ID).');
}
