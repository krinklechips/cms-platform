const contentLanguages = new Map<string, string>([
  ['en', 'en'],
  ['kh', 'km'],
  ['cn', 'zh-Hans'],
])

export function observeCmsContentTypography(document: Document, localeCode: unknown): () => void {
  const lang = typeof localeCode === 'string' ? contentLanguages.get(localeCode) : undefined
  if (!lang) return () => {}

  const originals = new Map<HTMLElement, { lang: string | null; marker: string | null }>()
  const marker = 'data-cms-content-typography'
  const restore = (element: HTMLElement, attribute: string, original: string | null, assigned: string) => {
    if (element.getAttribute(attribute) !== assigned) return
    if (original === null) element.removeAttribute(attribute)
    else element.setAttribute(attribute, original)
  }
  const restoreElement = (element: HTMLElement) => {
    const original = originals.get(element)!
    restore(element, 'lang', original.lang, lang)
    restore(element, marker, original.marker, '')
    originals.delete(element)
  }

  const sync = () => {
    const controls = new Set<HTMLElement>()
    const localizedFields = new Set(
      [...document.querySelectorAll('.field-label .localized')]
        .map((label) => label.closest('.field-type'))
        .filter((field): field is Element => field !== null),
    )
    for (const field of localizedFields) {
      // Payload marks localized field labels; never infer locale from the UI
      // language, displayed text, URL, or shared slug/search controls.
      for (const control of field.querySelectorAll<HTMLElement>('input[type="text"], textarea, [contenteditable="true"]')) {
        const isLocalizedContainer = field.matches('.array-field, .blocks-field, .group-field')
        if (control.closest('.field-type') !== field && !isLocalizedContainer) continue
        controls.add(control)
        if (!originals.has(control)) {
          originals.set(control, { lang: control.getAttribute('lang'), marker: control.getAttribute(marker) })
        }
        if (control.lang !== lang) control.lang = lang
        if (!control.hasAttribute(marker)) control.setAttribute(marker, '')
      }
    }
    for (const control of originals.keys()) {
      if (!controls.has(control)) restoreElement(control)
    }
  }

  sync()
  const Observer = document.defaultView?.MutationObserver
  const observer = Observer ? new Observer(sync) : undefined
  observer?.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'type', 'contenteditable'],
  })

  return () => {
    observer?.disconnect()
    for (const control of originals.keys()) restoreElement(control)
  }
}
