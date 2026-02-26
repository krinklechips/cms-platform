import express from 'express';
import { db } from '../db.js';
import { env } from '../config/env.js';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin.js';
import {
  isRenderApiConfigured,
  renderCreateCustomDomain,
  renderGetCustomDomain,
  renderGetService,
  renderListCustomDomains,
  renderVerifyCustomDomain,
  RenderApiError,
} from '../integrations/renderApi.js';

const router = express.Router({ mergeParams: true });

router.use(requirePlatformAdmin);

function normalizeHostname(input) {
  let value = String(input || '').trim().toLowerCase();
  if (!value) return '';
  if (value.includes(',')) value = value.split(',')[0].trim();
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      value = new URL(value).host;
    } catch {
      value = value.replace(/^https?:\/\//, '').split('/')[0];
    }
  }
  value = value.split('/')[0];
  if (value.includes(':')) value = value.split(':')[0];
  return value.replace(/\.$/, '');
}

function looksLikeHostname(value) {
  return /^[a-z0-9.-]+$/.test(value) && value.includes('.') && !value.startsWith('.') && !value.endsWith('.');
}

function isProbablySubdomain(hostname) {
  return hostname.split('.').filter(Boolean).length >= 3;
}

function parseJsonSafe(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function stableJson(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return 'null';
  }
}

function loadTenantById(tenantId) {
  return db.prepare(`
    SELECT
      t.id, t.slug, t.name, t.status, t.created_at, t.updated_at,
      b.logo_url, b.primary_color, b.support_email, b.public_site_url, b.cms_domain
    FROM tenants t
    LEFT JOIN tenant_branding b ON b.tenant_id = t.id
    WHERE t.id = ?
    LIMIT 1
  `).get(tenantId);
}

function mapTenant(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    branding: {
      logoUrl: row.logo_url || null,
      primaryColor: row.primary_color || null,
      supportEmail: row.support_email || null,
      publicSiteUrl: row.public_site_url || null,
      cmsDomain: row.cms_domain || null,
    },
  };
}

function loadTenantDomainRow(tenantId) {
  return db.prepare(`
    SELECT
      tenant_id, hostname, dns_mode, dns_provider, status,
      render_custom_domain_id, render_custom_domain_name, render_status,
      dns_records_json, render_response_json, last_error,
      created_at, updated_at, last_checked_at, verified_at
    FROM tenant_domains
    WHERE tenant_id = ?
  `).get(tenantId);
}

