# Kardal-Inspired SaaS CMS Redesign

## Goal

Refactor the current multi-tenant SaaS CMS so that both the platform admin view and the tenant workspace inherit the clarity, cleanliness, and workflow discipline of Kardal CMS while retaining the SaaS CMS brand colors, logos, and simpler product scope.

This redesign is not a full visual rebrand and not a portal-scale feature expansion. The objective is to make the current system feel more premium and usable by:

- simplifying layout structure
- making navigation hierarchy clearer
- standardizing CRUD flows
- separating configuration workflows from content workflows
- making admin and tenant surfaces feel like one coherent product

## Product Positioning

The SaaS CMS should not become a clone of Kardal Unified Portal. Kardal is a much broader enterprise platform with many domain modules. The SaaS CMS should instead borrow Kardal's strengths:

- cleaner information architecture
- shallower navigation paths
- better page ownership
- clearer list/create/edit/delete flows
- more disciplined component hierarchy

The SaaS CMS remains a control panel product with dashboard-style overviews, not a single-task editor application.

## Key Problems In Current SaaS CMS

### 1. Page responsibility is blurred

Several screens currently behave like multiple pages stacked into one:

- listing, editing, filtering, and settings share the same viewport
- nested cards create visual clutter
- users do not know which section owns the current action

### 2. Navigation hierarchy is noisy

The sidebar currently makes top-level groups, submenu items, and active states feel too similar. This causes:

- poor scanability
- unclear location awareness
- weak affordance for changing sections

### 3. Admin and tenant experiences do not feel unified

Although they share some styling, the interaction patterns are inconsistent:

- button hierarchy differs
- content layout patterns differ
- editing surfaces differ
- state messaging is inconsistent

### 4. CRUD behavior is inconsistent

Some entities have partial CRUD behavior, some are mixed into unrelated pages, and some use awkward inline editing. This makes the CMS feel unreliable even when the backend route exists.

### 5. Configuration and content editing are mixed

Some screens mix:

- branding and support settings
- domain setup
- module access
- user administration
- content management

These are different jobs and should not compete on the same screen.

## Approved Direction

The redesign should follow these rules:

- keep the current SaaS CMS colors and logos
- reduce visual complexity
- borrow the workflow cleanliness of Kardal CMS
- keep the CMS in control-panel mode rather than converting it into a pure workspace editor
- implement clear CRUD surfaces for the entities that truly need CRUD

## Experience Principles

### 1. One page, one responsibility

Every major page should have a dominant job.

Examples:

- Tenant Directory: find and select tenants
- Create Tenant: onboard a new tenant
- Edit Tenant: configure one tenant
- Tenant Users: manage user access for one tenant
- Articles: manage article records
- Media Library: manage uploads and linked assets

### 2. CRUD should feel deliberate

Every CRUD-enabled module should follow the same behavioral pattern:

1. list or table
2. filters/search
3. create button
4. edit action
5. delete action
6. selected-item editor or creation form
7. success/error/loading state

### 3. Configuration is not CRUD

These areas should remain form-based configuration surfaces rather than generic CRUD:

- branding
- domains
- module access
- support details
- site section toggles

### 4. Navigation should explain the product

The sidebar should teach the product structure.

Top-level groups should represent jobs, not just arbitrary buckets. Submenu items should represent real pages, not scroll anchors or partial sections.

### 5. Actions must have stable hierarchy

Across admin and tenant views:

- one primary action per region
- secondary actions outlined or ghost
- destructive actions red and isolated
- navigation actions should not look like save actions

## Target Information Architecture

## Platform Admin

### Top-Level Sidebar Groups

- Operations
- Customers / Tenants
- Integrations & Access
- Content

Depending on final implementation, Content may remain under tenant-scoped editing instead of becoming a global top-level group. The key requirement is that content modules are pages, not stacked subsections on unrelated tenant setup screens.

### Admin Pages

#### Operations

- Storage Diagnostics
- DB Backups

#### Customers / Tenants

- Tenant Directory
- Create Tenant
- Edit Selected Tenant

#### Integrations & Access

- Domain Provisioning
- Tenant Users
- Module Access
- Support Details

#### Content

- Articles
- Media Library
- Annual Reports
- Homepage Placements
- Site Navigation or Navigation Tabs if that feature remains active

## Tenant Workspace

### Tenant Sidebar Pages

- Overview
- Articles
- Media
- Annual Reports
- Site Preview Data
- Account & Security

Homepage placements may remain separate if tenants actively manage them. If homepage slot editing is only occasionally used, it should sit under Site Preview Data rather than appear as a first-class page.

## Page Patterns

### Shared Shell Pattern

Both admin and tenant views should use the same shell language:

- left sidebar with clearer grouped hierarchy
- stable top header
- page title and subtitle region
- one action/filter row
- main data surface

This gives product consistency even when page content differs.

### Header

The header should be simplified and standardized:

- left: page title and concise subtitle
- right: mode switch, current workspace selector if relevant, user identity chip, sign out

All controls in the right cluster should share:

- the same visual height
- the same corner radius family
- consistent text sizing

### Sidebar

The sidebar should adopt Kardal's cleanliness without copying its domain complexity:

