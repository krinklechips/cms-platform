# Compact CMS Header

## Approved Direction

The user's 26 October Roomchang and Gmail screenshots are the reference: the
menu and full brand share one compact top-left row; no duplicate flower in the
content breadcrumb. This completes the previously requested Gmail-like shell,
not a change to editorial navigation, publishing or information architecture.

Use the existing tenant identity resolver and native nav state/preferences.
Keep the brand/dashboard link visible with the sidebar closed, a 40px borderless
menu hit target, a 240px desktop sidebar, and readable locale/account controls.
At narrow widths put breadcrumbs on a separate row rather than over the logo.
Retain the Preview workspace marker in the navigation and preserve dark-mode
branding. Do not modify accounts, content, drafts, assets, database or email.

## Execution

- [x] Reproduce the structural mismatch using real component markup and shipped CSS in Chromium.
- [x] Move menu and existing tenant branding into a shared header; remove duplicate sidebar/content branding and keep native toggle behavior.
- [x] Verify EN/KH/CN, open/closed sidebar, light/dark, mobile/desktop and unsaved input preservation. Full suite: 717 pass, 7 skips, 0 failures. Final production build rechecked after reverting dev-generated type churn.
- [ ] Review, deploy only the CMS/test integration, verify the shipped assets and unchanged editorial data. Leave website production and email unchanged.

## Validation Notes

- Real component markup plus unchanged shipped Payload CSS: 84 geometry cases
  across seven widths, three locale labels, open/closed and light/dark states.
- Native local CMS browser login and unsaved field/toggle checks passed in
  EN/KH/CN. The fixture uses its own new SQLite database and synthetic account;
  no hosted account, document or draft was edited or published.
- Independent review found two P2 issues: brand lookup failure hid the menu,
  and mobile sidebar top ignored the breadcrumb row. Both have reproduced RED
  tests and fixes. No schema or generated types belong to this UI release.
