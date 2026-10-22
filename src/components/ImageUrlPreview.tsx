'use client'

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

type ImageUrlPreviewProps = {
  path?: string
  readOnly?: boolean
  field?: { admin?: { readOnly?: boolean } }
}

export const ImageUrlPreview: React.FC<ImageUrlPreviewProps> = (props) => (
  <ImageUrlPreviewField {...props} />
)

export const HeroImageUrlPreview: React.FC<ImageUrlPreviewProps> = (props) => (
  <ImageUrlPreviewField {...props} nativeSibling="image" />
)

export const SectionImageUrlPreview: React.FC<ImageUrlPreviewProps> = (props) => (
  <ImageUrlPreviewField {...props} nativeSibling="media" />
)

/** Only an explicit library selection writes the URL; native relations stay independent. */
const ImageUrlPreviewField: React.FC<ImageUrlPreviewProps & { nativeSibling?: 'image' | 'media' }> = (props) => {
  const { value, setValue, path, disabled, formInitializing, formProcessing } = useField<string>({
    potentiallyStalePath: props.path,
  })
  // useField's current path follows reordered rows, unlike the static server prop.
  const nativePath = props.nativeSibling && path
    ? `${path.slice(0, path.lastIndexOf('.') + 1)}${props.nativeSibling}`
    : undefined
  const nativeValue = useFormFields(([fields]) => nativePath ? fields[nativePath]?.value : undefined)
  // An unresolved relationship still takes priority; never show its fallback as active.
  const nativeSelected = nativeValue !== null && nativeValue !== undefined && nativeValue !== ''
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
      {props.nativeSibling && (
        <p role="status" style={{ margin: '0 0 8px' }}>
          {nativeSelected
            ? 'Active source: Media Library. Fallback URL inactive. To use the fallback URL, remove the image using the Media Library field above.'
            : value
              ? 'Active source: fallback URL. No Media Library image selected.'
              : 'No image selected. Choose a Media Library image or enter a fallback URL.'}
        </p>
      )}
      <MediaPickerControls
        // Discard open drawers and their callbacks when the editing context changes.
        key={JSON.stringify([path, tenantID, locale.code, readOnly, value, nativePath, nativeValue])}
        tenantID={tenantID}
        readOnly={readOnly}
        fallback={nativeSelected}
        onSelect={setValue}
      />
      {!nativeSelected && value &&
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
  fallback: boolean
  onSelect: (url: string) => void
}> = ({ tenantID, readOnly, fallback, onSelect }) => {
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
  useLayoutEffect(() => { drawers.current = { list, upload } }, [list, upload])
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
          {fallback ? 'Select image for fallback URL' : 'Select image'}
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
          {fallback ? 'Upload image for fallback URL' : 'Upload image'}
        </Button>
      </div>
      {tenantID === null && <p role="status">Choose a tenant before selecting or uploading an image.</p>}
      {error && <p role="alert">{error}</p>}
      {uploaded && <p role="status">{fallback
        ? 'Image uploaded. Select image to set the fallback URL; the Media Library image remains active.'
        : 'Image uploaded. Select image to use it here.'}</p>}
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
