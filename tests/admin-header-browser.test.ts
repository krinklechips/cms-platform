import assert from 'node:assert/strict'
import { after, afterEach, test } from 'node:test'
import { adminHeaderCSS, adminHeaderMarkup } from './fixtures/admin-header'
import { chromiumExecutable, closeTypographyBrowser, closeTypographyPages, typographyPage } from './fixtures/typography-browser'

afterEach(closeTypographyPages)
after(closeTypographyBrowser)
test('mobile sidebar starts below both header rows, not underneath breadcrumbs', { skip: chromiumExecutable ? false : 'Chromium required' }, async () => {
  const page = await typographyPage(await adminHeaderMarkup('ខ្មែរ', true), adminHeaderCSS, 390, true)
  const geometry = await page.evaluate<{ top: number; bottom: number }>(`({ top: document.querySelector('.cms-tenant-nav').getBoundingClientRect().top, bottom: document.querySelector('.app-header').getBoundingClientRect().bottom })`)
  assert.ok(geometry.top >= geometry.bottom, `Sidebar at ${geometry.top}px overlaps header ending at ${geometry.bottom}px`)
})
for (const locale of ['English', 'ខ្មែរ', '中文']) test(`${locale}: Gmail-style menu/brand row stays flush with no content-logo duplication`, {
  skip: chromiumExecutable ? false : 'Chromium required for header geometry', timeout: 90000,
}, async t => {
  for (const width of [1920, 1440, 1280, 1024, 768, 390, 320]) for (const open of [true, false]) for (const dark of [false, true]) {
    const page = await typographyPage(await adminHeaderMarkup(locale, open, dark), adminHeaderCSS, width, true)
    await page.evaluate(`Promise.all([...document.images].map(image => image.decode().catch(() => {})))`)
    const result = await page.evaluate<{
      sharedRow: boolean; centered: boolean; menuWidth: number; menuBorder: string; brandLoaded: boolean;
      duplicateVisible: boolean; brandVisible: boolean; controlsContained: boolean; controlsOverlap: boolean; navigationWidth: number; input: string
    }>(`(() => {
      const menu = document.querySelector('.cms-sidebar-control'), brand = document.querySelector('.tenant-identity > a');
      const rect = el => el.getBoundingClientRect();
      const m = rect(menu), b = rect(brand), account = rect(document.querySelector('.app-header__account')), locale = rect(document.querySelector('.app-header__localizer'));
      const visible = el => !!el && getComputedStyle(el).display !== 'none' && rect(el).width > 0 && rect(el).right > 0;
      const overlap = (a,b) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
      const image = brand.querySelector('img');
      return { sharedRow: !!menu.closest('.cms-workspace-header')?.contains(brand), centered: Math.abs(m.top+m.height/2-b.top-b.height/2) <= 1,
        menuWidth: m.width, menuBorder: getComputedStyle(menu).borderTopWidth, brandLoaded: image.complete && image.naturalWidth > 0,
        duplicateVisible: visible(document.querySelector('.step-nav__home')), brandVisible: visible(brand),
        controlsContained: [m,b,account,locale].every(r=>r.left>=0 && r.right<=innerWidth+1 && r.top>=0),
        controlsOverlap: overlap(m,b)||overlap(b,locale)||overlap(b,account)||overlap(locale,account), navigationWidth: rect(document.querySelector('.cms-tenant-nav')).width,
        input: document.querySelector('input').value };
    })()`)
    t.diagnostic(JSON.stringify({ width, open, dark, locale, ...result }))
    assert.equal(result.sharedRow, true, 'Menu and full brand must share a real header row, not separate fixed positions')
    assert.equal(result.centered, true, `${width}px menu and brand must share a center line`)
    assert.equal(result.menuWidth, 40)
    assert.equal(result.menuBorder, '0px')
    assert.equal(result.brandLoaded, true)
    assert.equal(result.duplicateVisible, false, 'Remove the extra tiny content-side logo and its redundant home link')
    assert.equal(result.brandVisible, true, 'The full brand must remain visible when the sidebar is collapsed')
    assert.equal(result.controlsContained, true)
    assert.equal(result.controlsOverlap, false)
    assert.ok(result.navigationWidth <= 240, 'Tenant sidebar must be compact')
    assert.equal(result.input, "Borin's unsaved text")
    await page.close()
  }
})
