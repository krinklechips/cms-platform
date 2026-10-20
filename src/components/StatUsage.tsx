'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import { getStatPages } from '@/lib/stat-pages'

export const StatUsage = () => {
  const key = useFormFields(([fields]) => fields.key?.value as string | undefined)
  const pages = getStatPages(key ?? '')
  return <div className="field-type">
    <span className="field-label">Appears on</span>
    <p>{pages.length ? pages.map((page) => page.label).join(', ') : 'Not currently displayed'}</p>
  </div>
}