- clearer section labels
- icons on meaningful group/page items
- lighter subitem treatment
- a true accordion model
- stronger active state contrast for the current page only

Submenu items should route to actual pages or views. They should never behave like scroll targets disguised as navigation.

## CRUD Surface Specifications

## 1. Tenants

### Pages

- Tenant Directory
- Create Tenant
- Edit Tenant

### Pattern

- directory page shows search, filters, and tenant table
- create page focuses only on onboarding fields
- edit page focuses only on selected tenant configuration

### Edit Tenant Tabs

- Branding
- Domains
- Support
- Users
- Content Modules

Each tab owns a real content area. Tabs should not feel like pseudo-buttons or stacked mini-panels.

## 2. Tenant Users

Tenant user management should become a dedicated management page or dedicated tenant tab with full clarity.

Capabilities:

- create user
- set or reset password
- update role
- update status
- remove access

The page should contain:

- top summary
- create/update form
- user table
- action buttons with standardized meaning

## 3. Articles

Articles are the primary editorial CRUD reference pattern.

### Required pattern

- article table at top
- create action
- row-level edit
- row-level delete
- editor card below or beside the table
- clear draft/published/category state

### Category handling

Category handling must be aligned across admin, tenant, and public rendering. A mismatch between default category values is product debt and should be removed.

### Editor scope

For this redesign pass, the article body may remain a plain textarea if rich text is not yet implemented, but the editor must feel intentional and consistent. If rich text is later introduced, it should preserve the same overall page structure.

## 4. Media Library

Media should be a dedicated library surface rather than a secondary table on another page.

Required behaviors:

- upload
- list
- delete
- asset metadata display
- copy/open link action if relevant

## 5. Annual Reports

Annual reports should follow the same CRUD shape:

- list
- create/edit form
- PDF/asset selection
- delete

## 6. Homepage Placements / Site Preview Data

This surface should be task-specific and separated from articles. It is not a generic content editor; it is a placement/configuration surface that references other content or slot items.

## Visual System Direction

The redesign should remain within the current SaaS color palette but be simplified significantly.

### Layout language

- fewer nested cards
- more whitespace between page regions
- stronger typography hierarchy
- flatter surfaces where possible
- only use bordered cards where they improve grouping

### Card usage

Use cards deliberately:

- a major table or form surface can be a card
- page header should not feel like a card inside a card
- tabs should not live inside unnecessary pill containers

### Typography

Hierarchy should be explicit:

- page title: strong, large
- page subtitle: muted, concise
- section heading: medium emphasis
- helper copy: smaller and quieter
- table headers: compact and crisp

### Buttons

Standardize buttons across admin and tenant:

- primary: filled
- secondary: outline
- ghost: low-emphasis navigation or refresh actions
- destructive: red outline or filled red depending on severity

Buttons on the same row should have:

- matching height
- consistent padding
- consistent icon alignment

### Status Messaging

State feedback must be quieter and more consistent:

- save success should be subtle
- unsaved changes should be explicit
- errors should be local to the affected module
- global notices should be used sparingly

## Recommended Structural Refactor

### Admin Refactor

#### Phase 1

- clean the shell
- simplify the sidebar
- simplify the top header
- normalize buttons, tables, and tabs

#### Phase 2

- move each major module into a real page/view
- remove stacked same-screen sections
- restructure tenant detail into clean tab-owned content

#### Phase 3

- normalize CRUD patterns for tenants, tenant users, articles, media, annual reports, and placements

### Tenant Refactor

#### Phase 1

- align shell with admin
- simplify metrics/dashboard layout
- reduce visual clutter in cards and forms

#### Phase 2

- split editorial modules into dedicated views
- standardize list/editor pattern
- unify category and state handling

#### Phase 3

- improve site preview and content-to-public rendering clarity

## Technical Constraints

- no business logic changes should be made unless required to complete broken CRUD behavior
- existing routes should be reused where possible
- missing routes can be added only where the current UI claims a CRUD capability that does not truly exist
- admin and tenant should continue to work as separate host-aware modes

## Implementation Priorities

### Priority 1: Shell and Navigation

Highest impact and least risky.

- sidebar hierarchy
- top header cleanup
- page title/subtitle consistency
- shared button and form language

### Priority 2: Admin Page Ownership

- tenant directory
- create tenant
- edit tenant
- users
- domains
- module access

### Priority 3: Tenant CRUD Cleanup

- articles
- media
- annual reports
- site preview data

### Priority 4: Public Content Consistency

- ensure content categories and public sections align
- ensure admin/tenant authored content appears where users expect

## Success Criteria

The redesign succeeds when:

- admin and tenant feel like one coherent product
- every sidebar item routes to a real page/view
- each major page has one clear responsibility
- CRUD modules share a repeatable pattern
- buttons, cards, tabs, and status messages feel standardized
- the product feels significantly less messy without changing brand colors
- the SaaS CMS becomes easier to extend without inheriting the full complexity of Kardal Portal

## What This Redesign Does Not Attempt

- full Kardal portal parity
- expansion into unrelated enterprise domains
- immediate replacement of plain textarea editing with rich text editing unless separately approved
- unrestricted layout editing on public websites

The redesign is focused on discipline, clarity, and workflow quality first.
