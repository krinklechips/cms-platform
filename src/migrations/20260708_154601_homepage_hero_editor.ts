import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_hero_buttons_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_url" varchar,
  	"image_position" varchar,
  	"image_size" varchar,
  	"preserve_full_image" boolean DEFAULT false,
  	"cta_url" varchar
  );
  
  CREATE TABLE "homepage_slides_locales" (
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"description" varchar,
  	"cta_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_locales" (
  	"hero_pill" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "hero_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hero_slides_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "hero_slides" CASCADE;
  DROP TABLE "hero_slides_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_hero_slides_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_hero_slides_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "homepage_id" integer;
  ALTER TABLE "homepage_hero_buttons" ADD CONSTRAINT "homepage_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_hero_buttons_locales" ADD CONSTRAINT "homepage_hero_buttons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_hero_buttons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_slides" ADD CONSTRAINT "homepage_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_slides" ADD CONSTRAINT "homepage_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_slides_locales" ADD CONSTRAINT "homepage_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_locales" ADD CONSTRAINT "homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_hero_buttons_order_idx" ON "homepage_hero_buttons" USING btree ("_order");
  CREATE INDEX "homepage_hero_buttons_parent_id_idx" ON "homepage_hero_buttons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_hero_buttons_locales_locale_parent_id_unique" ON "homepage_hero_buttons_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_slides_order_idx" ON "homepage_slides" USING btree ("_order");
  CREATE INDEX "homepage_slides_parent_id_idx" ON "homepage_slides" USING btree ("_parent_id");
  CREATE INDEX "homepage_slides_image_idx" ON "homepage_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "homepage_slides_locales_locale_parent_id_unique" ON "homepage_slides_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "homepage_tenant_idx" ON "homepage" USING btree ("tenant_id");
  CREATE INDEX "homepage_updated_at_idx" ON "homepage" USING btree ("updated_at");
  CREATE INDEX "homepage_created_at_idx" ON "homepage" USING btree ("created_at");
  CREATE UNIQUE INDEX "homepage_locales_locale_parent_id_unique" ON "homepage_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_homepage_fk" FOREIGN KEY ("homepage_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_homepage_id_idx" ON "payload_locked_documents_rels" USING btree ("homepage_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hero_slides_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "hero_slides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"image_url" varchar,
  	"image_position" varchar,
  	"image_size" varchar,
  	"preserve_full_image" boolean DEFAULT false,
  	"cta_url" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hero_slides_locales" (
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"description" varchar,
  	"image_alt" varchar,
  	"cta_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "homepage_hero_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_hero_buttons_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_slides_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "homepage_hero_buttons" CASCADE;
  DROP TABLE "homepage_hero_buttons_locales" CASCADE;
  DROP TABLE "homepage_slides" CASCADE;
  DROP TABLE "homepage_slides_locales" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_homepage_fk";
  
  DROP INDEX "payload_locked_documents_rels_homepage_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hero_slides_id" integer;
  ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_slides_locales" ADD CONSTRAINT "hero_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "hero_slides_tenant_idx" ON "hero_slides" USING btree ("tenant_id");
  CREATE INDEX "hero_slides_source_id_idx" ON "hero_slides" USING btree ("source_id");
  CREATE INDEX "hero_slides_updated_at_idx" ON "hero_slides" USING btree ("updated_at");
  CREATE INDEX "hero_slides_created_at_idx" ON "hero_slides" USING btree ("created_at");
  CREATE UNIQUE INDEX "hero_slides_locales_locale_parent_id_unique" ON "hero_slides_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hero_slides_fk" FOREIGN KEY ("hero_slides_id") REFERENCES "public"."hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_hero_slides_id_idx" ON "payload_locked_documents_rels" USING btree ("hero_slides_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "homepage_id";`)
}
