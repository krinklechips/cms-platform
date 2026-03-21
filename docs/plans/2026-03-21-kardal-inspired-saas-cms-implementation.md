# Kardal-Inspired SaaS CMS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the SaaS CMS admin and tenant interfaces so they inherit Kardal CMS workflow discipline, cleaner navigation, and consistent CRUD behavior while keeping the current SaaS brand colors and business logic.

**Architecture:** Keep the current server-rendered static HTML plus vanilla JS structure, but reorganize both admin and tenant shells around explicit page ownership and reusable UI patterns. Extract the most error-prone view-state logic into small pure helpers where practical so CRUD workflows, navigation, and content routing can be tested before UI wiring changes land.

**Tech Stack:** Static HTML/CSS, vanilla browser JavaScript, Express, SQLite, Node built-in test runner for lightweight regression coverage, existing `npm run check` validation.

---

### Task 1: Add a lightweight test harness for UI workflow logic

**Files:**
- Create: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/admin-navigation.test.mjs`
- Create: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/tenant-views.test.mjs`
- Create: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/shared/workflow-helpers.js`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/package.json`
- Test: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/admin-navigation.test.mjs`
- Test: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/tenant-views.test.mjs`

**Step 1: Write the failing admin navigation test**

Create a Node test that asserts:

- admin page definitions are unique by `id`
- each sidebar subitem maps to one real page/view
- no subitem resolves to a scroll-only hash target without page ownership

**Step 2: Run test to verify it fails**

Run: `node --test tests/admin-navigation.test.mjs`
Expected: FAIL because the shared workflow helpers do not exist yet.

**Step 3: Write the failing tenant view test**

Create a Node test that asserts:

- allowed tenant dashboard views are resolved consistently from module access
- the article CRUD view remains available when articles are enabled
- no hidden module view can become the active fallback

**Step 4: Run test to verify it fails**

Run: `node --test tests/tenant-views.test.mjs`
Expected: FAIL because the shared workflow helpers do not exist yet.

**Step 5: Implement minimal shared helpers**

Create `/public/shared/workflow-helpers.js` with pure exports for:

- admin nav page definitions
- tenant dashboard view resolution
- small helper functions used by both test files

Only implement enough to satisfy the tests.

**Step 6: Run tests to verify they pass**

Run: `node --test tests/admin-navigation.test.mjs tests/tenant-views.test.mjs`
Expected: PASS

**Step 7: Commit**

```bash
git add package.json public/shared/workflow-helpers.js tests/admin-navigation.test.mjs tests/tenant-views.test.mjs
git commit -m "test: add workflow helper coverage for admin and tenant navigation"
```

### Task 2: Refactor admin information architecture away from stacked page sections

**Files:**
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/app.js`
- Test: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/admin-navigation.test.mjs`

**Step 1: Write the failing test for admin subpage ownership**

Extend `tests/admin-navigation.test.mjs` to assert that:

- `create-tenant`, `tenant-directory`, `selected-tenant`, `domain-provisioning`, `tenant-users`, `module-access`, and `support-details` each resolve to a dedicated admin page key
- content workspaces are not modeled as anonymous subsections inside unrelated setup pages

**Step 2: Run test to verify it fails**

Run: `node --test tests/admin-navigation.test.mjs`
Expected: FAIL because the current admin shell still mixes multiple page responsibilities in shared containers.

**Step 3: Update admin shell markup**

Rework `public/platform-admin/index.html` so the main work area uses dedicated page sections rather than one long stacked surface:

- one section for Operations
- one section for Tenant Directory
- one section for Create Tenant
- one section for Edit Tenant
- one section for Domain Provisioning
- one section for Tenant Users
- one section for Module Access
- one section for Support Details
- one section for each content CRUD module

Do not remove existing fields. Move them into clearer ownership containers.

**Step 4: Update admin state routing**

Refactor `public/platform-admin/app.js` so:

- `adminNav.main` and `adminNav.sub` route to dedicated content regions
- subitems never depend on page scrolling to fake navigation
- the current accordion state and active item remain stable across refreshes

**Step 5: Run test to verify it passes**

