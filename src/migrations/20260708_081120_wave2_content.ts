import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pricing_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"icon" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pricing_categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pricing_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"price" varchar,
  	"ada" varchar,
  	"aus" varchar,
  	"category_id" integer,
  	"source_category_id" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pricing_items_locales" (
  	"name" varchar NOT NULL,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pricing_comparison_sets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"slug" varchar NOT NULL,
  	"exchange_rate" numeric,
  	"source_note" varchar,
  	"last_updated" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pricing_comparison_rows" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"set_id" integer,
  	"source_set_id" varchar,
  	"ada" varchar,
  	"treatment" varchar NOT NULL,
  	"roomchang_price" varchar,
  	"australia_price" varchar,
  	"singapore_price" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "clinical_cases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"slug" varchar NOT NULL,
  	"image_url" varchar,
  	"images" jsonb,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "clinical_cases_locales" (
  	"title" varchar NOT NULL,
  	"category" varchar,
  	"treatment" varchar,
  	"duration" varchar,
  	"description" varchar,
  	"tag" varchar,
  	"full_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "partner_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"name" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"name" varchar NOT NULL,
  	"logo_url" varchar,
  	"website" varchar,
  	"category_id" integer,
  	"source_category_id" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faq_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"category" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faq_items_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "timeline_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"year" varchar NOT NULL,
  	"image_url" varchar,
  	"image_alt" varchar,
  	"image_position" varchar,
  	"order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "timeline_events_locales" (
  	"caption" varchar,
  	"heading" varchar NOT NULL,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "international_treatments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "international_treatments_locales" (
  	"name" varchar NOT NULL,
  	"saving" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "international_steps" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"step_label" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "international_steps_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "international_why_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"source_id" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "international_why_items_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pricing_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pricing_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pricing_comparison_sets_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pricing_comparison_rows_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "clinical_cases_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "partner_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "faq_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "timeline_events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "international_treatments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "international_steps_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "international_why_items_id" integer;
  ALTER TABLE "pricing_categories" ADD CONSTRAINT "pricing_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pricing_categories_locales" ADD CONSTRAINT "pricing_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_items" ADD CONSTRAINT "pricing_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pricing_items" ADD CONSTRAINT "pricing_items_category_id_pricing_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."pricing_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pricing_items_locales" ADD CONSTRAINT "pricing_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_comparison_sets" ADD CONSTRAINT "pricing_comparison_sets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pricing_comparison_rows" ADD CONSTRAINT "pricing_comparison_rows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pricing_comparison_rows" ADD CONSTRAINT "pricing_comparison_rows_set_id_pricing_comparison_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."pricing_comparison_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clinical_cases" ADD CONSTRAINT "clinical_cases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clinical_cases_locales" ADD CONSTRAINT "clinical_cases_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clinical_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partner_categories" ADD CONSTRAINT "partner_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_category_id_partner_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."partner_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_items" ADD CONSTRAINT "faq_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_items_locales" ADD CONSTRAINT "faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "timeline_events_locales" ADD CONSTRAINT "timeline_events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."timeline_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "international_treatments" ADD CONSTRAINT "international_treatments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "international_treatments_locales" ADD CONSTRAINT "international_treatments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."international_treatments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "international_steps" ADD CONSTRAINT "international_steps_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "international_steps_locales" ADD CONSTRAINT "international_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."international_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "international_why_items" ADD CONSTRAINT "international_why_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "international_why_items_locales" ADD CONSTRAINT "international_why_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."international_why_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pricing_categories_tenant_idx" ON "pricing_categories" USING btree ("tenant_id");
  CREATE INDEX "pricing_categories_source_id_idx" ON "pricing_categories" USING btree ("source_id");
  CREATE INDEX "pricing_categories_updated_at_idx" ON "pricing_categories" USING btree ("updated_at");
  CREATE INDEX "pricing_categories_created_at_idx" ON "pricing_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "pricing_categories_locales_locale_parent_id_unique" ON "pricing_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pricing_items_tenant_idx" ON "pricing_items" USING btree ("tenant_id");
  CREATE INDEX "pricing_items_source_id_idx" ON "pricing_items" USING btree ("source_id");
  CREATE INDEX "pricing_items_category_idx" ON "pricing_items" USING btree ("category_id");
  CREATE INDEX "pricing_items_updated_at_idx" ON "pricing_items" USING btree ("updated_at");
  CREATE INDEX "pricing_items_created_at_idx" ON "pricing_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "pricing_items_locales_locale_parent_id_unique" ON "pricing_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pricing_comparison_sets_tenant_idx" ON "pricing_comparison_sets" USING btree ("tenant_id");
  CREATE INDEX "pricing_comparison_sets_source_id_idx" ON "pricing_comparison_sets" USING btree ("source_id");
  CREATE INDEX "pricing_comparison_sets_slug_idx" ON "pricing_comparison_sets" USING btree ("slug");
  CREATE INDEX "pricing_comparison_sets_updated_at_idx" ON "pricing_comparison_sets" USING btree ("updated_at");
  CREATE INDEX "pricing_comparison_sets_created_at_idx" ON "pricing_comparison_sets" USING btree ("created_at");
  CREATE INDEX "pricing_comparison_rows_tenant_idx" ON "pricing_comparison_rows" USING btree ("tenant_id");
  CREATE INDEX "pricing_comparison_rows_source_id_idx" ON "pricing_comparison_rows" USING btree ("source_id");
  CREATE INDEX "pricing_comparison_rows_set_idx" ON "pricing_comparison_rows" USING btree ("set_id");
  CREATE INDEX "pricing_comparison_rows_updated_at_idx" ON "pricing_comparison_rows" USING btree ("updated_at");
  CREATE INDEX "pricing_comparison_rows_created_at_idx" ON "pricing_comparison_rows" USING btree ("created_at");
  CREATE INDEX "clinical_cases_tenant_idx" ON "clinical_cases" USING btree ("tenant_id");
  CREATE INDEX "clinical_cases_source_id_idx" ON "clinical_cases" USING btree ("source_id");
  CREATE INDEX "clinical_cases_slug_idx" ON "clinical_cases" USING btree ("slug");
  CREATE INDEX "clinical_cases_updated_at_idx" ON "clinical_cases" USING btree ("updated_at");
  CREATE INDEX "clinical_cases_created_at_idx" ON "clinical_cases" USING btree ("created_at");
  CREATE UNIQUE INDEX "clinical_cases_locales_locale_parent_id_unique" ON "clinical_cases_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "partner_categories_tenant_idx" ON "partner_categories" USING btree ("tenant_id");
  CREATE INDEX "partner_categories_source_id_idx" ON "partner_categories" USING btree ("source_id");
  CREATE INDEX "partner_categories_updated_at_idx" ON "partner_categories" USING btree ("updated_at");
  CREATE INDEX "partner_categories_created_at_idx" ON "partner_categories" USING btree ("created_at");
  CREATE INDEX "partners_tenant_idx" ON "partners" USING btree ("tenant_id");
  CREATE INDEX "partners_source_id_idx" ON "partners" USING btree ("source_id");
  CREATE INDEX "partners_category_idx" ON "partners" USING btree ("category_id");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE INDEX "faq_items_tenant_idx" ON "faq_items" USING btree ("tenant_id");
  CREATE INDEX "faq_items_source_id_idx" ON "faq_items" USING btree ("source_id");
  CREATE INDEX "faq_items_updated_at_idx" ON "faq_items" USING btree ("updated_at");
  CREATE INDEX "faq_items_created_at_idx" ON "faq_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "faq_items_locales_locale_parent_id_unique" ON "faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "timeline_events_tenant_idx" ON "timeline_events" USING btree ("tenant_id");
  CREATE INDEX "timeline_events_source_id_idx" ON "timeline_events" USING btree ("source_id");
  CREATE INDEX "timeline_events_updated_at_idx" ON "timeline_events" USING btree ("updated_at");
  CREATE INDEX "timeline_events_created_at_idx" ON "timeline_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "timeline_events_locales_locale_parent_id_unique" ON "timeline_events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "international_treatments_tenant_idx" ON "international_treatments" USING btree ("tenant_id");
  CREATE INDEX "international_treatments_source_id_idx" ON "international_treatments" USING btree ("source_id");
  CREATE INDEX "international_treatments_updated_at_idx" ON "international_treatments" USING btree ("updated_at");
  CREATE INDEX "international_treatments_created_at_idx" ON "international_treatments" USING btree ("created_at");
  CREATE UNIQUE INDEX "international_treatments_locales_locale_parent_id_unique" ON "international_treatments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "international_steps_tenant_idx" ON "international_steps" USING btree ("tenant_id");
  CREATE INDEX "international_steps_source_id_idx" ON "international_steps" USING btree ("source_id");
  CREATE INDEX "international_steps_updated_at_idx" ON "international_steps" USING btree ("updated_at");
  CREATE INDEX "international_steps_created_at_idx" ON "international_steps" USING btree ("created_at");
  CREATE UNIQUE INDEX "international_steps_locales_locale_parent_id_unique" ON "international_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "international_why_items_tenant_idx" ON "international_why_items" USING btree ("tenant_id");
  CREATE INDEX "international_why_items_source_id_idx" ON "international_why_items" USING btree ("source_id");
  CREATE INDEX "international_why_items_updated_at_idx" ON "international_why_items" USING btree ("updated_at");
  CREATE INDEX "international_why_items_created_at_idx" ON "international_why_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "international_why_items_locales_locale_parent_id_unique" ON "international_why_items_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pricing_categories_fk" FOREIGN KEY ("pricing_categories_id") REFERENCES "public"."pricing_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pricing_items_fk" FOREIGN KEY ("pricing_items_id") REFERENCES "public"."pricing_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pricing_comparison_sets_fk" FOREIGN KEY ("pricing_comparison_sets_id") REFERENCES "public"."pricing_comparison_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pricing_comparison_rows_fk" FOREIGN KEY ("pricing_comparison_rows_id") REFERENCES "public"."pricing_comparison_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clinical_cases_fk" FOREIGN KEY ("clinical_cases_id") REFERENCES "public"."clinical_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partner_categories_fk" FOREIGN KEY ("partner_categories_id") REFERENCES "public"."partner_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faq_items_fk" FOREIGN KEY ("faq_items_id") REFERENCES "public"."faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_timeline_events_fk" FOREIGN KEY ("timeline_events_id") REFERENCES "public"."timeline_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_international_treatments_fk" FOREIGN KEY ("international_treatments_id") REFERENCES "public"."international_treatments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_international_steps_fk" FOREIGN KEY ("international_steps_id") REFERENCES "public"."international_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_international_why_items_fk" FOREIGN KEY ("international_why_items_id") REFERENCES "public"."international_why_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pricing_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("pricing_categories_id");
  CREATE INDEX "payload_locked_documents_rels_pricing_items_id_idx" ON "payload_locked_documents_rels" USING btree ("pricing_items_id");
  CREATE INDEX "payload_locked_documents_rels_pricing_comparison_sets_id_idx" ON "payload_locked_documents_rels" USING btree ("pricing_comparison_sets_id");
  CREATE INDEX "payload_locked_documents_rels_pricing_comparison_rows_id_idx" ON "payload_locked_documents_rels" USING btree ("pricing_comparison_rows_id");
  CREATE INDEX "payload_locked_documents_rels_clinical_cases_id_idx" ON "payload_locked_documents_rels" USING btree ("clinical_cases_id");
  CREATE INDEX "payload_locked_documents_rels_partner_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("partner_categories_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_faq_items_id_idx" ON "payload_locked_documents_rels" USING btree ("faq_items_id");
  CREATE INDEX "payload_locked_documents_rels_timeline_events_id_idx" ON "payload_locked_documents_rels" USING btree ("timeline_events_id");
  CREATE INDEX "payload_locked_documents_rels_international_treatments_i_idx" ON "payload_locked_documents_rels" USING btree ("international_treatments_id");
  CREATE INDEX "payload_locked_documents_rels_international_steps_id_idx" ON "payload_locked_documents_rels" USING btree ("international_steps_id");
  CREATE INDEX "payload_locked_documents_rels_international_why_items_id_idx" ON "payload_locked_documents_rels" USING btree ("international_why_items_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pricing_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_comparison_sets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_comparison_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "clinical_cases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "clinical_cases_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partner_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faq_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timeline_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timeline_events_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "international_treatments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "international_treatments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "international_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "international_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "international_why_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "international_why_items_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pricing_categories" CASCADE;
  DROP TABLE "pricing_categories_locales" CASCADE;
  DROP TABLE "pricing_items" CASCADE;
  DROP TABLE "pricing_items_locales" CASCADE;
  DROP TABLE "pricing_comparison_sets" CASCADE;
  DROP TABLE "pricing_comparison_rows" CASCADE;
  DROP TABLE "clinical_cases" CASCADE;
  DROP TABLE "clinical_cases_locales" CASCADE;
  DROP TABLE "partner_categories" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "faq_items" CASCADE;
  DROP TABLE "faq_items_locales" CASCADE;
  DROP TABLE "timeline_events" CASCADE;
  DROP TABLE "timeline_events_locales" CASCADE;
  DROP TABLE "international_treatments" CASCADE;
  DROP TABLE "international_treatments_locales" CASCADE;
  DROP TABLE "international_steps" CASCADE;
  DROP TABLE "international_steps_locales" CASCADE;
  DROP TABLE "international_why_items" CASCADE;
  DROP TABLE "international_why_items_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pricing_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pricing_items_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pricing_comparison_sets_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pricing_comparison_rows_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_clinical_cases_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_partner_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_partners_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_faq_items_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_timeline_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_international_treatments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_international_steps_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_international_why_items_fk";
  
  DROP INDEX "payload_locked_documents_rels_pricing_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_pricing_items_id_idx";
  DROP INDEX "payload_locked_documents_rels_pricing_comparison_sets_id_idx";
  DROP INDEX "payload_locked_documents_rels_pricing_comparison_rows_id_idx";
  DROP INDEX "payload_locked_documents_rels_clinical_cases_id_idx";
  DROP INDEX "payload_locked_documents_rels_partner_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_partners_id_idx";
  DROP INDEX "payload_locked_documents_rels_faq_items_id_idx";
  DROP INDEX "payload_locked_documents_rels_timeline_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_international_treatments_i_idx";
  DROP INDEX "payload_locked_documents_rels_international_steps_id_idx";
  DROP INDEX "payload_locked_documents_rels_international_why_items_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pricing_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pricing_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pricing_comparison_sets_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pricing_comparison_rows_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "clinical_cases_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "partner_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "partners_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "faq_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "timeline_events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "international_treatments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "international_steps_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "international_why_items_id";`)
}
