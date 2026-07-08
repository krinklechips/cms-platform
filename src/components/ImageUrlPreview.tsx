'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

/**
 * Thumbnail preview under image-URL text fields — editors see the actual
 * picture, not just a URL. Rendered via admin.components.afterInput.
 */
export const ImageUrlPreview: React.FC<{ path?: string }> = (props) => {
  const path = props.path ?? ''
  const { value } = useField<string>({ path })

  if (!value || typeof value !== 'string' || !/^https?:\/\//.test(value)) return null

  return (
    <div style={{ marginTop: 8 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={value}
        alt="preview"
        style={{
          maxWidth: 280,
          maxHeight: 160,
          objectFit: 'contain',
          borderRadius: 6,
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-50)',
        }}
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )
}
