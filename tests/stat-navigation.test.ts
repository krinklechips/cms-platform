import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as stats from '../src/lib/stat-pages'
import { isNavigationItemActive } from '../src/lib/navigation-state'
import { SiteStats } from '../src/collections/SiteStats'

const groups = [
  { label: 'Home Page', items: [
    { id: 'nav-homepage', label: 'Home Hero', href: '/admin/collections/homepage' },
    { id: 'nav-site-stats', label: 'Stats Band', href: '/admin/collections/site-stats' },
    { id: 'nav-feature-cards', label: 'Highlight Cards', href: '/admin/collections/feature-cards' },
  ] },
  { label: 'Main Pages', items: [{ id: 'nav-doctors', label: 'Doctors', href: '/admin/collections/doctors' }] },
  { label: 'About Pages', items: [{ id: 'nav-timeline-events', label: 'Our Story Timeline', href: '/admin/collections/timeline-events' }] },
]

test('home Stats Band contains only homepage keys, not the separate clinical-experience record', () => {
  const href = stats.getStatListHref?.('home')
  assert.ok(href)
  const url = new URL(href, 'https://cms.example.test')
  assert.equal(url.pathname, '/admin/collections/site-stats')
  assert.equal(url.searchParams.get('statPage'), 'home')
  const keys = [...url.searchParams.entries()].filter(([key]) => key.startsWith('where[key][in]')).map(([, value]) => value)
  assert.deepEqual(keys, ['years_experience', 'specialist_dentists', 'branches_count', 'patients_treated'])
  assert.ok(!keys.includes('clinical_experience'))
})

test('each page shortcut filters the same collection using its actual displayed statistics', () => {
  for (const [page, expected] of [
    ['clinical', ['specialist_dentists', 'patients_treated', 'clinical_experience']],
    ['team', ['years_experience', 'specialist_dentists', 'branches_count']],
    ['about', ['specialist_dentists', 'branches_count', 'year_established', 'dental_chairs']],
    ['facilities', ['specialist_dentists', 'dental_chairs', 'surgical_theatres', 'building_storeys']],
  ] as const) {
    const href = stats.getStatListHref?.(page, '/manage')
    assert.ok(href)
    const url = new URL(href, 'https://cms.example.test')
    assert.equal(url.pathname, '/manage/collections/site-stats')
    assert.deepEqual([...url.searchParams.entries()].filter(([key]) => key.startsWith('where[key][in]')).map(([, value]) => value), expected)
  }
})

test('navigation places shortcuts under the relevant pages without copying records or mutating config', () => {
  const before = structuredClone(groups)
  const result = stats.withStatPageLinks?.(groups)
  assert.ok(result)
  assert.equal(result.some((group) => group.label === 'Shared Content'), false)
  assert.deepEqual(result.find((group) => group.label === 'Home Page')?.items.map(({ label }) => label), ['Home Hero', 'Stats Band', 'Highlight Cards'])
  assert.ok(result.find((group) => group.label === 'Main Pages')?.items.some(({ label }) => label === 'Clinical Results Statistics'))
  assert.ok(result.find((group) => group.label === 'Main Pages')?.items.some(({ label }) => label === 'Our Team Statistics'))
  assert.ok(result.find((group) => group.label === 'About Pages')?.items.some(({ label }) => label === 'About Roomchang Statistics'))
  assert.ok(result.find((group) => group.label === 'About Pages')?.items.some(({ label }) => label === 'Our Facilities Statistics'))
  assert.deepEqual(stats.withStatPageLinks?.(result), result, 'Adding page links twice must not duplicate them')
  assert.deepEqual(groups, before)
})

test('page shortcuts never bypass collection visibility or read-permission filtering', () => {
  const noStats = groups.map((group) => ({ ...group, items: group.items.filter(({ id }) => id !== 'nav-site-stats') }))
  assert.deepEqual(stats.withStatPageLinks?.(noStats), noStats)
})

test('shared-statistic shortcuts retain one record ID and the originating page context', () => {
  const home = stats.getStatRecordHref?.('specialist_dentists', 2, 'home')
  const clinical = stats.getStatRecordHref?.('specialist_dentists', 2, 'clinical')
  assert.ok(home && clinical)
  assert.equal(new URL(home, 'https://cms.example.test').pathname, new URL(clinical, 'https://cms.example.test').pathname)
  assert.match(home, /statPage=home/)
  assert.match(clinical, /statPage=clinical/)
  assert.equal(stats.getStatRecordHref?.('clinical_experience', 11, 'home'), '/admin/collections/site-stats/11?statPage=clinical')
  assert.equal(stats.getStatRecordHref?.('countries_served', 10, 'constructor'), '/admin/collections/site-stats/10')
})

test('only the relevant page shortcut is active on filtered lists and record editors', () => {
  const home = '/admin/collections/site-stats?statPage=home'
  const clinical = '/admin/collections/site-stats?statPage=clinical'
  for (const path of ['/admin/collections/site-stats', '/admin/collections/site-stats/2']) {
    assert.equal(isNavigationItemActive(path, clinical, 'statPage=clinical'), true)
    assert.equal(isNavigationItemActive(path, home, 'statPage=clinical'), false)
    assert.equal(isNavigationItemActive(path, clinical, ''), false)
  }
  assert.equal(isNavigationItemActive('/admin/collections/site-stats-extra', clinical, 'statPage=clinical'), false)
  assert.equal(isNavigationItemActive('/admin/collections/doctors/1', '/admin/collections/doctors', 'locale=cn'), true)
})

test('collection-wide document URLs preserve context even when the Statistic column is hidden', () => {
  const format = SiteStats.admin?.formatDocURL
  assert.equal(typeof format, 'function')
  assert.notEqual(SiteStats.admin?.enableListViewSelectAPI, true, 'URL metadata must remain available with other columns selected')
  if (!format) return
  const doc = Object.freeze({ id: 2, key: 'specialist_dentists', displayValue: '37', label: 'Dentists' })
  const req = { query: { statPage: 'clinical' }, headers: new Headers(), payload: { config: { routes: { admin: '/admin' } } } }
  const result = format({ collectionSlug: 'site-stats', defaultURL: '/admin/collections/site-stats/2', doc, req, viewType: 'list' } as unknown as Parameters<typeof format>[0])
  assert.equal(result, '/admin/collections/site-stats/2?statPage=clinical')
})

test('column-refresh server actions retain context from the referring CMS list without changing records', () => {
  const format = SiteStats.admin?.formatDocURL
  assert.equal(typeof format, 'function')
  if (!format) return
  const doc = Object.freeze({ id: 2, key: 'specialist_dentists', displayValue: '37' })
  const req = { query: {}, headers: new Headers({ referer: 'https://roomchang.serviettelab.com/manage/collections/site-stats?statPage=facilities' }), payload: { config: { routes: { admin: '/manage' } } } }
  const args = { collectionSlug: 'site-stats', defaultURL: '/manage/collections/site-stats/2', doc, req, viewType: 'list' } as unknown as Parameters<typeof format>[0]
  assert.equal(format(args), '/manage/collections/site-stats/2?statPage=facilities')
  assert.equal(format({ ...args, viewType: 'trash', defaultURL: '/manage/collections/site-stats/trash/2' }), '/manage/collections/site-stats/trash/2')
  assert.deepEqual(doc, { id: 2, key: 'specialist_dentists', displayValue: '37' })
})
