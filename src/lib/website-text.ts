import { isStructurallySame, parse } from '@formatjs/icu-messageformat-parser'
import registry from './website-text-registry.json'

export const websiteTextPages = registry
export const websiteTextPage = (page: unknown) => typeof page === 'string' ? registry.find(p => p.page === page) : undefined

export const validateWebsiteCopy = (page: unknown, copy: unknown): true | string => {
  const definition = websiteTextPage(page)
  if (!definition) return 'Choose a website page.'
  if (copy == null) return true
  if (typeof copy !== 'object' || Array.isArray(copy)) return 'Page text must be a text map.'
  for (const [key, value] of Object.entries(copy)) {
    const field = definition.fields.find(field => field.key === key)
    if (!field || typeof value !== 'string' || value.length > 20000) return `Invalid text field: ${key}`
    if (value === '') continue
    try {
      if (!isStructurallySame(parse(field.english),parse(value)).success) return `${field.label}: keep the original message placeholders.`
    } catch { return `${field.label}: invalid message formatting.` }
  }
  return true
}
