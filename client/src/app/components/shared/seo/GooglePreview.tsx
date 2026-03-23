/**
 * GooglePreview - Mock Google SERP result card.
 *
 * Renders a realistic Google search result with the characteristic
 * blue title link, green URL breadcrumb, and gray description snippet.
 * Includes character count indicators for title and description.
 */

import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { CharBadge } from './CharBadge'

interface GooglePreviewProps {
  /** Page title (max ~60 chars shown in SERP) */
  title: string
  /** Display URL / breadcrumb */
  url: string
  /** Meta description (max ~155 chars shown in SERP) */
  description: string
}

export function GooglePreview({ title, url, description }: GooglePreviewProps) {
  const displayTitle = title || 'Page Title'
  const displayDesc = description || 'Add a meta description to see a preview here.'
  const displayUrl = url || 'example.com/page'

  // Build a breadcrumb-style URL the way Google displays it
  const breadcrumb = (() => {
    try {
      const parsed = displayUrl.startsWith('http')
        ? new URL(displayUrl)
        : new URL(`https://${displayUrl}`)
      const segments = parsed.pathname.split('/').filter(Boolean)
      if (segments.length === 0) return parsed.hostname
      return `${parsed.hostname} > ${segments.join(' > ')}`
    } catch {
      return displayUrl
    }
  })()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            Google Search Preview
          </span>
          <span className="flex items-center gap-2">
            <CharBadge count={title.length} max={60} label="Title" />
            <CharBadge count={description.length} max={155} label="Desc" />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-1">
          {/* Favicon + URL breadcrumb row */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
              <Globe className="h-4 w-4 text-gray-500" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-gray-800 truncate leading-tight">
                {(() => {
                  try {
                    const u = displayUrl.startsWith('http')
                      ? new URL(displayUrl)
                      : new URL(`https://${displayUrl}`)
                    return u.hostname
                  } catch {
                    return displayUrl
                  }
                })()}
              </div>
              <div className="text-xs text-gray-500 truncate">{breadcrumb}</div>
            </div>
          </div>

          {/* Title */}
          <div
            className="text-xl text-[#1a0dab] hover:underline cursor-pointer leading-snug pt-0.5"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {displayTitle.slice(0, 60)}
            {displayTitle.length > 60 ? '...' : ''}
          </div>

          {/* Description */}
          <div
            className="text-sm text-gray-600 leading-relaxed"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {displayDesc.slice(0, 155)}
            {displayDesc.length > 155 ? '...' : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* Inline Globe icon to avoid an extra lucide import at the call site */
function Globe({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}
