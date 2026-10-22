'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import type { Where } from 'payload'
import { useTenantSelection } from '@payloadcms/plugin-multi-tenant/client'
import { FolderIcon, useConfig, useDocumentInfo, useField, useFormFields, useListDrawerContext, useListQuery } from '@payloadcms/ui'
import { mediaTenantID } from './MediaPicker'
import { createMediaFolderPath, findMediaFolderFilter, hasMediaFolderFilter, mediaFolderFilter, replaceMediaFolderFilter, type MediaFolderCatalog } from '../lib/media-folders'

function useMediaFolders(tenant: number | string | null, enabled = true, refreshKey?: number) {
  const { config: { routes: { api } } } = useConfig()
  const [attempt, retry] = useState(0)
  const [state, setState] = useState<{ scope?: string; catalog?: MediaFolderCatalog; error?: string }>({})
  const pending = useRef<AbortController | null>(null)
  const scope = JSON.stringify([api, tenant])
  const key = JSON.stringify([api, tenant, attempt, refreshKey])
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    pending.current = controller
    const params = tenant === null ? '' : `?tenant=${encodeURIComponent(tenant)}`
    void fetch(`${api}/media/folders${params}`, { signal: controller.signal, credentials: 'same-origin', cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error(response.status === 401 ? 'Sign in again to browse folders.' : 'Could not load folders. Check the selected workspace and try again.')
        return response.json() as Promise<MediaFolderCatalog>
      })
      .then(catalog => { if (!controller.signal.aborted) setState({ scope, catalog }) })
      .catch(error => { if (!controller.signal.aborted) setState(previous => ({ scope, error: error.message, catalog: previous.scope === scope ? previous.catalog : undefined })) })
    return () => controller.abort()
  }, [key, scope, api, tenant, enabled])
  useEffect(() => {
    if (!enabled) return
    const refresh = () => retry(value => value + 1)
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [enabled])
  return { ...(state.scope === scope ? state : {}), retry: () => retry(value => value + 1),
    setCatalog: (catalog: MediaFolderCatalog) => { pending.current?.abort(); setState({ scope, catalog }) } }
}

const RetryFolders: React.FC<{ error: string; retry: () => void }> = ({ error, retry }) => (
  <p role="alert">{error} <button type="button" className="cms-media-folders__retry" onClick={retry}>Retry</button></p>
)

const CreateMediaFolder: React.FC<{
  catalog: MediaFolderCatalog; parent: string; disabled?: boolean
  onCreated: (result: { path: string; catalog: MediaFolderCatalog }) => void
}> = ({ catalog, parent: incomingParent, disabled, onCreated }) => {
  const { config: { routes: { api } } } = useConfig()
  const id = useId()
  const [open, setOpen] = useState(false)
  const [parent, setParent] = useState(incomingParent)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef<AbortController | null>(null)
  const onCreatedRef = useRef(onCreated)
  onCreatedRef.current = onCreated
  useEffect(() => () => pending.current?.abort(), [])
  let path = ''
  try { path = createMediaFolderPath(parent, name) } catch { /* Validation is shown on Create. */ }
  const create = async () => {
    if (saving || disabled) return
    let next
    try { next = createMediaFolderPath(parent, name) }
    catch (error) { setError(error instanceof Error ? error.message : 'Enter a valid folder name.'); return }
    const controller = new AbortController()
    pending.current = controller
    setSaving(true); setError('')
    try {
      const response = await fetch(`${api}/media/folders?tenant=${encodeURIComponent(catalog.tenant.id)}`, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent, name }), signal: controller.signal,
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.errors?.[0]?.message || 'Could not create the folder. Try again.')
      if (String(result.catalog?.tenant?.id) !== String(catalog.tenant.id) || result.path !== next) throw new Error('Folder response did not match this workspace.')
      if (!controller.signal.aborted) { onCreatedRef.current(result); setOpen(false); setName('') }
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not create the folder. Try again.')
    } finally { if (!controller.signal.aborted) setSaving(false) }
  }
  return <div className="cms-media-folders__create">
    <button type="button" className="cms-media-folders__new" disabled={disabled || saving} title="New folder"
      aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => {
        setParent(catalog.folders.some(folder => folder.path === incomingParent && folder.uploadable) ? incomingParent : '')
        setError(''); setOpen(!open)
      }}><FolderIcon /><span>New folder</span></button>
    {open && <div id={`${id}-panel`} className="cms-media-folders__create-panel" role="group" aria-label="New folder"
      onKeyDown={event => {
        if (event.key === 'Enter') { event.preventDefault(); void create() }
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (!saving) setOpen(false) }
      }}>
      <label htmlFor={`${id}-parent`}>Parent folder</label>
      <select id={`${id}-parent`} value={parent} disabled={saving || disabled} onChange={event => setParent(event.target.value)}>
        {catalog.folders.filter(folder => folder.uploadable).map(folder => <option key={folder.path} value={folder.path}>
          {folder.path ? folder.path.replaceAll('/', ' / ') : 'All files'}
        </option>)}
      </select>
      <label htmlFor={`${id}-name`}>Folder name</label>
      <input id={`${id}-name`} type="text" value={name} autoFocus maxLength={300} disabled={saving || disabled}
        aria-invalid={Boolean(error)} onChange={event => { setName(event.target.value); setError('') }} />
      {path && <output className="cms-media-folders__path" htmlFor={`${id}-name`}>{path}</output>}
      {error && <p role="alert">{error}</p>}
      <div className="cms-media-folders__create-actions">
        <button type="button" disabled={saving || disabled} onClick={() => void create()}>{saving ? 'Creating...' : 'Create folder'}</button>
        <button type="button" disabled={saving} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>}
  </div>
}

