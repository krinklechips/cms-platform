/**
 * Empirical access check for a tenant editor — runs the REAL access-control
 * stack (multi-tenant plugin + module gating) via the Local API with
 * overrideAccess:false, impersonating the user document directly. No password
 * needed, no HTTP. Proves what it@roomchang.com can see and edit.
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config })

  const borin = await payload.findByID({
    collection: 'users',
    id: 3,
    depth: 2,
    overrideAccess: true,
  })
  const user = { ...borin, collection: 'users' as const }
  console.log(
    `USER: ${borin.email} roles=${JSON.stringify(borin.roles)} tenants=${JSON.stringify(
      (borin.tenants ?? []).map((t: { tenant?: unknown }) =>
        typeof t.tenant === 'object' && t.tenant !== null
          ? (t.tenant as { id?: unknown }).id
          : t.tenant,
      ),
    )}`,
  )

  // READ: what does the editor see in key collections?
  for (const slug of ['services', 'doctors', 'homepage', 'pages'] as const) {
    const res = await payload.find({
      collection: slug,
      overrideAccess: false,
      user,
      limit: 1,
      depth: 0,
    })
    console.log(`READ ${slug}: totalDocs=${res.totalDocs}`)
  }

  // NEGATIVE CONTROL: same user with memberships stripped — the pre-fix state.
  // Expected to FAIL (the plugin denies outright): that Forbidden is what the
  // admin rendered as "Nothing found" before the membership row existed.
  try {
    const ghost = { ...user, tenants: [] }
    const ghostRes = await payload.find({
      collection: 'services',
      overrideAccess: false,
      user: ghost,
      limit: 1,
      depth: 0,
    })
    console.log(`MEMBERSHIP-LESS read unexpectedly ALLOWED: totalDocs=${ghostRes.totalDocs}`)
  } catch (err) {
    console.log(`MEMBERSHIP-LESS read denied as expected: ${(err as Error).message}`)
  }

  // WRITE: same-value update on the demo Custom Page — exercises the
  // fail-closed write gate + plugin tenant constraint end to end.
  const demo = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'welcome-to-roomchang' } },
    overrideAccess: true,
    limit: 1,
    locale: 'en',
  })
  const doc = demo.docs[0]
  if (!doc) {
    console.log('WRITE pages: demo page not found — skipped')
  } else {
    const updated = await payload.update({
      collection: 'pages',
      id: doc.id,
      data: { title: doc.title },
      overrideAccess: false,
      user,
      locale: 'en',
    })
    console.log(`WRITE pages: updated id=${updated.id} title unchanged -> OK`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('VERIFY FAILED:', err.message)
  process.exit(1)
})
