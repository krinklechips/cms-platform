import { isUploadFolder, type MediaFolderCatalog } from './media-folders'

// Survives client-side list -> create navigation, but never persists across tabs or reloads.
let selected: { api: string; tenantID: string; path: string } | undefined

export function clearMediaUploadFolder(): void {
  selected = undefined
}

export function rememberMediaUploadFolder(api: string, catalog: MediaFolderCatalog | undefined, path: string): void {
  const folder = catalog?.folders.find(folder => folder.path === path)
  selected = catalog && folder?.uploadable && folder.path && isUploadFolder(folder.path)
    ? { api, tenantID: String(catalog.tenant.id), path: folder.path } : undefined
}

export function mediaUploadFolderFor(api: string, tenantID: number | string | null, catalog: MediaFolderCatalog): string {
  if (!selected || selected.api !== api || tenantID === null || selected.tenantID !== String(tenantID)
    || String(catalog.tenant.id) !== String(tenantID)) return ''
  return catalog.folders.some(folder => folder.path === selected!.path && folder.uploadable && isUploadFolder(folder.path))
    ? selected.path : ''
}
