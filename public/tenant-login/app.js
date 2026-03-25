(function () {
  const DASHBOARD_PATH = '/tenant-dashboard';

  const els = {
    tenantPill: document.getElementById('tenant-pill'),
    loginNotice: document.getElementById('login-notice'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginBtn: document.getElementById('login-btn'),
    checkSessionBtn: document.getElementById('check-session-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    openDashboardBtn: document.getElementById('open-dashboard-btn'),
    sessionCard: document.getElementById('session-card'),
    sessionSummary: document.getElementById('session-summary'),
  };

  const state = {
    tenant: null,
    user: null,
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

  function setNotice(message, kind) {
    if (!message) {
      els.loginNotice.className = 'notice hidden';
      els.loginNotice.textContent = '';
      return;
    }
    els.loginNotice.className = ('notice ' + (kind || '')).trim();
    els.loginNotice.textContent = message;
  }

  function renderTenantPill() {
    if (!state.tenant) {
      els.tenantPill.classList.add('hidden');
      els.tenantPill.textContent = '';
      return;
    }
    const name = state.tenant.name || 'Tenant';
    const slug = state.tenant.slug ? ' (' + state.tenant.slug + ')' : '';
    els.tenantPill.textContent = 'Workspace: ' + name + slug;
    els.tenantPill.classList.remove('hidden');
  }

  function renderSession() {
    const authenticated = Boolean(state.user && state.tenant);
    els.sessionCard.classList.toggle('hidden', !authenticated);
    if (!authenticated) {
      els.sessionSummary.textContent = '';
      return;
    }
    const role = state.user.tenantRole ? ' • ' + state.user.tenantRole : '';
    const tenant = state.tenant?.name ? ' • ' + state.tenant.name : '';
    els.sessionSummary.textContent = state.user.email + role + tenant;
  }

  function goToDashboard() {
    window.location.assign(DASHBOARD_PATH);
  }

  async function loadHostContext() {
    const ctx = await api('/api/platform/host-context', { method: 'GET' });
    if (ctx.mode !== 'tenant') {
      throw new Error('This login page is only available on tenant CMS hosts.');
    }
    state.tenant = ctx.tenant || null;
    renderTenantPill();
  }

  async function loadSession(options) {
    const res = await api('/api/tenant/auth/me', { method: 'GET' });
    state.tenant = res.tenant || state.tenant;
    state.user = res.authenticated ? (res.user || null) : null;
    renderTenantPill();
    renderSession();

    if (res.authenticated && options?.redirectIfAuthenticated) {
      goToDashboard();
      return true;
    }
    return Boolean(res.authenticated);
  }

  async function handleLogin() {
    els.loginBtn.disabled = true;
    try {
      await api('/api/tenant/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: els.loginEmail.value.trim(),
          password: els.loginPassword.value,
        }),
      });
      setNotice('Signed in. Redirecting to dashboard...', 'ok');
      els.loginPassword.value = '';
      await loadSession();
      goToDashboard();
    } catch (err) {
      setNotice(err.message || 'Failed to sign in', 'error');
    } finally {
      els.loginBtn.disabled = false;
    }
  }

  async function handleLogout() {
    els.logoutBtn.disabled = true;
    try {
      await api('/api/tenant/auth/logout', { method: 'POST' });
      state.user = null;
      renderSession();
      setNotice('Signed out.', 'ok');
    } catch (err) {
      setNotice(err.message || 'Failed to sign out', 'error');
    } finally {
      els.logoutBtn.disabled = false;
    }
  }

  async function init() {
    try {
      await loadHostContext();
      await loadSession({ redirectIfAuthenticated: true });
    } catch (err) {
      setNotice(err.message || 'Failed to initialize tenant login', 'error');
    }

    els.loginBtn.addEventListener('click', handleLogin);
    els.checkSessionBtn.addEventListener('click', async () => {
      try {
        const ok = await loadSession();
        setNotice(ok ? 'Active tenant session found.' : 'No active session.', ok ? 'ok' : '');
      } catch (err) {
        setNotice(err.message || 'Failed to check session', 'error');
      }
    });
    els.logoutBtn.addEventListener('click', handleLogout);
    els.openDashboardBtn.addEventListener('click', goToDashboard);
    els.loginPassword.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') handleLogin();
    });
  }

  init();
})();
