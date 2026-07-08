'use client'

import React from 'react'

/**
 * List-view cell for image-URL fields — shows the picture, not the URL.
 */
export const ImageCell: React.FC<{ cellData?: unknown }> = ({ cellData }) => {
  if (typeof cellData !== 'string' || !/^https?:\/\//.test(cellData)) {
    return <span style={{ color: 'var(--theme-elevation-400)' }}>—</span>
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cellData}
      alt=""
      style={{
        width: 64,
        height: 40,
        objectFit: 'cover',
        borderRadius: 4,
        border: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-elevation-50)',
      }}
      loading="lazy"
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
