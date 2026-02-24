import cors from 'cors';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { db, seedPlatformDefaults } from './db.js';
import platformTenantsRouter from './routes/platformTenants.js';
import tenantArticlesRouter from './routes/tenantArticles.js';

seedPlatformDefaults();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const app = express();
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

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'cms-platform', time: new Date().toISOString() });
});

// Dev bootstrap auth route so you can test platform APIs before building real auth/SSO.
app.post('/api/platform/auth/dev-login', (req, res) => {
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
app.post('/api/platform/auth/bootstrap-login', (req, res) => {
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

app.use('/api/platform/tenants', platformTenantsRouter);
app.use('/api/tenant/articles', tenantArticlesRouter);
app.use('/platform-admin', express.static(path.join(publicDir, 'platform-admin')));

app.get('/', (req, res) => {
  res.redirect('/platform-admin');
});

app.listen(env.PORT, () => {
  console.log(`[platform] listening on http://localhost:${env.PORT}`);
  console.log(`[platform] db: ${env.DB_PATH}`);
});
