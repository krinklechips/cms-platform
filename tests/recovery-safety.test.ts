import assert from 'node:assert/strict'
import { test } from 'node:test'

const load = () => import('../scripts/lib/recovery-safety.mjs')

test('recovery targets must be disposable loopback databases', async () => {
  const { assertRecoveryTarget } = await load()
  for (const uri of [
    'postgres://u:p@db.example.com:5432/cms_recovery_123',
    'postgres://u:p@localhost.evil.test:5432/cms_recovery_123',
    'postgres://u:p@127.0.0.1:5432/postgres',
    'postgres://u:p@127.0.0.1:5432/roomchang',
    'postgres://u:p@127.0.0.1:5432/cms_recovery_123?host=db.example.com',
    'postgres://u:p@127.0.0.1:5432/cms_recovery_123?service=production',
    'postgres://u:p@127.0.0.1:5432/cms_recovery_123?options=-c%20search_path%3Dpublic',
  ]) assert.throws(() => assertRecoveryTarget(uri), /recovery|loopback|query/i)
  assert.equal(assertRecoveryTarget('postgres://u:p@127.0.0.1:55432/cms_recovery_123').database, 'cms_recovery_123')
})

test('R2 backup paths cannot escape the private directory', async () => {
  const { backupObjectPath } = await load()
  assert.equal(backupObjectPath('/private/backup', 'roomchang/doctors/a.jpg'), '/private/backup/objects/roomchang/doctors/a.jpg')
  for (const key of ['../secret', '/etc/passwd', 'roomchang/../secret', 'roomchang//a', 'roomchang/./a', 'roomchang/a\\b', 'roomchang/a\u0000']) {
    assert.throws(() => backupObjectPath('/private/backup', key), /object key/i)
  }
})

test('database row fingerprints are canonical and include missing rows', async () => {
  const { fingerprintRows } = await load()
  assert.deepEqual(fingerprintRows([{ id: 2, text: '中文' }, { text: 'ខ្មែរ', id: 1 }]),
    fingerprintRows([{ id: 1, text: 'ខ្មែរ' }, { text: '中文', id: 2 }]))
  assert.notDeepEqual(fingerprintRows([{ id: 1, text: 'draft' }]), fingerprintRows([{ id: 1, text: 'published' }]))
  assert.notDeepEqual(fingerprintRows([{ id: 1 }]), fingerprintRows([]))
})

test('logical recovery schema tolerates dropped-column holes and PG18 not-null catalog rows only', async () => {
  const { logicalRecoverySchema } = await load()
  const column = { table_name: 'pages', column_name: 'title', ordinal_position: 3, is_nullable: 'NO' }
  const constraint = { table_name: 'pages', conname: 'pages_pkey', definition: 'PRIMARY KEY (id)' }
  const before = { columns: [column], constraints: [constraint] }
  const after = { columns: [{ ...column, ordinal_position: 2 }], constraints: [constraint,
    { table_name: 'pages', conname: 'pages_title_not_null', definition: 'NOT NULL title' }] }
  assert.deepEqual(logicalRecoverySchema(before), logicalRecoverySchema(after))
  assert.notDeepEqual(logicalRecoverySchema(before), logicalRecoverySchema({ ...after,
    columns: [{ ...column, is_nullable: 'YES' }] }))
  assert.notDeepEqual(logicalRecoverySchema(before), logicalRecoverySchema({ ...after, constraints: [] }))
})

test('recovery process environments cannot inherit libpq redirection', async () => {
  const { recoveryProcessEnvironment } = await load()
  const result = recoveryProcessEnvironment({ PATH: '/bin', HOME: '/home/fixture', USER: 'fixture',
    PGHOSTADDR: '203.0.113.9', PGSERVICE: 'production', PGPASSWORD: 'secret', PGOPTIONS: '-c role=admin',
    NODE_OPTIONS: '--import=unexpected-loader', DATABASE_URI: 'postgres://remote/production' })
  assert.equal(result.PATH, '/bin')
  assert.ok(!Object.keys(result).some(key => key.startsWith('PG')))
  assert.equal(result.NODE_OPTIONS, undefined)
  assert.equal(result.DATABASE_URI, undefined)
})

test('lossless PostgreSQL row text distinguishes adjacent large integers', async () => {
  const { fingerprintRowText } = await load()
  assert.notDeepEqual(fingerprintRowText(['{"id":9007199254740992}']), fingerprintRowText(['{"id":9007199254740993}']))
  assert.deepEqual(fingerprintRowText(['{"n":2}', '{"n":1}']), fingerprintRowText(['{"n":1}', '{"n":2}']))
})

test('source backup connections require verified TLS regardless of URI SSL parameters', async () => {
  const { verifiedRecoverySource } = await load()
  const source = verifiedRecoverySource('postgres://user:password@db.example.com/cms?sslmode=no-verify&sslrootcert=untrusted&application_name=backup', 'trusted-ca')
  assert.equal(source.ssl.rejectUnauthorized, true)
  assert.equal(source.ssl.ca, 'trusted-ca')
  assert.equal(new URL(source.connectionString).searchParams.has('sslmode'), false)
  assert.equal(new URL(source.connectionString).searchParams.has('sslrootcert'), false)
  assert.throws(() => verifiedRecoverySource('postgres://u:p@db.example.com/cms', ''), /CA/i)
})

test('moving sequence recovery never accepts a falsely uncalled advanced sequence', async () => {
  const { assertRecoveredSequence } = await load()
  const called = (value: string, isCalled = true) => ({ name: 'pages_id_seq', last_value: value, is_called: isCalled })
  assert.doesNotThrow(() => assertRecoveredSequence(called('100'), called('105'), called('103')))
  assert.throws(() => assertRecoveredSequence(called('100'), called('105'), called('103', false)), /sequence|uncalled/i)
  assert.throws(() => assertRecoveredSequence(called('1', false), called('3'), called('2', false)), /sequence|uncalled/i)
  assert.doesNotThrow(() => assertRecoveredSequence(called('1', false), called('3'), called('1', false)))
  assert.doesNotThrow(() => assertRecoveredSequence(called('1', false), called('3'), called('1')))
  assert.throws(() => assertRecoveredSequence(called('100'), called('105'), called('106')), /sequence|interval/i)
  assert.throws(() => assertRecoveredSequence(called('100'), called('105', false), called('103')), /sequence|reset/i)
})
