# Test Release and Recovery Verification

Base: `7a7cb33fcf5198b802702e22be6d42f62e9a6a02`.

## Binding Constraints

- Do not switch roomchang.com, change email configuration, or extend sessions.
- Never edit, restore, import over, or delete existing staff records or drafts.
- Recovery writes target a newly created disposable localhost database only.
- Code rollback keeps the current database; it is not a database restore.
- Store backup data and secrets outside Git in an owner-only directory.
- Do not invent translations or turn content decisions into automatic imports.

## Release Ledger

- [x] Fix inherited lint errors without disabling rules or altering permissions. Integrated lint: zero errors; warnings remain.
- [x] Execute all 11 CMS and website typography checks, including Khmer and Chinese, in isolated Chrome against the actual sandbox source. No CSS rewrites or source changes.
- [x] Reconcile remaining field consumers and translations against current source. Fix reserved Custom Page addresses and translated doctor-language filters; retain editorial decisions below.
- [x] Recheck dependency/runtime risks. Pin Node 22.23.4, verify it before startup migrations, retain the locally mitigated upstream braces advisory explicitly.
- [x] Capture a consistent CMS database backup plus Roomchang R2 objects/config.
- [x] Restore into a new localhost database and compare all rows/schema/history.
- [ ] Finish old/new/old application compatibility against the frozen release revision without reverting data. The initial rehearsal passed; final credential-sanitized rehearsal is in progress.
- [x] Independently review changes; CMS 562/562 and website 389/389 tests passed. Both clean installs and builds passed on Node 22.23.4, CMS lint has zero errors, and TypeScript passed. No tests were skipped in the complete CMS gate.
- [ ] Deploy only the hosted CMS/test-site path and verify content preservation.

## Scope of Recovery

The application backup covers the CMS-owned public schema and its data. It is
not a replacement for Supabase-managed authentication/storage/cluster recovery.
R2 copies cover the Roomchang namespace and explicitly referenced media. A
one-off local rehearsal does not establish recurring off-device backup retention
or a point-in-time recovery SLA. Those limits must remain visible in the report.

## Verified Recovery Evidence

Verified private backup: `/Users/enochphan/.codex/backups/roomchang-cms/20261022-release-recovery-verified`.
Corrected recovery evidence: `/tmp/roomchang-release-recovery-20261022-verified`.
Initial attempts and R2 provider/corpus checks: `/tmp/roomchang-release-recovery-20261022`.

- `cms-public.dump`: PostgreSQL custom archive; synchronized with the read-only
  manifest using `pg_export_snapshot`. Both the exporting connection and dump
  verify TLS against the Supabase CA using the same captured service configuration.
- 500 tables / 58,417 rows restored into a newly created localhost PostgreSQL 18
  database. Lossless PostgreSQL row-text SHA-256 fingerprints match, without
  JSON number parsing. Ordered columns, nullability, indexes, constraints,
  RLS flags and policy definitions match logically (zero source policies).
  All 310 sequence positions are within the dump capture interval.
  PostgreSQL 17/18 catalog representation
  differences and timezone formatting were characterized, not ignored as data.
- All 654 Roomchang R2 objects (532,810,721 bytes) recovered into a separate
  local tree and SHA-256 checked. All original ETags/sizes and HTTP metadata
  verified; zero omitted metadata. Includes 550 CMS media references.
- One known non-patient logo recovered from backup into a unique R2 verification
  key, re-read through S3 and its public URL, then ownership-checked and deleted.
  No original R2 key was replaced or deleted.
- Old/new/old native application rehearsal kept the same restored database.
  New-release drafts and a publication survived rollback, an edit after rollback
  succeeded, stale writes were rejected, and 15 versions / 11 audit entries
  remained for the isolated fixture.
- Backup directory is mode 0700 and files are mode 0600, outside Git and the
  synced Desktop folder. FileVault was confirmed on. The archive itself is not
  separately encrypted; do not copy it to the public R2 media bucket.

The first comparison attempts failed because the recovery cluster defaulted to
Asia/Phnom_Penh while the source used UTC, and because PostgreSQL 18 records
NOT NULL constraints differently. Both raw manifests remain in the evidence.
The corrected comparison pins UTC and preserves checks for all real data,
column ordering/nullability and non-NOT-NULL constraints.

Independent review additionally required stripping inherited libpq variables,
lossless row hashing, policy/sequence checks and explicit TLS on the snapshot
exporter. All four were implemented with failing-then-passing safety regressions;
the corrected fresh backup and restore passed. Every recovery subprocess uses
an explicit minimal environment, and the native application rehearsal clears
PostgreSQL, R2, email and application credentials before loading its local URI.

## Remaining Content Decisions

The current published-presence scan has 460 records in 27 content collections.
27/35 FAQs lack KH/CN values, 32 comparison-treatment labels lack KH/CN, and all
21 video title/description records lack KH/CN. This is a field-presence scan,
not a judgement of translation quality or saved drafts. No blanks were filled
and no draft was published to make these counts appear complete.

Static navigation/legal copy and several informational sections remain website
code-owned. Enquiries and Booking Slots remain read-only operational snapshots.
Unused CTA/subtitle, career type/location, publication abstract, branch-photo
and testimonial-video consumers require explicit display/product decisions.
Do not manufacture translations or silently expand those modules in this release.

Production typography differs from the sandbox branch. A release gate pointed
at the synced production checkout correctly failed five website cases. The
same isolated-Chrome gate against the actual sandbox source passed 11/11.
The production checkout was not changed; future cutover must promote the
reviewed sandbox code as well as the approved CMS content.

## Rollback Procedure

1. Select the exact previous compatible application commit/deployment.
2. Keep the current CMS database, R2 objects, credentials and content source.
   Do not restore an older database to perform a code rollback.
3. Validate that the older code supports the current schema. Refuse a rollback
   that needs a destructive migration; prefer a reviewed forward correction.
4. Redeploy that compatible commit, verify login/tenant isolation and read-only
   EN/KH/CN pages, then verify new edits and retained drafts using isolated records.
5. Database disaster recovery is a separate maintenance operation requiring a
   reviewed recovery point and handling of all edits since that point. Restore
   into an isolated database first; never run an unattended restore over staff work.

This rehearsal does not claim a Render deployment rollback occurred, that
Supabase-managed schemas were restored, or that recurring off-device backups
and provider recovery retention have been configured or certified.

This source ledger records the pre-deployment gate. The final frozen-revision
rollback, deployment and preservation results are recorded in the local
`release-recovery-20261022.html` verification report, rather than claiming a
successful deployment before one occurs.
