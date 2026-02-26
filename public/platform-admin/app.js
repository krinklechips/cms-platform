(function () {
  const SLOT_KEY = 'home.news-promotions';

  const state = {
    auth: null,
    uiMode: localStorage.getItem('cms-platform-ui-mode') === 'tenant' ? 'tenant' : 'admin',
    tenantWorkspaceView: localStorage.getItem('cms-platform-tenant-workspace-view') || 'articles',
    tenants: [],
    selectedTenantId: null,
    placement: {
      slot: null,
      items: [],
      assignments: [],
    },
    domainProvisioning: {
      current: null,
    },
    cms: {
      articles: [],
      media: [],
      editingArticle: null,
      annualReports: [],
      editingAnnualReport: null,
      navTabs: [],
      editingNavTabId: null,
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
    loginModeAdminBtn: document.getElementById('login-mode-admin'),
    loginModeTenantBtn: document.getElementById('login-mode-tenant'),
    loginEmailLabel: document.getElementById('login-email-label'),
    loginModeHelp: document.getElementById('login-mode-help'),
    loginBtn: document.getElementById('login-btn'),
    refreshAuthBtn: document.getElementById('refresh-auth-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    appModeAdminBtn: document.getElementById('app-mode-admin'),
    appModeTenantBtn: document.getElementById('app-mode-tenant'),
    sidebarPlatformGroup: document.getElementById('sidebar-platform-group'),
    sidebarTenantGroup: document.getElementById('sidebar-tenant-group'),
    tenantExitAdminLink: document.getElementById('tenant-exit-admin-link'),
    sidebarLogoTitle: document.getElementById('sidebar-logo-title'),
    sidebarLogoSubtitle: document.getElementById('sidebar-logo-subtitle'),
    topbarTitle: document.getElementById('topbar-title'),
    topbarSubtitle: document.getElementById('topbar-subtitle'),
    tenantSwitchWrap: document.getElementById('tenant-switch-wrap'),
    tenantSwitch: document.getElementById('tenant-switch'),
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
    tenantDomainProvisionNotice: document.getElementById('tenant-domain-provision-notice'),
    tenantDomainHostname: document.getElementById('tenant-domain-hostname'),
    tenantDomainDnsMode: document.getElementById('tenant-domain-dns-mode'),
    tenantDomainDnsProvider: document.getElementById('tenant-domain-dns-provider'),
    tenantDomainStatusPill: document.getElementById('tenant-domain-status-pill'),
    tenantDomainLastChecked: document.getElementById('tenant-domain-last-checked'),
    tenantDomainProvisionBtn: document.getElementById('tenant-domain-provision-btn'),
    tenantDomainVerifyBtn: document.getElementById('tenant-domain-verify-btn'),
    tenantDomainRefreshBtn: document.getElementById('tenant-domain-refresh-btn'),
    tenantDomainCopyInstructionsBtn: document.getElementById('tenant-domain-copy-instructions-btn'),
    tenantDomainCheckSummary: document.getElementById('tenant-domain-check-summary'),
    tenantDomainChecklist: document.getElementById('tenant-domain-checklist'),
    tenantDomainLastError: document.getElementById('tenant-domain-last-error'),
    tenantDomainInstructions: document.getElementById('tenant-domain-instructions'),
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
    cmsNotice: document.getElementById('cms-notice'),
    cmsContentEmpty: document.getElementById('cms-content-empty'),
    cmsContentPanel: document.getElementById('cms-content-panel'),
    mediaFilter: document.getElementById('media-filter'),
    libraryPanelTitle: document.getElementById('library-panel-title'),
    libraryMediaBtn: document.getElementById('library-media-btn'),
    libraryDocsBtn: document.getElementById('library-docs-btn'),
    libraryAllBtn: document.getElementById('library-all-btn'),
    mediaUploadInput: document.getElementById('media-upload-input'),
    mediaUploadBtn: document.getElementById('media-upload-btn'),
    mediaRefreshBtn: document.getElementById('media-refresh-btn'),
    mediaTableBody: document.getElementById('media-table-body'),
    articleRefreshBtn: document.getElementById('article-refresh-btn'),
    articleNewBtn: document.getElementById('article-new-btn'),
    articleTableBody: document.getElementById('article-table-body'),
    articleEditorMeta: document.getElementById('article-editor-meta'),
    articleEditId: document.getElementById('article-edit-id'),
    articleStatus: document.getElementById('article-status'),
    articleCategory: document.getElementById('article-category'),
    articleTitle: document.getElementById('article-title'),
    articleSummary: document.getElementById('article-summary'),
    articleBody: document.getElementById('article-body'),
    articlePublishAt: document.getElementById('article-publish-at'),
    articleSource: document.getElementById('article-source'),
    articleImageUrl: document.getElementById('article-image-url'),
    articleImageCaption: document.getElementById('article-image-caption'),
    articleAttachments: document.getElementById('article-attachments'),
    articleSeoTitle: document.getElementById('article-seo-title'),
    articleSeoDescription: document.getElementById('article-seo-description'),
    articleSeoImage: document.getElementById('article-seo-image'),
    articleSeoCanonical: document.getElementById('article-seo-canonical'),
    articleSeoNoIndex: document.getElementById('article-seo-noindex'),
    articleSaveBtn: document.getElementById('article-save-btn'),
    articleDeleteBtn: document.getElementById('article-delete-btn'),
    articleOpenLink: document.getElementById('article-open-link'),
    annualRefreshBtn: document.getElementById('annual-refresh-btn'),
    annualNewBtn: document.getElementById('annual-new-btn'),
    annualTableBody: document.getElementById('annual-table-body'),
    annualEditorMeta: document.getElementById('annual-editor-meta'),
    annualEditId: document.getElementById('annual-edit-id'),
    annualYear: document.getElementById('annual-year'),
    annualStatus: document.getElementById('annual-status'),
    annualTitle: document.getElementById('annual-title'),
    annualSummary: document.getElementById('annual-summary'),
    annualMediaSelect: document.getElementById('annual-media-select'),
    annualSortOrder: document.getElementById('annual-sort-order'),
    annualFileUrl: document.getElementById('annual-file-url'),
    annualSaveBtn: document.getElementById('annual-save-btn'),
    annualDeleteBtn: document.getElementById('annual-delete-btn'),
    annualOpenLink: document.getElementById('annual-open-link'),
    tenantWorkspaceModePill: document.getElementById('tenant-workspace-mode-pill'),
    navTabEditorMeta: document.getElementById('nav-tab-editor-meta'),
    navTabsTableBody: document.getElementById('nav-tabs-table-body'),
    navTabNewBtn: document.getElementById('nav-tab-new-btn'),
    navTabsRefreshBtn: document.getElementById('nav-tabs-refresh-btn'),
    navTabEditId: document.getElementById('nav-tab-edit-id'),
    navTabGroup: document.getElementById('nav-tab-group'),
    navTabOrder: document.getElementById('nav-tab-order'),
    navTabLabel: document.getElementById('nav-tab-label'),
    navTabHref: document.getElementById('nav-tab-href'),
    navTabVisible: document.getElementById('nav-tab-visible'),
    navTabSaveBtn: document.getElementById('nav-tab-save-btn'),
    navTabDeleteBtn: document.getElementById('nav-tab-delete-btn'),
    tenantPanelLibraries: document.getElementById('tenant-panel-libraries'),
    tenantPanelArticles: document.getElementById('tenant-panel-articles'),
    tenantPanelAnnualList: document.getElementById('tenant-panel-annual-list'),
    tenantPanelArticleEditor: document.getElementById('tenant-panel-article-editor'),
    tenantPanelAnnualEditor: document.getElementById('tenant-panel-annual-editor'),
    tenantPanelNavTabsList: document.getElementById('tenant-panel-nav-tabs-list'),
    tenantPanelNavTabsEditor: document.getElementById('tenant-panel-nav-tabs-editor'),
    sectionTenants: document.getElementById('section-tenants'),
    sectionTenantSettings: document.getElementById('section-tenant-settings'),
    sectionHomepageSlot: document.getElementById('section-homepage-slot'),
    sectionTenantCms: document.getElementById('section-tenant-cms'),
  };
  const sidebarNavLinks = Array.from(document.querySelectorAll('.platform-nav a[href^="#"]'));
  const workspaceNavLinks = Array.from(document.querySelectorAll('.platform-nav a[data-workspace-view]'));

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
    applyUiMode();
    syncSidebarActiveLink();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setUiMode(mode) {
    state.uiMode = mode === 'tenant' ? 'tenant' : 'admin';
    localStorage.setItem('cms-platform-ui-mode', state.uiMode);
    applyUiMode();
  }

  function setTenantWorkspaceView(view) {
    const allowed = new Set(['tenant-settings', 'placements', 'articles', 'libraries', 'annual-reports', 'nav-tabs']);
    state.tenantWorkspaceView = allowed.has(view) ? view : 'articles';
    localStorage.setItem('cms-platform-tenant-workspace-view', state.tenantWorkspaceView);
    applyTenantWorkspaceView();
  }

  function applyTenantWorkspaceView() {
    const isTenantMode = state.uiMode === 'tenant';
    const view = state.tenantWorkspaceView || 'articles';
    if (!isTenantMode) {
      [els.sectionHomepageSlot, els.sectionTenantCms, els.sectionTenantSettings].forEach((el) => el && el.classList.remove('hidden'));
      [
        els.tenantPanelLibraries,
        els.tenantPanelArticles,
        els.tenantPanelAnnualList,
        els.tenantPanelArticleEditor,
        els.tenantPanelAnnualEditor,
      ].forEach((el) => el && el.classList.remove('hidden'));
      [els.tenantPanelNavTabsList, els.tenantPanelNavTabsEditor].forEach((el) => el && el.classList.add('hidden'));
      if (els.tenantWorkspaceModePill) els.tenantWorkspaceModePill.textContent = 'Workspace module: Full dashboard';
      workspaceNavLinks.forEach((link) => {
        const active = (link.dataset.workspaceView || '') === 'tenant-settings';
        link.classList.toggle('is-active', false);
      });
      return;
    }

    if (els.sectionTenantSettings) els.sectionTenantSettings.classList.toggle('hidden', view !== 'tenant-settings');
    if (els.sectionHomepageSlot) els.sectionHomepageSlot.classList.toggle('hidden', view !== 'placements');
    if (els.sectionTenantCms) els.sectionTenantCms.classList.toggle('hidden', !['articles', 'libraries', 'annual-reports', 'nav-tabs'].includes(view));

    if (els.tenantWorkspaceModePill) {
      const labels = {
        articles: 'Workspace module: Articles',
        libraries: 'Workspace module: Libraries',
        'annual-reports': 'Workspace module: Annual Reports',
        'nav-tabs': 'Workspace module: Navigation Tabs',
      };
      els.tenantWorkspaceModePill.textContent = labels[view] || 'Workspace module';
    }

    const showLibraries = view === 'libraries';
    const showArticles = view === 'articles';
    const showAnnual = view === 'annual-reports';
    const showNavTabs = view === 'nav-tabs';

    if (els.tenantPanelLibraries) els.tenantPanelLibraries.classList.toggle('hidden', !showLibraries);
    if (els.tenantPanelArticles) els.tenantPanelArticles.classList.toggle('hidden', !showArticles);
    if (els.tenantPanelArticleEditor) els.tenantPanelArticleEditor.classList.toggle('hidden', !showArticles);
    if (els.tenantPanelAnnualList) els.tenantPanelAnnualList.classList.toggle('hidden', !showAnnual);
    if (els.tenantPanelAnnualEditor) els.tenantPanelAnnualEditor.classList.toggle('hidden', !showAnnual);
    if (els.tenantPanelNavTabsList) els.tenantPanelNavTabsList.classList.toggle('hidden', !showNavTabs);
    if (els.tenantPanelNavTabsEditor) els.tenantPanelNavTabsEditor.classList.toggle('hidden', !showNavTabs);

    workspaceNavLinks.forEach((link) => {
      const active = (link.dataset.workspaceView || '') === view;
      link.classList.toggle('is-active', active);
    });
  }

  function applyUiMode() {
    const isTenantMode = state.uiMode === 'tenant';
    if (els.loginModeAdminBtn && els.loginModeTenantBtn) {
      els.loginModeAdminBtn.classList.toggle('is-active', !isTenantMode);
      els.loginModeTenantBtn.classList.toggle('is-active', isTenantMode);
    }
    if (els.appModeAdminBtn && els.appModeTenantBtn) {
      els.appModeAdminBtn.classList.toggle('is-active', !isTenantMode);
      els.appModeTenantBtn.classList.toggle('is-active', isTenantMode);
    }
    if (els.loginEmailLabel) {
      els.loginEmailLabel.textContent = isTenantMode ? 'Tenant operator email (platform bootstrap for now)' : 'Platform admin email';
    }
    if (els.loginModeHelp) {
      els.loginModeHelp.innerHTML = isTenantMode
        ? 'Tenant CMS View currently uses the same bootstrap login during Phase 2. A dedicated tenant login will be added next.'
        : 'Set <code>PLATFORM_BOOTSTRAP_SECRET</code> in Render to enable this login.';
    }
    if (els.sidebarPlatformGroup) {
      els.sidebarPlatformGroup.classList.toggle('hidden', isTenantMode);
    }
    if (els.sidebarTenantGroup) {
      els.sidebarTenantGroup.classList.remove('hidden');
    }
    if (els.tenantExitAdminLink) {
      els.tenantExitAdminLink.classList.toggle('hidden', !isTenantMode);
    }
    if (els.sectionTenants) {
      els.sectionTenants.classList.toggle('hidden', isTenantMode);
    }
    if (els.sectionTenantSettings) {
      els.sectionTenantSettings.classList.toggle('hidden', isTenantMode);
    }
    if (els.tenantSwitchWrap) {
      els.tenantSwitchWrap.classList.toggle('hidden', !isTenantMode);
    }
    if (els.topbarTitle) {
      els.topbarTitle.textContent = isTenantMode ? 'Tenant CMS Workspace' : 'Content Management System';
    }
    if (els.topbarSubtitle) {
      els.topbarSubtitle.textContent = isTenantMode
        ? 'Manage homepage placements, articles, libraries, and annual reports for a selected tenant.'
        : 'Manage customer tenants, branding, and access foundations.';
    }
    if (els.sidebarLogoTitle) {
      els.sidebarLogoTitle.textContent = isTenantMode ? 'Tenant CMS' : 'CMS Platform';
    }
    if (els.sidebarLogoSubtitle) {
      els.sidebarLogoSubtitle.textContent = isTenantMode ? 'Kardal-style workspace view' : 'Multi-tenant SaaS admin';
    }
    applyTenantWorkspaceView();
    syncSidebarActiveLink();
  }

  function syncSidebarActiveLink() {
    if (!sidebarNavLinks.length) return;
    if (state.uiMode === 'tenant') {
      sidebarNavLinks.forEach((link) => {
        const workspaceView = link.dataset.workspaceView || '';
        if (workspaceView) {
          link.classList.toggle('is-active', workspaceView === state.tenantWorkspaceView);
          return;
        }
        if ((link.getAttribute('href') || '') === '#section-tenants') {
          link.classList.remove('is-active');
        }
      });
      return;
    }
    const sections = sidebarNavLinks
      .map((link) => {
        if (link.classList.contains('hidden') || link.offsetParent === null) return null;
        const href = link.getAttribute('href') || '';
        const target = href.startsWith('#') ? document.querySelector(href) : null;
        if (!target || target.classList.contains('hidden')) return null;
        return target ? { link, target } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    const markerY = window.scrollY + 120;
    let active = sections[0];
    sections.forEach((entry) => {
      if (entry.target.offsetTop <= markerY) active = entry;
    });

    sections.forEach((entry) => {
      entry.link.classList.toggle('is-active', entry === active);
    });
  }

  function scrollToSectionHash(hash, behavior = 'smooth') {
    if (!hash || !hash.startsWith('#')) return;
    const target = document.querySelector(hash);
    if (!target || target.classList.contains('hidden')) return;
    const topOffset = 88;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - topOffset);
    window.scrollTo({ top, behavior });
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
    requestAnimationFrame(syncSidebarActiveLink);
  }

  function getSelectedTenant() {
    return state.tenants.find((t) => t.id === state.selectedTenantId) || null;
  }

  function resetPlacementState() {
    state.placement = { slot: null, items: [], assignments: [] };
  }

  function resetCmsState() {
    state.cms = {
      articles: [],
      media: [],
      editingArticle: null,
      annualReports: [],
      editingAnnualReport: null,
      navTabs: [],
      editingNavTabId: null,
    };
  }

  function tenantApi(path, options) {
    const tenant = getSelectedTenant();
    if (!tenant) {
      return Promise.reject(new Error('Select a tenant first.'));
    }
    return api(path, {
      ...options,
      headers: {
        ...(options?.headers || {}),
        'x-tenant-id': String(tenant.id),
      },
    });
  }

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (!value) return '—';
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDateTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  }

  function articlePublicHref(article) {
    const tenant = getSelectedTenant();
    if (!tenant || !article?.slug) return '#';
    const base = tenant.branding?.publicSiteUrl || '';
    if (!base) return '#';
    return `${String(base).replace(/\/$/, '')}/insights/${article.slug}`;
  }

  function populateAttachmentOptions(selectedIds) {
    const media = Array.isArray(state.cms.media) ? state.cms.media : [];
    const selected = new Set((selectedIds || []).map((id) => Number(id)));
    els.articleAttachments.innerHTML = media.length
      ? media
          .map((item) => {
            const kind = item.kind === 'document' || item.mimeType === 'application/pdf' ? 'PDF' : (item.kind || 'file');
            const fileName = item.label || (item.fileUrl || '').split('/').pop() || `File #${item.id}`;
            return `<option value="${item.id}" ${selected.has(Number(item.id)) ? 'selected' : ''}>[${escapeHtml(kind)}] ${escapeHtml(fileName)}</option>`;
          })
          .join('')
      : '<option value="">No media uploaded yet</option>';
    els.articleAttachments.disabled = !media.length;
  }

  function clearArticleEditor() {
    state.cms.editingArticle = null;
    els.articleEditId.value = '';
    els.articleStatus.value = 'draft';
    els.articleCategory.value = 'newsroom';
    els.articleTitle.value = '';
    els.articleSummary.value = '';
    els.articleBody.value = '';
    els.articlePublishAt.value = '';
    els.articleSource.value = '';
    els.articleImageUrl.value = '';
    els.articleImageCaption.value = '';
    els.articleSeoTitle.value = '';
    els.articleSeoDescription.value = '';
    els.articleSeoImage.value = '';
    els.articleSeoCanonical.value = '';
    els.articleSeoNoIndex.checked = false;
    els.articleEditorMeta.textContent = 'Create or edit a tenant article. This mirrors Kardal CMS fields (SEO + inline image caption).';
    els.articleOpenLink.href = '#';
    els.articleOpenLink.style.pointerEvents = 'none';
    els.articleOpenLink.style.opacity = '0.6';
    els.articleDeleteBtn.disabled = true;
    populateAttachmentOptions([]);
  }

  function clearNavTabEditor() {
    state.cms.editingNavTabId = null;
    if (els.navTabEditId) els.navTabEditId.value = '';
    if (els.navTabGroup) els.navTabGroup.value = 'general';
    if (els.navTabOrder) els.navTabOrder.value = '0';
    if (els.navTabLabel) els.navTabLabel.value = '';
    if (els.navTabHref) els.navTabHref.value = '';
    if (els.navTabVisible) els.navTabVisible.checked = true;
    if (els.navTabDeleteBtn) els.navTabDeleteBtn.disabled = true;
    if (els.navTabEditorMeta) {
      els.navTabEditorMeta.textContent = 'Create or edit navigation tabs for this tenant’s website header/sidebar menus.';
    }
  }

  function loadNavTabIntoEditor(tab) {
    if (!tab) return;
    state.cms.editingNavTabId = String(tab.id);
    els.navTabEditId.value = String(tab.id || '');
    els.navTabGroup.value = tab.group || 'general';
    els.navTabOrder.value = String(Number.isFinite(Number(tab.order)) ? Number(tab.order) : 0);
    els.navTabLabel.value = tab.label || '';
    els.navTabHref.value = tab.href || '';
    els.navTabVisible.checked = tab.visible !== false;
    els.navTabDeleteBtn.disabled = false;
    els.navTabEditorMeta.textContent = `Editing nav tab: ${tab.label || 'Untitled'} (${tab.group || 'general'})`;
  }

  function renderNavTabsPanel() {
    const tabs = Array.isArray(state.cms.navTabs) ? state.cms.navTabs : [];
    if (!els.navTabsTableBody) return;
    els.navTabsTableBody.innerHTML = tabs.length
      ? tabs
          .map((tab) => `
            <tr>
              <td>${escapeHtml(tab.group || 'general')}</td>
              <td><strong>${escapeHtml(tab.label || 'Untitled')}</strong></td>
              <td class="meta">${escapeHtml(tab.href || '')}</td>
              <td>${escapeHtml(String(tab.order ?? 0))}</td>
              <td>${tab.visible === false ? '<span class="pill">Hidden</span>' : '<span class="pill">Visible</span>'}</td>
              <td>
                <div class="mini-actions">
                  <button class="edit-nav-tab-btn" data-nav-tab-id="${escapeHtml(String(tab.id))}">Edit</button>
                </div>
              </td>
            </tr>
          `)
          .join('')
      : '<tr><td colspan="6" class="meta">No navigation tabs yet for this tenant.</td></tr>';

    els.navTabsTableBody.querySelectorAll('.edit-nav-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        const id = String(btn.getAttribute('data-nav-tab-id') || '');
        const tab = tabs.find((item) => String(item.id) === id);
        if (tab) loadNavTabIntoEditor(tab);
      });
    });
  }

  function populateAnnualPdfOptions(selectedMediaId) {
    const pdfs = (Array.isArray(state.cms.media) ? state.cms.media : []).filter(
      (item) => item.kind === 'document' || item.mimeType === 'application/pdf',
    );
    const selectedId = selectedMediaId ? Number(selectedMediaId) : null;
    els.annualMediaSelect.innerHTML =
      '<option value="">Select a PDF…</option>' +
      pdfs
        .map((item) => `<option value="${item.id}" ${selectedId === Number(item.id) ? 'selected' : ''}>${escapeHtml(item.label || (item.fileUrl || '').split('/').pop() || `PDF #${item.id}`)}</option>`)
        .join('');
  }

  function clearAnnualReportEditor() {
    state.cms.editingAnnualReport = null;
    els.annualEditId.value = '';
    els.annualYear.value = '';
    els.annualStatus.value = 'published';
    els.annualTitle.value = '';
    els.annualSummary.value = '';
    els.annualSortOrder.value = '0';
    els.annualFileUrl.value = '';
    populateAnnualPdfOptions(null);
    els.annualEditorMeta.textContent = 'Create annual report entries and attach PDF files from the tenant media library.';
    els.annualDeleteBtn.disabled = true;
    els.annualOpenLink.href = '#';
    els.annualOpenLink.style.pointerEvents = 'none';
    els.annualOpenLink.style.opacity = '0.6';
  }

  function loadAnnualReportIntoEditor(item) {
    state.cms.editingAnnualReport = item;
    els.annualEditId.value = String(item.id || '');
    els.annualYear.value = item.year ? String(item.year) : '';
    els.annualStatus.value = item.status || 'published';
    els.annualTitle.value = item.title || '';
    els.annualSummary.value = item.summary || '';
    els.annualSortOrder.value = String(item.sortOrder || 0);
    els.annualFileUrl.value = item.fileUrl || '';
    populateAnnualPdfOptions(item.mediaId || null);
    els.annualEditorMeta.textContent = `Editing annual report • Updated: ${formatDateTime(item.updatedAt)}`;
    els.annualDeleteBtn.disabled = !item.id;
    els.annualOpenLink.href = item.fileUrl || '#';
    els.annualOpenLink.style.pointerEvents = item.fileUrl ? 'auto' : 'none';
    els.annualOpenLink.style.opacity = item.fileUrl ? '1' : '0.6';
  }

  function loadArticleIntoEditor(article) {
    state.cms.editingArticle = article;
    els.articleEditId.value = String(article.id || '');
    els.articleStatus.value = article.status || 'draft';
    els.articleCategory.value = article.category || 'newsroom';
    els.articleTitle.value = article.title || '';
    els.articleSummary.value = article.summary || '';
    els.articleBody.value = article.body || '';
    els.articlePublishAt.value = article.publishAt ? String(article.publishAt).slice(0, 16) : '';
    els.articleSource.value = article.source || '';
    els.articleImageUrl.value = article.coverImage || '';
    els.articleImageCaption.value = article.imageCaption || '';
    els.articleSeoTitle.value = article.seoTitle || '';
    els.articleSeoDescription.value = article.seoDescription || '';
    els.articleSeoImage.value = article.seoImage || '';
    els.articleSeoCanonical.value = article.seoCanonicalUrl || '';
    els.articleSeoNoIndex.checked = Boolean(article.seoNoIndex);
    els.articleEditorMeta.textContent =
      `Editing ${article.title || 'Untitled'} • Published: ${formatDateTime(article.firstPublishAt)} • Updated: ${formatDateTime(article.updatedAt)}`;
    populateAttachmentOptions(Array.isArray(article.attachments) ? article.attachments.map((a) => a.id) : []);
    const href = article.status === 'published' ? articlePublicHref(article) : '#';
    els.articleOpenLink.href = href;
    els.articleOpenLink.style.pointerEvents = href === '#' ? 'none' : 'auto';
    els.articleOpenLink.style.opacity = href === '#' ? '0.6' : '1';
    els.articleDeleteBtn.disabled = !article.id;
  }

  function renderCmsPanel() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      els.cmsContentEmpty.classList.remove('hidden');
      els.cmsContentPanel.classList.add('hidden');
      els.mediaTableBody.innerHTML = '<tr><td colspan="4" class="meta">Select a tenant to load media.</td></tr>';
      els.articleTableBody.innerHTML = '<tr><td colspan="5" class="meta">Select a tenant to load articles.</td></tr>';
      if (els.navTabsTableBody) {
        els.navTabsTableBody.innerHTML = '<tr><td colspan="6" class="meta">Select a tenant to load navigation tabs.</td></tr>';
      }
      clearArticleEditor();
      clearNavTabEditor();
      return;
    }
    els.cmsContentEmpty.classList.add('hidden');
    els.cmsContentPanel.classList.remove('hidden');

    const mediaFilter = els.mediaFilter.value || 'all';
    const allMedia = Array.isArray(state.cms.media) ? state.cms.media : [];
    const media = allMedia.filter((item) => {
      if (mediaFilter === 'all') return true;
      if (mediaFilter === 'image') return item.kind === 'image' || item.mimeType?.startsWith('image/');
      if (mediaFilter === 'document') return item.kind === 'document' || item.mimeType === 'application/pdf';
      return true;
    });

    if (els.libraryPanelTitle) {
      els.libraryPanelTitle.textContent =
        mediaFilter === 'image'
          ? 'Media Library (Images)'
          : mediaFilter === 'document'
            ? 'Document Library (PDFs)'
            : 'Libraries (All Files)';
    }
    if (els.mediaUploadInput) {
      els.mediaUploadInput.accept =
        mediaFilter === 'image'
          ? 'image/*'
          : mediaFilter === 'document'
            ? 'application/pdf'
            : 'image/*,application/pdf';
    }
    if (els.mediaUploadBtn) {
      els.mediaUploadBtn.textContent =
        mediaFilter === 'image'
          ? 'Upload image'
          : mediaFilter === 'document'
            ? 'Upload PDF'
            : 'Upload image/PDF';
    }
    [
      [els.libraryMediaBtn, mediaFilter === 'image'],
      [els.libraryDocsBtn, mediaFilter === 'document'],
      [els.libraryAllBtn, mediaFilter === 'all'],
    ].forEach(([btn, active]) => {
      if (!btn) return;
      btn.classList.toggle('ghost-brand', Boolean(active));
    });

    els.mediaTableBody.innerHTML = media.length
      ? media
          .map((item) => `
            <tr>
              <td>
                <div><strong>${escapeHtml(item.label || (item.fileUrl || '').split('/').pop() || `File #${item.id}`)}</strong></div>
                <div class="meta">${escapeHtml(item.fileUrl || '')}</div>
              </td>
              <td>${escapeHtml(item.kind === 'document' || item.mimeType === 'application/pdf' ? 'PDF' : (item.kind || 'File'))}</td>
              <td>${escapeHtml(formatBytes(item.size))}</td>
              <td>
                <div class="mini-actions">
                  <a href="${escapeHtml(item.fileUrl || '#')}" target="_blank" rel="noopener noreferrer" class="pill" style="text-decoration:none;">Open</a>
                  <button class="delete-media-btn" data-media-id="${item.id}">Delete</button>
                </div>
              </td>
            </tr>
          `)
          .join('')
      : '<tr><td colspan="4" class="meta">No media uploaded yet for this tenant.</td></tr>';

    els.mediaTableBody.querySelectorAll('.delete-media-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        handleDeleteTenantMedia(btn.getAttribute('data-media-id'));
      });
    });

    const articles = Array.isArray(state.cms.articles) ? state.cms.articles : [];
    els.articleTableBody.innerHTML = articles.length
      ? articles
          .map((article) => `
            <tr>
              <td>
                <div><strong>${escapeHtml(article.title || 'Untitled')}</strong></div>
                <div class="meta">${escapeHtml(article.slug || '')}</div>
              </td>
              <td><span class="pill">${escapeHtml(article.status || 'draft')}</span></td>
              <td>${escapeHtml(article.category || 'newsroom')}</td>
              <td class="meta">${escapeHtml(formatDateTime(article.updatedAt))}</td>
              <td>
                <div class="mini-actions">
                  <button class="edit-article-btn" data-article-id="${article.id}">Edit</button>
                  ${article.status === 'published' && articlePublicHref(article) !== '#'
                    ? `<a href="${escapeHtml(articlePublicHref(article))}" target="_blank" rel="noopener noreferrer" class="pill" style="text-decoration:none;">Open</a>`
                    : ''}
                </div>
              </td>
            </tr>
          `)
          .join('')
      : '<tr><td colspan="5" class="meta">No articles yet for this tenant.</td></tr>';

    els.articleTableBody.querySelectorAll('.edit-article-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        setTenantWorkspaceView('articles');
        const id = Number(btn.getAttribute('data-article-id'));
        const article = articles.find((a) => a.id === id);
        if (article) loadArticleIntoEditor(article);
      });
    });

    const annualReports = Array.isArray(state.cms.annualReports) ? state.cms.annualReports : [];
    els.annualTableBody.innerHTML = annualReports.length
      ? annualReports
          .map((item) => `
            <tr>
              <td>${escapeHtml(String(item.year || '—'))}</td>
              <td>
                <div><strong>${escapeHtml(item.title || 'Untitled')}</strong></div>
                ${item.summary ? `<div class="meta">${escapeHtml(item.summary)}</div>` : ''}
              </td>
              <td><span class="pill">${escapeHtml(item.status || 'published')}</span></td>
              <td>
                <div class="mini-actions">
                  <button class="edit-annual-btn" data-annual-id="${item.id}">Edit</button>
                  ${item.fileUrl ? `<a href="${escapeHtml(item.fileUrl)}" target="_blank" rel="noopener noreferrer" class="pill" style="text-decoration:none;">PDF</a>` : ''}
                </div>
              </td>
            </tr>
          `)
          .join('')
      : '<tr><td colspan="4" class="meta">No annual reports yet.</td></tr>';
    els.annualTableBody.querySelectorAll('.edit-annual-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        setTenantWorkspaceView('annual-reports');
        const id = Number(btn.getAttribute('data-annual-id'));
        const item = annualReports.find((a) => a.id === id);
        if (item) loadAnnualReportIntoEditor(item);
      });
    });

    if (!state.cms.editingArticle) {
      populateAttachmentOptions([]);
      els.articleDeleteBtn.disabled = true;
      els.articleOpenLink.href = '#';
      els.articleOpenLink.style.pointerEvents = 'none';
      els.articleOpenLink.style.opacity = '0.6';
    } else {
      populateAttachmentOptions(Array.isArray(state.cms.editingArticle.attachments) ? state.cms.editingArticle.attachments.map((a) => a.id) : []);
    }
    if (!state.cms.editingAnnualReport) {
      clearAnnualReportEditor();
    } else {
      populateAnnualPdfOptions(state.cms.editingAnnualReport.mediaId || null);
    }
    renderNavTabsPanel();
    if (!state.cms.editingNavTabId) {
      clearNavTabEditor();
    }
    applyTenantWorkspaceView();
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

  function resetDomainProvisioningState() {
    state.domainProvisioning.current = null;
    renderDomainProvisioningPanel();
  }

  function formatDomainInstructionsText(payload) {
    if (!payload) return '';
    const lines = [];
    lines.push(`Hostname: ${payload.hostname || '-'}`);
    lines.push(`DNS mode: ${payload.mode || '-'}`);
    lines.push(`DNS provider: ${payload.provider || '-'}`);
    if (payload.targetHint) lines.push(`Render target host (hint): ${payload.targetHint}`);
    if (payload.summary) {
      lines.push('');
      lines.push(payload.summary);
    }
    if (Array.isArray(payload.records) && payload.records.length) {
      lines.push('');
      lines.push('DNS Records');
      payload.records.forEach((record, index) => {
        lines.push(
          `${index + 1}. ${record.type || 'RECORD'} | Name: ${record.name || '-'} | Value: ${record.value || '-'}${record.ttl ? ` | TTL: ${record.ttl}` : ''}`,
        );
        if (record.notes) lines.push(`   Notes: ${record.notes}`);
      });
    }
    if (Array.isArray(payload.providerHints) && payload.providerHints.length) {
      lines.push('');
      lines.push('Provider Hints');
      payload.providerHints.forEach((hint, index) => lines.push(`${index + 1}. ${hint}`));
    }
    return lines.join('\n');
  }

  function buildDomainProvisionChecks(tenant, payload) {
    const renderConfigured = Boolean(payload?.render?.configured);
    const renderTarget = payload?.render?.serviceHostname || '';
    const hostname = (payload?.domain?.hostname || tenant?.branding?.cmsDomain || '').trim();
    const status = String(payload?.domain?.status || '').toLowerCase();
    const renderRegistered = Boolean(payload?.domain?.renderCustomDomainId || payload?.domain?.renderCustomDomainName);
    const dnsRecords = Array.isArray(payload?.instructions?.records) ? payload.instructions.records : [];
    const hasInstructions = Boolean(payload?.instructions?.hostname && (dnsRecords.length || payload?.instructions?.targetHint));
    const brandingSynced = !hostname || (tenant?.branding?.cmsDomain || '').trim() === hostname;

    const checks = [
      {
        key: 'render-config',
        label: 'Render API integration configured',
        status: renderConfigured ? 'pass' : 'fail',
        detail: renderConfigured
          ? `Service ${payload?.render?.serviceId || ''}${renderTarget ? ` • target ${renderTarget}` : ''}`
          : 'Set RENDER_API_TOKEN and RENDER_SERVICE_ID in Render env vars.',
      },
      {
        key: 'hostname',
        label: 'Tenant CMS hostname saved',
        status: hostname ? 'pass' : 'pending',
        detail: hostname || 'Enter a hostname like cms.client.com and save/provision.',
      },
      {
        key: 'render-domain',
        label: 'Custom domain registered in Render',
        status: renderRegistered ? 'pass' : (hostname ? 'pending' : 'pending'),
        detail: renderRegistered
          ? `${payload?.domain?.renderCustomDomainName || hostname}${payload?.domain?.renderStatus ? ` • ${payload.domain.renderStatus}` : ''}`
          : 'Click “Provision in Render” to create (or sync) the custom domain on your Render service.',
      },
      {
        key: 'dns-instructions',
        label: 'DNS instructions ready (Exabytes/manual)',
        status: hasInstructions ? 'pass' : (renderRegistered || hostname ? 'pending' : 'pending'),
        detail: hasInstructions
          ? `${dnsRecords.length} DNS record(s) prepared`
          : 'Provision first so the portal can show DNS record instructions.',
      },
      {
        key: 'dns-verify',
        label: 'Render verification passed',
        status: status === 'verified' ? 'pass' : (status === 'failed' ? 'fail' : 'pending'),
        detail: status === 'verified'
          ? `Verified${payload?.domain?.verifiedAt ? ` at ${new Date(payload.domain.verifiedAt).toLocaleString()}` : ''}`
          : status === 'failed'
            ? (payload?.domain?.lastError || 'Verification failed. Fix DNS and recheck.')
            : 'After updating DNS in Exabytes, click “Verify / Recheck”.',
      },
      {
        key: 'branding-sync',
        label: 'Tenant branding CMS domain synced',
        status: brandingSynced ? 'pass' : 'warn',
        detail: brandingSynced
          ? (tenant?.branding?.cmsDomain || 'Will sync on provision')
          : `Tenant branding has ${tenant?.branding?.cmsDomain || '-'} but provisioning row has ${hostname}`,
      },
    ];

    return checks;
  }

  function renderDomainProvisioningChecklist(tenant, payload) {
    if (!els.tenantDomainChecklist || !els.tenantDomainCheckSummary || !els.tenantDomainLastError) return;

    if (!tenant) {
      els.tenantDomainChecklist.innerHTML = '';
      els.tenantDomainCheckSummary.textContent = 'Waiting for tenant selection';
      els.tenantDomainLastError.textContent = '';
      return;
    }

    const checks = buildDomainProvisionChecks(tenant, payload);
    const done = checks.filter((item) => item.status === 'pass').length;
    const blocking = checks.some((item) => item.status === 'fail');
    const total = checks.length;
    const overallStatus = payload?.domain?.status || (tenant.branding?.cmsDomain ? 'draft' : 'not configured');
    els.tenantDomainCheckSummary.textContent = `${done}/${total} checks passed • Status: ${overallStatus}`;

    const iconFor = (status) => {
      if (status === 'pass') return '✓';
      if (status === 'fail') return '✕';
      if (status === 'warn') return '!';
      return '…';
    };
    const colorFor = (status) => {
      if (status === 'pass') return '#166534';
      if (status === 'fail') return '#b91c1c';
      if (status === 'warn') return '#92400e';
      return '#64748b';
    };
    const bgFor = (status) => {
      if (status === 'pass') return '#f0fdf4';
      if (status === 'fail') return '#fef2f2';
      if (status === 'warn') return '#fffbeb';
      return '#f8fafc';
    };
    const borderFor = (status) => {
      if (status === 'pass') return '#bbf7d0';
      if (status === 'fail') return '#fecaca';
      if (status === 'warn') return '#fde68a';
      return '#e2e8f0';
    };

    els.tenantDomainChecklist.innerHTML = checks.map((item) => `
      <div style="display:grid; grid-template-columns:22px 1fr; gap:8px; align-items:start; padding:8px 9px; border:1px solid ${borderFor(item.status)}; border-radius:10px; background:${bgFor(item.status)};">
        <span style="display:inline-flex; width:18px; height:18px; border-radius:999px; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:${colorFor(item.status)}; border:1px solid ${borderFor(item.status)}; background:#fff;">${iconFor(item.status)}</span>
        <div>
          <div style="font-size:12px; color:#0f172a; font-weight:600;">${escapeHtml(item.label)}</div>
          <div style="margin-top:2px; font-size:11px; color:${colorFor(item.status)};">${escapeHtml(item.detail || '')}</div>
        </div>
      </div>
    `).join('');

    const lastError = payload?.domain?.lastError || '';
    els.tenantDomainLastError.textContent = lastError
      ? `Last error: ${lastError}`
      : (blocking ? 'Resolve the blocking checks above, then click Verify / Recheck.' : '');
  }

  function renderDomainProvisioningPanel() {
    const tenant = getSelectedTenant();
    const payload = state.domainProvisioning.current;
    const tenantHostname = tenant?.branding?.cmsDomain || '';

    if (!tenant) {
      if (els.tenantDomainHostname) els.tenantDomainHostname.value = '';
      if (els.tenantDomainInstructions) els.tenantDomainInstructions.value = '';
      if (els.tenantDomainStatusPill) els.tenantDomainStatusPill.textContent = 'Not provisioned';
      if (els.tenantDomainLastChecked) els.tenantDomainLastChecked.textContent = '';
      if (els.tenantDomainProvisionBtn) els.tenantDomainProvisionBtn.disabled = true;
      if (els.tenantDomainVerifyBtn) els.tenantDomainVerifyBtn.disabled = true;
      if (els.tenantDomainRefreshBtn) els.tenantDomainRefreshBtn.disabled = true;
      if (els.tenantDomainCopyInstructionsBtn) els.tenantDomainCopyInstructionsBtn.disabled = true;
      setNotice(els.tenantDomainProvisionNotice, '', '');
      renderDomainProvisioningChecklist(null, null);
      return;
    }

    const renderConfigured = Boolean(payload?.render?.configured);
    if (els.tenantDomainProvisionBtn) els.tenantDomainProvisionBtn.disabled = !renderConfigured;
    if (els.tenantDomainRefreshBtn) els.tenantDomainRefreshBtn.disabled = false;
    if (els.tenantDomainVerifyBtn) {
      els.tenantDomainVerifyBtn.disabled = !renderConfigured || (!payload?.domain?.hostname && !tenantHostname);
    }
    if (els.tenantDomainCopyInstructionsBtn) {
      els.tenantDomainCopyInstructionsBtn.disabled = !(payload?.instructions && formatDomainInstructionsText(payload.instructions));
    }

    if (els.tenantDomainHostname) {
      const domainValue = payload?.domain?.hostname || tenantHostname || '';
      if (!els.tenantDomainHostname.value || els.tenantDomainHostname.value === tenantHostname || payload) {
        els.tenantDomainHostname.value = domainValue;
      }
    }
    if (els.tenantDomainDnsMode && payload?.domain?.dnsMode) {
      els.tenantDomainDnsMode.value = payload.domain.dnsMode;
    }
    if (els.tenantDomainDnsProvider && payload?.domain?.dnsProvider) {
      els.tenantDomainDnsProvider.value = payload.domain.dnsProvider;
    }

    const status = payload?.domain?.status || (tenantHostname ? 'draft' : 'not configured');
    if (els.tenantDomainStatusPill) {
      els.tenantDomainStatusPill.textContent = `Status: ${status}`;
      els.tenantDomainStatusPill.className = 'pill';
      if (status === 'verified') els.tenantDomainStatusPill.classList.add('ok');
    }
    if (els.tenantDomainLastChecked) {
      const checkedAt = payload?.domain?.lastCheckedAt;
      els.tenantDomainLastChecked.textContent = checkedAt ? `Last checked: ${new Date(checkedAt).toLocaleString()}` : '';
    }
    if (els.tenantDomainInstructions) {
      els.tenantDomainInstructions.value = formatDomainInstructionsText(payload?.instructions || null);
    }
    renderDomainProvisioningChecklist(tenant, payload);
  }

  async function loadTenantDomainProvisioning() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      resetDomainProvisioningState();
      return;
    }
    try {
      const data = await api(`/api/platform/tenants/${tenant.id}/domain`, { method: 'GET' });
      state.domainProvisioning.current = data || null;
      renderDomainProvisioningPanel();
    } catch (err) {
      state.domainProvisioning.current = null;
      renderDomainProvisioningPanel();
      setNotice(els.tenantDomainProvisionNotice, err.message || 'Failed to load domain provisioning status', 'error');
    }
  }

  async function handleProvisionTenantDomain() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.tenantDomainProvisionNotice, 'Select a tenant first.', 'error');
      return;
    }
    const hostname = (els.tenantDomainHostname?.value || '').trim();
    if (!hostname) {
      setNotice(els.tenantDomainProvisionNotice, 'Enter a tenant CMS hostname (for example: cms.client.com).', 'error');
      return;
    }
    els.tenantDomainProvisionBtn.disabled = true;
    try {
      const data = await api(`/api/platform/tenants/${tenant.id}/domain/provision`, {
        method: 'POST',
        body: JSON.stringify({
          hostname,
          dnsMode: els.tenantDomainDnsMode?.value || 'customer_managed',
          dnsProvider: els.tenantDomainDnsProvider?.value || 'exabytes',
        }),
      });
      state.domainProvisioning.current = data || null;
      if (els.editCmsDomain) els.editCmsDomain.value = data?.tenant?.branding?.cmsDomain || hostname;
      await loadTenants();
      state.selectedTenantId = tenant.id;
      renderTenants();
      renderDomainProvisioningPanel();
      const status = data?.domain?.status || 'updated';
      setNotice(els.tenantDomainProvisionNotice, `Domain provisioning updated. Status: ${status}`, status === 'failed' ? 'error' : 'ok');
    } catch (err) {
      const message = err.message || 'Failed to provision tenant domain';
      const suffix = /Render domain provisioning is not configured/i.test(message)
        ? ' Configure one-time env vars on Render: RENDER_API_TOKEN, RENDER_SERVICE_ID, and optionally RENDER_SERVICE_CANONICAL_HOSTNAME.'
        : '';
      setNotice(els.tenantDomainProvisionNotice, `${message}${suffix}`, 'error');
    } finally {
      els.tenantDomainProvisionBtn.disabled = false;
    }
  }

  async function handleVerifyTenantDomain() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.tenantDomainProvisionNotice, 'Select a tenant first.', 'error');
      return;
    }
    els.tenantDomainVerifyBtn.disabled = true;
    try {
      const data = await api(`/api/platform/tenants/${tenant.id}/domain/verify`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      state.domainProvisioning.current = data || null;
      renderDomainProvisioningPanel();
      const status = data?.domain?.status || 'updated';
      setNotice(
        els.tenantDomainProvisionNotice,
        status === 'verified'
          ? `Domain verified: ${data?.domain?.hostname || ''}`
          : `Verification checked. Current status: ${status}`,
        status === 'verified' ? 'ok' : '',
      );
    } catch (err) {
      setNotice(els.tenantDomainProvisionNotice, err.message || 'Failed to verify tenant domain', 'error');
    } finally {
      els.tenantDomainVerifyBtn.disabled = false;
    }
  }

  function renderSelectedTenant() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      els.selectedTenantEmpty.classList.remove('hidden');
      els.selectedTenantForm.classList.add('hidden');
      els.selectedTenantMeta.textContent = '';
      setNotice(els.tenantDomainProvisionNotice, '', '');
      renderPlacementPanel();
      resetDomainProvisioningState();
      renderCmsPanel();
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
    renderDomainProvisioningPanel();
    renderPlacementPanel();
    renderCmsPanel();
  }

  function renderTenants() {
    const rows = state.tenants;
    if (!rows.length) {
      els.tenantTableBody.innerHTML = '<tr><td colspan="4" class="meta">No tenants yet.</td></tr>';
      renderTenantSwitcher();
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
        await loadTenantDomainProvisioning();
        await loadTenantCmsContent();
      });
    });

    if (!getSelectedTenant() && rows[0]) {
      state.selectedTenantId = rows[0].id;
      renderTenants();
      return;
    }

    renderTenantSwitcher();
    renderSelectedTenant();
  }

  function renderTenantSwitcher() {
    if (!els.tenantSwitch) return;
    const rows = Array.isArray(state.tenants) ? state.tenants : [];
    els.tenantSwitch.innerHTML = rows.length
      ? rows
          .map((tenant) => `<option value="${tenant.id}">${escapeHtml(tenant.name)} (${escapeHtml(tenant.slug)})</option>`)
          .join('')
      : '<option value="">No tenants</option>';
    if (state.selectedTenantId && rows.some((t) => t.id === state.selectedTenantId)) {
      els.tenantSwitch.value = String(state.selectedTenantId);
    } else if (rows[0]) {
      els.tenantSwitch.value = String(rows[0].id);
    }
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

  async function loadTenantCmsContent() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      resetCmsState();
      renderCmsPanel();
      return;
    }
    try {
      const [articles, media, annualReports, tenantSettings] = await Promise.all([
        tenantApi('/api/tenant/articles', { method: 'GET' }),
        tenantApi('/api/tenant/media', { method: 'GET' }),
        tenantApi('/api/tenant/annual-reports', { method: 'GET' }),
        tenantApi('/api/tenant/settings', { method: 'GET' }),
      ]);
      state.cms.articles = Array.isArray(articles) ? articles : [];
      state.cms.media = Array.isArray(media) ? media : [];
      state.cms.annualReports = Array.isArray(annualReports) ? annualReports : [];
      state.cms.navTabs = Array.isArray(tenantSettings?.navigationTabs) ? tenantSettings.navigationTabs : [];

      if (state.cms.editingArticle?.id) {
        const latest = state.cms.articles.find((a) => a.id === state.cms.editingArticle.id);
        state.cms.editingArticle = latest || null;
      }
      if (state.cms.editingAnnualReport?.id) {
        const latestAnnual = state.cms.annualReports.find((a) => a.id === state.cms.editingAnnualReport.id);
        state.cms.editingAnnualReport = latestAnnual || null;
      }
      if (state.cms.editingNavTabId) {
        const latestTab = state.cms.navTabs.find((tab) => String(tab.id) === String(state.cms.editingNavTabId));
        state.cms.editingNavTabId = latestTab ? String(latestTab.id) : null;
      }
      renderCmsPanel();
      if (state.cms.editingArticle) {
        loadArticleIntoEditor(state.cms.editingArticle);
      }
      if (state.cms.editingAnnualReport) {
        loadAnnualReportIntoEditor(state.cms.editingAnnualReport);
      }
      if (state.cms.editingNavTabId) {
        const latestTab = state.cms.navTabs.find((tab) => String(tab.id) === String(state.cms.editingNavTabId));
        if (latestTab) loadNavTabIntoEditor(latestTab);
      }
    } catch (err) {
      resetCmsState();
      renderCmsPanel();
      setNotice(els.cmsNotice, err.message || 'Failed to load tenant CMS content', 'error');
    }
  }

  function collectSelectedAttachmentIds() {
    return Array.from(els.articleAttachments.selectedOptions || [])
      .map((option) => Number(option.value))
      .filter((value) => Number.isFinite(value) && value > 0);
  }

  function buildArticlePayloadFromForm() {
    const publishAtValue = String(els.articlePublishAt.value || '').trim();
    return {
      title: els.articleTitle.value.trim(),
      summary: els.articleSummary.value,
      body: els.articleBody.value,
      status: els.articleStatus.value,
      category: els.articleCategory.value,
      source: els.articleSource.value.trim() || 'manual',
      publishAt: publishAtValue ? new Date(publishAtValue).toISOString() : null,
      coverImage: els.articleImageUrl.value.trim(),
      imageCaption: els.articleImageCaption.value.trim(),
      attachments: collectSelectedAttachmentIds(),
      seoTitle: els.articleSeoTitle.value.trim() || null,
      seoDescription: els.articleSeoDescription.value.trim() || null,
      seoImage: els.articleSeoImage.value.trim() || null,
      seoCanonicalUrl: els.articleSeoCanonical.value.trim() || null,
      seoNoIndex: Boolean(els.articleSeoNoIndex.checked),
    };
  }

  async function handleSaveArticle() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.cmsNotice, 'Select a tenant first.', 'error');
      return;
    }
    const articleId = Number(els.articleEditId.value);
    const payload = buildArticlePayloadFromForm();
    if (!payload.title) {
      setNotice(els.cmsNotice, 'Article title is required.', 'error');
      return;
    }
    els.articleSaveBtn.disabled = true;
    try {
      const saved = await tenantApi(articleId ? `/api/tenant/articles/${articleId}` : '/api/tenant/articles', {
        method: articleId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      state.cms.editingArticle = saved;
      setNotice(els.cmsNotice, `Article ${articleId ? 'updated' : 'created'}: ${saved.title}`, 'ok');
      await loadTenantCmsContent();
      const latest = state.cms.articles.find((a) => a.id === saved.id) || saved;
      loadArticleIntoEditor(latest);
    } catch (err) {
      setNotice(els.cmsNotice, err.message || 'Failed to save article', 'error');
    } finally {
      els.articleSaveBtn.disabled = false;
    }
  }

  async function handleDeleteArticle() {
    const id = Number(els.articleEditId.value);
    if (!id) return;
    if (!window.confirm('Delete this article?')) return;
    els.articleDeleteBtn.disabled = true;
    try {
      await tenantApi(`/api/tenant/articles/${id}`, { method: 'DELETE' });
      setNotice(els.cmsNotice, 'Article deleted.', 'ok');
      clearArticleEditor();
      await loadTenantCmsContent();
    } catch (err) {
      setNotice(els.cmsNotice, err.message || 'Failed to delete article', 'error');
      els.articleDeleteBtn.disabled = false;
    }
  }

  async function handleUploadTenantMedia() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.cmsNotice, 'Select a tenant first.', 'error');
      return;
    }
    const file = els.mediaUploadInput.files?.[0];
    if (!file) {
      setNotice(els.cmsNotice, 'Choose an image or PDF file first.', 'error');
      return;
    }
    els.mediaUploadBtn.disabled = true;
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/tenant/media/upload', {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-tenant-id': String(tenant.id) },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      setNotice(els.cmsNotice, `Uploaded ${data.media?.label || file.name}`, 'ok');
      els.mediaUploadInput.value = '';
      await loadTenantCmsContent();
    } catch (err) {
      setNotice(els.cmsNotice, err.message || 'Failed to upload media', 'error');
    } finally {
      els.mediaUploadBtn.disabled = false;
    }
  }

  async function handleDeleteTenantMedia(mediaId) {
    const id = Number(mediaId);
    if (!id) return;
    if (!window.confirm('Delete this media file?')) return;
    try {
      await tenantApi(`/api/tenant/media/${id}`, { method: 'DELETE' });
      setNotice(els.cmsNotice, 'Media deleted.', 'ok');
      await loadTenantCmsContent();
      if (state.cms.editingArticle) {
        const attachments = Array.isArray(state.cms.editingArticle.attachments)
          ? state.cms.editingArticle.attachments.filter((a) => a.id !== id)
          : [];
        state.cms.editingArticle = { ...state.cms.editingArticle, attachments };
        populateAttachmentOptions(attachments.map((a) => a.id));
      }
    } catch (err) {
      setNotice(els.cmsNotice, err.message || 'Failed to delete media', 'error');
    }
  }

  function buildAnnualReportPayloadFromForm() {
    const mediaId = els.annualMediaSelect.value ? Number(els.annualMediaSelect.value) : null;
    return {
      year: Number(els.annualYear.value),
      title: els.annualTitle.value.trim(),
      summary: els.annualSummary.value.trim() || null,
      fileUrl: els.annualFileUrl.value.trim() || null,
      mediaId: Number.isFinite(mediaId) && mediaId > 0 ? mediaId : null,
      status: els.annualStatus.value,
      sortOrder: Number(els.annualSortOrder.value || 0),
    };
  }

  async function handleSaveAnnualReport() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.cmsNotice, 'Select a tenant first.', 'error');
      return;
    }
    const id = Number(els.annualEditId.value);
    const payload = buildAnnualReportPayloadFromForm();
    if (!Number.isInteger(payload.year) || payload.year < 1900) {
      setNotice(els.cmsNotice, 'Valid annual report year is required.', 'error');
      return;
    }
    if (!payload.title) {
      setNotice(els.cmsNotice, 'Annual report title is required.', 'error');
      return;
    }
    if (!payload.fileUrl && !payload.mediaId) {
      setNotice(els.cmsNotice, 'Choose a PDF from media or enter a PDF URL.', 'error');
      return;
    }
    els.annualSaveBtn.disabled = true;
    try {
      const saved = await tenantApi(id ? `/api/tenant/annual-reports/${id}` : '/api/tenant/annual-reports', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      state.cms.editingAnnualReport = saved;
      setNotice(els.cmsNotice, `Annual report ${id ? 'updated' : 'created'}: ${saved.title}`, 'ok');
      await loadTenantCmsContent();
      const latest = state.cms.annualReports.find((a) => a.id === saved.id) || saved;
      loadAnnualReportIntoEditor(latest);
    } catch (err) {
      setNotice(els.cmsNotice, err.message || 'Failed to save annual report', 'error');
    } finally {
      els.annualSaveBtn.disabled = false;
    }
  }

  async function handleDeleteAnnualReport() {
    const id = Number(els.annualEditId.value);
    if (!id) return;
    if (!window.confirm('Delete this annual report entry?')) return;
    els.annualDeleteBtn.disabled = true;
    try {
      await tenantApi(`/api/tenant/annual-reports/${id}`, { method: 'DELETE' });
      setNotice(els.cmsNotice, 'Annual report deleted.', 'ok');
      clearAnnualReportEditor();
      await loadTenantCmsContent();
    } catch (err) {
      setNotice(els.cmsNotice, err.message || 'Failed to delete annual report', 'error');
      els.annualDeleteBtn.disabled = false;
    }
  }

  async function saveTenantNavigationTabs(nextTabs, successMessage) {
    const normalized = (Array.isArray(nextTabs) ? nextTabs : [])
      .map((tab, index) => ({
        id: String(tab.id || `${Date.now()}-${index}`),
        label: String(tab.label || '').trim(),
        href: String(tab.href || '').trim(),
        group: String(tab.group || 'general').trim() || 'general',
        visible: tab.visible !== false,
        order: Number.isFinite(Number(tab.order)) ? Number(tab.order) : index,
      }))
      .filter((tab) => tab.label)
      .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    const res = await tenantApi('/api/tenant/settings', {
      method: 'PUT',
      body: JSON.stringify({ navigationTabs: normalized }),
    });
    state.cms.navTabs = Array.isArray(res.navigationTabs) ? res.navigationTabs : normalized;
    renderNavTabsPanel();
    if (successMessage) setNotice(els.cmsNotice, successMessage, 'ok');
    return state.cms.navTabs;
  }

  async function handleSaveNavTab() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.cmsNotice, 'Select a tenant first.', 'error');
      return;
    }
    const label = els.navTabLabel.value.trim();
    const href = els.navTabHref.value.trim();
    if (!label) {
      setNotice(els.cmsNotice, 'Navigation tab label is required.', 'error');
      return;
    }
    const id = String(els.navTabEditId.value || `nav-${Date.now()}`);
    const tabs = Array.isArray(state.cms.navTabs) ? [...state.cms.navTabs] : [];
    const payload = {
      id,
      group: els.navTabGroup.value.trim() || 'general',
      order: Number(els.navTabOrder.value || 0),
      label,
      href,
      visible: Boolean(els.navTabVisible.checked),
    };
    const existingIndex = tabs.findIndex((tab) => String(tab.id) === id);
    if (existingIndex >= 0) {
      tabs[existingIndex] = { ...tabs[existingIndex], ...payload };
    } else {
      tabs.push(payload);
    }
    els.navTabSaveBtn.disabled = true;
    try {
      await saveTenantNavigationTabs(tabs, `Navigation tab ${existingIndex >= 0 ? 'updated' : 'created'}: ${label}`);
      const saved = state.cms.navTabs.find((tab) => String(tab.id) === id);
      if (saved) loadNavTabIntoEditor(saved);
    } catch (err) {
      setNotice(els.cmsNotice, err.message || 'Failed to save navigation tab', 'error');
    } finally {
      els.navTabSaveBtn.disabled = false;
    }
  }

  async function handleDeleteNavTab() {
    const id = String(els.navTabEditId.value || '');
    if (!id) return;
    if (!window.confirm('Delete this navigation tab?')) return;
    els.navTabDeleteBtn.disabled = true;
    try {
      const tabs = (Array.isArray(state.cms.navTabs) ? state.cms.navTabs : []).filter((tab) => String(tab.id) !== id);
      await saveTenantNavigationTabs(tabs, 'Navigation tab deleted.');
      clearNavTabEditor();
    } catch (err) {
      setNotice(els.cmsNotice, err.message || 'Failed to delete navigation tab', 'error');
    } finally {
      els.navTabDeleteBtn.disabled = false;
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
        await loadTenantDomainProvisioning();
        await loadTenantCmsContent();
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
    resetDomainProvisioningState();
    resetCmsState();
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
      await loadTenantDomainProvisioning();
      await loadTenantCmsContent();
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
      await loadTenantDomainProvisioning();
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
    applyUiMode();
    els.loginModeAdminBtn.addEventListener('click', () => setUiMode('admin'));
    els.loginModeTenantBtn.addEventListener('click', () => setUiMode('tenant'));
    if (els.appModeAdminBtn && els.appModeTenantBtn) {
      els.appModeAdminBtn.addEventListener('click', () => {
        setUiMode('admin');
        requestAnimationFrame(() => scrollToSectionHash('#section-tenants'));
      });
      els.appModeTenantBtn.addEventListener('click', () => {
        setUiMode('tenant');
        const targetHash = (state.tenantWorkspaceView || '') === 'tenant-settings'
          ? '#section-tenant-settings'
          : (state.tenantWorkspaceView || '') === 'placements'
            ? '#section-homepage-slot'
            : '#section-tenant-cms';
        requestAnimationFrame(() => scrollToSectionHash(targetHash));
      });
    }
    sidebarNavLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const hash = link.getAttribute('href') || '';
        if (!hash.startsWith('#')) return;
        event.preventDefault();

        const requestedUiMode = link.dataset.uiMode || '';
        const requestedWorkspaceView = link.dataset.workspaceView || '';
        const isTenantWorkspaceLink = Boolean(requestedWorkspaceView);
        if (requestedUiMode === 'admin' && state.uiMode !== 'admin') {
          setUiMode('admin');
        } else if (isTenantWorkspaceLink && state.uiMode !== 'tenant') {
          setUiMode('tenant');
        }
        if (requestedWorkspaceView) {
          setTenantWorkspaceView(requestedWorkspaceView);
        }

        requestAnimationFrame(() => scrollToSectionHash(hash));
      });
    });
    window.addEventListener('scroll', syncSidebarActiveLink, { passive: true });
    window.addEventListener('hashchange', syncSidebarActiveLink);

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
    els.tenantSwitch.addEventListener('change', async () => {
      const tenantId = Number(els.tenantSwitch.value);
      if (!tenantId || tenantId === state.selectedTenantId) return;
      state.selectedTenantId = tenantId;
      renderTenants();
      await loadHomepagePlacement();
      await loadTenantDomainProvisioning();
      await loadTenantCmsContent();
    });
    els.createTenantBtn.addEventListener('click', handleCreateTenant);
    els.refreshTenantsBtn.addEventListener('click', loadTenants);
    els.reloadSelectedBtn.addEventListener('click', async () => {
      await loadTenants();
      await loadHomepagePlacement();
      await loadTenantDomainProvisioning();
      await loadTenantCmsContent();
    });
    els.saveTenantBtn.addEventListener('click', handleSaveTenant);
    if (els.tenantDomainProvisionBtn) els.tenantDomainProvisionBtn.addEventListener('click', handleProvisionTenantDomain);
    if (els.tenantDomainVerifyBtn) els.tenantDomainVerifyBtn.addEventListener('click', handleVerifyTenantDomain);
    if (els.tenantDomainRefreshBtn) els.tenantDomainRefreshBtn.addEventListener('click', loadTenantDomainProvisioning);
    if (els.tenantDomainCopyInstructionsBtn) {
      els.tenantDomainCopyInstructionsBtn.addEventListener('click', async () => {
        const text = (els.tenantDomainInstructions?.value || '').trim();
        if (!text) {
          setNotice(els.tenantDomainProvisionNotice, 'No DNS instructions to copy yet. Provision the domain first.', 'error');
          return;
        }
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            setNotice(els.tenantDomainProvisionNotice, 'DNS instructions copied to clipboard.', 'ok');
          } else {
            els.tenantDomainInstructions.focus();
            els.tenantDomainInstructions.select();
            document.execCommand('copy');
            setNotice(els.tenantDomainProvisionNotice, 'DNS instructions copied.', 'ok');
          }
        } catch (err) {
          setNotice(els.tenantDomainProvisionNotice, err.message || 'Failed to copy DNS instructions', 'error');
        }
      });
    }

    els.createContentBtn.addEventListener('click', handleCreateContentItem);
    els.assignItemBtn.addEventListener('click', handleAssignItemToSlot);
    els.refreshPlacementBtn.addEventListener('click', loadHomepagePlacement);
    els.mediaFilter.addEventListener('change', renderCmsPanel);
    els.libraryMediaBtn.addEventListener('click', () => {
      setTenantWorkspaceView('libraries');
      els.mediaFilter.value = 'image';
      renderCmsPanel();
    });
    els.libraryDocsBtn.addEventListener('click', () => {
      setTenantWorkspaceView('libraries');
      els.mediaFilter.value = 'document';
      renderCmsPanel();
    });
    els.libraryAllBtn.addEventListener('click', () => {
      setTenantWorkspaceView('libraries');
      els.mediaFilter.value = 'all';
      renderCmsPanel();
    });
    els.mediaUploadBtn.addEventListener('click', handleUploadTenantMedia);
    els.mediaRefreshBtn.addEventListener('click', loadTenantCmsContent);
    els.articleRefreshBtn.addEventListener('click', loadTenantCmsContent);
    els.articleNewBtn.addEventListener('click', () => {
      setTenantWorkspaceView('articles');
      clearArticleEditor();
      setNotice(els.cmsNotice, 'Creating a new article.', 'ok');
    });
    els.articleSaveBtn.addEventListener('click', handleSaveArticle);
    els.articleDeleteBtn.addEventListener('click', handleDeleteArticle);
    els.annualRefreshBtn.addEventListener('click', loadTenantCmsContent);
    els.annualNewBtn.addEventListener('click', () => {
      setTenantWorkspaceView('annual-reports');
      clearAnnualReportEditor();
      setNotice(els.cmsNotice, 'Creating a new annual report entry.', 'ok');
    });
    els.annualSaveBtn.addEventListener('click', handleSaveAnnualReport);
    els.annualDeleteBtn.addEventListener('click', handleDeleteAnnualReport);
    els.navTabNewBtn.addEventListener('click', () => {
      setTenantWorkspaceView('nav-tabs');
      clearNavTabEditor();
      setNotice(els.cmsNotice, 'Creating a new navigation tab.', 'ok');
    });
    els.navTabsRefreshBtn.addEventListener('click', loadTenantCmsContent);
    els.navTabSaveBtn.addEventListener('click', handleSaveNavTab);
    els.navTabDeleteBtn.addEventListener('click', handleDeleteNavTab);
    els.annualMediaSelect.addEventListener('change', () => {
      const selectedId = Number(els.annualMediaSelect.value);
      const selected = (Array.isArray(state.cms.media) ? state.cms.media : []).find((item) => item.id === selectedId);
      if (selected?.fileUrl) {
        els.annualFileUrl.value = selected.fileUrl;
      }
    });

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
        await loadTenantDomainProvisioning();
        await loadTenantCmsContent();
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
