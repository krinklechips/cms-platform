import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Field } from 'payload'
import { mergeLocalizedData } from '../node_modules/payload/dist/utilities/mergeLocalizedData.js'

const fields: Field[] = [{
  name: 'buttons', type: 'array', fields: [
    { name: 'id', type: 'text' },
    { name: 'url', type: 'text' },
    { name: 'label', type: 'text', localized: true },
  ],
}]
const published = {
  buttons: [
    { id: 'a', url: '/a', label: { en: 'English A', kh: 'Khmer A', cn: 'Chinese A' } },
    { id: 'b', url: '/b', label: { en: 'English B', kh: 'Khmer B', cn: 'Chinese B' } },
  ],
}

test('publishing a reordered Khmer array preserves other languages by row ID, not position', () => {
  const input = structuredClone(published)
  const result = mergeLocalizedData({ configBlockReferences: [], fields, selectedLocales: ['kh'], docWithLocales: input, dataWithLocales: {
    buttons: [
      { id: 'b', url: '/b', label: { en: 'Private English B', kh: 'New Khmer B', cn: 'Private Chinese B' } },
      { id: 'a', url: '/a', label: { en: 'Private English A', kh: 'New Khmer A', cn: 'Private Chinese A' } },
    ],
  } })
  assert.deepEqual(result.buttons, [
    { id: 'b', url: '/b', label: { en: 'English B', kh: 'New Khmer B', cn: 'Chinese B' } },
    { id: 'a', url: '/a', label: { en: 'English A', kh: 'New Khmer A', cn: 'Chinese A' } },
  ])
  assert.deepEqual(input, published, 'Merging must not mutate the published snapshot')
})

test('inserting a shared row does not inherit another row\'s translated labels', () => {
  const result = mergeLocalizedData({ configBlockReferences: [], fields, selectedLocales: ['cn'], docWithLocales: published, dataWithLocales: {
    buttons: [
      { id: 'new', url: '/new', label: { cn: 'New Chinese row' } },
      ...published.buttons,
    ],
  } })
  assert.deepEqual(result.buttons, [
    { id: 'new', url: '/new', label: { cn: 'New Chinese row' } },
    ...published.buttons,
  ])
})

test('deleting the first shared row preserves translations of the surviving row', () => {
  const result = mergeLocalizedData({ configBlockReferences: [], fields, selectedLocales: ['en'], docWithLocales: published, dataWithLocales: { buttons: [published.buttons[1]] } })
  assert.deepEqual(result.buttons, [published.buttons[1]])
})

test('shared blocks also retain other-language copy by block ID after reordering', () => {
  const blockFields: Field[] = [{ name: 'sections', type: 'blocks', blocks: [{ slug: 'text', fields: [{ name: 'body', type: 'text', localized: true }] }] }]
  const result = mergeLocalizedData({ configBlockReferences: [], fields: blockFields, selectedLocales: ['cn'],
    docWithLocales: { sections: [
      { id: 'a', blockType: 'text', body: { en: 'A', kh: 'KA', cn: 'CA' } },
      { id: 'b', blockType: 'text', body: { en: 'B', kh: 'KB', cn: 'CB' } },
    ] },
    dataWithLocales: { sections: [
      { id: 'b', blockType: 'text', body: { en: 'Private B', kh: 'Private KB', cn: 'New CB' } },
      { id: 'a', blockType: 'text', body: { en: 'Private A', kh: 'Private KA', cn: 'New CA' } },
    ] },
  })
  assert.deepEqual(result.sections, [
    { id: 'b', blockType: 'text', blockName: undefined, body: { en: 'B', kh: 'KB', cn: 'New CB' } },
    { id: 'a', blockType: 'text', blockName: undefined, body: { en: 'A', kh: 'KA', cn: 'New CA' } },
  ])
})
