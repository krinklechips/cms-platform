import { type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Additive only. Existing content tables, drafts and media are retained.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE TYPE "public"."enum_meanpack_websites_media_kind" AS ENUM('photo', 'video');

CREATE TYPE "public"."enum_meanpack_websites_media_category" AS ENUM('orchard', 'visit', 'harvest', 'quality', 'films', 'library');

CREATE TYPE "public"."enum_meanpack_websites_process_stages_phase" AS ENUM('receive', 'prepare', 'pack', 'protect', 'dispatch');

CREATE TYPE "public"."enum_meanpack_websites_status" AS ENUM('draft', 'published');

CREATE TYPE "public"."enum__meanpack_websites_v_version_media_kind" AS ENUM('photo', 'video');

CREATE TYPE "public"."enum__meanpack_websites_v_version_media_category" AS ENUM('orchard', 'visit', 'harvest', 'quality', 'films', 'library');

CREATE TYPE "public"."enum__meanpack_websites_v_version_process_stages_phase" AS ENUM('receive', 'prepare', 'pack', 'protect', 'dispatch');

CREATE TYPE "public"."enum__meanpack_websites_v_version_status" AS ENUM('draft', 'published');

CREATE TYPE "public"."enum__meanpack_websites_v_published_locale" AS ENUM('en', 'kh', 'cn');

CREATE TABLE "meanpack_websites_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"kind" "enum_meanpack_websites_media_kind",
  	"category" "enum_meanpack_websites_media_category",
  	"file_id" integer,
  	"poster_id" integer,
  	"published" boolean DEFAULT true
  );

CREATE TABLE "meanpack_websites_media_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

CREATE TABLE "meanpack_websites_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"image_id" integer,
  	"featured" boolean DEFAULT false,
  	"published" boolean DEFAULT true
  );

CREATE TABLE "meanpack_websites_products_locales" (
  	"name" varchar,
  	"summary" varchar,
  	"description" varchar,
  	"featured_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

CREATE TABLE "meanpack_websites_phases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar
  );

CREATE TABLE "meanpack_websites_phases_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

CREATE TABLE "meanpack_websites_process_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"phase" "enum_meanpack_websites_process_stages_phase",
  	"icon_key" varchar
  );

CREATE TABLE "meanpack_websites_process_stages_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

CREATE TABLE "meanpack_websites_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mark" varchar
  );

CREATE TABLE "meanpack_websites_capabilities_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

CREATE TABLE "meanpack_websites_quality_checks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );

CREATE TABLE "meanpack_websites_quality_checks_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

CREATE TABLE "meanpack_websites_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );

CREATE TABLE "meanpack_websites_principles_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

CREATE TABLE "meanpack_websites_gallery_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar
  );

CREATE TABLE "meanpack_websites_gallery_chapters_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

CREATE TABLE "meanpack_websites_route_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );

CREATE TABLE "meanpack_websites_route_steps_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );

CREATE TABLE "meanpack_websites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar DEFAULT 'Mean Pack website',
  	"contact_phone" varchar,
  	"contact_email" varchar,
  	"contact_whatsapp" varchar,
  	"contact_telegram" varchar,
  	"contact_facebook" varchar,
  	"contact_google_maps" varchar,
  	"identity_legal_name" varchar,
  	"identity_legal_name_khmer" varchar,
  	"identity_legal_name_chinese" varchar,
  	"identity_tagline" varchar,
  	"identity_tagline_khmer" varchar,
  	"identity_tagline_chinese" varchar,
  	"identity_location" varchar,
  	"logo_id" integer,
  	"scenes_hero_film_id" integer,
  	"scenes_hero_poster_id" integer,
  	"scenes_orchard_id" integer,
  	"scenes_orchard_portrait_id" integer,
  	"scenes_harvest_id" integer,
  	"scenes_harvest_detail_id" integer,
  	"scenes_quality_bunch_id" integer,
  	"scenes_quality_close_id" integer,
  	"scenes_about_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_meanpack_websites_status" DEFAULT 'draft'
  );

