/** Keep sticky panes below the part of the editorial toolbar that remains visible. */
export function observePreviewToolbarLayout(root: HTMLElement): () => void {
  const toolbar = root.closest<HTMLElement>('.doc-controls')
  const editor = toolbar?.closest<HTMLElement>('.collection-edit')
  const view = root.ownerDocument.defaultView
  if (!toolbar || !editor || !view) return () => undefined

  const property = '--cms-doc-controls-offset'
  const previous = editor.style.getPropertyValue(property)
  const priority = editor.style.getPropertyPriority(property)
  let active = true
  let written: string | undefined
  const update = () => {
    if (!active) return
    const top = Number.parseFloat(view.getComputedStyle(toolbar).top) || 0
    const value = `${Math.ceil(Math.max(0, toolbar.getBoundingClientRect().height + top))}px`
    if (value !== written) { editor.style.setProperty(property, value); written = value }
  }
  const observer = typeof view.ResizeObserver === 'function' ? new view.ResizeObserver(update) : null
  observer?.observe(toolbar)
  view.addEventListener('resize', update)
  update()

  return () => {
    active = false
    observer?.disconnect()
    view.removeEventListener('resize', update)
    if (editor.style.getPropertyValue(property) === written) {
      if (previous) editor.style.setProperty(property, previous, priority)
      else editor.style.removeProperty(property)
    }
  }
}
