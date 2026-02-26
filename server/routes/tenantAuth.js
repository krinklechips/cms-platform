import express from 'express';
import { db } from '../db.js';
import { verifyPassword } from '../auth/passwords.js';
import { requireTenantHost } from '../middleware/hostContext.js';

const router = express.Router();

function loadActiveMembership(userId, tenantId) {
  return db.prepare(`
    SELECT tm.role, tm.status
    FROM tenant_memberships tm
    JOIN users u ON u.id = tm.user_id
    WHERE tm.user_id = ?
      AND tm.tenant_id = ?
      AND tm.status = 'active'
      AND u.status = 'active'
    LIMIT 1
  `).get(userId, tenantId);
}

function readTenantModuleAccess(tenantId) {
  const fallback = {
    homepagePlacements: true,
    articles: true,
    libraries: true,
    annualReports: true,
    navigationTabs: true,
  };
  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
  if (!row?.settings_json) return fallback;
  try {
    const parsed = JSON.parse(row.settings_json || '{}') || {};
    const source = parsed.moduleAccess && typeof parsed.moduleAccess === 'object' ? parsed.moduleAccess : {};
    return {
      homepagePlacements: source.homepagePlacements !== false,
      articles: source.articles !== false,
      libraries: source.libraries !== false,
      annualReports: source.annualReports !== false,
      navigationTabs: source.navigationTabs !== false,
    };
  } catch {
    return fallback;
  }
}

function tenantSessionPayload({ user, membership, tenant }) {
  return {
    id: user.id,
    email: user.email,
    isPlatformAdmin: false,
    platformRole: null,
    tenantRole: membership.role,
    tenantMemberships: [{
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      role: membership.role,
    }],
  };
}

router.get('/me', requireTenantHost, (req, res) => {
  const tenant = req.hostContext?.tenant;
  if (!tenant) return res.status(400).json({ error: 'Tenant host is not configured' });

  const user = req.session?.user;
  if (!user?.id) {
    return res.json({
      authenticated: false,
      tenant,
    });
  }

  if (user.isPlatformAdmin) {
    return res.status(403).json({ error: 'Use the platform host for platform admin access' });
  }

  const membership = loadActiveMembership(user.id, tenant.id);
  if (!membership) {
    return res.json({
      authenticated: false,
      tenant,
    });
  }

  return res.json({
    authenticated: true,
    tenant,
    user: {
      id: user.id,
      email: user.email,
      tenantRole: membership.role,
    },
    moduleAccess: readTenantModuleAccess(tenant.id),
  });
});

router.post('/login', requireTenantHost, (req, res) => {
  const tenant = req.hostContext?.tenant;
  if (!tenant) return res.status(400).json({ error: 'Tenant host is not configured' });

  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = db.prepare(`
    SELECT id, email, password_hash, status
    FROM users
    WHERE email = ?
    LIMIT 1
  `).get(email);

  if (!user || user.status !== 'active' || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const membership = loadActiveMembership(user.id, tenant.id);
  if (!membership) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }

  req.session.user = tenantSessionPayload({ user, membership, tenant });
  return res.json({
    ok: true,
    tenant,
    user: {
      id: user.id,
      email: user.email,
      tenantRole: membership.role,
    },
    moduleAccess: readTenantModuleAccess(tenant.id),
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

export default router;
