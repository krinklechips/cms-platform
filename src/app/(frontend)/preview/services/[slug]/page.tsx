import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

// Previews use the authenticated test-site entry point in preview-routes.ts.
// Keep this obsolete public route closed without initializing or querying Payload.
export default function DisabledServicePreviewPage() {
  notFound()
}