Run: `node --test tests/admin-navigation.test.mjs`
Expected: PASS

**Step 6: Run syntax validation**

Run: `node --check public/platform-admin/app.js`
Expected: PASS

**Step 7: Commit**

```bash
git add public/platform-admin/index.html public/platform-admin/app.js tests/admin-navigation.test.mjs
git commit -m "refactor: split admin shell into dedicated workflow pages"
```

### Task 3: Rebuild the admin sidebar using the Kardal-inspired accordion model

**Files:**
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/app.js`
- Test: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/admin-navigation.test.mjs`

**Step 1: Write the failing sidebar-state test**

Extend `tests/admin-navigation.test.mjs` to assert:

- top-level groups are represented explicitly
- only one active subitem is marked current
- groups can expand without forcing other groups to appear active

**Step 2: Run test to verify it fails**

Run: `node --test tests/admin-navigation.test.mjs`
Expected: FAIL because current sidebar state is still too coupled to section anchors and shared page containers.

**Step 3: Update sidebar markup**

Refactor sidebar markup in `public/platform-admin/index.html` to:

- place the Think logo larger with CMS platform copy beneath it
- use quieter group labels
- add icons to top-level group items and selected key subitems
- apply a cleaner accordion structure inspired by Kardal

**Step 4: Update sidebar interaction logic**

Refactor sidebar logic in `public/platform-admin/app.js` so:

- accordion open/close state is independent of active page state
- active page highlighting is clean and singular
- search filters groups/subitems without breaking active state

**Step 5: Run test to verify it passes**

Run: `node --test tests/admin-navigation.test.mjs`
Expected: PASS

**Step 6: Run syntax validation**

Run: `node --check public/platform-admin/app.js`
Expected: PASS

**Step 7: Commit**

```bash
git add public/platform-admin/index.html public/platform-admin/app.js tests/admin-navigation.test.mjs
git commit -m "feat: rebuild admin sidebar with clearer accordion navigation"
```

### Task 4: Simplify the shared top header and standardize action controls

**Files:**
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/tenant-dashboard/index.html`

**Step 1: Write the failing markup assertion**

Add simple assertions in `tests/admin-navigation.test.mjs` and `tests/tenant-views.test.mjs` that inspect the HTML strings and verify the presence of:

- one topbar title/subtitle block
- consistent mode controls
- one user chip
- one signout button region

**Step 2: Run tests to verify they fail**

Run: `node --test tests/admin-navigation.test.mjs tests/tenant-views.test.mjs`
Expected: FAIL because the current shell still contains inconsistent control sizing and cluttered header composition.

**Step 3: Update admin and tenant header markup**

Refactor both `index.html` files so:

- title/subtitle hierarchy is cleaner
- mode switch, workspace selector, user chip, and signout align to a shared control height
- signout uses the same polished component sizing in both contexts

**Step 4: Run tests to verify they pass**

Run: `node --test tests/admin-navigation.test.mjs tests/tenant-views.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add public/platform-admin/index.html public/tenant-dashboard/index.html tests/admin-navigation.test.mjs tests/tenant-views.test.mjs
git commit -m "style: standardize CMS shell header controls"
```

### Task 5: Normalize shared button, tab, form, and status component language

**Files:**
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/tenant-dashboard/index.html`

**Step 1: Write the failing markup assertions**

Extend test coverage to assert the presence of consistent semantic classes or attributes for:

- primary buttons
- secondary buttons
- destructive buttons
- tab navigation
- field labels and helper text regions

**Step 2: Run tests to verify they fail**

Run: `node --test tests/admin-navigation.test.mjs tests/tenant-views.test.mjs`
Expected: FAIL because action styling and tab presentation are inconsistent across admin and tenant.

**Step 3: Refactor shared visual patterns**

Update both HTML files so:

- tabs read as navigation, not random pills
- destructive actions are clearly red
- edit buttons and delete buttons are consistently sized when adjacent
- labels sit above inputs consistently
- status and save notices are quieter and localized

**Step 4: Run tests to verify they pass**