function upsertTenantDomainRow(tenantId, patch) {
  const current = loadTenantDomainRow(tenantId) || {};
  const next = {
    hostname: patch.hostname ?? current.hostname ?? null,
    dns_mode: patch.dns_mode ?? current.dns_mode ?? 'customer_managed',
    dns_provider: patch.dns_provider ?? current.dns_provider ?? null,
    status: patch.status ?? current.status ?? 'draft',
    render_custom_domain_id: patch.render_custom_domain_id ?? current.render_custom_domain_id ?? null,
    render_custom_domain_name: patch.render_custom_domain_name ?? current.render_custom_domain_name ?? null,
    render_status: patch.render_status ?? current.render_status ?? null,
    dns_records_json: patch.dns_records_json ?? current.dns_records_json ?? null,
    render_response_json: patch.render_response_json ?? current.render_response_json ?? null,
    last_error: patch.last_error === undefined ? (current.last_error ?? null) : patch.last_error,
    last_checked_at: patch.last_checked_at ?? current.last_checked_at ?? null,
    verified_at: patch.verified_at ?? current.verified_at ?? null,
  };

  db.prepare(`
    INSERT INTO tenant_domains (
      tenant_id, hostname, dns_mode, dns_provider, status,
      render_custom_domain_id, render_custom_domain_name, render_status,
      dns_records_json, render_response_json, last_error, last_checked_at, verified_at,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO UPDATE SET
      hostname = excluded.hostname,
      dns_mode = excluded.dns_mode,
      dns_provider = excluded.dns_provider,
      status = excluded.status,
      render_custom_domain_id = excluded.render_custom_domain_id,
      render_custom_domain_name = excluded.render_custom_domain_name,
      render_status = excluded.render_status,
      dns_records_json = excluded.dns_records_json,
      render_response_json = excluded.render_response_json,
      last_error = excluded.last_error,
      last_checked_at = excluded.last_checked_at,
      verified_at = excluded.verified_at,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    tenantId,
    next.hostname,
    next.dns_mode,
    next.dns_provider,
    next.status,
    next.render_custom_domain_id,
    next.render_custom_domain_name,
    next.render_status,
    next.dns_records_json,
    next.render_response_json,
    next.last_error,
    next.last_checked_at,
    next.verified_at,
  );

  return loadTenantDomainRow(tenantId);
}

function syncTenantBrandingCmsDomain(tenantId, hostname) {
  db.prepare(`
    INSERT INTO tenant_branding (tenant_id, cms_domain, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(tenant_id) DO UPDATE SET
      cms_domain = excluded.cms_domain,
      updated_at = CURRENT_TIMESTAMP
  `).run(tenantId, hostname || null);
}

function isPlatformAdminHost(hostname) {
  const target = normalizeHostname(hostname);
  if (!target) return false;
  const set = new Set(
    ['localhost', '127.0.0.1', ...(Array.isArray(env.PLATFORM_ADMIN_HOSTS) ? env.PLATFORM_ADMIN_HOSTS : [])]
      .map(normalizeHostname)
      .filter(Boolean),
  );
  return set.has(target);
}

function walkObjects(value, visit) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item) => walkObjects(item, visit));
    return;
  }
  visit(value);
  Object.values(value).forEach((child) => walkObjects(child, visit));
}

function extractString(obj, keys) {
  for (const key of keys) {
    if (typeof obj?.[key] === 'string' && obj[key].trim()) return obj[key].trim();
  }
  return null;
}

function extractBoolean(obj, keys) {
  for (const key of keys) {
    if (typeof obj?.[key] === 'boolean') return obj[key];
  }
  return null;
}

function extractDnsRecords(renderPayload) {
  const records = [];
  const seen = new Set();

  walkObjects(renderPayload, (obj) => {
    const type = extractString(obj, ['type', 'recordType', 'dnsRecordType']);
    const name = extractString(obj, ['name', 'host', 'hostname', 'recordName']);
    const value = extractString(obj, ['value', 'content', 'target', 'recordValue', 'answer']);
    if (!type || !name || !value) return;
    if (!['A', 'AAAA', 'CNAME', 'TXT', 'ANAME', 'ALIAS'].includes(type.toUpperCase())) return;
    const key = `${type.toUpperCase()}|${name}|${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    records.push({
      type: type.toUpperCase(),
      name,
      value,
      ttl: typeof obj.ttl === 'number' ? obj.ttl : null,
      notes: extractString(obj, ['purpose', 'description', 'note']),
    });
  });

  return records;
}

function collectStatusStrings(renderPayload) {
  const values = [];
  walkObjects(renderPayload, (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value !== 'string') continue;
      const k = key.toLowerCase();
      if (k.includes('status') || k.includes('state') || k.includes('verification')) {
        values.push(value.toLowerCase());
      }
    }
  });
  return values;
}

function extractRenderDomainMeta(renderPayload, fallbackHostname) {
  let id = null;
  let name = null;
  let status = null;
  let verified = null;

  walkObjects(renderPayload, (obj) => {
    if (!id && (typeof obj.id === 'string' || typeof obj.id === 'number')) id = String(obj.id);
    if (!name) name = extractString(obj, ['name', 'hostname', 'domain']);
    if (!status) status = extractString(obj, ['status', 'verificationStatus', 'state']);
    if (verified === null) verified = extractBoolean(obj, ['verified', 'isVerified']);
  });

  const statusStrings = collectStatusStrings(renderPayload);
  const impliedVerified = statusStrings.some((s) => s.includes('verified') || s.includes('active') || s.includes('issued'));
  if (verified === null && impliedVerified) verified = true;

  return {
    id,
    name: normalizeHostname(name || fallbackHostname || ''),
    renderStatus: status || null,
    verified: Boolean(verified),
    dnsRecords: extractDnsRecords(renderPayload),
  };
}

