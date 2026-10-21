'use client'

import React, { useEffect, useState } from 'react'
import { useConfig, useDocumentInfo, useFormModified, useFormProcessing, useLocale } from '@payloadcms/ui'
import { missingTranslations } from '../lib/translation-status'

export function TranslationStatus() {
  const { config } = useConfig()
  const { collectionSlug, id, lastUpdateTime } = useDocumentInfo()
  const locale = useLocale()
  const modified = useFormModified()
  const processing = useFormProcessing()
  const [state, setState] = useState<{ key: string; missing?: string[]; failed?: boolean } | null>(null)
  const collection = config.collections.find(c => c.slug === collectionSlug)
  const code = locale?.code
  const key = `${collectionSlug}:${id}:${code}:${lastUpdateTime}`

  useEffect(() => {
    if (!id || !collection || (code !== 'kh' && code !== 'cn') || modified || processing) return
    const controller = new AbortController()
    const qs = new URLSearchParams({ locale: 'all', 'fallback-locale': 'none', draft: 'true', depth: '0' })
    void fetch(`${config.routes.api}/${collection.slug}/${encodeURIComponent(String(id))}?${qs}`, { credentials: 'same-origin', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Coverage unavailable')
        const data = await response.json()
        if (!controller.signal.aborted) setState({ key, missing: missingTranslations(collection.fields, data, code) })
      })
      .catch(() => { if (!controller.signal.aborted) setState({ key, failed: true }) })
    return () => controller.abort()
  }, [id, collection, code, modified, processing, config.routes.api, key])

  if ((code !== 'kh' && code !== 'cn') || !id || modified || processing) return null
  const language = code === 'kh' ? 'Khmer' : 'Chinese'
  if (!state || state.key !== key) return <span className="cms-translation-state" role="status">Checking {language} translations...</span>
  if (state.failed) return <span className="cms-translation-state" role="status">Translation status unavailable</span>
  if (!state.missing?.length) return null
  return <span className="cms-translation-state" role="status" title={state.missing.join(', ')}>{language}: {state.missing.length} empty translation {state.missing.length === 1 ? 'field' : 'fields'}</span>
}
