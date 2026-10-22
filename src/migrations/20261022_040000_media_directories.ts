import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Folder metadata only. No existing content, media keys or versions are altered.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE TABLE "media_directories" (
  "id" serial PRIMARY KEY NOT NULL,
  "tenant_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "media_directories" ADD CONSTRAINT "media_directories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "media_directories_tenant_idx" ON "media_directories" USING btree ("tenant_id");
CREATE INDEX "media_directories_updated_at_idx" ON "media_directories" USING btree ("updated_at");
CREATE INDEX "media_directories_created_at_idx" ON "media_directories" USING btree ("created_at");
CREATE UNIQUE INDEX "tenant_path_idx" ON "media_directories" USING btree ("tenant_id","path");
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Refusing to discard media folder records. Use a reviewed recovery migration.')
}
