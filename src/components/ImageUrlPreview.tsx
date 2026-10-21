'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTenantSelection } from '@payloadcms/plugin-multi-tenant/client'
import {
  Button,
  PlusIcon,
  SearchIcon,
  SwapIcon,
  useAuth,
  useDocumentDrawer,
  useDocumentInfo,
  useField,
  useFormFields,
  useListDrawer,
  useLocale,
} from '@payloadcms/ui'
import type { FilterOptionsResult } from 'payload'
import { imageUrlFromMedia, isSafeImageUrl, mediaTenantID } from './MediaPicker'

/**
 * Augments the existing URL input through admin.components.afterInput.
 * Only the library's explicit selection callback writes the URL field.
 */
export const ImageUrlPreview: React.FC<{
  path?: string
  readOnly?: boolean
  field?: { admin?: { readOnly?: boolean } }
}> = (props) => {
  const { value, setValue, path, disabled, formInitializing, formProcessing } = useField<string>({
    potentiallyStalePath: props.path,
  })
  const tenantField = useFormFields(([fields]) => fields.tenant)
  const { data, hasSavePermission } = useDocumentInfo()
  const { selectedTenantID } = useTenantSelection()
  const locale = useLocale()
  const tenantID = mediaTenantID(tenantField ? tenantField.value : (data?.tenant ?? selectedTenantID))
  const readOnly = Boolean(
    props.readOnly ||
    props.field?.admin?.readOnly ||
    disabled ||
    formInitializing ||
    formProcessing ||
    hasSavePermission === false ||
    !path,
  )

  return (
    <div style={{ marginTop: 8 }}>
      <MediaPickerControls
        // Discard open drawers and their callbacks when the editing context changes.
        key={JSON.stringify([path, tenantID, locale.code, readOnly, value])}
        tenantID={tenantID}
        readOnly={readOnly}
        onSelect={setValue}
      />
      {value &&
        (isSafeImageUrl(value) ? (
          <ImagePreview key={value} url={value} />
        ) : (
          <p role="alert">Image preview unavailable. Enter an HTTPS or root-relative image URL, or select an image.</p>
        ))}
    </div>
  )
}

const MediaPickerControls: React.FC<{
  tenantID: number | string | null
  readOnly: boolean
  onSelect: (url: string) => void
}> = ({ tenantID, readOnly, onSelect }) => {
  const { permissions } = useAuth()
  const [error, setError] = useState('')
  const [uploaded, setUploaded] = useState(false)
  const active = useRef(true)
  const filterOptions = useMemo<FilterOptionsResult>(
    (): FilterOptionsResult => ({
      media: { and: [{ tenant: { equals: tenantID } }, { mimeType: { like: 'image/' } }] },
    }),
    [tenantID],
  )
  const [ListDrawer, , list] = useListDrawer({
    collectionSlugs: ['media'],
    selectedCollection: 'media',
    filterOptions,
  })
  const [UploadDrawer, , upload] = useDocumentDrawer({ collectionSlug: 'media' })
  const drawers = useRef({ list, upload })
  drawers.current = { list, upload }
  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
      const { list, upload } = drawers.current
      if (list.isDrawerOpen) list.closeDrawer()
      if (upload.isDrawerOpen) upload.closeDrawer()
    }
  }, [])
  const unavailable = readOnly || tenantID === null
  const canSelect = !unavailable && Boolean(permissions?.collections?.media?.read)
  const canUpload = !unavailable && Boolean(permissions?.collections?.media?.create)

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button
          type="button"
          buttonStyle="secondary"
          size="small"
          margin={false}
          icon={<SearchIcon />}
          disabled={!canSelect}
          onClick={() => {
            setError('')
            list.openDrawer()
          }}
        >
          Select image
        </Button>
        <Button
          type="button"
          buttonStyle="secondary"
          size="small"
          margin={false}
          icon={<PlusIcon />}
          disabled={!canUpload}
          onClick={() => {
            setError('')
            setUploaded(false)
            upload.openDrawer()
          }}
        >
          Upload image
        </Button>
      </div>
      {tenantID === null && <p role="status">Choose a tenant before selecting or uploading an image.</p>}
      {error && <p role="alert">{error}</p>}
      {uploaded && <p role="status">Image uploaded. Select image to use it here.</p>}
      {canSelect && list.isDrawerOpen && (
        <ListDrawer
          allowCreate={false}
          disableQueryPresets
          onSelect={({ collectionSlug, doc }) => {
            if (!active.current || !canSelect) return
            const url = collectionSlug === 'media' ? imageUrlFromMedia(doc, tenantID) : null
            if (!url) {
              setError(
                'Cannot use this file. Select an image from this tenant with a valid HTTPS or root-relative URL.',
              )
              list.closeDrawer()
              return
            }
            onSelect(url)
            list.closeDrawer()
          }}
        />
      )}
      {canUpload && upload.isDrawerOpen && (
        <UploadDrawer
          initialData={{ tenant: tenantID }}
          redirectAfterCreate={false}
          onSave={() => {
            if (!active.current) return
            upload.closeDrawer()
            setUploaded(true)
          }}
        />
      )}
    </>
  )
}

const ImagePreview: React.FC<{ url: string }> = ({ url }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    // Slow or stalled requests must offer the same recovery as broken images.
    if (status !== 'loading') return
    const timer = setTimeout(() => setStatus('error'), 15000)
    return () => clearTimeout(timer)
  }, [status, attempt])

  return (
    <div style={{ marginTop: 8, width: 280, maxWidth: '100%' }}>
      <div
        aria-busy={status === 'loading'}
        style={{
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-50)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {status !== 'error' && (
          <img
            key={attempt}
            src={url}
            alt="Image preview"
            referrerPolicy="no-referrer"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
          />
        )}
        {status === 'error' && <span>Preview unavailable</span>}
      </div>
      {status === 'loading' && <p role="status">Loading image...</p>}
      {status === 'error' && (
        <>
          <p role="alert">Could not load this image. Check the URL or select another image.</p>
          <Button
            type="button"
            buttonStyle="secondary"
            size="small"
            margin={false}
            icon={<SwapIcon />}
            onClick={() => {
              setAttempt((previous) => previous + 1)
              setStatus('loading')
            }}
          >
            Retry preview
          </Button>
        </>
      )}
    </div>
  )
}