CREATE TABLE "meanpack_websites_locales" (
  	"copy_home_eyebrow" varchar,
  	"copy_home_title" varchar,
  	"copy_home_body" varchar,
  	"copy_home_primary_action" varchar,
  	"copy_home_secondary_action" varchar,
  	"copy_home_film_label" varchar,
  	"copy_home_film_caption" varchar,
  	"copy_orchard_eyebrow" varchar,
  	"copy_orchard_title" varchar,
  	"copy_orchard_body" varchar,
  	"copy_orchard_action" varchar,
  	"copy_orchard_caption" varchar,
  	"copy_harvest_eyebrow" varchar,
  	"copy_harvest_title" varchar,
  	"copy_harvest_body" varchar,
  	"copy_harvest_action" varchar,
  	"copy_quality_story_eyebrow" varchar,
  	"copy_quality_story_title" varchar,
  	"copy_quality_story_body" varchar,
  	"copy_quality_note_title" varchar,
  	"copy_quality_note_body" varchar,
  	"copy_preparation_eyebrow" varchar,
  	"copy_preparation_title" varchar,
  	"copy_preparation_body" varchar,
  	"copy_preparation_action" varchar,
  	"copy_crops_eyebrow" varchar,
  	"copy_crops_title" varchar,
  	"copy_crops_action" varchar,
  	"copy_shipment_eyebrow" varchar,
  	"copy_shipment_title" varchar,
  	"copy_shipment_body" varchar,
  	"copy_shipment_action" varchar,
  	"copy_products_eyebrow" varchar,
  	"copy_products_title" varchar,
  	"copy_products_body" varchar,
  	"copy_services_eyebrow" varchar,
  	"copy_services_title" varchar,
  	"copy_services_body" varchar,
  	"copy_services_cta" varchar,
  	"copy_services_action" varchar,
  	"copy_facility_eyebrow" varchar,
  	"copy_facility_title" varchar,
  	"copy_facility_body" varchar,
  	"copy_facility_areas_eyebrow" varchar,
  	"copy_facility_areas_title" varchar,
  	"copy_facility_route_eyebrow" varchar,
  	"copy_facility_route_title" varchar,
  	"copy_facility_route_body" varchar,
  	"copy_facility_route_action" varchar,
  	"copy_facility_photo_note" varchar,
  	"copy_quality_eyebrow" varchar,
  	"copy_quality_title" varchar,
  	"copy_quality_body" varchar,
  	"copy_quality_evidence_eyebrow" varchar,
  	"copy_quality_evidence_title" varchar,
  	"copy_quality_evidence_body" varchar,
  	"copy_quality_evidence_note" varchar,
  	"copy_quality_cta" varchar,
  	"copy_quality_action" varchar,
  	"copy_about_eyebrow" varchar,
  	"copy_about_title" varchar,
  	"copy_about_body" varchar,
  	"copy_about_role_eyebrow" varchar,
  	"copy_about_role_title" varchar,
  	"copy_about_role_body" varchar,
  	"copy_about_role_note" varchar,
  	"copy_about_place_eyebrow" varchar,
  	"copy_about_place_title" varchar,
  	"copy_about_photo_caption" varchar,
  	"copy_about_directions_action" varchar,
  	"copy_about_contact_action" varchar,
  	"copy_gallery_eyebrow" varchar,
  	"copy_gallery_title" varchar,
  	"copy_gallery_body" varchar,
  	"copy_gallery_films_title" varchar,
  	"copy_gallery_films_body" varchar,
  	"copy_partnerships_eyebrow" varchar,
  	"copy_partnerships_title" varchar,
  	"copy_partnerships_body" varchar,
  	"copy_enquiry_eyebrow" varchar,
  	"copy_enquiry_title" varchar,
  	"copy_enquiry_body" varchar,
  	"copy_privacy_eyebrow" varchar,
  	"copy_privacy_title" varchar,
  	"copy_privacy_body" varchar,
  	"contact_address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

CREATE TABLE "_meanpack_websites_v_version_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"kind" "enum__meanpack_websites_v_version_media_kind",
  	"category" "enum__meanpack_websites_v_version_media_category",
  	"file_id" integer,
  	"poster_id" integer,
  	"published" boolean DEFAULT true,
  	"_uuid" varchar
  );

CREATE TABLE "_meanpack_websites_v_version_media_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

CREATE TABLE "_meanpack_websites_v_version_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"image_id" integer,
  	"featured" boolean DEFAULT false,
  	"published" boolean DEFAULT true,
  	"_uuid" varchar
  );

CREATE TABLE "_meanpack_websites_v_version_products_locales" (
  	"name" varchar,
  	"summary" varchar,
  	"description" varchar,
  	"featured_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

CREATE TABLE "_meanpack_websites_v_version_phases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"_uuid" varchar
  );

CREATE TABLE "_meanpack_websites_v_version_phases_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

CREATE TABLE "_meanpack_websites_v_version_process_stages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"phase" "enum__meanpack_websites_v_version_process_stages_phase",
  	"icon_key" varchar,
  	"_uuid" varchar
  );

CREATE TABLE "_meanpack_websites_v_version_process_stages_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

CREATE TABLE "_meanpack_websites_v_version_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"mark" varchar,
  	"_uuid" varchar
  );

CREATE TABLE "_meanpack_websites_v_version_capabilities_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

CREATE TABLE "_meanpack_websites_v_version_quality_checks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );

CREATE TABLE "_meanpack_websites_v_version_quality_checks_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

CREATE TABLE "_meanpack_websites_v_version_principles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );

CREATE TABLE "_meanpack_websites_v_version_principles_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

CREATE TABLE "_meanpack_websites_v_version_gallery_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"_uuid" varchar
  );

