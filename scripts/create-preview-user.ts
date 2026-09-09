import crypto from 'crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Service account the sandbox uses for DRAFT PREVIEW fetches (API key auth).
 * Editor role + tenant membership → sees drafts of its tenant only.
 * Prints the key ONCE; store it as PAYLOAD_PREVIEW_API_KEY on the sandbox.
 */
async function main() {
  const payload = await getPayload({ config })
  const email = process.env.PREVIEW_USER_EMAIL ?? 'preview@serviettelab.com'
  const tenantId = Number(process.env.PREVIEW_TENANT_ID ?? '1')
  const apiKey = crypto.randomUUID()
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, overrideAccess: true })
  if (existing.docs[0]) {
    await payload.update({ collection: 'users', id: existing.docs[0].id, data: { enableAPIKey: true, apiKey } as never, overrideAccess: true })
    console.log(`✓ rotated API key for ${email}`)
  } else {
    await payload.create({
      collection: 'users',
      data: {
        email,
        password: crypto.randomBytes(24).toString('base64url'),
        name: 'Sandbox draft preview (service)',
        roles: ['editor'],
        tenants: [{ tenant: tenantId }],
        enableAPIKey: true,
        apiKey,
      } as never,
      overrideAccess: true,
    })
    console.log(`✓ created preview service user ${email} (tenant ${tenantId})`)
  }
  console.log(`API_KEY=${apiKey}`)
  process.exit(0)
}
main().catch((e) => { console.error(e); process.exit(1) })
