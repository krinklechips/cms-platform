import { useTenantAuth } from '@/lib/tenant-context'
import { ExternalLink } from 'lucide-react'

export function SitePreview() {
  const { tenant } = useTenantAuth()
  const siteUrl = tenant?.branding.public_site_url

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Site Preview</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Preview your public website.
          </p>
        </div>
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
          >
            Open in new tab
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* iframe or placeholder */}
      {siteUrl ? (
        <iframe
          src={siteUrl}
          title="Site preview"
          className="flex-1 w-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">No site URL configured</p>
            <p className="mt-1 text-sm text-gray-500">
              Contact your administrator to set up the public site URL for previewing.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
