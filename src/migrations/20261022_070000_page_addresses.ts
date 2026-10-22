import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Schema only: never rename addresses or alter published content, locales or drafts.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
LOCK TABLE "pages", "_pages_v" IN SHARE ROW EXCLUSIVE MODE;
DO $$
BEGIN
  IF EXISTS (
    WITH addresses AS (
      SELECT "id" AS page_id, "tenant_id", "slug" FROM "pages"
      UNION ALL
      SELECT "parent_id", "version_tenant_id", "version_slug" FROM "_pages_v"
      WHERE "latest" = true AND "parent_id" IS NOT NULL
    )
    SELECT 1 FROM addresses
    WHERE "tenant_id" IS NOT NULL AND "slug" IS NOT NULL
    GROUP BY "tenant_id", "slug" HAVING count(DISTINCT page_id) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate page tenant+slug addresses exist. Review duplicates before applying this migration; no pages or drafts have been changed.';
  END IF;
END $$;
CREATE UNIQUE INDEX "tenant_slug_idx" ON "pages" USING btree ("tenant_id","slug");
CREATE INDEX "version_tenant_version_slug_idx" ON "_pages_v" USING btree ("version_tenant_id","version_slug");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
DROP INDEX "tenant_slug_idx";
DROP INDEX "version_tenant_version_slug_idx";
  `)
}
