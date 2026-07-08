import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '../.env') })

/**
 * Imports the tenant's existing R2 objects (uploaded by the old platform /
 * by hand) into the Payload Media library. Files are NOT moved or re-keyed:
 * each Media doc stores the object's existing folder as its `prefix`, so the
 * public URL stays exactly what the live site already uses. Idempotent:
 * skips objects whose (prefix, filename) already exist as a Media doc.
 *
 *   DATABASE_URI=<prod-uri> tsx scripts/import-r2-media.ts roomchang
 */

const TENANT_SLUG = process.argv[2] || 'roomchang'
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|svg|avif)$/i
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif',
}

async function run() {
  const s3 = new S3Client({
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: 'auto',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
  })
  const bucket = process.env.R2_BUCKET_NAME || 'cms-platform'

  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })

  const tenant = (
    await payload.find({ collection: 'tenants', where: { slug: { equals: TENANT_SLUG } }, limit: 1, depth: 0 })
  ).docs[0]
  if (!tenant) throw new Error(`tenant not found: ${TENANT_SLUG}`)

  // list every object under the tenant's folder
  const keys: { key: string; size: number }[] = []
  let token: string | undefined
  do {
    const page = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: `${TENANT_SLUG}/`, ContinuationToken: token }),
    )
    for (const o of page.Contents ?? []) {
      if (o.Key && o.Size) keys.push({ key: o.Key, size: o.Size })
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)

  const images = keys.filter((k) => IMAGE_EXT.test(k.key))
  const skippedNonImage = keys.length - images.length
  console.log(`found ${keys.length} objects under ${TENANT_SLUG}/ — ${images.length} images, ${skippedNonImage} non-image (videos/docs) skipped for now`)

  let created = 0
  let existing = 0
  let failed = 0
  for (const { key } of images) {
    const slash = key.lastIndexOf('/')
    const prefix = key.slice(0, slash) // e.g. roomchang/doctors
    const filename = key.slice(slash + 1)
    const ext = path.extname(filename).toLowerCase()

    const dupe = await payload.find({
      collection: 'media',
      where: { and: [{ filename: { equals: filename } }, { prefix: { equals: prefix } }] },
      limit: 1,
      depth: 0,
    })
    if (dupe.docs.length) {
      existing++
      continue
    }

    try {
      // download bytes so Payload can extract real dimensions via sharp;
      // the re-upload writes the SAME key with the same bytes (no URL change)
      const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
      const buf = Buffer.from(await obj.Body!.transformToByteArray())
      const alt = filename
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim()
      await payload.create({
        collection: 'media',
        data: { alt: alt || filename, tenant: tenant.id, prefix } as never,
        file: { data: buf, name: filename, mimetype: MIME[ext] || 'application/octet-stream', size: buf.length },
      })
      created++
      if (created % 25 === 0) console.log(`  … ${created} imported`)
    } catch (e) {
      failed++
      console.error(`  ✗ ${key}: ${(e as Error).message.slice(0, 120)}`)
    }
  }
  console.log(`✓ media import (${TENANT_SLUG}): ${created} created, ${existing} already present, ${failed} failed`)
  process.exit(failed ? 1 : 0)
}
run().catch((e) => {
  console.error(e)
  process.exit(1)
})
