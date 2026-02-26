(function () {
  const els = {
    loadingView: document.getElementById('loading-view'),
    appView: document.getElementById('app-view'),
    appNotice: document.getElementById('app-notice'),
    passwordChangeNotice: document.getElementById('password-change-notice'),
    refreshBtn: document.getElementById('refresh-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    currentPasswordInput: document.getElementById('current-password'),
    newPasswordInput: document.getElementById('new-password'),
    confirmPasswordInput: document.getElementById('confirm-password'),
    changePasswordBtn: document.getElementById('change-password-btn'),
    clearPasswordFormBtn: document.getElementById('clear-password-form-btn'),
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
    tenantArticleNewBtn: document.getElementById('tenant-article-new-btn'),
    tenantArticleEditor: document.getElementById('tenant-article-editor'),
    tenantArticleEditorTitle: document.getElementById('tenant-article-editor-title'),
    tenantArticleEditorMeta: document.getElementById('tenant-article-editor-meta'),
    tenantArticleNotice: document.getElementById('tenant-article-notice'),
    tenantArticleIdInput: document.getElementById('tenant-article-id'),
    tenantArticleTitleInput: document.getElementById('tenant-article-title'),
    tenantArticleStatusInput: document.getElementById('tenant-article-status'),
    tenantArticleCategoryInput: document.getElementById('tenant-article-category'),
    tenantArticleSummaryInput: document.getElementById('tenant-article-summary'),
    tenantArticleBodyInput: document.getElementById('tenant-article-body'),
    tenantArticleSaveBtn: document.getElementById('tenant-article-save-btn'),
    tenantArticleDeleteBtn: document.getElementById('tenant-article-delete-btn'),
    tenantArticleCancelBtn: document.getElementById('tenant-article-cancel-btn'),
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
    articleEditor: {
      open: false,
      articleId: null,
      saving: false,
      deleting: false,
    },
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

  function formatDate(value) {
    if (!value) return '-';
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

  function setPasswordNotice(message, kind) {
    if (!els.passwordChangeNotice) return;
    if (!message) {
      els.passwordChangeNotice.className = 'subnotice hidden';
      els.passwordChangeNotice.textContent = '';
      return;
    }
    els.passwordChangeNotice.className = ('subnotice ' + (kind || '')).trim();
    els.passwordChangeNotice.textContent = message;
  }

  function setArticleNotice(message, kind) {
    if (!els.tenantArticleNotice) return;
    if (!message) {
      els.tenantArticleNotice.className = 'subnotice hidden';
      els.tenantArticleNotice.textContent = '';
      return;
    }
    els.tenantArticleNotice.className = ('subnotice ' + (kind || '')).trim();
    els.tenantArticleNotice.textContent = message;
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

    const logoImg = els.tenantMark && els.tenantMark.querySelector('img');
    if (logoImg) {
      els.tenantMark.setAttribute('title', tenant.name || tenant.slug || 'Tenant CMS');
      els.tenantMark.dataset.initials = initials;
      if (tenant.branding && tenant.branding.primaryColor) {
        els.tenantMark.style.borderColor = tenant.branding.primaryColor;
      }
    } else {
      els.tenantMark.textContent = initials;
      if (tenant.branding && tenant.branding.primaryColor) {
        els.tenantMark.style.background = 'linear-gradient(135deg, ' + tenant.branding.primaryColor + ' 0%, #0f172a 100%)';
      }
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
    if (els.tenantArticleNewBtn) {
      els.tenantArticleNewBtn.classList.toggle('hidden', normalizeModuleAccess(state.moduleAccess).articles === false);
      els.tenantArticleNewBtn.disabled = state.articleEditor.saving || state.articleEditor.deleting;
    }
    els.articlesTbody.innerHTML = rows.length
      ? rows.map((row) => {
          const status = escapeHtml(row.status || 'draft');
          return '<tr>' +
            '<td><div>' + escapeHtml(row.title || '-') + '</div><div style="color:#64748b;font-size:11px;margin-top:2px;" class="mono">/' + escapeHtml(row.slug || '') + '</div></td>' +
            '<td><span class="status ' + status + '">' + status + '</span></td>' +
            '<td>' + escapeHtml(row.category || '-') + '</td>' +
            '<td>' + escapeHtml(row.publishAt ? formatDate(row.publishAt) : '-') + '</td>' +
            '<td>' + escapeHtml(formatDate(row.updatedAt)) + '</td>' +
            '<td><div class="inline-actions">' +
              '<button type="button" class="table-action-btn" data-article-action="edit" data-article-id="' + Number(row.id) + '">Edit</button>' +
              '<button type="button" class="table-action-btn" data-article-action="delete" data-article-id="' + Number(row.id) + '">Delete</button>' +
            '</div></td>' +
          '</tr>';
        }).join('')
      : '';

    renderArticleEditor();
  }

  function getArticleById(id) {
    const numericId = Number(id);
    if (!numericId) return null;
    return (Array.isArray(state.tenantArticles) ? state.tenantArticles : []).find((item) => Number(item.id) === numericId) || null;
  }

  function resetArticleEditorForm(article) {
    const item = article || null;
    if (els.tenantArticleIdInput) els.tenantArticleIdInput.value = item ? String(item.id) : '';
    if (els.tenantArticleTitleInput) els.tenantArticleTitleInput.value = item?.title || '';
    if (els.tenantArticleStatusInput) els.tenantArticleStatusInput.value = item?.status === 'published' ? 'published' : 'draft';
    if (els.tenantArticleCategoryInput) els.tenantArticleCategoryInput.value = item?.category || 'newsroom';
    if (els.tenantArticleSummaryInput) els.tenantArticleSummaryInput.value = item?.summary || '';
    if (els.tenantArticleBodyInput) els.tenantArticleBodyInput.value = item?.body || '';
  }

  function openArticleEditor(article) {
    state.articleEditor.open = true;
    state.articleEditor.articleId = article ? Number(article.id) : null;
    resetArticleEditorForm(article || null);
    setArticleNotice('', '');
    renderArticleEditor();
    if (els.tenantArticleEditor) {
      els.tenantArticleEditor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (els.tenantArticleTitleInput) {
      window.setTimeout(() => {
        try { els.tenantArticleTitleInput.focus(); } catch (_) {}
      }, 0);
    }
  }

  function closeArticleEditor() {
    state.articleEditor.open = false;
    state.articleEditor.articleId = null;
    state.articleEditor.saving = false;
    state.articleEditor.deleting = false;
    resetArticleEditorForm(null);
    setArticleNotice('', '');
    renderArticleEditor();
  }

  function renderArticleEditor() {
    if (!els.tenantArticleEditor) return;
    const access = normalizeModuleAccess(state.moduleAccess);
    const canUseArticles = access.articles !== false;
    const isOpen = canUseArticles && state.articleEditor.open;
    const article = state.articleEditor.articleId ? getArticleById(state.articleEditor.articleId) : null;

    els.tenantArticleEditor.classList.toggle('hidden', !isOpen);
    if (!isOpen) return;

    if (els.tenantArticleEditorTitle) {
      els.tenantArticleEditorTitle.textContent = article ? 'Edit Article' : 'New Article';
    }
    if (els.tenantArticleEditorMeta) {
      const status = (els.tenantArticleStatusInput?.value || (article?.status || 'draft')).toLowerCase();
      const slug = article?.slug ? (' /' + article.slug) : '';
      const updated = article?.updatedAt ? (' • Updated ' + formatDate(article.updatedAt)) : '';
      els.tenantArticleEditorMeta.textContent = status + slug + updated;
    }

    const busy = state.articleEditor.saving || state.articleEditor.deleting;
    [els.tenantArticleTitleInput, els.tenantArticleStatusInput, els.tenantArticleCategoryInput, els.tenantArticleSummaryInput, els.tenantArticleBodyInput]
      .filter(Boolean)
      .forEach((field) => { field.disabled = busy; });
    if (els.tenantArticleSaveBtn) {
      els.tenantArticleSaveBtn.disabled = busy;
      els.tenantArticleSaveBtn.textContent = state.articleEditor.saving ? 'Saving...' : 'Save Article';
    }
    if (els.tenantArticleDeleteBtn) {
      els.tenantArticleDeleteBtn.disabled = busy || !article;
      els.tenantArticleDeleteBtn.textContent = state.articleEditor.deleting ? 'Deleting...' : 'Delete';
    }
    if (els.tenantArticleCancelBtn) {
      els.tenantArticleCancelBtn.disabled = busy;
      els.tenantArticleCancelBtn.textContent = article ? 'Close Editor' : 'Cancel';
    }
  }

  function buildTenantArticlePayloadFromForm() {
    const title = String(els.tenantArticleTitleInput?.value || '').trim();
    const status = String(els.tenantArticleStatusInput?.value || 'draft').trim().toLowerCase() === 'published'
      ? 'published'
      : 'draft';
    const category = String(els.tenantArticleCategoryInput?.value || 'newsroom').trim() || 'newsroom';
    const summary = String(els.tenantArticleSummaryInput?.value || '');
    const body = String(els.tenantArticleBodyInput?.value || '');
    if (!title) {
      throw new Error('Article title is required');
    }

    const existing = state.articleEditor.articleId ? getArticleById(state.articleEditor.articleId) : null;
    const payload = {
      title,
      status,
      category,
      summary,
      body,
      source: 'tenant-dashboard',
    };
    if (status === 'published' && !(existing && existing.publishAt)) {
      payload.publishAt = new Date().toISOString();
    }
    return payload;
  }

  async function saveArticleFromEditor() {
    if (state.articleEditor.saving || state.articleEditor.deleting) return;
    try {
      const payload = buildTenantArticlePayloadFromForm();
      state.articleEditor.saving = true;
      setArticleNotice('Saving article...', '');
      renderArticleEditor();

      const currentId = state.articleEditor.articleId ? Number(state.articleEditor.articleId) : null;
      const saved = currentId
        ? await api('/api/tenant/articles/' + currentId, { method: 'PUT', body: JSON.stringify(payload) })
        : await api('/api/tenant/articles', { method: 'POST', body: JSON.stringify(payload) });

      await loadDashboardData();
      if (saved && saved.id) {
        state.articleEditor.open = true;
        state.articleEditor.articleId = Number(saved.id);
      }
      renderAll();
      setArticleNotice(currentId ? 'Article updated.' : 'Article created.', 'ok');
      setNotice(currentId ? 'Article updated.' : 'Article created.', 'ok');
    } catch (err) {
      setArticleNotice(err.message || 'Failed to save article', 'error');
    } finally {
      state.articleEditor.saving = false;
      renderArticleEditor();
    }
  }

  async function deleteArticleFromEditor(articleId) {
    const article = getArticleById(articleId);
    if (!article || state.articleEditor.saving || state.articleEditor.deleting) return;
    const ok = window.confirm('Delete article "' + (article.title || article.slug || article.id) + '"?');
    if (!ok) return;

    try {
      state.articleEditor.deleting = true;
      if (state.articleEditor.articleId && Number(state.articleEditor.articleId) === Number(article.id)) {
        setArticleNotice('Deleting article...', '');
      } else {
        setNotice('Deleting article...', '');
      }
      renderArticleEditor();

      await api('/api/tenant/articles/' + Number(article.id), { method: 'DELETE' });
      await loadDashboardData();

      if (Number(state.articleEditor.articleId) === Number(article.id)) {
        closeArticleEditor();
      } else {
        renderAll();
      }
      setNotice('Article deleted.', 'ok');
    } catch (err) {
      if (Number(state.articleEditor.articleId) === Number(article.id)) {
        setArticleNotice(err.message || 'Failed to delete article', 'error');
      } else {
        setNotice(err.message || 'Failed to delete article', 'error');
      }
    } finally {
      state.articleEditor.deleting = false;
      renderArticleEditor();
    }
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

  function clearPasswordForm() {
    if (els.currentPasswordInput) els.currentPasswordInput.value = '';
    if (els.newPasswordInput) els.newPasswordInput.value = '';
    if (els.confirmPasswordInput) els.confirmPasswordInput.value = '';
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

  async function handleChangePassword() {
    const currentPassword = String(els.currentPasswordInput?.value || '');
    const newPassword = String(els.newPasswordInput?.value || '');
    const confirmPassword = String(els.confirmPasswordInput?.value || '');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordNotice('Please fill in current password, new password, and confirmation.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice('New password and confirmation do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordNotice('New password must be at least 8 characters.', 'error');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordNotice('New password must be different from your current password.', 'error');
      return;
    }

    if (els.changePasswordBtn) els.changePasswordBtn.disabled = true;
    setPasswordNotice('Updating password...', '');
    try {
      await api('/api/tenant/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      clearPasswordForm();
      setPasswordNotice('Password updated successfully.', 'ok');
    } catch (err) {
      setPasswordNotice(err.message || 'Failed to change password', 'error');
    } finally {
      if (els.changePasswordBtn) els.changePasswordBtn.disabled = false;
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

  function wireArticleEditor() {
    if (els.tenantArticleNewBtn) {
      els.tenantArticleNewBtn.addEventListener('click', function () {
        openArticleEditor(null);
      });
    }
    if (els.tenantArticleSaveBtn) {
      els.tenantArticleSaveBtn.addEventListener('click', saveArticleFromEditor);
    }
    if (els.tenantArticleDeleteBtn) {
      els.tenantArticleDeleteBtn.addEventListener('click', function () {
        if (!state.articleEditor.articleId) return;
        deleteArticleFromEditor(state.articleEditor.articleId);
      });
    }
    if (els.tenantArticleCancelBtn) {
      els.tenantArticleCancelBtn.addEventListener('click', function () {
        closeArticleEditor();
      });
    }
    [els.tenantArticleTitleInput, els.tenantArticleStatusInput, els.tenantArticleCategoryInput, els.tenantArticleSummaryInput, els.tenantArticleBodyInput]
      .filter(Boolean)
      .forEach((field) => {
        field.addEventListener('input', function () {
          renderArticleEditor();
        });
        field.addEventListener('change', function () {
          renderArticleEditor();
        });
      });
    if (els.articlesTbody) {
      els.articlesTbody.addEventListener('click', function (event) {
        const btn = event.target.closest('[data-article-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-article-action');
        const articleId = Number(btn.getAttribute('data-article-id'));
        if (!articleId) return;
        if (action === 'edit') {
          const article = getArticleById(articleId);
          if (article) openArticleEditor(article);
          return;
        }
        if (action === 'delete') {
          deleteArticleFromEditor(articleId);
        }
      });
    }
    [els.tenantArticleTitleInput, els.tenantArticleSummaryInput].filter(Boolean).forEach((input) => {
      input.addEventListener('keydown', function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
          event.preventDefault();
          saveArticleFromEditor();
        }
      });
    });
    if (els.tenantArticleBodyInput) {
      els.tenantArticleBodyInput.addEventListener('keydown', function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
          event.preventDefault();
          saveArticleFromEditor();
        }
      });
    }
  }

  async function init() {
    wireNavHighlight();
    wireArticleEditor();
    els.refreshBtn.addEventListener('click', function () {
      refreshDashboard({ showLoading: false });
    });
    els.logoutBtn.addEventListener('click', handleLogout);
    if (els.changePasswordBtn) {
      els.changePasswordBtn.addEventListener('click', handleChangePassword);
    }
    if (els.clearPasswordFormBtn) {
      els.clearPasswordFormBtn.addEventListener('click', function () {
        clearPasswordForm();
        setPasswordNotice('', '');
      });
    }
    [els.currentPasswordInput, els.newPasswordInput, els.confirmPasswordInput].filter(Boolean).forEach((input) => {
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleChangePassword();
        }
      });
    });
    await refreshDashboard({ showLoading: true });
  }

  init();
})();