CREATE TABLE "_meanpack_websites_v_version_gallery_chapters_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

CREATE TABLE "_meanpack_websites_v_version_route_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );

CREATE TABLE "_meanpack_websites_v_version_route_steps_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

CREATE TABLE "_meanpack_websites_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_name" varchar DEFAULT 'Mean Pack website',
  	"version_contact_phone" varchar,
  	"version_contact_email" varchar,
  	"version_contact_whatsapp" varchar,
  	"version_contact_telegram" varchar,
  	"version_contact_facebook" varchar,
  	"version_contact_google_maps" varchar,
  	"version_identity_legal_name" varchar,
  	"version_identity_legal_name_khmer" varchar,
  	"version_identity_legal_name_chinese" varchar,
  	"version_identity_tagline" varchar,
  	"version_identity_tagline_khmer" varchar,
  	"version_identity_tagline_chinese" varchar,
  	"version_identity_location" varchar,
  	"version_logo_id" integer,
  	"version_scenes_hero_film_id" integer,
  	"version_scenes_hero_poster_id" integer,
  	"version_scenes_orchard_id" integer,
  	"version_scenes_orchard_portrait_id" integer,
  	"version_scenes_harvest_id" integer,
  	"version_scenes_harvest_detail_id" integer,
  	"version_scenes_quality_bunch_id" integer,
  	"version_scenes_quality_close_id" integer,
  	"version_scenes_about_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__meanpack_websites_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__meanpack_websites_v_published_locale",
  	"latest" boolean
  );

