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
  SESSION_SECRET: process.env.PLATFORM_SESSION_SECRET || 'change-me-platform-session-secret',
  CORS_ORIGINS: splitCsv(process.env.PLATFORM_CORS_ORIGIN || 'http://localhost:5173'),
  PLATFORM_OWNER_EMAIL: process.env.PLATFORM_OWNER_EMAIL || 'owner@example.com',
  SEED_TENANT: {
    slug: process.env.SEED_TENANT_SLUG || 'kardal',
    name: process.env.SEED_TENANT_NAME || 'Kardal',
    publicSiteUrl: process.env.SEED_TENANT_PUBLIC_SITE_URL || 'https://kardal.org',
    cmsDomain: process.env.SEED_TENANT_CMS_DOMAIN || 'https://cms.kardal.org',
    logoUrl: process.env.SEED_TENANT_LOGO_URL || '/kardal-logo.png',
    supportEmail: process.env.SEED_TENANT_SUPPORT_EMAIL || 'support@example.com',
    primaryColor: process.env.SEED_TENANT_PRIMARY_COLOR || '#7F3E98',
  },
};

if (!process.env.PLATFORM_SESSION_SECRET) {
  console.warn('[platform] Using fallback PLATFORM_SESSION_SECRET. Set a secure secret before production.');
}
