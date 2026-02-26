import { db } from '../db.js';

export function requireTenantContext(req, res, next) {
  const tenantIdHeader = req.headers['x-tenant-id'];
  const tenantSlugHeader = req.headers['x-tenant-slug'];

  if (!tenantIdHeader && !tenantSlugHeader && req.hostContext?.isTenantHost && req.hostContext.tenant) {
    req.tenant = req.hostContext.tenant;
  } else {
    let tenant = null;
    if (tenantIdHeader) {
      tenant = db
        .prepare(`
          SELECT t.*, b.logo_url, b.primary_color, b.support_email, b.public_site_url, b.cms_domain
          FROM tenants t
          LEFT JOIN tenant_branding b ON b.tenant_id = t.id
          WHERE t.id = ?
        `)
        .get(Number(tenantIdHeader));
    } else if (tenantSlugHeader) {
      tenant = db
        .prepare(`
          SELECT t.*, b.logo_url, b.primary_color, b.support_email, b.public_site_url, b.cms_domain
          FROM tenants t
          LEFT JOIN tenant_branding b ON b.tenant_id = t.id
          WHERE t.slug = ?
        `)
        .get(String(tenantSlugHeader));
    }

    if (!tenant) {
      return res.status(400).json({
        error: 'Missing tenant context. Provide x-tenant-id or x-tenant-slug.',
      });
    }

    req.tenant = {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      status: tenant.status,
      branding: {
        logoUrl: tenant.logo_url || null,
        primaryColor: tenant.primary_color || null,
        supportEmail: tenant.support_email || null,
        publicSiteUrl: tenant.public_site_url || null,
        cmsDomain: tenant.cms_domain || null,
      },
    };
  }

  const userId = req.session?.user?.id;
  const isPlatformAdmin = Boolean(req.session?.user?.isPlatformAdmin);
  if (userId && !isPlatformAdmin) {
    const membership = db.prepare(`
      SELECT role, status
      FROM tenant_memberships
      WHERE tenant_id = ?
        AND user_id = ?
        AND status = 'active'
      LIMIT 1
    `).get(req.tenant.id, userId);

    if (!membership) {
      return res.status(403).json({ error: 'Tenant access denied' });
    }

    req.tenantAccess = {
      role: membership.role,
      status: membership.status,
      via: 'membership',
    };
  }

  return next();
}
