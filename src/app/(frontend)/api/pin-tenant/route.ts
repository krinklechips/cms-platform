import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTenantByHost } from '@/lib/get-tenant-by-host'

/**
 * Sets the multi-tenant plugin's `payload-tenant` cookie from the request
 * host, then bounces back to the admin (see src/proxy.ts).
 *
 * INCIDENT 2026-08-18 (ERR_TOO_MANY_REDIRECTS): the first version used
 * `cookies().set()` + thrown `redirect()` — in a Next 16 Route Handler the
 * Set-Cookie never made it onto the redirect response, so the proxy bounced
 * back here forever. Rules now:
 *   1. Cookies are set ON the NextResponse we return — never via the async
 *      cookies() store in this handler.
 *   2. EVERY non-pinning path sets a short-lived `pt-nopin` sentinel that the
 *      proxy also honors — no outcome can loop.
 */

const isSafeNext = (n: string | null): n is string =>
  Boolean(n && n.startsWith('/') && !n.startsWith('//') && !n.includes('://'))

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const nextParam = url.searchParams.get('next')
  const next = isSafeNext(nextParam) ? nextParam : '/admin'
  // Behind Render's proxy request.url carries the INTERNAL origin
  // (localhost:10000) — build the redirect from the forwarded host or the
  // browser lands on localhost (second half of the 2026-08-18 incident).
  const h0 = await nextHeaders()
  const proto = h0.get('x-forwarded-proto') ?? 'https'
  const publicHost = h0.get('x-forwarded-host') ?? h0.get('host') ?? url.host
  const res = NextResponse.redirect(`${proto}://${publicHost}${next}`, 307)

  // Loop-breaker default: if we end up not pinning for ANY reason, tell the
  // proxy to stop redirecting for a while (it re-tries after expiry).
  const noPin = (why: string) => {
    console.warn(`pin-tenant: not pinning (${why}) — setting pt-nopin sentinel`)
    res.cookies.set('pt-nopin', '1', { path: '/', maxAge: 600, httpOnly: true, sameSite: 'lax' })
    return res
  }

  try {
    const h = h0
    const host = publicHost

    const payload = await getPayload({ config })
    const tenant = await getTenantByHost(payload, host)
    if (!tenant) return noPin(`no tenant for host ${host}`)

    // A tenant user who is NOT a member of this host's tenant must not be
    // pinned to it — the pin would AND with their access constraint and every
    // list would render silently empty.
    try {
      const { user } = await payload.auth({ headers: h })
      if (user && !(user.roles ?? []).includes('super-admin')) {
        const memberships = (user.tenants ?? []).map((t) =>
          typeof t?.tenant === 'object' && t.tenant !== null
            ? String((t.tenant as { id?: number | string }).id)
            : String(t?.tenant),
        )
        if (!memberships.includes(String(tenant.id))) {
          return noPin(`user is not a member of ${tenant.slug}`)
        }
      }
    } catch {
      // Not logged in yet (login page) — pinning is still correct.
    }

    res.cookies.set('payload-tenant', String(tenant.id), {
      path: '/',
      httpOnly: false, // the plugin's client code reads document.cookie
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
      // NO domain: host-only, so the pin never leaks across hosts.
    })
    payload.logger.info(`pin-tenant: ${host} -> tenant ${tenant.id} (${tenant.slug})`)
    return res
  } catch (err) {
    return noPin(`resolution failed: ${(err as Error).message}`)
  }
}
