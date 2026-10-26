import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Indexes only. Conflicting published/latest-draft addresses abort, never merge
// or rename staff content. Hold the lock through the migration transaction.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
SET LOCAL lock_timeout = '10s';
LOCK TABLE "services", "_services_v", "technology", "_technology_v" IN SHARE ROW EXCLUSIVE MODE;
DO $$
DECLARE item text;
DECLARE conflict boolean;
BEGIN
  FOREACH item IN ARRAY ARRAY['services', 'technology'] LOOP
    EXECUTE format('WITH addresses AS (
      SELECT id AS document_id, tenant_id, slug FROM %I
      UNION ALL
      SELECT parent_id, version_tenant_id, version_slug FROM %I
      WHERE latest = true AND parent_id IS NOT NULL
    ) SELECT EXISTS (SELECT 1 FROM addresses
      WHERE tenant_id IS NOT NULL AND slug IS NOT NULL
      GROUP BY tenant_id, slug HAVING count(DISTINCT document_id) > 1)', item, '_' || item || '_v') INTO conflict;
    IF conflict THEN
      RAISE EXCEPTION 'Duplicate % tenant+slug addresses exist. Review duplicates before applying this migration; no content or drafts have been changed.', item;
    END IF;
  END LOOP;
END $$;
CREATE UNIQUE INDEX "tenant_slug_1_idx" ON "services" USING btree ("tenant_id", "slug");
CREATE INDEX "version_tenant_version_slug_1_idx" ON "_services_v" USING btree ("version_tenant_id", "version_slug");
CREATE UNIQUE INDEX "tenant_slug_2_idx" ON "technology" USING btree ("tenant_id", "slug");
CREATE INDEX "version_tenant_version_slug_2_idx" ON "_technology_v" USING btree ("version_tenant_id", "version_slug");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
DROP INDEX "version_tenant_version_slug_2_idx";
DROP INDEX "tenant_slug_2_idx";
DROP INDEX "version_tenant_version_slug_1_idx";
DROP INDEX "tenant_slug_1_idx";
  `)
}
