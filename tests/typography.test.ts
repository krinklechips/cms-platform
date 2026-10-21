import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { compile } from 'sass'

// Reuse the site's installed DOM tooling without adding CMS dependencies.
const siteRoot = process.env.ROOMCHANG_TYPOGRAPHY_SITE_ROOT
const siteTest = siteRoot ? test : test.skip
const siteRequire = siteRoot ? createRequire(resolve(siteRoot, 'package.json')) : null
const cmsRoot = resolve(import.meta.dirname, '..')
const cmsCSS = compile(resolve(cmsRoot, 'src/app/(payload)/custom.scss')).css

function cmsDocument() {
  const { JSDOM } = siteRequire!('jsdom')
  return new JSDOM(`<html lang="en"><head><style>
    input, textarea, [contenteditable] { font: 13px/20px sans-serif; height: 38px; }
    .field-label { font-size: 13px; }
    ${cmsCSS}
  </style></head><body>
    <nav>English navigation</nav>
    <div class="field-type text"><label class="field-label">Title <span class="localized">Chinese</span></label><div class="field-type__wrap"><input id="title" type="text" value="Existing content"></div></div>
    <div class="field-type textarea"><label class="field-label">Description <span class="localized">Chinese</span></label><div class="field-type__wrap"><textarea id="description">Existing description</textarea></div></div>
    <div class="field-type rich-text-lexical"><label class="field-label">Body <span class="localized">Chinese</span></label><div id="body" contenteditable="true"><p>Existing body</p></div></div>
    <div class="field-type text"><label class="field-label">Shared slug</label><input id="slug" type="text" lang="en"></div>
    <input id="search" type="search"><input id="number" type="number">
  </body></html>`)
}

async function typography() {
  assert.ok(existsSync(resolve(cmsRoot, 'src/lib/cms-content-typography.ts')), 'locale-aware typography adapter is missing')
  return import('../src/lib/cms-content-typography')
}

siteTest('CMS editing text is at least 16px and labels are at least 14px without changing chrome', () => {
  const dom = cmsDocument()
  const style = (selector: string) => dom.window.getComputedStyle(dom.window.document.querySelector(selector))
  assert.ok(parseFloat(style('#title').fontSize) >= 16)
  assert.ok(parseFloat(style('#description').fontSize) >= 16)
  assert.ok(parseFloat(style('.field-label').fontSize) >= 14)
  assert.equal(style('#search').fontSize, '13px')
  assert.equal(style('#number').fontSize, '13px')
  dom.window.close()
})

for (const [code, lang, size, font] of [['cn', 'zh-Hans', 16, 'Noto Sans SC'], ['kh', 'km', 18, 'Battambang']] as const) {
  siteTest(`CMS ${code} tags only localized text controls and gives stacked glyphs room`, async () => {
    const { observeCmsContentTypography } = await typography()
    const dom = cmsDocument()
    const document = dom.window.document
    const cleanup = observeCmsContentTypography(document, code)
    for (const id of ['title', 'description', 'body']) {
      const element = document.getElementById(id)!
      const style = dom.window.getComputedStyle(element)
      assert.equal(element.lang, lang)
      assert.ok(parseFloat(style.fontSize) >= size, `${id}: ${style.fontSize}`)
      assert.ok(parseFloat(style.lineHeight) >= 1.7 && parseFloat(style.lineHeight) <= 1.9, `${id}: ${style.lineHeight}`)
      assert.match(style.fontFamily, new RegExp(font))
      assert.equal(style.letterSpacing, '0px')
    }
    assert.equal(document.documentElement.lang, 'en')
    assert.equal(document.querySelector('nav')!.getAttribute('lang'), null)
    assert.equal(document.querySelector('.field-label')!.getAttribute('lang'), null)
    assert.equal(document.getElementById('slug')!.lang, 'en')
    assert.equal(document.getElementById('search')!.getAttribute('lang'), null)
    assert.equal(document.getElementById('title')!.value, 'Existing content')
    cleanup()
    assert.equal(document.getElementById('title')!.getAttribute('lang'), null)
    dom.window.close()
  })
}

