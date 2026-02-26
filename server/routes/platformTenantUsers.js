import express from 'express';
import { db } from '../db.js';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin.js';
import { hashPassword } from '../auth/passwords.js';

const router = express.Router();
const ALLOWED_TENANT_ROLES = new Set(['admin', 'editor', 'viewer']);
const ALLOWED_STATUSES = new Set(['active', 'disabled']);

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

function normalizeRole(value, fallback = 'admin') {
  const role = String(value || fallback).trim().toLowerCase() || fallback;
  if (!ALLOWED_TENANT_ROLES.has(role)) {
    throw new Error(`Invalid tenant role. Allowed: ${Array.from(ALLOWED_TENANT_ROLES).join(', ')}`);
  }
  return role;
}

function normalizeStatus(value, fallback = 'active') {
  const status = String(value || fallback).trim().toLowerCase() || fallback;
  if (!ALLOWED_STATUSES.has(status)) {
    throw new Error(`Invalid status. Allowed: ${Array.from(ALLOWED_STATUSES).join(', ')}`);
  }
  return status;
}

function mapTenantUserRow(row) {
  if (!row) return null;
  return {
    id: row.user_id,
    email: row.email,
    userStatus: row.user_status,
    userCreatedAt: row.user_created_at,
    userUpdatedAt: row.user_updated_at,
    hasPassword: Boolean(row.password_hash),
    membership: {
      id: row.membership_id,
      tenantId: row.tenant_id,
      role: row.role,
      status: row.membership_status,
      createdAt: row.membership_created_at,
      updatedAt: row.membership_updated_at,
    },
    isPlatformAdmin: Boolean(row.platform_admin_user_id),
  };
}

router.get('/', (req, res) => {
  const tenant = findTenant({ tenantId: req.query?.tenantId, tenantSlug: req.query?.tenantSlug });
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found. Provide tenantId or tenantSlug.' });
  }

  const rows = db.prepare(`
    SELECT
      u.id AS user_id,
      u.email,
      u.password_hash,
      u.status AS user_status,
      u.created_at AS user_created_at,
      u.updated_at AS user_updated_at,
      tm.id AS membership_id,
      tm.tenant_id,
      tm.role,
      tm.status AS membership_status,
      tm.created_at AS membership_created_at,
      tm.updated_at AS membership_updated_at,
      pa.user_id AS platform_admin_user_id
    FROM tenant_memberships tm
    JOIN users u ON u.id = tm.user_id
    LEFT JOIN platform_admins pa ON pa.user_id = u.id
    WHERE tm.tenant_id = ?
    ORDER BY
      CASE tm.role
        WHEN 'admin' THEN 1
        WHEN 'editor' THEN 2
        WHEN 'viewer' THEN 3
        ELSE 9
      END,
      LOWER(u.email) ASC
  `).all(tenant.id);

  return res.json({
    ok: true,
    tenant,
    users: rows.map(mapTenantUserRow),
    allowedRoles: Array.from(ALLOWED_TENANT_ROLES),
    allowedStatuses: Array.from(ALLOWED_STATUSES),
  });
});

