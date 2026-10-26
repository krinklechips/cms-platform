import { rootCertificates } from 'node:tls'
import { supabaseRootCA } from './supabase-root-ca.mjs'

/** Shared by Payload (including migrations) and the plain-Node startup gate.
 * @param {string} uri
 * @param {Record<string, string | undefined>} environment
 * @returns {import('pg').PoolConfig}
 */
export function postgresConnection(uri, environment = process.env) {
  let url
  try { url = new URL(uri) } catch { throw new Error('DATABASE_URI must be a PostgreSQL URL') }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname) {
    throw new Error('DATABASE_URI must be a PostgreSQL URL with an explicit host')
  }
  // pg query parameters can override the URL host and replace the entire ssl object.
  for (const key of [...url.searchParams.keys()]) {
    if (['host', 'hostaddr', 'port', 'service'].includes(key.toLowerCase())) {
      throw new Error('DATABASE_URI query parameters must not override its destination')
    }
    if (key.toLowerCase().startsWith('ssl') || key.toLowerCase() === 'uselibpqcompat') url.searchParams.delete(key)
  }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  const ca = environment.DATABASE_SSL_CA
  if (local && environment.NODE_ENV !== 'production' && !ca) {
    return { connectionString: url.toString(), ssl: false }
  }
  if (environment.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    throw new Error('Verified PostgreSQL TLS cannot run with NODE_TLS_REJECT_UNAUTHORIZED=0')
  }
  const supabase = url.hostname.endsWith('.supabase.com') || url.hostname.endsWith('.supabase.co')
  return {
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2',
      ...(ca ? { ca } : supabase ? { ca: [...rootCertificates, supabaseRootCA] } : {}),
    },
  }
}
