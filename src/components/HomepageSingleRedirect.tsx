import type React from 'react'
import { redirect } from 'next/navigation'

/**
 * Homepage is ONE document per tenant, but Payload renders every collection as
 * a LIST first — so editors saw a data table with a single meaningless
 * "ID: 1" row, a "Search by ID" box and a "Create New" button that would have
 * created a SECOND homepage (the site only ever reads the first). Bad UX
 * called out by Enoch (2026-08-19).
 *
 * This list-view override sends the editor straight to THE document.
 *
 * PROP CONTRACT (learned the hard way — the first version assumed
 * `initPageResult` and rendered a blank page): a collection list override is
 * rendered by renderListView (node_modules/@payloadcms/next/dist/views/List/
 * index.js) with serverProps spread at the TOP LEVEL: { collectionConfig,
 * data, payload, user, params, searchParams, … } plus the default view's
 * clientProps ({ newDocumentURL, Table, … }). `data` already holds the query
 * result WITH our withHostScope baseFilter applied, so:
 *   - tenant domain  → docs[0] is that tenant's homepage
 *   - tenant user    → docs[0] is their homepage (plugin access scoping)
 *   - platform host  → docs[0] is the first tenant's homepage; with the HQ
 *     cockpit's "Open content" as the cross-tenant entry point, jumping into
 *     a doc beats showing a one-row table here too.
 *
 * redirect() works by THROWING (NEXT_REDIRECT) — it must stay outside any
 * try/catch.
 */

type ListOverrideProps = {
  data?: { docs?: { id?: number | string }[] }
  newDocumentURL?: string
}

export const HomepageSingleRedirect: React.FC<ListOverrideProps> = (props) => {
  const doc = props?.data?.docs?.[0]

  if (doc?.id != null) {
    redirect(`/admin/collections/homepage/${doc.id}`)
  }

  // No homepage yet (fresh tenant): go straight to the create form.
  redirect(props?.newDocumentURL ?? '/admin/collections/homepage/create')
}