router.post('/', (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  let role;
  let userStatus;
  let membershipStatus;

  if (!email) return res.status(400).json({ error: 'email is required' });
  if (!password) return res.status(400).json({ error: 'password is required' });

  const tenant = findTenant({ tenantId: req.body?.tenantId, tenantSlug: req.body?.tenantSlug });
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found. Provide tenantId or tenantSlug.' });
  }

  try {
    role = normalizeRole(req.body?.role, 'admin');
    userStatus = normalizeStatus(req.body?.userStatus, 'active');
    membershipStatus = normalizeStatus(req.body?.membershipStatus, 'active');
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Invalid tenant user payload' });
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
    user: mapTenantUserRow({
      user_id: user.id,
      email: user.email,
      password_hash: user.password_hash,
      user_status: user.status,
      user_created_at: user.created_at,
      user_updated_at: user.updated_at,
      membership_id: null,
      tenant_id: membership.tenant_id,
      role: membership.role,
      membership_status: membership.status,
      membership_created_at: membership.created_at,
      membership_updated_at: membership.updated_at,
      platform_admin_user_id: null,
    }),
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

router.patch('/:userId', (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(400).json({ error: 'Valid userId is required' });

  const tenant = findTenant({ tenantId: req.body?.tenantId ?? req.query?.tenantId, tenantSlug: req.body?.tenantSlug ?? req.query?.tenantSlug });
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found. Provide tenantId or tenantSlug.' });
  }

  const existingMembership = db.prepare(`
    SELECT tm.id, tm.user_id, tm.tenant_id
    FROM tenant_memberships tm
    WHERE tm.tenant_id = ? AND tm.user_id = ?
  `).get(tenant.id, userId);
  if (!existingMembership) {
    return res.status(404).json({ error: 'Tenant membership not found' });
  }

  const updates = {};
  try {
    if (req.body?.role !== undefined) updates.role = normalizeRole(req.body.role);
    if (req.body?.membershipStatus !== undefined) updates.membershipStatus = normalizeStatus(req.body.membershipStatus);
    if (req.body?.userStatus !== undefined) updates.userStatus = normalizeStatus(req.body.userStatus);
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Invalid update payload' });
  }
  const password = req.body?.password !== undefined ? String(req.body?.password || '') : null;

  if (!Object.keys(updates).length && password === null) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  if (updates.userStatus) {
    db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(updates.userStatus, userId);
  }
  if (updates.role || updates.membershipStatus) {
    db.prepare(`
      UPDATE tenant_memberships
      SET role = COALESCE(?, role),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = ? AND user_id = ?
    `).run(updates.role || null, updates.membershipStatus || null, tenant.id, userId);
  }
  if (password !== null) {
    let passwordHash;
    try {
      passwordHash = hashPassword(password);
    } catch (err) {
      return res.status(400).json({ error: err.message || 'Invalid password' });
    }
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, userId);
  }

  const row = db.prepare(`
    SELECT
      u.id AS user_id,
      u.email,
      u.password_hash,
      u.status AS user_status,
      u.created_at AS user_created_at,
      u.updated_at AS user_updated_at,
      tm.id AS membership_id,
      tm.tenant_id,
      tm.role,
      tm.status AS membership_status,
      tm.created_at AS membership_created_at,
      tm.updated_at AS membership_updated_at,
      pa.user_id AS platform_admin_user_id
    FROM tenant_memberships tm
    JOIN users u ON u.id = tm.user_id
    LEFT JOIN platform_admins pa ON pa.user_id = u.id
    WHERE tm.tenant_id = ? AND tm.user_id = ?
    LIMIT 1
  `).get(tenant.id, userId);

  return res.json({
    ok: true,
    tenant,
    user: mapTenantUserRow(row),
    passwordUpdated: password !== null,
  });
});

router.delete('/:userId', (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isFinite(userId) || userId <= 0) return res.status(400).json({ error: 'Valid userId is required' });

  const tenant = findTenant({ tenantId: req.body?.tenantId ?? req.query?.tenantId, tenantSlug: req.body?.tenantSlug ?? req.query?.tenantSlug });
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found. Provide tenantId or tenantSlug.' });
  }

  const membership = db.prepare(`
    SELECT tm.id, tm.user_id, u.email
    FROM tenant_memberships tm
    JOIN users u ON u.id = tm.user_id
    WHERE tm.tenant_id = ? AND tm.user_id = ?
    LIMIT 1
  `).get(tenant.id, userId);
  if (!membership) {
    return res.status(404).json({ error: 'Tenant membership not found' });
  }

  db.prepare('DELETE FROM tenant_memberships WHERE tenant_id = ? AND user_id = ?').run(tenant.id, userId);

  const remainingMemberships = db.prepare('SELECT COUNT(*) AS count FROM tenant_memberships WHERE user_id = ?').get(userId)?.count || 0;

  return res.json({
    ok: true,
    tenant,
    removed: {
      userId,
      email: membership.email,
      tenantId: tenant.id,
    },
    userStillHasTenantAccess: remainingMemberships > 0,
  });
});

export default router;
