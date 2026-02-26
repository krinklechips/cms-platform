import express from 'express';
import { db } from '../db.js';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin.js';
import { hashPassword } from '../auth/passwords.js';

const router = express.Router();

router.use(requirePlatformAdmin);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function findTenant({ tenantId, tenantSlug }) {
  if (tenantId) {
    return db.prepare('SELECT id, slug, name, status FROM tenants WHERE id = ?').get(Number(tenantId));
  }
  if (tenantSlug) {
    return db.prepare('SELECT id, slug, name, status FROM tenants WHERE slug = ?').get(String(tenantSlug).trim());
  }
  return null;
}

router.post('/', (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  const role = String(req.body?.role || 'admin').trim() || 'admin';
  const userStatus = req.body?.userStatus === 'disabled' ? 'disabled' : 'active';
  const membershipStatus = req.body?.membershipStatus === 'disabled' ? 'disabled' : 'active';

  if (!email) return res.status(400).json({ error: 'email is required' });
  if (!password) return res.status(400).json({ error: 'password is required' });

  const tenant = findTenant({ tenantId: req.body?.tenantId, tenantSlug: req.body?.tenantSlug });
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found. Provide tenantId or tenantSlug.' });
  }

  let passwordHash;
  try {
    passwordHash = hashPassword(password);
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Invalid password' });
  }

  db.prepare(`
    INSERT INTO users (email, password_hash, status, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      password_hash = excluded.password_hash,
      status = excluded.status,
      updated_at = CURRENT_TIMESTAMP
  `).run(email, passwordHash, userStatus);

  const user = db.prepare('SELECT id, email, status, created_at, updated_at FROM users WHERE email = ?').get(email);
  db.prepare(`
    INSERT INTO tenant_memberships (tenant_id, user_id, role, status, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id, user_id) DO UPDATE SET
      role = excluded.role,
      status = excluded.status,
      updated_at = CURRENT_TIMESTAMP
  `).run(tenant.id, user.id, role, membershipStatus);

  const membership = db.prepare(`
    SELECT tenant_id, user_id, role, status, created_at, updated_at
    FROM tenant_memberships
    WHERE tenant_id = ? AND user_id = ?
  `).get(tenant.id, user.id);

  return res.status(201).json({
    ok: true,
    tenant,
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
    membership: {
      tenantId: membership.tenant_id,
      userId: membership.user_id,
      role: membership.role,
      status: membership.status,
      createdAt: membership.created_at,
      updatedAt: membership.updated_at,
    },
  });
});

export default router;

