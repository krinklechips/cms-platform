import { createHash } from 'node:crypto'
import path from 'node:path'

export function assertRecoveryTarget(uri) {
  const url = new URL(uri)
  const database = decodeURIComponent(url.pathname.slice(1))
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.hostname !== '127.0.0.1' ||
      !url.port || !/^cms_recovery_[a-z0-9_]+$/.test(database)) {
    throw new Error('Recovery writes require a disposable loopback database named cms_recovery_*')
  }
  if (url.search) throw new Error('Recovery target query parameters are forbidden')
  return { database, port: Number(url.port) }
}

export function backupObjectPath(directory, key) {
  if (typeof key !== 'string' || key.includes('\\') || /[\u0000-\u001f\u007f]/.test(key) ||
      key.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error('Unsafe backup object key')
  }
  return path.join(path.resolve(directory), 'objects', ...key.split('/'))
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
  }
  return value
}

export function fingerprintRows(rows) {
  const hashes = rows.map(row => createHash('sha256').update(JSON.stringify(canonical(row))).digest('hex')).sort()
  return { count: rows.length, sha256: createHash('sha256').update(hashes.join('\n')).digest('hex') }
}

export function logicalRecoverySchema(snapshot) {
  // pg_dump compacts dropped-column holes; PG18 adds named NOT NULL catalog rows.
  // Ordered columns and is_nullable still enforce column order and nullability.
  return { ...snapshot,
    columns: snapshot.columns.map(column => Object.fromEntries(Object.entries(column).filter(([key]) => key !== 'ordinal_position'))),
    constraints: snapshot.constraints.filter(constraint => !constraint.definition.startsWith('NOT NULL ')),
  }
}

/** @param {Record<string, string | undefined>} environment
 * @returns {Record<string, string | undefined>} */
export function recoveryProcessEnvironment(environment = process.env) {
  return { ...Object.fromEntries(['PATH', 'HOME', 'USER', 'TMPDIR'].filter(key => environment[key])
    .map(key => [key, environment[key]])), LC_ALL: 'C', TZ: 'UTC' }
}

export function fingerprintRowText(rows) {
  if (!rows.every(row => typeof row === 'string')) throw new Error('Recovery row fingerprints require lossless PostgreSQL text')
  const hashes = rows.map(row => createHash('sha256').update(row).digest('hex')).sort()
  return { count: rows.length, sha256: createHash('sha256').update(hashes.join('\n')).digest('hex') }
}

export function verifiedRecoverySource(uri, certificateAuthority) {
  if (!certificateAuthority) throw new Error('Recovery source requires an explicit trusted CA')
  const url = new URL(uri)
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Expected a PostgreSQL recovery source')
  for (const key of [...url.searchParams.keys()]) if (key.startsWith('ssl')) url.searchParams.delete(key)
  return { connectionString: url.toString(), ssl: { ca: certificateAuthority, rejectUnauthorized: true } }
}

export function assertRecoveredSequence(before, after, restored) {
  if (before.name !== after.name || before.name !== restored.name ||
      [before, after, restored].some(row => typeof row.is_called !== 'boolean')) {
    throw new Error('Invalid recovery sequence identity or called state')
  }
  const first = BigInt(before.last_value), last = BigInt(after.last_value), value = BigInt(restored.last_value)
  if (last < first || (!after.is_called && (before.is_called || last !== first))) {
    throw new Error('Sequence reset or reversal during capture requires a separate reviewed recovery')
  }
  if (value < first || value > last) throw new Error('Restored sequence is outside the source capture interval')
  if ((!restored.is_called && (before.is_called || value !== first)) || (!after.is_called && restored.is_called)) {
    throw new Error('Restored sequence has an impossible called/uncalled state')
  }
}
