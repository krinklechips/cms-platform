import assert from 'node:assert/strict'
import { test } from 'node:test'
import { localizedFieldFixtures, clinicalCaseFixture } from '../scripts/lib/cms-localized-field-fixtures'

for (const fixture of localizedFieldFixtures) {
  for (const [name] of fixture.fields) {
    test(`${fixture.config.slug}.${name} has native per-locale storage`, () => {
      const field = fixture.config.fields.find((field) => 'name' in field && field.name === name)
      assert.ok(field, `${name} must exist`)
      assert.ok('localized' in field && field.localized === true, `${name} must be localized`)
      if (['displayTitle', 'displayName', 'shortDisplayName'].includes(name)) {
        assert.ok(!('required' in field) || !field.required, 'Display overrides are optional')
      }
    })
  }
  for (const name of ['sourceId', 'order', ...(fixture.shared ?? [])]) {
    test(`${fixture.config.slug}.${name} remains shared`, () => {
      const field = fixture.config.fields.find((field) => 'name' in field && field.name === name)
      if (field) assert.ok(!('localized' in field) || !field.localized)
    })
  }
}

const expectedKeys = ['full-mouth-reconstruction', 'implants-and-crowns', 'implant-bridges', 'orthodontics', 'cosmetic-and-emax']
test('clinical category identity uses canonical URL keys, not localized labels', () => {
  const field = clinicalCaseFixture.fields.find((field) => 'name' in field && field.name === 'categoryKey')
  assert.ok(field && field.type === 'select', 'categoryKey must be a select')
  assert.equal(field.localized, undefined)
  assert.equal(field.required, undefined)
  assert.equal(field.label, 'Case category (all languages)')
  assert.deepEqual(field.options.map((option) => typeof option === 'string' ? option : option.value), expectedKeys)
  const label = clinicalCaseFixture.fields.find((field) => 'name' in field && field.name === 'category')
  assert.ok(label && 'localized' in label && label.localized)
})

test('clinical legacy mapping is exact, fail-closed, and keeps canonical slugs stable', async () => {
  const field = clinicalCaseFixture.fields.find((field) => 'name' in field && field.name === 'categoryKey')
  assert.ok(field, 'categoryKey is not implemented yet')
  const { clinicalCategoryKeyFromEnglish } = await import('../src/lib/clinical-category-keys')
  const labels = ['Full Mouth', 'Implants & Crowns', 'Implant Bridges', 'Orthodontics', 'Cosmetic & E-Max']
  labels.forEach((label, index) => assert.equal(clinicalCategoryKeyFromEnglish(label), expectedKeys[index]))
  expectedKeys.forEach((key) => assert.equal(clinicalCategoryKeyFromEnglish(key), key))
  for (const unknown of [null, undefined, '', 'Unknown', 'constructor', '__proto__', 'full-mouth', 'Full Mouth Reconstruction']) {
    assert.equal(clinicalCategoryKeyFromEnglish(unknown), null)
  }
})
