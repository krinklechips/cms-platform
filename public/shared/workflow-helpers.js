export const ADMIN_NAV_MODEL = Object.freeze({
  operations: {
    label: 'Operations',
    page: 'operations',
    subitems: [
      { id: 'storage-diagnostics', label: 'Storage Diagnostics', helper: 'DB path and disk checks', hash: '#section-storage-diagnostics', page: 'operations' },
      { id: 'db-backups', label: 'DB Backups', helper: 'R2 snapshot history', hash: '#section-db-backups', page: 'operations' },
    ],
  },
  tenants: {
    label: 'Customers / Tenants',
    page: 'tenant-directory',
    subitems: [
      { id: 'create-tenant', label: 'Create Tenant', helper: 'New customer onboarding', hash: '#section-tenant-create', page: 'create-tenant' },
      { id: 'tenant-directory', label: 'Tenant Directory', helper: 'Search and filter tenants', hash: '#section-tenant-list', page: 'tenant-directory' },
      { id: 'selected-tenant', label: 'Selected Tenant', helper: 'Edit active tenant settings', hash: '#tenant-settings-panel-branding', page: 'selected-tenant', tenantSettingsTab: 'branding' },
    ],
  },
  integrations: {
    label: 'Integrations & Access',
    page: 'domain-provisioning',
    subitems: [
      { id: 'domain-provisioning', label: 'Domain Provisioning', helper: 'Render + DNS workflow', hash: '#tenant-settings-panel-domains', page: 'domain-provisioning', tenantSettingsTab: 'domains' },
      { id: 'module-access', label: 'Module Access', helper: 'Toggle tenant-visible modules', hash: '#tenant-settings-panel-content', page: 'module-access', tenantSettingsTab: 'content' },
      { id: 'tenant-users', label: 'Tenant Users', helper: 'Provisioning and roles', hash: '#tenant-settings-panel-users', page: 'tenant-users', tenantSettingsTab: 'users' },
      { id: 'support-details', label: 'Support Details', helper: 'Support email and contact', hash: '#tenant-settings-panel-support', page: 'support-details', tenantSettingsTab: 'support' },
    ],
  },
});

export function flattenAdminSubitems(model = ADMIN_NAV_MODEL) {
  return Object.values(model).flatMap((group) => group.subitems || []);
}

export function getAdminMain(main, model = ADMIN_NAV_MODEL) {
  return Object.prototype.hasOwnProperty.call(model, String(main || ''))
    ? String(main)
    : 'tenants';
}

export function getAdminSub(main, sub, model = ADMIN_NAV_MODEL) {
  const mainKey = getAdminMain(main, model);
  const items = model[mainKey]?.subitems || [];
  const subKey = String(sub || '');
  return items.some((item) => item.id === subKey) ? subKey : (items[0]?.id || '');
}

export function normalizeAdminNavState(next, model = ADMIN_NAV_MODEL, currentState = null) {
  const main = getAdminMain(next?.main || currentState?.main, model);
  const sub = getAdminSub(main, next?.sub || currentState?.sub, model);
  return { main, sub };
}

export function getAdminSubItem(main, sub, model = ADMIN_NAV_MODEL, currentState = null) {
  const normalized = normalizeAdminNavState({ main, sub }, model, currentState);
  return (model[normalized.main]?.subitems || []).find((item) => item.id === normalized.sub) || null;
}

export function getAdminPageForState(next, model = ADMIN_NAV_MODEL, currentState = null) {
  const normalized = normalizeAdminNavState(next, model, currentState);
  return getAdminSubItem(normalized.main, normalized.sub, model, currentState)?.page
    || model[normalized.main]?.page
    || 'tenants';
}

export function normalizeTenantModuleAccess(input) {
  const source = input && typeof input === 'object' ? input : {};
  return {
    homepagePlacements: source.homepagePlacements !== false,
    articles: source.articles !== false,
    libraries: source.libraries !== false,
    annualReports: source.annualReports !== false,
    navigationTabs: source.navigationTabs !== false,
  };
}

export function getAllowedTenantViews(access) {
  return {
    overview: true,
    articles: access.articles !== false,
    media: access.libraries !== false,
    'annual-reports': access.annualReports !== false,
    'site-preview': access.navigationTabs !== false || access.homepagePlacements !== false,
    'account-security': true,
  };
}

export function resolveTenantDashboardView(requested, access) {
  const allowed = getAllowedTenantViews(access);
  if (requested && allowed[requested]) return requested;
  const fallbackOrder = ['overview', 'articles', 'media', 'annual-reports', 'site-preview', 'account-security'];
  return fallbackOrder.find((view) => allowed[view]) || 'overview';
}
