import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SiteStats } from '../src/collections/SiteStats'
import { withHumanLabels } from '../src/lib/collection-labels'
import * as statPages from '../src/lib/stat-pages'
import { gatherActivity } from '../src/lib/site-activity'
import type { Payload, TypedUser } from 'payload'

test('the original Home Page stats-band location is retained with readable statistic labels', () => {
  const collection = withHumanLabels(SiteStats)
  assert.equal(collection.admin?.group, 'Home Page')
  assert.equal(collection.labels?.plural, 'Stats Band')
  const key = collection.fields.find((field) => 'name' in field && field.name === 'key')
  assert.equal(key?.admin?.components?.Cell, '/components/StatUsage#StatNameCell')
})

test('the two experience statistics have distinct human names and accurate page destinations', () => {
  assert.deepEqual(statPages.getStatPages('years_experience').map((page) => page.label), ['Home page', 'Our Team'])
  assert.deepEqual(statPages.getStatPages('clinical_experience').map((page) => page.label), ['Clinical Results'])
  assert.equal(statPages.getStatLabel?.('years_experience'), 'Years of experience')
  assert.equal(statPages.getStatLabel?.('clinical_experience'), 'Clinical experience')
  assert.equal(statPages.getStatPageSummary?.('clinical_experience'), 'Clinical Results only')
  assert.equal(statPages.getStatPageSummary?.('years_experience'), 'Home page, Our Team')
})

test('shared team statistics include the team page without claiming unused statistics appear on home', () => {
  for (const key of ['specialist_dentists', 'branches_count']) {
    assert.ok(statPages.getStatPages(key).some((page) => page.path === '/team'))
  }
  for (const key of ['patients_per_month', 'countries_served', 'constructor', '__proto__']) {
    assert.deepEqual(statPages.getStatPages(key), [])
    assert.equal(statPages.getStatPageSummary?.(key), 'Not currently displayed')
  }
  assert.equal(statPages.getStatLabel?.('patients_per_month'), 'Patients per month')
})

test('activity labels distinguish pages without changing the underlying document or draft', async () => {
  const doc = { id: 11, key: 'clinical_experience', displayValue: '30 年', _status: 'draft', updatedAt: '2026-10-21T06:19:20.582Z' }
  const before = structuredClone(doc)
  const payload = {
    collections: { 'site-stats': { config: { versions: { drafts: true }, admin: { useAsTitle: 'key' } } } },
    find: async () => ({ docs: [doc], totalDocs: 1 }),
  } as unknown as Payload
  const activity = await gatherActivity(payload, 1, { id: 1 } as TypedUser)
  assert.equal(activity.recent[0].title, 'Clinical experience (Clinical Results only)')
  assert.equal(activity.unpublished[0].title, 'Clinical experience (Clinical Results only)')
  assert.equal(activity.recent[0].href, '/admin/collections/site-stats/11?statPage=clinical')
  assert.deepEqual(doc, before)
})

test('stat labels require no data fields, write hooks, migrations or locale changes', () => {
  assert.deepEqual(SiteStats.fields.filter((field) => 'name' in field).map((field) => [field.name, field.type]), [
    ['statUsage', 'ui'], ['sourceId', 'text'], ['key', 'text'], ['displayValue', 'text'],
    ['originalDisplayValue', 'text'], ['numericValue', 'number'], ['suffix', 'text'],
    ['label', 'text'], ['order', 'number'], ['published', 'checkbox'],
  ])
  assert.equal(SiteStats.hooks, undefined)
  for (const name of ['displayValue', 'originalDisplayValue', 'suffix', 'label']) {
    const field = SiteStats.fields.find((field) => 'name' in field && field.name === name)
    assert.ok(field && 'localized' in field && field.localized)
  }
})
