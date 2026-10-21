import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Additive only: retain every existing content, draft, block and version table.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE TYPE "public"."enum_editorial_audit_action" AS ENUM('create', 'update', 'draft', 'publish', 'unpublish', 'restore', 'delete');
CREATE TABLE "editorial_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"actor_label" varchar NOT NULL,
	"actor_i_d" varchar NOT NULL,
	"action" "enum_editorial_audit_action" NOT NULL,
	"locale" varchar NOT NULL,
	"doc_collection" varchar NOT NULL,
	"document_i_d" varchar NOT NULL,
	"doc_label" varchar NOT NULL,
	"timestamp" timestamp(3) with time zone NOT NULL,
	"changed_fields" jsonb NOT NULL,
	"diffs" jsonb NOT NULL,
	"truncated" boolean DEFAULT false,
	"version_i_d" varchar,
	"restored_from_version_i_d" varchar
);

ALTER TABLE "editorial_audit" ADD CONSTRAINT "editorial_audit_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "editorial_audit_tenant_idx" ON "editorial_audit" USING btree ("tenant_id");
CREATE INDEX "editorial_audit_doc_collection_idx" ON "editorial_audit" USING btree ("doc_collection");
CREATE INDEX "editorial_audit_document_i_d_idx" ON "editorial_audit" USING btree ("document_i_d");
CREATE INDEX "editorial_audit_timestamp_idx" ON "editorial_audit" USING btree ("timestamp");
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Refusing to discard editorial audit history. Use a reviewed recovery migration.')
}
