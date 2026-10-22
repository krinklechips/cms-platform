import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { after, afterEach, test } from 'node:test'
import { compile } from 'sass'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import { chromiumExecutable, closeTypographyBrowser, closeTypographyPages, typographyBrowserVersion, typographyPage } from './fixtures/typography-browser'

// npm test does not require a website checkout. The complete release gate is:
// node scripts/test-typography.mjs --site-root <website> [--browser <Chromium>]
const complete = process.env.ROOMCHANG_TYPOGRAPHY_COMPLETE === '1'
const siteRoot = process.env.ROOMCHANG_TYPOGRAPHY_SITE_ROOT
const siteRequire = siteRoot ? createRequire(resolve(siteRoot, 'package.json')) : null
const cmsRoot = resolve(import.meta.dirname, '..')
const cmsRequire = createRequire(resolve(cmsRoot, 'package.json'))
const cmsCSS = compile(resolve(cmsRoot, 'src/app/(payload)/custom.scss')).css
const observerJS = ts.transpileModule(readFileSync(resolve(cmsRoot, 'src/lib/cms-content-typography.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const cmsOptions = { skip: !complete && !chromiumExecutable ? 'Chromium absent; run the complete typography command with --browser.' : false }
const siteOptions = { skip: !complete && !siteRoot ? 'Website fixture: run scripts/test-typography.mjs --site-root <website> for the complete gate.' : false }
afterEach(closeTypographyPages)
after(closeTypographyBrowser)

async function cmsDocument() {
  const page = await typographyPage(`<html lang="en"><head></head><body>
    <nav>English navigation</nav>
    <div class="field-type text"><label class="field-label">Title <span class="localized">Chinese</span></label><div class="field-type__wrap"><input id="title" type="text" value="Existing content"></div></div>
    <div class="field-type textarea"><label class="field-label">Description <span class="localized">Chinese</span></label><div class="field-type__wrap"><textarea id="description">Existing description</textarea></div></div>
    <div class="field-type rich-text-lexical"><label class="field-label">Body <span class="localized">Chinese</span></label><div id="body" contenteditable="true"><p>Existing body</p></div></div>
    <div class="field-type text"><label class="field-label">Shared slug</label><input id="slug" type="text" lang="en"></div>
    <input id="search" type="search"><input id="number" type="number">
  </body></html>`, `input, textarea, [contenteditable] { font: 13px/20px sans-serif; height: 38px; }
    .field-label { font-size: 13px; }\n${cmsCSS}`)
  await page.evaluate(`(() => { const exports = {}; ${observerJS}; window.observeTypography = exports.observeCmsContentTypography; })()`)
  return page
}

test('CMS editing text is at least 16px and labels are at least 14px without changing chrome', cmsOptions, async t => {
  const page = await cmsDocument()
  const sizes = await page.evaluate<Record<string, number>>(`Object.fromEntries(['#title','#description','.field-label','#search','#number'].map(selector => [selector, parseFloat(getComputedStyle(document.querySelector(selector)).fontSize)]))`)
  assert.ok(sizes['#title'] >= 16)
  assert.ok(sizes['#description'] >= 16)
  assert.ok(sizes['.field-label'] >= 14)
  assert.equal(sizes['#search'], 13)
  assert.equal(sizes['#number'], 13)
  t.diagnostic(JSON.stringify(await typographyBrowserVersion()))
})

for (const [code, lang, size, font] of [['cn', 'zh-Hans', 16, 'Noto Sans SC'], ['kh', 'km', 18, 'Battambang']] as const) {
  test(`CMS ${code} tags only localized text controls and gives stacked glyphs room`, cmsOptions, async () => {
    const page = await cmsDocument()
    const result = await page.evaluate<{
      controls: { id: string; lang: string; fontSize: string; lineHeight: string; fontFamily: string; letterSpacing: string }[]
      htmlLang: string; navLang: string | null; labelLang: string | null; slugLang: string; searchLang: string | null; value: string; restoredLang: string | null
    }>(`(() => {
      const cleanup = window.observeTypography(document, ${JSON.stringify(code)});
      const controls = ['title','description','body'].map(id => {
        const element = document.getElementById(id), style = getComputedStyle(element);
        return {id, lang:element.lang, fontSize:style.fontSize, lineHeight:style.lineHeight, fontFamily:style.fontFamily, letterSpacing:style.letterSpacing};
      });
      const result = {controls, htmlLang:document.documentElement.lang, navLang:document.querySelector('nav').getAttribute('lang'),
        labelLang:document.querySelector('.field-label').getAttribute('lang'), slugLang:document.getElementById('slug').lang,
        searchLang:document.getElementById('search').getAttribute('lang'), value:document.getElementById('title').value};
      cleanup(); return {...result, restoredLang:document.getElementById('title').getAttribute('lang')};
    })()`)
    for (const control of result.controls) {
      assert.equal(control.lang, lang)
      assert.ok(parseFloat(control.fontSize) >= size, `${control.id}: ${control.fontSize}`)
      const leading = parseFloat(control.lineHeight) / parseFloat(control.fontSize)
      assert.ok(leading >= 1.7 && leading <= 1.9, `${control.id}: ${control.lineHeight}/${control.fontSize}`)
      assert.match(control.fontFamily, new RegExp(font))
      assert.equal(control.letterSpacing === 'normal' ? 0 : parseFloat(control.letterSpacing), 0)
    }
    assert.equal(result.htmlLang, 'en'); assert.equal(result.navLang, null); assert.equal(result.labelLang, null)
    assert.equal(result.slugLang, 'en'); assert.equal(result.searchLang, null); assert.equal(result.value, 'Existing content')
    assert.equal(result.restoredLang, null)
  })
}

test('CMS typography follows locale changes and newly mounted array fields, then restores prior attributes', cmsOptions, async () => {
  const page = await cmsDocument()
  const result = await page.evaluate<{ firstRestore: string; arrayLang: string; titleLang: string; restoredLang: string; marker: boolean }>(`(async () => {
    const title = document.getElementById('title'); title.lang = 'fr';
    const chinese = window.observeTypography(document, 'cn'); chinese(); const firstRestore = title.lang;
    const khmer = window.observeTypography(document, 'kh');
    const field = document.querySelector('.field-type.text').cloneNode(true); field.querySelector('input').id = 'array-title'; document.body.append(field);
    await new Promise(resolve => setTimeout(resolve, 0));
    const arrayLang = document.getElementById('array-title').lang, titleLang = title.lang;
    khmer(); return {firstRestore, arrayLang, titleLang, restoredLang:title.lang, marker:title.hasAttribute('data-cms-content-typography')};
  })()`)
  assert.deepEqual(result, { firstRestore: 'fr', arrayLang: 'km', titleLang: 'km', restoredLang: 'fr', marker: false })
})

test('CMS typography rejects absent, malformed and all-locales selections', cmsOptions, async () => {
  const page = await cmsDocument()
  const result = await page.evaluate<{ invalid: (string | null)[]; english: string }>(`(() => {
    const invalid = [undefined,null,false,{},'all','constructor','__proto__','cn<script>'].map(code => {
      const cleanup = window.observeTypography(document, code); const lang = document.getElementById('title').getAttribute('lang'); cleanup(); return lang;
    });
    const cleanup = window.observeTypography(document, 'en'); const english = document.getElementById('title').lang; cleanup(); return {invalid,english};
  })()`)
  assert.deepEqual(result.invalid, Array(8).fill(null)); assert.equal(result.english, 'en')
})

test('CMS text inside localized arrays inherits the selected content language, not nearby shared fields', cmsOptions, async () => {
  const page = await cmsDocument()
  const result = await page.evaluate<{ tag: string; shared: string | null }>(`(() => {
    document.body.insertAdjacentHTML('beforeend', '<div class="field-type array-field"><header class="array-field__header"><h3><span class="field-label">Tags <span class="localized">Khmer</span></span></h3></header><div class="field-type text"><label class="field-label">Tag</label><input id="tag" type="text"></div></div><div class="field-type array-field"><div class="field-type text"><label class="field-label">Shared tag</label><input id="shared-tag" type="text"></div></div>');
    const cleanup = window.observeTypography(document, 'kh');
    const result = {tag:document.getElementById('tag').lang, shared:document.getElementById('shared-tag').getAttribute('lang')}; cleanup(); return result;
  })()`)
  assert.deepEqual(result, { tag: 'km', shared: null })
})

function renderSiteComponent(path: string, name: string, props = {}) {
  assert.ok(siteRoot, 'Complete typography gate requires --site-root <website checkout>.')
  const { outputText } = ts.transpileModule(readFileSync(resolve(siteRoot, path), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  })
  const compiledModule = { exports: {} as Record<string, unknown> }
  const requireComponent = (specifier: string) => {
    if (specifier === 'next-intl') return { useTranslations: () => (key: string) => key }
    if (specifier === '@/i18n/navigation') return { Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => React.createElement('a', props, children) }
    if (specifier === 'next/image') return { __esModule: true,
      default: ({ fill: _fill, priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => React.createElement('img', props) }
    if (specifier === './language-switcher' || specifier === './mobile-nav') return { LanguageSwitcher: () => null, MobileNav: () => null }
    return cmsRequire(specifier)
  }
  new Function('require', 'module', 'exports', outputText)(requireComponent, compiledModule, compiledModule.exports)
  return renderToStaticMarkup(React.createElement(compiledModule.exports[name] as React.ComponentType, props))
}

async function siteDocument(lang: string, width: number) {
  const markup = renderSiteComponent('src/components/sections/home-stats.tsx', 'HomeStats', {
    stats: [{ numeric_value: 37, suffix: '+', display_value: '37+', label: 'Localized stat label' }],
  }) + renderSiteComponent('src/components/site/site-header.tsx', 'SiteHeader')
  const html = `<html lang="${lang}"><head></head><body>${markup}<p id="body-text">Body text</p><p id="small-label" class="text-sm tracking-[0.2em]">Small label</p><h2 class="text-3xl">Heading</h2></body></html>`
  const page = await typographyPage(html, '', width)
  const candidates = await page.evaluate<string[]>(`Array.from(document.querySelectorAll('[class]')).flatMap(element => Array.from(element.classList))`)
  const { compile } = siteRequire!('@tailwindcss/node')
  const compiler = await compile(readFileSync(resolve(siteRoot!, 'src/app/globals.css'), 'utf8'), { base: siteRoot, onDependency: () => {} })
  // The browser receives actual compiler output, including unmodified layers,
  // media, :lang and escaped Tailwind selectors.
  await page.evaluate(`(() => {const style=document.createElement('style'); style.textContent=${JSON.stringify(compiler.build(candidates))}; document.head.append(style);})()`)
  return page
}

for (const [lang, minimum] of [['en', 14], ['zh', 16], ['km', 18]] as const) {
  test(`website ${lang} stat labels remain readable without collapsing display hierarchy`, siteOptions, async t => {
    const page = await siteDocument(lang, 1366)
    const result = await page.evaluate<{ labelSize: number; lineHeight: number; tracking: string; displaySize: number; smallLabelSize: number }>(`(() => {
      const label=Array.from(document.querySelectorAll('p')).find(element=>element.textContent==='Localized stat label'); const style=getComputedStyle(label);
      return {labelSize:parseFloat(style.fontSize),lineHeight:parseFloat(style.lineHeight),tracking:style.letterSpacing,
        displaySize:parseFloat(getComputedStyle(document.querySelector('p.font-display')).fontSize),smallLabelSize:parseFloat(getComputedStyle(document.getElementById('small-label')).fontSize)};
    })()`)
    t.diagnostic(JSON.stringify({ language: lang, width: 1366, ...result }))
    assert.ok(result.labelSize >= minimum, `label is ${result.labelSize}px; minimum ${minimum}px`)
    assert.ok(result.displaySize > minimum)
    if (lang !== 'en') {
      // CSSOM reports "normal" for zero added tracking, not necessarily "0px".
      assert.equal(result.tracking === 'normal' ? 0 : parseFloat(result.tracking), 0)
      assert.ok(result.smallLabelSize >= minimum)
    }
    if (lang === 'km') assert.ok(result.lineHeight / result.labelSize >= 1.7)
  })
}

test('website uses the compact nav at laptop widths and readable full nav on wide screens', siteOptions, async t => {
  const observed = []
  for (const width of [1024, 1280, 1366, 1440, 1536, 1920]) {
    const page = await siteDocument('en', width)
    const state = await page.evaluate<{ full: string; compact: string; size: number }>(`(() => {
      const nav=document.querySelector('header nav'), desktop=nav.parentElement;
      return {full:getComputedStyle(desktop).display,compact:getComputedStyle(desktop.nextElementSibling).display,size:parseFloat(getComputedStyle(nav.querySelector('a')).fontSize)};
    })()`)
    observed.push({ width, full: state.full, compact: state.compact, readable: width < 1536 || state.size >= 14 })
    await page.close()
  }
  t.diagnostic(JSON.stringify({ language: 'en', navigation: observed }))
  assert.deepEqual(observed, [
    { width: 1024, full: 'none', compact: 'flex', readable: true },
    { width: 1280, full: 'none', compact: 'flex', readable: true },
    { width: 1366, full: 'none', compact: 'flex', readable: true },
    { width: 1440, full: 'none', compact: 'flex', readable: true },
    { width: 1536, full: 'flex', compact: 'none', readable: true },
    { width: 1920, full: 'flex', compact: 'none', readable: true },
  ])
})

test('Khmer keeps the compact nav until the full-size labels fit on one line', siteOptions, async t => {
  const observed = []
  for (const width of [1536, 1799, 1800, 1920]) {
    const page = await siteDocument('km', width)
    const state = await page.evaluate<{ full: string; compact: string }>(`(() => {const desktop=document.querySelector('header nav').parentElement;
      return {full:getComputedStyle(desktop).display,compact:getComputedStyle(desktop.nextElementSibling).display};})()`)
    observed.push({ width, ...state }); await page.close()
  }
  t.diagnostic(JSON.stringify({ language: 'km', navigation: observed }))
  assert.deepEqual(observed, [
    { width: 1536, full: 'none', compact: 'flex' },
    { width: 1799, full: 'none', compact: 'flex' },
    { width: 1800, full: 'flex', compact: 'none' },
    { width: 1920, full: 'flex', compact: 'none' },
  ])
})
