import type { Where } from 'payload'

export type MediaFolder = {
  path: string
  label: string
  parent: string | null
  count: number
  prefixes: (string | null)[]
  uploadable: boolean
}
export type MediaFolderCatalog = { tenant: { id: number | string; slug: string }; folders: MediaFolder[] }

export function isUploadFolder(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 300 &&
    (value === '' || (value.split('/').length <= 10 && value.split('/').every(part =>
      /^[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/.test(part) && part !== '.' && part !== '..')))
}

export function buildMediaFolders(slug: string, counts: { prefix: string | null; count: number }[]): MediaFolder[] {
  const nodes = new Map<string, MediaFolder>()
  const add = (path: string, label: string, parent: string | null, uploadable = true) => {
    if (!nodes.has(path)) nodes.set(path, { path, label, parent, count: 0, prefixes: [], uploadable })
    return nodes.get(path)!
  }
  const root = add('', 'All files', null)
  for (const { prefix, count } of counts) {
    // Old imports and new adapter-managed uploads share categories, not object keys.
    const relative = [slug, `serviette-media/${slug}`].map(base =>
      prefix === base ? '' : prefix?.startsWith(`${base}/`) ? prefix.slice(base.length + 1) : null,
    ).find(path => path !== null && isUploadFolder(path))
    const ancestors = [root]
    if (relative === undefined) {
      ancestors.push(add(`@stored:${prefix ?? ''}`, prefix ? `Stored path: ${prefix}` : 'Uncategorised files', '', false))
    } else if (relative) {
      const parts = relative.split('/')
      for (let i = 0; i < parts.length; i++) {
        const path = parts.slice(0, i + 1).join('/')
        ancestors.push(add(path, parts[i].replace(/[-_]/g, ' '), parts.slice(0, i).join('/')))
      }
    }
    for (const node of ancestors) {
      node.count += count
      if (!node.prefixes.includes(prefix)) node.prefixes.push(prefix)
    }
  }
  return [...nodes.values()].sort((a, b) => a.path.localeCompare(b.path))
}

export function mediaFolderFilter(folder: MediaFolder | undefined): Where | undefined {
  if (!folder?.path) return undefined
  const paths = folder.prefixes.filter((prefix): prefix is string => prefix !== null)
  const clauses: Where[] = []
  if (paths.length) clauses.push({ prefix: { in: paths } })
  if (folder.prefixes.includes(null)) clauses.push({ prefix: { exists: false } })
  return clauses.length === 1 ? clauses[0] : { or: clauses }
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
/** Only the prefix-only predicates contributed by the folder browser, never tenant/image/search constraints. */
export function findMediaFolderFilter(where: Where | undefined): Where | undefined {
  if (!where) return undefined
  const prefixOnly = (value: Where): boolean => {
    if (Object.keys(value).length !== 1 || !value.prefix || typeof value.prefix !== 'object') return false
    const ops = value.prefix as Record<string, unknown>
    return Object.keys(ops).length === 1 && (ops.exists === false || Array.isArray(ops.in) && ops.in.every(path => typeof path === 'string'))
  }
  if (prefixOnly(where) || Object.keys(where).length === 1 && where.or?.length && where.or.every(prefixOnly)) return where
  return where.and?.map(findMediaFolderFilter).find(Boolean)
}

export function hasMediaFolderFilter(where: Where | undefined, clause: Where | undefined): boolean {
  if (!where || !clause) return false
  return same(where, clause) || Boolean(where.and?.some(child => hasMediaFolderFilter(child, clause)))
}

export function replaceMediaFolderFilter(where: Where | undefined, previous: Where | undefined, next: Where | undefined): Where {
  const remove = (value: Where): Where => {
    if (previous && same(value, previous)) return {}
    if (!value.and) return value
    const { and, ...rest } = value
    const children = and.map(remove).filter(child => Object.keys(child).length > 0)
    return children.length ? { ...rest, and: children } : rest
  }
  const remaining = where ? remove(where) : {}
  const clauses = Object.keys(remaining).length === 1 && remaining.and ? remaining.and : [remaining]
  return next ? { and: [...clauses, next].filter(value => Object.keys(value).length > 0) } : remaining
}
