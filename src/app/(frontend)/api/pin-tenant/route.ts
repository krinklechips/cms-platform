import { cookies, headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTenantByHost } from '@/lib/get-tenant-by-host'

/**
 * Sets the multi-tenant plugin's `payload-tenant` cookie from the request
 * host, then bounces back to the admin (see src/proxy.ts for why this must be
 * a server route: client-side writes are deleted by the plugin's provider).
 *
 * Lives under (frontend)/api — NOT (payload)/api — to stay clear of Payload's
 * generated [...slug] catch-all.
 *
 * Cookie contract (from the plugin source):
 *  - name `payload-tenant`, value = bare tenant id as a string
 *  - httpOnly:false (the plugin's client code reads document.cookie)
 *  - NO Domain attribute → host-only, so the pin on roomchang.serviettelab.com
 *    can never leak to serviettelab.com.
 */

const isSafeNext = (n: string | null): n is string =>
  Boolean(n && n.startsWith('/') && !n.startsWith('//') && !n.includes('://'))

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const nextParam = url.searchParams.get('next')
  const next = isSafeNext(nextParam) ? nextParam : '/admin'

  try {
    const h = await nextHeaders()
    const host = h.get('x-forwarded-host') ?? h.get('host')

    const payload = await getPayload({ config })
    const tenant = await getTenantByHost(payload, host)

    if (tenant) {
      // A tenant user who is NOT a member of this host's tenant must not be
      // pinned to it — the pin would AND with their access constraint and
      // every list would render silently empty ("looks fine" failure mode).
      let allowed = true
      try {
        const { user } = await payload.auth({ headers: h })
        if (user && !(user.roles ?? []).includes('super-admin')) {
          const memberships = (user.tenants ?? []).map((t) =>
            typeof t?.tenant === 'object' && t.tenant !== null
              ? String((t.tenant as { id?: number | string }).id)
              : String(t?.tenant),
          )
          allowed = memberships.includes(String(tenant.id))
        }
      } catch {
        // Not logged in yet (login page) — pinning is still correct: the
        // cookie scopes the selector/defaults once they do log in.
      }

      if (allowed) {
        const jar = await cookies()
        jar.set('payload-tenant', String(tenant.id), {
          path: '/',
          httpOnly: false,
          sameSite: 'lax',
          secure: true,
          maxAge: 60 * 60 * 24 * 365,
        })
        payload.logger.info(`pin-tenant: ${host} -> tenant ${tenant.id} (${tenant.slug})`)
      } else {
        payload.logger.warn(`pin-tenant: user is not a member of host tenant ${tenant.slug} — not pinning`)
      }
    }
    // No tenant for this host: platform view is the correct fallback — fail
    // loud in the logs rather than inventing a tenant.
  } catch (err) {
    console.warn('pin-tenant: resolution failed, continuing unpinned:', err)
  }

  redirect(next) // outside try/catch — redirect() throws NEXT_REDIRECT
}
