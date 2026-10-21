import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Payload } from 'payload'
import { cmsEmailAdapter } from '../src/lib/cms-email'

test('unconfigured email fails instead of reporting console-only success', async () => {
  const adapter = cmsEmailAdapter({})({ payload: {} as Payload })
  await assert.rejects(() => adapter.sendEmail({ to: 'staff@example.invalid', subject: 'Reset', text: 'Fixture' }), /email delivery.*not configured/i)
})

test('configured SMTP uses TLS and actually delegates delivery', async () => {
  const messages: unknown[] = []
  let options: unknown
  const adapter = cmsEmailAdapter({ SMTP_HOST: 'smtp.example.invalid', SMTP_PORT: '465', SMTP_USER: 'cms@example.invalid', SMTP_PASS: 'fixture-only', SMTP_FROM: 'Roomchang CMS <cms@example.invalid>' }, (value) => {
    options = value
    return { sendMail: async (message) => { messages.push(message); return { messageId: 'fixture' } } }
  })({ payload: {} as Payload })
  await adapter.sendEmail({ to: 'staff@example.invalid', subject: 'Reset', text: 'Fixture' })
  assert.equal((options as { secure: boolean }).secure, true)
  assert.equal(messages.length, 1)
  assert.equal((messages[0] as { from: string }).from, 'Roomchang CMS <cms@example.invalid>')
})

test('invalid ports and incomplete credentials never initialize a transport', async () => {
  for (const env of [{ SMTP_PORT: 'not-a-port' }, { SMTP_PORT: '70000' }, { SMTP_PASS: '' }]) {
    let created = false
    const adapter = cmsEmailAdapter({ SMTP_HOST: 'smtp.example.invalid', SMTP_USER: 'cms@example.invalid', SMTP_PASS: 'fixture', ...env }, () => {
      created = true
      return { sendMail: async () => ({}) }
    })({ payload: {} as Payload })
    await assert.rejects(() => adapter.sendEmail({ to: 'staff@example.invalid', text: 'Fixture' }))
    assert.equal(created, false)
  }
})

test('SMTP failures do not expose credentials or claim success', async () => {
  const adapter = cmsEmailAdapter({ SMTP_HOST: 'smtp.example.invalid', SMTP_USER: 'cms@example.invalid', SMTP_PASS: 'private-fixture' }, () => ({
    sendMail: async () => { throw new Error('private-fixture') },
  }))({ payload: {} as Payload })
  await assert.rejects(() => adapter.sendEmail({ to: 'staff@example.invalid', text: 'Fixture' }), error => {
    assert.match((error as Error).message, /could not be delivered/i)
    assert.doesNotMatch((error as Error).message, /private-fixture/)
    return true
  })
})
