import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Field } from 'payload'
import { Services } from '../src/collections/Services'
import { Technology } from '../src/collections/Technology'

function fieldsInOrder(fields: Field[]): string[] {
  return fields.flatMap(field => {
    if (field.type === 'tabs') return field.tabs.flatMap(tab => fieldsInOrder(tab.fields))
    if (!('name' in field) && 'fields' in field) return fieldsInOrder(field.fields)
    return 'name' in field ? [field.name] : []
  })
}

test('Service Hero fields precede sections in rendered order without changing their stored paths', () => {
  const hero = Services.fields.find(field => field.type === 'collapsible' && field.label === 'Hero')
  assert.ok(hero?.type === 'collapsible', 'The editor needs an unnamed Hero group')
  assert.deepEqual(fieldsInOrder(hero.fields), ['eyebrow', 'name', 'heroDescription', 'imageUrl'])
  const order = fieldsInOrder(Services.fields)
  assert.ok(order.indexOf('imageUrl') < order.indexOf('sections'))
  assert.ok(order.indexOf('sections') < order.indexOf('description'))
  for (const name of ['eyebrow', 'name', 'heroDescription', 'imageUrl', 'sections', 'description', 'features']) {
    assert.equal(order.filter(field => field === name).length, 1, name)
  }
})

test('only top-level Service blocks offer nullable bounded spacing; Technology is unchanged', () => {
  const sections = (collection: typeof Services) => collection.fields.flatMap(field => field.type === 'tabs' ? field.tabs.flatMap(tab => tab.fields) : [field])
    .find(field => 'name' in field && field.name === 'sections')
  const services = sections(Services)
  const technology = sections(Technology)
  assert.ok(services?.type === 'blocks' && technology?.type === 'blocks')
  for (const block of services.blocks) {
    const spacing = block.fields.find(field => 'name' in field && field.name === 'sectionSpacing')
    assert.ok(spacing?.type === 'select', block.slug)
    assert.deepEqual(spacing.options, [{ label: 'Default', value: 'default' }, { label: 'Compact', value: 'compact' }, { label: 'None', value: 'none' }])
    assert.equal(spacing.required, undefined)
    assert.equal(spacing.defaultValue, undefined, 'Do not populate old records or drafts automatically')
    for (const field of block.fields) if (field.type === 'blocks') for (const nested of field.blocks) {
      assert.ok(!nested.fields.some(field => 'name' in field && field.name === 'sectionSpacing'))
    }
  }
  for (const block of technology.blocks) assert.ok(!block.fields.some(field => 'name' in field && field.name === 'sectionSpacing'))
})
