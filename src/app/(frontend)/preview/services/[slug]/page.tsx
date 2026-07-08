import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ServicePreviewClient } from './preview-client'

export const dynamic = 'force-dynamic'

/**
 * Live-Preview target for the `services` collection.
 * Rendered inside the Payload admin's preview iframe; the client component
 * subscribes to admin form state, so edits appear on every keystroke.
 * (Roomchang-styled approximation — the pixel-identical dummy site is phase 2.)
 */
export default async function ServicePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ locale?: string }>
}) {
  const { slug } = await params
  const { locale = 'en' } = await searchParams

  const payload = await getPayload({ config })
  const doc = (
    await payload.find({
      collection: 'services',
      where: { slug: { equals: slug } },
      locale: locale as 'en' | 'km' | 'zh',
      limit: 1,
    })
  ).docs[0]

  if (!doc) {
    return (
      <div style={{ padding: 48, fontFamily: 'system-ui' }}>
        Service “{slug}” not found — save the document once, then reload the preview.
      </div>
    )
  }

  return <ServicePreviewClient initialData={doc} locale={locale} />
}