function extractOnrenderHostname(servicePayload) {
  let host = null;
  walkObjects(servicePayload, (obj) => {
    if (!host) {
      for (const value of Object.values(obj)) {
        if (typeof value !== 'string') continue;
        const normalized = normalizeHostname(value);
        if (normalized && normalized.endsWith('.onrender.com')) {
          host = normalized;
          break;
        }
      }
    }
  });
  return host || normalizeHostname(env.RENDER_SERVICE_CANONICAL_HOSTNAME || '');
}

function buildManualDnsInstructions({ hostname, dnsProvider, dnsMode, dnsRecords, renderTarget }) {
  const normalizedHost = normalizeHostname(hostname || '');
  const records = Array.isArray(dnsRecords) && dnsRecords.length
    ? dnsRecords
    : (renderTarget
      ? [{
          type: 'CNAME',
          name: normalizedHost,
          value: renderTarget,
          ttl: null,
          notes: 'Create a CNAME to the Render service hostname.',
        }]
      : []);

  const subdomainHint = isProbablySubdomain(normalizedHost)
    ? 'Subdomain setup is supported in v1. Create a CNAME record for the full hostname (or the relative host label in Exabytes).'
    : 'Apex/root domains may require provider-specific flattening/ALIAS. Prefer a subdomain like cms.example.com for v1.';

  return {
    mode: dnsMode || 'customer_managed',
    provider: dnsProvider || 'manual',
    hostname: normalizedHost || null,
    targetHint: renderTarget || null,
    summary: 'Add the DNS record(s) below in your DNS provider (Exabytes/manual mode), then click Verify in the portal.',
    providerHints: [
      'In Exabytes DNS, use the DNS Zone editor to add the record.',
      'If Exabytes asks for Host/Name instead of full hostname, use the subdomain label relative to your zone.',
      'Remove conflicting A/AAAA/CNAME records for the same host before verifying.',
      subdomainHint,
    ],
    records,
  };
}

function mapDomainRowForResponse(row) {
  if (!row) return null;
  return {
    tenantId: row.tenant_id,
    hostname: row.hostname,
    dnsMode: row.dns_mode || 'customer_managed',
    dnsProvider: row.dns_provider || null,
    status: row.status || 'draft',
    renderCustomDomainId: row.render_custom_domain_id || null,
    renderCustomDomainName: row.render_custom_domain_name || null,
    renderStatus: row.render_status || null,
    lastError: row.last_error || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    lastCheckedAt: row.last_checked_at || null,
    verifiedAt: row.verified_at || null,
    dnsRecords: parseJsonSafe(row.dns_records_json, []),
  };
}

async function loadRenderTargetHostname() {
  const envTarget = normalizeHostname(env.RENDER_SERVICE_CANONICAL_HOSTNAME || '');
  if (envTarget) return envTarget;
  try {
    const service = await renderGetService();
    return extractOnrenderHostname(service);
  } catch {
    return '';
  }
}

function getTenantIdFromParams(req) {
  const id = Number(req.params.tenantId);
  return Number.isFinite(id) && id > 0 ? id : null;
}

async function findExistingRenderDomain(hostname) {
  const list = await renderListCustomDomains();
  const items = Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : [];
  const normalized = normalizeHostname(hostname);
  const match = items.find((item) => {
    const name = normalizeHostname(
      item?.name || item?.hostname || item?.domain || item?.customDomain || item?.custom_domain_name || '',
    );
    return name && name === normalized;
  });
  return match || null;
}