siteTest('CMS typography follows locale changes and newly mounted array fields, then restores prior attributes', async () => {
  const { observeCmsContentTypography } = await typography()
  const dom = cmsDocument()
  const document = dom.window.document
  const title = document.getElementById('title')!
  title.lang = 'fr'
  const cleanupChinese = observeCmsContentTypography(document, 'cn')
  cleanupChinese()
  assert.equal(title.lang, 'fr')
  const cleanupKhmer = observeCmsContentTypography(document, 'kh')
  const field = document.querySelector('.field-type.text')!.cloneNode(true)
  field.querySelector('input').id = 'array-title'
  document.body.append(field)
  await new Promise((resolve) => dom.window.setTimeout(resolve, 0))
  assert.equal(document.getElementById('array-title')!.lang, 'km')
  assert.equal(title.lang, 'km')
  cleanupKhmer()
  assert.equal(title.lang, 'fr')
  assert.equal(title.hasAttribute('data-cms-content-typography'), false)
  dom.window.close()
})

siteTest('CMS typography rejects absent, malformed and all-locales selections', async () => {
  const { observeCmsContentTypography } = await typography()
  const dom = cmsDocument()
  for (const code of [undefined, null, false, {}, 'all', 'constructor', '__proto__', 'cn<script>']) {
    const cleanup = observeCmsContentTypography(dom.window.document, code)
    assert.equal(dom.window.document.getElementById('title')!.getAttribute('lang'), null)
    cleanup()
  }
  const cleanup = observeCmsContentTypography(dom.window.document, 'en')
  assert.equal(dom.window.document.getElementById('title')!.lang, 'en')
  cleanup()
  dom.window.close()
})

siteTest('CMS text inside localized arrays inherits the selected content language, not nearby shared fields', async () => {
  const { observeCmsContentTypography } = await typography()
  const dom = cmsDocument()
  const document = dom.window.document
  document.body.insertAdjacentHTML('beforeend', `
    <div class="field-type array-field">
      <header class="array-field__header"><h3><span class="field-label">Tags <span class="localized">Khmer</span></span></h3></header>
      <div class="field-type text"><label class="field-label">Tag</label><input id="tag" type="text"></div>
    </div>
    <div class="field-type array-field"><div class="field-type text"><label class="field-label">Shared tag</label><input id="shared-tag" type="text"></div></div>
  `)
  const cleanup = observeCmsContentTypography(document, 'kh')
  assert.equal(document.getElementById('tag')!.lang, 'km')
  assert.equal(document.getElementById('shared-tag')!.getAttribute('lang'), null)
  cleanup()
  dom.window.close()
})

function renderSiteComponent(path: string, name: string, props = {}) {
  const React = siteRequire!('react')
  const { renderToStaticMarkup } = siteRequire!('react-dom/server')
  const ts = siteRequire!('typescript')
  const source = readFileSync(resolve(siteRoot!, path), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  })
  const module = { exports: {} as Record<string, unknown> }
  const requireComponent = (specifier: string) => {
    if (specifier === 'next-intl') return { useTranslations: () => (key: string) => key }
    if (specifier === '@/i18n/navigation') return { Link: ({ children, ...props }: any) => React.createElement('a', props, children) }
    if (specifier === 'next/image') return { __esModule: true, default: ({ fill, priority, ...props }: any) => React.createElement('img', props) }
    if (specifier === './language-switcher' || specifier === './mobile-nav') {
      return { LanguageSwitcher: () => null, MobileNav: () => null }
    }
    return siteRequire!(specifier)
  }
  new Function('require', 'module', 'exports', outputText)(requireComponent, module, module.exports)
  return renderToStaticMarkup(React.createElement(module.exports[name], props))
}

