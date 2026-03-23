/**
 * FacebookPreview - Mock Facebook link share card.
 *
 * Renders a realistic Facebook Open Graph preview with:
 * - 1.91:1 aspect ratio hero image (or placeholder)
 * - Gray footer bar with domain, title, and description
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'

interface FacebookPreviewProps {
  /** OG title */
  title: string
  /** OG description */
  description: string
  /** OG image URL */
  image: string
  /** Site URL (used to extract display domain) */
  url: string
}

export function FacebookPreview({ title, description, image, url }: FacebookPreviewProps) {
  const domain = extractDomain(url)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <FacebookIcon className="h-3.5 w-3.5" />
          Facebook / Open Graph Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {/* Image area */}
          {image ? (
            <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center overflow-hidden">
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
            <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
              <ImagePlaceholder />
            </div>
          )}

          {/* Text footer */}
          <div className="p-3 bg-[#f2f3f5] space-y-1 border-t border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {domain}
            </div>
            <div className="text-[15px] font-semibold text-[#1d2129] leading-snug line-clamp-2">
              {title || 'Page Title'}
            </div>
            <div className="text-sm text-gray-500 line-clamp-1">
              {description || 'Page description'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function ImagePlaceholder() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-10 w-10 text-gray-300"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}