CREATE TABLE "_meanpack_websites_v_locales" (
  	"version_copy_home_eyebrow" varchar,
  	"version_copy_home_title" varchar,
  	"version_copy_home_body" varchar,
  	"version_copy_home_primary_action" varchar,
  	"version_copy_home_secondary_action" varchar,
  	"version_copy_home_film_label" varchar,
  	"version_copy_home_film_caption" varchar,
  	"version_copy_orchard_eyebrow" varchar,
  	"version_copy_orchard_title" varchar,
  	"version_copy_orchard_body" varchar,
  	"version_copy_orchard_action" varchar,
  	"version_copy_orchard_caption" varchar,
  	"version_copy_harvest_eyebrow" varchar,
  	"version_copy_harvest_title" varchar,
  	"version_copy_harvest_body" varchar,
  	"version_copy_harvest_action" varchar,
  	"version_copy_quality_story_eyebrow" varchar,
  	"version_copy_quality_story_title" varchar,
  	"version_copy_quality_story_body" varchar,
  	"version_copy_quality_note_title" varchar,
  	"version_copy_quality_note_body" varchar,
  	"version_copy_preparation_eyebrow" varchar,
  	"version_copy_preparation_title" varchar,
  	"version_copy_preparation_body" varchar,
  	"version_copy_preparation_action" varchar,
  	"version_copy_crops_eyebrow" varchar,
  	"version_copy_crops_title" varchar,
  	"version_copy_crops_action" varchar,
  	"version_copy_shipment_eyebrow" varchar,
  	"version_copy_shipment_title" varchar,
  	"version_copy_shipment_body" varchar,
  	"version_copy_shipment_action" varchar,
  	"version_copy_products_eyebrow" varchar,
  	"version_copy_products_title" varchar,
  	"version_copy_products_body" varchar,
  	"version_copy_services_eyebrow" varchar,
  	"version_copy_services_title" varchar,
  	"version_copy_services_body" varchar,
  	"version_copy_services_cta" varchar,
  	"version_copy_services_action" varchar,
  	"version_copy_facility_eyebrow" varchar,
  	"version_copy_facility_title" varchar,
  	"version_copy_facility_body" varchar,
  	"version_copy_facility_areas_eyebrow" varchar,
  	"version_copy_facility_areas_title" varchar,
  	"version_copy_facility_route_eyebrow" varchar,
  	"version_copy_facility_route_title" varchar,
  	"version_copy_facility_route_body" varchar,
  	"version_copy_facility_route_action" varchar,
  	"version_copy_facility_photo_note" varchar,
  	"version_copy_quality_eyebrow" varchar,
  	"version_copy_quality_title" varchar,
  	"version_copy_quality_body" varchar,
  	"version_copy_quality_evidence_eyebrow" varchar,
  	"version_copy_quality_evidence_title" varchar,
  	"version_copy_quality_evidence_body" varchar,
  	"version_copy_quality_evidence_note" varchar,
  	"version_copy_quality_cta" varchar,
  	"version_copy_quality_action" varchar,
  	"version_copy_about_eyebrow" varchar,
  	"version_copy_about_title" varchar,
  	"version_copy_about_body" varchar,
  	"version_copy_about_role_eyebrow" varchar,
  	"version_copy_about_role_title" varchar,
  	"version_copy_about_role_body" varchar,
  	"version_copy_about_role_note" varchar,
  	"version_copy_about_place_eyebrow" varchar,
  	"version_copy_about_place_title" varchar,
  	"version_copy_about_photo_caption" varchar,
  	"version_copy_about_directions_action" varchar,
  	"version_copy_about_contact_action" varchar,
  	"version_copy_gallery_eyebrow" varchar,
  	"version_copy_gallery_title" varchar,
  	"version_copy_gallery_body" varchar,
  	"version_copy_gallery_films_title" varchar,
  	"version_copy_gallery_films_body" varchar,
  	"version_copy_partnerships_eyebrow" varchar,
  	"version_copy_partnerships_title" varchar,
  	"version_copy_partnerships_body" varchar,
  	"version_copy_enquiry_eyebrow" varchar,
  	"version_copy_enquiry_title" varchar,
  	"version_copy_enquiry_body" varchar,
  	"version_copy_privacy_eyebrow" varchar,
  	"version_copy_privacy_title" varchar,
  	"version_copy_privacy_body" varchar,
  	"version_contact_address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "meanpack_websites_id" integer;

ALTER TABLE "meanpack_websites_media" ADD CONSTRAINT "meanpack_websites_media_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites_media" ADD CONSTRAINT "meanpack_websites_media_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites_media" ADD CONSTRAINT "meanpack_websites_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_media_locales" ADD CONSTRAINT "meanpack_websites_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites_media"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_products" ADD CONSTRAINT "meanpack_websites_products_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites_products" ADD CONSTRAINT "meanpack_websites_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_products_locales" ADD CONSTRAINT "meanpack_websites_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites_products"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_phases" ADD CONSTRAINT "meanpack_websites_phases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_phases_locales" ADD CONSTRAINT "meanpack_websites_phases_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites_phases"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_process_stages" ADD CONSTRAINT "meanpack_websites_process_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_process_stages_locales" ADD CONSTRAINT "meanpack_websites_process_stages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites_process_stages"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_capabilities" ADD CONSTRAINT "meanpack_websites_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_capabilities_locales" ADD CONSTRAINT "meanpack_websites_capabilities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites_capabilities"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_quality_checks" ADD CONSTRAINT "meanpack_websites_quality_checks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_quality_checks_locales" ADD CONSTRAINT "meanpack_websites_quality_checks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites_quality_checks"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_principles" ADD CONSTRAINT "meanpack_websites_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_principles_locales" ADD CONSTRAINT "meanpack_websites_principles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites_principles"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_gallery_chapters" ADD CONSTRAINT "meanpack_websites_gallery_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_gallery_chapters_locales" ADD CONSTRAINT "meanpack_websites_gallery_chapters_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites_gallery_chapters"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_route_steps" ADD CONSTRAINT "meanpack_websites_route_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites_route_steps_locales" ADD CONSTRAINT "meanpack_websites_route_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites_route_steps"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_scenes_hero_film_id_media_id_fk" FOREIGN KEY ("scenes_hero_film_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_scenes_hero_poster_id_media_id_fk" FOREIGN KEY ("scenes_hero_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_scenes_orchard_id_media_id_fk" FOREIGN KEY ("scenes_orchard_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_scenes_orchard_portrait_id_media_id_fk" FOREIGN KEY ("scenes_orchard_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_scenes_harvest_id_media_id_fk" FOREIGN KEY ("scenes_harvest_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_scenes_harvest_detail_id_media_id_fk" FOREIGN KEY ("scenes_harvest_detail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_scenes_quality_bunch_id_media_id_fk" FOREIGN KEY ("scenes_quality_bunch_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_scenes_quality_close_id_media_id_fk" FOREIGN KEY ("scenes_quality_close_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites" ADD CONSTRAINT "meanpack_websites_scenes_about_id_media_id_fk" FOREIGN KEY ("scenes_about_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "meanpack_websites_locales" ADD CONSTRAINT "meanpack_websites_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_media" ADD CONSTRAINT "_meanpack_websites_v_version_media_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_media" ADD CONSTRAINT "_meanpack_websites_v_version_media_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_media" ADD CONSTRAINT "_meanpack_websites_v_version_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_media_locales" ADD CONSTRAINT "_meanpack_websites_v_version_media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v_version_media"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_products" ADD CONSTRAINT "_meanpack_websites_v_version_products_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_products" ADD CONSTRAINT "_meanpack_websites_v_version_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_products_locales" ADD CONSTRAINT "_meanpack_websites_v_version_products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v_version_products"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_phases" ADD CONSTRAINT "_meanpack_websites_v_version_phases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_phases_locales" ADD CONSTRAINT "_meanpack_websites_v_version_phases_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v_version_phases"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_process_stages" ADD CONSTRAINT "_meanpack_websites_v_version_process_stages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_process_stages_locales" ADD CONSTRAINT "_meanpack_websites_v_version_process_stages_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v_version_process_stages"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_capabilities" ADD CONSTRAINT "_meanpack_websites_v_version_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_capabilities_locales" ADD CONSTRAINT "_meanpack_websites_v_version_capabilities_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v_version_capabilities"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_quality_checks" ADD CONSTRAINT "_meanpack_websites_v_version_quality_checks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_quality_checks_locales" ADD CONSTRAINT "_meanpack_websites_v_version_quality_checks_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v_version_quality_checks"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_principles" ADD CONSTRAINT "_meanpack_websites_v_version_principles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_principles_locales" ADD CONSTRAINT "_meanpack_websites_v_version_principles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v_version_principles"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_gallery_chapters" ADD CONSTRAINT "_meanpack_websites_v_version_gallery_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_gallery_chapters_locales" ADD CONSTRAINT "_meanpack_websites_v_version_gallery_chapters_locales_par_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v_version_gallery_chapters"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_route_steps" ADD CONSTRAINT "_meanpack_websites_v_version_route_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_version_route_steps_locales" ADD CONSTRAINT "_meanpack_websites_v_version_route_steps_locales_parent_i_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v_version_route_steps"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_parent_id_meanpack_websites_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_scenes_hero_film_id_media_id_fk" FOREIGN KEY ("version_scenes_hero_film_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_scenes_hero_poster_id_media_id_fk" FOREIGN KEY ("version_scenes_hero_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_scenes_orchard_id_media_id_fk" FOREIGN KEY ("version_scenes_orchard_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_scenes_orchard_portrait_id_media_id_fk" FOREIGN KEY ("version_scenes_orchard_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_scenes_harvest_id_media_id_fk" FOREIGN KEY ("version_scenes_harvest_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_scenes_harvest_detail_id_media_id_fk" FOREIGN KEY ("version_scenes_harvest_detail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_scenes_quality_bunch_id_media_id_fk" FOREIGN KEY ("version_scenes_quality_bunch_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_scenes_quality_close_id_media_id_fk" FOREIGN KEY ("version_scenes_quality_close_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v" ADD CONSTRAINT "_meanpack_websites_v_version_scenes_about_id_media_id_fk" FOREIGN KEY ("version_scenes_about_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "_meanpack_websites_v_locales" ADD CONSTRAINT "_meanpack_websites_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_meanpack_websites_v"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX "meanpack_websites_media_order_idx" ON "meanpack_websites_media" USING btree ("_order");

CREATE INDEX "meanpack_websites_media_parent_id_idx" ON "meanpack_websites_media" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_media_file_idx" ON "meanpack_websites_media" USING btree ("file_id");

CREATE INDEX "meanpack_websites_media_poster_idx" ON "meanpack_websites_media" USING btree ("poster_id");

CREATE UNIQUE INDEX "meanpack_websites_media_locales_locale_parent_id_unique" ON "meanpack_websites_media_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "meanpack_websites_media_locales_parent_id_idx" ON "meanpack_websites_media_locales" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_products_order_idx" ON "meanpack_websites_products" USING btree ("_order");

CREATE INDEX "meanpack_websites_products_parent_id_idx" ON "meanpack_websites_products" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_products_image_idx" ON "meanpack_websites_products" USING btree ("image_id");

CREATE UNIQUE INDEX "meanpack_websites_products_locales_locale_parent_id_unique" ON "meanpack_websites_products_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "meanpack_websites_products_locales_parent_id_idx" ON "meanpack_websites_products_locales" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_phases_order_idx" ON "meanpack_websites_phases" USING btree ("_order");

CREATE INDEX "meanpack_websites_phases_parent_id_idx" ON "meanpack_websites_phases" USING btree ("_parent_id");

CREATE UNIQUE INDEX "meanpack_websites_phases_locales_locale_parent_id_unique" ON "meanpack_websites_phases_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "meanpack_websites_phases_locales_parent_id_idx" ON "meanpack_websites_phases_locales" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_process_stages_order_idx" ON "meanpack_websites_process_stages" USING btree ("_order");

CREATE INDEX "meanpack_websites_process_stages_parent_id_idx" ON "meanpack_websites_process_stages" USING btree ("_parent_id");

CREATE UNIQUE INDEX "meanpack_websites_process_stages_locales_locale_parent_id_un" ON "meanpack_websites_process_stages_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "meanpack_websites_process_stages_locales_parent_id_idx" ON "meanpack_websites_process_stages_locales" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_capabilities_order_idx" ON "meanpack_websites_capabilities" USING btree ("_order");

CREATE INDEX "meanpack_websites_capabilities_parent_id_idx" ON "meanpack_websites_capabilities" USING btree ("_parent_id");

CREATE UNIQUE INDEX "meanpack_websites_capabilities_locales_locale_parent_id_uniq" ON "meanpack_websites_capabilities_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "meanpack_websites_capabilities_locales_parent_id_idx" ON "meanpack_websites_capabilities_locales" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_quality_checks_order_idx" ON "meanpack_websites_quality_checks" USING btree ("_order");

CREATE INDEX "meanpack_websites_quality_checks_parent_id_idx" ON "meanpack_websites_quality_checks" USING btree ("_parent_id");

CREATE UNIQUE INDEX "meanpack_websites_quality_checks_locales_locale_parent_id_un" ON "meanpack_websites_quality_checks_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "meanpack_websites_quality_checks_locales_parent_id_idx" ON "meanpack_websites_quality_checks_locales" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_principles_order_idx" ON "meanpack_websites_principles" USING btree ("_order");

CREATE INDEX "meanpack_websites_principles_parent_id_idx" ON "meanpack_websites_principles" USING btree ("_parent_id");

CREATE UNIQUE INDEX "meanpack_websites_principles_locales_locale_parent_id_unique" ON "meanpack_websites_principles_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "meanpack_websites_principles_locales_parent_id_idx" ON "meanpack_websites_principles_locales" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_gallery_chapters_order_idx" ON "meanpack_websites_gallery_chapters" USING btree ("_order");

CREATE INDEX "meanpack_websites_gallery_chapters_parent_id_idx" ON "meanpack_websites_gallery_chapters" USING btree ("_parent_id");

CREATE UNIQUE INDEX "meanpack_websites_gallery_chapters_locales_locale_parent_id_" ON "meanpack_websites_gallery_chapters_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "meanpack_websites_gallery_chapters_locales_parent_id_idx" ON "meanpack_websites_gallery_chapters_locales" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_route_steps_order_idx" ON "meanpack_websites_route_steps" USING btree ("_order");

CREATE INDEX "meanpack_websites_route_steps_parent_id_idx" ON "meanpack_websites_route_steps" USING btree ("_parent_id");

CREATE UNIQUE INDEX "meanpack_websites_route_steps_locales_locale_parent_id_uniqu" ON "meanpack_websites_route_steps_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "meanpack_websites_route_steps_locales_parent_id_idx" ON "meanpack_websites_route_steps_locales" USING btree ("_parent_id");

CREATE INDEX "meanpack_websites_tenant_idx" ON "meanpack_websites" USING btree ("tenant_id");

CREATE INDEX "meanpack_websites_logo_idx" ON "meanpack_websites" USING btree ("logo_id");

CREATE INDEX "meanpack_websites_scenes_scenes_hero_film_idx" ON "meanpack_websites" USING btree ("scenes_hero_film_id");

CREATE INDEX "meanpack_websites_scenes_scenes_hero_poster_idx" ON "meanpack_websites" USING btree ("scenes_hero_poster_id");

CREATE INDEX "meanpack_websites_scenes_scenes_orchard_idx" ON "meanpack_websites" USING btree ("scenes_orchard_id");

CREATE INDEX "meanpack_websites_scenes_scenes_orchard_portrait_idx" ON "meanpack_websites" USING btree ("scenes_orchard_portrait_id");

CREATE INDEX "meanpack_websites_scenes_scenes_harvest_idx" ON "meanpack_websites" USING btree ("scenes_harvest_id");

CREATE INDEX "meanpack_websites_scenes_scenes_harvest_detail_idx" ON "meanpack_websites" USING btree ("scenes_harvest_detail_id");

CREATE INDEX "meanpack_websites_scenes_scenes_quality_bunch_idx" ON "meanpack_websites" USING btree ("scenes_quality_bunch_id");

CREATE INDEX "meanpack_websites_scenes_scenes_quality_close_idx" ON "meanpack_websites" USING btree ("scenes_quality_close_id");

CREATE INDEX "meanpack_websites_scenes_scenes_about_idx" ON "meanpack_websites" USING btree ("scenes_about_id");

CREATE INDEX "meanpack_websites_updated_at_idx" ON "meanpack_websites" USING btree ("updated_at");

CREATE INDEX "meanpack_websites_created_at_idx" ON "meanpack_websites" USING btree ("created_at");

CREATE INDEX "meanpack_websites__status_idx" ON "meanpack_websites" USING btree ("_status");

CREATE UNIQUE INDEX "tenant_idx" ON "meanpack_websites" USING btree ("tenant_id");

CREATE UNIQUE INDEX "meanpack_websites_locales_locale_parent_id_unique" ON "meanpack_websites_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "meanpack_websites_locales_parent_id_idx" ON "meanpack_websites_locales" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_media_order_idx" ON "_meanpack_websites_v_version_media" USING btree ("_order");

CREATE INDEX "_meanpack_websites_v_version_media_parent_id_idx" ON "_meanpack_websites_v_version_media" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_media_file_idx" ON "_meanpack_websites_v_version_media" USING btree ("file_id");

CREATE INDEX "_meanpack_websites_v_version_media_poster_idx" ON "_meanpack_websites_v_version_media" USING btree ("poster_id");

CREATE UNIQUE INDEX "_meanpack_websites_v_version_media_locales_locale_parent_id_" ON "_meanpack_websites_v_version_media_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "_meanpack_websites_v_version_media_locales_parent_id_idx" ON "_meanpack_websites_v_version_media_locales" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_products_order_idx" ON "_meanpack_websites_v_version_products" USING btree ("_order");

CREATE INDEX "_meanpack_websites_v_version_products_parent_id_idx" ON "_meanpack_websites_v_version_products" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_products_image_idx" ON "_meanpack_websites_v_version_products" USING btree ("image_id");

CREATE UNIQUE INDEX "_meanpack_websites_v_version_products_locales_locale_parent_" ON "_meanpack_websites_v_version_products_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "_meanpack_websites_v_version_products_locales_parent_id_idx" ON "_meanpack_websites_v_version_products_locales" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_phases_order_idx" ON "_meanpack_websites_v_version_phases" USING btree ("_order");

CREATE INDEX "_meanpack_websites_v_version_phases_parent_id_idx" ON "_meanpack_websites_v_version_phases" USING btree ("_parent_id");

CREATE UNIQUE INDEX "_meanpack_websites_v_version_phases_locales_locale_parent_id" ON "_meanpack_websites_v_version_phases_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "_meanpack_websites_v_version_phases_locales_parent_id_idx" ON "_meanpack_websites_v_version_phases_locales" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_process_stages_order_idx" ON "_meanpack_websites_v_version_process_stages" USING btree ("_order");

CREATE INDEX "_meanpack_websites_v_version_process_stages_parent_id_idx" ON "_meanpack_websites_v_version_process_stages" USING btree ("_parent_id");

CREATE UNIQUE INDEX "_meanpack_websites_v_version_process_stages_locales_locale_p" ON "_meanpack_websites_v_version_process_stages_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "_meanpack_websites_v_version_process_stages_locales_pare_idx" ON "_meanpack_websites_v_version_process_stages_locales" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_capabilities_order_idx" ON "_meanpack_websites_v_version_capabilities" USING btree ("_order");

CREATE INDEX "_meanpack_websites_v_version_capabilities_parent_id_idx" ON "_meanpack_websites_v_version_capabilities" USING btree ("_parent_id");

CREATE UNIQUE INDEX "_meanpack_websites_v_version_capabilities_locales_locale_par" ON "_meanpack_websites_v_version_capabilities_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "_meanpack_websites_v_version_capabilities_locales_parent_idx" ON "_meanpack_websites_v_version_capabilities_locales" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_quality_checks_order_idx" ON "_meanpack_websites_v_version_quality_checks" USING btree ("_order");

CREATE INDEX "_meanpack_websites_v_version_quality_checks_parent_id_idx" ON "_meanpack_websites_v_version_quality_checks" USING btree ("_parent_id");

CREATE UNIQUE INDEX "_meanpack_websites_v_version_quality_checks_locales_locale_p" ON "_meanpack_websites_v_version_quality_checks_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "_meanpack_websites_v_version_quality_checks_locales_pare_idx" ON "_meanpack_websites_v_version_quality_checks_locales" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_principles_order_idx" ON "_meanpack_websites_v_version_principles" USING btree ("_order");

CREATE INDEX "_meanpack_websites_v_version_principles_parent_id_idx" ON "_meanpack_websites_v_version_principles" USING btree ("_parent_id");

CREATE UNIQUE INDEX "_meanpack_websites_v_version_principles_locales_locale_paren" ON "_meanpack_websites_v_version_principles_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "_meanpack_websites_v_version_principles_locales_parent_i_idx" ON "_meanpack_websites_v_version_principles_locales" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_gallery_chapters_order_idx" ON "_meanpack_websites_v_version_gallery_chapters" USING btree ("_order");

CREATE INDEX "_meanpack_websites_v_version_gallery_chapters_parent_id_idx" ON "_meanpack_websites_v_version_gallery_chapters" USING btree ("_parent_id");

CREATE UNIQUE INDEX "_meanpack_websites_v_version_gallery_chapters_locales_locale" ON "_meanpack_websites_v_version_gallery_chapters_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "_meanpack_websites_v_version_gallery_chapters_locales_pa_idx" ON "_meanpack_websites_v_version_gallery_chapters_locales" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_version_route_steps_order_idx" ON "_meanpack_websites_v_version_route_steps" USING btree ("_order");

CREATE INDEX "_meanpack_websites_v_version_route_steps_parent_id_idx" ON "_meanpack_websites_v_version_route_steps" USING btree ("_parent_id");

CREATE UNIQUE INDEX "_meanpack_websites_v_version_route_steps_locales_locale_pare" ON "_meanpack_websites_v_version_route_steps_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "_meanpack_websites_v_version_route_steps_locales_parent__idx" ON "_meanpack_websites_v_version_route_steps_locales" USING btree ("_parent_id");

CREATE INDEX "_meanpack_websites_v_parent_idx" ON "_meanpack_websites_v" USING btree ("parent_id");

CREATE INDEX "_meanpack_websites_v_version_version_tenant_idx" ON "_meanpack_websites_v" USING btree ("version_tenant_id");

CREATE INDEX "_meanpack_websites_v_version_version_logo_idx" ON "_meanpack_websites_v" USING btree ("version_logo_id");

CREATE INDEX "_meanpack_websites_v_version_scenes_version_scenes_hero__idx" ON "_meanpack_websites_v" USING btree ("version_scenes_hero_film_id");

CREATE INDEX "_meanpack_websites_v_version_scenes_version_scenes_her_1_idx" ON "_meanpack_websites_v" USING btree ("version_scenes_hero_poster_id");

CREATE INDEX "_meanpack_websites_v_version_scenes_version_scenes_orcha_idx" ON "_meanpack_websites_v" USING btree ("version_scenes_orchard_id");

CREATE INDEX "_meanpack_websites_v_version_scenes_version_scenes_orc_1_idx" ON "_meanpack_websites_v" USING btree ("version_scenes_orchard_portrait_id");

CREATE INDEX "_meanpack_websites_v_version_scenes_version_scenes_harve_idx" ON "_meanpack_websites_v" USING btree ("version_scenes_harvest_id");

CREATE INDEX "_meanpack_websites_v_version_scenes_version_scenes_har_1_idx" ON "_meanpack_websites_v" USING btree ("version_scenes_harvest_detail_id");

CREATE INDEX "_meanpack_websites_v_version_scenes_version_scenes_quali_idx" ON "_meanpack_websites_v" USING btree ("version_scenes_quality_bunch_id");

CREATE INDEX "_meanpack_websites_v_version_scenes_version_scenes_qua_1_idx" ON "_meanpack_websites_v" USING btree ("version_scenes_quality_close_id");

CREATE INDEX "_meanpack_websites_v_version_scenes_version_scenes_about_idx" ON "_meanpack_websites_v" USING btree ("version_scenes_about_id");

CREATE INDEX "_meanpack_websites_v_version_version_updated_at_idx" ON "_meanpack_websites_v" USING btree ("version_updated_at");

CREATE INDEX "_meanpack_websites_v_version_version_created_at_idx" ON "_meanpack_websites_v" USING btree ("version_created_at");

CREATE INDEX "_meanpack_websites_v_version_version__status_idx" ON "_meanpack_websites_v" USING btree ("version__status");

CREATE INDEX "_meanpack_websites_v_created_at_idx" ON "_meanpack_websites_v" USING btree ("created_at");

CREATE INDEX "_meanpack_websites_v_updated_at_idx" ON "_meanpack_websites_v" USING btree ("updated_at");

CREATE INDEX "_meanpack_websites_v_snapshot_idx" ON "_meanpack_websites_v" USING btree ("snapshot");

CREATE INDEX "_meanpack_websites_v_published_locale_idx" ON "_meanpack_websites_v" USING btree ("published_locale");

CREATE INDEX "_meanpack_websites_v_latest_idx" ON "_meanpack_websites_v" USING btree ("latest");

CREATE INDEX "version_tenant_idx" ON "_meanpack_websites_v" USING btree ("version_tenant_id");

CREATE UNIQUE INDEX "_meanpack_websites_v_locales_locale_parent_id_unique" ON "_meanpack_websites_v_locales" USING btree ("_locale","_parent_id");

CREATE INDEX "_meanpack_websites_v_locales_parent_id_idx" ON "_meanpack_websites_v_locales" USING btree ("_parent_id");

ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_meanpack_websites_fk" FOREIGN KEY ("meanpack_websites_id") REFERENCES "public"."meanpack_websites"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX "payload_locked_documents_rels_meanpack_websites_id_idx" ON "payload_locked_documents_rels" USING btree ("meanpack_websites_id");

ALTER TABLE "meanpack_websites_media" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_media_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_products" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_products_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_phases" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_phases_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_process_stages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_process_stages_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_capabilities" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_capabilities_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_quality_checks" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_quality_checks_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_principles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_principles_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_gallery_chapters" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_gallery_chapters_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_route_steps" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_route_steps_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "meanpack_websites_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_media" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_media_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_products" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_products_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_phases" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_phases_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_process_stages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_process_stages_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_capabilities" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_capabilities_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_quality_checks" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_quality_checks_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_principles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_principles_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_gallery_chapters" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_gallery_chapters_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_route_steps" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_version_route_steps_locales" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "_meanpack_websites_v_locales" ENABLE ROW LEVEL SECURITY;
`);
}

export async function down(): Promise<void> {
  throw new Error('Mean Pack content is retained. Roll back the application, not editorial data.');
}
