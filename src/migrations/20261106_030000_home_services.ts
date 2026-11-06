import { type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE TYPE "public"."enum_home_services_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum__home_services_v_version_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum__home_services_v_published_locale" AS ENUM('en', 'kh', 'cn');
CREATE TABLE "home_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_home_services_status" DEFAULT 'draft'
);

ALTER TABLE "home_services" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "home_services_locales" (
	"eyebrow" varchar,
	"heading" varchar,
	"see_all" varchar,
	"implants" varchar,
	"crowns" varchar,
	"aligners" varchar,
	"cosmetic" varchar,
	"whitening" varchar,
	"surgery" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" integer NOT NULL
);

ALTER TABLE "home_services_locales" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "_home_services_v" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"version_tenant_id" integer,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__home_services_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__home_services_v_published_locale",
	"latest" boolean
);

ALTER TABLE "_home_services_v" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "_home_services_v_locales" (
	"version_eyebrow" varchar,
	"version_heading" varchar,
	"version_see_all" varchar,
	"version_implants" varchar,
	"version_crowns" varchar,
	"version_aligners" varchar,
	"version_cosmetic" varchar,
	"version_whitening" varchar,
	"version_surgery" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" integer NOT NULL
);

ALTER TABLE "_home_services_v_locales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "home_services_id" integer;
ALTER TABLE "home_services" ADD CONSTRAINT "home_services_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "home_services_locales" ADD CONSTRAINT "home_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_services"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "_home_services_v" ADD CONSTRAINT "_home_services_v_parent_id_home_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_services"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_home_services_v" ADD CONSTRAINT "_home_services_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_home_services_v_locales" ADD CONSTRAINT "_home_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_services_v"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "home_services_tenant_idx" ON "home_services" USING btree ("tenant_id");
CREATE INDEX "home_services_updated_at_idx" ON "home_services" USING btree ("updated_at");
CREATE INDEX "home_services_created_at_idx" ON "home_services" USING btree ("created_at");
CREATE INDEX "home_services__status_idx" ON "home_services" USING btree ("_status");
CREATE UNIQUE INDEX "tenant_1_idx" ON "home_services" USING btree ("tenant_id");
CREATE UNIQUE INDEX "home_services_locales_locale_parent_id_unique" ON "home_services_locales" USING btree ("_locale","_parent_id");
CREATE INDEX "home_services_locales_parent_id_idx" ON "home_services_locales" USING btree ("_parent_id");
CREATE INDEX "_home_services_v_parent_idx" ON "_home_services_v" USING btree ("parent_id");
CREATE INDEX "_home_services_v_version_version_tenant_idx" ON "_home_services_v" USING btree ("version_tenant_id");
CREATE INDEX "_home_services_v_version_version_updated_at_idx" ON "_home_services_v" USING btree ("version_updated_at");
CREATE INDEX "_home_services_v_version_version_created_at_idx" ON "_home_services_v" USING btree ("version_created_at");
CREATE INDEX "_home_services_v_version_version__status_idx" ON "_home_services_v" USING btree ("version__status");
CREATE INDEX "_home_services_v_created_at_idx" ON "_home_services_v" USING btree ("created_at");
CREATE INDEX "_home_services_v_updated_at_idx" ON "_home_services_v" USING btree ("updated_at");
CREATE INDEX "_home_services_v_snapshot_idx" ON "_home_services_v" USING btree ("snapshot");
CREATE INDEX "_home_services_v_published_locale_idx" ON "_home_services_v" USING btree ("published_locale");
CREATE INDEX "_home_services_v_latest_idx" ON "_home_services_v" USING btree ("latest");
CREATE INDEX "version_tenant_1_idx" ON "_home_services_v" USING btree ("version_tenant_id");
CREATE UNIQUE INDEX "_home_services_v_locales_locale_parent_id_unique" ON "_home_services_v_locales" USING btree ("_locale","_parent_id");
CREATE INDEX "_home_services_v_locales_parent_id_idx" ON "_home_services_v_locales" USING btree ("_parent_id");
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_home_services_fk" FOREIGN KEY ("home_services_id") REFERENCES "public"."home_services"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "payload_locked_documents_rels_home_services_id_idx" ON "payload_locked_documents_rels" USING btree ("home_services_id");
`);
}

export async function down(): Promise<void> {
  throw new Error('Services Section content and drafts are retained. Roll back application code, not editorial data.');
}
