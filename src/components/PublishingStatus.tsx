'use client'

import React from 'react'
import { Button, useDocumentInfo, useFormModified, useFormProcessing, useLivePreviewContext } from '@payloadcms/ui'
import { publishingState } from '@/lib/publishing-state'

export const PublishingStatus = () => {
  const { hasPublishedDoc, unpublishedVersionCount } = useDocumentInfo()
  const modified = useFormModified()
  const processing = useFormProcessing()
  const { isLivePreviewEnabled, openPopupWindow, url } = useLivePreviewContext()
  return (
    <div className="cms-preview-action">
        <span className={modified || processing ? 'cms-pending-state' : 'cms-sr-only'} role="status" aria-live="polite">
          {publishingState({ modified, processing, hasPublishedDoc, unpublishedVersionCount })}
        </span>
      {isLivePreviewEnabled && url ? (
        <Button
          type="button"
          buttonStyle="secondary"
          size="medium"
          disabled={modified || processing}
          tooltip={modified ? 'Save your draft before previewing' : undefined}
          onClick={openPopupWindow}
        >
          Preview page
        </Button>
      ) : null}
    </div>
  )
}
