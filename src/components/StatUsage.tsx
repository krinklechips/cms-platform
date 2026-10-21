'use client'

import React, { useEffect } from 'react'
import { DefaultCell, Link, useConfig, useDocumentTitle, useFormFields, useListDrawerContext } from '@payloadcms/ui'
import { useSearchParams } from 'next/navigation'
import type { DefaultCellComponentProps } from 'payload'
import { getStatLabel, getStatPageLinks, getStatPageSummary, getStatRecordHref } from '@/lib/stat-pages'

export const StatNameCell = (props: DefaultCellComponentProps) => {
  const key = typeof props.rowData?.key === 'string' ? props.rowData.key : ''
  const { drawerSlug, onSelect } = useListDrawerContext()
  const search = useSearchParams()
  const { config: { routes: { admin: adminRoute } } } = useConfig()
  const id = props.rowData?.id
  const linkURL = props.linkURL ?? (typeof id === 'string' || typeof id === 'number'
    ? getStatRecordHref(key, id, search.get('statPage'), adminRoute)
    : undefined)
  // Custom cells bypass Payload's normal drawer-selection adapter.
  const selection = drawerSlug && props.link !== false ? {
    link: false,
    onClick: ({ collectionSlug, rowData }: Parameters<NonNullable<DefaultCellComponentProps['onClick']>>[0]) => {
      if (typeof onSelect === 'function') onSelect({ collectionSlug, doc: rowData, docID: rowData.id })
    },
  } : {}
  return <div>
    <DefaultCell {...props} {...selection} linkURL={linkURL} cellData={getStatLabel(key)} />
    <div style={{ marginTop: 4, maxWidth: 360, whiteSpace: 'normal', fontSize: 14, lineHeight: 1.5, color: 'var(--theme-elevation-600)' }}>
      {getStatPageSummary(key)}
    </div>
  </div>
}

export const StatUsage = () => {
  const key = useFormFields(([fields]) => fields.key?.value as string | undefined)
  const { title, setDocumentTitle } = useDocumentTitle()
  const { config: { routes: { admin: adminRoute } } } = useConfig()
  const links = getStatPageLinks(key ?? '', adminRoute)
  useEffect(() => {
    if (!key) return
    const label = `${getStatLabel(key)} (${getStatPageSummary(key)})`
    if (title !== label) setDocumentTitle(label)
  }, [key, title, setDocumentTitle])
  return <div className="field-type">
    <span className="field-label">Pages updated</span>
    <p>{links.length ? links.map((link, index) => <React.Fragment key={link.href}>
      {index > 0 && ', '}<Link href={link.href} prefetch={false}>{link.label}</Link>
      {links.length === 1 && ' only'}
    </React.Fragment>) : 'Not currently displayed'}</p>
  </div>
}
