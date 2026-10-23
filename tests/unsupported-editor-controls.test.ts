import assert from 'node:assert/strict'
import test from 'node:test'
import type { Field } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'

const config = loadPayloadConfig()
function named(fields: Field[], name: string): Field | undefined {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field
    if ('fields' in field) { const result = named(field.fields, name); if (result) return result }
    if (field.type === 'tabs') for (const tab of field.tabs) { const result = named(tab.fields, name); if (result) return result }
  }
}

for (const [slug, fields] of [
  ['pricing-categories', ['icon']], ['pricing-items', ['ada', 'aus']], ['community-articles', ['href']], ['site-stats', ['order']],
] as const) {
  test(`${slug} retains unsupported metadata but does not present it as a working website control`, async () => {
    const collection = (await config).collections.find(collection => collection.slug === slug)!
    for (const name of fields) {
      const field = named(collection.fields, name)
      assert.ok(field)
      const admin = field.admin as { readOnly?: boolean; description?: unknown; hidden?: boolean }
      assert.equal(admin.readOnly, true, `${slug}.${name} must not invite a no-effect edit`)
      assert.match(String(admin.description), /not|does not|fixed|legacy|not displayed/i)
      assert.equal(admin.hidden, undefined, 'Retain transparent access to saved values without rewriting them')
    }
  })
}

test('price-list section guidance does not promise an editable category icon', async () => {
  const collection = (await config).collections.find(collection => collection.slug === 'pricing-categories')!
  assert.doesNotMatch(String(collection.admin.description), /their icons/)
})
