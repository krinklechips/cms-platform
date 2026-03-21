import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAllowedTenantViews,
  normalizeTenantModuleAccess,
  resolveTenantDashboardView,
} from '../public/shared/workflow-helpers.js';

test('tenant view access enables article CRUD when articles are enabled', () => {
  const access = normalizeTenantModuleAccess({ articles: true });
  const allowed = getAllowedTenantViews(access);
  assert.equal(allowed.articles, true);
});

test('tenant view fallback never resolves to a disabled module view', () => {
  const access = normalizeTenantModuleAccess({
    articles: false,
    libraries: false,
    annualReports: false,
    navigationTabs: false,
    homepagePlacements: false,
  });
  assert.equal(resolveTenantDashboardView('articles', access), 'overview');
});

test('tenant site preview remains available when homepage placements are enabled', () => {
  const access = normalizeTenantModuleAccess({
    navigationTabs: false,
    homepagePlacements: true,
  });
  const allowed = getAllowedTenantViews(access);
  assert.equal(allowed['site-preview'], true);
});
