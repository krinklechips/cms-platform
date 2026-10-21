'use client'

import React, { useEffect } from 'react'
import { DefaultCell, useDocumentTitle, useFormFields, useListDrawerContext } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'
import { getStatLabel, getStatPageSummary } from '@/lib/stat-pages'

export const StatNameCell = (props: DefaultCellComponentProps) => {
  const key = typeof props.rowData?.key === 'string' ? props.rowData.key : ''
  const { drawerSlug, onSelect } = useListDrawerContext()
  // Custom cells bypass Payload's normal drawer-selection adapter.
  const selection = drawerSlug && props.link !== false ? {
    link: false,
    onClick: ({ collectionSlug, rowData }: Parameters<NonNullable<DefaultCellComponentProps['onClick']>>[0]) => {
      if (typeof onSelect === 'function') onSelect({ collectionSlug, doc: rowData, docID: rowData.id })
    },
  } : {}
  return <div>
    <DefaultCell {...props} {...selection} cellData={getStatLabel(key)} />
    <div style={{ marginTop: 4, maxWidth: 360, whiteSpace: 'normal', fontSize: 14, lineHeight: 1.5, color: 'var(--theme-elevation-600)' }}>
      {getStatPageSummary(key)}
    </div>
  </div>
}

export const StatUsage = () => {
  const key = useFormFields(([fields]) => fields.key?.value as string | undefined)
  const { title, setDocumentTitle } = useDocumentTitle()
  useEffect(() => {
    if (!key) return
    const label = `${getStatLabel(key)} (${getStatPageSummary(key)})`
    if (title !== label) setDocumentTitle(label)
  }, [key, title, setDocumentTitle])
  return <div className="field-type">
    <span className="field-label">Pages updated</span>
    <p>{getStatPageSummary(key ?? '')}</p>
  </div>
}