Run: `node --test tests/admin-navigation.test.mjs tests/tenant-views.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add public/platform-admin/index.html public/tenant-dashboard/index.html tests/admin-navigation.test.mjs tests/tenant-views.test.mjs
git commit -m "style: unify buttons tabs and form hierarchy across CMS surfaces"
```

### Task 6: Turn admin tenant management into clean CRUD surfaces

**Files:**
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/app.js`
- Test: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/admin-navigation.test.mjs`

**Step 1: Write the failing test for tenant workflow structure**

Extend `tests/admin-navigation.test.mjs` to assert:

- directory, create, and edit tenant are three distinct admin views
- edit tenant tabs map to owned content regions
- `Open Domains Tab` and other quick links do not replace true tab navigation

**Step 2: Run test to verify it fails**

Run: `node --test tests/admin-navigation.test.mjs`
Expected: FAIL because tenant management is still partially split between stacked regions and mixed tab content.

**Step 3: Refactor tenant management views**

Update admin HTML/JS so:

- Tenant Directory is a true list/filter page
- Create Tenant is a true onboarding page
- Edit Tenant owns Branding, Domains, Support, Users, and Content Modules as dedicated tab regions

**Step 4: Refactor tenant users into a dedicated management surface**

Move tenant user CRUD into a page/tab that contains:

- create/reset form
- user table
- clear save/error notices

**Step 5: Run test to verify it passes**

Run: `node --test tests/admin-navigation.test.mjs`
Expected: PASS

**Step 6: Run syntax validation**

Run: `node --check public/platform-admin/app.js`
Expected: PASS

**Step 7: Commit**

```bash
git add public/platform-admin/index.html public/platform-admin/app.js tests/admin-navigation.test.mjs
git commit -m "refactor: normalize tenant and tenant-user CRUD workflows in admin"
```

### Task 7: Split tenant workspace into true module pages

**Files:**
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/tenant-dashboard/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/tenant-dashboard/app.js`
- Test: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/tenant-views.test.mjs`

**Step 1: Write the failing tenant module-ownership test**

Extend `tests/tenant-views.test.mjs` to assert:

- `overview`, `articles`, `media`, `annual-reports`, `site-preview`, and `account-security` resolve to dedicated view ownership
- each view hides unrelated editor surfaces

**Step 2: Run test to verify it fails**

Run: `node --test tests/tenant-views.test.mjs`
Expected: FAIL because current tenant dashboard still behaves like one long page with toggled visibility.

**Step 3: Refactor tenant shell and view composition**

Update tenant HTML/JS so:

- overview remains a dashboard page
- articles becomes a dedicated CRUD page
- media becomes a dedicated page
- annual reports becomes a dedicated page
- site preview becomes a dedicated page
- account security becomes a dedicated page

Keep the current hash-based navigation unless replacing it is strictly necessary.

**Step 4: Run test to verify it passes**

Run: `node --test tests/tenant-views.test.mjs`
Expected: PASS

**Step 5: Run syntax validation**

Run: `node --check public/tenant-dashboard/app.js`
Expected: PASS

**Step 6: Commit**

```bash
git add public/tenant-dashboard/index.html public/tenant-dashboard/app.js tests/tenant-views.test.mjs
git commit -m "refactor: split tenant workspace into dedicated module pages"
```

### Task 8: Make Articles the reference CRUD pattern across admin and tenant

