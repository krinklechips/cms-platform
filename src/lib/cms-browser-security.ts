import type { NextRequest } from 'next/server'

type Environment = Record<string, string | undefined>
const DEFAULT_ORIGINS = ['https://serviettelab.com', 'https://roomchang.serviettelab.com']
const LOCAL_ORIGINS = ['http://localhost:3100', 'http://localhost:3110', 'http://roomchang.localhost:3110', 'http://127.0.0.1:3100']

function normalizedOrigin(value: string, environment: Environment): string {
  let url: URL
  try { url = new URL(value) } catch { throw new Error('CMS origins must be absolute trusted origins') }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.hostname.endsWith('.localhost')
  if ((url.protocol !== 'https:' && !(environment.NODE_ENV !== 'production' && local && url.protocol === 'http:')) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('CMS origins require HTTPS and must not contain credentials, paths or queries')
  }
  return url.origin
}

export const cmsPublicOrigin = (environment: Environment = process.env): string =>
  normalizedOrigin(environment.CMS_PUBLIC_URL || DEFAULT_ORIGINS[0], environment)

/** Explicit server-owned entries only; neither forwarded hosts nor tenant web
 * domains may silently extend cookie authentication's trust boundary. */
export function trustedCMSOrigins(environment: Environment = process.env): string[] {
  const configured = (environment.CMS_TRUSTED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean)
  return [...new Set([...DEFAULT_ORIGINS, cmsPublicOrigin(environment),
    ...(environment.NODE_ENV === 'production' ? [] : LOCAL_ORIGINS),
    ...configured.map(origin => normalizedOrigin(origin, environment)),
  ])]
}

export function allowCMSBrowserWrite(request: NextRequest, environment: Environment = process.env): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) return true
  const origin = request.headers.get('origin')
  if (!origin && !request.cookies.has('payload-token')) return true // Header-authenticated server clients use Payload's normal auth.
  try {
    const internal = new URL(request.url)
    // Render forwards the public origin; request.url itself can be localhost.
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || internal.host
    const protocol = request.headers.get('x-forwarded-proto') || internal.protocol.slice(0, -1)
    const target = normalizedOrigin(`${protocol}://${host}`, environment)
    if (!trustedCMSOrigins(environment).includes(target)) return false
    if (origin) return origin === target
    // Do not let originless same-site requests or fake Authorization headers
    // cause the native cookie strategy to accept a sibling's request.
    return request.headers.get('sec-fetch-site') === 'same-origin'
  } catch {
    return false
  }
}
