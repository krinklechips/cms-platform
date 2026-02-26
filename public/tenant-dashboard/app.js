(function () {
  const els = {
    loadingView: document.getElementById('loading-view'),
    appView: document.getElementById('app-view'),
    appNotice: document.getElementById('app-notice'),
    refreshBtn: document.getElementById('refresh-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    tenantMark: document.getElementById('tenant-mark'),
    tenantName: document.getElementById('tenant-name'),
    tenantSlug: document.getElementById('tenant-slug'),
    tenantHostPill: document.getElementById('tenant-host-pill'),
    sessionChip: document.getElementById('session-chip'),
    dashboardSubtitle: document.getElementById('dashboard-subtitle'),
    metricsGrid: document.getElementById('metrics-grid'),
    metricCardArticles: document.getElementById('metric-card-articles'),
    metricCardMedia: document.getElementById('metric-card-media'),
    metricCardAnnual: document.getElementById('metric-card-annual'),
    metricCardSlot: document.getElementById('metric-card-slot'),
    metricArticles: document.getElementById('metric-articles'),
    metricArticlesHint: document.getElementById('metric-articles-hint'),
    metricMedia: document.getElementById('metric-media'),
    metricMediaHint: document.getElementById('metric-media-hint'),
    metricAnnual: document.getElementById('metric-annual'),
    metricAnnualHint: document.getElementById('metric-annual-hint'),
    metricSlot: document.getElementById('metric-slot'),
    metricSlotHint: document.getElementById('metric-slot-hint'),
    articlesCountLabel: document.getElementById('articles-count-label'),
    articlesEmpty: document.getElementById('articles-empty'),
    articlesTbody: document.getElementById('articles-tbody'),
    mediaCountLabel: document.getElementById('media-count-label'),
    mediaEmpty: document.getElementById('media-empty'),
    mediaTbody: document.getElementById('media-tbody'),
    annualCountLabel: document.getElementById('annual-count-label'),
    annualEmpty: document.getElementById('annual-empty'),
    annualTbody: document.getElementById('annual-tbody'),
    navTabsEmpty: document.getElementById('nav-tabs-empty'),
    navTabsList: document.getElementById('nav-tabs-list'),
    slotEmpty: document.getElementById('slot-empty'),
    slotContent: document.getElementById('slot-content'),
    sitePreviewNavTabsBlock: document.getElementById('site-preview-nav-tabs-block'),
    sitePreviewSlotBlock: document.getElementById('site-preview-slot-block'),
    articlesSection: document.getElementById('articles'),
    mediaSection: document.getElementById('media'),
    annualReportsSection: document.getElementById('annual-reports'),
    sitePreviewSection: document.getElementById('site-preview'),
    tenantInfoGrid: document.getElementById('tenant-info-grid'),
    dashboardNav: document.getElementById('dashboard-nav'),
  };

  const state = {
    host: null,
    tenant: null,
    user: null,
    moduleAccess: {
      homepagePlacements: true,
      articles: true,
      libraries: true,
      annualReports: true,
      navigationTabs: true,
    },
    tenantArticles: [],
    tenantMedia: [],
    tenantAnnualReports: [],
    publicNavTabs: [],
    publicSlot: null,
    publicSlotItemsByTab: null,
  };

  async function api(path, options) {
    const res = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ('Request failed (' + res.status + ')'));
    return data;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  }

  function formatBytes(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return '-';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function normalizeModuleAccess(input) {
    const source = input && typeof input === 'object' ? input : {};
    return {
      homepagePlacements: source.homepagePlacements !== false,
      articles: source.articles !== false,
      libraries: source.libraries !== false,
      annualReports: source.annualReports !== false,
      navigationTabs: source.navigationTabs !== false,
    };
  }

  function setNotice(message, kind) {
    if (!message) {
      els.appNotice.className = 'notice hidden';
      els.appNotice.textContent = '';
      return;
    }
    els.appNotice.className = ('notice ' + (kind || '')).trim();
    els.appNotice.textContent = message;
  }

  function setLoading(loading) {
    els.loadingView.classList.toggle('hidden', !loading);
    els.appView.classList.toggle('hidden', loading);
  }

  function renderTenantChrome() {
    const tenant = state.tenant;
    if (!tenant) return;
    const initials = (tenant.name || tenant.slug || 'TC')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'TC';

    els.tenantMark.textContent = initials;
    if (tenant.branding && tenant.branding.primaryColor) {
      els.tenantMark.style.background = 'linear-gradient(135deg, ' + tenant.branding.primaryColor + ' 0%, #0f172a 100%)';
    }

    els.tenantName.textContent = tenant.name || 'Tenant CMS';
    els.tenantSlug.textContent = tenant.slug ? 'Tenant workspace • ' + tenant.slug : 'Tenant workspace';

    if (state.host) {
      els.tenantHostPill.textContent = 'Host: ' + state.host;
      els.tenantHostPill.classList.remove('hidden');
    }

    if (state.user) {
      const role = state.user.tenantRole ? ' • ' + state.user.tenantRole : '';
      els.sessionChip.textContent = state.user.email + role;
      els.sessionChip.classList.remove('hidden');
    }

    if (tenant.name) {
      const disabled = Object.entries(state.moduleAccess || {})
        .filter(([, enabled]) => enabled === false)
        .map(([key]) => key);
      const restrictionNote = disabled.length
        ? ' Some modules are hidden by platform access controls.'
        : '';
      els.dashboardSubtitle.textContent =
        'Protected tenant CMS data and public site previews for ' + tenant.name + '. Use this dashboard to verify content readiness before wiring the full tenant editor experience.' +
        restrictionNote;
    }
  }

  function renderAccessVisibility() {
    const access = normalizeModuleAccess(state.moduleAccess);
    const links = Array.from((els.dashboardNav && els.dashboardNav.querySelectorAll('a[href^="#"]')) || []);
    const navMap = {
      '#articles': access.articles,
      '#media': access.libraries,
      '#annual-reports': access.annualReports,
      '#site-preview': access.navigationTabs || access.homepagePlacements,
    };
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!Object.prototype.hasOwnProperty.call(navMap, href)) return;
      link.classList.toggle('hidden', navMap[href] === false);
    });

    if (els.metricCardArticles) els.metricCardArticles.classList.toggle('hidden', access.articles === false);
    if (els.metricCardMedia) els.metricCardMedia.classList.toggle('hidden', access.libraries === false);
    if (els.metricCardAnnual) els.metricCardAnnual.classList.toggle('hidden', access.annualReports === false);
    if (els.metricCardSlot) els.metricCardSlot.classList.toggle('hidden', access.homepagePlacements === false);

    if (els.articlesSection) els.articlesSection.classList.toggle('hidden', access.articles === false);
    if (els.mediaSection) els.mediaSection.classList.toggle('hidden', access.libraries === false);
    if (els.annualReportsSection) els.annualReportsSection.classList.toggle('hidden', access.annualReports === false);
    if (els.sitePreviewNavTabsBlock) els.sitePreviewNavTabsBlock.classList.toggle('hidden', access.navigationTabs === false);
    if (els.sitePreviewSlotBlock) els.sitePreviewSlotBlock.classList.toggle('hidden', access.homepagePlacements === false);
    if (els.sitePreviewSection) {
      els.sitePreviewSection.classList.toggle('hidden', access.navigationTabs === false && access.homepagePlacements === false);
    }
  }

  function renderMetrics() {
    const articles = Array.isArray(state.tenantArticles) ? state.tenantArticles : [];
    const media = Array.isArray(state.tenantMedia) ? state.tenantMedia : [];
    const annual = Array.isArray(state.tenantAnnualReports) ? state.tenantAnnualReports : [];
    const publishedArticles = articles.filter((item) => item.status === 'published').length;
    const draftArticles = articles.filter((item) => item.status !== 'published').length;
    const slotCount = state.publicSlotItemsByTab
      ? Object.values(state.publicSlotItemsByTab).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
      : 0;

    els.metricArticles.textContent = String(articles.length);
    els.metricArticlesHint.textContent = publishedArticles + ' published • ' + draftArticles + ' draft';

    const imageCount = media.filter((item) => item.kind === 'image').length;
    const docCount = media.filter((item) => item.kind === 'document').length;
    els.metricMedia.textContent = String(media.length);
    els.metricMediaHint.textContent = imageCount + ' images • ' + docCount + ' documents';

    const publishedAnnual = annual.filter((item) => item.status === 'published').length;
    els.metricAnnual.textContent = String(annual.length);
    els.metricAnnualHint.textContent = publishedAnnual + ' published • ' + (annual.length - publishedAnnual) + ' draft';

    els.metricSlot.textContent = String(slotCount);
    const tabCount = state.publicSlot && Array.isArray(state.publicSlot.tabs) ? state.publicSlot.tabs.length : 0;
    els.metricSlotHint.textContent = tabCount + ' tabs configured';
  }

  function renderArticles() {
    const rows = Array.isArray(state.tenantArticles) ? state.tenantArticles.slice(0, 8) : [];
    els.articlesCountLabel.textContent = (state.tenantArticles?.length || 0) + ' total';
    els.articlesEmpty.classList.toggle('hidden', rows.length > 0);
    els.articlesTbody.innerHTML = rows.length
      ? rows.map((row) => {
          const status = escapeHtml(row.status || 'draft');
          return '<tr>' +
            '<td><div>' + escapeHtml(row.title || '-') + '</div><div style="color:#64748b;font-size:11px;margin-top:2px;" class="mono">/' + escapeHtml(row.slug || '') + '</div></td>' +
            '<td><span class="status ' + status + '">' + status + '</span></td>' +
            '<td>' + escapeHtml(row.category || '-') + '</td>' +
            '<td>' + escapeHtml(row.publishAt ? formatDate(row.publishAt) : '-') + '</td>' +
            '<td>' + escapeHtml(formatDate(row.updatedAt)) + '</td>' +
          '</tr>';
        }).join('')
      : '';
  }

  function renderMedia() {
    const rows = Array.isArray(state.tenantMedia) ? state.tenantMedia.slice(0, 8) : [];
    els.mediaCountLabel.textContent = (state.tenantMedia?.length || 0) + ' total';
    els.mediaEmpty.classList.toggle('hidden', rows.length > 0);
    els.mediaTbody.innerHTML = rows.length
      ? rows.map((row) => {
          const kind = escapeHtml(row.kind || 'file');
          return '<tr>' +
            '<td><div>' + escapeHtml(row.label || '-') + '</div><div class="mono" style="color:#64748b;font-size:11px;margin-top:2px;">' + escapeHtml((row.fileUrl || '').split('/').pop() || '') + '</div></td>' +
            '<td><span class="status ' + kind + '">' + kind + '</span></td>' +
            '<td>' + escapeHtml(row.mimeType || '-') + '</td>' +
            '<td>' + escapeHtml(formatBytes(row.size)) + '</td>' +
            '<td>' + escapeHtml(formatDate(row.createdAt)) + '</td>' +
          '</tr>';
        }).join('')
      : '';
  }

  function renderAnnualReports() {
    const rows = Array.isArray(state.tenantAnnualReports) ? state.tenantAnnualReports.slice(0, 8) : [];
    els.annualCountLabel.textContent = (state.tenantAnnualReports?.length || 0) + ' total';
    els.annualEmpty.classList.toggle('hidden', rows.length > 0);
    els.annualTbody.innerHTML = rows.length
      ? rows.map((row) => {
          const status = escapeHtml(row.status || 'published');
          return '<tr>' +
            '<td>' + escapeHtml(String(row.year || '-')) + '</td>' +
            '<td><div>' + escapeHtml(row.title || '-') + '</div><div style="color:#64748b;font-size:11px;margin-top:2px;">' + escapeHtml(row.summary || '') + '</div></td>' +
            '<td><span class="status ' + status + '">' + status + '</span></td>' +
            '<td>' + escapeHtml(formatDate(row.updatedAt)) + '</td>' +
          '</tr>';
        }).join('')
      : '';
  }

  function renderNavTabs() {
    const tabs = Array.isArray(state.publicNavTabs) ? state.publicNavTabs : [];
    els.navTabsEmpty.classList.toggle('hidden', tabs.length > 0);
    els.navTabsList.innerHTML = tabs
      .slice(0, 10)
      .map((tab) => '<div class="tab-item"><strong>' + escapeHtml(tab.label || '-') + '</strong><span>' + escapeHtml(tab.group || 'general') + ' • ' + escapeHtml(tab.href || '#') + '</span></div>')
      .join('');
  }

  function renderSlotPreview() {
    const itemsByTab = state.publicSlotItemsByTab;
    const slot = state.publicSlot;
    const hasData = slot && itemsByTab && typeof itemsByTab === 'object';
    els.slotEmpty.classList.toggle('hidden', hasData);
    if (!hasData) {
      els.slotContent.innerHTML = '';
      return;
    }

    const tabs = Array.isArray(slot.tabs) ? slot.tabs : Object.keys(itemsByTab);
    els.slotContent.innerHTML = tabs.map((tabKey) => {
      const items = Array.isArray(itemsByTab[tabKey]) ? itemsByTab[tabKey] : [];
      return '<div class="slot-tab">' +
        '<div class="slot-tab-head">' + escapeHtml(tabKey) + ' (' + items.length + ')</div>' +
        '<div class="slot-list">' +
          (items.length
            ? items.slice(0, 4).map((item) => '<div class="slot-item"><strong>' + escapeHtml(item.title || '-') + '</strong><span>' + escapeHtml(item.type || 'item') + ' • ' + escapeHtml(item.ctaLabel || 'Read More') + '</span></div>').join('')
            : '<div class="slot-item"><span>No published items in this tab.</span></div>') +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderTenantInfo() {
    const tenant = state.tenant || {};
    const branding = tenant.branding || {};
    const rows = [
      ['Tenant Name', tenant.name || '-'],
      ['Tenant Slug', tenant.slug || '-'],
      ['Host', state.host || '-'],
      ['User', state.user?.email || '-'],
      ['Role', state.user?.tenantRole || '-'],
      ['Primary Color', branding.primaryColor || '-'],
      ['Public Site URL', branding.publicSiteUrl || '-'],
      ['Support Email', branding.supportEmail || '-'],
    ];

    els.tenantInfoGrid.innerHTML = rows
      .map(([k, v]) => '<div class="kv"><div class="k">' + escapeHtml(k) + '</div><div class="v">' + escapeHtml(v) + '</div></div>')
      .join('');
  }

  function renderAll() {
    renderAccessVisibility();
    renderTenantChrome();
    renderMetrics();
    renderArticles();
    renderMedia();
    renderAnnualReports();
    renderNavTabs();
    renderSlotPreview();
    renderTenantInfo();
  }

  async function loadHostContext() {
    const ctx = await api('/api/platform/host-context', { method: 'GET' });
    state.host = ctx.host || null;
    if (ctx.mode !== 'tenant' || !ctx.tenant) {
      throw new Error('Tenant dashboard is only available on tenant CMS hosts.');
    }
    state.tenant = ctx.tenant;
  }

  async function ensureSession() {
    const session = await api('/api/tenant/auth/me', { method: 'GET' });
    state.tenant = session.tenant || state.tenant;
    if (!session.authenticated || !session.user) {
      window.location.replace('/tenant-login');
      return false;
    }
    state.user = session.user;
    state.moduleAccess = normalizeModuleAccess(session.moduleAccess);
    return true;
  }

  async function loadDashboardData() {
    const tenantSlug = state.tenant?.slug;
    if (!tenantSlug) throw new Error('Tenant context is missing');

    const access = normalizeModuleAccess(state.moduleAccess);
    const [articlesRes, mediaRes, annualRes, navTabsRes, slotRes] = await Promise.allSettled([
      access.articles ? api('/api/tenant/articles', { method: 'GET' }) : Promise.resolve([]),
      access.libraries ? api('/api/tenant/media', { method: 'GET' }) : Promise.resolve([]),
      access.annualReports ? api('/api/tenant/annual-reports', { method: 'GET' }) : Promise.resolve([]),
      access.navigationTabs ? api('/api/public/navigation-tabs?tenantSlug=' + encodeURIComponent(tenantSlug), { method: 'GET' }) : Promise.resolve({ navigationTabs: [] }),
      access.homepagePlacements ? api('/api/public/slots/home.news-promotions?tenantSlug=' + encodeURIComponent(tenantSlug), { method: 'GET' }) : Promise.resolve({ slot: null, itemsByTab: null }),
    ]);

    if (articlesRes.status === 'fulfilled') state.tenantArticles = Array.isArray(articlesRes.value) ? articlesRes.value : [];
    else state.tenantArticles = [];

    if (mediaRes.status === 'fulfilled') state.tenantMedia = Array.isArray(mediaRes.value) ? mediaRes.value : [];
    else state.tenantMedia = [];

    if (annualRes.status === 'fulfilled') state.tenantAnnualReports = Array.isArray(annualRes.value) ? annualRes.value : [];
    else state.tenantAnnualReports = [];

    if (navTabsRes.status === 'fulfilled') {
      state.publicNavTabs = Array.isArray(navTabsRes.value.navigationTabs) ? navTabsRes.value.navigationTabs : [];
    } else {
      state.publicNavTabs = [];
    }

    if (slotRes.status === 'fulfilled') {
      state.publicSlot = slotRes.value.slot || null;
      state.publicSlotItemsByTab = slotRes.value.itemsByTab || null;
    } else {
      state.publicSlot = null;
      state.publicSlotItemsByTab = null;
    }

    const errors = [articlesRes, mediaRes, annualRes, navTabsRes, slotRes]
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason?.message || 'Request failed');

    if (errors.length) {
      setNotice('Some dashboard modules failed to load: ' + errors.join(' | '), 'error');
    } else {
      setNotice('Dashboard refreshed.', 'ok');
    }
  }

  async function refreshDashboard(options) {
    if (options?.showLoading !== false) setLoading(true);
    els.refreshBtn.disabled = true;
    try {
      await loadHostContext();
      const ok = await ensureSession();
      if (!ok) return;
      await loadDashboardData();
      renderAll();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setNotice(err.message || 'Failed to load dashboard', 'error');
    } finally {
      els.refreshBtn.disabled = false;
    }
  }

  async function handleLogout() {
    els.logoutBtn.disabled = true;
    try {
      await api('/api/tenant/auth/logout', { method: 'POST' });
      window.location.assign('/tenant-login');
    } catch (err) {
      setNotice(err.message || 'Failed to sign out', 'error');
    } finally {
      els.logoutBtn.disabled = false;
    }
  }

  function wireNavHighlight() {
    if (!els.dashboardNav) return;
    const links = Array.from(els.dashboardNav.querySelectorAll('a[href^="#"]'));
    links.forEach((link) => {
      link.addEventListener('click', function (event) {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) return;
        event.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', href);
        }
        links.forEach((item) => item.classList.toggle('active', item === link));
      });
    });
  }

  async function init() {
    wireNavHighlight();
    els.refreshBtn.addEventListener('click', function () {
      refreshDashboard({ showLoading: false });
    });
    els.logoutBtn.addEventListener('click', handleLogout);
    await refreshDashboard({ showLoading: true });
  }

  init();
})();
