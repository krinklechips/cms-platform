import assert from 'node:assert/strict'
import { test } from 'node:test'
import { missingTranslations } from '../src/lib/translation-status'
import { CommunityArticles } from '../src/collections/CommunityArticles'

test('reports English fallback only where current locale is empty and English contains text', () => {
  const fields = [{ name: 'question', type: 'text', localized: true }, { name: 'optional', type: 'text', localized: true }, { name: 'slug', type: 'text' }]
  assert.deepEqual(missingTranslations(fields, { question: { en: 'Question', kh: '', cn: 'Existing translation' }, optional: { en: '', kh: '' }, slug: 'shared' }, 'kh'), ['question'])
  assert.deepEqual(missingTranslations(fields, { question: { en: 'Question', cn: 'Existing translation' } }, 'cn'), [])
})

test('covers tabs, named groups and shared arrays without modifying the input', () => {
  const fields = [{ type: 'tabs', tabs: [{ fields: [{ name: 'details', type: 'group', fields: [{ name: 'title', type: 'text', localized: true }] }] }] }, { name: 'items', type: 'array', fields: [{ name: 'label', type: 'text', localized: true }] }]
  const doc = { details: { title: { en: 'Title', cn: null } }, items: [{ id: 'one', label: { en: 'Label', cn: '' } }] }
  const before = JSON.stringify(doc)
  assert.deepEqual(missingTranslations(fields, doc, 'cn'), ['details.title', 'items.1.label'])
  assert.equal(JSON.stringify(doc), before)
})

test('counts localized sections as one empty translation and ignores legacy JSON', () => {
  const fields = [{ name: 'sections', type: 'blocks', localized: true }, { name: 'content', type: 'json', localized: true }]
  assert.deepEqual(missingTranslations(fields, { sections: { en: [{ blockType: 'text', body: 'Copy' }], kh: [] }, content: { en: { body: 'Legacy' } } }, 'kh'), ['sections'])
})

test('never infers translation failures from equal proper names or invalid locale input', () => {
  const fields = [{ name: 'name', type: 'text', localized: true }]
  const doc = { name: { en: 'CAD/CAM', cn: 'CAD/CAM' } }
  for (const locale of ['en', 'cn', 'all', '__proto__']) assert.deepEqual(missingTranslations(fields, doc, locale), [])
})

test('community gallery URL rows expose the same explicit media selector', () => {
  const images = CommunityArticles.fields.find(f => 'name' in f && f.name === 'images')
  assert.ok(images && images.type === 'array')
  const url = images.fields.find(f => 'name' in f && f.name === 'url')
  assert.ok(url && url.type === 'text')
  assert.deepEqual(url.admin?.components?.afterInput, ['/components/ImageUrlPreview#ImageUrlPreview'])
})
