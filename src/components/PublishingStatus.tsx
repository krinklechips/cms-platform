'use client'

import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { Button, ExternalLinkIcon, MinimizeMaximizeIcon, useDocumentDrawerContext, useDocumentInfo, useFormModified, useFormProcessing, useLivePreviewContext, useWindowInfo } from '@payloadcms/ui'
import { publishingState } from '@/lib/publishing-state'
import { observePreviewToolbarLayout } from '../lib/preview-toolbar-layout'
import { TranslationStatus } from './TranslationStatus'

export const PublishingStatus = () => {
  const { collectionSlug, id, hasPublishedDoc, unpublishedVersionCount } = useDocumentInfo()
  const { drawerSlug } = useDocumentDrawerContext()
  const { breakpoints: { m: mobile } } = useWindowInfo()
  const modified = useFormModified()
  const processing = useFormProcessing()
  const { isLivePreviewEnabled, isLivePreviewing, previewWindowType, setIsLivePreviewing, setPreviewWindowType, url } = useLivePreviewContext()
  const initializedEditor = useRef<string | null>(null)
  const actionRef = useRef<HTMLDivElement | null>(null)
  const editor = `${collectionSlug}:${id}`
  const canPreview = Boolean(id && !drawerSlug && isLivePreviewEnabled && url)
  const panelOpen = isLivePreviewing && previewWindowType === 'iframe'

  useLayoutEffect(() => {
    if (canPreview && actionRef.current) return observePreviewToolbarLayout(actionRef.current)
  }, [canPreview, editor])

  useEffect(() => {
    if (!canPreview || mobile === undefined || initializedEditor.current === editor) return
    initializedEditor.current = editor
    // Old per-collection preferences must not leave otherwise identical editors without a panel.
    if (previewWindowType !== 'iframe') setPreviewWindowType('iframe')
    setIsLivePreviewing(!mobile)
  }, [canPreview, editor, mobile, previewWindowType, setIsLivePreviewing, setPreviewWindowType])

  const togglePreview = () => {
    if (previewWindowType !== 'iframe') setPreviewWindowType('iframe')
    setIsLivePreviewing(!panelOpen)
  }
  return (
    <div className="cms-preview-action" ref={actionRef}>
      <TranslationStatus />
        <span className={modified || processing ? 'cms-pending-state' : 'cms-sr-only'} role="status" aria-live="polite">
          {publishingState({ modified, processing, hasPublishedDoc, unpublishedVersionCount })}
        </span>
      {canPreview ? (
        <div className="cms-preview-buttons" role="group" aria-label="Page preview">
          <Button
            type="button"
            margin={false}
            buttonStyle="secondary"
            size="medium"
            className="cms-preview-toggle"
            icon={<MinimizeMaximizeIcon isMinimized={!panelOpen} />}
            iconPosition="left"
            extraButtonProps={{ 'aria-expanded': panelOpen, 'aria-controls': 'live-preview-iframe' }}
            tooltip={panelOpen ? 'Hide preview' : 'Show preview'}
            onClick={togglePreview}
          >
            {panelOpen ? 'Hide preview' : 'Show preview'}
          </Button>
          <Button
            el="anchor"
            margin={false}
            url={url ?? undefined}
            newTab
            buttonStyle="secondary"
            size="medium"
            className="cms-preview-new-tab"
            icon={<ExternalLinkIcon />}
            iconPosition="left"
            tooltip="Open the latest saved draft in a new tab"
          >
            Preview in new tab
          </Button>
        </div>
      ) : null}
    </div>
  )
}