async function siteDocument(lang: string, width: number) {
  const { JSDOM } = siteRequire!('jsdom')
  const { compile } = siteRequire!('@tailwindcss/node')
  const { transform, Features } = siteRequire!('lightningcss')
  const postcss = siteRequire!('postcss')
  const markup = renderSiteComponent('src/components/sections/home-stats.tsx', 'HomeStats', {
    stats: [{ numeric_value: 37, suffix: '+', display_value: '37+', label: 'Localized stat label' }],
  }) + renderSiteComponent('src/components/site/site-header.tsx', 'SiteHeader')
  const dom = new JSDOM(`<html lang="${lang}"><head></head><body>${markup}<p id="body-text">Body text</p><p id="small-label" class="text-sm tracking-[0.2em]">Small label</p><h2 class="text-3xl">Heading</h2></body></html>`)
  const candidates = [...dom.window.document.querySelectorAll('[class]')].flatMap((el: any) => [...el.classList])
  const compiler = await compile(readFileSync(resolve(siteRoot!, 'src/app/globals.css'), 'utf8'), {
    base: siteRoot, onDependency: () => {},
  })
  const css = transform({ filename: 'typography.css', code: Buffer.from(compiler.build(candidates)), include: Features.Nesting }).code.toString()
  const root = postcss.parse(css)
  // jsdom has no viewport media evaluation. Resolve width queries for these
  // CSS regression fixtures; real layout/overflow stays a parent browser check.
  root.walkAtRules('media', (rule: any) => {
    const min = rule.params.match(/(?:min-width:\s*|width\s*>=\s*)([\d.]+)(rem|px)/)
    const max = rule.params.match(/(?:max-width:\s*|width\s*<\s*)([\d.]+)(rem|px)/)
    const pixels = (match: RegExpMatchArray) => Number(match[1]) * (match[2] === 'rem' ? 16 : 1)
    if ((min && width >= pixels(min)) || (max && width < pixels(max))) rule.replaceWith(rule.nodes)
    else rule.remove()
  })
  root.walkAtRules('layer', (rule: any) => rule.nodes ? rule.replaceWith(rule.nodes) : rule.remove())
  const style = dom.window.document.createElement('style')
  style.textContent = root.toString()
  dom.window.document.head.append(style)
  return dom
}

for (const [lang, minimum] of [['en', 14], ['zh', 16], ['km', 18]] as const) {
  siteTest(`website ${lang} stat labels remain readable without collapsing display hierarchy`, async () => {
    const dom = await siteDocument(lang, 1366)
    const label = [...dom.window.document.querySelectorAll('p')].find((el: any) => el.textContent === 'Localized stat label')!
    const labelStyle = dom.window.getComputedStyle(label)
    const pixels = (value: string) => parseFloat(value) * (value.endsWith('rem') ? 16 : 1)
    assert.ok(pixels(labelStyle.fontSize) >= minimum, `label is ${labelStyle.fontSize}`)
    assert.ok(pixels(dom.window.getComputedStyle(dom.window.document.querySelector('p.font-display')).fontSize) > minimum)
    if (lang !== 'en') {
      assert.equal(labelStyle.letterSpacing, '0px')
      assert.ok(pixels(dom.window.getComputedStyle(dom.window.document.getElementById('small-label')).fontSize) >= minimum)
    }
    if (lang === 'km') assert.ok(parseFloat(labelStyle.lineHeight) >= 1.7)
    dom.window.close()
  })
}

siteTest('website uses the compact nav at laptop widths and readable full nav on wide screens', async () => {
  for (const width of [1024, 1280, 1366, 1440, 1536, 1920]) {
    const dom = await siteDocument('en', width)
    const nav = dom.window.document.querySelector('header nav')!
    const desktop = nav.parentElement!
    const compact = desktop.nextElementSibling!
    assert.equal(dom.window.getComputedStyle(desktop).display, width < 1536 ? 'none' : 'flex', `full nav at ${width}`)
    assert.equal(dom.window.getComputedStyle(compact).display, width < 1536 ? 'flex' : 'none', `compact nav at ${width}`)
    if (width >= 1536) {
      const size = dom.window.getComputedStyle(nav.querySelector('a')).fontSize.replace(/var\((--[\w-]+)\)/g,
        (_: string, property: string) => dom.window.getComputedStyle(dom.window.document.documentElement).getPropertyValue(property).trim())
      assert.ok(parseFloat(size) * (size.endsWith('rem') ? 16 : 1) >= 14, `nav size: ${size}`)
    }
    dom.window.close()
  }
})

siteTest('Khmer keeps the compact nav until the full-size labels fit on one line', async () => {
  for (const width of [1536, 1799, 1800, 1920]) {
    const dom = await siteDocument('km', width)
    const desktop = dom.window.document.querySelector('header nav')!.parentElement!
    const compact = desktop.nextElementSibling!
    assert.equal(dom.window.getComputedStyle(desktop).display, width < 1800 ? 'none' : 'flex', `Khmer full nav at ${width}`)
    assert.equal(dom.window.getComputedStyle(compact).display, width < 1800 ? 'flex' : 'none', `Khmer compact nav at ${width}`)
    dom.window.close()
  }
})
