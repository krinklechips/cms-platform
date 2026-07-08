import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "technology_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "technology" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"slug" varchar NOT NULL,
  	"category" varchar,
  	"image_url" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "technology_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"author_name" varchar NOT NULL,
  	"author_photo_url" varchar,
  	"rating" numeric DEFAULT 5,
  	"is_featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials_locales" (
  	"author_title" varchar,
  	"quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
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
  
  CREATE TABLE "branches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"short_name" varchar,
  	"phone" varchar,
  	"mobile" varchar,
  	"email" varchar,
  	"image_url" varchar,
  	"map_query" varchar,
  	"map_url" varchar,
  	"map_place_url" varchar,
  	"photos" jsonb,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "branches_locales" (
  	"badge" varchar,
  	"description" varchar,
  	"address" varchar,
  	"hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"key" varchar NOT NULL,
  	"display_value" varchar,
  	"numeric_value" numeric,
  	"suffix" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "feature_cards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"slug" varchar NOT NULL,
  	"image_url" varchar,
  	"href" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "feature_cards_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"image_alt" varchar,
  	"cta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "brand_logos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"slug" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_url" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "technology_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hero_slides_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "branches_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_stats_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feature_cards_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "brand_logos_id" integer;
  ALTER TABLE "technology_highlights" ADD CONSTRAINT "technology_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology" ADD CONSTRAINT "technology_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_locales" ADD CONSTRAINT "technology_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_slides_locales" ADD CONSTRAINT "hero_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "branches" ADD CONSTRAINT "branches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "branches_locales" ADD CONSTRAINT "branches_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_stats" ADD CONSTRAINT "site_stats_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_stats_locales" ADD CONSTRAINT "site_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feature_cards" ADD CONSTRAINT "feature_cards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feature_cards_locales" ADD CONSTRAINT "feature_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."feature_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brand_logos" ADD CONSTRAINT "brand_logos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "technology_highlights_order_idx" ON "technology_highlights" USING btree ("_order");
  CREATE INDEX "technology_highlights_parent_id_idx" ON "technology_highlights" USING btree ("_parent_id");
  CREATE INDEX "technology_highlights_locale_idx" ON "technology_highlights" USING btree ("_locale");
  CREATE INDEX "technology_tenant_idx" ON "technology" USING btree ("tenant_id");
  CREATE INDEX "technology_source_id_idx" ON "technology" USING btree ("source_id");
  CREATE INDEX "technology_slug_idx" ON "technology" USING btree ("slug");
  CREATE INDEX "technology_updated_at_idx" ON "technology" USING btree ("updated_at");
  CREATE INDEX "technology_created_at_idx" ON "technology" USING btree ("created_at");
  CREATE UNIQUE INDEX "technology_locales_locale_parent_id_unique" ON "technology_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_tenant_idx" ON "testimonials" USING btree ("tenant_id");
  CREATE INDEX "testimonials_source_id_idx" ON "testimonials" USING btree ("source_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "hero_slides_tenant_idx" ON "hero_slides" USING btree ("tenant_id");
  CREATE INDEX "hero_slides_source_id_idx" ON "hero_slides" USING btree ("source_id");
  CREATE INDEX "hero_slides_updated_at_idx" ON "hero_slides" USING btree ("updated_at");
  CREATE INDEX "hero_slides_created_at_idx" ON "hero_slides" USING btree ("created_at");
  CREATE UNIQUE INDEX "hero_slides_locales_locale_parent_id_unique" ON "hero_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "branches_tenant_idx" ON "branches" USING btree ("tenant_id");
  CREATE INDEX "branches_source_id_idx" ON "branches" USING btree ("source_id");
  CREATE INDEX "branches_slug_idx" ON "branches" USING btree ("slug");
  CREATE INDEX "branches_updated_at_idx" ON "branches" USING btree ("updated_at");
  CREATE INDEX "branches_created_at_idx" ON "branches" USING btree ("created_at");
  CREATE UNIQUE INDEX "branches_locales_locale_parent_id_unique" ON "branches_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_stats_tenant_idx" ON "site_stats" USING btree ("tenant_id");
  CREATE INDEX "site_stats_source_id_idx" ON "site_stats" USING btree ("source_id");
  CREATE INDEX "site_stats_key_idx" ON "site_stats" USING btree ("key");
  CREATE INDEX "site_stats_updated_at_idx" ON "site_stats" USING btree ("updated_at");
  CREATE INDEX "site_stats_created_at_idx" ON "site_stats" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_stats_locales_locale_parent_id_unique" ON "site_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "feature_cards_tenant_idx" ON "feature_cards" USING btree ("tenant_id");
  CREATE INDEX "feature_cards_source_id_idx" ON "feature_cards" USING btree ("source_id");
  CREATE INDEX "feature_cards_slug_idx" ON "feature_cards" USING btree ("slug");
  CREATE INDEX "feature_cards_updated_at_idx" ON "feature_cards" USING btree ("updated_at");
  CREATE INDEX "feature_cards_created_at_idx" ON "feature_cards" USING btree ("created_at");
  CREATE UNIQUE INDEX "feature_cards_locales_locale_parent_id_unique" ON "feature_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "brand_logos_tenant_idx" ON "brand_logos" USING btree ("tenant_id");
  CREATE INDEX "brand_logos_source_id_idx" ON "brand_logos" USING btree ("source_id");
  CREATE INDEX "brand_logos_slug_idx" ON "brand_logos" USING btree ("slug");
  CREATE INDEX "brand_logos_updated_at_idx" ON "brand_logos" USING btree ("updated_at");
  CREATE INDEX "brand_logos_created_at_idx" ON "brand_logos" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_technology_fk" FOREIGN KEY ("technology_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hero_slides_fk" FOREIGN KEY ("hero_slides_id") REFERENCES "public"."hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_branches_fk" FOREIGN KEY ("branches_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_stats_fk" FOREIGN KEY ("site_stats_id") REFERENCES "public"."site_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feature_cards_fk" FOREIGN KEY ("feature_cards_id") REFERENCES "public"."feature_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brand_logos_fk" FOREIGN KEY ("brand_logos_id") REFERENCES "public"."brand_logos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_technology_id_idx" ON "payload_locked_documents_rels" USING btree ("technology_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_hero_slides_id_idx" ON "payload_locked_documents_rels" USING btree ("hero_slides_id");
  CREATE INDEX "payload_locked_documents_rels_branches_id_idx" ON "payload_locked_documents_rels" USING btree ("branches_id");
  CREATE INDEX "payload_locked_documents_rels_site_stats_id_idx" ON "payload_locked_documents_rels" USING btree ("site_stats_id");
  CREATE INDEX "payload_locked_documents_rels_feature_cards_id_idx" ON "payload_locked_documents_rels" USING btree ("feature_cards_id");
  CREATE INDEX "payload_locked_documents_rels_brand_logos_id_idx" ON "payload_locked_documents_rels" USING btree ("brand_logos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "technology_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hero_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hero_slides_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "branches" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "branches_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feature_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feature_cards_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "brand_logos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "technology_highlights" CASCADE;
  DROP TABLE "technology" CASCADE;
  DROP TABLE "technology_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "hero_slides" CASCADE;
  DROP TABLE "hero_slides_locales" CASCADE;
  DROP TABLE "branches" CASCADE;
  DROP TABLE "branches_locales" CASCADE;
  DROP TABLE "site_stats" CASCADE;
  DROP TABLE "site_stats_locales" CASCADE;
  DROP TABLE "feature_cards" CASCADE;
  DROP TABLE "feature_cards_locales" CASCADE;
  DROP TABLE "brand_logos" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_technology_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hero_slides_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_branches_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_site_stats_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_feature_cards_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_brand_logos_fk";
  
  DROP INDEX "payload_locked_documents_rels_technology_id_idx";
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  DROP INDEX "payload_locked_documents_rels_hero_slides_id_idx";
  DROP INDEX "payload_locked_documents_rels_branches_id_idx";
  DROP INDEX "payload_locked_documents_rels_site_stats_id_idx";
  DROP INDEX "payload_locked_documents_rels_feature_cards_id_idx";
  DROP INDEX "payload_locked_documents_rels_brand_logos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "technology_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hero_slides_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "branches_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_stats_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "feature_cards_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "brand_logos_id";`)
}
