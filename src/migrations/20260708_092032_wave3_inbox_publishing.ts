import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "news_articles_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"paragraph" varchar NOT NULL
  );
  
  CREATE TABLE "news_articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"slug" varchar NOT NULL,
  	"date" varchar,
  	"image_url" varchar,
  	"image_alt" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "news_articles_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "community_articles_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"paragraph" varchar NOT NULL
  );
  
  CREATE TABLE "community_articles_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "community_articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"slug" varchar NOT NULL,
  	"image_url" varchar,
  	"image_alt" varchar,
  	"href" varchar,
  	"date" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "community_articles_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "publications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"title" varchar NOT NULL,
  	"authors" varchar,
  	"journal" varchar,
  	"year" numeric,
  	"doi" varchar,
  	"url" varchar,
  	"abstract" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"url" varchar NOT NULL,
  	"thumbnail" varchar,
  	"category" varchar,
  	"doctor" varchar,
  	"topic" varchar,
  	"treatment" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "videos_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "career_positions_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "career_positions_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "career_positions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"slug" varchar NOT NULL,
  	"department" varchar,
  	"type" varchar,
  	"location" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "career_positions_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"country" varchar,
  	"treatment" varchar,
  	"branch" varchar,
  	"date" varchar,
  	"message" varchar,
  	"is_read" boolean DEFAULT false,
  	"agent_code" varchar,
  	"doctor" varchar,
  	"wechat" varchar,
  	"patient_type" varchar,
  	"received_at" timestamp(3) with time zone,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "booking_slots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"date" varchar,
  	"time" varchar,
  	"duration_minutes" numeric,
  	"is_available" boolean DEFAULT true,
  	"booked_by_name" varchar,
  	"booked_by_email" varchar,
  	"booked_by_phone" varchar,
  	"booked_by_telegram" varchar,
  	"treatment" varchar,
  	"branch" varchar,
  	"doctor" varchar,
  	"notes" varchar,
  	"status" varchar,
  	"received_at" timestamp(3) with time zone,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "news_articles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "community_articles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "publications_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "videos_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "career_positions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "booking_slots_id" integer;
  ALTER TABLE "news_articles_body" ADD CONSTRAINT "news_articles_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_articles_locales" ADD CONSTRAINT "news_articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "community_articles_body" ADD CONSTRAINT "community_articles_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."community_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "community_articles_images" ADD CONSTRAINT "community_articles_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."community_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "community_articles" ADD CONSTRAINT "community_articles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "community_articles_locales" ADD CONSTRAINT "community_articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."community_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publications" ADD CONSTRAINT "publications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos_locales" ADD CONSTRAINT "videos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "career_positions_requirements" ADD CONSTRAINT "career_positions_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."career_positions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "career_positions_benefits" ADD CONSTRAINT "career_positions_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."career_positions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "career_positions" ADD CONSTRAINT "career_positions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "career_positions_locales" ADD CONSTRAINT "career_positions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."career_positions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "booking_slots" ADD CONSTRAINT "booking_slots_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "news_articles_body_order_idx" ON "news_articles_body" USING btree ("_order");
  CREATE INDEX "news_articles_body_parent_id_idx" ON "news_articles_body" USING btree ("_parent_id");
  CREATE INDEX "news_articles_body_locale_idx" ON "news_articles_body" USING btree ("_locale");
  CREATE INDEX "news_articles_tenant_idx" ON "news_articles" USING btree ("tenant_id");
  CREATE INDEX "news_articles_source_id_idx" ON "news_articles" USING btree ("source_id");
  CREATE INDEX "news_articles_slug_idx" ON "news_articles" USING btree ("slug");
  CREATE INDEX "news_articles_updated_at_idx" ON "news_articles" USING btree ("updated_at");
  CREATE INDEX "news_articles_created_at_idx" ON "news_articles" USING btree ("created_at");
  CREATE UNIQUE INDEX "news_articles_locales_locale_parent_id_unique" ON "news_articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "community_articles_body_order_idx" ON "community_articles_body" USING btree ("_order");
  CREATE INDEX "community_articles_body_parent_id_idx" ON "community_articles_body" USING btree ("_parent_id");
  CREATE INDEX "community_articles_body_locale_idx" ON "community_articles_body" USING btree ("_locale");
  CREATE INDEX "community_articles_images_order_idx" ON "community_articles_images" USING btree ("_order");
  CREATE INDEX "community_articles_images_parent_id_idx" ON "community_articles_images" USING btree ("_parent_id");
  CREATE INDEX "community_articles_tenant_idx" ON "community_articles" USING btree ("tenant_id");
  CREATE INDEX "community_articles_source_id_idx" ON "community_articles" USING btree ("source_id");
  CREATE INDEX "community_articles_slug_idx" ON "community_articles" USING btree ("slug");
  CREATE INDEX "community_articles_updated_at_idx" ON "community_articles" USING btree ("updated_at");
  CREATE INDEX "community_articles_created_at_idx" ON "community_articles" USING btree ("created_at");
  CREATE UNIQUE INDEX "community_articles_locales_locale_parent_id_unique" ON "community_articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "publications_tenant_idx" ON "publications" USING btree ("tenant_id");
  CREATE INDEX "publications_source_id_idx" ON "publications" USING btree ("source_id");
  CREATE INDEX "publications_updated_at_idx" ON "publications" USING btree ("updated_at");
  CREATE INDEX "publications_created_at_idx" ON "publications" USING btree ("created_at");
  CREATE INDEX "videos_tenant_idx" ON "videos" USING btree ("tenant_id");
  CREATE INDEX "videos_source_id_idx" ON "videos" USING btree ("source_id");
  CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");
  CREATE UNIQUE INDEX "videos_locales_locale_parent_id_unique" ON "videos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "career_positions_requirements_order_idx" ON "career_positions_requirements" USING btree ("_order");
  CREATE INDEX "career_positions_requirements_parent_id_idx" ON "career_positions_requirements" USING btree ("_parent_id");
  CREATE INDEX "career_positions_requirements_locale_idx" ON "career_positions_requirements" USING btree ("_locale");
  CREATE INDEX "career_positions_benefits_order_idx" ON "career_positions_benefits" USING btree ("_order");
  CREATE INDEX "career_positions_benefits_parent_id_idx" ON "career_positions_benefits" USING btree ("_parent_id");
  CREATE INDEX "career_positions_benefits_locale_idx" ON "career_positions_benefits" USING btree ("_locale");
  CREATE INDEX "career_positions_tenant_idx" ON "career_positions" USING btree ("tenant_id");
  CREATE INDEX "career_positions_source_id_idx" ON "career_positions" USING btree ("source_id");
  CREATE INDEX "career_positions_slug_idx" ON "career_positions" USING btree ("slug");
  CREATE INDEX "career_positions_updated_at_idx" ON "career_positions" USING btree ("updated_at");
  CREATE INDEX "career_positions_created_at_idx" ON "career_positions" USING btree ("created_at");
  CREATE UNIQUE INDEX "career_positions_locales_locale_parent_id_unique" ON "career_positions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "enquiries_tenant_idx" ON "enquiries" USING btree ("tenant_id");
  CREATE INDEX "enquiries_source_id_idx" ON "enquiries" USING btree ("source_id");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE INDEX "booking_slots_tenant_idx" ON "booking_slots" USING btree ("tenant_id");
  CREATE INDEX "booking_slots_source_id_idx" ON "booking_slots" USING btree ("source_id");
  CREATE INDEX "booking_slots_updated_at_idx" ON "booking_slots" USING btree ("updated_at");
  CREATE INDEX "booking_slots_created_at_idx" ON "booking_slots" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_articles_fk" FOREIGN KEY ("news_articles_id") REFERENCES "public"."news_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_community_articles_fk" FOREIGN KEY ("community_articles_id") REFERENCES "public"."community_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publications_fk" FOREIGN KEY ("publications_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_career_positions_fk" FOREIGN KEY ("career_positions_id") REFERENCES "public"."career_positions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_booking_slots_fk" FOREIGN KEY ("booking_slots_id") REFERENCES "public"."booking_slots"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_news_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("news_articles_id");
  CREATE INDEX "payload_locked_documents_rels_community_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("community_articles_id");
  CREATE INDEX "payload_locked_documents_rels_publications_id_idx" ON "payload_locked_documents_rels" USING btree ("publications_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("videos_id");
  CREATE INDEX "payload_locked_documents_rels_career_positions_id_idx" ON "payload_locked_documents_rels" USING btree ("career_positions_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_booking_slots_id_idx" ON "payload_locked_documents_rels" USING btree ("booking_slots_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news_articles_body" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_articles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "news_articles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "community_articles_body" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "community_articles_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "community_articles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "community_articles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "publications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "videos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "videos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "career_positions_requirements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "career_positions_benefits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "career_positions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "career_positions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "booking_slots" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "news_articles_body" CASCADE;
  DROP TABLE "news_articles" CASCADE;
  DROP TABLE "news_articles_locales" CASCADE;
  DROP TABLE "community_articles_body" CASCADE;
  DROP TABLE "community_articles_images" CASCADE;
  DROP TABLE "community_articles" CASCADE;
  DROP TABLE "community_articles_locales" CASCADE;
  DROP TABLE "publications" CASCADE;
  DROP TABLE "videos" CASCADE;
  DROP TABLE "videos_locales" CASCADE;
  DROP TABLE "career_positions_requirements" CASCADE;
  DROP TABLE "career_positions_benefits" CASCADE;
  DROP TABLE "career_positions" CASCADE;
  DROP TABLE "career_positions_locales" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "booking_slots" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_news_articles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_community_articles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_publications_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_videos_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_career_positions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_booking_slots_fk";
  
  DROP INDEX "payload_locked_documents_rels_news_articles_id_idx";
  DROP INDEX "payload_locked_documents_rels_community_articles_id_idx";
  DROP INDEX "payload_locked_documents_rels_publications_id_idx";
  DROP INDEX "payload_locked_documents_rels_videos_id_idx";
  DROP INDEX "payload_locked_documents_rels_career_positions_id_idx";
  DROP INDEX "payload_locked_documents_rels_enquiries_id_idx";
  DROP INDEX "payload_locked_documents_rels_booking_slots_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "news_articles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "community_articles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "publications_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "videos_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "career_positions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "booking_slots_id";`)
}