**Files:**
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/app.js`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/tenant-dashboard/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/tenant-dashboard/app.js`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/server/routes/tenantArticles.js`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/server/routes/publicArticles.js`
- Test: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/tenant-views.test.mjs`

**Step 1: Write the failing category consistency test**

Add a test that asserts:

- new tenant-authored articles default to the same category family the public insights section expects
- category values are consistent across tenant editor, admin editor, and public article filtering

**Step 2: Run test to verify it fails**

Run: `node --test tests/tenant-views.test.mjs`
Expected: FAIL because current defaults differ between admin and tenant article editors.

**Step 3: Refactor article CRUD UX**

Update admin and tenant article pages so:

- list/table is clearly separate from editor
- button hierarchy is consistent
- success and error notices are local
- published/draft state is clear

**Step 4: Fix category and public rendering consistency**

Update relevant JS and server routes so:

- article categories are intentionally aligned
- published content appears in the expected public insights surface
- CRUD actions do not silently route content into the wrong public bucket

**Step 5: Run test to verify it passes**

Run: `node --test tests/tenant-views.test.mjs`
Expected: PASS

**Step 6: Run syntax validation**

Run: `npm run check && node --check public/platform-admin/app.js && node --check public/tenant-dashboard/app.js`
Expected: PASS

**Step 7: Commit**

```bash
git add public/platform-admin/index.html public/platform-admin/app.js public/tenant-dashboard/index.html public/tenant-dashboard/app.js server/routes/tenantArticles.js server/routes/publicArticles.js tests/tenant-views.test.mjs
git commit -m "feat: standardize article CRUD and public insights behavior"
```

### Task 9: Normalize Media, Annual Reports, and Homepage Placements CRUD

**Files:**
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/app.js`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/tenant-dashboard/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/tenant-dashboard/app.js`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/server/routes/tenantMedia.js`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/server/routes/tenantAnnualReports.js`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/server/routes/platformPlacements.js`

**Step 1: Write the failing test for module view ownership**

Extend `tests/tenant-views.test.mjs` so media, annual reports, and site preview modules are each required to map to dedicated page views.

**Step 2: Run test to verify it fails**

Run: `node --test tests/tenant-views.test.mjs`
Expected: FAIL because those modules are still partially mixed into overview-style stacked layouts.

**Step 3: Refactor each module into a repeatable CRUD/config surface**

Bring each module into the same pattern:

- title and actions
- table/list
- editor form
- local notices

**Step 4: Run test to verify it passes**

Run: `node --test tests/tenant-views.test.mjs`
Expected: PASS

**Step 5: Run syntax validation**

Run: `npm run check && node --check public/platform-admin/app.js && node --check public/tenant-dashboard/app.js`
Expected: PASS

**Step 6: Commit**

```bash
git add public/platform-admin/index.html public/platform-admin/app.js public/tenant-dashboard/index.html public/tenant-dashboard/app.js server/routes/tenantMedia.js server/routes/tenantAnnualReports.js server/routes/platformPlacements.js tests/tenant-views.test.mjs
git commit -m "refactor: align media reports and placements with shared CRUD patterns"
```

### Task 10: Final integration verification and cleanup

**Files:**
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/tenant-dashboard/index.html`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/platform-admin/app.js`
- Modify: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/public/tenant-dashboard/app.js`
- Test: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/admin-navigation.test.mjs`
- Test: `/Users/enochphan/Desktop/Desktop - Silver Edge/Payment Hub/Kardal Website/cms-platform/tests/tenant-views.test.mjs`

**Step 1: Run the full automated verification**

Run:

```bash
node --test tests/admin-navigation.test.mjs tests/tenant-views.test.mjs
npm run check
node --check public/platform-admin/app.js
node --check public/tenant-dashboard/app.js
```

Expected: all commands pass.

**Step 2: Perform a manual smoke checklist**

Verify in browser:

- admin sidebar accordion works
- every sidebar item opens a real page/view
- tenant mode and admin mode still switch correctly
- tenant articles can be created and appear in expected public insight surfaces
- tenant users remain manageable
- sign out works in both admin and tenant contexts

**Step 3: Fix any last integration regressions**

Apply only minimal regression fixes discovered during the smoke pass.

**Step 4: Re-run verification**

Run:

```bash
node --test tests/admin-navigation.test.mjs tests/tenant-views.test.mjs
npm run check
node --check public/platform-admin/app.js
node --check public/tenant-dashboard/app.js
```

Expected: all commands pass cleanly.

**Step 5: Commit**

```bash
git add public/platform-admin/index.html public/platform-admin/app.js public/tenant-dashboard/index.html public/tenant-dashboard/app.js tests/admin-navigation.test.mjs tests/tenant-views.test.mjs package.json public/shared/workflow-helpers.js
git commit -m "refactor: apply Kardal-inspired workflow cleanup across SaaS CMS"
```
