import { type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Additive storage only. Existing editorial tables, rows and versions are retained.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE TYPE "public"."enum_website_text_page" AS ENUM('about', 'director-message', 'facilities', 'partnerships', 'testimonials', 'vision-mission', 'services', 'implants-comparison', 'pricing', 'team', 'technology', 'international', 'clinical-results', 'blog', 'community', 'dentist-talks', 'news', 'publications', 'careers', 'contact', 'branch-pages', 'navigation', 'footer');
CREATE TYPE "public"."enum_website_text_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum__website_text_v_version_page" AS ENUM('about', 'director-message', 'facilities', 'partnerships', 'testimonials', 'vision-mission', 'services', 'implants-comparison', 'pricing', 'team', 'technology', 'international', 'clinical-results', 'blog', 'community', 'dentist-talks', 'news', 'publications', 'careers', 'contact', 'branch-pages', 'navigation', 'footer');
CREATE TYPE "public"."enum__website_text_v_version_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."enum__website_text_v_published_locale" AS ENUM('en', 'kh', 'cn');
CREATE TABLE "website_text" (
  "id" serial PRIMARY KEY NOT NULL,
  "tenant_id" integer,
  "page" "public"."enum_website_text_page",
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "_status" "public"."enum_website_text_status" DEFAULT 'draft'
);
ALTER TABLE "website_text" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "website_text_locales" (
  "copy" jsonb DEFAULT '{}'::jsonb,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "public"."_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);
ALTER TABLE "website_text_locales" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "_website_text_v" (
  "id" serial PRIMARY KEY NOT NULL,
  "parent_id" integer,
  "version_tenant_id" integer,
  "version_page" "public"."enum__website_text_v_version_page",
  "version_updated_at" timestamp(3) with time zone,
  "version_created_at" timestamp(3) with time zone,
  "version__status" "public"."enum__website_text_v_version_status" DEFAULT 'draft',
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "snapshot" boolean,
  "published_locale" "public"."enum__website_text_v_published_locale",
  "latest" boolean
);
ALTER TABLE "_website_text_v" ENABLE ROW LEVEL SECURITY;
CREATE TABLE "_website_text_v_locales" (
  "version_copy" jsonb DEFAULT '{}'::jsonb,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "public"."_locales" NOT NULL,
  "_parent_id" integer NOT NULL
);
ALTER TABLE "_website_text_v_locales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "website_text" ADD CONSTRAINT "website_text_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants" ("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "website_text_tenant_idx" ON "website_text" USING btree ("tenant_id");
CREATE INDEX "website_text_updated_at_idx" ON "website_text" USING btree ("updated_at");
CREATE INDEX "website_text_created_at_idx" ON "website_text" USING btree ("created_at");
CREATE INDEX "website_text__status_idx" ON "website_text" USING btree ("_status");
CREATE UNIQUE INDEX "tenant_page_idx" ON "website_text" USING btree ("tenant_id", "page");
ALTER TABLE "website_text_locales" ADD CONSTRAINT "website_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."website_text" ("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "website_text_locales_locale_parent_id_unique" ON "website_text_locales" USING btree ("_locale", "_parent_id");
CREATE INDEX "website_text_locales_parent_id_idx" ON "website_text_locales" USING btree ("_parent_id");
ALTER TABLE "_website_text_v" ADD CONSTRAINT "_website_text_v_parent_id_website_text_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."website_text" ("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "_website_text_v" ADD CONSTRAINT "_website_text_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants" ("id") ON DELETE set null ON UPDATE no action;
CREATE INDEX "_website_text_v_parent_idx" ON "_website_text_v" USING btree ("parent_id");
CREATE INDEX "_website_text_v_version_version_tenant_idx" ON "_website_text_v" USING btree ("version_tenant_id");
CREATE INDEX "_website_text_v_version_version_updated_at_idx" ON "_website_text_v" USING btree ("version_updated_at");
CREATE INDEX "_website_text_v_version_version_created_at_idx" ON "_website_text_v" USING btree ("version_created_at");
CREATE INDEX "_website_text_v_version_version__status_idx" ON "_website_text_v" USING btree ("version__status");
CREATE INDEX "_website_text_v_created_at_idx" ON "_website_text_v" USING btree ("created_at");
CREATE INDEX "_website_text_v_updated_at_idx" ON "_website_text_v" USING btree ("updated_at");
CREATE INDEX "_website_text_v_snapshot_idx" ON "_website_text_v" USING btree ("snapshot");
CREATE INDEX "_website_text_v_published_locale_idx" ON "_website_text_v" USING btree ("published_locale");
CREATE INDEX "_website_text_v_latest_idx" ON "_website_text_v" USING btree ("latest");
CREATE INDEX "version_tenant_version_page_idx" ON "_website_text_v" USING btree ("version_tenant_id", "version_page");
ALTER TABLE "_website_text_v_locales" ADD CONSTRAINT "_website_text_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_website_text_v" ("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "_website_text_v_locales_locale_parent_id_unique" ON "_website_text_v_locales" USING btree ("_locale", "_parent_id");
CREATE INDEX "_website_text_v_locales_parent_id_idx" ON "_website_text_v_locales" USING btree ("_parent_id");
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "website_text_id" integer;
CREATE INDEX "payload_locked_documents_rels_website_text_id_idx" ON "payload_locked_documents_rels" USING btree ("website_text_id");
ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_website_text_fk" FOREIGN KEY ("website_text_id") REFERENCES "public"."website_text" ("id") ON DELETE cascade ON UPDATE no action;
`);
}

export async function down(): Promise<void> {
  throw new Error('Website text, drafts and history are retained. Roll back application code, not editorial data.');
}
