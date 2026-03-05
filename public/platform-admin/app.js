(function () {
  const SLOT_KEY = 'home.news-promotions';
  const PLATFORM_NAV_ACCORDION_STORAGE_KEY = 'cms-platform-admin-nav-accordion';
  const ADMIN_NAV_STORAGE_KEY = 'cms-platform-admin-page-nav';
  const DEFAULT_TENANT_MODULE_ACCESS = Object.freeze({
    homepagePlacements: true,
    articles: true,
    libraries: true,
    annualReports: true,
    navigationTabs: true,
  });
  const DEFAULT_SITE_SECTIONS = Object.freeze({
    homeInsights: {
      enabled: true,
      navbarEnabled: true,
      navbarOrder: 3,
      eyebrow: 'Insights',
      title: 'Latest updates from your CMS-powered editorial feed.',
      subtitle: 'This section reads published articles from the tenant CMS while keeping layout stable in site code.',
    },
  });
  const TENANT_USER_ROLES = Object.freeze(['admin', 'editor', 'viewer']);
  const TENANT_USER_STATUSES = Object.freeze(['active', 'disabled']);

  const state = {
    auth: null,
    uiMode: localStorage.getItem('cms-platform-ui-mode') === 'tenant' ? 'tenant' : 'admin',
    tenantWorkspaceView: localStorage.getItem('cms-platform-tenant-workspace-view') || 'articles',
    tenantSettingsTab: localStorage.getItem('cms-platform-tenant-settings-tab') || 'branding',
    adminNav: { main: 'tenants', sub: 'tenant-directory' },
    tenants: [],
    selectedTenantId: null,
    tenantFilters: {
      search: '',
      status: 'all',
    },
    tenantForm: {
      loadedTenantId: null,
      snapshot: null,
      dirty: false,
      isSaving: false,
      lastSavedAt: null,
      lastSaveMessage: '',
      saveHintTimeout: null,
      validationErrors: {},
    },
    placement: {
      slot: null,
      items: [],
      assignments: [],
    },
    domainProvisioning: {
      current: null,
    },
    tenantUsers: {
      rows: [],
      loading: false,
      saving: false,
      allowedRoles: [...TENANT_USER_ROLES],
      allowedStatuses: [...TENANT_USER_STATUSES],
    },
    platformBackups: {
      current: null,
      loading: false,
      running: false,
    },
    cms: {
      articles: [],
      media: [],
      editingArticle: null,
      annualReports: [],
      editingAnnualReport: null,
      navTabs: [],
      editingNavTabId: null,
      siteNavigation: { version: 1, primary: [], cta: null },
      siteNavSelection: { topId: null, columnId: null },
      siteSections: JSON.parse(JSON.stringify(DEFAULT_SITE_SECTIONS)),
      siteSectionsSnapshot: JSON.parse(JSON.stringify(DEFAULT_SITE_SECTIONS)),
      moduleAccess: { ...DEFAULT_TENANT_MODULE_ACCESS },
      moduleAccessSnapshot: { ...DEFAULT_TENANT_MODULE_ACCESS },
    },
  };

  const els = {
    loginView: document.getElementById('login-view'),
    appView: document.getElementById('app-view'),
    loginNotice: document.getElementById('login-notice'),
    appNotice: document.getElementById('app-notice'),
    platformBackupNotice: document.getElementById('platform-backup-notice'),
    platformStoragePathPill: document.getElementById('platform-storage-path-pill'),
    platformBackupR2Pill: document.getElementById('platform-backup-r2-pill'),
    platformDbPath: document.getElementById('platform-db-path'),
    platformDbSize: document.getElementById('platform-db-size'),
    platformDbJournal: document.getElementById('platform-db-journal'),
    platformBackupR2Target: document.getElementById('platform-backup-r2-target'),
    platformBackupRefreshBtn: document.getElementById('platform-backup-refresh-btn'),
    platformBackupRunBtn: document.getElementById('platform-backup-run-btn'),
    platformBackupList: document.getElementById('platform-backup-list'),
    sectionPlatformOpsGrid: document.getElementById('section-platform-ops-grid'),
    sectionStorageDiagnostics: document.getElementById('section-storage-diagnostics'),
    sectionDbBackups: document.getElementById('section-db-backups'),
    authPill: document.getElementById('auth-pill'),
    authAvatar: document.getElementById('auth-avatar'),
    authEmail: document.getElementById('auth-email'),
    authRole: document.getElementById('auth-role'),
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
    platformNavSearchInput: document.getElementById('platform-nav-search-input'),
    topbarTitle: document.getElementById('topbar-title'),
    topbarSubtitle: document.getElementById('topbar-subtitle'),
    tenantSwitchWrap: document.getElementById('tenant-switch-wrap'),
    tenantSwitch: document.getElementById('tenant-switch'),
    platformWorkbench: document.querySelector('.platform-workbench'),
    platformPageColumn: document.querySelector('.platform-page-column'),
    adminSubnavShell: document.getElementById('admin-subnav-shell'),
    adminSubnavTitle: document.getElementById('admin-subnav-title'),
    adminSubnavList: document.getElementById('admin-subnav-list'),
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
    tenantSearchInput: document.getElementById('tenant-search-input'),
    tenantStatusFilter: document.getElementById('tenant-status-filter'),
    tenantFilterClearBtn: document.getElementById('tenant-filter-clear-btn'),
    tenantListSummary: document.getElementById('tenant-list-summary'),
    tenantTableBody: document.getElementById('tenant-table-body'),
    selectedTenantEmpty: document.getElementById('selected-tenant-empty'),
    selectedTenantForm: document.getElementById('selected-tenant-form'),
    selectedTenantMeta: document.getElementById('selected-tenant-meta'),
    tenantBreadcrumbCurrent: document.getElementById('tenant-breadcrumb-current'),
    tenantContextHeader: document.getElementById('tenant-context-header'),
    tenantContextName: document.getElementById('tenant-context-name'),
    tenantContextSub: document.getElementById('tenant-context-sub'),
    tenantContextStatusPill: document.getElementById('tenant-context-status-pill'),
    tenantContextDomainPill: document.getElementById('tenant-context-domain-pill'),
    tenantContextOpenCms: document.getElementById('tenant-context-open-cms'),
    tenantContextOpenSite: document.getElementById('tenant-context-open-site'),
    tenantContextOpenDomainsTabBtn: document.getElementById('tenant-context-open-domains-tab'),
    tenantContextOpenContentTabBtn: document.getElementById('tenant-context-open-content-tab'),
    tenantFormDirtyPill: document.getElementById('tenant-form-dirty-pill'),
    tenantSettingsTabs: document.getElementById('tenant-settings-tabs'),
    tenantUsersOpenDomainsBtn: document.getElementById('tenant-users-open-domains-btn'),
    tenantUsersNotice: document.getElementById('tenant-users-notice'),
    tenantUserEmail: document.getElementById('tenant-user-email'),
    tenantUserPassword: document.getElementById('tenant-user-password'),
    tenantUserRole: document.getElementById('tenant-user-role'),
    tenantUserStatus: document.getElementById('tenant-user-status'),
    tenantUserMembershipStatus: document.getElementById('tenant-user-membership-status'),
    tenantUserCreateBtn: document.getElementById('tenant-user-create-btn'),
    tenantUserFormResetBtn: document.getElementById('tenant-user-form-reset-btn'),
    tenantUsersRefreshBtn: document.getElementById('tenant-users-refresh-btn'),
    tenantUsersSummary: document.getElementById('tenant-users-summary'),
    tenantUsersTableBody: document.getElementById('tenant-users-table-body'),
    tenantModuleAccessNotice: document.getElementById('tenant-module-access-notice'),
    tenantModuleHomepagePlacements: document.getElementById('tenant-module-homepage-placements'),
    tenantModuleArticles: document.getElementById('tenant-module-articles'),
    tenantModuleLibraries: document.getElementById('tenant-module-libraries'),
    tenantModuleAnnualReports: document.getElementById('tenant-module-annual-reports'),
    tenantModuleNavigationTabs: document.getElementById('tenant-module-navigation-tabs'),
    tenantModuleAccessSaveBtn: document.getElementById('tenant-module-access-save-btn'),
    tenantModuleAccessResetBtn: document.getElementById('tenant-module-access-reset-btn'),
    tenantSiteSectionsNotice: document.getElementById('tenant-site-sections-notice'),
    tenantSiteHomeInsightsEnabled: document.getElementById('tenant-site-home-insights-enabled'),
    tenantSiteHomeInsightsNavbarEnabled: document.getElementById('tenant-site-home-insights-navbar-enabled'),
    tenantSiteHomeInsightsNavbarOrder: document.getElementById('tenant-site-home-insights-navbar-order'),
    tenantSiteHomeInsightsEyebrow: document.getElementById('tenant-site-home-insights-eyebrow'),
    tenantSiteHomeInsightsTitle: document.getElementById('tenant-site-home-insights-title'),
    tenantSiteHomeInsightsSubtitle: document.getElementById('tenant-site-home-insights-subtitle'),
    tenantSiteSectionsSaveBtn: document.getElementById('tenant-site-sections-save-btn'),
    tenantSiteSectionsResetBtn: document.getElementById('tenant-site-sections-reset-btn'),
    tenantContentOpenArticlesBtn: document.getElementById('tenant-content-open-articles-btn'),
    tenantContentOpenLibraryBtn: document.getElementById('tenant-content-open-library-btn'),
    tenantContentOpenHomepageBtn: document.getElementById('tenant-content-open-homepage-btn'),
    editName: document.getElementById('edit-name'),
    editStatus: document.getElementById('edit-status'),
    editSlug: document.getElementById('edit-slug'),
    editPrimaryColor: document.getElementById('edit-primary-color'),
    editPrimaryColorPicker: document.getElementById('edit-primary-color-picker'),
    editPrimaryColorSwatch: document.getElementById('edit-primary-color-swatch'),
    editPrimaryColorPresets: Array.from(document.querySelectorAll('[data-color-preset]')),
    editPrimaryColorHelp: document.getElementById('edit-primary-color-help'),
    editLogoUrl: document.getElementById('edit-logo-url'),
    editPublicSiteUrl: document.getElementById('edit-public-site-url'),
    editPublicSiteUrlHelp: document.getElementById('edit-public-site-url-help'),
    editCmsDomain: document.getElementById('edit-cms-domain'),
    editCmsDomainHelp: document.getElementById('edit-cms-domain-help'),
    editSupportEmail: document.getElementById('edit-support-email'),
    editSupportEmailHelp: document.getElementById('edit-support-email-help'),
    editNameHelp: document.getElementById('edit-name-help'),
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
    discardTenantBtn: document.getElementById('discard-tenant-btn'),
    reloadSelectedBtn: document.getElementById('reload-selected-btn'),
    tenantFormValidationSummary: document.getElementById('tenant-form-validation-summary'),
    tenantFormSaveFeedback: document.getElementById('tenant-form-save-feedback'),
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
    siteNavBuilderNotice: document.getElementById('site-nav-builder-notice'),
    siteNavAddLinkBtn: document.getElementById('site-nav-add-link-btn'),
    siteNavAddMegaBtn: document.getElementById('site-nav-add-mega-btn'),
    siteNavEditCtaBtn: document.getElementById('site-nav-edit-cta-btn'),
    siteNavClearCtaBtn: document.getElementById('site-nav-clear-cta-btn'),
    siteNavRefreshBtn: document.getElementById('site-nav-refresh-btn'),
    siteNavSaveBtn: document.getElementById('site-nav-save-btn'),
    siteNavTopList: document.getElementById('site-nav-top-list'),
    siteNavColumnsList: document.getElementById('site-nav-columns-list'),
    siteNavSubitemsList: document.getElementById('site-nav-subitems-list'),
    siteNavColumnAddBtn: document.getElementById('site-nav-column-add-btn'),
    siteNavSubitemAddBtn: document.getElementById('site-nav-subitem-add-btn'),
    siteNavCtaSummary: document.getElementById('site-nav-cta-summary'),
    tenantPanelLibraries: document.getElementById('tenant-panel-libraries'),
    tenantPanelArticles: document.getElementById('tenant-panel-articles'),
    tenantPanelAnnualList: document.getElementById('tenant-panel-annual-list'),
    tenantPanelArticleEditor: document.getElementById('tenant-panel-article-editor'),
    tenantPanelAnnualEditor: document.getElementById('tenant-panel-annual-editor'),
    tenantPanelNavTabsList: document.getElementById('tenant-panel-nav-tabs-list'),
    tenantPanelNavTabsEditor: document.getElementById('tenant-panel-nav-tabs-editor'),
    sectionTenants: document.getElementById('section-tenants'),
    sectionTenantCreate: document.getElementById('section-tenant-create'),
    sectionTenantList: document.getElementById('section-tenant-list'),
    sectionTenantSettings: document.getElementById('section-tenant-settings'),
    sectionHomepageSlot: document.getElementById('section-homepage-slot'),
    sectionTenantCms: document.getElementById('section-tenant-cms'),
  };
  const sidebarNavLinks = Array.from(document.querySelectorAll('.platform-nav a[href^="#"]'));
  const cmsHashNavLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  const nonSidebarCmsHashLinks = cmsHashNavLinks.filter((link) => !link.closest('.platform-nav'));
  const workspaceNavLinks = Array.from(document.querySelectorAll('.platform-nav a[data-workspace-view]'));
  const platformNavMenuBlocks = Array.from(document.querySelectorAll('#sidebar-platform-group [data-nav-menu]'));
  const platformNavMenuToggleButtons = Array.from(document.querySelectorAll('#sidebar-platform-group [data-nav-menu-toggle]'));
  const platformAdminMainLinks = Array.from(document.querySelectorAll('#sidebar-platform-group [data-admin-main-link]'));
  const platformAdminSubLinks = Array.from(document.querySelectorAll('#sidebar-platform-group [data-admin-sub-link]'));
  const adminPageSections = Array.from(document.querySelectorAll('[data-admin-page]'));
  const tenantSettingsTabButtons = Array.from(document.querySelectorAll('#tenant-settings-tabs [data-tenant-settings-tab]'));
  const tenantSettingsTabPanels = Array.from(document.querySelectorAll('[data-tenant-settings-panel]'));
  const platformNavGroups = Array.from(document.querySelectorAll('.platform-nav-group'));

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

  function setPillStatus(el, label, kind) {
    if (!el) return;
    el.textContent = label;
    el.className = 'pill';
    if (kind === 'ok') el.classList.add('ok');
    if (kind === 'error') el.classList.add('error');
  }

  function resetPlatformNavSearch() {
    platformNavGroups.forEach((group) => {
      group.classList.remove('is-search-hidden');
      group.querySelectorAll('.is-search-hidden').forEach((node) => node.classList.remove('is-search-hidden'));
    });
    applyPlatformNavAccordionState();
    syncSidebarActiveLink();
  }

  function applyPlatformNavSearch(query) {
    const term = String(query || '').trim().toLowerCase();
    if (!term) {
      resetPlatformNavSearch();
      return;
    }

    platformNavGroups.forEach((group) => {
      let visibleCount = 0;

      group.querySelectorAll(':scope > .nav-menu-block').forEach((block) => {
        const headLink = block.querySelector(':scope > .nav-menu-head > a');
        const submenuLinks = Array.from(block.querySelectorAll(':scope > .submenu .submenu-link'));
        const headText = String(headLink?.textContent || '').toLowerCase();
        const headMatches = headText.includes(term);
        let hasMatchingSub = false;

        submenuLinks.forEach((link) => {
          const matches = headMatches || String(link.textContent || '').toLowerCase().includes(term);
          link.classList.toggle('is-search-hidden', !matches);
          if (matches) hasMatchingSub = true;
        });

        const showBlock = headMatches || hasMatchingSub;
        block.classList.toggle('is-search-hidden', !showBlock);
        if (showBlock) {
          visibleCount += 1;
          const menu = block.dataset.navMenu || '';
          if (menu) setPlatformNavMenuOpen(menu, true, { persist: false, closeOthers: false });
        }
      });

      group.querySelectorAll(':scope > a').forEach((link) => {
        const show = String(link.textContent || '').toLowerCase().includes(term);
        link.classList.toggle('is-search-hidden', !show);
        if (show) visibleCount += 1;
      });

      const title = group.querySelector(':scope > .platform-nav-group-title');
      if (title) title.classList.toggle('is-search-hidden', visibleCount === 0);
      group.classList.toggle('is-search-hidden', visibleCount === 0);
    });
  }

  function readPlatformNavAccordionState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PLATFORM_NAV_ACCORDION_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function writePlatformNavAccordionState(next) {
    try {
      localStorage.setItem(PLATFORM_NAV_ACCORDION_STORAGE_KEY, JSON.stringify(next || {}));
    } catch {
      // ignore storage failures
    }
  }

  function snapshotPlatformNavAccordionState() {
    const next = {};
    platformNavMenuBlocks.forEach((block) => {
      const menu = block.dataset.navMenu || '';
      if (!menu) return;
      next[menu] = !block.classList.contains('is-collapsed');
    });
    return next;
  }

  function setPlatformNavMenuOpen(menuId, open, options) {
    const menu = String(menuId || '');
    if (!menu) return;
    const isOpen = Boolean(open);
    const closeOthers = Boolean(options?.closeOthers && isOpen);
    platformNavMenuBlocks.forEach((block) => {
      const blockMenu = block.dataset.navMenu || '';
      if (!blockMenu) return;
      const shouldOpen = blockMenu === menu ? isOpen : !closeOthers && !block.classList.contains('is-collapsed');
      block.classList.toggle('is-collapsed', !shouldOpen);
      const toggle = block.querySelector(`[data-nav-menu-toggle="${blockMenu}"]`);
      if (toggle) toggle.setAttribute('aria-expanded', String(shouldOpen));
    });
    if (options?.persist !== false) {
      writePlatformNavAccordionState(snapshotPlatformNavAccordionState());
    }
  }

  function applyPlatformNavAccordionState() {
    const saved = readPlatformNavAccordionState();
    const normalized = normalizeAdminNavState(state.adminNav);
    const hasSaved = Object.keys(saved).length > 0;
    let openMenu = normalized.main;
    if (hasSaved) {
      const explicitOpen = platformNavMenuBlocks.find((block) => {
        const menu = block.dataset.navMenu || '';
        return menu && saved[menu] === true;
      });
      if (explicitOpen?.dataset?.navMenu) openMenu = explicitOpen.dataset.navMenu;
    }
    setPlatformNavMenuOpen(openMenu, true, { persist: false, closeOthers: true });
  }

  function expandPlatformNavMenuForLink(link) {
    if (!link) return;
    const block = link.closest('[data-nav-menu]');
    const menu = block?.dataset?.navMenu || '';
    if (!menu) return;
    setPlatformNavMenuOpen(menu, true, { closeOthers: true });
  }

  function normalizeWorkbenchLayout() {
    const workbench = els.platformWorkbench;
    const subnav = els.adminSubnavShell;
    if (!workbench || !subnav) return;

    let pageColumn = workbench.querySelector(':scope > .platform-page-column') || els.platformPageColumn;
    if (!pageColumn) {
      pageColumn = document.createElement('div');
      pageColumn.className = 'platform-page-column';
      workbench.prepend(pageColumn);
    }

    if (subnav.parentElement !== workbench) {
      workbench.appendChild(subnav);
    }
    if (pageColumn.parentElement !== workbench) {
      workbench.prepend(pageColumn);
    }

    const directChildren = Array.from(workbench.children);
    directChildren.forEach((child) => {
      if (child === pageColumn || child === subnav) return;
      pageColumn.appendChild(child);
    });

    els.platformPageColumn = pageColumn;
  }

  const ADMIN_NAV_MODEL = Object.freeze({
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
      page: 'tenants',
      subitems: [
        { id: 'create-tenant', label: 'Create Tenant', helper: 'New customer onboarding', hash: '#section-tenant-create', page: 'tenants' },
        { id: 'tenant-directory', label: 'Tenant Directory', helper: 'Search and filter tenants', hash: '#section-tenant-list', page: 'tenants' },
        { id: 'selected-tenant', label: 'Selected Tenant', helper: 'Edit active tenant settings', hash: '#section-tenant-settings', page: 'tenant-settings', tenantSettingsTab: 'branding' },
      ],
    },
    integrations: {
      label: 'Integrations & Access',
      page: 'tenant-settings',
      subitems: [
        { id: 'domain-provisioning', label: 'Domain Provisioning', helper: 'Render + DNS workflow', hash: '#tenant-settings-panel-domains', page: 'tenant-settings', tenantSettingsTab: 'domains' },
        { id: 'module-access', label: 'Module Access', helper: 'Toggle tenant-visible modules', hash: '#tenant-settings-panel-content', page: 'tenant-settings', tenantSettingsTab: 'content' },
        { id: 'tenant-users', label: 'Tenant Users', helper: 'Provisioning and roles', hash: '#tenant-settings-panel-users', page: 'tenant-settings', tenantSettingsTab: 'users' },
        { id: 'support-details', label: 'Support Details', helper: 'Support email and contact', hash: '#tenant-settings-panel-support', page: 'tenant-settings', tenantSettingsTab: 'support' },
      ],
    },
  });

  function readAdminNavState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(ADMIN_NAV_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function getAdminMain(main) {
    return Object.prototype.hasOwnProperty.call(ADMIN_NAV_MODEL, String(main || ''))
      ? String(main)
      : 'tenants';
  }

  function getAdminSub(main, sub) {
    const mainKey = getAdminMain(main);
    const items = ADMIN_NAV_MODEL[mainKey]?.subitems || [];
    const subKey = String(sub || '');
    return items.some((item) => item.id === subKey) ? subKey : (items[0]?.id || '');
  }

  function normalizeAdminNavState(next) {
    const main = getAdminMain(next?.main || state.adminNav?.main);
    const sub = getAdminSub(main, next?.sub || state.adminNav?.sub);
    return { main, sub };
  }

  function getAdminSubItem(main, sub) {
    const normalized = normalizeAdminNavState({ main, sub });
    return (ADMIN_NAV_MODEL[normalized.main]?.subitems || []).find((item) => item.id === normalized.sub) || null;
  }

  function persistAdminNavState() {
    try {
      localStorage.setItem(ADMIN_NAV_STORAGE_KEY, JSON.stringify(normalizeAdminNavState(state.adminNav)));
    } catch {
      // ignore storage failures
    }
  }

  function loadInitialAdminNavState() {
    state.adminNav = normalizeAdminNavState(readAdminNavState());
  }

  function getAdminNavResolved() {
    const normalized = normalizeAdminNavState(state.adminNav);
    return { ...normalized, item: getAdminSubItem(normalized.main, normalized.sub) };
  }

  function renderAdminSubnav() {
    if (!els.adminSubnavShell || !els.adminSubnavList || !els.adminSubnavTitle) return;
    if (state.uiMode === 'tenant') {
      els.adminSubnavShell.classList.add('hidden');
      return;
    }
    const { main, sub } = getAdminNavResolved();
    const group = ADMIN_NAV_MODEL[main];
    if (!group) {
      els.adminSubnavShell.classList.add('hidden');
      return;
    }
    els.adminSubnavShell.classList.remove('hidden');
    els.adminSubnavTitle.textContent = group.label;
    els.adminSubnavList.innerHTML = group.subitems.map((item) => `
      <button type="button" class="admin-subnav-item ${item.id === sub ? 'is-active' : ''}" data-admin-subnav-main="${main}" data-admin-subnav-id="${item.id}">
        <span class="label">${escapeHtml(item.label)}</span>
        <span class="helper">${escapeHtml(item.helper || '')}</span>
      </button>
    `).join('');
  }

  function applyAdminPageLayout(options) {
    if (state.uiMode === 'tenant') {
      if (els.adminSubnavShell) els.adminSubnavShell.classList.add('hidden');
      adminPageSections.forEach((section) => section.classList.remove('admin-page-hidden'));
      return;
    }

    const { main, item } = getAdminNavResolved();
    const targetPage = item?.page || ADMIN_NAV_MODEL[main]?.page || 'tenants';
    adminPageSections.forEach((section) => {
      section.classList.toggle('admin-page-hidden', section.dataset.adminPage !== targetPage);
    });
    if (els.sectionTenants) {
      els.sectionTenants.classList.remove('admin-subpage-create', 'admin-subpage-directory');
    }
    if (els.sectionTenantCreate) {
      els.sectionTenantCreate.classList.remove('hidden');
    }
    if (els.sectionTenantList) {
      els.sectionTenantList.classList.remove('hidden');
    }
    if (targetPage === 'tenants') {
      if (item?.id === 'create-tenant') {
        if (els.sectionTenantList) els.sectionTenantList.classList.add('hidden');
        if (els.sectionTenants) els.sectionTenants.classList.add('admin-subpage-create');
      } else if (item?.id === 'tenant-directory') {
        if (els.sectionTenantCreate) els.sectionTenantCreate.classList.add('hidden');
        if (els.sectionTenants) els.sectionTenants.classList.add('admin-subpage-directory');
      }
    }
    if (els.sectionStorageDiagnostics) els.sectionStorageDiagnostics.classList.remove('hidden');
    if (els.sectionDbBackups) els.sectionDbBackups.classList.remove('hidden');
    if (els.sectionPlatformOpsGrid) els.sectionPlatformOpsGrid.classList.remove('single-panel');
    if (targetPage === 'operations') {
      if (item?.id === 'storage-diagnostics') {
        if (els.sectionDbBackups) els.sectionDbBackups.classList.add('hidden');
        if (els.sectionPlatformOpsGrid) els.sectionPlatformOpsGrid.classList.add('single-panel');
      } else if (item?.id === 'db-backups') {
        if (els.sectionStorageDiagnostics) els.sectionStorageDiagnostics.classList.add('hidden');
        if (els.sectionPlatformOpsGrid) els.sectionPlatformOpsGrid.classList.add('single-panel');
      }
    }

    if (item?.tenantSettingsTab) {
      setTenantSettingsTab(item.tenantSettingsTab, { skipAdminNavSync: true });
    }

    platformAdminMainLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.adminMainLink === main);
    });
    const isSearchingNav = Boolean((els.platformNavSearchInput?.value || '').trim());
    setPlatformNavMenuOpen(main, true, { persist: true, closeOthers: !isSearchingNav });

    renderAdminSubnav();

    if (options?.focus === false) return;
    requestAnimationFrame(() => {
      const pageTarget = document.querySelector(`[data-admin-page="${targetPage}"]`);
      const target = pageTarget && !pageTarget.classList.contains('hidden')
        ? pageTarget
        : (item?.hash ? document.querySelector(item.hash) : null);
      if (!target || target.classList.contains('hidden')) return;
      const topOffset = 92;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - topOffset);
      window.scrollTo({ top, behavior: options?.behavior || 'auto' });
    });
  }

  function setAdminNav(next, options) {
    state.adminNav = normalizeAdminNavState(next);
    persistAdminNavState();
    applyAdminPageLayout(options);
    syncSidebarActiveLink();
  }

  function navigateAdminRoute(main, requestedSub, tab, options) {
    const resolvedMain = main || state.adminNav?.main || 'tenants';
    let resolvedSub = requestedSub || (state.adminNav?.main === resolvedMain ? state.adminNav?.sub : '');
    if (resolvedMain === 'integrations' && tab) {
      const tabToSub = {
        domains: 'domain-provisioning',
        content: 'module-access',
        users: 'tenant-users',
        support: 'support-details',
      };
      resolvedSub = tabToSub[tab] || resolvedSub;
    }
    setAdminNav(
      { main: resolvedMain, sub: resolvedSub },
      { focus: options?.focus ?? !requestedSub, behavior: options?.behavior || 'auto' },
    );
  }

  loadInitialAdminNavState();

  function formatBytes(value) {
    const bytes = Number(value || 0);
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let idx = 0;
    while (size >= 1024 && idx < units.length - 1) {
      size /= 1024;
      idx += 1;
    }
    return `${size.toFixed(size >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
  }

  function normalizeTenantModuleAccess(input) {
    const source = input && typeof input === 'object' ? input : {};
    return {
      homepagePlacements: source.homepagePlacements !== false,
      articles: source.articles !== false,
      libraries: source.libraries !== false,
      annualReports: source.annualReports !== false,
      navigationTabs: source.navigationTabs !== false,
    };
  }

  function normalizeSiteSections(input) {
    const source = input && typeof input === 'object' ? input : {};
    const rawHomeInsights = source.homeInsights && typeof source.homeInsights === 'object'
      ? source.homeInsights
      : {};
    const fallback = DEFAULT_SITE_SECTIONS.homeInsights;
    return {
      homeInsights: {
        enabled: Object.prototype.hasOwnProperty.call(rawHomeInsights, 'enabled')
          ? Boolean(rawHomeInsights.enabled)
          : Boolean(fallback.enabled),
        navbarEnabled: Object.prototype.hasOwnProperty.call(rawHomeInsights, 'navbarEnabled')
          ? Boolean(rawHomeInsights.navbarEnabled)
          : Boolean(fallback.navbarEnabled),
        navbarOrder: (() => {
          const value = Object.prototype.hasOwnProperty.call(rawHomeInsights, 'navbarOrder')
            ? Number(rawHomeInsights.navbarOrder)
            : Number(fallback.navbarOrder);
          if (!Number.isFinite(value) || value < 0) return Number(fallback.navbarOrder) || 3;
          return Math.floor(value);
        })(),
        eyebrow: String(rawHomeInsights.eyebrow || '').trim() || fallback.eyebrow,
        title: String(rawHomeInsights.title || '').trim() || fallback.title,
        subtitle: String(rawHomeInsights.subtitle || '').trim() || fallback.subtitle,
      },
    };
  }

  function ensureAbsoluteUrl(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  }

  function extractHostname(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';
    try {
      return new URL(ensureAbsoluteUrl(raw)).host;
    } catch {
      return raw.replace(/^https?:\/\//i, '').split('/')[0];
    }
  }

  function inferTenantDomainState(tenant) {
    const selected = getSelectedTenant();
    if (selected && tenant && selected.id === tenant.id && state.domainProvisioning?.current?.domain?.status) {
      return String(state.domainProvisioning.current.domain.status);
    }
    return String(tenant?.domainProvisioning?.status || (tenant?.branding?.cmsDomain ? 'draft' : 'not configured'));
  }

  function isTenantDomainUnverified(tenant) {
    const status = inferTenantDomainState(tenant).toLowerCase();
    return status !== 'verified';
  }

  function getFilteredTenants() {
    const rows = Array.isArray(state.tenants) ? state.tenants : [];
    const query = String(state.tenantFilters.search || '').trim().toLowerCase();
    const statusFilter = String(state.tenantFilters.status || 'all');
    return rows.filter((tenant) => {
      if (statusFilter === 'active' && tenant.status !== 'active') return false;
      if (statusFilter === 'disabled' && tenant.status !== 'disabled') return false;
      if (statusFilter === 'domain-unverified' && !isTenantDomainUnverified(tenant)) return false;
      if (!query) return true;
      const haystack = [
        tenant.name,
        tenant.slug,
        tenant.branding?.cmsDomain,
        tenant.branding?.publicSiteUrl,
        tenant.branding?.supportEmail,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }

  function summarizeTenantList(filtered, all) {
    const total = Array.isArray(all) ? all.length : 0;
    const visible = Array.isArray(filtered) ? filtered.length : 0;
    const active = filtered.filter((t) => t.status === 'active').length;
    const disabled = filtered.filter((t) => t.status === 'disabled').length;
    const selected = getSelectedTenant();
    const selectedHidden = selected && !filtered.some((t) => t.id === selected.id);
    const parts = [
      `${visible} shown`,
      `${total} total`,
      `${active} active`,
      `${disabled} disabled`,
    ];
    if (selectedHidden) parts.push('selected tenant hidden by filters');
    return parts.join(' • ');
  }

  function setAnchorEnabled(anchorEl, href, labelWhenMissing) {
    if (!anchorEl) return;
    if (href) {
      anchorEl.href = href;
      anchorEl.setAttribute('aria-disabled', 'false');
      anchorEl.title = href;
    } else {
      anchorEl.href = '#';
      anchorEl.setAttribute('aria-disabled', 'true');
      anchorEl.title = labelWhenMissing || 'Not configured';
    }
  }

  function getTenantFormSnapshot() {
    return {
      name: (els.editName?.value || '').trim(),
      status: els.editStatus?.value || 'active',
      primaryColor: (els.editPrimaryColor?.value || '').trim(),
      logoUrl: (els.editLogoUrl?.value || '').trim(),
      publicSiteUrl: (els.editPublicSiteUrl?.value || '').trim(),
      cmsDomain: (els.editCmsDomain?.value || '').trim(),
      supportEmail: (els.editSupportEmail?.value || '').trim(),
    };
  }

  function normalizeHexColor(value) {
    return String(value || '').trim().toUpperCase();
  }

  function isHexColor(value) {
    return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(String(value || '').trim());
  }

  function toSixDigitHex(value) {
    const normalized = normalizeHexColor(value);
    if (!isHexColor(normalized)) return null;
    if (normalized.length === 4) {
      return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
    }
    return normalized;
  }

  function syncPrimaryColorControls() {
    const raw = normalizeHexColor(els.editPrimaryColor?.value || '');
    const validColor = toSixDigitHex(raw);
    if (els.editPrimaryColorSwatch) {
      if (validColor) {
        els.editPrimaryColorSwatch.style.background = validColor;
        els.editPrimaryColorSwatch.style.borderColor = 'rgba(17, 24, 39, 0.2)';
      } else {
        els.editPrimaryColorSwatch.style.background = 'repeating-conic-gradient(#f2f4f7 0% 25%, #ffffff 0% 50%) 50% / 12px 12px';
        els.editPrimaryColorSwatch.style.borderColor = '#d0d5dd';
      }
    }
    if (els.editPrimaryColorPicker && validColor) {
      els.editPrimaryColorPicker.value = validColor.toLowerCase();
    }
  }

  function snapshotsEqual(a, b) {
    return JSON.stringify(a || null) === JSON.stringify(b || null);
  }

  function setTenantFieldError(inputEl, helpEl, message) {
    if (!inputEl) return;
    if (!message) {
      inputEl.classList.remove('input-invalid');
      inputEl.removeAttribute('aria-invalid');
      if (helpEl) {
        helpEl.classList.add('hidden');
        helpEl.classList.remove('error');
        helpEl.textContent = '';
      }
      return;
    }
    inputEl.classList.add('input-invalid');
    inputEl.setAttribute('aria-invalid', 'true');
    if (helpEl) {
      helpEl.classList.remove('hidden');
      helpEl.classList.add('error');
      helpEl.textContent = message;
    }
  }

  function clearTenantFormValidation() {
    state.tenantForm.validationErrors = {};
    setNotice(els.tenantFormValidationSummary, '', '');
    setTenantFieldError(els.editName, els.editNameHelp, '');
    setTenantFieldError(els.editPrimaryColor, els.editPrimaryColorHelp, '');
    setTenantFieldError(els.editPublicSiteUrl, els.editPublicSiteUrlHelp, '');
    setTenantFieldError(els.editCmsDomain, els.editCmsDomainHelp, '');
    setTenantFieldError(els.editSupportEmail, els.editSupportEmailHelp, '');
  }

  function validateTenantForm() {
    clearTenantFormValidation();
    const values = getTenantFormSnapshot();
    const errors = {};

    if (!values.name) errors.name = 'Tenant name is required.';
    if (values.primaryColor && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(values.primaryColor)) {
      errors.primaryColor = 'Use a hex color such as #2563EB.';
    }

    [['publicSiteUrl', values.publicSiteUrl], ['cmsDomain', values.cmsDomain]].forEach(([key, value]) => {
      if (!value) return;
      try {
        new URL(ensureAbsoluteUrl(value));
      } catch {
        errors[key] = 'Enter a valid URL or hostname.';
      }
    });

    if (values.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.supportEmail)) {
      errors.supportEmail = 'Enter a valid support email.';
    }

    state.tenantForm.validationErrors = errors;
    setTenantFieldError(els.editName, els.editNameHelp, errors.name || '');
    setTenantFieldError(els.editPrimaryColor, els.editPrimaryColorHelp, errors.primaryColor || '');
    setTenantFieldError(els.editPublicSiteUrl, els.editPublicSiteUrlHelp, errors.publicSiteUrl || '');
    setTenantFieldError(els.editCmsDomain, els.editCmsDomainHelp, errors.cmsDomain || '');
    setTenantFieldError(els.editSupportEmail, els.editSupportEmailHelp, errors.supportEmail || '');

    const messages = Object.values(errors);
    if (messages.length) {
      setNotice(els.tenantFormValidationSummary, `Please fix ${messages.length} field${messages.length > 1 ? 's' : ''} before saving.`, 'error');
      const fieldToTab = {
        name: 'branding',
        primaryColor: 'branding',
        publicSiteUrl: 'branding',
        cmsDomain: 'domains',
        supportEmail: 'support',
      };
      const firstErrorKey = Object.keys(errors)[0];
      if (fieldToTab[firstErrorKey]) setTenantSettingsTab(fieldToTab[firstErrorKey]);
      if (firstErrorKey === 'publicSiteUrl') {
        const details = document.getElementById('tenant-branding-advanced');
        if (details) details.open = true;
      }
      if (firstErrorKey === 'cmsDomain') {
        const details = document.getElementById('tenant-domain-provisioning-details');
        if (details) details.open = true;
      }
    }
    return { valid: messages.length === 0, values, errors };
  }

  function renderTenantFormState() {
    const tenant = getSelectedTenant();
    const dirty = Boolean(state.tenantForm.dirty);
    const saving = Boolean(state.tenantForm.isSaving);
    const lastSavedAt = state.tenantForm.lastSavedAt;
    const lastSaveMessage = state.tenantForm.lastSaveMessage;
    if (els.tenantFormDirtyPill) {
      const showDirty = Boolean(tenant && dirty && !saving);
      els.tenantFormDirtyPill.className = 'tenant-state-indicator';
      els.tenantFormDirtyPill.textContent = 'Unsaved changes';
      els.tenantFormDirtyPill.classList.toggle('hidden', !showDirty);
    }
    if (els.saveTenantBtn) {
      els.saveTenantBtn.disabled = !tenant || !dirty || saving;
      els.saveTenantBtn.classList.toggle('is-loading', saving);
      if (saving) {
        els.saveTenantBtn.innerHTML = '<span class="ui-spinner sm" aria-hidden="true"></span><span>Saving…</span>';
      } else {
        els.saveTenantBtn.textContent = 'Save changes';
      }
    }
    if (els.discardTenantBtn) {
      els.discardTenantBtn.disabled = !tenant || !dirty || saving;
    }
    if (els.reloadSelectedBtn) {
      els.reloadSelectedBtn.disabled = !tenant || saving;
    }
    if (state.tenantForm.saveHintTimeout) {
      clearTimeout(state.tenantForm.saveHintTimeout);
      state.tenantForm.saveHintTimeout = null;
    }
    if (els.tenantFormSaveFeedback) {
      els.tenantFormSaveFeedback.classList.remove('is-saved', 'is-fadeout');
      if (!tenant) {
        els.tenantFormSaveFeedback.textContent = '';
      } else if (saving) {
        els.tenantFormSaveFeedback.textContent = 'Saving tenant changes…';
      } else if (dirty) {
        els.tenantFormSaveFeedback.textContent = '';
      } else if (lastSavedAt) {
        const elapsed = Date.now() - new Date(lastSavedAt).getTime();
        if (elapsed < 6000) {
          els.tenantFormSaveFeedback.textContent = lastSaveMessage || 'Saved';
          els.tenantFormSaveFeedback.classList.add('is-saved', 'is-fadeout');
          state.tenantForm.saveHintTimeout = setTimeout(() => {
            renderTenantFormState();
          }, 6100 - elapsed);
        } else {
          els.tenantFormSaveFeedback.textContent = '';
        }
      } else {
        els.tenantFormSaveFeedback.textContent = '';
      }
    }
  }

  function refreshTenantFormDirtyState() {
    const tenant = getSelectedTenant();
    if (!tenant || !state.tenantForm.snapshot) {
      state.tenantForm.dirty = false;
      renderTenantFormState();
      return;
    }
    const current = getTenantFormSnapshot();
    state.tenantForm.dirty = !snapshotsEqual(current, state.tenantForm.snapshot);
    renderTenantFormState();
  }

  function markTenantFormPristine(message) {
    state.tenantForm.snapshot = getTenantFormSnapshot();
    state.tenantForm.dirty = false;
    state.tenantForm.isSaving = false;
    state.tenantForm.lastSavedAt = new Date().toISOString();
    state.tenantForm.lastSaveMessage = message || 'Saved';
    renderTenantFormState();
  }

  function resetTenantFormTracking() {
    if (state.tenantForm.saveHintTimeout) {
      clearTimeout(state.tenantForm.saveHintTimeout);
      state.tenantForm.saveHintTimeout = null;
    }
    state.tenantForm.loadedTenantId = null;
    state.tenantForm.snapshot = null;
    state.tenantForm.dirty = false;
    state.tenantForm.isSaving = false;
    state.tenantForm.lastSavedAt = null;
    state.tenantForm.lastSaveMessage = '';
    state.tenantForm.validationErrors = {};
    clearTenantFormValidation();
    renderTenantFormState();
  }

  function setTenantSettingsTab(tab, options) {
    const next = ['branding', 'domains', 'support', 'users', 'content'].includes(tab) ? tab : 'branding';
    state.tenantSettingsTab = next;
    localStorage.setItem('cms-platform-tenant-settings-tab', next);
    tenantSettingsTabButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.tenantSettingsTab === next));
    tenantSettingsTabPanels.forEach((panel) => panel.classList.toggle('hidden', panel.dataset.tenantSettingsPanel !== next));
    if (!options?.skipAdminNavSync && state.uiMode === 'admin') {
      if (next === 'branding') {
        state.adminNav = normalizeAdminNavState({ main: 'tenants', sub: 'selected-tenant' });
      } else {
        const tabToSub = {
          domains: 'domain-provisioning',
          content: 'module-access',
          users: 'tenant-users',
          support: 'support-details',
        };
        const sub = tabToSub[next];
        if (sub) state.adminNav = normalizeAdminNavState({ main: 'integrations', sub });
      }
      persistAdminNavState();
      applyAdminPageLayout({ focus: false });
      renderAdminSubnav();
      syncSidebarActiveLink();
    }
  }

  function getCurrentTenantModuleAccess() {
    return normalizeTenantModuleAccess(state.cms?.moduleAccess || DEFAULT_TENANT_MODULE_ACCESS);
  }

  function moduleAccessEquals(a, b) {
    return JSON.stringify(normalizeTenantModuleAccess(a)) === JSON.stringify(normalizeTenantModuleAccess(b));
  }

  function renderTenantModuleAccessControls() {
    const tenant = getSelectedTenant();
    const access = getCurrentTenantModuleAccess();
    const snapshot = normalizeTenantModuleAccess(state.cms?.moduleAccessSnapshot || DEFAULT_TENANT_MODULE_ACCESS);
    const dirty = !moduleAccessEquals(access, snapshot);

    const pairs = [
      [els.tenantModuleHomepagePlacements, access.homepagePlacements],
      [els.tenantModuleArticles, access.articles],
      [els.tenantModuleLibraries, access.libraries],
      [els.tenantModuleAnnualReports, access.annualReports],
      [els.tenantModuleNavigationTabs, access.navigationTabs],
    ];
    pairs.forEach(([input, checked]) => {
      if (!input) return;
      input.checked = Boolean(checked);
      input.disabled = !tenant;
    });

    if (els.tenantModuleAccessSaveBtn) {
      els.tenantModuleAccessSaveBtn.disabled = !tenant || !dirty;
      els.tenantModuleAccessSaveBtn.textContent = dirty ? 'Save Module Access' : 'Module Access Saved';
    }
    if (els.tenantModuleAccessResetBtn) {
      els.tenantModuleAccessResetBtn.disabled = !tenant || !dirty;
    }

    if (!tenant) {
      setNotice(els.tenantModuleAccessNotice, '', '');
      return;
    }
    if (dirty) {
      setNotice(els.tenantModuleAccessNotice, 'Module access changes are not saved yet.', 'error');
    } else {
      setNotice(els.tenantModuleAccessNotice, '', '');
    }
  }

  function collectTenantModuleAccessFromControls() {
    return normalizeTenantModuleAccess({
      homepagePlacements: Boolean(els.tenantModuleHomepagePlacements?.checked),
      articles: Boolean(els.tenantModuleArticles?.checked),
      libraries: Boolean(els.tenantModuleLibraries?.checked),
      annualReports: Boolean(els.tenantModuleAnnualReports?.checked),
      navigationTabs: Boolean(els.tenantModuleNavigationTabs?.checked),
    });
  }

  function setTenantModuleAccessLocal(nextAccess, options) {
    const normalized = normalizeTenantModuleAccess(nextAccess);
    if (!state.cms) return;
    state.cms.moduleAccess = normalized;
    if (options?.markSaved) state.cms.moduleAccessSnapshot = { ...normalized };
    renderTenantModuleAccessControls();
    applyTenantWorkspaceView();
    syncSidebarActiveLink();
  }

  function siteSectionsEqual(a, b) {
    return JSON.stringify(normalizeSiteSections(a)) === JSON.stringify(normalizeSiteSections(b));
  }

  function getCurrentSiteSections() {
    return normalizeSiteSections(state.cms?.siteSections || DEFAULT_SITE_SECTIONS);
  }

  function renderTenantSiteSectionsControls() {
    const tenant = getSelectedTenant();
    const current = getCurrentSiteSections();
    const snapshot = normalizeSiteSections(state.cms?.siteSectionsSnapshot || DEFAULT_SITE_SECTIONS);
    const dirty = !siteSectionsEqual(current, snapshot);

    if (els.tenantSiteHomeInsightsEnabled) {
      els.tenantSiteHomeInsightsEnabled.checked = Boolean(current.homeInsights.enabled);
      els.tenantSiteHomeInsightsEnabled.disabled = !tenant;
    }
    if (els.tenantSiteHomeInsightsNavbarEnabled) {
      els.tenantSiteHomeInsightsNavbarEnabled.checked = Boolean(current.homeInsights.navbarEnabled);
      els.tenantSiteHomeInsightsNavbarEnabled.disabled = !tenant;
    }
    if (els.tenantSiteHomeInsightsNavbarOrder) {
      const value = Number(current.homeInsights.navbarOrder);
      els.tenantSiteHomeInsightsNavbarOrder.value = String(Number.isFinite(value) && value >= 0 ? Math.floor(value) : 3);
      els.tenantSiteHomeInsightsNavbarOrder.disabled = !tenant;
    }
    if (els.tenantSiteHomeInsightsEyebrow) {
      els.tenantSiteHomeInsightsEyebrow.value = current.homeInsights.eyebrow || '';
      els.tenantSiteHomeInsightsEyebrow.disabled = !tenant;
    }
    if (els.tenantSiteHomeInsightsTitle) {
      els.tenantSiteHomeInsightsTitle.value = current.homeInsights.title || '';
      els.tenantSiteHomeInsightsTitle.disabled = !tenant;
    }
    if (els.tenantSiteHomeInsightsSubtitle) {
      els.tenantSiteHomeInsightsSubtitle.value = current.homeInsights.subtitle || '';
      els.tenantSiteHomeInsightsSubtitle.disabled = !tenant;
    }
    if (els.tenantSiteSectionsSaveBtn) {
      els.tenantSiteSectionsSaveBtn.disabled = !tenant || !dirty;
      els.tenantSiteSectionsSaveBtn.textContent = dirty ? 'Save Section Controls' : 'Section Controls Saved';
    }
    if (els.tenantSiteSectionsResetBtn) {
      els.tenantSiteSectionsResetBtn.disabled = !tenant || !dirty;
    }

    if (!tenant) {
      setNotice(els.tenantSiteSectionsNotice, '', '');
      return;
    }
    if (dirty) {
      setNotice(els.tenantSiteSectionsNotice, 'Section control changes are not saved yet.', 'error');
    } else {
      setNotice(els.tenantSiteSectionsNotice, '', '');
    }
  }

  function collectSiteSectionsFromControls() {
    return normalizeSiteSections({
      homeInsights: {
        enabled: Boolean(els.tenantSiteHomeInsightsEnabled?.checked),
        navbarEnabled: Boolean(els.tenantSiteHomeInsightsNavbarEnabled?.checked),
        navbarOrder: Number.isFinite(Number(els.tenantSiteHomeInsightsNavbarOrder?.value))
          ? Math.max(0, Math.floor(Number(els.tenantSiteHomeInsightsNavbarOrder.value)))
          : 3,
        eyebrow: String(els.tenantSiteHomeInsightsEyebrow?.value || ''),
        title: String(els.tenantSiteHomeInsightsTitle?.value || ''),
        subtitle: String(els.tenantSiteHomeInsightsSubtitle?.value || ''),
      },
    });
  }

  function setTenantSiteSectionsLocal(nextSections, options) {
    const normalized = normalizeSiteSections(nextSections);
    if (!state.cms) return;
    state.cms.siteSections = normalized;
    if (options?.markSaved) state.cms.siteSectionsSnapshot = JSON.parse(JSON.stringify(normalized));
    renderTenantSiteSectionsControls();
  }

  function renderTenantContextHeader(tenant) {
    if (!els.tenantContextHeader) return;
    if (!tenant) {
      els.tenantContextHeader.classList.add('hidden');
      if (els.tenantBreadcrumbCurrent) els.tenantBreadcrumbCurrent.textContent = 'Selected Tenant';
      return;
    }
    els.tenantContextHeader.classList.remove('hidden');
    const draftName = (els.editName?.value || '').trim() || tenant.name || 'Untitled tenant';
    const draftStatus = els.editStatus?.value || tenant.status || 'active';
    const draftCmsDomain = (els.editCmsDomain?.value || '').trim() || tenant.branding?.cmsDomain || '';
    const draftPublicSiteUrl = (els.editPublicSiteUrl?.value || '').trim() || tenant.branding?.publicSiteUrl || '';
    if (els.tenantContextName) els.tenantContextName.textContent = draftName;
    if (els.tenantBreadcrumbCurrent) els.tenantBreadcrumbCurrent.textContent = draftName;
    if (els.tenantContextSub) {
      els.tenantContextSub.textContent = `Slug: ${tenant.slug || '-'} • Environment: Production`;
    }
    setPillStatus(els.tenantContextStatusPill, `Status: ${draftStatus}`, draftStatus === 'active' ? 'ok' : '');
    const domainStatus = inferTenantDomainState({ ...tenant, branding: { ...(tenant.branding || {}), cmsDomain: draftCmsDomain } });
    const domainLabel = draftCmsDomain
      ? `CMS: ${extractHostname(draftCmsDomain)} • ${domainStatus}`
      : 'CMS domain not set';
    setPillStatus(els.tenantContextDomainPill, domainLabel, domainStatus === 'verified' ? 'ok' : (draftCmsDomain ? '' : 'error'));
    setAnchorEnabled(els.tenantContextOpenCms, draftCmsDomain ? ensureAbsoluteUrl(draftCmsDomain) : '', 'Set CMS domain first');
    setAnchorEnabled(els.tenantContextOpenSite, draftPublicSiteUrl ? ensureAbsoluteUrl(draftPublicSiteUrl) : '', 'Set public site URL first');
    renderTenantFormState();
  }

  function clearTenantFieldErrorByInputId(inputId) {
    if (!inputId) return;
    const mappings = {
      'edit-name': [els.editName, els.editNameHelp],
      'edit-primary-color': [els.editPrimaryColor, els.editPrimaryColorHelp],
      'edit-public-site-url': [els.editPublicSiteUrl, els.editPublicSiteUrlHelp],
      'edit-cms-domain': [els.editCmsDomain, els.editCmsDomainHelp],
      'edit-support-email': [els.editSupportEmail, els.editSupportEmailHelp],
    };
    const [inputEl, helpEl] = mappings[inputId] || [];
    if (inputEl) setTenantFieldError(inputEl, helpEl, '');
    if (els.tenantFormValidationSummary && !Object.keys(state.tenantForm.validationErrors || {}).length) {
      setNotice(els.tenantFormValidationSummary, '', '');
    }
  }

  function handleTenantFormChanged(event) {
    const inputId = event?.target?.id || '';
    if (inputId) {
      const validationKeyMap = {
        'edit-name': 'name',
        'edit-primary-color': 'primaryColor',
        'edit-public-site-url': 'publicSiteUrl',
        'edit-cms-domain': 'cmsDomain',
        'edit-support-email': 'supportEmail',
      };
      if (state.tenantForm.validationErrors) {
        const key = validationKeyMap[inputId];
        if (key) delete state.tenantForm.validationErrors[key];
      }
      clearTenantFieldErrorByInputId(inputId);
      if (inputId === 'edit-primary-color' || inputId === 'edit-primary-color-picker') {
        syncPrimaryColorControls();
      }
    }
    refreshTenantFormDirtyState();
    renderTenantContextHeader(getSelectedTenant());
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

  function renderPlatformBackupPanel() {
    const payload = state.platformBackups.current;
    const storage = payload?.storage || null;
    const r2 = payload?.r2 || null;
    const backups = Array.isArray(payload?.backups) ? payload.backups : [];

    if (els.platformBackupRefreshBtn) {
      els.platformBackupRefreshBtn.disabled = state.platformBackups.loading || state.platformBackups.running;
    }
    if (els.platformBackupRunBtn) {
      els.platformBackupRunBtn.disabled = state.platformBackups.loading || state.platformBackups.running || !r2?.configured;
      els.platformBackupRunBtn.textContent = state.platformBackups.running ? 'Backing up…' : 'Backup DB to R2';
    }

    if (!storage) {
      setPillStatus(els.platformStoragePathPill, 'Unknown', '');
      if (els.platformDbPath) els.platformDbPath.textContent = '—';
      if (els.platformDbSize) els.platformDbSize.textContent = '—';
      if (els.platformDbJournal) els.platformDbJournal.textContent = '—';
    } else {
      const persistentStatus = storage.persistentDiskStatus || (storage.dbOnVarData ? 'ok' : 'not_persistent_path');
      const persistentLabel =
        persistentStatus === 'ok'
          ? `On ${storage.expectedDiskMountPath || '/var/data'}`
          : persistentStatus === 'path_mismatch'
            ? 'Disk attached, path mismatch'
            : 'Not on persistent path';
      setPillStatus(els.platformStoragePathPill, persistentLabel, persistentStatus === 'ok' ? 'ok' : 'error');
      if (els.platformDbPath) els.platformDbPath.textContent = storage.resolvedDbPath || '—';
      if (els.platformDbPath && storage.persistentDiskHint) {
        els.platformDbPath.textContent = `${storage.resolvedDbPath || '—'} • ${storage.persistentDiskHint}`;
      }
      if (els.platformDbSize) {
        const parts = [];
        parts.push(formatBytes(storage.dbSize || 0));
        if (storage.dbUpdatedAt) parts.push(`updated ${formatDateTime(storage.dbUpdatedAt)}`);
        els.platformDbSize.textContent = parts.join(' • ') || '—';
      }
      if (els.platformDbJournal) {
        const journalParts = [];
        if (storage.journalMode) journalParts.push(`journal: ${storage.journalMode}`);
        if (storage.walFileExists) journalParts.push(`wal ${formatBytes(storage.walFileSize || 0)}`);
        if (storage.shmFileExists) journalParts.push(`shm ${formatBytes(storage.shmFileSize || 0)}`);
        els.platformDbJournal.textContent = journalParts.join(' • ') || '—';
      }
    }

    if (!r2) {
      setPillStatus(els.platformBackupR2Pill, 'Unknown', '');
      if (els.platformBackupR2Target) els.platformBackupR2Target.textContent = '—';
    } else {
      setPillStatus(els.platformBackupR2Pill, r2.configured ? 'Configured' : 'Not configured', r2.configured ? 'ok' : 'error');
      if (els.platformBackupR2Target) {
        const endpointHost = (() => {
          try {
            return r2.endpoint ? new URL(r2.endpoint).host : '';
          } catch {
            return r2.endpoint || '';
          }
        })();
        els.platformBackupR2Target.textContent = [
          r2.bucketName ? `bucket: ${r2.bucketName}` : null,
          endpointHost ? `endpoint: ${endpointHost}` : null,
          r2.backupPrefix ? `prefix: ${r2.backupPrefix}` : null,
        ].filter(Boolean).join(' • ') || '—';
      }
    }

    if (els.platformBackupList) {
      if (!payload && state.platformBackups.loading) {
        els.platformBackupList.innerHTML = renderLoadingRow('Loading backup status…');
      } else if (!backups.length) {
        els.platformBackupList.innerHTML = '<div class="meta">No DB backups yet. Click “Backup DB to R2” after configuring R2.</div>';
      } else {
        els.platformBackupList.innerHTML = backups.map((item) => `
          <div class="backup-row">
            <div class="backup-row-head">
              <div class="backup-row-title">${escapeHtml(item.objectKey || `Backup #${item.id}`)}</div>
              <span class="pill ${item.status === 'completed' ? 'ok' : ''}">${escapeHtml(item.status || 'unknown')}</span>
            </div>
            <div class="backup-row-meta">
              ${[
                item.createdAt ? `Created ${formatDateTime(item.createdAt)}` : null,
                item.fileSize ? formatBytes(item.fileSize) : null,
                item.checksumSha256 ? `sha256 ${item.checksumSha256.slice(0, 12)}…` : null,
                item.errorMessage ? `Error: ${item.errorMessage}` : null,
              ].filter(Boolean).join(' • ')}
            </div>
          </div>
        `).join('');
      }
    }
  }

  async function loadPlatformBackups() {
    state.platformBackups.loading = true;
    renderPlatformBackupPanel();
    try {
      const payload = await api('/api/platform/backups/db', { method: 'GET' });
      state.platformBackups.current = payload;
      setNotice(els.platformBackupNotice, '', '');
      renderPlatformBackupPanel();
    } catch (err) {
      setNotice(els.platformBackupNotice, err.message || 'Failed to load backup status', 'error');
      renderPlatformBackupPanel();
    } finally {
      state.platformBackups.loading = false;
      renderPlatformBackupPanel();
    }
  }

  async function handleRunPlatformDbBackup() {
    state.platformBackups.running = true;
    setNotice(els.platformBackupNotice, 'Creating DB snapshot and uploading to R2…', 'ok');
    renderPlatformBackupPanel();
    try {
      const payload = await api('/api/platform/backups/db', { method: 'POST' });
      state.platformBackups.current = {
        ...(state.platformBackups.current || {}),
        ...payload,
        backups: Array.isArray(state.platformBackups.current?.backups)
          ? [payload.backup, ...state.platformBackups.current.backups.filter((b) => b.id !== payload.backup?.id)].slice(0, 12)
          : (payload.backup ? [payload.backup] : []),
      };
      setNotice(els.platformBackupNotice, `DB backup uploaded to R2: ${payload.backup?.objectKey || 'snapshot created'}`, 'ok');
    } catch (err) {
      setNotice(els.platformBackupNotice, err.message || 'Failed to back up DB to R2', 'error');
      await loadPlatformBackups();
    } finally {
      state.platformBackups.running = false;
      renderPlatformBackupPanel();
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderLoadingInline(label) {
    return `<span class="ui-loading-inline"><span class="ui-spinner sm" aria-hidden="true"></span><span>${escapeHtml(label || 'Loading…')}</span></span>`;
  }

  function renderLoadingRow(label) {
    return `<div class="ui-loading-row"><span class="ui-spinner" aria-hidden="true"></span><span>${escapeHtml(label || 'Loading…')}</span></div>`;
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
    const access = getCurrentTenantModuleAccess();
    const viewAccessMap = {
      placements: 'homepagePlacements',
      articles: 'articles',
      libraries: 'libraries',
      'annual-reports': 'annualReports',
      'nav-tabs': 'navigationTabs',
    };
    const requestedView = state.tenantWorkspaceView || 'articles';
    const requestedAccessKey = viewAccessMap[requestedView];
    if (requestedAccessKey && access[requestedAccessKey] === false) {
      const fallbackView = ['articles', 'libraries', 'annual-reports', 'nav-tabs', 'placements', 'tenant-settings']
        .find((candidate) => {
          const key = viewAccessMap[candidate];
          return !key || access[key] !== false;
        }) || 'tenant-settings';
      state.tenantWorkspaceView = fallbackView;
      localStorage.setItem('cms-platform-tenant-workspace-view', state.tenantWorkspaceView);
    }
    const view = state.tenantWorkspaceView || 'articles';
    if (!isTenantMode) {
      [els.sectionHomepageSlot, els.sectionTenantCms].forEach((el) => el && el.classList.add('hidden'));
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
        const workspaceView = link.dataset.workspaceView || '';
        const accessKey = viewAccessMap[workspaceView];
        link.classList.toggle('hidden', Boolean(accessKey));
        link.classList.toggle('is-active', false);
      });
      applyAdminPageLayout({ focus: false });
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
      const workspaceView = link.dataset.workspaceView || '';
      const accessKey = viewAccessMap[workspaceView];
      const isAllowed = !accessKey || access[accessKey] !== false;
      link.classList.toggle('hidden', !isAllowed);
      const active = isAllowed && workspaceView === view;
      link.classList.toggle('is-active', active);
    });
  }

  function applyUiMode() {
    const isTenantMode = state.uiMode === 'tenant';
    document.body.classList.toggle('ui-mode-tenant', isTenantMode);
    document.body.classList.toggle('ui-mode-admin', !isTenantMode);
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
      els.sidebarTenantGroup.classList.toggle('hidden', !isTenantMode);
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
    if (!isTenantMode) {
      applyAdminPageLayout({ focus: false });
    }
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
    const { main, sub } = getAdminNavResolved();
    platformAdminMainLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.adminMainLink === main);
    });
    let activeSub = sub;
    const group = ADMIN_NAV_MODEL[main];
    const markerY = window.scrollY + 120;
    if (group?.subitems?.length) {
      const visibleTargets = group.subitems
        .map((item) => {
          const target = item.hash ? document.querySelector(item.hash) : null;
          if (!target || target.classList.contains('hidden') || target.offsetParent === null) return null;
          return { item, target };
        })
        .filter(Boolean);
      if (visibleTargets.length) {
        let active = visibleTargets[0];
        visibleTargets.forEach((entry) => {
          if (entry.target.offsetTop <= markerY) active = entry;
        });
        activeSub = active.item.id;
      }
    }
    if (els.adminSubnavList) {
      els.adminSubnavList.querySelectorAll('[data-admin-subnav-id]').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.adminSubnavId === activeSub && btn.dataset.adminSubnavMain === main);
      });
    }
    platformAdminSubLinks.forEach((link) => {
      const menu = link.closest('[data-nav-menu]')?.dataset?.navMenu || '';
      const subLink = link.dataset.adminSubLink || '';
      const isActive = menu === main && subLink === activeSub;
      link.classList.toggle('is-active', isActive);
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
      siteNavigation: { version: 1, primary: [], cta: null },
      siteNavSelection: { topId: null, columnId: null },
      siteSections: JSON.parse(JSON.stringify(DEFAULT_SITE_SECTIONS)),
      siteSectionsSnapshot: JSON.parse(JSON.stringify(DEFAULT_SITE_SECTIONS)),
      moduleAccess: { ...DEFAULT_TENANT_MODULE_ACCESS },
      moduleAccessSnapshot: { ...DEFAULT_TENANT_MODULE_ACCESS },
    };
  }

  function setSiteNavBuilderEmptyState() {
    if (els.siteNavTopList) els.siteNavTopList.textContent = 'Select a tenant to load site navigation.';
    if (els.siteNavColumnsList) els.siteNavColumnsList.textContent = 'Select a tenant to load site navigation.';
    if (els.siteNavSubitemsList) els.siteNavSubitemsList.textContent = 'Select a tenant to load site navigation.';
    if (els.siteNavCtaSummary) els.siteNavCtaSummary.textContent = 'No CTA configured.';
    if (els.siteNavColumnAddBtn) els.siteNavColumnAddBtn.disabled = true;
    if (els.siteNavSubitemAddBtn) els.siteNavSubitemAddBtn.disabled = true;
  }

  function deepClone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }

  function normalizeClientSiteNavigation(input) {
    const source = input && typeof input === 'object' ? input : {};
    const primary = Array.isArray(source.primary) ? source.primary : [];
    return {
      version: Number(source.version || 1) || 1,
      primary: primary
        .map((item, index) => {
          const label = String(item?.label || '').trim();
          if (!label) return null;
          const columns = Array.isArray(item?.columns) ? item.columns : [];
          return {
            id: String(item?.id || `top-${Date.now()}-${index}`),
            label,
            href: String(item?.href || '').trim(),
            type: columns.length ? 'mega' : (item?.type === 'mega' ? 'mega' : 'link'),
            description: String(item?.description || '').trim(),
            visible: item?.visible !== false,
            order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
            columns: columns
              .map((col, colIndex) => {
                const title = String(col?.title || '').trim();
                const items = Array.isArray(col?.items) ? col.items : [];
                return {
                  id: String(col?.id || `col-${Date.now()}-${index}-${colIndex}`),
                  title,
                  visible: col?.visible !== false,
                  order: Number.isFinite(Number(col?.order)) ? Number(col.order) : colIndex,
                  items: items
                    .map((sub, subIndex) => {
                      const subLabel = String(sub?.label || '').trim();
                      if (!subLabel) return null;
                      return {
                        id: String(sub?.id || `sub-${Date.now()}-${index}-${colIndex}-${subIndex}`),
                        label: subLabel,
                        href: String(sub?.href || '').trim(),
                        description: String(sub?.description || '').trim(),
                        visible: sub?.visible !== false,
                        order: Number.isFinite(Number(sub?.order)) ? Number(sub.order) : subIndex,
                      };
                    })
                    .filter(Boolean)
                    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label)),
                };
              })
              .filter((col) => col.title || (Array.isArray(col.items) && col.items.length))
              .sort((a, b) => a.order - b.order || String(a.title || '').localeCompare(String(b.title || ''))),
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label)),
      cta:
        source.cta && typeof source.cta === 'object' && String(source.cta.label || '').trim()
          ? {
              label: String(source.cta.label || '').trim(),
              href: String(source.cta.href || '').trim(),
              visible: source.cta.visible !== false,
            }
          : null,
    };
  }

  function getSiteNavTopItems() {
    return Array.isArray(state.cms?.siteNavigation?.primary) ? state.cms.siteNavigation.primary : [];
  }

  function getSelectedSiteNavTopItem() {
    const selectedId = String(state.cms?.siteNavSelection?.topId || '');
    if (!selectedId) return null;
    return getSiteNavTopItems().find((item) => String(item.id) === selectedId) || null;
  }

  function getSelectedSiteNavColumn() {
    const top = getSelectedSiteNavTopItem();
    if (!top) return null;
    const selectedColumnId = String(state.cms?.siteNavSelection?.columnId || '');
    if (!selectedColumnId) return null;
    return (Array.isArray(top.columns) ? top.columns : []).find((col) => String(col.id) === selectedColumnId) || null;
  }

  function reindexOrdered(items) {
    return (Array.isArray(items) ? items : []).map((item, index) => ({ ...item, order: index }));
  }

  function setSiteNavBuilderNotice(message, kind) {
    if (!els.siteNavBuilderNotice) return;
    setNotice(els.siteNavBuilderNotice, message, kind);
  }

  function ensureSiteNavSelection() {
    const primary = getSiteNavTopItems();
    const currentTop = getSelectedSiteNavTopItem();
    if (!currentTop) {
      state.cms.siteNavSelection.topId = primary[0] ? String(primary[0].id) : null;
      state.cms.siteNavSelection.columnId = null;
    }
    const top = getSelectedSiteNavTopItem();
    if (!top || top.type !== 'mega' || !Array.isArray(top.columns) || !top.columns.length) {
      state.cms.siteNavSelection.columnId = null;
      return;
    }
    const currentCol = getSelectedSiteNavColumn();
    if (!currentCol) {
      state.cms.siteNavSelection.columnId = String(top.columns[0].id);
    }
  }

  function renderSiteNavigationBuilder() {
    if (!els.siteNavTopList || !els.siteNavColumnsList || !els.siteNavSubitemsList) return;
    ensureSiteNavSelection();
    const nav = normalizeClientSiteNavigation(state.cms.siteNavigation);
    state.cms.siteNavigation = nav;

    const primary = nav.primary;
    const selectedTop = getSelectedSiteNavTopItem();
    const selectedColumn = getSelectedSiteNavColumn();

    if (els.siteNavTopList) {
      if (!primary.length) {
        els.siteNavTopList.innerHTML = 'No top-level items yet. Add a top link or mega menu.';
      } else {
        els.siteNavTopList.innerHTML = primary.map((item, index) => `
          <div class="card nested-card" style="padding:8px; margin:0 0 8px; border:${String(state.cms.siteNavSelection.topId) === String(item.id) ? '1px solid #c4b5fd' : '1px solid #e5e7eb'};">
            <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;">
              <div>
                <div style="font-weight:700;">${escapeHtml(item.label)}</div>
                <div class="meta">${escapeHtml(item.type === 'mega' ? 'Mega menu' : 'Link')} • ${escapeHtml(item.href || '(no href)')}</div>
              </div>
              <span class="pill">${item.visible === false ? 'Hidden' : 'Visible'}</span>
            </div>
            <div class="actions" style="margin-top:8px;">
              <button type="button" class="btn-edit btn-equal" data-site-nav-top-action="select" data-site-nav-top-id="${escapeHtml(String(item.id))}">Select</button>
              <button type="button" class="btn-edit btn-equal" data-site-nav-top-action="edit" data-site-nav-top-id="${escapeHtml(String(item.id))}">Edit</button>
              <button type="button" class="btn-equal" data-site-nav-top-action="toggle" data-site-nav-top-id="${escapeHtml(String(item.id))}">${item.visible === false ? 'Show' : 'Hide'}</button>
              <button type="button" class="btn-compact" data-site-nav-top-action="up" data-site-nav-top-id="${escapeHtml(String(item.id))}" ${index === 0 ? 'disabled' : ''}>↑</button>
              <button type="button" class="btn-compact" data-site-nav-top-action="down" data-site-nav-top-id="${escapeHtml(String(item.id))}" ${index === primary.length - 1 ? 'disabled' : ''}>↓</button>
              <button type="button" class="btn-danger btn-equal" data-site-nav-top-action="delete" data-site-nav-top-id="${escapeHtml(String(item.id))}">Delete</button>
            </div>
          </div>
        `).join('');
      }
    }

    if (els.siteNavColumnsList) {
      if (!selectedTop) {
        els.siteNavColumnsList.innerHTML = 'Select a top-level menu item first.';
      } else if (selectedTop.type !== 'mega') {
        els.siteNavColumnsList.innerHTML = 'Selected top item is a simple link. Edit it and set type to mega (or add a mega menu) to manage columns.';
      } else {
        const columns = Array.isArray(selectedTop.columns) ? selectedTop.columns : [];
        els.siteNavColumnsList.innerHTML = columns.length
          ? columns.map((column, index) => `
              <div class="card nested-card" style="padding:8px; margin:0 0 8px; border:${String(state.cms.siteNavSelection.columnId) === String(column.id) ? '1px solid #93c5fd' : '1px solid #e5e7eb'};">
                <div style="font-weight:700;">${escapeHtml(column.title || `Column ${index + 1}`)}</div>
                <div class="meta">${(Array.isArray(column.items) ? column.items.length : 0)} submenu items</div>
                <div class="actions" style="margin-top:8px;">
                  <button type="button" class="btn-edit btn-equal" data-site-nav-col-action="select" data-site-nav-col-id="${escapeHtml(String(column.id))}">Select</button>
                  <button type="button" class="btn-edit btn-equal" data-site-nav-col-action="edit" data-site-nav-col-id="${escapeHtml(String(column.id))}">Edit</button>
                  <button type="button" class="btn-compact" data-site-nav-col-action="up" data-site-nav-col-id="${escapeHtml(String(column.id))}" ${index === 0 ? 'disabled' : ''}>↑</button>
                  <button type="button" class="btn-compact" data-site-nav-col-action="down" data-site-nav-col-id="${escapeHtml(String(column.id))}" ${index === columns.length - 1 ? 'disabled' : ''}>↓</button>
                  <button type="button" class="btn-danger btn-equal" data-site-nav-col-action="delete" data-site-nav-col-id="${escapeHtml(String(column.id))}">Delete</button>
                </div>
              </div>
            `).join('')
          : 'No columns yet. Add a column for this mega menu.';
      }
    }

    if (els.siteNavSubitemsList) {
      if (!selectedTop || selectedTop.type !== 'mega') {
        els.siteNavSubitemsList.innerHTML = 'Select a mega-menu item first.';
      } else if (!selectedColumn) {
        els.siteNavSubitemsList.innerHTML = 'Select a column to manage submenu links.';
      } else {
        const items = Array.isArray(selectedColumn.items) ? selectedColumn.items : [];
        els.siteNavSubitemsList.innerHTML = items.length
          ? items.map((item, index) => `
              <div class="card nested-card" style="padding:8px; margin:0 0 8px;">
                <div style="font-weight:700;">${escapeHtml(item.label)}</div>
                <div class="meta">${escapeHtml(item.href || '(no href)')}</div>
                <div class="actions" style="margin-top:8px;">
                  <button type="button" class="btn-edit btn-equal" data-site-nav-sub-action="edit" data-site-nav-sub-id="${escapeHtml(String(item.id))}">Edit</button>
                  <button type="button" class="btn-equal" data-site-nav-sub-action="toggle" data-site-nav-sub-id="${escapeHtml(String(item.id))}">${item.visible === false ? 'Show' : 'Hide'}</button>
                  <button type="button" class="btn-compact" data-site-nav-sub-action="up" data-site-nav-sub-id="${escapeHtml(String(item.id))}" ${index === 0 ? 'disabled' : ''}>↑</button>
                  <button type="button" class="btn-compact" data-site-nav-sub-action="down" data-site-nav-sub-id="${escapeHtml(String(item.id))}" ${index === items.length - 1 ? 'disabled' : ''}>↓</button>
                  <button type="button" class="btn-danger btn-equal" data-site-nav-sub-action="delete" data-site-nav-sub-id="${escapeHtml(String(item.id))}">Delete</button>
                </div>
              </div>
            `).join('')
          : 'No submenu links yet. Add a submenu item for the selected column.';
      }
    }

    if (els.siteNavCtaSummary) {
      const cta = nav.cta;
      els.siteNavCtaSummary.textContent = cta && cta.visible !== false && cta.label
        ? `${cta.label} → ${cta.href || '(no href)'}`
        : 'No CTA configured.';
    }

    if (els.siteNavColumnAddBtn) {
      els.siteNavColumnAddBtn.disabled = !(selectedTop && selectedTop.type === 'mega');
    }
    if (els.siteNavSubitemAddBtn) {
      els.siteNavSubitemAddBtn.disabled = !(selectedTop && selectedTop.type === 'mega' && selectedColumn);
    }
  }

  function mutateSiteNavigation(mutator) {
    const next = deepClone(normalizeClientSiteNavigation(state.cms.siteNavigation));
    mutator(next);
    next.primary = reindexOrdered(next.primary || []);
    (next.primary || []).forEach((item) => {
      item.columns = reindexOrdered(item.columns || []);
      (item.columns || []).forEach((col) => {
        col.items = reindexOrdered(col.items || []);
      });
    });
    state.cms.siteNavigation = normalizeClientSiteNavigation(next);
    renderSiteNavigationBuilder();
  }

  function promptSiteNavItem(existing, defaults = {}) {
    const label = window.prompt('Menu label', existing?.label || defaults.label || '');
    if (label === null) return null;
    const href = window.prompt('Href / path (optional for dropdown root)', existing?.href || defaults.href || '');
    if (href === null) return null;
    const typeInput = window.prompt('Type: link or mega', existing?.type || defaults.type || 'link');
    if (typeInput === null) return null;
    const type = String(typeInput).trim().toLowerCase() === 'mega' ? 'mega' : 'link';
    return {
      label: String(label).trim(),
      href: String(href).trim(),
      type,
    };
  }

  function promptSiteNavColumn(existing) {
    const title = window.prompt('Column title', existing?.title || '');
    if (title === null) return null;
    return { title: String(title).trim() };
  }

  function promptSiteNavSubItem(existing) {
    const label = window.prompt('Submenu item label', existing?.label || '');
    if (label === null) return null;
    const href = window.prompt('Submenu item href / path', existing?.href || '');
    if (href === null) return null;
    return {
      label: String(label).trim(),
      href: String(href).trim(),
      description: String(existing?.description || ''),
    };
  }

  async function handleSaveSiteNavigation() {
    try {
      const res = await tenantApi('/api/tenant/settings', {
        method: 'PUT',
        body: JSON.stringify({ siteNavigation: state.cms.siteNavigation }),
      });
      state.cms.siteNavigation = normalizeClientSiteNavigation(res.siteNavigation || state.cms.siteNavigation);
      setSiteNavBuilderNotice('Site navigation layout saved.', 'ok');
      renderSiteNavigationBuilder();
    } catch (err) {
      setSiteNavBuilderNotice(err.message || 'Failed to save site navigation', 'error');
    }
  }

  function handleAddSiteNavTop(type) {
    const result = promptSiteNavItem(null, { type: type === 'mega' ? 'mega' : 'link' });
    if (!result) return;
    if (!result.label) {
      setSiteNavBuilderNotice('Top-level menu label is required.', 'error');
      return;
    }
    mutateSiteNavigation((next) => {
      next.primary = Array.isArray(next.primary) ? next.primary : [];
      const newItem = {
        id: `top-${Date.now()}`,
        label: result.label,
        href: result.href,
        type: result.type,
        visible: true,
        order: next.primary.length,
        columns: result.type === 'mega' ? [] : [],
      };
      next.primary.push(newItem);
      state.cms.siteNavSelection.topId = String(newItem.id);
      state.cms.siteNavSelection.columnId = null;
    });
    setSiteNavBuilderNotice(`Added top-level ${type === 'mega' ? 'mega menu' : 'link'}: ${result.label}`, 'ok');
  }

  function handleSiteNavTopAction(action, topId) {
    const id = String(topId || '');
    const current = getSiteNavTopItems();
    const index = current.findIndex((item) => String(item.id) === id);
    if (index < 0) return;
    const item = current[index];

    if (action === 'select') {
      state.cms.siteNavSelection.topId = id;
      state.cms.siteNavSelection.columnId = null;
      renderSiteNavigationBuilder();
      return;
    }
    if (action === 'edit') {
      const result = promptSiteNavItem(item, item);
      if (!result) return;
      if (!result.label) {
        setSiteNavBuilderNotice('Top-level menu label is required.', 'error');
        return;
      }
      mutateSiteNavigation((next) => {
        const items = next.primary || [];
        const idx = items.findIndex((x) => String(x.id) === id);
        if (idx < 0) return;
        const existing = items[idx];
        items[idx] = {
          ...existing,
          label: result.label,
          href: result.href,
          type: result.type,
          columns: result.type === 'mega' ? (Array.isArray(existing.columns) ? existing.columns : []) : [],
        };
        if (result.type !== 'mega') state.cms.siteNavSelection.columnId = null;
      });
      setSiteNavBuilderNotice(`Updated top-level item: ${result.label}`, 'ok');
      return;
    }
    if (action === 'toggle') {
      mutateSiteNavigation((next) => {
        const target = (next.primary || []).find((x) => String(x.id) === id);
        if (target) target.visible = target.visible === false;
      });
      setSiteNavBuilderNotice('Visibility updated.', 'ok');
      return;
    }
    if (action === 'up' || action === 'down') {
      mutateSiteNavigation((next) => {
        const items = next.primary || [];
        const idx = items.findIndex((x) => String(x.id) === id);
        const swap = action === 'up' ? idx - 1 : idx + 1;
        if (idx < 0 || swap < 0 || swap >= items.length) return;
        [items[idx], items[swap]] = [items[swap], items[idx]];
      });
      return;
    }
    if (action === 'delete') {
      if (!window.confirm(`Delete top-level menu "${item.label}"?`)) return;
      mutateSiteNavigation((next) => {
        next.primary = (next.primary || []).filter((x) => String(x.id) !== id);
        if (String(state.cms.siteNavSelection.topId || '') === id) {
          state.cms.siteNavSelection.topId = null;
          state.cms.siteNavSelection.columnId = null;
        }
      });
      setSiteNavBuilderNotice(`Deleted top-level item: ${item.label}`, 'ok');
    }
  }

  function handleAddSiteNavColumn() {
    const top = getSelectedSiteNavTopItem();
    if (!top || top.type !== 'mega') {
      setSiteNavBuilderNotice('Select a mega-menu top item first.', 'error');
      return;
    }
    const result = promptSiteNavColumn(null);
    if (!result) return;
    if (!result.title) {
      setSiteNavBuilderNotice('Column title is required.', 'error');
      return;
    }
    mutateSiteNavigation((next) => {
      const item = (next.primary || []).find((x) => String(x.id) === String(top.id));
      if (!item) return;
      item.type = 'mega';
      item.columns = Array.isArray(item.columns) ? item.columns : [];
      const col = {
        id: `col-${Date.now()}`,
        title: result.title,
        visible: true,
        order: item.columns.length,
        items: [],
      };
      item.columns.push(col);
      state.cms.siteNavSelection.columnId = String(col.id);
    });
    setSiteNavBuilderNotice(`Added column: ${result.title}`, 'ok');
  }

  function handleSiteNavColumnAction(action, colId) {
    const top = getSelectedSiteNavTopItem();
    if (!top || top.type !== 'mega') return;
    const id = String(colId || '');
    const columns = Array.isArray(top.columns) ? top.columns : [];
    const index = columns.findIndex((c) => String(c.id) === id);
    if (index < 0) return;
    const column = columns[index];

    if (action === 'select') {
      state.cms.siteNavSelection.columnId = id;
      renderSiteNavigationBuilder();
      return;
    }
    if (action === 'edit') {
      const result = promptSiteNavColumn(column);
      if (!result) return;
      if (!result.title) {
        setSiteNavBuilderNotice('Column title is required.', 'error');
        return;
      }
      mutateSiteNavigation((next) => {
        const item = (next.primary || []).find((x) => String(x.id) === String(top.id));
        const col = item?.columns?.find((c) => String(c.id) === id);
        if (col) col.title = result.title;
      });
      setSiteNavBuilderNotice(`Updated column: ${result.title}`, 'ok');
      return;
    }
    if (action === 'up' || action === 'down') {
      mutateSiteNavigation((next) => {
        const item = (next.primary || []).find((x) => String(x.id) === String(top.id));
        const cols = item?.columns || [];
        const idx = cols.findIndex((c) => String(c.id) === id);
        const swap = action === 'up' ? idx - 1 : idx + 1;
        if (idx < 0 || swap < 0 || swap >= cols.length) return;
        [cols[idx], cols[swap]] = [cols[swap], cols[idx]];
      });
      return;
    }
    if (action === 'delete') {
      if (!window.confirm(`Delete column "${column.title || 'Untitled'}"?`)) return;
      mutateSiteNavigation((next) => {
        const item = (next.primary || []).find((x) => String(x.id) === String(top.id));
        if (!item) return;
        item.columns = (item.columns || []).filter((c) => String(c.id) !== id);
        if (String(state.cms.siteNavSelection.columnId || '') === id) state.cms.siteNavSelection.columnId = null;
      });
      setSiteNavBuilderNotice('Column deleted.', 'ok');
    }
  }

  function handleAddSiteNavSubItem() {
    const top = getSelectedSiteNavTopItem();
    const col = getSelectedSiteNavColumn();
    if (!top || top.type !== 'mega' || !col) {
      setSiteNavBuilderNotice('Select a mega-menu column first.', 'error');
      return;
    }
    const result = promptSiteNavSubItem(null);
    if (!result) return;
    if (!result.label) {
      setSiteNavBuilderNotice('Submenu item label is required.', 'error');
      return;
    }
    mutateSiteNavigation((next) => {
      const item = (next.primary || []).find((x) => String(x.id) === String(top.id));
      const column = item?.columns?.find((c) => String(c.id) === String(col.id));
      if (!column) return;
      column.items = Array.isArray(column.items) ? column.items : [];
      column.items.push({
        id: `sub-${Date.now()}`,
        label: result.label,
        href: result.href,
        visible: true,
        order: column.items.length,
      });
    });
    setSiteNavBuilderNotice(`Added submenu item: ${result.label}`, 'ok');
  }

  function handleSiteNavSubItemAction(action, subId) {
    const top = getSelectedSiteNavTopItem();
    const col = getSelectedSiteNavColumn();
    if (!top || !col) return;
    const id = String(subId || '');
    const items = Array.isArray(col.items) ? col.items : [];
    const index = items.findIndex((x) => String(x.id) === id);
    if (index < 0) return;
    const subItem = items[index];

    if (action === 'edit') {
      const result = promptSiteNavSubItem(subItem);
      if (!result) return;
      if (!result.label) {
        setSiteNavBuilderNotice('Submenu item label is required.', 'error');
        return;
      }
      mutateSiteNavigation((next) => {
        const item = (next.primary || []).find((x) => String(x.id) === String(top.id));
        const column = item?.columns?.find((c) => String(c.id) === String(col.id));
        const target = column?.items?.find((x) => String(x.id) === id);
        if (target) {
          target.label = result.label;
          target.href = result.href;
        }
      });
      setSiteNavBuilderNotice(`Updated submenu item: ${result.label}`, 'ok');
      return;
    }
    if (action === 'toggle') {
      mutateSiteNavigation((next) => {
        const item = (next.primary || []).find((x) => String(x.id) === String(top.id));
        const column = item?.columns?.find((c) => String(c.id) === String(col.id));
        const target = column?.items?.find((x) => String(x.id) === id);
        if (target) target.visible = target.visible === false;
      });
      setSiteNavBuilderNotice('Submenu visibility updated.', 'ok');
      return;
    }
    if (action === 'up' || action === 'down') {
      mutateSiteNavigation((next) => {
        const item = (next.primary || []).find((x) => String(x.id) === String(top.id));
        const column = item?.columns?.find((c) => String(c.id) === String(col.id));
        const list = column?.items || [];
        const idx = list.findIndex((x) => String(x.id) === id);
        const swap = action === 'up' ? idx - 1 : idx + 1;
        if (idx < 0 || swap < 0 || swap >= list.length) return;
        [list[idx], list[swap]] = [list[swap], list[idx]];
      });
      return;
    }
    if (action === 'delete') {
      if (!window.confirm(`Delete submenu item "${subItem.label}"?`)) return;
      mutateSiteNavigation((next) => {
        const item = (next.primary || []).find((x) => String(x.id) === String(top.id));
        const column = item?.columns?.find((c) => String(c.id) === String(col.id));
        if (!column) return;
        column.items = (column.items || []).filter((x) => String(x.id) !== id);
      });
      setSiteNavBuilderNotice(`Deleted submenu item: ${subItem.label}`, 'ok');
    }
  }

  function handleEditSiteNavCta() {
    const current = state.cms.siteNavigation?.cta || {};
    const label = window.prompt('CTA label (e.g. Contact)', current.label || '');
    if (label === null) return;
    const href = window.prompt('CTA href / path', current.href || '');
    if (href === null) return;
    if (!String(label).trim()) {
      setSiteNavBuilderNotice('CTA label is required (or use Clear CTA).', 'error');
      return;
    }
    mutateSiteNavigation((next) => {
      next.cta = {
        label: String(label).trim(),
        href: String(href).trim(),
        visible: true,
      };
    });
    setSiteNavBuilderNotice('CTA updated.', 'ok');
  }

  function handleClearSiteNavCta() {
    if (!window.confirm('Clear the site header CTA?')) return;
    mutateSiteNavigation((next) => {
      next.cta = null;
    });
    setSiteNavBuilderNotice('CTA cleared.', 'ok');
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

  function parseApiDate(value) {
    if (value === null || value === undefined || value === '') return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === 'number') {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const raw = String(value).trim();
    if (!raw) return null;
    const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(raw)
      ? `${raw.replace(' ', 'T')}Z`
      : raw;
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function formatDateTime(value) {
    if (!value) return '—';
    const d = parseApiDate(value);
    if (!d) return String(value);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
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
                  <button class="edit-nav-tab-btn btn-edit" data-nav-tab-id="${escapeHtml(String(tab.id))}">Edit</button>
                </div>
              </td>
            </tr>
          `)
          .join('')
      : '<tr><td colspan="6" class="meta">No navigation tabs yet. <button type="button" class="empty-new-nav-tab-btn">Create first navigation tab</button></td></tr>';

    els.navTabsTableBody.querySelectorAll('.edit-nav-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        const id = String(btn.getAttribute('data-nav-tab-id') || '');
        const tab = tabs.find((item) => String(item.id) === id);
        if (tab) loadNavTabIntoEditor(tab);
      });
    });
    els.navTabsTableBody.querySelectorAll('.empty-new-nav-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        setTenantWorkspaceView('nav-tabs');
        clearNavTabEditor();
        setNotice(els.cmsNotice, 'Creating a new navigation tab.', 'ok');
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
    renderTenantModuleAccessControls();
    renderTenantSiteSectionsControls();
    if (!tenant) {
      els.cmsContentEmpty.classList.remove('hidden');
      els.cmsContentPanel.classList.add('hidden');
      els.cmsContentEmpty.innerHTML = 'Select a tenant above, then open a workspace module (Articles, Libraries, Annual Reports, or Navigation Tabs) to start editing customer content.';
      els.mediaTableBody.innerHTML = '<tr><td colspan="4" class="meta">Select a tenant to load media.</td></tr>';
      els.articleTableBody.innerHTML = '<tr><td colspan="5" class="meta">Select a tenant to load articles.</td></tr>';
      if (els.navTabsTableBody) {
        els.navTabsTableBody.innerHTML = '<tr><td colspan="6" class="meta">Select a tenant to load navigation tabs.</td></tr>';
      }
      setSiteNavBuilderEmptyState();
      clearArticleEditor();
      clearNavTabEditor();
      return;
    }
    els.cmsContentEmpty.classList.add('hidden');
    els.cmsContentEmpty.textContent = 'Select a tenant above to manage that customer’s CMS articles and media library.';
    els.cmsContentPanel.classList.remove('hidden');
    const moduleAccess = getCurrentTenantModuleAccess();
    if (els.tenantContentOpenArticlesBtn) els.tenantContentOpenArticlesBtn.disabled = moduleAccess.articles === false;
    if (els.tenantContentOpenLibraryBtn) els.tenantContentOpenLibraryBtn.disabled = moduleAccess.libraries === false;
    if (els.tenantContentOpenHomepageBtn) els.tenantContentOpenHomepageBtn.disabled = moduleAccess.homepagePlacements === false;

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
                  <button class="delete-media-btn btn-danger" data-media-id="${item.id}">Delete</button>
                </div>
              </td>
            </tr>
          `)
          .join('')
      : '<tr><td colspan="4" class="meta">No files yet. Upload an image or PDF to start the tenant library. <button type="button" class="empty-upload-media-btn">Choose file</button></td></tr>';

    els.mediaTableBody.querySelectorAll('.delete-media-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        handleDeleteTenantMedia(btn.getAttribute('data-media-id'));
      });
    });
    els.mediaTableBody.querySelectorAll('.empty-upload-media-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        els.mediaUploadInput?.click();
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
                  <button class="edit-article-btn btn-edit" data-article-id="${article.id}">Edit</button>
                  ${article.status === 'published' && articlePublicHref(article) !== '#'
                    ? `<a href="${escapeHtml(articlePublicHref(article))}" target="_blank" rel="noopener noreferrer" class="pill" style="text-decoration:none;">Open</a>`
                    : ''}
                </div>
              </td>
            </tr>
          `)
          .join('')
      : '<tr><td colspan="5" class="meta">No articles yet. Create the first article to populate the tenant news page. <button type="button" class="empty-new-article-btn">Create article</button></td></tr>';

    els.articleTableBody.querySelectorAll('.edit-article-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        setTenantWorkspaceView('articles');
        const id = Number(btn.getAttribute('data-article-id'));
        const article = articles.find((a) => a.id === id);
        if (article) loadArticleIntoEditor(article);
      });
    });
    els.articleTableBody.querySelectorAll('.empty-new-article-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        setTenantWorkspaceView('articles');
        clearArticleEditor();
        setNotice(els.cmsNotice, 'Creating a new article.', 'ok');
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
                  <button class="edit-annual-btn btn-edit" data-annual-id="${item.id}">Edit</button>
                  ${item.fileUrl ? `<a href="${escapeHtml(item.fileUrl)}" target="_blank" rel="noopener noreferrer" class="pill" style="text-decoration:none;">PDF</a>` : ''}
                </div>
              </td>
            </tr>
          `)
          .join('')
      : '<tr><td colspan="4" class="meta">No annual reports yet. Add a year and attach a PDF from the library. <button type="button" class="empty-new-annual-btn">Create annual report</button></td></tr>';
    els.annualTableBody.querySelectorAll('.edit-annual-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        setTenantWorkspaceView('annual-reports');
        const id = Number(btn.getAttribute('data-annual-id'));
        const item = annualReports.find((a) => a.id === id);
        if (item) loadAnnualReportIntoEditor(item);
      });
    });
    els.annualTableBody.querySelectorAll('.empty-new-annual-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        setTenantWorkspaceView('annual-reports');
        clearAnnualReportEditor();
        setNotice(els.cmsNotice, 'Creating a new annual report entry.', 'ok');
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
    renderSiteNavigationBuilder();
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
      els.placementEmpty.innerHTML = 'Select a tenant first, then create content items and assign them into the homepage News & Promotions slot.';
      els.assignContentItem.innerHTML = '<option value="">Select item…</option>';
      els.assignmentTableBody.innerHTML = '<tr><td colspan="5" class="meta">Select a tenant to load assignments.</td></tr>';
      els.contentTableBody.innerHTML = '<tr><td colspan="3" class="meta">Select a tenant to load content items.</td></tr>';
      return;
    }

    els.placementEmpty.classList.add('hidden');
    els.placementEmpty.textContent = 'Select a tenant above to manage homepage news/promotions items and placement.';
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
      : '<tr><td colspan="3" class="meta">No slot content items yet. Start with “Create item” on the left, then assign it to a homepage tab.</td></tr>';

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
      : '<tr><td colspan="5" class="meta">No assignments yet. Create an item, then use “Assign to slot” to publish it on the homepage section.</td></tr>';

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
          ? `Verified${payload?.domain?.verifiedAt ? ` at ${formatDateTime(payload.domain.verifiedAt)}` : ''}`
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
    const indicatorClassFor = (status) => {
      if (status === 'pass') return 'ok';
      if (status === 'fail') return 'fail';
      return '';
    };

    els.tenantDomainChecklist.innerHTML = checks.map((item) => `
      <div class="checklist-row">
        <span class="check-indicator ${indicatorClassFor(item.status)}">${iconFor(item.status)}</span>
        <div>
          <div style="font-size:12px; color:#0f172a; font-weight:600;">${escapeHtml(item.label)}</div>
          <div class="meta" style="margin-top:2px; font-size:11px;">${escapeHtml(item.detail || '')}</div>
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
      els.tenantDomainLastChecked.textContent = checkedAt ? `Last checked: ${formatDateTime(checkedAt)}` : '';
    }
    if (els.tenantDomainInstructions) {
      els.tenantDomainInstructions.value = formatDomainInstructionsText(payload?.instructions || null);
    }
    renderDomainProvisioningChecklist(tenant, payload);
    renderTenantContextHeader(tenant);
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

  function resetTenantUsersState() {
    state.tenantUsers.rows = [];
    state.tenantUsers.loading = false;
    state.tenantUsers.saving = false;
    renderTenantUsersPanel();
  }

  function resetTenantUserForm() {
    if (els.tenantUserEmail) els.tenantUserEmail.value = '';
    if (els.tenantUserPassword) els.tenantUserPassword.value = '';
    if (els.tenantUserRole) els.tenantUserRole.value = 'admin';
    if (els.tenantUserStatus) els.tenantUserStatus.value = 'active';
    if (els.tenantUserMembershipStatus) els.tenantUserMembershipStatus.value = 'active';
  }

  function tenantUsersSummaryText(tenant, rows) {
    if (!tenant) return 'Select a tenant to load users';
    const items = Array.isArray(rows) ? rows : [];
    if (!items.length) return 'No tenant users yet';
    const activeMemberships = items.filter((row) => row?.membership?.status === 'active').length;
    const disabledMemberships = items.filter((row) => row?.membership?.status !== 'active').length;
    return `${items.length} users • ${activeMemberships} active • ${disabledMemberships} disabled`;
  }

  function renderTenantUserSelectOptions(values, currentValue) {
    const current = String(currentValue || '');
    return values.map((value) => `
      <option value="${escapeHtml(value)}" ${value === current ? 'selected' : ''}>${escapeHtml(value)}</option>
    `).join('');
  }

  function renderTenantUsersPanel() {
    const tenant = getSelectedTenant();
    const rows = Array.isArray(state.tenantUsers.rows) ? state.tenantUsers.rows : [];
    const loading = Boolean(state.tenantUsers.loading);

    if (els.tenantUsersSummary) {
      els.tenantUsersSummary.innerHTML = loading
        ? renderLoadingInline('Loading users…')
        : escapeHtml(tenantUsersSummaryText(tenant, rows));
    }

    [
      els.tenantUserEmail,
      els.tenantUserPassword,
      els.tenantUserRole,
      els.tenantUserStatus,
      els.tenantUserMembershipStatus,
      els.tenantUserCreateBtn,
      els.tenantUserFormResetBtn,
      els.tenantUsersRefreshBtn,
    ].filter(Boolean).forEach((el) => {
      el.disabled = !tenant || (loading && el !== els.tenantUsersRefreshBtn);
    });

    if (!els.tenantUsersTableBody) return;
    if (!tenant) {
      els.tenantUsersTableBody.innerHTML = '<tr><td colspan="6" class="meta">Select a tenant to manage users.</td></tr>';
      return;
    }
    if (loading) {
      els.tenantUsersTableBody.innerHTML = `<tr><td colspan="6">${renderLoadingRow('Loading tenant users…')}</td></tr>`;
      return;
    }
    if (!rows.length) {
      els.tenantUsersTableBody.innerHTML = '<tr><td colspan="6" class="meta">No tenant users yet. Create one above to enable tenant login.</td></tr>';
      return;
    }

    const allowedRoles = Array.isArray(state.tenantUsers.allowedRoles) && state.tenantUsers.allowedRoles.length
      ? state.tenantUsers.allowedRoles
      : [...TENANT_USER_ROLES];
    const allowedStatuses = Array.isArray(state.tenantUsers.allowedStatuses) && state.tenantUsers.allowedStatuses.length
      ? state.tenantUsers.allowedStatuses
      : [...TENANT_USER_STATUSES];

    els.tenantUsersTableBody.innerHTML = rows.map((row) => {
      const membership = row.membership || {};
      const userStatus = row.userStatus || 'active';
      const membershipStatus = membership.status || 'active';
      const updatedAt = membership.updatedAt || row.userUpdatedAt || row.userCreatedAt;
      const flags = [
        row.isPlatformAdmin ? '<span class="pill">platform admin</span>' : '',
        row.hasPassword ? '<span class="pill ok">password set</span>' : '<span class="pill">no password</span>',
      ].filter(Boolean).join(' ');
      return `
        <tr data-tenant-user-row data-user-id="${row.id}">
          <td>
            <div style="font-weight:600; color:#0f172a;">${escapeHtml(row.email || '')}</div>
            <div class="meta" style="margin-top:4px;">${flags || '-'}</div>
          </td>
          <td>
            <select data-tenant-user-field="userStatus">
              ${renderTenantUserSelectOptions(allowedStatuses, userStatus)}
            </select>
          </td>
          <td>
            <select data-tenant-user-field="role">
              ${renderTenantUserSelectOptions(allowedRoles, membership.role || 'admin')}
            </select>
          </td>
          <td>
            <select data-tenant-user-field="membershipStatus">
              ${renderTenantUserSelectOptions(allowedStatuses, membershipStatus)}
            </select>
          </td>
          <td class="meta">
            ${updatedAt ? escapeHtml(formatDateTime(updatedAt)) : '-'}
          </td>
          <td>
            <div class="actions" style="margin:0; gap:6px;">
              <button type="button" class="btn-edit btn-equal" data-tenant-user-action="save">Save</button>
              <button type="button" class="btn-equal" data-tenant-user-action="password">Set Password</button>
              <button type="button" class="btn-danger btn-equal" data-tenant-user-action="remove">Remove</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function loadTenantUsers() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      resetTenantUsersState();
      return;
    }
    state.tenantUsers.loading = true;
    renderTenantUsersPanel();
    try {
      const data = await api(`/api/platform/tenant-users?tenantId=${tenant.id}`, { method: 'GET' });
      state.tenantUsers.rows = Array.isArray(data?.users) ? data.users : [];
      state.tenantUsers.allowedRoles = Array.isArray(data?.allowedRoles) && data.allowedRoles.length ? data.allowedRoles : [...TENANT_USER_ROLES];
      state.tenantUsers.allowedStatuses = Array.isArray(data?.allowedStatuses) && data.allowedStatuses.length ? data.allowedStatuses : [...TENANT_USER_STATUSES];
      renderTenantUsersPanel();
    } catch (err) {
      state.tenantUsers.rows = [];
      renderTenantUsersPanel();
      setNotice(els.tenantUsersNotice, err.message || 'Failed to load tenant users', 'error');
    } finally {
      state.tenantUsers.loading = false;
      renderTenantUsersPanel();
    }
  }

  async function handleCreateTenantUser() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.tenantUsersNotice, 'Select a tenant first.', 'error');
      return;
    }
    const email = String(els.tenantUserEmail?.value || '').trim().toLowerCase();
    const password = String(els.tenantUserPassword?.value || '');
    if (!email) {
      setNotice(els.tenantUsersNotice, 'Email is required.', 'error');
      return;
    }
    if (!password) {
      setNotice(els.tenantUsersNotice, 'Password is required.', 'error');
      return;
    }
    if (els.tenantUserCreateBtn) els.tenantUserCreateBtn.disabled = true;
    try {
      const res = await api('/api/platform/tenant-users', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: tenant.id,
          email,
          password,
          role: els.tenantUserRole?.value || 'admin',
          userStatus: els.tenantUserStatus?.value || 'active',
          membershipStatus: els.tenantUserMembershipStatus?.value || 'active',
        }),
      });
      resetTenantUserForm();
      setNotice(els.tenantUsersNotice, `Tenant user saved: ${res?.user?.email || email}`, 'ok');
      await loadTenants();
      state.selectedTenantId = tenant.id;
      renderTenants();
      await loadTenantUsers();
    } catch (err) {
      setNotice(els.tenantUsersNotice, err.message || 'Failed to save tenant user', 'error');
    } finally {
      if (els.tenantUserCreateBtn) els.tenantUserCreateBtn.disabled = false;
    }
  }

  function getTenantUserRowValues(rowEl) {
    return {
      userStatus: rowEl?.querySelector('[data-tenant-user-field="userStatus"]')?.value || 'active',
      role: rowEl?.querySelector('[data-tenant-user-field="role"]')?.value || 'admin',
      membershipStatus: rowEl?.querySelector('[data-tenant-user-field="membershipStatus"]')?.value || 'active',
    };
  }

  async function handleSaveTenantUserRow(userId, rowEl) {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.tenantUsersNotice, 'Select a tenant first.', 'error');
      return;
    }
    const id = Number(userId);
    if (!Number.isFinite(id) || id <= 0) return;
    const values = getTenantUserRowValues(rowEl);
    const actionButtons = Array.from(rowEl?.querySelectorAll('button') || []);
    actionButtons.forEach((btn) => { btn.disabled = true; });
    try {
      const res = await api(`/api/platform/tenant-users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          tenantId: tenant.id,
          ...values,
        }),
      });
      setNotice(els.tenantUsersNotice, `Updated ${res?.user?.email || 'tenant user'}.`, 'ok');
      await loadTenantUsers();
      await loadTenants();
      state.selectedTenantId = tenant.id;
      renderTenants();
    } catch (err) {
      setNotice(els.tenantUsersNotice, err.message || 'Failed to update tenant user', 'error');
    } finally {
      actionButtons.forEach((btn) => { btn.disabled = false; });
    }
  }

  async function handleSetTenantUserPassword(userId, rowEl) {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.tenantUsersNotice, 'Select a tenant first.', 'error');
      return;
    }
    const id = Number(userId);
    if (!Number.isFinite(id) || id <= 0) return;
    const currentEmail = rowEl?.querySelector('td')?.innerText?.split('\n')[0]?.trim() || `user #${id}`;
    const password = window.prompt(`Set a new password for ${currentEmail}`, '');
    if (password === null) return;
    const nextPassword = String(password);
    if (!nextPassword) {
      setNotice(els.tenantUsersNotice, 'Password update cancelled (empty password).', 'error');
      return;
    }
    const actionButtons = Array.from(rowEl?.querySelectorAll('button') || []);
    actionButtons.forEach((btn) => { btn.disabled = true; });
    try {
      await api(`/api/platform/tenant-users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          tenantId: tenant.id,
          password: nextPassword,
        }),
      });
      setNotice(els.tenantUsersNotice, `Password updated for ${currentEmail}.`, 'ok');
      await loadTenantUsers();
    } catch (err) {
      setNotice(els.tenantUsersNotice, err.message || 'Failed to update password', 'error');
    } finally {
      actionButtons.forEach((btn) => { btn.disabled = false; });
    }
  }

  async function handleRemoveTenantUser(userId, rowEl) {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.tenantUsersNotice, 'Select a tenant first.', 'error');
      return;
    }
    const id = Number(userId);
    if (!Number.isFinite(id) || id <= 0) return;
    const currentEmail = rowEl?.querySelector('td')?.innerText?.split('\n')[0]?.trim() || `user #${id}`;
    if (!window.confirm(`Remove tenant access for ${currentEmail}?`)) return;
    const actionButtons = Array.from(rowEl?.querySelectorAll('button') || []);
    actionButtons.forEach((btn) => { btn.disabled = true; });
    try {
      await api(`/api/platform/tenant-users/${id}?tenantId=${tenant.id}`, { method: 'DELETE' });
      setNotice(els.tenantUsersNotice, `Removed tenant access for ${currentEmail}.`, 'ok');
      await loadTenantUsers();
      await loadTenants();
      state.selectedTenantId = tenant.id;
      renderTenants();
    } catch (err) {
      setNotice(els.tenantUsersNotice, err.message || 'Failed to remove tenant access', 'error');
    } finally {
      actionButtons.forEach((btn) => { btn.disabled = false; });
    }
  }

  function renderSelectedTenant() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      els.selectedTenantEmpty.classList.remove('hidden');
      els.selectedTenantForm.classList.add('hidden');
      els.selectedTenantMeta.textContent = '';
      renderTenantContextHeader(null);
      setNotice(els.tenantDomainProvisionNotice, '', '');
      renderPlacementPanel();
      resetDomainProvisioningState();
      resetTenantUsersState();
      resetTenantFormTracking();
      renderCmsPanel();
      return;
    }

    els.selectedTenantEmpty.classList.add('hidden');
    els.selectedTenantForm.classList.remove('hidden');
    const tenantChanged = state.tenantForm.loadedTenantId !== tenant.id;
    const shouldPopulateForm =
      tenantChanged ||
      !state.tenantForm.dirty ||
      !state.tenantForm.snapshot;
    if (shouldPopulateForm) {
      els.editName.value = tenant.name || '';
      els.editStatus.value = tenant.status || 'active';
      els.editSlug.value = tenant.slug || '';
      els.editPrimaryColor.value = tenant.branding?.primaryColor || '';
      els.editLogoUrl.value = tenant.branding?.logoUrl || '';
      els.editPublicSiteUrl.value = tenant.branding?.publicSiteUrl || '';
      els.editCmsDomain.value = tenant.branding?.cmsDomain || '';
      els.editSupportEmail.value = tenant.branding?.supportEmail || '';
      state.tenantForm.loadedTenantId = tenant.id;
      state.tenantForm.snapshot = getTenantFormSnapshot();
      state.tenantForm.dirty = false;
      if (tenantChanged) {
        state.tenantForm.lastSavedAt = null;
        state.tenantForm.lastSaveMessage = '';
      }
      clearTenantFormValidation();
    }
    syncPrimaryColorControls();
    if (tenantChanged) {
      resetTenantUserForm();
      setNotice(els.tenantUsersNotice, '', '');
    }
    els.selectedTenantMeta.textContent =
      `Created: ${formatDateTime(tenant.createdAt)} • Updated: ${formatDateTime(tenant.updatedAt)}`;
    renderTenantContextHeader(tenant);
    renderTenantFormState();
    setTenantSettingsTab(state.tenantSettingsTab || 'branding');
    renderDomainProvisioningPanel();
    renderTenantUsersPanel();
    renderPlacementPanel();
    renderCmsPanel();
  }

  function renderTenants() {
    const allRows = Array.isArray(state.tenants) ? state.tenants : [];
    const rows = getFilteredTenants();
    if (els.tenantListSummary) {
      els.tenantListSummary.textContent = summarizeTenantList(rows, allRows);
    }

    if (!allRows.length) {
      els.tenantTableBody.innerHTML = '<tr><td colspan="4" class="meta">No tenants yet.</td></tr>';
      renderTenantSwitcher();
      renderSelectedTenant();
      return;
    }

    if (!rows.length) {
      els.tenantTableBody.innerHTML = '<tr><td colspan="4" class="meta">No tenants match the current search/filter. Clear filters to view all customers.</td></tr>';
      renderTenantSwitcher();
      renderSelectedTenant();
      return;
    }

    els.tenantTableBody.innerHTML = rows
      .map((tenant) => {
        const selected = tenant.id === state.selectedTenantId ? 'selected' : '';
        const domainStatus = inferTenantDomainState(tenant);
        const domainPillClass = domainStatus === 'verified' ? 'pill ok' : 'pill';
        return `
          <tr class="tenant-row ${selected}" data-tenant-id="${tenant.id}">
            <td>
              <div class="tenant-name">${escapeHtml(tenant.name)}</div>
              <div class="tenant-slug">${escapeHtml(tenant.slug)}</div>
            </td>
            <td><span class="pill ${tenant.status === 'active' ? 'ok' : ''}">${escapeHtml(tenant.status)}</span></td>
            <td class="meta">${tenant.articleCount} articles • ${tenant.contentItemCount || 0} items • ${tenant.mediaCount} media • ${tenant.userCount} users</td>
            <td class="meta">
              ${tenant.branding?.cmsDomain ? `CMS: ${escapeHtml(tenant.branding.cmsDomain)} <span class="${domainPillClass}" style="margin-left:6px;">${escapeHtml(domainStatus)}</span>` : 'No CMS domain'}<br />
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
        await loadTenantUsers();
        await loadTenantCmsContent();
      });
    });

    if (!getSelectedTenant() && allRows[0]) {
      state.selectedTenantId = allRows[0].id;
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
    const email = user.email || 'Unknown';
    const role = user.platformRole || 'platform user';
    if (els.authEmail && els.authRole && els.authAvatar) {
      if (els.authPill) els.authPill.classList.remove('is-loading');
      els.authEmail.textContent = email;
      els.authEmail.title = email;
      els.authRole.textContent = role;
      els.authAvatar.textContent = String(email).trim().charAt(0).toUpperCase() || '?';
    } else if (els.authPill) {
      els.authPill.textContent = `${email}${role ? ` • ${role}` : ''}`;
    }
    showApp();
    return true;
  }

  async function loadTenants() {
    try {
      setNotice(els.appNotice, '', '');
      if (els.tenantListSummary) {
        els.tenantListSummary.innerHTML = renderLoadingInline('Loading tenants…');
      }
      if (els.tenantTableBody) {
        els.tenantTableBody.innerHTML = `<tr><td colspan="4">${renderLoadingRow('Loading tenants…')}</td></tr>`;
      }
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
      state.cms.siteNavigation = normalizeClientSiteNavigation(tenantSettings?.siteNavigation);
      state.cms.siteSections = normalizeSiteSections(tenantSettings?.siteSections);
      state.cms.siteSectionsSnapshot = JSON.parse(JSON.stringify(state.cms.siteSections));
      state.cms.moduleAccess = normalizeTenantModuleAccess(tenantSettings?.moduleAccess);
      state.cms.moduleAccessSnapshot = { ...state.cms.moduleAccess };

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
      if (state.cms.siteNavSelection?.topId) {
        const topId = String(state.cms.siteNavSelection.topId);
        const hasTop = (state.cms.siteNavigation?.primary || []).some((item) => String(item.id) === topId);
        if (!hasTop) state.cms.siteNavSelection.topId = null;
      }
      if (state.cms.siteNavSelection?.columnId) {
        const selectedTop = getSelectedSiteNavTopItem();
        const colId = String(state.cms.siteNavSelection.columnId);
        const hasCol = Boolean(selectedTop && Array.isArray(selectedTop.columns) && selectedTop.columns.some((col) => String(col.id) === colId));
        if (!hasCol) state.cms.siteNavSelection.columnId = null;
      }
      renderTenantModuleAccessControls();
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
      renderTenantModuleAccessControls();
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
    state.cms.siteNavigation = normalizeClientSiteNavigation(res.siteNavigation || state.cms.siteNavigation);
    state.cms.siteSections = normalizeSiteSections(res.siteSections || state.cms.siteSections);
    state.cms.siteSectionsSnapshot = JSON.parse(JSON.stringify(state.cms.siteSections));
    state.cms.moduleAccess = normalizeTenantModuleAccess(res.moduleAccess || state.cms.moduleAccess);
    state.cms.moduleAccessSnapshot = { ...state.cms.moduleAccess };
    renderTenantModuleAccessControls();
    renderTenantSiteSectionsControls();
    renderNavTabsPanel();
    renderSiteNavigationBuilder();
    if (successMessage) setNotice(els.cmsNotice, successMessage, 'ok');
    return state.cms.navTabs;
  }

  async function handleSaveTenantModuleAccess() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.tenantModuleAccessNotice, 'Select a tenant first.', 'error');
      return;
    }
    const moduleAccess = collectTenantModuleAccessFromControls();
    if (els.tenantModuleAccessSaveBtn) els.tenantModuleAccessSaveBtn.disabled = true;
    try {
      const res = await tenantApi('/api/tenant/settings', {
        method: 'PUT',
        body: JSON.stringify({ moduleAccess }),
      });
      setTenantModuleAccessLocal(res.moduleAccess || moduleAccess, { markSaved: true });
      setTenantSiteSectionsLocal(res.siteSections || state.cms.siteSections, { markSaved: true });
      setNotice(els.tenantModuleAccessNotice, 'Tenant module access saved. Tenant view sidebar and dashboard will reflect these settings.', 'ok');
      renderCmsPanel();
    } catch (err) {
      setNotice(els.tenantModuleAccessNotice, err.message || 'Failed to save tenant module access', 'error');
    } finally {
      renderTenantModuleAccessControls();
    }
  }

  function handleResetTenantModuleAccess() {
    const snapshot = normalizeTenantModuleAccess(state.cms?.moduleAccessSnapshot || DEFAULT_TENANT_MODULE_ACCESS);
    setTenantModuleAccessLocal(snapshot, { markSaved: false });
    setNotice(els.tenantModuleAccessNotice, 'Module access changes reset to last saved values.', 'ok');
  }

  async function handleSaveTenantSiteSections() {
    const tenant = getSelectedTenant();
    if (!tenant) {
      setNotice(els.tenantSiteSectionsNotice, 'Select a tenant first.', 'error');
      return;
    }
    const siteSections = collectSiteSectionsFromControls();
    if (els.tenantSiteSectionsSaveBtn) els.tenantSiteSectionsSaveBtn.disabled = true;
    try {
      const res = await tenantApi('/api/tenant/settings', {
        method: 'PUT',
        body: JSON.stringify({ siteSections }),
      });
      setTenantSiteSectionsLocal(res.siteSections || siteSections, { markSaved: true });
      setNotice(els.tenantSiteSectionsNotice, 'Public site section controls saved. Tenant public API now reflects these values.', 'ok');
    } catch (err) {
      setNotice(els.tenantSiteSectionsNotice, err.message || 'Failed to save section controls', 'error');
    } finally {
      renderTenantSiteSectionsControls();
    }
  }

  function handleResetTenantSiteSections() {
    const snapshot = normalizeSiteSections(state.cms?.siteSectionsSnapshot || DEFAULT_SITE_SECTIONS);
    setTenantSiteSectionsLocal(snapshot, { markSaved: false });
    setNotice(els.tenantSiteSectionsNotice, 'Section controls reset to last saved values.', 'ok');
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
        await loadPlatformBackups();
        await loadTenants();
        await loadHomepagePlacement();
        await loadTenantDomainProvisioning();
        await loadTenantUsers();
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
    resetTenantUsersState();
    resetTenantFormTracking();
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
      await loadTenantUsers();
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
    const validation = validateTenantForm();
    if (!validation.valid) {
      renderTenantFormState();
      return;
    }
    state.tenantForm.isSaving = true;
    state.tenantForm.lastSaveMessage = 'Saving…';
    renderTenantFormState();
    try {
      const updated = await api(`/api/platform/tenants/${tenant.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: validation.values.name,
          status: els.editStatus.value,
          branding: {
            primaryColor: validation.values.primaryColor || null,
            logoUrl: validation.values.logoUrl || null,
            publicSiteUrl: validation.values.publicSiteUrl || null,
            cmsDomain: validation.values.cmsDomain || null,
            supportEmail: validation.values.supportEmail || null,
          },
        }),
      });
      setNotice(els.appNotice, `Tenant updated: ${updated.name}`, 'ok');
      markTenantFormPristine(`Saved ${updated.name}`);
      await loadTenants();
      state.selectedTenantId = updated.id;
      renderTenants();
      await loadTenantDomainProvisioning();
      await loadTenantUsers();
    } catch (err) {
      state.tenantForm.lastSaveMessage = 'Save failed';
      renderTenantFormState();
      setNotice(els.appNotice, err.message || 'Failed to save tenant', 'error');
    } finally {
      state.tenantForm.isSaving = false;
      renderTenantFormState();
    }
  }

  function handleDiscardTenantChanges() {
    const tenant = getSelectedTenant();
    if (!tenant || !state.tenantForm.snapshot) return;
    const snapshot = state.tenantForm.snapshot;
    if (els.editName) els.editName.value = snapshot.name || '';
    if (els.editStatus) els.editStatus.value = snapshot.status || 'active';
    if (els.editPrimaryColor) els.editPrimaryColor.value = snapshot.primaryColor || '';
    if (els.editLogoUrl) els.editLogoUrl.value = snapshot.logoUrl || '';
    if (els.editPublicSiteUrl) els.editPublicSiteUrl.value = snapshot.publicSiteUrl || '';
    if (els.editCmsDomain) els.editCmsDomain.value = snapshot.cmsDomain || '';
    if (els.editSupportEmail) els.editSupportEmail.value = snapshot.supportEmail || '';
    syncPrimaryColorControls();
    clearTenantFormValidation();
    state.tenantForm.dirty = false;
    state.tenantForm.lastSaveMessage = 'Changes discarded';
    state.tenantForm.lastSavedAt = null;
    renderTenantFormState();
    renderTenantContextHeader(getSelectedTenant());
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
    normalizeWorkbenchLayout();
    applyPlatformNavAccordionState();
    if (els.platformNavSearchInput) {
      els.platformNavSearchInput.addEventListener('input', () => {
        applyPlatformNavSearch(els.platformNavSearchInput.value || '');
      });
      els.platformNavSearchInput.addEventListener('search', () => {
        applyPlatformNavSearch(els.platformNavSearchInput.value || '');
      });
    }
    applyUiMode();
    setTenantSettingsTab(state.tenantSettingsTab || 'branding');
    if (els.tenantSearchInput) els.tenantSearchInput.value = state.tenantFilters.search || '';
    if (els.tenantStatusFilter) els.tenantStatusFilter.value = state.tenantFilters.status || 'all';
    renderTenantFormState();
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
    platformNavMenuToggleButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const menu = btn.dataset.navMenuToggle || '';
        if (!menu) return;
        const block = platformNavMenuBlocks.find((item) => item.dataset.navMenu === menu);
        const isCollapsed = block ? block.classList.contains('is-collapsed') : true;
        if (isCollapsed) {
          setPlatformNavMenuOpen(menu, true, { closeOthers: true });
        } else {
          setPlatformNavMenuOpen(menu, false, { closeOthers: false });
        }
      });
    });
    if (els.adminSubnavList) {
      els.adminSubnavList.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-admin-subnav-id]');
        if (!btn) return;
        const main = btn.dataset.adminSubnavMain || state.adminNav?.main || 'tenants';
        const sub = btn.dataset.adminSubnavId || '';
        setAdminNav({ main, sub });
      });
    }
    sidebarNavLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const hash = link.getAttribute('href') || '';
        if (!hash.startsWith('#')) return;
        const isPlatformAdminLink = Boolean(link.closest('#sidebar-platform-group'));
        const requestedSub = link.dataset.adminSubLink || '';
        const requestedMain = link.dataset.adminMainLink
          || (isPlatformAdminLink ? (link.closest('[data-nav-menu]')?.dataset?.navMenu || '') : '');
        if (requestedMain && state.uiMode !== 'tenant') {
          event.preventDefault();
          navigateAdminRoute(requestedMain, requestedSub, link.dataset.tenantSettingsTab || '', {
            focus: !requestedSub,
            behavior: 'auto',
          });
          return;
        }
        event.preventDefault();

        const requestedUiMode = link.dataset.uiMode || '';
        const requestedWorkspaceView = link.dataset.workspaceView || '';
        const requestedTenantSettingsTab = link.dataset.tenantSettingsTab || '';
        const isTenantWorkspaceLink = Boolean(requestedWorkspaceView);
        if (requestedUiMode === 'admin' && state.uiMode !== 'admin') {
          setUiMode('admin');
        } else if (isTenantWorkspaceLink && state.uiMode !== 'tenant') {
          setUiMode('tenant');
        }
        if (requestedWorkspaceView) {
          setTenantWorkspaceView(requestedWorkspaceView);
        }
        if (requestedTenantSettingsTab) {
          setTenantSettingsTab(requestedTenantSettingsTab);
        }
        if (state.uiMode !== 'tenant' && !isPlatformAdminLink) {
          expandPlatformNavMenuForLink(link);
        }

        requestAnimationFrame(() => scrollToSectionHash(hash));
      });
    });
    nonSidebarCmsHashLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const hash = link.getAttribute('href') || '';
        if (!hash.startsWith('#')) return;
        const requestedMain = link.dataset.adminMainLink || '';
        if (requestedMain) {
          event.preventDefault();
          if (state.uiMode !== 'admin') setUiMode('admin');
          navigateAdminRoute(requestedMain, link.dataset.adminSubLink || '', link.dataset.tenantSettingsTab || '', {
            focus: true,
            behavior: 'smooth',
          });
          return;
        }
        const requestedWorkspaceView = link.dataset.workspaceView || '';
        if (requestedWorkspaceView) {
          event.preventDefault();
          if (state.uiMode !== 'tenant') setUiMode('tenant');
          setTenantWorkspaceView(requestedWorkspaceView);
          requestAnimationFrame(() => scrollToSectionHash(hash));
        }
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
    if (els.tenantSearchInput) {
      els.tenantSearchInput.addEventListener('input', () => {
        state.tenantFilters.search = els.tenantSearchInput.value || '';
        renderTenants();
      });
    }
    if (els.tenantStatusFilter) {
      els.tenantStatusFilter.addEventListener('change', () => {
        state.tenantFilters.status = els.tenantStatusFilter.value || 'all';
        renderTenants();
      });
    }
    if (els.tenantFilterClearBtn) {
      els.tenantFilterClearBtn.addEventListener('click', () => {
        state.tenantFilters.search = '';
        state.tenantFilters.status = 'all';
        if (els.tenantSearchInput) els.tenantSearchInput.value = '';
        if (els.tenantStatusFilter) els.tenantStatusFilter.value = 'all';
        renderTenants();
      });
    }
    tenantSettingsTabButtons.forEach((btn) => {
      btn.addEventListener('click', () => setTenantSettingsTab(btn.dataset.tenantSettingsTab || 'branding'));
    });
    [
      els.tenantModuleHomepagePlacements,
      els.tenantModuleArticles,
      els.tenantModuleLibraries,
      els.tenantModuleAnnualReports,
      els.tenantModuleNavigationTabs,
    ].filter(Boolean).forEach((input) => {
      input.addEventListener('change', () => {
        setTenantModuleAccessLocal(collectTenantModuleAccessFromControls(), { markSaved: false });
      });
    });
    [
      els.tenantSiteHomeInsightsEnabled,
      els.tenantSiteHomeInsightsNavbarEnabled,
      els.tenantSiteHomeInsightsNavbarOrder,
      els.tenantSiteHomeInsightsEyebrow,
      els.tenantSiteHomeInsightsTitle,
      els.tenantSiteHomeInsightsSubtitle,
    ].filter(Boolean).forEach((input) => {
      input.addEventListener('input', () => {
        setTenantSiteSectionsLocal(collectSiteSectionsFromControls(), { markSaved: false });
      });
      input.addEventListener('change', () => {
        setTenantSiteSectionsLocal(collectSiteSectionsFromControls(), { markSaved: false });
      });
    });
    if (els.tenantModuleAccessSaveBtn) {
      els.tenantModuleAccessSaveBtn.addEventListener('click', handleSaveTenantModuleAccess);
    }
    if (els.tenantModuleAccessResetBtn) {
      els.tenantModuleAccessResetBtn.addEventListener('click', handleResetTenantModuleAccess);
    }
    if (els.tenantSiteSectionsSaveBtn) {
      els.tenantSiteSectionsSaveBtn.addEventListener('click', handleSaveTenantSiteSections);
    }
    if (els.tenantSiteSectionsResetBtn) {
      els.tenantSiteSectionsResetBtn.addEventListener('click', handleResetTenantSiteSections);
    }
    if (els.tenantContextOpenDomainsTabBtn) {
      els.tenantContextOpenDomainsTabBtn.addEventListener('click', () => {
        setTenantSettingsTab('domains');
        const details = document.getElementById('tenant-domain-provisioning-details');
        if (details) details.open = true;
      });
    }
    if (els.tenantContextOpenContentTabBtn) {
      els.tenantContextOpenContentTabBtn.addEventListener('click', () => setTenantSettingsTab('content'));
    }
    if (els.tenantUsersOpenDomainsBtn) {
      els.tenantUsersOpenDomainsBtn.addEventListener('click', () => setTenantSettingsTab('domains'));
    }
    if (els.tenantUserCreateBtn) {
      els.tenantUserCreateBtn.addEventListener('click', handleCreateTenantUser);
    }
    if (els.tenantUserFormResetBtn) {
      els.tenantUserFormResetBtn.addEventListener('click', () => {
        resetTenantUserForm();
        setNotice(els.tenantUsersNotice, '', '');
      });
    }
    if (els.tenantUsersRefreshBtn) {
      els.tenantUsersRefreshBtn.addEventListener('click', loadTenantUsers);
    }
    if (els.tenantUsersTableBody) {
      els.tenantUsersTableBody.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-tenant-user-action]');
        if (!button) return;
        const rowEl = button.closest('[data-tenant-user-row]');
        const userId = rowEl?.getAttribute('data-user-id');
        if (!userId) return;
        const action = button.dataset.tenantUserAction || '';
        if (action === 'save') {
          handleSaveTenantUserRow(userId, rowEl);
        } else if (action === 'password') {
          handleSetTenantUserPassword(userId, rowEl);
        } else if (action === 'remove') {
          handleRemoveTenantUser(userId, rowEl);
        }
      });
    }
    if (els.tenantContentOpenArticlesBtn) {
      els.tenantContentOpenArticlesBtn.addEventListener('click', () => {
        if (getCurrentTenantModuleAccess().articles === false) return;
        setUiMode('tenant');
        setTenantWorkspaceView('articles');
        requestAnimationFrame(() => scrollToSectionHash('#section-tenant-cms'));
      });
    }
    if (els.tenantContentOpenLibraryBtn) {
      els.tenantContentOpenLibraryBtn.addEventListener('click', () => {
        if (getCurrentTenantModuleAccess().libraries === false) return;
        setUiMode('tenant');
        setTenantWorkspaceView('libraries');
        requestAnimationFrame(() => scrollToSectionHash('#section-tenant-cms'));
      });
    }
    if (els.tenantContentOpenHomepageBtn) {
      els.tenantContentOpenHomepageBtn.addEventListener('click', () => {
        if (getCurrentTenantModuleAccess().homepagePlacements === false) return;
        setUiMode('tenant');
        setTenantWorkspaceView('placements');
        requestAnimationFrame(() => scrollToSectionHash('#section-homepage-slot'));
      });
    }
    [
      els.editName,
      els.editStatus,
      els.editPrimaryColor,
      els.editLogoUrl,
      els.editPublicSiteUrl,
      els.editCmsDomain,
      els.editSupportEmail,
    ].filter(Boolean).forEach((field) => {
      field.addEventListener('input', handleTenantFormChanged);
      field.addEventListener('change', handleTenantFormChanged);
    });
    if (els.editPrimaryColorPicker && els.editPrimaryColor) {
      els.editPrimaryColorPicker.addEventListener('input', () => {
        els.editPrimaryColor.value = normalizeHexColor(els.editPrimaryColorPicker.value);
        handleTenantFormChanged({ target: els.editPrimaryColor });
      });
      els.editPrimaryColorPicker.addEventListener('change', () => {
        els.editPrimaryColor.value = normalizeHexColor(els.editPrimaryColorPicker.value);
        handleTenantFormChanged({ target: els.editPrimaryColor });
      });
    }
    if (Array.isArray(els.editPrimaryColorPresets)) {
      els.editPrimaryColorPresets.forEach((btn) => {
        btn.addEventListener('click', () => {
          const value = normalizeHexColor(btn.dataset.colorPreset || '');
          if (!value || !els.editPrimaryColor) return;
          els.editPrimaryColor.value = value;
          handleTenantFormChanged({ target: els.editPrimaryColor });
        });
      });
    }
    if (els.platformBackupRefreshBtn) els.platformBackupRefreshBtn.addEventListener('click', loadPlatformBackups);
    if (els.platformBackupRunBtn) els.platformBackupRunBtn.addEventListener('click', handleRunPlatformDbBackup);
    els.tenantSwitch.addEventListener('change', async () => {
      const tenantId = Number(els.tenantSwitch.value);
      if (!tenantId || tenantId === state.selectedTenantId) return;
      state.selectedTenantId = tenantId;
      renderTenants();
      await loadHomepagePlacement();
      await loadTenantDomainProvisioning();
      await loadTenantUsers();
      await loadTenantCmsContent();
    });
    els.createTenantBtn.addEventListener('click', handleCreateTenant);
    els.refreshTenantsBtn.addEventListener('click', loadTenants);
    els.reloadSelectedBtn.addEventListener('click', async () => {
      await loadTenants();
      await loadHomepagePlacement();
      await loadTenantDomainProvisioning();
      await loadTenantUsers();
      await loadTenantCmsContent();
    });
    els.saveTenantBtn.addEventListener('click', handleSaveTenant);
    if (els.discardTenantBtn) {
      els.discardTenantBtn.addEventListener('click', handleDiscardTenantChanges);
    }
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
    if (els.siteNavAddLinkBtn) els.siteNavAddLinkBtn.addEventListener('click', () => handleAddSiteNavTop('link'));
    if (els.siteNavAddMegaBtn) els.siteNavAddMegaBtn.addEventListener('click', () => handleAddSiteNavTop('mega'));
    if (els.siteNavRefreshBtn) els.siteNavRefreshBtn.addEventListener('click', loadTenantCmsContent);
    if (els.siteNavSaveBtn) els.siteNavSaveBtn.addEventListener('click', handleSaveSiteNavigation);
    if (els.siteNavEditCtaBtn) els.siteNavEditCtaBtn.addEventListener('click', handleEditSiteNavCta);
    if (els.siteNavClearCtaBtn) els.siteNavClearCtaBtn.addEventListener('click', handleClearSiteNavCta);
    if (els.siteNavColumnAddBtn) els.siteNavColumnAddBtn.addEventListener('click', handleAddSiteNavColumn);
    if (els.siteNavSubitemAddBtn) els.siteNavSubitemAddBtn.addEventListener('click', handleAddSiteNavSubItem);
    if (els.siteNavTopList) {
      els.siteNavTopList.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-site-nav-top-action]');
        if (!btn) return;
        handleSiteNavTopAction(btn.getAttribute('data-site-nav-top-action') || '', btn.getAttribute('data-site-nav-top-id') || '');
      });
    }
    if (els.siteNavColumnsList) {
      els.siteNavColumnsList.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-site-nav-col-action]');
        if (!btn) return;
        handleSiteNavColumnAction(btn.getAttribute('data-site-nav-col-action') || '', btn.getAttribute('data-site-nav-col-id') || '');
      });
    }
    if (els.siteNavSubitemsList) {
      els.siteNavSubitemsList.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-site-nav-sub-action]');
        if (!btn) return;
        handleSiteNavSubItemAction(btn.getAttribute('data-site-nav-sub-action') || '', btn.getAttribute('data-site-nav-sub-id') || '');
      });
    }
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
        await loadPlatformBackups();
        await loadTenants();
        await loadHomepagePlacement();
        await loadTenantDomainProvisioning();
        await loadTenantUsers();
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
