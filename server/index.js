import cors from 'cors';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { db, seedPlatformDefaults } from './db.js';
import platformTenantsRouter from './routes/platformTenants.js';
import platformPlacementsRouter from './routes/platformPlacements.js';
import platformTenantDomainsRouter from './routes/platformTenantDomains.js';
import platformTenantUsersRouter from './routes/platformTenantUsers.js';
import platformBackupsRouter from './routes/platformBackups.js';
import tenantArticlesRouter from './routes/tenantArticles.js';
import tenantMediaRouter from './routes/tenantMedia.js';
import publicSlotsRouter from './routes/publicSlots.js';
import tenantAnnualReportsRouter from './routes/tenantAnnualReports.js';
import publicAnnualReportsRouter from './routes/publicAnnualReports.js';
import tenantSettingsRouter from './routes/tenantSettings.js';
import publicArticlesRouter from './routes/publicArticles.js';
import publicNavigationTabsRouter from './routes/publicNavigationTabs.js';
import tenantAuthRouter from './routes/tenantAuth.js';
import {
  attachHostContext,
  blockTenantLoginOnPlatformHost,
  blockPlatformAdminOnTenantHost,
  getHostContextDebug,
  requirePlatformHost,
} from './middleware/hostContext.js';

seedPlatformDefaults();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const app = express();
// Render terminates TLS at the proxy. Trust proxy so secure session cookies are
// set and read correctly in production behind Render's HTTPS endpoint.
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error('CORS blocked'));
    },
    credentials: true,
  }),
);

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

app.use(attachHostContext);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'cms-platform',
    time: new Date().toISOString(),
    hostMode: req.hostContext?.mode || 'unknown',
    requestHost: req.hostContext?.requestHost || null,
  });
});

app.get('/api/platform/host-context', (req, res) => {
  res.json({
    host: req.hostContext?.requestHost || null,
    mode: req.hostContext?.mode || 'unknown',
    tenant: req.hostContext?.tenant
      ? {
          id: req.hostContext.tenant.id,
          slug: req.hostContext.tenant.slug,
          name: req.hostContext.tenant.name,
          status: req.hostContext.tenant.status,
          branding: req.hostContext.tenant.branding,
        }
      : null,
    debug: process.env.NODE_ENV === 'production' ? undefined : getHostContextDebug(),
  });
});

// Dev bootstrap auth route so you can test platform APIs before building real auth/SSO.
app.post('/api/platform/auth/dev-login', (req, res) => {
  if (!req.hostContext?.isPlatformHost) {
    return res.status(403).json({ error: 'Platform host required' });
  }
  if (env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'email is required' });

  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const platformAdmin = db.prepare('SELECT role FROM platform_admins WHERE user_id = ?').get(user.id);

  req.session.user = {
    id: user.id,
    email: user.email,
    isPlatformAdmin: Boolean(platformAdmin),
    platformRole: platformAdmin?.role || null,
  };
  return res.json({ ok: true, user: req.session.user });
});

// Temporary production-safe bootstrap login for Phase 2 platform admin UI.
// Replace with real auth before onboarding external customers.
app.post('/api/platform/auth/bootstrap-login', requirePlatformHost, (req, res) => {
  if (!env.BOOTSTRAP_SECRET) {
    return res.status(503).json({ error: 'Bootstrap login is not configured.' });
  }

  const email = String(req.body?.email || env.PLATFORM_OWNER_EMAIL).trim().toLowerCase();
  const secret = String(req.body?.secret || '');
  if (!email || !secret) {
    return res.status(400).json({ error: 'email and secret are required' });
  }
  if (secret !== env.BOOTSTRAP_SECRET) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const platformAdmin = db.prepare('SELECT role FROM platform_admins WHERE user_id = ?').get(user.id);
  if (!platformAdmin) {
    return res.status(403).json({ error: 'Platform admin access required' });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    isPlatformAdmin: true,
    platformRole: platformAdmin.role,
  };
  return res.json({ ok: true, user: req.session.user });
});

app.get('/api/platform/auth/me', (req, res) => {
  const user = req.session?.user;
  if (!user) return res.json({ authenticated: false });
  return res.json({ authenticated: true, user });
});

app.post('/api/platform/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.use('/api/tenant/auth', tenantAuthRouter);
app.use('/api/platform/tenants', platformTenantsRouter);
app.use('/api/platform/tenants/:tenantId/domain', platformTenantDomainsRouter);
app.use('/api/platform/placements', platformPlacementsRouter);
app.use('/api/platform/tenant-users', platformTenantUsersRouter);
app.use('/api/platform/backups', platformBackupsRouter);
app.use('/api/tenant/articles', tenantArticlesRouter);
app.use('/api/tenant/media', tenantMediaRouter);
app.use('/api/tenant/annual-reports', tenantAnnualReportsRouter);
app.use('/api/tenant/settings', tenantSettingsRouter);
app.use('/api/public', publicSlotsRouter);
app.use('/api/public', publicAnnualReportsRouter);
app.use('/api/public', publicArticlesRouter);
app.use('/api/public', publicNavigationTabsRouter);
app.use('/uploads', express.static(path.join(__dirname, '..', '..', env.UPLOADS_DIR)));
app.use('/platform-admin', blockPlatformAdminOnTenantHost, express.static(path.join(publicDir, 'platform-admin')));
app.use('/tenant-login', blockTenantLoginOnPlatformHost, express.static(path.join(publicDir, 'tenant-login')));
app.use('/tenant-dashboard', blockTenantLoginOnPlatformHost, express.static(path.join(publicDir, 'tenant-dashboard')));

app.get('/', (req, res) => {
  if (req.hostContext?.isTenantHost) {
    return res.redirect('/tenant-dashboard');
  }
  res.redirect('/platform-admin');
});

app.listen(env.PORT, () => {
  console.log(`[platform] listening on http://localhost:${env.PORT}`);
  console.log(`[platform] db: ${env.DB_PATH}`);
  if (process.env.NODE_ENV !== 'production') {
    const debug = getHostContextDebug();
    console.log(`[platform] platform admin hosts: ${debug.platformHosts.join(', ')}`);
  }
});