async function ensureRenderCustomDomain(hostname) {
  const existing = await findExistingRenderDomain(hostname);
  if (existing) return existing;
  try {
    return await renderCreateCustomDomain(hostname);
  } catch (err) {
    if (err instanceof RenderApiError && (err.status === 409 || err.status === 422)) {
      const retry = await findExistingRenderDomain(hostname);
      if (retry) return retry;
    }
    throw err;
  }
}

async function enrichRenderDomainPayload(payload, hostname) {
  const meta = extractRenderDomainMeta(payload, hostname);
  if (meta.id) {
    try {
      const fetched = await renderGetCustomDomain(meta.id);
      return { payload: fetched, meta: extractRenderDomainMeta(fetched, hostname) };
    } catch {
      return { payload, meta };
    }
  }
  try {
    const fetched = await renderGetCustomDomain(hostname);
    return { payload: fetched, meta: extractRenderDomainMeta(fetched, hostname) };
  } catch {
    return { payload, meta };
  }
}

function deriveProvisioningStatus(meta) {
  if (meta.verified) return 'verified';
  const statusString = String(meta.renderStatus || '').toLowerCase();
  if (statusString.includes('failed') || statusString.includes('error')) return 'failed';
  if (statusString.includes('verif')) return 'verifying';
  return 'pending_dns';
}

async function buildDomainResponse({ tenantRow, domainRow }) {
  const tenant = mapTenant(tenantRow);
  const mapped = mapDomainRowForResponse(domainRow);
  const renderTarget = await loadRenderTargetHostname();
  const instructions = mapped?.hostname
    ? buildManualDnsInstructions({
        hostname: mapped.hostname,
        dnsProvider: mapped.dnsProvider,
        dnsMode: mapped.dnsMode,
        dnsRecords: mapped.dnsRecords,
        renderTarget,
      })
    : null;

  return {
    tenant,
    domain: mapped,
    instructions,
    render: {
      configured: isRenderApiConfigured(),
      apiBaseUrl: env.RENDER_API_BASE_URL,
      serviceId: env.RENDER_SERVICE_ID || null,
      serviceHostname: renderTarget || null,
    },
  };
}

router.get('/', async (req, res) => {
  const tenantId = getTenantIdFromParams(req);
  if (!tenantId) return res.status(400).json({ error: 'Invalid tenant id' });
  const tenantRow = loadTenantById(tenantId);
  if (!tenantRow) return res.status(404).json({ error: 'Tenant not found' });
  const domainRow = loadTenantDomainRow(tenantId);
  return res.json(await buildDomainResponse({ tenantRow, domainRow }));
});

