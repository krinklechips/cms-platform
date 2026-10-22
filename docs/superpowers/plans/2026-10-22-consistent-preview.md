# Consistent Editorial Preview Implementation Plan

> **For agentic workers:** Execute inline using superpowers:executing-plans. Steps use checkbox syntax for tracking.

**Goal:** Give website-content editors the same inline preview and explicit show/hide control.

**Architecture:** Reuse Payload's LivePreviewProvider and existing URL resolver. Initialize each eligible editor once, independently of obsolete per-collection preferences; toggling only changes panel state. Retain native iframe and save-event refresh behavior.

**Tech Stack:** Payload 3.91.0, React 19, Next 16, node:test and happy-dom.

**Spec:** User-approved proposal in this chat: consistent right-hand preview, visible show/hide control, correct page and language, no previews for media/inboxes/audit logs, no changes to Borin's content or drafts.

## Global Constraints
- No content writes, imports, seeds, migrations, translation updates or draft restoration.
- Keep existing preview routes, authentication, overwrite protection and version history.
- Preview shows saved drafts; publishing remains a separate action.

## Review Focus
- A previously closed collection must still open consistently on desktop.
- Save/re-render must not reopen a panel the editor just hid.
- Dirty fields must survive panel changes without submission or popup windows.
- New documents, drawers and unmapped content must not show a misleading panel.
- Mobile must retain usable full-width fields and preview without overflow.

### Task 1: Shared Panel Control
**Files:** Modify `src/components/PublishingStatus.tsx`, `src/app/(payload)/custom.scss`, `src/payload.config.ts`; add `tests/publishing-preview-ui.test.ts`.
- [x] Write and run failing component tests for initialization, explicit hide/show, dirty/processing state, mobile, missing targets and drawers.
- [x] Replace popup action with native inline state control; initialize once per editor, desktop open/mobile closed. Keep a single visible accessible control and full-width mobile preview.
- [x] Run component tests and TypeScript verification.

### Task 2: Route And Deployment Verification
**Files:** Extend `tests/preview-routes.test.ts`; document behavior in `docs/EDITORIAL_PREVIEW.md`.
- [x] Assert default preview configuration, complete editorial mappings in EN/KH/CN and non-content exclusions.
- [x] Run focused tests, full suite and production build; get an independent code review.
- [ ] Take a fresh read-only content/version baseline, commit and deploy the CMS to its existing test-site integration.
- [ ] Check hosted inline previews, locale/page targets, hide/show and mobile using separate agent-owned tabs only.
- [ ] Compare original database rows without restoring or overwriting any concurrent staff updates; record evidence.

## Execution Notes
- Existing clean CMS clone is the established deployment checkout; no new worktree is necessary.
- Desktop means above Payload's 1024px medium breakpoint. On smaller screens the preview replaces the visible form, without unmounting fields; hiding it returns to the form.
- Local verification: 404 passing tests, 12 environment-dependent skips, zero failures; production build and TypeScript pass. Independent review's mobile selector finding corrected; repeated iframe readiness resets prevented by a failing-then-passing regression test.
- Fresh preservation baseline: 57,731 existing rows across 480 editorial/media/version tables. Hosted draft-entry and page-language checks passed for statistics, services, pricing and branches in all three languages without content writes.
