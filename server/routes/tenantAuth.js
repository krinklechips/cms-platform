import express from 'express';
import { db } from '../db.js';
import { hashPassword, verifyPassword } from '../auth/passwords.js';
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
    pages: true,
    seo: true,
    mediaLibrary: true,
    navigation: true,
  };
  const row = db.prepare('SELECT settings_json FROM tenant_settings WHERE tenant_id = ?').get(tenantId);
  if (!row?.settings_json) return fallback;
  try {
    const parsed = JSON.parse(row.settings_json || '{}') || {};
    const source = parsed.moduleAccess && typeof parsed.moduleAccess === 'object' ? parsed.moduleAccess : {};
    const result = { ...fallback };
    for (const key of Object.keys(fallback)) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        result[key] = source[key] !== false;
      }
    }
    return result;
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

function sendTenantLoginSuccess(req, res, { tenant, user, membership }) {
  try {
    const payload = {
      ok: true,
      tenant,
      user: {
        id: user.id,
        email: user.email,
        tenantRole: membership.role,
      },
      moduleAccess: readTenantModuleAccess(tenant.id),
      mustChangePassword: user.must_change_password === 1,
    };
    return res.json(payload);
  } catch (err) {
    console.error('[tenant-auth] failed to build login response', err);
    return res.status(500).json({ error: 'Tenant session started but response failed' });
  }
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

  const fullUser = db.prepare('SELECT must_change_password FROM users WHERE id = ? LIMIT 1').get(user.id);

  return res.json({
    authenticated: true,
    tenant,
    user: {
      id: user.id,
      email: user.email,
      tenantRole: membership.role,
    },
    moduleAccess: readTenantModuleAccess(tenant.id),
    mustChangePassword: fullUser?.must_change_password === 1,
  });
});

router.post('/login', requireTenantHost, (req, res) => {
  try {
    const tenant = req.hostContext?.tenant;
    if (!tenant) return res.status(400).json({ error: 'Tenant host is not configured' });

    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = db.prepare(`
      SELECT id, email, password_hash, status, must_change_password
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
    if (!req.session) {
      console.error('[tenant-auth] session middleware missing on tenant login');
      return res.status(500).json({ error: 'Session is not available' });
    }

    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    const sessionUser = tenantSessionPayload({ user, membership, tenant });
    const saveSessionAndRespond = () => {
      try {
        req.session.user = sessionUser;
      } catch (err) {
        console.error('[tenant-auth] failed to assign tenant session user', err);
        return res.status(500).json({ error: 'Failed to prepare tenant session' });
      }
      return req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[tenant-auth] failed to save tenant session', saveErr);
          return res.status(500).json({ error: 'Failed to persist tenant session' });
        }
        return sendTenantLoginSuccess(req, res, { tenant, user, membership });
      });
    };

    if (typeof req.session.regenerate === 'function') {
      return req.session.regenerate((regenErr) => {
        if (regenErr) {
          console.error('[tenant-auth] session regenerate failed, falling back to save-in-place', regenErr);
          return saveSessionAndRespond();
        }
        return saveSessionAndRespond();
      });
    }

    return saveSessionAndRespond();
  } catch (err) {
    console.error('[tenant-auth] login error', err);
    return res.status(500).json({ error: 'Tenant login failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[tenant-auth] logout error', err);
      return res.status(500).json({ error: 'Failed to end tenant session' });
    }
    return res.json({ ok: true });
  });
});

router.post('/change-password', requireTenantHost, (req, res) => {
  try {
    const tenant = req.hostContext?.tenant;
    const userId = Number(req.session?.user?.id);
    if (!tenant) return res.status(400).json({ error: 'Tenant host is not configured' });
    if (!userId || req.session?.user?.isPlatformAdmin) {
      return res.status(401).json({ error: 'Tenant login required' });
    }

    const membership = loadActiveMembership(userId, tenant.id);
    if (!membership) {
      return res.status(403).json({ error: 'Tenant access denied' });
    }

    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    const user = db.prepare('SELECT id, email, password_hash, status FROM users WHERE id = ? LIMIT 1').get(userId);
    if (!user || user.status !== 'active' || !user.password_hash || !verifyPassword(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    let passwordHash;
    try {
      passwordHash = hashPassword(newPassword);
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Invalid password' });
    }

    db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, userId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('[tenant-auth] change-password error', err);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// Force change password — no current password required, only works when must_change_password = 1
router.post('/force-change-password', requireTenantHost, (req, res) => {
  try {
    const tenant = req.hostContext?.tenant;
    const userId = Number(req.session?.user?.id);
    if (!tenant) return res.status(400).json({ error: 'Tenant host is not configured' });
    if (!userId || req.session?.user?.isPlatformAdmin) {
      return res.status(401).json({ error: 'Tenant login required' });
    }

    const user = db.prepare('SELECT id, status, must_change_password FROM users WHERE id = ? LIMIT 1').get(userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Account not found or inactive' });
    }
    if (user.must_change_password !== 1) {
      return res.status(403).json({ error: 'Password change not required' });
    }

    const membership = loadActiveMembership(userId, tenant.id);
    if (!membership) {
      return res.status(403).json({ error: 'Tenant access denied' });
    }

    const newPassword = String(req.body?.newPassword || '');
    if (!newPassword) {
      return res.status(400).json({ error: 'newPassword is required' });
    }

    let passwordHash;
    try {
      passwordHash = hashPassword(newPassword);
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Invalid password' });
    }

    db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, userId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('[tenant-auth] force-change-password error', err);
    return res.status(500).json({ error: 'Failed to set password' });
  }
});

export default router;
