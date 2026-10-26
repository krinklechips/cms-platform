export function cmsSecurityHeaders(environment: Record<string, string | undefined> = process.env) {
  return [{ source: '/:path*', headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ...(environment.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
  ] }]
}
