import assert from 'node:assert/strict'
import { after, afterEach, test } from 'node:test'
import { chromiumExecutable, closeTypographyBrowser, closeTypographyPages, typographyPage } from './fixtures/typography-browser'

const options = { skip: !chromiumExecutable && process.env.ROOMCHANG_TYPOGRAPHY_COMPLETE !== '1' ? 'Chromium unavailable; run the complete typography command with --browser.' : false }
afterEach(closeTypographyPages)
after(closeTypographyBrowser)

test('real Chromium inherits BCP47 languages and follows explicit language resets', options, async () => {
  const page = await typographyPage('<html lang="km"><head></head><body><p id="khmer">Khmer</p><section lang="zh-Hans"><p id="chinese">Chinese</p></section><p id="shared" lang="en">Shared</p><p id="empty" lang="">Unspecified</p></body></html>',
    'p {font-size:13px} :lang(km) {font-size:18px} :lang(zh) {font-size:16px}')
  const result = await page.evaluate<{ before: number[]; after: number[] }>(`(() => {
    const sizes=()=>['khmer','chinese','shared','empty'].map(id=>parseFloat(getComputedStyle(document.getElementById(id)).fontSize));
    const before=sizes(); document.documentElement.lang='en'; return {before,after:sizes()}; })()`)
  assert.deepEqual(result, { before: [18, 16, 13, 13], after: [13, 16, 13, 13] })
})

test('real Chromium resolves raw layers, media, escaped classes and importance with negative controls', options, async () => {
  const page = await typographyPage('<html lang="km"><head></head><body><p class="2xl:tracking">Khmer</p></body></html>', String.raw`
    @layer utilities { @media (width >= 96rem) { .\32 xl\:tracking {font-size:20px;letter-spacing:.2em} } }
    :lang(km) * {letter-spacing:normal !important}
    p {font-size:18px}
  `, 1920)
  const read = () => page.evaluate<{ size: string; tracking: string }>(`(() => {const style=getComputedStyle(document.querySelector('p'));return {size:style.fontSize,tracking:style.letterSpacing};})()`)
  assert.deepEqual(await read(), { size: '18px', tracking: 'normal' })
  await page.evaluate(`document.styleSheets[0].deleteRule(2)`)
  assert.deepEqual(await read(), { size: '20px', tracking: 'normal' }, 'Removing the unlayered source rule exposes the actual escaped Tailwind class')
  await page.evaluate(`document.styleSheets[0].deleteRule(1)`)
  const unprotected = await read()
  assert.deepEqual(unprotected, { size: '20px', tracking: '4px' }, 'Removing the actual important rule exposes nonzero tracking')
  assert.throws(() => assert.equal(parseFloat(unprotected.tracking), 0), 'A real CSS source mutation must fail the original zero-tracking assertion')
})
