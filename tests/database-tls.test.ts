import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { X509Certificate } from 'node:crypto'
import { createServer } from 'node:net'
import pg from 'pg'
import { postgresConnection } from '../src/lib/postgres-connection.mjs'
import { supabaseRootCA } from '../src/lib/supabase-root-ca.mjs'
import { loadPayloadConfig } from './helpers/load-payload-config'

test('the actual PostgreSQL adapter requires authenticated TLS without connecting or changing schema', async () => {
  const before = process.env.DATABASE_URI
  process.env.DATABASE_URI = 'postgres://fixture:unused@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
  try {
    const config = await loadPayloadConfig()
    const adapter = config.db.init({ payload: { config } } as never) as unknown as {
      poolOptions: { ssl?: { rejectUnauthorized?: boolean; ca?: unknown }; connectionString: string }
      push?: boolean
    }
    assert.equal(adapter.poolOptions.ssl?.rejectUnauthorized, true)
    assert.ok(adapter.poolOptions.ssl?.ca, 'Supabase must have an explicit trusted certificate authority')
    assert.equal(adapter.push, false)
  } finally {
    if (before === undefined) delete process.env.DATABASE_URI
    else process.env.DATABASE_URI = before
  }
})

test('TLS URL options and PGSSLMODE cannot weaken the effective pg client', () => {
  for (const query of ['sslmode=disable', 'ssl=0', 'sslmode=no-verify',
    'sslmode=require&uselibpqcompat=true', 'sslrootcert=/not/a/trusted/file&sslkey=/not/a/key']) {
    const options = postgresConnection(`postgres://fixture:unused@pooler.supabase.com/cms?${query}&application_name=tls-test`,
      { NODE_ENV: 'production', PGSSLMODE: 'disable' })
    const client = new pg.Client(options)
    const tls = (client as unknown as { connectionParameters: { ssl: import('node:tls').ConnectionOptions } }).connectionParameters.ssl
    assert.ok(tls && typeof tls === 'object')
    assert.equal(tls.rejectUnauthorized, true)
    assert.equal(tls.checkServerIdentity, undefined, 'Use Node hostname verification, never a no-op verifier')
    assert.equal(tls.minVersion, 'TLSv1.2')
    assert.ok(tls.ca)
    assert.equal(new URL(options.connectionString!).searchParams.get('application_name'), 'tls-test')
  }
})

test('Supabase trust data has the vetted fingerprint and validity window', () => {
  const cert = new X509Certificate(supabaseRootCA)
  assert.equal(cert.fingerprint256.replaceAll(':', '').toLowerCase(), '807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa')
  assert.equal(cert.ca, true)
  assert.ok(Date.parse(cert.validTo) > Date.now())
  assert.ok(Date.parse(cert.validFrom) < Date.now())
})

test('only exact loopback development hosts may use an unencrypted local fixture', () => {
  for (const host of ['localhost', '127.0.0.1', '[::1]']) {
    assert.equal(postgresConnection(`postgres://fixture@${host}:55439/cms_fixture`, { NODE_ENV: 'test' }).ssl, false)
    const options = postgresConnection(`postgres://fixture@${host}:55439/cms_fixture`, { NODE_ENV: 'production' })
    assert.equal((options.ssl as { rejectUnauthorized: boolean }).rejectUnauthorized, true)
  }
  for (const host of ['localhost.evil.test', '127.0.0.1.evil.test', 'db.example.test']) {
    assert.equal((postgresConnection(`postgres://fixture@${host}/cms`, { NODE_ENV: 'test' }).ssl as { rejectUnauthorized: boolean }).rejectUnauthorized, true)
  }
  for (const query of ['host=remote.example.test', 'hostaddr=203.0.113.5', 'port=6543', 'service=production']) {
    assert.throws(() => postgresConnection(`postgres://fixture@127.0.0.1/cms?${query}`), /destination/)
  }
})

test('non-Supabase hosts use system trust or an explicit operator CA, never unverifiable TLS', () => {
  const uri = 'postgres://fixture@db.example.test/cms'
  assert.equal((postgresConnection(uri, {}).ssl as { ca?: unknown }).ca, undefined)
  assert.equal((postgresConnection(uri, { DATABASE_SSL_CA: supabaseRootCA }).ssl as { ca?: unknown }).ca, supabaseRootCA)
  assert.throws(() => postgresConnection(uri, { NODE_TLS_REJECT_UNAUTHORIZED: '0' }), /Verified PostgreSQL TLS/)
  for (const bad of ['file:fixture.db', 'postgres:///cms', 'not-a-url-with-private-credential']) {
    assert.throws(() => postgresConnection(bad), error => error instanceof Error &&
      !error.message.includes(bad) && /DATABASE_URI/.test(error.message))
  }
})

test('a server refusing TLS cannot trigger a plaintext authentication fallback', async () => {
  let packets = 0
  const server = createServer(socket => {
    socket.on('data', data => {
      packets++
      assert.equal(data.toString('hex'), '0000000804d2162f', 'Only a PostgreSQL SSLRequest may be sent')
      socket.end('N')
    })
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const client = new pg.Client({ ...postgresConnection(`postgres://fixture:never-send@127.0.0.1:${address.port}/cms`,
    { NODE_ENV: 'production' }), connectionTimeoutMillis: 3000 })
  try {
    await assert.rejects(() => client.connect(), /does not support SSL/)
    assert.equal(packets, 1)
  } finally {
    await client.end().catch(() => {})
    await new Promise<void>(resolve => server.close(() => resolve()))
  }
})

test('the startup migration gate uses the same verified TLS builder as the app', () => {
  const gate = readFileSync(new URL('../scripts/verify-migrations.mjs', import.meta.url), 'utf8')
  assert.match(gate, /new pg\.Client\(postgresConnection\(uri\)\)/)
  assert.doesNotMatch(gate, /rejectUnauthorized:\s*false/)
})
