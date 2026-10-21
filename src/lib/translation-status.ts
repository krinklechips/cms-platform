type ObjectValue = Record<string, unknown>
const object = (value: unknown): ObjectValue => value && typeof value === 'object' && !Array.isArray(value) ? value as ObjectValue : {}
const hasText = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.some(hasText)
  return Object.entries(object(value)).some(([key, child]) => !['id', '_id', 'blockType'].includes(key) && hasText(child))
}

/** Presence-only coverage, not a judgement about translation quality or proper names. */
export function missingTranslations(fields: unknown[], document: unknown, locale: unknown, prefix = ''): string[] {
  if (locale !== 'kh' && locale !== 'cn') return []
  const data = object(document)
  const missing: string[] = []
  for (const raw of fields) {
    const field = object(raw)
    const name = typeof field.name === 'string' ? field.name : ''
    const path = name ? prefix + name : prefix
    const value = name ? data[name] : data
    if (name && field.localized && ['text', 'textarea', 'richText', 'array', 'blocks'].includes(String(field.type))) {
      const localized = object(value)
      if (hasText(localized.en) && !hasText(localized[locale])) missing.push(path)
      continue
    }
    if (Array.isArray(field.tabs)) {
      for (const rawTab of field.tabs) {
        const tab = object(rawTab)
        const tabName = typeof tab.name === 'string' ? tab.name : ''
        if (Array.isArray(tab.fields)) missing.push(...missingTranslations(tab.fields, tabName ? data[tabName] : data, locale, tabName ? prefix + tabName + '.' : prefix))
      }
    }
    if (Array.isArray(field.fields)) {
      if (field.type === 'array' && Array.isArray(value)) {
        value.forEach((row, index) => missing.push(...missingTranslations(field.fields as unknown[], row, locale, path + '.' + (index + 1) + '.')))
      } else missing.push(...missingTranslations(field.fields, value, locale, name ? path + '.' : prefix))
    }
  }
  return missing
}
