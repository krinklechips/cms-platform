import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "homepage_tenant_idx";
  ALTER TABLE "homepage_slides_locales" ALTER COLUMN "title" DROP NOT NULL;
  CREATE INDEX "homepage_tenant_idx" ON "homepage" USING btree ("tenant_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "homepage_tenant_idx";
  ALTER TABLE "homepage_slides_locales" ALTER COLUMN "title" SET NOT NULL;
  CREATE UNIQUE INDEX "homepage_tenant_idx" ON "homepage" USING btree ("tenant_id");`)
}