/** Payload renders this list slot in both the full library and native relationship pickers. */
export const MediaFolderBrowser: React.FC = () => {
  const id = useId()
  const { selectedTenantID } = useTenantSelection()
  const { data, query, handleWhereChange } = useListQuery()
  const { isInDrawer } = useListDrawerContext()
  const drawerTenant = useRef<number | string | null>(null)
  const owners = [...new Set((data?.docs ?? []).map(doc => mediaTenantID(doc.tenant)).filter(value => value !== null))]
  if (isInDrawer && owners.length === 1) drawerTenant.current = owners[0]
  const tenantID = isInDrawer ? drawerTenant.current ?? mediaTenantID(selectedTenantID) : mediaTenantID(selectedTenantID)
  const { catalog, error, retry, setCatalog } = useMediaFolders(tenantID, true, data?.totalDocs)
  const [chosen, setChosen] = useState<{ path: string; filter?: Where }>({ path: '' })
  const folders = catalog?.folders ?? []
  const activeFilter = findMediaFolderFilter(query.where)
  const activePaths = (activeFilter?.prefix as { in?: unknown } | undefined)?.in
  const remembered = folders.find(folder => folder.path === chosen.path && hasMediaFolderFilter(query.where, chosen.filter))
  const selected = remembered ?? [...folders].reverse().find(folder => hasMediaFolderFilter(query.where, mediaFolderFilter(folder))) ??
    (Array.isArray(activePaths) ? [...folders].reverse().find(folder => folder.path &&
      activePaths.every(prefix => typeof prefix === 'string' && folder.prefixes.includes(prefix))) : undefined)
  const path = selected?.path ?? ''
  const lastTenant = useRef(tenantID === null ? null : String(tenantID))
  useEffect(() => {
    if (!catalog) return
    const changedTenant = lastTenant.current !== null && lastTenant.current !== String(catalog.tenant.id)
    lastTenant.current = String(catalog.tenant.id)
    if (!activeFilter) return
    const rebound = mediaFolderFilter(selected)
    if (changedTenant || rebound && JSON.stringify(rebound) !== JSON.stringify(activeFilter)) {
      setChosen(changedTenant ? { path: '' } : { path: selected!.path, filter: rebound })
      void handleWhereChange?.(replaceMediaFolderFilter(query.where, activeFilter, changedTenant ? undefined : rebound))
    }
  }, [catalog, activeFilter, selected, query.where, handleWhereChange])
  const navigate = (next: string, available = folders) => {
    const filter = mediaFolderFilter(available.find(folder => folder.path === next))
    setChosen({ path: next, filter })
    void handleWhereChange?.(replaceMediaFolderFilter(query.where, activeFilter, filter))
  }
  const crumbs = path.startsWith('@stored:') ? [path] : path.split('/').filter(Boolean).map((_, i, parts) => parts.slice(0, i + 1).join('/'))

  return (
    <section className="cms-media-folders" aria-label="Media folders">
      {error && <RetryFolders error={error} retry={retry} />}
      {!catalog ? !error && <p role="status">Loading folders...</p> : <>
        <div className="cms-media-folders__toolbar">
          <nav aria-label="Folder path" className="cms-media-folders__breadcrumbs">
            <button type="button" onClick={() => navigate('')} aria-current={!path ? 'page' : undefined}>All files</button>
            {crumbs.map(crumb => <React.Fragment key={crumb}><span aria-hidden="true">/</span><button type="button"
              onClick={() => navigate(crumb)} aria-current={crumb === path ? 'page' : undefined}>
              {folders.find(folder => folder.path === crumb)?.label ?? crumb}
            </button></React.Fragment>)}
          </nav>
          <div className="cms-media-folders__select">
            <label htmlFor={id}>Folder</label>
            <select id={id} value={path} onChange={event => navigate(event.target.value)}>
              {folders.map(folder => <option key={folder.path} value={folder.path}>
                {folder.path ? folder.uploadable ? folder.path.replaceAll('/', ' / ') : folder.label : 'All files'} ({folder.count})
              </option>)}
            </select>
            <CreateMediaFolder key={String(catalog.tenant.id)} catalog={catalog} parent={selected?.uploadable ? path : ''}
              onCreated={result => { setCatalog(result.catalog); navigate(result.path, result.catalog.folders) }} />
          </div>
        </div>
        <div className="cms-media-folders__children">
          {folders.filter(folder => folder.path && folder.parent === path).map(folder => <button type="button" key={folder.path}
            onClick={() => navigate(folder.path)} className="cms-media-folders__folder">
            <FolderIcon /><span>{folder.label}</span><span className="cms-media-folders__count">{folder.count}</span>
          </button>)}
        </div>
      </>}
    </section>
  )
}