router.post('/provision', async (req, res) => {
  const tenantId = getTenantIdFromParams(req);
  if (!tenantId) return res.status(400).json({ error: 'Invalid tenant id' });
  const tenantRow = loadTenantById(tenantId);
  if (!tenantRow) return res.status(404).json({ error: 'Tenant not found' });

  if (!isRenderApiConfigured()) {
    return res.status(503).json({ error: 'Render domain provisioning is not configured on this server.' });
  }

  const requestedHost = normalizeHostname(req.body?.hostname || tenantRow.cms_domain || '');
  const dnsMode = String(req.body?.dnsMode || 'customer_managed').trim() || 'customer_managed';
  const dnsProvider = String(req.body?.dnsProvider || 'exabytes').trim() || 'exabytes';

  if (!requestedHost || !looksLikeHostname(requestedHost)) {
    return res.status(400).json({ error: 'A valid hostname is required (e.g. cms.client.com).' });
  }
  if (isPlatformAdminHost(requestedHost)) {
    return res.status(400).json({ error: 'Tenant CMS domain cannot match a platform admin host.' });
  }

  const collision = db.prepare(`
    SELECT tenant_id
    FROM tenant_domains
    WHERE hostname = ? AND tenant_id != ?
    LIMIT 1
  `).get(requestedHost, tenantId);
  if (collision) {
    return res.status(409).json({ error: 'This hostname is already assigned to another tenant.' });
  }

  syncTenantBrandingCmsDomain(tenantId, requestedHost);
  upsertTenantDomainRow(tenantId, {
    hostname: requestedHost,
    dns_mode: dnsMode,
    dns_provider: dnsProvider,
    status: 'provisioning',
    last_error: null,
    last_checked_at: new Date().toISOString(),
  });

  try {
    const createdOrExisting = await ensureRenderCustomDomain(requestedHost);
    const { payload, meta } = await enrichRenderDomainPayload(createdOrExisting, requestedHost);
    const status = deriveProvisioningStatus(meta);
    const verifiedAt = meta.verified ? new Date().toISOString() : null;

    const row = upsertTenantDomainRow(tenantId, {
      hostname: requestedHost,
      dns_mode: dnsMode,
      dns_provider: dnsProvider,
      status,
      render_custom_domain_id: meta.id || null,
      render_custom_domain_name: meta.name || requestedHost,
      render_status: meta.renderStatus || null,
      dns_records_json: stableJson(meta.dnsRecords || []),
      render_response_json: stableJson(payload),
      last_error: null,
      last_checked_at: new Date().toISOString(),
      verified_at: verifiedAt,
    });

    const freshTenant = loadTenantById(tenantId);
    return res.json(await buildDomainResponse({ tenantRow: freshTenant, domainRow: row }));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to provision domain';
    const row = upsertTenantDomainRow(tenantId, {
      hostname: requestedHost,
      dns_mode: dnsMode,
      dns_provider: dnsProvider,
      status: 'failed',
      last_error: message,
      last_checked_at: new Date().toISOString(),
    });
    const freshTenant = loadTenantById(tenantId);
    return res.status(err instanceof RenderApiError ? err.status : 500).json({
      error: message,
      ...(await buildDomainResponse({ tenantRow: freshTenant, domainRow: row })),
    });
  }
});

router.post('/verify', async (req, res) => {
  const tenantId = getTenantIdFromParams(req);
  if (!tenantId) return res.status(400).json({ error: 'Invalid tenant id' });
  const tenantRow = loadTenantById(tenantId);
  if (!tenantRow) return res.status(404).json({ error: 'Tenant not found' });
  const current = loadTenantDomainRow(tenantId);
  if (!current?.hostname) return res.status(400).json({ error: 'No tenant domain is configured yet.' });
  if (!isRenderApiConfigured()) {
    return res.status(503).json({ error: 'Render domain provisioning is not configured on this server.' });
  }

  upsertTenantDomainRow(tenantId, {
    status: 'verifying',
    last_error: null,
    last_checked_at: new Date().toISOString(),
  });

  try {
    const idOrName = current.render_custom_domain_id || current.render_custom_domain_name || current.hostname;
    const verifyPayload = await renderVerifyCustomDomain(idOrName);
    const { payload, meta } = await enrichRenderDomainPayload(verifyPayload, current.hostname);
    const status = deriveProvisioningStatus(meta);
    const row = upsertTenantDomainRow(tenantId, {
      status,
      render_custom_domain_id: meta.id || current.render_custom_domain_id || null,
      render_custom_domain_name: meta.name || current.render_custom_domain_name || current.hostname,
      render_status: meta.renderStatus || null,
      dns_records_json: stableJson(meta.dnsRecords || parseJsonSafe(current.dns_records_json, [])),
      render_response_json: stableJson(payload),
      last_error: null,
      last_checked_at: new Date().toISOString(),
      verified_at: meta.verified ? new Date().toISOString() : null,
    });
    const freshTenant = loadTenantById(tenantId);
    return res.json(await buildDomainResponse({ tenantRow: freshTenant, domainRow: row }));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to verify domain';
    const row = upsertTenantDomainRow(tenantId, {
      status: 'failed',
      last_error: message,
      last_checked_at: new Date().toISOString(),
    });
    const freshTenant = loadTenantById(tenantId);
    return res.status(err instanceof RenderApiError ? err.status : 500).json({
      error: message,
      ...(await buildDomainResponse({ tenantRow: freshTenant, domainRow: row })),
    });
  }
});

export default router;
