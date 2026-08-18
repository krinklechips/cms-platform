import { NextResponse, type NextRequest } from 'next/server'

/**
 * LAYER 2 of host scoping — pin the multi-tenant plugin's `payload-tenant`
 * cookie from the request host, so on roomchang.serviettelab.com the admin's
 * relationship pickers and new-document tenant defaults are scoped from the
 * very first render (Layer 1 = withHostScope only filters LIST views).
 *
 * Next 16: this file MUST be `proxy.ts` (middleware.ts is deprecated; having
 * both throws a build error) and always runs on the Node runtime — do NOT add
 * `export const runtime`.
 *
 * Design rules (from reading the plugin source — see PlatformNav/host-scope):
 *  - matcher covers /admin ONLY. Never /api: the sandbox site reads the REST
 *    API anonymously and a redirect there would be a live outage.
 *  - The cookie cannot be set from a client component (the plugin's provider
 *    deletes it on mount when its server-rendered initialValue was empty), so
 *    we bounce through a server route that sets it BEFORE the admin renders.
 *  - Fail open, always: any error here must fall through to a normal render.
 */

const PLATFORM_HOSTS = new Set(['serviettelab.com', 'www.serviettelab.com', 'localhost'])

export const config = { matcher: ['/admin/:path*'] }

export default function proxy(req: NextRequest) {
  try {
    const host = (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '')
      .split(':')[0]
      .trim()
      .toLowerCase()

    if (!host || PLATFORM_HOSTS.has(host)) return // platform view: untouched
    if (req.cookies.has('payload-tenant')) return // already pinned

    const url = req.nextUrl.clone()
    url.pathname = '/api/pin-tenant'
    url.search = ''
    url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(url)
  } catch {
    return // fail open — never break an admin render from here
  }
}
