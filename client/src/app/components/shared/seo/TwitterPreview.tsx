/**
 * TwitterPreview - Mock Twitter/X card preview.
 *
 * Supports both card types:
 *   "summary_large_image" - large hero image on top, text below
 *   "summary"             - small square thumbnail on left, text on right
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'

interface TwitterPreviewProps {
  /** Card title */
  title: string
  /** Card description */
  description: string
  /** Card image URL */
  image: string
  /** Site URL (used to extract display domain) */
  url: string
  /** Twitter card type. Defaults to "summary_large_image". */
  cardType?: 'summary' | 'summary_large_image'
}

export function TwitterPreview({
  title,
  description,
  image,
  url,
  cardType = 'summary_large_image',
}: TwitterPreviewProps) {
  const domain = extractDomain(url)
  const isLarge = cardType === 'summary_large_image'

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <XIcon className="h-3.5 w-3.5" />
          Twitter / X Card Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {isLarge ? (
            <LargeCard
              title={title}
              description={description}
              image={image}
              domain={domain}
            />
          ) : (
            <SummaryCard
              title={title}
              description={description}
              image={image}
              domain={domain}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Large image card layout                                            */
/* ------------------------------------------------------------------ */

function LargeCard({
  title,
  description,
  image,
  domain,
}: {
  title: string
  description: string
  image: string
  domain: string
}) {
  return (
    <>
      {image ? (
        <div className="aspect-[2/1] bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div className="aspect-[2/1] bg-gray-100 flex items-center justify-center">
          <ImagePlaceholder />
        </div>
      )}
      <div className="p-3 space-y-0.5">
        <div className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-1">
          {title || 'Page Title'}
        </div>
        <div className="text-sm text-gray-500 line-clamp-2">
          {description || 'Page description'}
        </div>
        <div className="flex items-center gap-1 pt-0.5">
          <LinkIcon className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-400">{domain}</span>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Small summary card layout                                          */
/* ------------------------------------------------------------------ */

function SummaryCard({
  title,
  description,
  image,
  domain,
}: {
  title: string
  description: string
  image: string
  domain: string
}) {
  return (
    <div className="flex">
      {image ? (
        <div className="w-32 h-32 flex-shrink-0 bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      ) : (
        <div className="w-32 h-32 flex-shrink-0 bg-gray-100 flex items-center justify-center">
          <ImagePlaceholder size="sm" />
        </div>
      )}
      <div className="p-3 flex flex-col justify-center space-y-0.5 min-w-0">
        <div className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-1">
          {title || 'Page Title'}
        </div>
        <div className="text-xs text-gray-500 line-clamp-2">
          {description || 'Page description'}
        </div>
        <div className="flex items-center gap-1 pt-0.5">
          <LinkIcon className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-400">{domain}</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function extractDomain(url: string): string {
  if (!url) return 'example.com'
  try {
    const u = url.startsWith('http') ? new URL(url) : new URL(`https://${url}`)
    return u.hostname
  } catch {
    return 'example.com'
  }
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkIcon({ className }: { className?: string }) {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function ImagePlaceholder({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${dim} text-gray-300`}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}