export const MediaUploadFolder: React.FC<{ path: string; readOnly?: boolean }> = ({ path, readOnly }) => {
  const id = useId()
  const { id: documentID, data } = useDocumentInfo()
  const { value, setValue, disabled, formInitializing, formProcessing } = useField<string>({ path })
  const tenantField = useFormFields(([fields]) => fields.tenant)
  const { selectedTenantID } = useTenantSelection()
  const tenantID = mediaTenantID(tenantField ? tenantField.value : data?.tenant ?? selectedTenantID)
  const existing = documentID !== undefined && documentID !== null
  const lastTenant = useRef(tenantID)
  useEffect(() => {
    if (!existing && lastTenant.current !== null && String(lastTenant.current) !== String(tenantID) && value) setValue('')
    lastTenant.current = tenantID
  }, [tenantID, existing, value, setValue])
  const { catalog, error, retry, setCatalog } = useMediaFolders(tenantID, !existing && tenantID !== null)
  if (existing) return <div className="field-type cms-media-folders__destination"><label>R2 folder</label><p>{data?.prefix || 'Original storage folder'}</p></div>
  return (
    <div className="field-type cms-media-folders__destination">
      <label htmlFor={id}>Upload folder</label>
      {error && <RetryFolders error={error} retry={retry} />}
      <select id={id} value={value ?? ''} disabled={readOnly || disabled || formInitializing || formProcessing || !catalog}
        onChange={event => setValue(event.target.value)}>
        <option value="">General uploads</option>
        {catalog?.folders.filter(folder => folder.path && folder.uploadable).map(folder =>
          <option key={folder.path} value={folder.path}>{folder.path.replaceAll('/', ' / ')}</option>)}
      </select>
      {catalog && <CreateMediaFolder key={String(catalog.tenant.id)} catalog={catalog} parent={value ?? ''}
        disabled={readOnly || disabled || formInitializing || formProcessing}
        onCreated={result => { setCatalog(result.catalog); setValue(result.path) }} />}
      {!catalog && !error && <p role="status">{tenantID === null ? 'Choose a tenant first.' : 'Loading folders...'}</p>}
    </div>
  )
}
