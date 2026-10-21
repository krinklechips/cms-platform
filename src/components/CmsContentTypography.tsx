'use client'

import React, { useEffect } from 'react'
import { useLocale } from '@payloadcms/ui'
import { Battambang, Noto_Sans_SC } from 'next/font/google'
import { observeCmsContentTypography } from '../lib/cms-content-typography'

const khmer = Battambang({ subsets: ['khmer'], weight: ['400', '700'], display: 'swap', preload: false })
const chinese = Noto_Sans_SC({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', preload: false })

// Register once in admin.components.header, inside Payload's LocaleProvider.
export function CmsContentTypography() {
  const locale = useLocale()
  const code = locale && typeof locale === 'object' ? locale.code : undefined

  useEffect(() => observeCmsContentTypography(document, code), [code])

  return <style>{`:root { --cms-font-khmer: ${khmer.style.fontFamily}; --cms-font-chinese: ${chinese.style.fontFamily}; }`}</style>
}
