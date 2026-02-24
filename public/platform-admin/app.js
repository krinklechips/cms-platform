(function () {
  const SLOT_KEY = 'home.news-promotions';

  const state = {
    auth: null,
    tenants: [],
    selectedTenantId: null,
    placement: {
      slot: null,
      items: [],
      assignments: [],
    },
  };

  const els = {
    loginView: document.getElementById('login-view'),
    appView: document.getElementById('app-view'),
    loginNotice: document.getElementById('login-notice'),
    appNotice: document.getElementById('app-notice'),
    authPill: document.getElementById('auth-pill'),
    loginEmail: document.getElementById('login-email'),
    loginSecret: document.getElementById('login-secret'),
    loginBtn: document.getElementById('login-btn'),
    refreshAuthBtn: document.getElementById('refresh-auth-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    createName: document.getElementById('create-name'),
    createSlug: document.getElementById('create-slug'),
    createStatus: document.getElementById('create-status'),
    createPrimaryColor: document.getElementById('create-primary-color'),
    createLogoUrl: document.getElementById('create-logo-url'),
    createPublicSiteUrl: document.getElementById('create-public-site-url'),
    createCmsDomain: document.getElementById('create-cms-domain'),
    createSupportEmail: document.getElementById('create-support-email'),
    createTenantBtn: document.getElementById('create-tenant-btn'),
    refreshTenantsBtn: document.getElementById('refresh-tenants-btn'),
    tenantTableBody: document.getElementById('tenant-table-body'),
    selectedTenantEmpty: document.getElementById('selected-tenant-empty'),
    selectedTenantForm: document.getElementById('selected-tenant-form'),
    selectedTenantMeta: document.getElementById('selected-tenant-meta'),
    editName: document.getElementById('edit-name'),
    editStatus: document.getElementById('edit-status'),
    editSlug: document.getElementById('edit-slug'),
    editPrimaryColor: document.getElementById('edit-primary-color'),
    editLogoUrl: document.getElementById('edit-logo-url'),
    editPublicSiteUrl: document.getElementById('edit-public-site-url'),
    editCmsDomain: document.getElementById('edit-cms-domain'),
    editSupportEmail: document.getElementById('edit-support-email'),
    saveTenantBtn: document.getElementById('save-tenant-btn'),
    reloadSelectedBtn: document.getElementById('reload-selected-btn'),
    placementNotice: document.getElementById('placement-notice'),
    placementEmpty: document.getElementById('placement-empty'),
    placementPanel: document.getElementById('placement-panel'),
    contentType: document.getElementById('content-type'),
    contentStatus: document.getElementById('content-status'),
    contentTitle: document.getElementById('content-title'),
    contentSummary: document.getElementById('content-summary'),
    contentImageUrl: document.getElementById('content-image-url'),
    contentLocation: document.getElementById('content-location'),
    contentCtaLabel: document.getElementById('content-cta-label'),
    contentCtaUrl: document.getElementById('content-cta-url'),
    createContentBtn: document.getElementById('create-content-btn'),
    assignmentTableBody: document.getElementById('assignment-table-body'),
    assignContentItem: document.getElementById('assign-content-item'),
    assignTabKey: document.getElementById('assign-tab-key'),
    assignSortOrder: document.getElementById('assign-sort-order'),
    assignItemBtn: document.getElementById('assign-item-btn'),
    refreshPlacementBtn: document.getElementById('refresh-placement-btn'),
    contentTableBody: document.getElementById('content-table-body'),
  };

  async function api(path, options) {
    const res = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  function setNotice(target, message, kind) {
    if (!target) return;
    if (!message) {
      target.classList.add('hidden');
      target.textContent = '';
      target.className = 'notice hidden';
      return;
    }
    target.textContent = message;
    target.className = `notice ${kind || ''}`.trim();
  }

  function showLogin() {
    els.loginView.classList.remove('hidden');
    els.appView.classList.add('hidden');
  }

  function showApp() {
    els.loginView.classList.add('hidden');
    els.appView.classList.remove('hidden');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getSelectedTenant() {
    return state.tenants.find((t) => t.id === state.selectedTenantId) || null;
  }

  function resetPlacementState() {
    state.placement = { slot: null, items: [], assignments: [] };
  }

  function renderPlacementPanel() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      els.placementEmpty.classList.remove('hidden');
      els.placementPanel.classList.add('hidden');
      els.assignContentItem.innerHTML = '<option value="">Select item…</option>';
      els.assignmentTableBody.innerHTML = '<tr><td colspan="5" class="meta">Select a tenant to load assignments.</td></tr>';
      els.contentTableBody.innerHTML = '<tr><td colspan="3" class="meta">Select a tenant to load content items.</td></tr>';
      return;
    }

    els.placementEmpty.classList.add('hidden');
    els.placementPanel.classList.remove('hidden');

    const items = Array.isArray(state.placement.items) ? state.placement.items : [];
    const assignments = Array.isArray(state.placement.assignments) ? state.placement.assignments : [];

    els.assignContentItem.innerHTML =
      '<option value="">Select item…</option>' +
      items.map((item) => `<option value="${item.id}">[${escapeHtml(item.type)}] ${escapeHtml(item.title)}</option>`).join('');

    els.contentTableBody.innerHTML = items.length
      ? items.map((item) => `
          <tr>
            <td><span class="badge-tab ${item.type === 'promotion' ? 'promotions' : 'news'}">${escapeHtml(item.type)}</span></td>
            <td>${escapeHtml(item.title)}${item.location ? `<div class="meta">${escapeHtml(item.location)}</div>` : ''}</td>
            <td><span class="pill">${escapeHtml(item.status)}</span></td>
          </tr>
        `).join('')
      : '<tr><td colspan="3" class="meta">No content items yet.</td></tr>';

    const sortedAssignments = assignments
      .slice()
      .sort((a, b) => (a.tabKey || '').localeCompare(b.tabKey || '') || (a.sortOrder || 0) - (b.sortOrder || 0));

    els.assignmentTableBody.innerHTML = sortedAssignments.length
      ? sortedAssignments.map((a) => `
          <tr>
            <td><span class="badge-tab ${a.tabKey === 'promotions' ? 'promotions' : 'news'}">${escapeHtml(a.tabKey)}</span></td>
            <td>${Number(a.sortOrder || 0)}</td>
            <td>${escapeHtml(a.content?.title || `Item #${a.contentItemId}`)}</td>
            <td><span class="pill">${escapeHtml(a.status)}</span></td>
            <td><button class="delete-assignment-btn" data-assignment-id="${a.id}">Remove</button></td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="meta">No assignments in this slot yet.</td></tr>';

    els.assignmentTableBody.querySelectorAll('.delete-assignment-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        handleDeleteAssignment(btn.getAttribute('data-assignment-id'));
      });
    });
  }

  function renderSelectedTenant() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      els.selectedTenantEmpty.classList.remove('hidden');
      els.selectedTenantForm.classList.add('hidden');
      els.selectedTenantMeta.textContent = '';
      renderPlacementPanel();
      return;
    }

    els.selectedTenantEmpty.classList.add('hidden');
    els.selectedTenantForm.classList.remove('hidden');
    els.editName.value = tenant.name || '';
    els.editStatus.value = tenant.status || 'active';
    els.editSlug.value = tenant.slug || '';
    els.editPrimaryColor.value = tenant.branding?.primaryColor || '';
    els.editLogoUrl.value = tenant.branding?.logoUrl || '';
    els.editPublicSiteUrl.value = tenant.branding?.publicSiteUrl || '';
    els.editCmsDomain.value = tenant.branding?.cmsDomain || '';
    els.editSupportEmail.value = tenant.branding?.supportEmail || '';
    els.selectedTenantMeta.textContent =
      `Created: ${new Date(tenant.createdAt).toLocaleString()} • Updated: ${new Date(tenant.updatedAt).toLocaleString()}`;
    renderPlacementPanel();
  }

  function renderTenants() {
    const rows = state.tenants;
    if (!rows.length) {
      els.tenantTableBody.innerHTML = '<tr><td colspan="4" class="meta">No tenants yet.</td></tr>';
      renderSelectedTenant();
      return;
    }

    els.tenantTableBody.innerHTML = rows
      .map((tenant) => {
        const selected = tenant.id === state.selectedTenantId ? 'selected' : '';
        return `
          <tr class="tenant-row ${selected}" data-tenant-id="${tenant.id}">
            <td>
              <div class="tenant-name">${escapeHtml(tenant.name)}</div>
              <div class="tenant-slug">${escapeHtml(tenant.slug)}</div>
            </td>
            <td><span class="pill">${escapeHtml(tenant.status)}</span></td>
            <td class="meta">${tenant.articleCount} articles • ${tenant.contentItemCount || 0} items • ${tenant.mediaCount} media • ${tenant.userCount} users</td>
            <td class="meta">
              ${tenant.branding?.cmsDomain ? `CMS: ${escapeHtml(tenant.branding.cmsDomain)}` : 'No CMS domain'}<br />
              ${tenant.branding?.publicSiteUrl ? `Site: ${escapeHtml(tenant.branding.publicSiteUrl)}` : 'No public site URL'}
            </td>
          </tr>
        `;
      })
      .join('');

    els.tenantTableBody.querySelectorAll('.tenant-row').forEach((row) => {
      row.addEventListener('click', async () => {
        state.selectedTenantId = Number(row.getAttribute('data-tenant-id'));
        renderTenants();
        await loadHomepagePlacement();
      });
    });

    if (!getSelectedTenant() && rows[0]) {
      state.selectedTenantId = rows[0].id;
      renderTenants();
      return;
    }

    renderSelectedTenant();
  }

  async function loadAuth() {
    const res = await api('/api/platform/auth/me', { method: 'GET' });
    state.auth = res;
    if (!res.authenticated) {
      showLogin();
      return false;
    }
    const user = res.user || {};
    els.authPill.textContent = `${user.email || 'Unknown'}${user.platformRole ? ` • ${user.platformRole}` : ''}`;
    showApp();
    return true;
  }

  async function loadTenants() {
    try {
      setNotice(els.appNotice, '', '');
      const tenants = await api('/api/platform/tenants', { method: 'GET' });
      state.tenants = tenants;
      renderTenants();
    } catch (err) {
      setNotice(els.appNotice, err.message || 'Failed to load tenants', 'error');
      els.tenantTableBody.innerHTML = '<tr><td colspan="4" class="meta">Failed to load tenants.</td></tr>';
    }
  }

  async function loadHomepagePlacement() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      resetPlacementState();
      renderPlacementPanel();
      return;
    }
    try {
      const data = await api(`/api/platform/placements/tenants/${tenant.id}/slots/${encodeURIComponent(SLOT_KEY)}`, { method: 'GET' });
      state.placement = {
        slot: data.slot || null,
        items: Array.isArray(data.items) ? data.items : [],
        assignments: Array.isArray(data.assignments) ? data.assignments : [],
      };
      renderPlacementPanel();
    } catch (err) {
      resetPlacementState();
      renderPlacementPanel();
      setNotice(els.placementNotice, err.message || 'Failed to load homepage section', 'error');
    }
  }

  async function handleLogin() {
    els.loginBtn.disabled = true;
    try {
      await api('/api/platform/auth/bootstrap-login', {
        method: 'POST',
        body: JSON.stringify({
          email: els.loginEmail.value.trim(),
          secret: els.loginSecret.value,
        }),
      });
      setNotice(els.loginNotice, 'Signed in.', 'ok');
      const ok = await loadAuth();
      if (ok) {
        await loadTenants();
        await loadHomepagePlacement();
      }
    } catch (err) {
      setNotice(els.loginNotice, err.message || 'Sign-in failed', 'error');
    } finally {
      els.loginBtn.disabled = false;
    }
  }

  async function handleLogout() {
    try {
      await api('/api/platform/auth/logout', { method: 'POST' });
    } catch (_) {
      // ignore
    }
    state.auth = null;
    resetPlacementState();
    showLogin();
  }

  async function handleCreateTenant() {
    els.createTenantBtn.disabled = true;
    try {
      const tenant = await api('/api/platform/tenants', {
        method: 'POST',
        body: JSON.stringify({
          slug: els.createSlug.value.trim(),
          name: els.createName.value.trim(),
          status: els.createStatus.value,
          branding: {
            primaryColor: els.createPrimaryColor.value.trim() || null,
            logoUrl: els.createLogoUrl.value.trim() || null,
            publicSiteUrl: els.createPublicSiteUrl.value.trim() || null,
            cmsDomain: els.createCmsDomain.value.trim() || null,
            supportEmail: els.createSupportEmail.value.trim() || null,
          },
        }),
      });
      setNotice(els.appNotice, `Tenant created: ${tenant.name}`, 'ok');
      els.createName.value = '';
      els.createSlug.value = '';
      els.createPrimaryColor.value = '';
      els.createLogoUrl.value = '';
      els.createPublicSiteUrl.value = '';
      els.createCmsDomain.value = '';
      els.createSupportEmail.value = '';
      await loadTenants();
      state.selectedTenantId = tenant.id;
      renderTenants();
      await loadHomepagePlacement();
    } catch (err) {
      setNotice(els.appNotice, err.message || 'Failed to create tenant', 'error');
    } finally {
      els.createTenantBtn.disabled = false;
    }
  }

  async function handleSaveTenant() {
    const tenant = getSelectedTenant();
    if (!tenant) return;
    els.saveTenantBtn.disabled = true;
    try {
      const updated = await api(`/api/platform/tenants/${tenant.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: els.editName.value.trim(),
          status: els.editStatus.value,
          branding: {
            primaryColor: els.editPrimaryColor.value.trim() || null,
            logoUrl: els.editLogoUrl.value.trim() || null,
            publicSiteUrl: els.editPublicSiteUrl.value.trim() || null,
            cmsDomain: els.editCmsDomain.value.trim() || null,
            supportEmail: els.editSupportEmail.value.trim() || null,
          },
        }),
      });
      setNotice(els.appNotice, `Tenant updated: ${updated.name}`, 'ok');
      await loadTenants();
      state.selectedTenantId = updated.id;
      renderTenants();
    } catch (err) {
      setNotice(els.appNotice, err.message || 'Failed to save tenant', 'error');
    } finally {
      els.saveTenantBtn.disabled = false;
    }
  }

  async function handleCreateContentItem() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.placementNotice, 'Select a tenant first.', 'error');
      return;
    }
    els.createContentBtn.disabled = true;
    try {
      const created = await api(`/api/platform/placements/tenants/${tenant.id}/content-items`, {
        method: 'POST',
        body: JSON.stringify({
          type: els.contentType.value,
          status: els.contentStatus.value,
          title: els.contentTitle.value.trim(),
          summary: els.contentSummary.value.trim(),
          imageUrl: els.contentImageUrl.value.trim() || null,
          location: els.contentLocation.value.trim() || null,
          ctaLabel: els.contentCtaLabel.value.trim() || null,
          ctaUrl: els.contentCtaUrl.value.trim() || null,
        }),
      });
      setNotice(els.placementNotice, `Created ${created.type}: ${created.title}`, 'ok');
      els.contentTitle.value = '';
      els.contentSummary.value = '';
      els.contentImageUrl.value = '';
      els.contentLocation.value = '';
      els.contentCtaLabel.value = '';
      els.contentCtaUrl.value = '';
      await loadHomepagePlacement();
    } catch (err) {
      setNotice(els.placementNotice, err.message || 'Failed to create item', 'error');
    } finally {
      els.createContentBtn.disabled = false;
    }
  }

  async function handleAssignItemToSlot() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.placementNotice, 'Select a tenant first.', 'error');
      return;
    }
    const contentItemId = Number(els.assignContentItem.value);
    if (!contentItemId) {
      setNotice(els.placementNotice, 'Select a content item to assign.', 'error');
      return;
    }
    els.assignItemBtn.disabled = true;
    try {
      const assigned = await api(`/api/platform/placements/tenants/${tenant.id}/slots/${encodeURIComponent(SLOT_KEY)}/assignments`, {
        method: 'POST',
        body: JSON.stringify({
          contentItemId,
          tabKey: els.assignTabKey.value,
          sortOrder: Number(els.assignSortOrder.value || 0),
        }),
      });
      setNotice(els.placementNotice, `Assigned "${assigned.content?.title || 'item'}" to ${assigned.tabKey}.`, 'ok');
      await loadHomepagePlacement();
    } catch (err) {
      setNotice(els.placementNotice, err.message || 'Failed to assign item', 'error');
    } finally {
      els.assignItemBtn.disabled = false;
    }
  }

  async function handleDeleteAssignment(assignmentId) {
    const id = Number(assignmentId);
    if (!id) return;
    try {
      await api(`/api/platform/placements/slot-assignments/${id}`, { method: 'DELETE' });
      setNotice(els.placementNotice, 'Assignment removed.', 'ok');
      await loadHomepagePlacement();
    } catch (err) {
      setNotice(els.placementNotice, err.message || 'Failed to remove assignment', 'error');
    }
  }

  function wireEvents() {
    els.loginBtn.addEventListener('click', handleLogin);
    els.refreshAuthBtn.addEventListener('click', async () => {
      try {
        await loadAuth();
        setNotice(els.loginNotice, 'Session checked.', 'ok');
      } catch (err) {
        setNotice(els.loginNotice, err.message || 'Failed to check session', 'error');
      }
    });

    els.logoutBtn.addEventListener('click', handleLogout);
    els.createTenantBtn.addEventListener('click', handleCreateTenant);
    els.refreshTenantsBtn.addEventListener('click', loadTenants);
    els.reloadSelectedBtn.addEventListener('click', async () => {
      await loadTenants();
      await loadHomepagePlacement();
    });
    els.saveTenantBtn.addEventListener('click', handleSaveTenant);

    els.createContentBtn.addEventListener('click', handleCreateContentItem);
    els.assignItemBtn.addEventListener('click', handleAssignItemToSlot);
    els.refreshPlacementBtn.addEventListener('click', loadHomepagePlacement);

    els.createSlug.addEventListener('input', () => {
      const value = els.createSlug.value;
      const cleaned = value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      if (cleaned !== value) els.createSlug.value = cleaned;
    });
  }

  async function init() {
    wireEvents();
    try {
      const authenticated = await loadAuth();
      if (authenticated) {
        await loadTenants();
        await loadHomepagePlacement();
      } else {
        els.loginEmail.value = '';
      }
    } catch (err) {
      showLogin();
      setNotice(els.loginNotice, err.message || 'Failed to initialize admin app', 'error');
    }
  }

  init();
})();
