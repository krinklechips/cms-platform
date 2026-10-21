import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { after, test } from 'node:test'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import * as translations from '@payloadcms/translations'
import type { Field } from 'payload'
import ts from 'typescript'
import { SECTION_BLOCKS } from '../src/blocks/section-blocks'
import { Homepage } from '../src/collections/Homepage'
import { Pages } from '../src/collections/Pages'
import { Services } from '../src/collections/Services'
import { Technology } from '../src/collections/Technology'
import { FeatureCards } from '../src/collections/FeatureCards'
import { NewsArticles } from '../src/collections/NewsArticles'
import { TimelineEvents } from '../src/collections/TimelineEvents'
import { Branches } from '../src/collections/Branches'
import { ClinicalCases } from '../src/collections/ClinicalCases'
import { CommunityArticles } from '../src/collections/CommunityArticles'
import { Doctors } from '../src/collections/Doctors'
import { BrandLogos } from '../src/collections/BrandLogos'
import { Partners } from '../src/collections/Partners'
import { Testimonials } from '../src/collections/Testimonials'
import { Videos } from '../src/collections/Videos'
import { Tenants } from '../src/collections/Tenants'

function findField(fields: Field[], path: string): Field {
  const [name, ...rest] = path.split('.')
  for (const field of fields) {
    if ('name' in field && field.name === name) {
      if (!rest.length) return field
      if ('fields' in field) return findField(field.fields, rest.join('.'))
    }
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        if (tab.fields.some((child) => 'name' in child && child.name === name)) {
          return findField(tab.fields, path)
        }
      }
    }
  }
  throw new Error(`Missing field: ${path}`)
}

function afterInput(field: Field) {
  const components = field.admin?.components
  return components && 'afterInput' in components ? components.afterInput : undefined
}

const sharedFields = [
  [Homepage, 'slides.image', 'upload'],
  [Homepage, 'slides.imageUrl', 'text'],
  [Homepage, 'slides.imagePosition', 'text'],
  [Homepage, 'slides.imageSize', 'text'],
  [Homepage, 'slides.preserveFullImage', 'checkbox'],
  [Pages, 'seoImage', 'text'],
  [Services, 'imageUrl', 'text'],
  [Technology, 'imageUrl', 'text'],
  [FeatureCards, 'imageUrl', 'text'],
  [NewsArticles, 'imageUrl', 'text'],
  [TimelineEvents, 'imageUrl', 'text'],
  [Branches, 'imageUrl', 'text'],
  [Branches, 'photos', 'json'],
  [ClinicalCases, 'imageUrl', 'text'],
  [ClinicalCases, 'images', 'json'],
  [CommunityArticles, 'imageUrl', 'text'],
  [CommunityArticles, 'images', 'array'],
  [CommunityArticles, 'images.url', 'text'],
  [Doctors, 'photoUrl', 'text'],
  [BrandLogos, 'logoUrl', 'text'],
  [Partners, 'logoUrl', 'text'],
  [Testimonials, 'authorPhotoUrl', 'text'],
  [Videos, 'thumbnail', 'text'],
] as const

test('new URL picker registrations identify native siblings without touching hosted video or tenant branding', () => {
  assert.deepEqual(afterInput(findField(Homepage.fields, 'slides.imageUrl')),
    ['/components/ImageUrlPreview#HeroImageUrlPreview'])
  assert.deepEqual(afterInput(findField(Pages.fields, 'seoImage')),
    ['/components/ImageUrlPreview#ImageUrlPreview'])
  for (const [slug, path] of [
    ['image', 'src'], ['gallery', 'images.url'], ['image_pair', 'left.src'], ['image_pair', 'right.src'],
  ]) {
    const block = SECTION_BLOCKS.find((block) => block.slug === slug)!
    assert.deepEqual(afterInput(findField(block.fields, path)),
      ['/components/ImageUrlPreview#SectionImageUrlPreview'], `${slug}.${path}`)
  }
  assert.equal(afterInput(findField(SECTION_BLOCKS.find((block) => block.slug === 'self_video')!.fields, 'src')), undefined)
  assert.equal(afterInput(findField(Tenants.fields, 'logo')), undefined)
})

