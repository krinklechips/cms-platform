import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ADMIN_NAV_MODEL,
  flattenAdminSubitems,
  getAdminPageForState,
  normalizeAdminNavState,
} from '../public/shared/workflow-helpers.js';

test('admin nav subitem ids are unique', () => {
  const ids = flattenAdminSubitems(ADMIN_NAV_MODEL).map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every admin sidebar subitem maps to a real page', () => {
  const items = flattenAdminSubitems(ADMIN_NAV_MODEL);
  assert.ok(items.length > 0);
  items.forEach((item) => {
    assert.equal(typeof item.page, 'string');
    assert.notEqual(item.page.trim(), '');
  });
});

test('normalizing admin nav state resolves to a valid page-owning subitem', () => {
  const resolved = normalizeAdminNavState({ main: 'tenants', sub: 'tenant-directory' }, ADMIN_NAV_MODEL);
  assert.deepEqual(resolved, { main: 'tenants', sub: 'tenant-directory' });
  assert.equal(getAdminPageForState(resolved, ADMIN_NAV_MODEL), 'tenant-directory');
});

test('tenant admin workflow subitems resolve to dedicated page keys', () => {
  const cases = [
    { main: 'tenants', sub: 'create-tenant', page: 'create-tenant' },
    { main: 'tenants', sub: 'tenant-directory', page: 'tenant-directory' },
    { main: 'tenants', sub: 'selected-tenant', page: 'selected-tenant' },
    { main: 'integrations', sub: 'domain-provisioning', page: 'domain-provisioning' },
    { main: 'integrations', sub: 'tenant-users', page: 'tenant-users' },
    { main: 'integrations', sub: 'module-access', page: 'module-access' },
    { main: 'integrations', sub: 'support-details', page: 'support-details' },
  ];

  cases.forEach(({ main, sub, page }) => {
    const resolvedPage = getAdminPageForState({ main, sub }, ADMIN_NAV_MODEL);
    assert.equal(resolvedPage, page, `${sub} should resolve to ${page}`);
  });
});
