import assert from 'node:assert/strict'
import { after, afterEach, test } from 'node:test'
import { chromiumExecutable, closeTypographyBrowser, closeTypographyPages, typographyPage } from './fixtures/typography-browser'
import { previewToolbarCSS, previewToolbarMarkup } from './fixtures/preview-toolbar'

const options = { skip: !chromiumExecutable ? 'Chromium required for preview toolbar layout verification.' : false }
afterEach(closeTypographyPages)
after(closeTypographyBrowser)

for (const [locale, feedback] of [['English', ''], ['ខ្មែរ', 'Khmer: 1 empty translation field'], ['中文', 'Chinese: 12 empty translation fields']] as const) {
  test(`${locale}: preview pair stays horizontal and controls remain contained at desktop, mobile and zoom-equivalent widths`, options, async t => {
    for (const width of [1920, 1536, 1440, 1280, 1024, 768, 640, 390, 320]) {
      for (const dirty of [false, true]) {
        const page = await typographyPage(previewToolbarMarkup(locale, feedback, dirty, width > 1024), previewToolbarCSS, width)
        const state = await page.evaluate<{
          horizontal: boolean; contained: boolean; separated: boolean; feedbackSeparated: boolean; labelsContained: boolean; publishingAligned: boolean; value: string; height: number; viewport: number
        }>(`(() => {
          const box = selector => document.querySelector(selector).getBoundingClientRect();
          const toolbar = box('.doc-controls'), first = box('.cms-preview-toggle'), second = box('.cms-preview-new-tab');
          const controls = ['.cms-preview-toggle', '.cms-preview-new-tab', '.fixture-save', '.fixture-publish', '.fixture-publish-menu', '.doc-controls__dots'].map(box);
          const feedback = document.querySelector('.cms-translation-state')?.getBoundingClientRect();
          const overlap = (a, b) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
          return {
            horizontal: Math.abs(first.top - second.top) <= 1 && Math.abs(first.height - second.height) <= 1 && first.right <= second.left + 1,
            contained: controls.every(b => b.left >= toolbar.left - 1 && b.right <= toolbar.right + 1 && b.top >= toolbar.top - 1 && b.bottom <= toolbar.bottom + 1),
            separated: controls.every((a, i) => controls.slice(i + 1).every(b => !overlap(a, b))),
            feedbackSeparated: !feedback || controls.every(b => !overlap(feedback, b)),
            publishingAligned: Math.abs(box('.fixture-save').bottom - box('.fixture-publish').bottom) <= 1,
            labelsContained: [...document.querySelectorAll('.cms-preview-buttons .btn__label')].every(label => {
              const text = label.getBoundingClientRect(), control = label.closest('.btn').getBoundingClientRect();
              return text.left >= control.left && text.right <= control.right && text.top >= control.top && text.bottom <= control.bottom && label.scrollWidth <= label.clientWidth + 1;
            }),
            value: document.querySelector('input').value, height: toolbar.height, viewport: innerWidth,
          };
        })()`)
        t.diagnostic(JSON.stringify({ width, dirty, locale, ...state }))
        assert.equal(state.viewport, width, 'Use the requested CSS viewport, not a resized screenshot')
        assert.equal(state.horizontal, true, `${width}px: the preview buttons must stay side by side`)
        assert.equal(state.contained, true, `${width}px: toolbar controls must not overflow`)
        assert.equal(state.separated, true, `${width}px: toolbar controls must not overlap`)
        assert.equal(state.feedbackSeparated, true, `${width}px: translation status must not overlap controls`)
        assert.equal(state.labelsContained, true, `${width}px: preview labels must fit inside their buttons`)
        assert.equal(state.publishingAligned, true, `${width}px: save and publish buttons must share a baseline`)
        assert.equal(state.value, "Borin's unsaved text")
        await page.close()
      }
    }
  })
}