// Render Payload's installed FieldLabel, doubling only providers and the stylesheet import.
const domPackage = 'happy-dom'
const { Window } = await import(domPackage).catch((error: NodeJS.ErrnoException) => {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error
  return { Window: null }
})
if (!Window) {
  test('media label DOM behavior', { skip: 'Optional happy-dom runtime is not available' }, () => {})
} else {
  const window = new Window({ url: 'https://cms.example.test' })
  Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  let locale = 'en'
  const require = createRequire(import.meta.url)
  const labelPath = new URL('../node_modules/@payloadcms/ui/dist/fields/FieldLabel/index.js', import.meta.url)
  const labelRequire = createRequire(labelPath)
  const compiled = ts.transpileModule(readFileSync(labelPath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const output = { exports: {} as any }
  new Function('require', 'module', 'exports', compiled)((name: string) => {
    if (name.endsWith('.scss')) return {}
    if (name === '@payloadcms/translations') return translations
    if (name.includes('/Form/context')) return { useForm: () => ({ uuid: 'test' }) }
    if (name.includes('/EditDepth/')) return { useEditDepth: () => 1 }
    if (name.includes('/Locale/')) return { useLocale: () => ({ code: locale, label: locale }) }
    if (name.includes('/Translation/')) return { useTranslation: () => ({ i18n: { language: 'en', fallbackLanguage: 'en' } }) }
    return name.startsWith('.') ? labelRequire(name) : require(name)
  }, output, output.exports)
  const { FieldLabel } = output.exports
  const renderLabel = async (field: Field, path: string, inheritedLocale = false) => {
    await act(() => root.render(React.createElement(React.Fragment, null,
      React.createElement(FieldLabel, {
        path,
        label: 'label' in field && field.label !== undefined ? field.label : 'name' in field ? field.name : field.type,
        localized: inheritedLocale || ('localized' in field && field.localized),
      }),
      React.createElement('input', { id: `field-${path.replace(/\./g, '__')}-test` }),
    )))
    return container.querySelector('label')
  }
  after(async () => {
    await act(() => root.unmount())
    await window.happyDOM.close()
  })

  test('localized block image sources use readable library and fallback labels', async () => {
    locale = 'cn'
    for (const [slug, path] of [
      ['image', 'src'], ['gallery', 'images.url'], ['image_pair', 'left.src'], ['image_pair', 'right.src'],
    ]) {
      const block = SECTION_BLOCKS.find(block => block.slug === slug)!
      const label = await renderLabel(findField(block.fields, path), `sections.${slug}.${path}`, true)
      assert.match(label?.textContent ?? '', /^Fallback image URL/, `${slug}.${path}`)
    }
    const media = findField(SECTION_BLOCKS.find(block => block.slug === 'image')!.fields, 'media')
    const label = await renderLabel(media, 'sections.image.media', true)
    assert.match(label?.textContent ?? '', /^Image from library/)
  })

  for (const [collection, path, type] of sharedFields) {
    test(`${collection.slug}.${path} visibly identifies all languages without changing storage type`, async () => {
      const field = findField(collection.fields, path)
      assert.equal(field.type, type)
      assert.ok(!('localized' in field && field.localized), 'Shared values must remain non-localized')
      for (locale of ['en', 'kh', 'cn']) {
        const label = await renderLabel(field, path)
        assert.match(label?.textContent ?? '', /all languages/i)
        assert.equal(label?.htmlFor, container.querySelector('input')?.id)
        assert.equal(label?.querySelector('.localized'), null)
      }
    })
  }

  test('localized block images and hero text never claim to be shared in any nested section', async () => {
    for (const collection of [Pages, Services, Technology]) {
      const sections = findField(collection.fields, 'sections')
      assert.ok('localized' in sections && sections.localized)
    }
    const checkFields = async (fields: Field[], path: string) => {
      for (const field of fields) {
        const fieldPath = `${path}.${'name' in field ? field.name : field.type}`
        const label = await renderLabel(field, fieldPath, true)
        assert.doesNotMatch(label?.textContent ?? '', /all languages/i, fieldPath)
        assert.equal(label?.querySelector('.localized')?.textContent, '\u2014 kh')
        if ('fields' in field) await checkFields(field.fields, fieldPath)
        if (field.type === 'blocks') {
          for (const block of field.blocks ?? []) {
            if (typeof block !== 'string') await checkFields(block.fields, `${fieldPath}.${block.slug}`)
          }
        }
      }
    }
    locale = 'kh'
    for (const block of SECTION_BLOCKS) await checkFields(block.fields, `sections.${block.slug}`)
    for (const path of ['slides.title', 'slides.description', 'slides.subtitle']) {
      const field = findField(Homepage.fields, path)
      assert.ok('localized' in field && field.localized)
      const label = await renderLabel(field, path)
      assert.doesNotMatch(label?.textContent ?? '', /all languages/i)
    }
    const logo = findField(Tenants.fields, 'logo')
    const label = await renderLabel(logo, 'logo')
    assert.doesNotMatch(label?.textContent ?? '', /all languages/i, 'Platform tenant branding is outside this change')
  })
}
