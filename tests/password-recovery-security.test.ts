import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { createLocalReq, getPayload, type SendEmailOptions } from 'payload'
import { loadPayloadConfig } from './helpers/load-payload-config'
import type { User } from '../src/payload-types'

test('actual reset email uses a trusted absolute URL and native tokens remain scoped, expiring and single-use', { timeout: 120000 }, async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cms-password-security-'))
  const original = await loadPayloadConfig()
  const messages: SendEmailOptions[] = []
  const cms = await getPayload({ key: randomUUID(), config: { ...original, secret: 'isolated-reset-security-only', telemetry: false,
    db: sqliteAdapter({ client: { url: `file:${path.join(directory, 'fixture.db')}` }, transactionOptions: {} }) as typeof original.db,
    typescript: { ...original.typescript, autoGenerate: false },
    email: () => ({ name: 'capture-no-real-delivery', defaultFromAddress: 'cms@example.invalid', defaultFromName: 'Fixture',
      sendEmail: async message => { messages.push(message); return undefined } }),
  } })
  try {
    const password = 'isolated-reset-original-password-1234'
    const users: User[] = []
    for (let index = 0; index < 2; index++) users.push(await cms.create({ collection: 'users',
      data: { email: `reset-${index}@example.invalid`, password, roles: ['super-admin'] } as never }))
    // The production throttle stays enabled. SQLite's single writer cannot
    // reserve a throttle slot outside the transaction that owns this fixture.
    cms.collections.users.config.auth.forgotPassword!.minRequestInterval = 0
    const issue = async () => {
      const req = await createLocalReq({}, cms)
      req.headers = new Headers({ Host: 'attacker.example.invalid', Origin: 'https://attacker.example.invalid', 'X-Forwarded-Host': 'attacker.example.invalid' })
      const token = await cms.forgotPassword({ collection: 'users', req, data: { email: users[0].email! } })
      assert.ok(typeof token === 'string' && token.length > 20)
      return { token, html: String(messages.at(-1)?.html || '') }
    }
    await t.test('a forged Host/Origin cannot replace the canonical HTTPS reset destination', async () => {
      const { token, html } = await issue()
      const href = html.match(/href="([^"]+)"/)?.[1] || ''
      assert.match(href, /^https:\/\/serviettelab\.com\/admin\/reset\//)
      assert.equal(new URL(href).pathname, `/admin/reset/${token}`)
      assert.ok(!html.includes('attacker.example.invalid'))
    })
    await t.test('native reset changes only its token owner and rejects reuse', async () => {
      const { token } = await issue()
      const newPassword = 'isolated-reset-new-password-5678'
      const reset = await cms.resetPassword({ collection: 'users', data: { token, password: newPassword }, overrideAccess: false })
      assert.equal(reset.user.id, users[0].id)
      await cms.login({ collection: 'users', data: { email: users[0].email!, password: newPassword } })
      await cms.login({ collection: 'users', data: { email: users[1].email!, password } })
      await assert.rejects(() => cms.resetPassword({ collection: 'users', data: { token, password: 'isolated-invalid-reuse-1111' }, overrideAccess: false }))
    })
    await t.test('an expired native reset token cannot change the fixture account', async () => {
      cms.collections.users.config.auth.forgotPassword!.expiration = 1000
      t.mock.timers.enable({ apis: ['Date'], now: new Date('2031-01-01T00:00:00Z') })
      try {
        const { token } = await issue()
        t.mock.timers.tick(1001)
        await assert.rejects(() => cms.resetPassword({ collection: 'users', data: { token, password: 'isolated-expired-not-applied-2222' }, overrideAccess: false }))
        await cms.login({ collection: 'users', data: { email: users[0].email!, password: 'isolated-reset-new-password-5678' } })
      } finally { t.mock.timers.reset() }
    })
  } finally {
    await cms.destroy()
    await rm(directory, { recursive: true, force: true })
  }
})
