import { useTenantAuth } from '@/lib/tenant-context'
import { ExternalLink } from 'lucide-react'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Button } from '@/app/components/ui/button'
import { getTenantPublicSiteUrl } from './page-preview-url'

export function SitePreview() {
  const { tenant } = useTenantAuth()
  const siteUrl = getTenantPublicSiteUrl(tenant)

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6">
        <PageHeader
          title="Site Preview"
          subtitle="Preview your public website"
          breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Site Preview' }]}
          actions={
            siteUrl ? (
              <Button variant="outline" size="sm" asChild>
                <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Open in new tab
                </a>
              </Button>
            ) : undefined
          }
        />
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
