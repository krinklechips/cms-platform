import type { PayloadRequest } from 'payload'
import { cmsPublicOrigin } from './cms-browser-security'

/** The request's Host and Origin must never choose a password-reset destination. */
export function cmsResetEmail(args?: { token?: string; req?: PayloadRequest }): string {
  if (!args?.token) throw new Error('A password reset token is required')
  const admin = args.req?.payload.config.routes.admin || '/admin'
  const reset = args.req?.payload.config.admin.routes.reset || '/reset'
  const origin = cmsPublicOrigin()
  const url = new URL(`${admin}${reset}/${encodeURIComponent(args.token)}`, `${origin}/`)
  if (url.origin !== origin) throw new Error('Invalid password reset destination')
  const href = url.href.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  return `<p>A password reset was requested for your CMS account.</p><p><a href="${href}">Reset your password</a></p><p>If you did not request this, ignore this email. Your password has not changed.</p>`
}
