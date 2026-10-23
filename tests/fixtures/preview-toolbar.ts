import { resolve } from 'node:path'
import { compile } from 'sass'

const root = resolve(import.meta.dirname, '../..')
export const previewToolbarCSS = [
  ...['scss/app.scss', 'elements/Gutter/index.scss', 'elements/Button/index.scss', 'elements/DocumentControls/index.scss']
    .map(file => compile(resolve(root, 'node_modules/@payloadcms/ui/dist', file)).css),
  compile(resolve(root, 'src/app/(payload)/custom.scss')).css,
  '.fixture-editor--sidebar { margin-left: 275px; } .fixture-fields { padding: 24px; }',
].join('\n')

function button(label: string, className = '', anchor = false) {
  const tag = anchor ? 'a' : 'button'
  const preview = className.startsWith('cms-preview-')
  return `<${tag} class="btn btn--size-medium btn--style-secondary btn--no-margin ${preview ? 'btn--icon btn--icon-position-left btn--icon-style-none' : ''} ${className}" ${anchor ? 'href="https://example.test/" target="_blank"' : 'type="button"'}><span class="btn__content"><span class="btn__label">${label}</span>${preview ? '<span class="btn__icon"><svg viewBox="0 0 24 24" aria-hidden="true"></svg></span>' : ''}</span></${tag}>`
}

// Mirrors DocumentControls' native nesting, including its separately rendered overflow menu.
export function previewToolbarMarkup(locale: string, feedback: string, dirty: boolean, sidebar: boolean) {
  return `<html lang="en" dir="ltr"><body><main class="fixture-editor ${sidebar ? 'fixture-editor--sidebar' : ''}"><div class="collection-edit"><div class="doc-controls gutter gutter--left gutter--right"><div class="doc-controls__wrapper">
    <div class="doc-controls__content"><ul class="doc-controls__meta">
      <li class="doc-controls__list-item doc-controls__status">Status: <strong>${dirty ? 'Changed — Revert to published' : 'Published'}</strong></li>
      <li class="doc-controls__list-item doc-controls__value-wrap"><p class="doc-controls__label">Last Modified: </p><p class="doc-controls__value">October 20th 2026, 6:33 PM</p></li>
      <li class="doc-controls__list-item doc-controls__value-wrap"><p class="doc-controls__label">Created: </p><p class="doc-controls__value">October 7th 2026</p></li>
    </ul></div>
    <div class="doc-controls__controls-wrapper"><div class="doc-controls__controls">
      <div class="cms-preview-action">${feedback ? `<span class="cms-translation-state" role="status">${feedback}</span>` : ''}
        <span class="${dirty ? 'cms-pending-state' : 'cms-sr-only'}" role="status">${dirty ? 'Unsaved changes' : 'Published'}</span>
        <div class="cms-preview-buttons" role="group" aria-label="Page preview">${button('Hide preview', 'cms-preview-toggle')}${button('Preview in new tab', 'cms-preview-new-tab', true)}</div>
      </div>
      ${button('Save Draft', 'fixture-save')}
      <div class="btn--withPopup">${button(`Publish in ${locale}`, 'fixture-publish')}<button class="popup-button btn btn--size-medium btn--no-margin fixture-publish-menu" type="button" aria-label="Publish options"><span class="btn__content">⌄</span></button></div>
    </div><div class="doc-controls__popup"><button class="doc-controls__dots" type="button" aria-label="More actions">⋮</button></div></div>
  </div><div class="doc-controls__divider"></div></div><section class="fixture-fields"><input value="Borin's unsaved text"></section></div></main></body></html>`
}
