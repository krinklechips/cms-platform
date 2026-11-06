import type { AfterErrorHook } from 'payload'

export const logServiceWriteDenial: AfterErrorHook = ({ collection, error, req }) => {
  const status = 'status' in error ? error.status : undefined
  const pageId = String(req.routeParams?.id ?? '')
  if (collection?.slug !== 'services' || req.method !== 'PATCH'
    || (status !== 401 && status !== 403) || !/^\d{1,12}$/.test(pageId)) return

  try {
    req.payload.logger.warn({
      event: 'cms-service-write-denied',
      accountId: req.user?.id ?? null,
      pageId,
      language: ['en', 'kh', 'cn'].includes(String(req.locale)) ? req.locale : null,
      status,
      stage: req.user ? 'authorization' : 'authentication',
    }, 'Service update rejected')
  } catch {
    // Diagnostics must never replace the original error or alter its response.
  }
}
