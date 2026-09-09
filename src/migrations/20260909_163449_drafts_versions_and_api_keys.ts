import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_brand_logos_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__brand_logos_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__brand_logos_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_site_stats_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_stats_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_stats_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_feature_cards_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__feature_cards_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__feature_cards_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__pages_v_blocks_image_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_2_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_2_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__pages_v_blocks_image_2_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_3_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_3_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__pages_v_blocks_image_3_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_blocks_callout_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__services_v_blocks_cards_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__services_v_blocks_image_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum__services_v_blocks_callout_2_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__services_v_blocks_cards_2_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__services_v_blocks_image_2_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum__services_v_blocks_callout_3_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__services_v_blocks_cards_3_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__services_v_blocks_image_3_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_doctors_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__doctors_v_version_department" AS ENUM('GENERAL', 'ORTHODONTICS', 'IMPLANTOLOGY', 'COSMETIC', 'PEDIATRICS', 'SENIOR_CONSULTANT', 'DIRECTOR');
  CREATE TYPE "public"."enum__doctors_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__doctors_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_technology_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__technology_v_blocks_callout_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__technology_v_blocks_cards_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__technology_v_blocks_image_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum__technology_v_blocks_callout_2_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__technology_v_blocks_cards_2_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__technology_v_blocks_image_2_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum__technology_v_blocks_callout_3_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__technology_v_blocks_cards_3_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum__technology_v_blocks_image_3_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum__technology_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__technology_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_pricing_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pricing_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pricing_categories_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_pricing_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pricing_items_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pricing_items_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_pricing_comparison_sets_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pricing_comparison_sets_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pricing_comparison_sets_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_pricing_comparison_rows_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pricing_comparison_rows_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pricing_comparison_rows_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_international_why_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__international_why_items_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__international_why_items_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_international_treatments_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__international_treatments_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__international_treatments_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_international_steps_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__international_steps_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__international_steps_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_timeline_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__timeline_events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__timeline_events_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_branches_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__branches_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__branches_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_clinical_cases_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__clinical_cases_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__clinical_cases_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_partners_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partners_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partners_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_partner_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partner_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partner_categories_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_faq_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faq_items_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faq_items_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_news_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_articles_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_community_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__community_articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__community_articles_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_publications_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__publications_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__publications_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_videos_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__videos_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__videos_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TYPE "public"."enum_career_positions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__career_positions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__career_positions_v_published_locale" AS ENUM('en', 'kh', 'cn');
  CREATE TABLE "_homepage_v_version_hero_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_hero_buttons_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_url" varchar,
  	"image_position" varchar,
  	"image_size" varchar,
  	"preserve_full_image" boolean DEFAULT false,
  	"cta_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_slides_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"cta_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__homepage_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_homepage_v_locales" (
  	"version_hero_pill" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_brand_logos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_slug" varchar,
  	"version_name" varchar,
  	"version_logo_url" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__brand_logos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__brand_logos_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_site_stats_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_key" varchar,
  	"version_display_value" varchar,
  	"version_numeric_value" numeric,
  	"version_suffix" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__site_stats_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__site_stats_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_site_stats_v_locales" (
  	"version_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_feature_cards_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_slug" varchar,
  	"version_image_url" varchar,
  	"version_href" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__feature_cards_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__feature_cards_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_feature_cards_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_image_alt" varchar,
  	"version_cta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_author_name" varchar,
  	"version_author_photo_url" varchar,
  	"version_rating" numeric DEFAULT 5,
  	"version_is_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__testimonials_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_testimonials_v_locales" (
  	"version_author_title" varchar,
  	"version_quote" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__pages_v_blocks_callout_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__pages_v_blocks_cards_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricetable_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricetable" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum__pages_v_blocks_image_size",
  	"width" numeric,
  	"height" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_self_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_media_id" integer,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_media_id" integer,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout_2_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__pages_v_blocks_callout_2_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_list_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_list_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__pages_v_blocks_cards_2_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricetable_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricetable_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_2_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum__pages_v_blocks_image_2_size",
  	"width" numeric,
  	"height" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_self_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_pair_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_media_id" integer,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_media_id" integer,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout_3_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__pages_v_blocks_callout_3_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_list_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_list_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__pages_v_blocks_cards_3_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_steps_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricetable_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricetable_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_3_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum__pages_v_blocks_image_3_size",
  	"width" numeric,
  	"height" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_self_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_pair_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_media_id" integer,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_media_id" integer,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_twocol" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_slug" varchar,
  	"version_published" boolean DEFAULT false,
  	"version_seo_image" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_callout_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__services_v_blocks_callout_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__services_v_blocks_cards_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricing_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricetable_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricetable" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum__services_v_blocks_image_size",
  	"width" numeric,
  	"height" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_self_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_media_id" integer,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_media_id" integer,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_text_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_callout_2_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_callout_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__services_v_blocks_callout_2_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_list_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_list_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cards_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__services_v_blocks_cards_2_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cards_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_steps_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_steps_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricing_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricing_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricetable_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricetable_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_gallery_2_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_gallery_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_image_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum__services_v_blocks_image_2_size",
  	"width" numeric,
  	"height" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_self_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_image_pair_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_media_id" integer,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_media_id" integer,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_text_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_callout_3_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_callout_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__services_v_blocks_callout_3_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_list_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_list_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cards_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__services_v_blocks_cards_3_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_cards_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_steps_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_steps_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricing_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricing_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricetable_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_pricetable_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_gallery_3_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_blocks_gallery_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_image_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum__services_v_blocks_image_3_size",
  	"width" numeric,
  	"height" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_self_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_image_pair_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_media_id" integer,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_media_id" integer,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_blocks_twocol" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_services_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"feature" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_slug" varchar,
  	"version_category" varchar,
  	"version_icon" varchar,
  	"version_is_featured" boolean DEFAULT false,
  	"version_image_url" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__services_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_services_v_locales" (
  	"version_content" jsonb,
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_eyebrow" varchar,
  	"version_hero_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_doctors_v_version_specialty" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_doctors_v_version_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_doctors_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_name" varchar,
  	"version_credentials" varchar,
  	"version_department" "enum__doctors_v_version_department",
  	"version_initials" varchar,
  	"version_photo_url" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__doctors_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__doctors_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_doctors_v_locales" (
  	"version_role" varchar,
  	"version_bio" varchar,
  	"version_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_technology_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_callout_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__technology_v_blocks_callout_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__technology_v_blocks_cards_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricing_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricetable_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricetable" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum__technology_v_blocks_image_size",
  	"width" numeric,
  	"height" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_self_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_media_id" integer,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_media_id" integer,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_text_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_callout_2_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_callout_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__technology_v_blocks_callout_2_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_list_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_list_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_cards_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__technology_v_blocks_cards_2_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_cards_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_steps_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_steps_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricing_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricing_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricetable_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricetable_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_gallery_2_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_gallery_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_image_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum__technology_v_blocks_image_2_size",
  	"width" numeric,
  	"height" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_self_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_image_pair_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_media_id" integer,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_media_id" integer,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_text_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_callout_3_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_callout_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__technology_v_blocks_callout_3_icon",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_list_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_list_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_cards_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum__technology_v_blocks_cards_3_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_cards_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_steps_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_steps_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricing_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricing_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricetable_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_pricetable_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_gallery_3_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_gallery_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_image_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum__technology_v_blocks_image_3_size",
  	"width" numeric,
  	"height" numeric,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_self_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_image_pair_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_media_id" integer,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_media_id" integer,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_blocks_twocol" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_technology_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_technology_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_slug" varchar,
  	"version_category" varchar,
  	"version_image_url" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__technology_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__technology_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_technology_v_locales" (
  	"version_content" jsonb,
  	"version_name" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pricing_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_icon" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pricing_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pricing_categories_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pricing_categories_v_locales" (
  	"version_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pricing_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_price" varchar,
  	"version_ada" varchar,
  	"version_aus" varchar,
  	"version_category_id" integer,
  	"version_source_category_id" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pricing_items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pricing_items_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pricing_items_v_locales" (
  	"version_name" varchar,
  	"version_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pricing_comparison_sets_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_slug" varchar,
  	"version_exchange_rate" numeric,
  	"version_source_note" varchar,
  	"version_last_updated" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pricing_comparison_sets_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pricing_comparison_sets_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pricing_comparison_rows_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_set_id" integer,
  	"version_source_set_id" varchar,
  	"version_ada" varchar,
  	"version_treatment" varchar,
  	"version_roomchang_price" varchar,
  	"version_australia_price" varchar,
  	"version_singapore_price" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pricing_comparison_rows_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pricing_comparison_rows_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_international_why_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__international_why_items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__international_why_items_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_international_why_items_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_international_treatments_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__international_treatments_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__international_treatments_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_international_treatments_v_locales" (
  	"version_name" varchar,
  	"version_saving" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_international_steps_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_step_label" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__international_steps_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__international_steps_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_international_steps_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_timeline_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_year" varchar,
  	"version_image_url" varchar,
  	"version_image_alt" varchar,
  	"version_image_position" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__timeline_events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__timeline_events_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_timeline_events_v_locales" (
  	"version_caption" varchar,
  	"version_heading" varchar,
  	"version_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_branches_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_short_name" varchar,
  	"version_phone" varchar,
  	"version_mobile" varchar,
  	"version_email" varchar,
  	"version_image_url" varchar,
  	"version_map_query" varchar,
  	"version_map_url" varchar,
  	"version_map_place_url" varchar,
  	"version_photos" jsonb,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__branches_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__branches_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_branches_v_locales" (
  	"version_badge" varchar,
  	"version_description" varchar,
  	"version_address" varchar,
  	"version_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_clinical_cases_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_slug" varchar,
  	"version_image_url" varchar,
  	"version_images" jsonb,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__clinical_cases_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__clinical_cases_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_clinical_cases_v_locales" (
  	"version_title" varchar,
  	"version_category" varchar,
  	"version_treatment" varchar,
  	"version_duration" varchar,
  	"version_description" varchar,
  	"version_tag" varchar,
  	"version_full_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_partners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_name" varchar,
  	"version_logo_url" varchar,
  	"version_website" varchar,
  	"version_category_id" integer,
  	"version_source_category_id" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__partners_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__partners_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_partner_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_name" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__partner_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__partner_categories_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_faq_items_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_category" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__faq_items_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__faq_items_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_faq_items_v_locales" (
  	"version_question" varchar,
  	"version_answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_news_articles_v_version_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"paragraph" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_news_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_slug" varchar,
  	"version_date" varchar,
  	"version_image_url" varchar,
  	"version_image_alt" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__news_articles_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_news_articles_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_community_articles_v_version_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"paragraph" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_community_articles_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_community_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_slug" varchar,
  	"version_image_url" varchar,
  	"version_image_alt" varchar,
  	"version_href" varchar,
  	"version_date" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__community_articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__community_articles_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_community_articles_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_publications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_title" varchar,
  	"version_authors" varchar,
  	"version_journal" varchar,
  	"version_year" numeric,
  	"version_doi" varchar,
  	"version_url" varchar,
  	"version_abstract" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__publications_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__publications_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_videos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_url" varchar,
  	"version_thumbnail" varchar,
  	"version_category" varchar,
  	"version_doctor" varchar,
  	"version_topic" varchar,
  	"version_treatment" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__videos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__videos_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_videos_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_career_positions_v_version_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_career_positions_v_version_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_career_positions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_source_id" varchar,
  	"version_slug" varchar,
  	"version_department" varchar,
  	"version_type" varchar,
  	"version_location" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_published" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__career_positions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__career_positions_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_career_positions_v_locales" (
  	"version_title" varchar,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "homepage_hero_buttons" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "brand_logos" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "brand_logos" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "site_stats" ALTER COLUMN "key" DROP NOT NULL;
  ALTER TABLE "feature_cards" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "feature_cards_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "testimonials" ALTER COLUMN "author_name" DROP NOT NULL;
  ALTER TABLE "services_features" ALTER COLUMN "feature" DROP NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "doctors_specialty" ALTER COLUMN "value" DROP NOT NULL;
  ALTER TABLE "doctors_languages" ALTER COLUMN "value" DROP NOT NULL;
  ALTER TABLE "doctors" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "technology_highlights" ALTER COLUMN "value" DROP NOT NULL;
  ALTER TABLE "technology" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "technology_locales" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "pricing_categories_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pricing_items_locales" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "pricing_comparison_sets" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "pricing_comparison_rows" ALTER COLUMN "treatment" DROP NOT NULL;
  ALTER TABLE "international_why_items_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "international_treatments_locales" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "international_steps_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "timeline_events" ALTER COLUMN "year" DROP NOT NULL;
  ALTER TABLE "timeline_events_locales" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "branches" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "clinical_cases" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "clinical_cases_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "partners" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "partner_categories" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "faq_items_locales" ALTER COLUMN "question" DROP NOT NULL;
  ALTER TABLE "news_articles_body" ALTER COLUMN "paragraph" DROP NOT NULL;
  ALTER TABLE "news_articles" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "news_articles_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "community_articles_body" ALTER COLUMN "paragraph" DROP NOT NULL;
  ALTER TABLE "community_articles_images" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "community_articles" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "community_articles_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "publications" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "videos" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "videos_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "career_positions_requirements" ALTER COLUMN "value" DROP NOT NULL;
  ALTER TABLE "career_positions_benefits" ALTER COLUMN "value" DROP NOT NULL;
  ALTER TABLE "career_positions" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "career_positions_locales" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "homepage" ADD COLUMN "_status" "enum_homepage_status" DEFAULT 'draft';
  ALTER TABLE "brand_logos" ADD COLUMN "_status" "enum_brand_logos_status" DEFAULT 'draft';
  ALTER TABLE "site_stats" ADD COLUMN "_status" "enum_site_stats_status" DEFAULT 'draft';
  ALTER TABLE "feature_cards" ADD COLUMN "_status" "enum_feature_cards_status" DEFAULT 'draft';
  ALTER TABLE "testimonials" ADD COLUMN "_status" "enum_testimonials_status" DEFAULT 'draft';
  ALTER TABLE "pages" ADD COLUMN "_status" "enum_pages_status" DEFAULT 'draft';
  ALTER TABLE "services" ADD COLUMN "_status" "enum_services_status" DEFAULT 'draft';
  ALTER TABLE "doctors" ADD COLUMN "_status" "enum_doctors_status" DEFAULT 'draft';
  ALTER TABLE "technology" ADD COLUMN "_status" "enum_technology_status" DEFAULT 'draft';
  ALTER TABLE "pricing_categories" ADD COLUMN "_status" "enum_pricing_categories_status" DEFAULT 'draft';
  ALTER TABLE "pricing_items" ADD COLUMN "_status" "enum_pricing_items_status" DEFAULT 'draft';
  ALTER TABLE "pricing_comparison_sets" ADD COLUMN "_status" "enum_pricing_comparison_sets_status" DEFAULT 'draft';
  ALTER TABLE "pricing_comparison_rows" ADD COLUMN "_status" "enum_pricing_comparison_rows_status" DEFAULT 'draft';
  ALTER TABLE "international_why_items" ADD COLUMN "_status" "enum_international_why_items_status" DEFAULT 'draft';
  ALTER TABLE "international_treatments" ADD COLUMN "_status" "enum_international_treatments_status" DEFAULT 'draft';
  ALTER TABLE "international_steps" ADD COLUMN "_status" "enum_international_steps_status" DEFAULT 'draft';
  ALTER TABLE "timeline_events" ADD COLUMN "_status" "enum_timeline_events_status" DEFAULT 'draft';
  ALTER TABLE "branches" ADD COLUMN "_status" "enum_branches_status" DEFAULT 'draft';
  ALTER TABLE "clinical_cases" ADD COLUMN "_status" "enum_clinical_cases_status" DEFAULT 'draft';
  ALTER TABLE "partners" ADD COLUMN "_status" "enum_partners_status" DEFAULT 'draft';
  ALTER TABLE "partner_categories" ADD COLUMN "_status" "enum_partner_categories_status" DEFAULT 'draft';
  ALTER TABLE "faq_items" ADD COLUMN "_status" "enum_faq_items_status" DEFAULT 'draft';
  ALTER TABLE "news_articles" ADD COLUMN "_status" "enum_news_articles_status" DEFAULT 'draft';
  ALTER TABLE "community_articles" ADD COLUMN "_status" "enum_community_articles_status" DEFAULT 'draft';
  ALTER TABLE "publications" ADD COLUMN "_status" "enum_publications_status" DEFAULT 'draft';
  ALTER TABLE "videos" ADD COLUMN "_status" "enum_videos_status" DEFAULT 'draft';
  ALTER TABLE "career_positions" ADD COLUMN "_status" "enum_career_positions_status" DEFAULT 'draft';
  ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
  ALTER TABLE "_homepage_v_version_hero_buttons" ADD CONSTRAINT "_homepage_v_version_hero_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_hero_buttons_locales" ADD CONSTRAINT "_homepage_v_version_hero_buttons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_hero_buttons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_slides" ADD CONSTRAINT "_homepage_v_version_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_slides" ADD CONSTRAINT "_homepage_v_version_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_slides_locales" ADD CONSTRAINT "_homepage_v_version_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_parent_id_homepage_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_locales" ADD CONSTRAINT "_homepage_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_brand_logos_v" ADD CONSTRAINT "_brand_logos_v_parent_id_brand_logos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brand_logos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brand_logos_v" ADD CONSTRAINT "_brand_logos_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_stats_v" ADD CONSTRAINT "_site_stats_v_parent_id_site_stats_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_stats"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_stats_v" ADD CONSTRAINT "_site_stats_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_stats_v_locales" ADD CONSTRAINT "_site_stats_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_stats_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_feature_cards_v" ADD CONSTRAINT "_feature_cards_v_parent_id_feature_cards_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."feature_cards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_feature_cards_v" ADD CONSTRAINT "_feature_cards_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_feature_cards_v_locales" ADD CONSTRAINT "_feature_cards_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_feature_cards_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v_locales" ADD CONSTRAINT "_testimonials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text" ADD CONSTRAINT "_pages_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout_stats" ADD CONSTRAINT "_pages_v_blocks_callout_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_callout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout" ADD CONSTRAINT "_pages_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_list_items" ADD CONSTRAINT "_pages_v_blocks_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_list" ADD CONSTRAINT "_pages_v_blocks_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_items" ADD CONSTRAINT "_pages_v_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_items" ADD CONSTRAINT "_pages_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps" ADD CONSTRAINT "_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_rows" ADD CONSTRAINT "_pages_v_blocks_pricing_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing" ADD CONSTRAINT "_pages_v_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricetable_rows" ADD CONSTRAINT "_pages_v_blocks_pricetable_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricetable"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricetable" ADD CONSTRAINT "_pages_v_blocks_pricetable_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_images" ADD CONSTRAINT "_pages_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_self_video" ADD CONSTRAINT "_pages_v_blocks_self_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pair" ADD CONSTRAINT "_pages_v_blocks_image_pair_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pair" ADD CONSTRAINT "_pages_v_blocks_image_pair_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pair" ADD CONSTRAINT "_pages_v_blocks_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_2" ADD CONSTRAINT "_pages_v_blocks_text_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout_2_stats" ADD CONSTRAINT "_pages_v_blocks_callout_2_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_callout_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout_2" ADD CONSTRAINT "_pages_v_blocks_callout_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_list_2_items" ADD CONSTRAINT "_pages_v_blocks_list_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_list_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_list_2" ADD CONSTRAINT "_pages_v_blocks_list_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_2_items" ADD CONSTRAINT "_pages_v_blocks_cards_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_2" ADD CONSTRAINT "_pages_v_blocks_cards_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_2_items" ADD CONSTRAINT "_pages_v_blocks_steps_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_2" ADD CONSTRAINT "_pages_v_blocks_steps_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_2_rows" ADD CONSTRAINT "_pages_v_blocks_pricing_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_2" ADD CONSTRAINT "_pages_v_blocks_pricing_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricetable_2_rows" ADD CONSTRAINT "_pages_v_blocks_pricetable_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricetable_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricetable_2" ADD CONSTRAINT "_pages_v_blocks_pricetable_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_2_images" ADD CONSTRAINT "_pages_v_blocks_gallery_2_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_2_images" ADD CONSTRAINT "_pages_v_blocks_gallery_2_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_2" ADD CONSTRAINT "_pages_v_blocks_gallery_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_2" ADD CONSTRAINT "_pages_v_blocks_image_2_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_2" ADD CONSTRAINT "_pages_v_blocks_image_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_2" ADD CONSTRAINT "_pages_v_blocks_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_self_video_2" ADD CONSTRAINT "_pages_v_blocks_self_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pair_2" ADD CONSTRAINT "_pages_v_blocks_image_pair_2_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pair_2" ADD CONSTRAINT "_pages_v_blocks_image_pair_2_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pair_2" ADD CONSTRAINT "_pages_v_blocks_image_pair_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_3" ADD CONSTRAINT "_pages_v_blocks_text_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout_3_stats" ADD CONSTRAINT "_pages_v_blocks_callout_3_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_callout_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout_3" ADD CONSTRAINT "_pages_v_blocks_callout_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_list_3_items" ADD CONSTRAINT "_pages_v_blocks_list_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_list_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_list_3" ADD CONSTRAINT "_pages_v_blocks_list_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_3_items" ADD CONSTRAINT "_pages_v_blocks_cards_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cards_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards_3" ADD CONSTRAINT "_pages_v_blocks_cards_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_3_items" ADD CONSTRAINT "_pages_v_blocks_steps_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_3" ADD CONSTRAINT "_pages_v_blocks_steps_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_3_rows" ADD CONSTRAINT "_pages_v_blocks_pricing_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_3" ADD CONSTRAINT "_pages_v_blocks_pricing_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricetable_3_rows" ADD CONSTRAINT "_pages_v_blocks_pricetable_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricetable_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricetable_3" ADD CONSTRAINT "_pages_v_blocks_pricetable_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_3_images" ADD CONSTRAINT "_pages_v_blocks_gallery_3_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_3_images" ADD CONSTRAINT "_pages_v_blocks_gallery_3_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_3" ADD CONSTRAINT "_pages_v_blocks_gallery_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_3" ADD CONSTRAINT "_pages_v_blocks_image_3_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_3" ADD CONSTRAINT "_pages_v_blocks_image_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_3" ADD CONSTRAINT "_pages_v_blocks_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_self_video_3" ADD CONSTRAINT "_pages_v_blocks_self_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pair_3" ADD CONSTRAINT "_pages_v_blocks_image_pair_3_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pair_3" ADD CONSTRAINT "_pages_v_blocks_image_pair_3_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_pair_3" ADD CONSTRAINT "_pages_v_blocks_image_pair_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_twocol" ADD CONSTRAINT "_pages_v_blocks_twocol_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_text" ADD CONSTRAINT "_services_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_callout_stats" ADD CONSTRAINT "_services_v_blocks_callout_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_callout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_callout" ADD CONSTRAINT "_services_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_list_items" ADD CONSTRAINT "_services_v_blocks_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_list" ADD CONSTRAINT "_services_v_blocks_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cards_items" ADD CONSTRAINT "_services_v_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cards" ADD CONSTRAINT "_services_v_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_steps_items" ADD CONSTRAINT "_services_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_steps" ADD CONSTRAINT "_services_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricing_rows" ADD CONSTRAINT "_services_v_blocks_pricing_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricing" ADD CONSTRAINT "_services_v_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricetable_rows" ADD CONSTRAINT "_services_v_blocks_pricetable_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_pricetable"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricetable" ADD CONSTRAINT "_services_v_blocks_pricetable_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_images" ADD CONSTRAINT "_services_v_blocks_gallery_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_images" ADD CONSTRAINT "_services_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery" ADD CONSTRAINT "_services_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image" ADD CONSTRAINT "_services_v_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image" ADD CONSTRAINT "_services_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_video" ADD CONSTRAINT "_services_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_self_video" ADD CONSTRAINT "_services_v_blocks_self_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_pair" ADD CONSTRAINT "_services_v_blocks_image_pair_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_pair" ADD CONSTRAINT "_services_v_blocks_image_pair_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_pair" ADD CONSTRAINT "_services_v_blocks_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_text_2" ADD CONSTRAINT "_services_v_blocks_text_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_callout_2_stats" ADD CONSTRAINT "_services_v_blocks_callout_2_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_callout_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_callout_2" ADD CONSTRAINT "_services_v_blocks_callout_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_list_2_items" ADD CONSTRAINT "_services_v_blocks_list_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_list_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_list_2" ADD CONSTRAINT "_services_v_blocks_list_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cards_2_items" ADD CONSTRAINT "_services_v_blocks_cards_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_cards_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cards_2" ADD CONSTRAINT "_services_v_blocks_cards_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_steps_2_items" ADD CONSTRAINT "_services_v_blocks_steps_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_steps_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_steps_2" ADD CONSTRAINT "_services_v_blocks_steps_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricing_2_rows" ADD CONSTRAINT "_services_v_blocks_pricing_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_pricing_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricing_2" ADD CONSTRAINT "_services_v_blocks_pricing_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricetable_2_rows" ADD CONSTRAINT "_services_v_blocks_pricetable_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_pricetable_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricetable_2" ADD CONSTRAINT "_services_v_blocks_pricetable_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_2_images" ADD CONSTRAINT "_services_v_blocks_gallery_2_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_2_images" ADD CONSTRAINT "_services_v_blocks_gallery_2_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_gallery_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_2" ADD CONSTRAINT "_services_v_blocks_gallery_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_2" ADD CONSTRAINT "_services_v_blocks_image_2_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_2" ADD CONSTRAINT "_services_v_blocks_image_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_video_2" ADD CONSTRAINT "_services_v_blocks_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_self_video_2" ADD CONSTRAINT "_services_v_blocks_self_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_pair_2" ADD CONSTRAINT "_services_v_blocks_image_pair_2_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_pair_2" ADD CONSTRAINT "_services_v_blocks_image_pair_2_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_pair_2" ADD CONSTRAINT "_services_v_blocks_image_pair_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_text_3" ADD CONSTRAINT "_services_v_blocks_text_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_callout_3_stats" ADD CONSTRAINT "_services_v_blocks_callout_3_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_callout_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_callout_3" ADD CONSTRAINT "_services_v_blocks_callout_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_list_3_items" ADD CONSTRAINT "_services_v_blocks_list_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_list_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_list_3" ADD CONSTRAINT "_services_v_blocks_list_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cards_3_items" ADD CONSTRAINT "_services_v_blocks_cards_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_cards_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cards_3" ADD CONSTRAINT "_services_v_blocks_cards_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_steps_3_items" ADD CONSTRAINT "_services_v_blocks_steps_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_steps_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_steps_3" ADD CONSTRAINT "_services_v_blocks_steps_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricing_3_rows" ADD CONSTRAINT "_services_v_blocks_pricing_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_pricing_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricing_3" ADD CONSTRAINT "_services_v_blocks_pricing_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricetable_3_rows" ADD CONSTRAINT "_services_v_blocks_pricetable_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_pricetable_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_pricetable_3" ADD CONSTRAINT "_services_v_blocks_pricetable_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_3_images" ADD CONSTRAINT "_services_v_blocks_gallery_3_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_3_images" ADD CONSTRAINT "_services_v_blocks_gallery_3_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_gallery_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery_3" ADD CONSTRAINT "_services_v_blocks_gallery_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_3" ADD CONSTRAINT "_services_v_blocks_image_3_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_3" ADD CONSTRAINT "_services_v_blocks_image_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_video_3" ADD CONSTRAINT "_services_v_blocks_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_self_video_3" ADD CONSTRAINT "_services_v_blocks_self_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_pair_3" ADD CONSTRAINT "_services_v_blocks_image_pair_3_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_pair_3" ADD CONSTRAINT "_services_v_blocks_image_pair_3_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_image_pair_3" ADD CONSTRAINT "_services_v_blocks_image_pair_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_twocol" ADD CONSTRAINT "_services_v_blocks_twocol_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_features" ADD CONSTRAINT "_services_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_doctors_v_version_specialty" ADD CONSTRAINT "_doctors_v_version_specialty_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_doctors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_doctors_v_version_languages" ADD CONSTRAINT "_doctors_v_version_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_doctors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_doctors_v" ADD CONSTRAINT "_doctors_v_parent_id_doctors_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_doctors_v" ADD CONSTRAINT "_doctors_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_doctors_v_locales" ADD CONSTRAINT "_doctors_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_doctors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_text" ADD CONSTRAINT "_technology_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_callout_stats" ADD CONSTRAINT "_technology_v_blocks_callout_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_callout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_callout" ADD CONSTRAINT "_technology_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_list_items" ADD CONSTRAINT "_technology_v_blocks_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_list" ADD CONSTRAINT "_technology_v_blocks_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_cards_items" ADD CONSTRAINT "_technology_v_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_cards" ADD CONSTRAINT "_technology_v_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_steps_items" ADD CONSTRAINT "_technology_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_steps" ADD CONSTRAINT "_technology_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricing_rows" ADD CONSTRAINT "_technology_v_blocks_pricing_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricing" ADD CONSTRAINT "_technology_v_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricetable_rows" ADD CONSTRAINT "_technology_v_blocks_pricetable_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_pricetable"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricetable" ADD CONSTRAINT "_technology_v_blocks_pricetable_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_gallery_images" ADD CONSTRAINT "_technology_v_blocks_gallery_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_gallery_images" ADD CONSTRAINT "_technology_v_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_gallery" ADD CONSTRAINT "_technology_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image" ADD CONSTRAINT "_technology_v_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image" ADD CONSTRAINT "_technology_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_video" ADD CONSTRAINT "_technology_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_self_video" ADD CONSTRAINT "_technology_v_blocks_self_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_pair" ADD CONSTRAINT "_technology_v_blocks_image_pair_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_pair" ADD CONSTRAINT "_technology_v_blocks_image_pair_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_pair" ADD CONSTRAINT "_technology_v_blocks_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_text_2" ADD CONSTRAINT "_technology_v_blocks_text_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_callout_2_stats" ADD CONSTRAINT "_technology_v_blocks_callout_2_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_callout_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_callout_2" ADD CONSTRAINT "_technology_v_blocks_callout_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_list_2_items" ADD CONSTRAINT "_technology_v_blocks_list_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_list_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_list_2" ADD CONSTRAINT "_technology_v_blocks_list_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_cards_2_items" ADD CONSTRAINT "_technology_v_blocks_cards_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_cards_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_cards_2" ADD CONSTRAINT "_technology_v_blocks_cards_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_steps_2_items" ADD CONSTRAINT "_technology_v_blocks_steps_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_steps_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_steps_2" ADD CONSTRAINT "_technology_v_blocks_steps_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricing_2_rows" ADD CONSTRAINT "_technology_v_blocks_pricing_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_pricing_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricing_2" ADD CONSTRAINT "_technology_v_blocks_pricing_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricetable_2_rows" ADD CONSTRAINT "_technology_v_blocks_pricetable_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_pricetable_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricetable_2" ADD CONSTRAINT "_technology_v_blocks_pricetable_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_gallery_2_images" ADD CONSTRAINT "_technology_v_blocks_gallery_2_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_gallery_2_images" ADD CONSTRAINT "_technology_v_blocks_gallery_2_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_gallery_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_gallery_2" ADD CONSTRAINT "_technology_v_blocks_gallery_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_2" ADD CONSTRAINT "_technology_v_blocks_image_2_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_2" ADD CONSTRAINT "_technology_v_blocks_image_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_video_2" ADD CONSTRAINT "_technology_v_blocks_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_self_video_2" ADD CONSTRAINT "_technology_v_blocks_self_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_pair_2" ADD CONSTRAINT "_technology_v_blocks_image_pair_2_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_pair_2" ADD CONSTRAINT "_technology_v_blocks_image_pair_2_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_pair_2" ADD CONSTRAINT "_technology_v_blocks_image_pair_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_text_3" ADD CONSTRAINT "_technology_v_blocks_text_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_callout_3_stats" ADD CONSTRAINT "_technology_v_blocks_callout_3_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_callout_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_callout_3" ADD CONSTRAINT "_technology_v_blocks_callout_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_list_3_items" ADD CONSTRAINT "_technology_v_blocks_list_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_list_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_list_3" ADD CONSTRAINT "_technology_v_blocks_list_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_cards_3_items" ADD CONSTRAINT "_technology_v_blocks_cards_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_cards_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_cards_3" ADD CONSTRAINT "_technology_v_blocks_cards_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_steps_3_items" ADD CONSTRAINT "_technology_v_blocks_steps_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_steps_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_steps_3" ADD CONSTRAINT "_technology_v_blocks_steps_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricing_3_rows" ADD CONSTRAINT "_technology_v_blocks_pricing_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_pricing_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricing_3" ADD CONSTRAINT "_technology_v_blocks_pricing_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricetable_3_rows" ADD CONSTRAINT "_technology_v_blocks_pricetable_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_pricetable_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_pricetable_3" ADD CONSTRAINT "_technology_v_blocks_pricetable_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_gallery_3_images" ADD CONSTRAINT "_technology_v_blocks_gallery_3_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_gallery_3_images" ADD CONSTRAINT "_technology_v_blocks_gallery_3_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v_blocks_gallery_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_gallery_3" ADD CONSTRAINT "_technology_v_blocks_gallery_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_3" ADD CONSTRAINT "_technology_v_blocks_image_3_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_3" ADD CONSTRAINT "_technology_v_blocks_image_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_video_3" ADD CONSTRAINT "_technology_v_blocks_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_self_video_3" ADD CONSTRAINT "_technology_v_blocks_self_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_pair_3" ADD CONSTRAINT "_technology_v_blocks_image_pair_3_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_pair_3" ADD CONSTRAINT "_technology_v_blocks_image_pair_3_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_image_pair_3" ADD CONSTRAINT "_technology_v_blocks_image_pair_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_blocks_twocol" ADD CONSTRAINT "_technology_v_blocks_twocol_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v_version_highlights" ADD CONSTRAINT "_technology_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technology_v" ADD CONSTRAINT "_technology_v_parent_id_technology_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."technology"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v" ADD CONSTRAINT "_technology_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technology_v_locales" ADD CONSTRAINT "_technology_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technology_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pricing_categories_v" ADD CONSTRAINT "_pricing_categories_v_parent_id_pricing_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pricing_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_categories_v" ADD CONSTRAINT "_pricing_categories_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_categories_v_locales" ADD CONSTRAINT "_pricing_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pricing_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pricing_items_v" ADD CONSTRAINT "_pricing_items_v_parent_id_pricing_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pricing_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_items_v" ADD CONSTRAINT "_pricing_items_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_items_v" ADD CONSTRAINT "_pricing_items_v_version_category_id_pricing_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."pricing_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_items_v_locales" ADD CONSTRAINT "_pricing_items_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pricing_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pricing_comparison_sets_v" ADD CONSTRAINT "_pricing_comparison_sets_v_parent_id_pricing_comparison_sets_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pricing_comparison_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_comparison_sets_v" ADD CONSTRAINT "_pricing_comparison_sets_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_comparison_rows_v" ADD CONSTRAINT "_pricing_comparison_rows_v_parent_id_pricing_comparison_rows_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pricing_comparison_rows"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_comparison_rows_v" ADD CONSTRAINT "_pricing_comparison_rows_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_comparison_rows_v" ADD CONSTRAINT "_pricing_comparison_rows_v_version_set_id_pricing_comparison_sets_id_fk" FOREIGN KEY ("version_set_id") REFERENCES "public"."pricing_comparison_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_international_why_items_v" ADD CONSTRAINT "_international_why_items_v_parent_id_international_why_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."international_why_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_international_why_items_v" ADD CONSTRAINT "_international_why_items_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_international_why_items_v_locales" ADD CONSTRAINT "_international_why_items_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_international_why_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_international_treatments_v" ADD CONSTRAINT "_international_treatments_v_parent_id_international_treatments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."international_treatments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_international_treatments_v" ADD CONSTRAINT "_international_treatments_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_international_treatments_v_locales" ADD CONSTRAINT "_international_treatments_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_international_treatments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_international_steps_v" ADD CONSTRAINT "_international_steps_v_parent_id_international_steps_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."international_steps"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_international_steps_v" ADD CONSTRAINT "_international_steps_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_international_steps_v_locales" ADD CONSTRAINT "_international_steps_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_international_steps_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timeline_events_v" ADD CONSTRAINT "_timeline_events_v_parent_id_timeline_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."timeline_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_timeline_events_v" ADD CONSTRAINT "_timeline_events_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_timeline_events_v_locales" ADD CONSTRAINT "_timeline_events_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_timeline_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_branches_v" ADD CONSTRAINT "_branches_v_parent_id_branches_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_branches_v" ADD CONSTRAINT "_branches_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_branches_v_locales" ADD CONSTRAINT "_branches_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_branches_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_clinical_cases_v" ADD CONSTRAINT "_clinical_cases_v_parent_id_clinical_cases_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."clinical_cases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_clinical_cases_v" ADD CONSTRAINT "_clinical_cases_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_clinical_cases_v_locales" ADD CONSTRAINT "_clinical_cases_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_clinical_cases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_parent_id_partners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_category_id_partner_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."partner_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partner_categories_v" ADD CONSTRAINT "_partner_categories_v_parent_id_partner_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partner_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partner_categories_v" ADD CONSTRAINT "_partner_categories_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_items_v" ADD CONSTRAINT "_faq_items_v_parent_id_faq_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faq_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_items_v" ADD CONSTRAINT "_faq_items_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_items_v_locales" ADD CONSTRAINT "_faq_items_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_items_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_articles_v_version_body" ADD CONSTRAINT "_news_articles_v_version_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_articles_v" ADD CONSTRAINT "_news_articles_v_parent_id_news_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news_articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_articles_v" ADD CONSTRAINT "_news_articles_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_articles_v_locales" ADD CONSTRAINT "_news_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_articles_v_version_body" ADD CONSTRAINT "_community_articles_v_version_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_community_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_articles_v_version_images" ADD CONSTRAINT "_community_articles_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_community_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_community_articles_v" ADD CONSTRAINT "_community_articles_v_parent_id_community_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."community_articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_community_articles_v" ADD CONSTRAINT "_community_articles_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_community_articles_v_locales" ADD CONSTRAINT "_community_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_community_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_publications_v" ADD CONSTRAINT "_publications_v_parent_id_publications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."publications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_publications_v" ADD CONSTRAINT "_publications_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v" ADD CONSTRAINT "_videos_v_parent_id_videos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v" ADD CONSTRAINT "_videos_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_videos_v_locales" ADD CONSTRAINT "_videos_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_videos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_career_positions_v_version_requirements" ADD CONSTRAINT "_career_positions_v_version_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_career_positions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_career_positions_v_version_benefits" ADD CONSTRAINT "_career_positions_v_version_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_career_positions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_career_positions_v" ADD CONSTRAINT "_career_positions_v_parent_id_career_positions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."career_positions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_career_positions_v" ADD CONSTRAINT "_career_positions_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_career_positions_v_locales" ADD CONSTRAINT "_career_positions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_career_positions_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_homepage_v_version_hero_buttons_order_idx" ON "_homepage_v_version_hero_buttons" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_hero_buttons_parent_id_idx" ON "_homepage_v_version_hero_buttons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_hero_buttons_locales_locale_parent_id_un" ON "_homepage_v_version_hero_buttons_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_slides_order_idx" ON "_homepage_v_version_slides" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_slides_parent_id_idx" ON "_homepage_v_version_slides" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_slides_image_idx" ON "_homepage_v_version_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "_homepage_v_version_slides_locales_locale_parent_id_unique" ON "_homepage_v_version_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_parent_idx" ON "_homepage_v" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_version_version_tenant_idx" ON "_homepage_v" USING btree ("version_tenant_id");
  CREATE INDEX "_homepage_v_version_version_updated_at_idx" ON "_homepage_v" USING btree ("version_updated_at");
  CREATE INDEX "_homepage_v_version_version_created_at_idx" ON "_homepage_v" USING btree ("version_created_at");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_snapshot_idx" ON "_homepage_v" USING btree ("snapshot");
  CREATE INDEX "_homepage_v_published_locale_idx" ON "_homepage_v" USING btree ("published_locale");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_homepage_v_locales_locale_parent_id_unique" ON "_homepage_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_brand_logos_v_parent_idx" ON "_brand_logos_v" USING btree ("parent_id");
  CREATE INDEX "_brand_logos_v_version_version_tenant_idx" ON "_brand_logos_v" USING btree ("version_tenant_id");
  CREATE INDEX "_brand_logos_v_version_version_source_id_idx" ON "_brand_logos_v" USING btree ("version_source_id");
  CREATE INDEX "_brand_logos_v_version_version_slug_idx" ON "_brand_logos_v" USING btree ("version_slug");
  CREATE INDEX "_brand_logos_v_version_version_updated_at_idx" ON "_brand_logos_v" USING btree ("version_updated_at");
  CREATE INDEX "_brand_logos_v_version_version_created_at_idx" ON "_brand_logos_v" USING btree ("version_created_at");
  CREATE INDEX "_brand_logos_v_version_version__status_idx" ON "_brand_logos_v" USING btree ("version__status");
  CREATE INDEX "_brand_logos_v_created_at_idx" ON "_brand_logos_v" USING btree ("created_at");
  CREATE INDEX "_brand_logos_v_updated_at_idx" ON "_brand_logos_v" USING btree ("updated_at");
  CREATE INDEX "_brand_logos_v_snapshot_idx" ON "_brand_logos_v" USING btree ("snapshot");
  CREATE INDEX "_brand_logos_v_published_locale_idx" ON "_brand_logos_v" USING btree ("published_locale");
  CREATE INDEX "_brand_logos_v_latest_idx" ON "_brand_logos_v" USING btree ("latest");
  CREATE INDEX "_site_stats_v_parent_idx" ON "_site_stats_v" USING btree ("parent_id");
  CREATE INDEX "_site_stats_v_version_version_tenant_idx" ON "_site_stats_v" USING btree ("version_tenant_id");
  CREATE INDEX "_site_stats_v_version_version_source_id_idx" ON "_site_stats_v" USING btree ("version_source_id");
  CREATE INDEX "_site_stats_v_version_version_key_idx" ON "_site_stats_v" USING btree ("version_key");
  CREATE INDEX "_site_stats_v_version_version_updated_at_idx" ON "_site_stats_v" USING btree ("version_updated_at");
  CREATE INDEX "_site_stats_v_version_version_created_at_idx" ON "_site_stats_v" USING btree ("version_created_at");
  CREATE INDEX "_site_stats_v_version_version__status_idx" ON "_site_stats_v" USING btree ("version__status");
  CREATE INDEX "_site_stats_v_created_at_idx" ON "_site_stats_v" USING btree ("created_at");
  CREATE INDEX "_site_stats_v_updated_at_idx" ON "_site_stats_v" USING btree ("updated_at");
  CREATE INDEX "_site_stats_v_snapshot_idx" ON "_site_stats_v" USING btree ("snapshot");
  CREATE INDEX "_site_stats_v_published_locale_idx" ON "_site_stats_v" USING btree ("published_locale");
  CREATE INDEX "_site_stats_v_latest_idx" ON "_site_stats_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_site_stats_v_locales_locale_parent_id_unique" ON "_site_stats_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_feature_cards_v_parent_idx" ON "_feature_cards_v" USING btree ("parent_id");
  CREATE INDEX "_feature_cards_v_version_version_tenant_idx" ON "_feature_cards_v" USING btree ("version_tenant_id");
  CREATE INDEX "_feature_cards_v_version_version_source_id_idx" ON "_feature_cards_v" USING btree ("version_source_id");
  CREATE INDEX "_feature_cards_v_version_version_slug_idx" ON "_feature_cards_v" USING btree ("version_slug");
  CREATE INDEX "_feature_cards_v_version_version_updated_at_idx" ON "_feature_cards_v" USING btree ("version_updated_at");
  CREATE INDEX "_feature_cards_v_version_version_created_at_idx" ON "_feature_cards_v" USING btree ("version_created_at");
  CREATE INDEX "_feature_cards_v_version_version__status_idx" ON "_feature_cards_v" USING btree ("version__status");
  CREATE INDEX "_feature_cards_v_created_at_idx" ON "_feature_cards_v" USING btree ("created_at");
  CREATE INDEX "_feature_cards_v_updated_at_idx" ON "_feature_cards_v" USING btree ("updated_at");
  CREATE INDEX "_feature_cards_v_snapshot_idx" ON "_feature_cards_v" USING btree ("snapshot");
  CREATE INDEX "_feature_cards_v_published_locale_idx" ON "_feature_cards_v" USING btree ("published_locale");
  CREATE INDEX "_feature_cards_v_latest_idx" ON "_feature_cards_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_feature_cards_v_locales_locale_parent_id_unique" ON "_feature_cards_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_tenant_idx" ON "_testimonials_v" USING btree ("version_tenant_id");
  CREATE INDEX "_testimonials_v_version_version_source_id_idx" ON "_testimonials_v" USING btree ("version_source_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_snapshot_idx" ON "_testimonials_v" USING btree ("snapshot");
  CREATE INDEX "_testimonials_v_published_locale_idx" ON "_testimonials_v" USING btree ("published_locale");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_testimonials_v_locales_locale_parent_id_unique" ON "_testimonials_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_text_order_idx" ON "_pages_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_parent_id_idx" ON "_pages_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_path_idx" ON "_pages_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_locale_idx" ON "_pages_v_blocks_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_callout_stats_order_idx" ON "_pages_v_blocks_callout_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_stats_parent_id_idx" ON "_pages_v_blocks_callout_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_stats_locale_idx" ON "_pages_v_blocks_callout_stats" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_callout_order_idx" ON "_pages_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_parent_id_idx" ON "_pages_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_path_idx" ON "_pages_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_callout_locale_idx" ON "_pages_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_list_items_order_idx" ON "_pages_v_blocks_list_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_list_items_parent_id_idx" ON "_pages_v_blocks_list_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_list_items_locale_idx" ON "_pages_v_blocks_list_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_list_order_idx" ON "_pages_v_blocks_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_list_parent_id_idx" ON "_pages_v_blocks_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_list_path_idx" ON "_pages_v_blocks_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_list_locale_idx" ON "_pages_v_blocks_list" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cards_items_order_idx" ON "_pages_v_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_items_parent_id_idx" ON "_pages_v_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_items_locale_idx" ON "_pages_v_blocks_cards_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cards_order_idx" ON "_pages_v_blocks_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_parent_id_idx" ON "_pages_v_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_path_idx" ON "_pages_v_blocks_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cards_locale_idx" ON "_pages_v_blocks_cards" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_items_order_idx" ON "_pages_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_items_parent_id_idx" ON "_pages_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_items_locale_idx" ON "_pages_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_order_idx" ON "_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_parent_id_idx" ON "_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_path_idx" ON "_pages_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_steps_locale_idx" ON "_pages_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_rows_order_idx" ON "_pages_v_blocks_pricing_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_rows_parent_id_idx" ON "_pages_v_blocks_pricing_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_rows_locale_idx" ON "_pages_v_blocks_pricing_rows" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_order_idx" ON "_pages_v_blocks_pricing" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_parent_id_idx" ON "_pages_v_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_path_idx" ON "_pages_v_blocks_pricing" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricing_locale_idx" ON "_pages_v_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricetable_rows_order_idx" ON "_pages_v_blocks_pricetable_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricetable_rows_parent_id_idx" ON "_pages_v_blocks_pricetable_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricetable_rows_locale_idx" ON "_pages_v_blocks_pricetable_rows" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricetable_order_idx" ON "_pages_v_blocks_pricetable" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricetable_parent_id_idx" ON "_pages_v_blocks_pricetable" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricetable_path_idx" ON "_pages_v_blocks_pricetable" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricetable_locale_idx" ON "_pages_v_blocks_pricetable" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_images_order_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_images_parent_id_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_images_locale_idx" ON "_pages_v_blocks_gallery_images" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_images_media_idx" ON "_pages_v_blocks_gallery_images" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_locale_idx" ON "_pages_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_locale_idx" ON "_pages_v_blocks_image" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_media_idx" ON "_pages_v_blocks_image" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_video_order_idx" ON "_pages_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_parent_id_idx" ON "_pages_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_path_idx" ON "_pages_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_locale_idx" ON "_pages_v_blocks_video" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_self_video_order_idx" ON "_pages_v_blocks_self_video" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_self_video_parent_id_idx" ON "_pages_v_blocks_self_video" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_self_video_path_idx" ON "_pages_v_blocks_self_video" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_self_video_locale_idx" ON "_pages_v_blocks_self_video" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_pair_order_idx" ON "_pages_v_blocks_image_pair" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_pair_parent_id_idx" ON "_pages_v_blocks_image_pair" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_pair_path_idx" ON "_pages_v_blocks_image_pair" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_pair_locale_idx" ON "_pages_v_blocks_image_pair" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_pair_left_left_media_idx" ON "_pages_v_blocks_image_pair" USING btree ("left_media_id");
  CREATE INDEX "_pages_v_blocks_image_pair_right_right_media_idx" ON "_pages_v_blocks_image_pair" USING btree ("right_media_id");
  CREATE INDEX "_pages_v_blocks_text_2_order_idx" ON "_pages_v_blocks_text_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_2_parent_id_idx" ON "_pages_v_blocks_text_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_2_path_idx" ON "_pages_v_blocks_text_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_2_locale_idx" ON "_pages_v_blocks_text_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_callout_2_stats_order_idx" ON "_pages_v_blocks_callout_2_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_2_stats_parent_id_idx" ON "_pages_v_blocks_callout_2_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_2_stats_locale_idx" ON "_pages_v_blocks_callout_2_stats" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_callout_2_order_idx" ON "_pages_v_blocks_callout_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_2_parent_id_idx" ON "_pages_v_blocks_callout_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_2_path_idx" ON "_pages_v_blocks_callout_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_callout_2_locale_idx" ON "_pages_v_blocks_callout_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_list_2_items_order_idx" ON "_pages_v_blocks_list_2_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_list_2_items_parent_id_idx" ON "_pages_v_blocks_list_2_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_list_2_items_locale_idx" ON "_pages_v_blocks_list_2_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_list_2_order_idx" ON "_pages_v_blocks_list_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_list_2_parent_id_idx" ON "_pages_v_blocks_list_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_list_2_path_idx" ON "_pages_v_blocks_list_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_list_2_locale_idx" ON "_pages_v_blocks_list_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cards_2_items_order_idx" ON "_pages_v_blocks_cards_2_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_2_items_parent_id_idx" ON "_pages_v_blocks_cards_2_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_2_items_locale_idx" ON "_pages_v_blocks_cards_2_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cards_2_order_idx" ON "_pages_v_blocks_cards_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_2_parent_id_idx" ON "_pages_v_blocks_cards_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_2_path_idx" ON "_pages_v_blocks_cards_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cards_2_locale_idx" ON "_pages_v_blocks_cards_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_2_items_order_idx" ON "_pages_v_blocks_steps_2_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_2_items_parent_id_idx" ON "_pages_v_blocks_steps_2_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_2_items_locale_idx" ON "_pages_v_blocks_steps_2_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_2_order_idx" ON "_pages_v_blocks_steps_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_2_parent_id_idx" ON "_pages_v_blocks_steps_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_2_path_idx" ON "_pages_v_blocks_steps_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_steps_2_locale_idx" ON "_pages_v_blocks_steps_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_2_rows_order_idx" ON "_pages_v_blocks_pricing_2_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_2_rows_parent_id_idx" ON "_pages_v_blocks_pricing_2_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_2_rows_locale_idx" ON "_pages_v_blocks_pricing_2_rows" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_2_order_idx" ON "_pages_v_blocks_pricing_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_2_parent_id_idx" ON "_pages_v_blocks_pricing_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_2_path_idx" ON "_pages_v_blocks_pricing_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricing_2_locale_idx" ON "_pages_v_blocks_pricing_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricetable_2_rows_order_idx" ON "_pages_v_blocks_pricetable_2_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricetable_2_rows_parent_id_idx" ON "_pages_v_blocks_pricetable_2_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricetable_2_rows_locale_idx" ON "_pages_v_blocks_pricetable_2_rows" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricetable_2_order_idx" ON "_pages_v_blocks_pricetable_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricetable_2_parent_id_idx" ON "_pages_v_blocks_pricetable_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricetable_2_path_idx" ON "_pages_v_blocks_pricetable_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricetable_2_locale_idx" ON "_pages_v_blocks_pricetable_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_2_images_order_idx" ON "_pages_v_blocks_gallery_2_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_2_images_parent_id_idx" ON "_pages_v_blocks_gallery_2_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_2_images_locale_idx" ON "_pages_v_blocks_gallery_2_images" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_2_images_media_idx" ON "_pages_v_blocks_gallery_2_images" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_gallery_2_order_idx" ON "_pages_v_blocks_gallery_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_2_parent_id_idx" ON "_pages_v_blocks_gallery_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_2_path_idx" ON "_pages_v_blocks_gallery_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_2_locale_idx" ON "_pages_v_blocks_gallery_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_2_order_idx" ON "_pages_v_blocks_image_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_2_parent_id_idx" ON "_pages_v_blocks_image_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_2_path_idx" ON "_pages_v_blocks_image_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_2_locale_idx" ON "_pages_v_blocks_image_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_2_media_idx" ON "_pages_v_blocks_image_2" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_video_2_order_idx" ON "_pages_v_blocks_video_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_2_parent_id_idx" ON "_pages_v_blocks_video_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_2_path_idx" ON "_pages_v_blocks_video_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_2_locale_idx" ON "_pages_v_blocks_video_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_self_video_2_order_idx" ON "_pages_v_blocks_self_video_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_self_video_2_parent_id_idx" ON "_pages_v_blocks_self_video_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_self_video_2_path_idx" ON "_pages_v_blocks_self_video_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_self_video_2_locale_idx" ON "_pages_v_blocks_self_video_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_pair_2_order_idx" ON "_pages_v_blocks_image_pair_2" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_pair_2_parent_id_idx" ON "_pages_v_blocks_image_pair_2" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_pair_2_path_idx" ON "_pages_v_blocks_image_pair_2" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_pair_2_locale_idx" ON "_pages_v_blocks_image_pair_2" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_pair_2_left_left_media_idx" ON "_pages_v_blocks_image_pair_2" USING btree ("left_media_id");
  CREATE INDEX "_pages_v_blocks_image_pair_2_right_right_media_idx" ON "_pages_v_blocks_image_pair_2" USING btree ("right_media_id");
  CREATE INDEX "_pages_v_blocks_text_3_order_idx" ON "_pages_v_blocks_text_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_3_parent_id_idx" ON "_pages_v_blocks_text_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_3_path_idx" ON "_pages_v_blocks_text_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_3_locale_idx" ON "_pages_v_blocks_text_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_callout_3_stats_order_idx" ON "_pages_v_blocks_callout_3_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_3_stats_parent_id_idx" ON "_pages_v_blocks_callout_3_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_3_stats_locale_idx" ON "_pages_v_blocks_callout_3_stats" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_callout_3_order_idx" ON "_pages_v_blocks_callout_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_3_parent_id_idx" ON "_pages_v_blocks_callout_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_3_path_idx" ON "_pages_v_blocks_callout_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_callout_3_locale_idx" ON "_pages_v_blocks_callout_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_list_3_items_order_idx" ON "_pages_v_blocks_list_3_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_list_3_items_parent_id_idx" ON "_pages_v_blocks_list_3_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_list_3_items_locale_idx" ON "_pages_v_blocks_list_3_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_list_3_order_idx" ON "_pages_v_blocks_list_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_list_3_parent_id_idx" ON "_pages_v_blocks_list_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_list_3_path_idx" ON "_pages_v_blocks_list_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_list_3_locale_idx" ON "_pages_v_blocks_list_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cards_3_items_order_idx" ON "_pages_v_blocks_cards_3_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_3_items_parent_id_idx" ON "_pages_v_blocks_cards_3_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_3_items_locale_idx" ON "_pages_v_blocks_cards_3_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cards_3_order_idx" ON "_pages_v_blocks_cards_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_3_parent_id_idx" ON "_pages_v_blocks_cards_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_3_path_idx" ON "_pages_v_blocks_cards_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cards_3_locale_idx" ON "_pages_v_blocks_cards_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_3_items_order_idx" ON "_pages_v_blocks_steps_3_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_3_items_parent_id_idx" ON "_pages_v_blocks_steps_3_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_3_items_locale_idx" ON "_pages_v_blocks_steps_3_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_3_order_idx" ON "_pages_v_blocks_steps_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_3_parent_id_idx" ON "_pages_v_blocks_steps_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_3_path_idx" ON "_pages_v_blocks_steps_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_steps_3_locale_idx" ON "_pages_v_blocks_steps_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_3_rows_order_idx" ON "_pages_v_blocks_pricing_3_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_3_rows_parent_id_idx" ON "_pages_v_blocks_pricing_3_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_3_rows_locale_idx" ON "_pages_v_blocks_pricing_3_rows" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_3_order_idx" ON "_pages_v_blocks_pricing_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_3_parent_id_idx" ON "_pages_v_blocks_pricing_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_3_path_idx" ON "_pages_v_blocks_pricing_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricing_3_locale_idx" ON "_pages_v_blocks_pricing_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricetable_3_rows_order_idx" ON "_pages_v_blocks_pricetable_3_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricetable_3_rows_parent_id_idx" ON "_pages_v_blocks_pricetable_3_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricetable_3_rows_locale_idx" ON "_pages_v_blocks_pricetable_3_rows" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricetable_3_order_idx" ON "_pages_v_blocks_pricetable_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricetable_3_parent_id_idx" ON "_pages_v_blocks_pricetable_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricetable_3_path_idx" ON "_pages_v_blocks_pricetable_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricetable_3_locale_idx" ON "_pages_v_blocks_pricetable_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_3_images_order_idx" ON "_pages_v_blocks_gallery_3_images" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_3_images_parent_id_idx" ON "_pages_v_blocks_gallery_3_images" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_3_images_locale_idx" ON "_pages_v_blocks_gallery_3_images" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_3_images_media_idx" ON "_pages_v_blocks_gallery_3_images" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_gallery_3_order_idx" ON "_pages_v_blocks_gallery_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_3_parent_id_idx" ON "_pages_v_blocks_gallery_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_3_path_idx" ON "_pages_v_blocks_gallery_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_3_locale_idx" ON "_pages_v_blocks_gallery_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_3_order_idx" ON "_pages_v_blocks_image_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_3_parent_id_idx" ON "_pages_v_blocks_image_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_3_path_idx" ON "_pages_v_blocks_image_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_3_locale_idx" ON "_pages_v_blocks_image_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_3_media_idx" ON "_pages_v_blocks_image_3" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_video_3_order_idx" ON "_pages_v_blocks_video_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_3_parent_id_idx" ON "_pages_v_blocks_video_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_3_path_idx" ON "_pages_v_blocks_video_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_3_locale_idx" ON "_pages_v_blocks_video_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_self_video_3_order_idx" ON "_pages_v_blocks_self_video_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_self_video_3_parent_id_idx" ON "_pages_v_blocks_self_video_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_self_video_3_path_idx" ON "_pages_v_blocks_self_video_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_self_video_3_locale_idx" ON "_pages_v_blocks_self_video_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_pair_3_order_idx" ON "_pages_v_blocks_image_pair_3" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_pair_3_parent_id_idx" ON "_pages_v_blocks_image_pair_3" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_pair_3_path_idx" ON "_pages_v_blocks_image_pair_3" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_pair_3_locale_idx" ON "_pages_v_blocks_image_pair_3" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_pair_3_left_left_media_idx" ON "_pages_v_blocks_image_pair_3" USING btree ("left_media_id");
  CREATE INDEX "_pages_v_blocks_image_pair_3_right_right_media_idx" ON "_pages_v_blocks_image_pair_3" USING btree ("right_media_id");
  CREATE INDEX "_pages_v_blocks_twocol_order_idx" ON "_pages_v_blocks_twocol" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_twocol_parent_id_idx" ON "_pages_v_blocks_twocol" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_twocol_path_idx" ON "_pages_v_blocks_twocol" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_twocol_locale_idx" ON "_pages_v_blocks_twocol" USING btree ("_locale");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_tenant_idx" ON "_pages_v" USING btree ("version_tenant_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_blocks_text_order_idx" ON "_services_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_text_parent_id_idx" ON "_services_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_text_path_idx" ON "_services_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_text_locale_idx" ON "_services_v_blocks_text" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_callout_stats_order_idx" ON "_services_v_blocks_callout_stats" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_callout_stats_parent_id_idx" ON "_services_v_blocks_callout_stats" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_callout_stats_locale_idx" ON "_services_v_blocks_callout_stats" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_callout_order_idx" ON "_services_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_callout_parent_id_idx" ON "_services_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_callout_path_idx" ON "_services_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_callout_locale_idx" ON "_services_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_list_items_order_idx" ON "_services_v_blocks_list_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_list_items_parent_id_idx" ON "_services_v_blocks_list_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_list_items_locale_idx" ON "_services_v_blocks_list_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_list_order_idx" ON "_services_v_blocks_list" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_list_parent_id_idx" ON "_services_v_blocks_list" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_list_path_idx" ON "_services_v_blocks_list" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_list_locale_idx" ON "_services_v_blocks_list" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_cards_items_order_idx" ON "_services_v_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cards_items_parent_id_idx" ON "_services_v_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cards_items_locale_idx" ON "_services_v_blocks_cards_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_cards_order_idx" ON "_services_v_blocks_cards" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cards_parent_id_idx" ON "_services_v_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cards_path_idx" ON "_services_v_blocks_cards" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_cards_locale_idx" ON "_services_v_blocks_cards" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_steps_items_order_idx" ON "_services_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_steps_items_parent_id_idx" ON "_services_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_steps_items_locale_idx" ON "_services_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_steps_order_idx" ON "_services_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_steps_parent_id_idx" ON "_services_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_steps_path_idx" ON "_services_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_steps_locale_idx" ON "_services_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricing_rows_order_idx" ON "_services_v_blocks_pricing_rows" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricing_rows_parent_id_idx" ON "_services_v_blocks_pricing_rows" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricing_rows_locale_idx" ON "_services_v_blocks_pricing_rows" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricing_order_idx" ON "_services_v_blocks_pricing" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricing_parent_id_idx" ON "_services_v_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricing_path_idx" ON "_services_v_blocks_pricing" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_pricing_locale_idx" ON "_services_v_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricetable_rows_order_idx" ON "_services_v_blocks_pricetable_rows" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricetable_rows_parent_id_idx" ON "_services_v_blocks_pricetable_rows" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricetable_rows_locale_idx" ON "_services_v_blocks_pricetable_rows" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricetable_order_idx" ON "_services_v_blocks_pricetable" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricetable_parent_id_idx" ON "_services_v_blocks_pricetable" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricetable_path_idx" ON "_services_v_blocks_pricetable" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_pricetable_locale_idx" ON "_services_v_blocks_pricetable" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_gallery_images_order_idx" ON "_services_v_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_images_parent_id_idx" ON "_services_v_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_images_locale_idx" ON "_services_v_blocks_gallery_images" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_gallery_images_media_idx" ON "_services_v_blocks_gallery_images" USING btree ("media_id");
  CREATE INDEX "_services_v_blocks_gallery_order_idx" ON "_services_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_parent_id_idx" ON "_services_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_path_idx" ON "_services_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_gallery_locale_idx" ON "_services_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_order_idx" ON "_services_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_image_parent_id_idx" ON "_services_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_image_path_idx" ON "_services_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_image_locale_idx" ON "_services_v_blocks_image" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_media_idx" ON "_services_v_blocks_image" USING btree ("media_id");
  CREATE INDEX "_services_v_blocks_video_order_idx" ON "_services_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_video_parent_id_idx" ON "_services_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_video_path_idx" ON "_services_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_video_locale_idx" ON "_services_v_blocks_video" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_self_video_order_idx" ON "_services_v_blocks_self_video" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_self_video_parent_id_idx" ON "_services_v_blocks_self_video" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_self_video_path_idx" ON "_services_v_blocks_self_video" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_self_video_locale_idx" ON "_services_v_blocks_self_video" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_pair_order_idx" ON "_services_v_blocks_image_pair" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_image_pair_parent_id_idx" ON "_services_v_blocks_image_pair" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_image_pair_path_idx" ON "_services_v_blocks_image_pair" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_image_pair_locale_idx" ON "_services_v_blocks_image_pair" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_pair_left_left_media_idx" ON "_services_v_blocks_image_pair" USING btree ("left_media_id");
  CREATE INDEX "_services_v_blocks_image_pair_right_right_media_idx" ON "_services_v_blocks_image_pair" USING btree ("right_media_id");
  CREATE INDEX "_services_v_blocks_text_2_order_idx" ON "_services_v_blocks_text_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_text_2_parent_id_idx" ON "_services_v_blocks_text_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_text_2_path_idx" ON "_services_v_blocks_text_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_text_2_locale_idx" ON "_services_v_blocks_text_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_callout_2_stats_order_idx" ON "_services_v_blocks_callout_2_stats" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_callout_2_stats_parent_id_idx" ON "_services_v_blocks_callout_2_stats" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_callout_2_stats_locale_idx" ON "_services_v_blocks_callout_2_stats" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_callout_2_order_idx" ON "_services_v_blocks_callout_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_callout_2_parent_id_idx" ON "_services_v_blocks_callout_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_callout_2_path_idx" ON "_services_v_blocks_callout_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_callout_2_locale_idx" ON "_services_v_blocks_callout_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_list_2_items_order_idx" ON "_services_v_blocks_list_2_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_list_2_items_parent_id_idx" ON "_services_v_blocks_list_2_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_list_2_items_locale_idx" ON "_services_v_blocks_list_2_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_list_2_order_idx" ON "_services_v_blocks_list_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_list_2_parent_id_idx" ON "_services_v_blocks_list_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_list_2_path_idx" ON "_services_v_blocks_list_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_list_2_locale_idx" ON "_services_v_blocks_list_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_cards_2_items_order_idx" ON "_services_v_blocks_cards_2_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cards_2_items_parent_id_idx" ON "_services_v_blocks_cards_2_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cards_2_items_locale_idx" ON "_services_v_blocks_cards_2_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_cards_2_order_idx" ON "_services_v_blocks_cards_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cards_2_parent_id_idx" ON "_services_v_blocks_cards_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cards_2_path_idx" ON "_services_v_blocks_cards_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_cards_2_locale_idx" ON "_services_v_blocks_cards_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_steps_2_items_order_idx" ON "_services_v_blocks_steps_2_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_steps_2_items_parent_id_idx" ON "_services_v_blocks_steps_2_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_steps_2_items_locale_idx" ON "_services_v_blocks_steps_2_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_steps_2_order_idx" ON "_services_v_blocks_steps_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_steps_2_parent_id_idx" ON "_services_v_blocks_steps_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_steps_2_path_idx" ON "_services_v_blocks_steps_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_steps_2_locale_idx" ON "_services_v_blocks_steps_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricing_2_rows_order_idx" ON "_services_v_blocks_pricing_2_rows" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricing_2_rows_parent_id_idx" ON "_services_v_blocks_pricing_2_rows" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricing_2_rows_locale_idx" ON "_services_v_blocks_pricing_2_rows" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricing_2_order_idx" ON "_services_v_blocks_pricing_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricing_2_parent_id_idx" ON "_services_v_blocks_pricing_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricing_2_path_idx" ON "_services_v_blocks_pricing_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_pricing_2_locale_idx" ON "_services_v_blocks_pricing_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricetable_2_rows_order_idx" ON "_services_v_blocks_pricetable_2_rows" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricetable_2_rows_parent_id_idx" ON "_services_v_blocks_pricetable_2_rows" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricetable_2_rows_locale_idx" ON "_services_v_blocks_pricetable_2_rows" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricetable_2_order_idx" ON "_services_v_blocks_pricetable_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricetable_2_parent_id_idx" ON "_services_v_blocks_pricetable_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricetable_2_path_idx" ON "_services_v_blocks_pricetable_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_pricetable_2_locale_idx" ON "_services_v_blocks_pricetable_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_gallery_2_images_order_idx" ON "_services_v_blocks_gallery_2_images" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_2_images_parent_id_idx" ON "_services_v_blocks_gallery_2_images" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_2_images_locale_idx" ON "_services_v_blocks_gallery_2_images" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_gallery_2_images_media_idx" ON "_services_v_blocks_gallery_2_images" USING btree ("media_id");
  CREATE INDEX "_services_v_blocks_gallery_2_order_idx" ON "_services_v_blocks_gallery_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_2_parent_id_idx" ON "_services_v_blocks_gallery_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_2_path_idx" ON "_services_v_blocks_gallery_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_gallery_2_locale_idx" ON "_services_v_blocks_gallery_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_2_order_idx" ON "_services_v_blocks_image_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_image_2_parent_id_idx" ON "_services_v_blocks_image_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_image_2_path_idx" ON "_services_v_blocks_image_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_image_2_locale_idx" ON "_services_v_blocks_image_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_2_media_idx" ON "_services_v_blocks_image_2" USING btree ("media_id");
  CREATE INDEX "_services_v_blocks_video_2_order_idx" ON "_services_v_blocks_video_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_video_2_parent_id_idx" ON "_services_v_blocks_video_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_video_2_path_idx" ON "_services_v_blocks_video_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_video_2_locale_idx" ON "_services_v_blocks_video_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_self_video_2_order_idx" ON "_services_v_blocks_self_video_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_self_video_2_parent_id_idx" ON "_services_v_blocks_self_video_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_self_video_2_path_idx" ON "_services_v_blocks_self_video_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_self_video_2_locale_idx" ON "_services_v_blocks_self_video_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_pair_2_order_idx" ON "_services_v_blocks_image_pair_2" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_image_pair_2_parent_id_idx" ON "_services_v_blocks_image_pair_2" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_image_pair_2_path_idx" ON "_services_v_blocks_image_pair_2" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_image_pair_2_locale_idx" ON "_services_v_blocks_image_pair_2" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_pair_2_left_left_media_idx" ON "_services_v_blocks_image_pair_2" USING btree ("left_media_id");
  CREATE INDEX "_services_v_blocks_image_pair_2_right_right_media_idx" ON "_services_v_blocks_image_pair_2" USING btree ("right_media_id");
  CREATE INDEX "_services_v_blocks_text_3_order_idx" ON "_services_v_blocks_text_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_text_3_parent_id_idx" ON "_services_v_blocks_text_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_text_3_path_idx" ON "_services_v_blocks_text_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_text_3_locale_idx" ON "_services_v_blocks_text_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_callout_3_stats_order_idx" ON "_services_v_blocks_callout_3_stats" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_callout_3_stats_parent_id_idx" ON "_services_v_blocks_callout_3_stats" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_callout_3_stats_locale_idx" ON "_services_v_blocks_callout_3_stats" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_callout_3_order_idx" ON "_services_v_blocks_callout_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_callout_3_parent_id_idx" ON "_services_v_blocks_callout_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_callout_3_path_idx" ON "_services_v_blocks_callout_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_callout_3_locale_idx" ON "_services_v_blocks_callout_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_list_3_items_order_idx" ON "_services_v_blocks_list_3_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_list_3_items_parent_id_idx" ON "_services_v_blocks_list_3_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_list_3_items_locale_idx" ON "_services_v_blocks_list_3_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_list_3_order_idx" ON "_services_v_blocks_list_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_list_3_parent_id_idx" ON "_services_v_blocks_list_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_list_3_path_idx" ON "_services_v_blocks_list_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_list_3_locale_idx" ON "_services_v_blocks_list_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_cards_3_items_order_idx" ON "_services_v_blocks_cards_3_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cards_3_items_parent_id_idx" ON "_services_v_blocks_cards_3_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cards_3_items_locale_idx" ON "_services_v_blocks_cards_3_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_cards_3_order_idx" ON "_services_v_blocks_cards_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cards_3_parent_id_idx" ON "_services_v_blocks_cards_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cards_3_path_idx" ON "_services_v_blocks_cards_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_cards_3_locale_idx" ON "_services_v_blocks_cards_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_steps_3_items_order_idx" ON "_services_v_blocks_steps_3_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_steps_3_items_parent_id_idx" ON "_services_v_blocks_steps_3_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_steps_3_items_locale_idx" ON "_services_v_blocks_steps_3_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_steps_3_order_idx" ON "_services_v_blocks_steps_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_steps_3_parent_id_idx" ON "_services_v_blocks_steps_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_steps_3_path_idx" ON "_services_v_blocks_steps_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_steps_3_locale_idx" ON "_services_v_blocks_steps_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricing_3_rows_order_idx" ON "_services_v_blocks_pricing_3_rows" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricing_3_rows_parent_id_idx" ON "_services_v_blocks_pricing_3_rows" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricing_3_rows_locale_idx" ON "_services_v_blocks_pricing_3_rows" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricing_3_order_idx" ON "_services_v_blocks_pricing_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricing_3_parent_id_idx" ON "_services_v_blocks_pricing_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricing_3_path_idx" ON "_services_v_blocks_pricing_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_pricing_3_locale_idx" ON "_services_v_blocks_pricing_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricetable_3_rows_order_idx" ON "_services_v_blocks_pricetable_3_rows" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricetable_3_rows_parent_id_idx" ON "_services_v_blocks_pricetable_3_rows" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricetable_3_rows_locale_idx" ON "_services_v_blocks_pricetable_3_rows" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_pricetable_3_order_idx" ON "_services_v_blocks_pricetable_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_pricetable_3_parent_id_idx" ON "_services_v_blocks_pricetable_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_pricetable_3_path_idx" ON "_services_v_blocks_pricetable_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_pricetable_3_locale_idx" ON "_services_v_blocks_pricetable_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_gallery_3_images_order_idx" ON "_services_v_blocks_gallery_3_images" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_3_images_parent_id_idx" ON "_services_v_blocks_gallery_3_images" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_3_images_locale_idx" ON "_services_v_blocks_gallery_3_images" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_gallery_3_images_media_idx" ON "_services_v_blocks_gallery_3_images" USING btree ("media_id");
  CREATE INDEX "_services_v_blocks_gallery_3_order_idx" ON "_services_v_blocks_gallery_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_3_parent_id_idx" ON "_services_v_blocks_gallery_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_3_path_idx" ON "_services_v_blocks_gallery_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_gallery_3_locale_idx" ON "_services_v_blocks_gallery_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_3_order_idx" ON "_services_v_blocks_image_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_image_3_parent_id_idx" ON "_services_v_blocks_image_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_image_3_path_idx" ON "_services_v_blocks_image_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_image_3_locale_idx" ON "_services_v_blocks_image_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_3_media_idx" ON "_services_v_blocks_image_3" USING btree ("media_id");
  CREATE INDEX "_services_v_blocks_video_3_order_idx" ON "_services_v_blocks_video_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_video_3_parent_id_idx" ON "_services_v_blocks_video_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_video_3_path_idx" ON "_services_v_blocks_video_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_video_3_locale_idx" ON "_services_v_blocks_video_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_self_video_3_order_idx" ON "_services_v_blocks_self_video_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_self_video_3_parent_id_idx" ON "_services_v_blocks_self_video_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_self_video_3_path_idx" ON "_services_v_blocks_self_video_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_self_video_3_locale_idx" ON "_services_v_blocks_self_video_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_pair_3_order_idx" ON "_services_v_blocks_image_pair_3" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_image_pair_3_parent_id_idx" ON "_services_v_blocks_image_pair_3" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_image_pair_3_path_idx" ON "_services_v_blocks_image_pair_3" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_image_pair_3_locale_idx" ON "_services_v_blocks_image_pair_3" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_image_pair_3_left_left_media_idx" ON "_services_v_blocks_image_pair_3" USING btree ("left_media_id");
  CREATE INDEX "_services_v_blocks_image_pair_3_right_right_media_idx" ON "_services_v_blocks_image_pair_3" USING btree ("right_media_id");
  CREATE INDEX "_services_v_blocks_twocol_order_idx" ON "_services_v_blocks_twocol" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_twocol_parent_id_idx" ON "_services_v_blocks_twocol" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_twocol_path_idx" ON "_services_v_blocks_twocol" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_twocol_locale_idx" ON "_services_v_blocks_twocol" USING btree ("_locale");
  CREATE INDEX "_services_v_version_features_order_idx" ON "_services_v_version_features" USING btree ("_order");
  CREATE INDEX "_services_v_version_features_parent_id_idx" ON "_services_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_features_locale_idx" ON "_services_v_version_features" USING btree ("_locale");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_tenant_idx" ON "_services_v" USING btree ("version_tenant_id");
  CREATE INDEX "_services_v_version_version_source_id_idx" ON "_services_v" USING btree ("version_source_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_doctors_v_version_specialty_order_idx" ON "_doctors_v_version_specialty" USING btree ("_order");
  CREATE INDEX "_doctors_v_version_specialty_parent_id_idx" ON "_doctors_v_version_specialty" USING btree ("_parent_id");
  CREATE INDEX "_doctors_v_version_specialty_locale_idx" ON "_doctors_v_version_specialty" USING btree ("_locale");
  CREATE INDEX "_doctors_v_version_languages_order_idx" ON "_doctors_v_version_languages" USING btree ("_order");
  CREATE INDEX "_doctors_v_version_languages_parent_id_idx" ON "_doctors_v_version_languages" USING btree ("_parent_id");
  CREATE INDEX "_doctors_v_version_languages_locale_idx" ON "_doctors_v_version_languages" USING btree ("_locale");
  CREATE INDEX "_doctors_v_parent_idx" ON "_doctors_v" USING btree ("parent_id");
  CREATE INDEX "_doctors_v_version_version_tenant_idx" ON "_doctors_v" USING btree ("version_tenant_id");
  CREATE INDEX "_doctors_v_version_version_source_id_idx" ON "_doctors_v" USING btree ("version_source_id");
  CREATE INDEX "_doctors_v_version_version_department_idx" ON "_doctors_v" USING btree ("version_department");
  CREATE INDEX "_doctors_v_version_version_updated_at_idx" ON "_doctors_v" USING btree ("version_updated_at");
  CREATE INDEX "_doctors_v_version_version_created_at_idx" ON "_doctors_v" USING btree ("version_created_at");
  CREATE INDEX "_doctors_v_version_version__status_idx" ON "_doctors_v" USING btree ("version__status");
  CREATE INDEX "_doctors_v_created_at_idx" ON "_doctors_v" USING btree ("created_at");
  CREATE INDEX "_doctors_v_updated_at_idx" ON "_doctors_v" USING btree ("updated_at");
  CREATE INDEX "_doctors_v_snapshot_idx" ON "_doctors_v" USING btree ("snapshot");
  CREATE INDEX "_doctors_v_published_locale_idx" ON "_doctors_v" USING btree ("published_locale");
  CREATE INDEX "_doctors_v_latest_idx" ON "_doctors_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_doctors_v_locales_locale_parent_id_unique" ON "_doctors_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_technology_v_blocks_text_order_idx" ON "_technology_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_text_parent_id_idx" ON "_technology_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_text_path_idx" ON "_technology_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_text_locale_idx" ON "_technology_v_blocks_text" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_callout_stats_order_idx" ON "_technology_v_blocks_callout_stats" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_callout_stats_parent_id_idx" ON "_technology_v_blocks_callout_stats" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_callout_stats_locale_idx" ON "_technology_v_blocks_callout_stats" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_callout_order_idx" ON "_technology_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_callout_parent_id_idx" ON "_technology_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_callout_path_idx" ON "_technology_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_callout_locale_idx" ON "_technology_v_blocks_callout" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_list_items_order_idx" ON "_technology_v_blocks_list_items" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_list_items_parent_id_idx" ON "_technology_v_blocks_list_items" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_list_items_locale_idx" ON "_technology_v_blocks_list_items" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_list_order_idx" ON "_technology_v_blocks_list" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_list_parent_id_idx" ON "_technology_v_blocks_list" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_list_path_idx" ON "_technology_v_blocks_list" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_list_locale_idx" ON "_technology_v_blocks_list" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_cards_items_order_idx" ON "_technology_v_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_cards_items_parent_id_idx" ON "_technology_v_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_cards_items_locale_idx" ON "_technology_v_blocks_cards_items" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_cards_order_idx" ON "_technology_v_blocks_cards" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_cards_parent_id_idx" ON "_technology_v_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_cards_path_idx" ON "_technology_v_blocks_cards" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_cards_locale_idx" ON "_technology_v_blocks_cards" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_steps_items_order_idx" ON "_technology_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_steps_items_parent_id_idx" ON "_technology_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_steps_items_locale_idx" ON "_technology_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_steps_order_idx" ON "_technology_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_steps_parent_id_idx" ON "_technology_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_steps_path_idx" ON "_technology_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_steps_locale_idx" ON "_technology_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricing_rows_order_idx" ON "_technology_v_blocks_pricing_rows" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricing_rows_parent_id_idx" ON "_technology_v_blocks_pricing_rows" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricing_rows_locale_idx" ON "_technology_v_blocks_pricing_rows" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricing_order_idx" ON "_technology_v_blocks_pricing" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricing_parent_id_idx" ON "_technology_v_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricing_path_idx" ON "_technology_v_blocks_pricing" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_pricing_locale_idx" ON "_technology_v_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricetable_rows_order_idx" ON "_technology_v_blocks_pricetable_rows" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricetable_rows_parent_id_idx" ON "_technology_v_blocks_pricetable_rows" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricetable_rows_locale_idx" ON "_technology_v_blocks_pricetable_rows" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricetable_order_idx" ON "_technology_v_blocks_pricetable" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricetable_parent_id_idx" ON "_technology_v_blocks_pricetable" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricetable_path_idx" ON "_technology_v_blocks_pricetable" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_pricetable_locale_idx" ON "_technology_v_blocks_pricetable" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_gallery_images_order_idx" ON "_technology_v_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_gallery_images_parent_id_idx" ON "_technology_v_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_gallery_images_locale_idx" ON "_technology_v_blocks_gallery_images" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_gallery_images_media_idx" ON "_technology_v_blocks_gallery_images" USING btree ("media_id");
  CREATE INDEX "_technology_v_blocks_gallery_order_idx" ON "_technology_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_gallery_parent_id_idx" ON "_technology_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_gallery_path_idx" ON "_technology_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_gallery_locale_idx" ON "_technology_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_order_idx" ON "_technology_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_image_parent_id_idx" ON "_technology_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_image_path_idx" ON "_technology_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_image_locale_idx" ON "_technology_v_blocks_image" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_media_idx" ON "_technology_v_blocks_image" USING btree ("media_id");
  CREATE INDEX "_technology_v_blocks_video_order_idx" ON "_technology_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_video_parent_id_idx" ON "_technology_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_video_path_idx" ON "_technology_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_video_locale_idx" ON "_technology_v_blocks_video" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_self_video_order_idx" ON "_technology_v_blocks_self_video" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_self_video_parent_id_idx" ON "_technology_v_blocks_self_video" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_self_video_path_idx" ON "_technology_v_blocks_self_video" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_self_video_locale_idx" ON "_technology_v_blocks_self_video" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_pair_order_idx" ON "_technology_v_blocks_image_pair" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_image_pair_parent_id_idx" ON "_technology_v_blocks_image_pair" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_image_pair_path_idx" ON "_technology_v_blocks_image_pair" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_image_pair_locale_idx" ON "_technology_v_blocks_image_pair" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_pair_left_left_media_idx" ON "_technology_v_blocks_image_pair" USING btree ("left_media_id");
  CREATE INDEX "_technology_v_blocks_image_pair_right_right_media_idx" ON "_technology_v_blocks_image_pair" USING btree ("right_media_id");
  CREATE INDEX "_technology_v_blocks_text_2_order_idx" ON "_technology_v_blocks_text_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_text_2_parent_id_idx" ON "_technology_v_blocks_text_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_text_2_path_idx" ON "_technology_v_blocks_text_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_text_2_locale_idx" ON "_technology_v_blocks_text_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_callout_2_stats_order_idx" ON "_technology_v_blocks_callout_2_stats" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_callout_2_stats_parent_id_idx" ON "_technology_v_blocks_callout_2_stats" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_callout_2_stats_locale_idx" ON "_technology_v_blocks_callout_2_stats" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_callout_2_order_idx" ON "_technology_v_blocks_callout_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_callout_2_parent_id_idx" ON "_technology_v_blocks_callout_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_callout_2_path_idx" ON "_technology_v_blocks_callout_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_callout_2_locale_idx" ON "_technology_v_blocks_callout_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_list_2_items_order_idx" ON "_technology_v_blocks_list_2_items" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_list_2_items_parent_id_idx" ON "_technology_v_blocks_list_2_items" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_list_2_items_locale_idx" ON "_technology_v_blocks_list_2_items" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_list_2_order_idx" ON "_technology_v_blocks_list_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_list_2_parent_id_idx" ON "_technology_v_blocks_list_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_list_2_path_idx" ON "_technology_v_blocks_list_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_list_2_locale_idx" ON "_technology_v_blocks_list_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_cards_2_items_order_idx" ON "_technology_v_blocks_cards_2_items" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_cards_2_items_parent_id_idx" ON "_technology_v_blocks_cards_2_items" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_cards_2_items_locale_idx" ON "_technology_v_blocks_cards_2_items" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_cards_2_order_idx" ON "_technology_v_blocks_cards_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_cards_2_parent_id_idx" ON "_technology_v_blocks_cards_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_cards_2_path_idx" ON "_technology_v_blocks_cards_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_cards_2_locale_idx" ON "_technology_v_blocks_cards_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_steps_2_items_order_idx" ON "_technology_v_blocks_steps_2_items" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_steps_2_items_parent_id_idx" ON "_technology_v_blocks_steps_2_items" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_steps_2_items_locale_idx" ON "_technology_v_blocks_steps_2_items" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_steps_2_order_idx" ON "_technology_v_blocks_steps_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_steps_2_parent_id_idx" ON "_technology_v_blocks_steps_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_steps_2_path_idx" ON "_technology_v_blocks_steps_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_steps_2_locale_idx" ON "_technology_v_blocks_steps_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricing_2_rows_order_idx" ON "_technology_v_blocks_pricing_2_rows" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricing_2_rows_parent_id_idx" ON "_technology_v_blocks_pricing_2_rows" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricing_2_rows_locale_idx" ON "_technology_v_blocks_pricing_2_rows" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricing_2_order_idx" ON "_technology_v_blocks_pricing_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricing_2_parent_id_idx" ON "_technology_v_blocks_pricing_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricing_2_path_idx" ON "_technology_v_blocks_pricing_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_pricing_2_locale_idx" ON "_technology_v_blocks_pricing_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricetable_2_rows_order_idx" ON "_technology_v_blocks_pricetable_2_rows" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricetable_2_rows_parent_id_idx" ON "_technology_v_blocks_pricetable_2_rows" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricetable_2_rows_locale_idx" ON "_technology_v_blocks_pricetable_2_rows" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricetable_2_order_idx" ON "_technology_v_blocks_pricetable_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricetable_2_parent_id_idx" ON "_technology_v_blocks_pricetable_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricetable_2_path_idx" ON "_technology_v_blocks_pricetable_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_pricetable_2_locale_idx" ON "_technology_v_blocks_pricetable_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_gallery_2_images_order_idx" ON "_technology_v_blocks_gallery_2_images" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_gallery_2_images_parent_id_idx" ON "_technology_v_blocks_gallery_2_images" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_gallery_2_images_locale_idx" ON "_technology_v_blocks_gallery_2_images" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_gallery_2_images_media_idx" ON "_technology_v_blocks_gallery_2_images" USING btree ("media_id");
  CREATE INDEX "_technology_v_blocks_gallery_2_order_idx" ON "_technology_v_blocks_gallery_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_gallery_2_parent_id_idx" ON "_technology_v_blocks_gallery_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_gallery_2_path_idx" ON "_technology_v_blocks_gallery_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_gallery_2_locale_idx" ON "_technology_v_blocks_gallery_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_2_order_idx" ON "_technology_v_blocks_image_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_image_2_parent_id_idx" ON "_technology_v_blocks_image_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_image_2_path_idx" ON "_technology_v_blocks_image_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_image_2_locale_idx" ON "_technology_v_blocks_image_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_2_media_idx" ON "_technology_v_blocks_image_2" USING btree ("media_id");
  CREATE INDEX "_technology_v_blocks_video_2_order_idx" ON "_technology_v_blocks_video_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_video_2_parent_id_idx" ON "_technology_v_blocks_video_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_video_2_path_idx" ON "_technology_v_blocks_video_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_video_2_locale_idx" ON "_technology_v_blocks_video_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_self_video_2_order_idx" ON "_technology_v_blocks_self_video_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_self_video_2_parent_id_idx" ON "_technology_v_blocks_self_video_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_self_video_2_path_idx" ON "_technology_v_blocks_self_video_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_self_video_2_locale_idx" ON "_technology_v_blocks_self_video_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_pair_2_order_idx" ON "_technology_v_blocks_image_pair_2" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_image_pair_2_parent_id_idx" ON "_technology_v_blocks_image_pair_2" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_image_pair_2_path_idx" ON "_technology_v_blocks_image_pair_2" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_image_pair_2_locale_idx" ON "_technology_v_blocks_image_pair_2" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_pair_2_left_left_media_idx" ON "_technology_v_blocks_image_pair_2" USING btree ("left_media_id");
  CREATE INDEX "_technology_v_blocks_image_pair_2_right_right_media_idx" ON "_technology_v_blocks_image_pair_2" USING btree ("right_media_id");
  CREATE INDEX "_technology_v_blocks_text_3_order_idx" ON "_technology_v_blocks_text_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_text_3_parent_id_idx" ON "_technology_v_blocks_text_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_text_3_path_idx" ON "_technology_v_blocks_text_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_text_3_locale_idx" ON "_technology_v_blocks_text_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_callout_3_stats_order_idx" ON "_technology_v_blocks_callout_3_stats" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_callout_3_stats_parent_id_idx" ON "_technology_v_blocks_callout_3_stats" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_callout_3_stats_locale_idx" ON "_technology_v_blocks_callout_3_stats" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_callout_3_order_idx" ON "_technology_v_blocks_callout_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_callout_3_parent_id_idx" ON "_technology_v_blocks_callout_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_callout_3_path_idx" ON "_technology_v_blocks_callout_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_callout_3_locale_idx" ON "_technology_v_blocks_callout_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_list_3_items_order_idx" ON "_technology_v_blocks_list_3_items" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_list_3_items_parent_id_idx" ON "_technology_v_blocks_list_3_items" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_list_3_items_locale_idx" ON "_technology_v_blocks_list_3_items" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_list_3_order_idx" ON "_technology_v_blocks_list_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_list_3_parent_id_idx" ON "_technology_v_blocks_list_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_list_3_path_idx" ON "_technology_v_blocks_list_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_list_3_locale_idx" ON "_technology_v_blocks_list_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_cards_3_items_order_idx" ON "_technology_v_blocks_cards_3_items" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_cards_3_items_parent_id_idx" ON "_technology_v_blocks_cards_3_items" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_cards_3_items_locale_idx" ON "_technology_v_blocks_cards_3_items" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_cards_3_order_idx" ON "_technology_v_blocks_cards_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_cards_3_parent_id_idx" ON "_technology_v_blocks_cards_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_cards_3_path_idx" ON "_technology_v_blocks_cards_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_cards_3_locale_idx" ON "_technology_v_blocks_cards_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_steps_3_items_order_idx" ON "_technology_v_blocks_steps_3_items" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_steps_3_items_parent_id_idx" ON "_technology_v_blocks_steps_3_items" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_steps_3_items_locale_idx" ON "_technology_v_blocks_steps_3_items" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_steps_3_order_idx" ON "_technology_v_blocks_steps_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_steps_3_parent_id_idx" ON "_technology_v_blocks_steps_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_steps_3_path_idx" ON "_technology_v_blocks_steps_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_steps_3_locale_idx" ON "_technology_v_blocks_steps_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricing_3_rows_order_idx" ON "_technology_v_blocks_pricing_3_rows" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricing_3_rows_parent_id_idx" ON "_technology_v_blocks_pricing_3_rows" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricing_3_rows_locale_idx" ON "_technology_v_blocks_pricing_3_rows" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricing_3_order_idx" ON "_technology_v_blocks_pricing_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricing_3_parent_id_idx" ON "_technology_v_blocks_pricing_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricing_3_path_idx" ON "_technology_v_blocks_pricing_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_pricing_3_locale_idx" ON "_technology_v_blocks_pricing_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricetable_3_rows_order_idx" ON "_technology_v_blocks_pricetable_3_rows" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricetable_3_rows_parent_id_idx" ON "_technology_v_blocks_pricetable_3_rows" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricetable_3_rows_locale_idx" ON "_technology_v_blocks_pricetable_3_rows" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_pricetable_3_order_idx" ON "_technology_v_blocks_pricetable_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_pricetable_3_parent_id_idx" ON "_technology_v_blocks_pricetable_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_pricetable_3_path_idx" ON "_technology_v_blocks_pricetable_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_pricetable_3_locale_idx" ON "_technology_v_blocks_pricetable_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_gallery_3_images_order_idx" ON "_technology_v_blocks_gallery_3_images" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_gallery_3_images_parent_id_idx" ON "_technology_v_blocks_gallery_3_images" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_gallery_3_images_locale_idx" ON "_technology_v_blocks_gallery_3_images" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_gallery_3_images_media_idx" ON "_technology_v_blocks_gallery_3_images" USING btree ("media_id");
  CREATE INDEX "_technology_v_blocks_gallery_3_order_idx" ON "_technology_v_blocks_gallery_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_gallery_3_parent_id_idx" ON "_technology_v_blocks_gallery_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_gallery_3_path_idx" ON "_technology_v_blocks_gallery_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_gallery_3_locale_idx" ON "_technology_v_blocks_gallery_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_3_order_idx" ON "_technology_v_blocks_image_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_image_3_parent_id_idx" ON "_technology_v_blocks_image_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_image_3_path_idx" ON "_technology_v_blocks_image_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_image_3_locale_idx" ON "_technology_v_blocks_image_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_3_media_idx" ON "_technology_v_blocks_image_3" USING btree ("media_id");
  CREATE INDEX "_technology_v_blocks_video_3_order_idx" ON "_technology_v_blocks_video_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_video_3_parent_id_idx" ON "_technology_v_blocks_video_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_video_3_path_idx" ON "_technology_v_blocks_video_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_video_3_locale_idx" ON "_technology_v_blocks_video_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_self_video_3_order_idx" ON "_technology_v_blocks_self_video_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_self_video_3_parent_id_idx" ON "_technology_v_blocks_self_video_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_self_video_3_path_idx" ON "_technology_v_blocks_self_video_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_self_video_3_locale_idx" ON "_technology_v_blocks_self_video_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_pair_3_order_idx" ON "_technology_v_blocks_image_pair_3" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_image_pair_3_parent_id_idx" ON "_technology_v_blocks_image_pair_3" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_image_pair_3_path_idx" ON "_technology_v_blocks_image_pair_3" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_image_pair_3_locale_idx" ON "_technology_v_blocks_image_pair_3" USING btree ("_locale");
  CREATE INDEX "_technology_v_blocks_image_pair_3_left_left_media_idx" ON "_technology_v_blocks_image_pair_3" USING btree ("left_media_id");
  CREATE INDEX "_technology_v_blocks_image_pair_3_right_right_media_idx" ON "_technology_v_blocks_image_pair_3" USING btree ("right_media_id");
  CREATE INDEX "_technology_v_blocks_twocol_order_idx" ON "_technology_v_blocks_twocol" USING btree ("_order");
  CREATE INDEX "_technology_v_blocks_twocol_parent_id_idx" ON "_technology_v_blocks_twocol" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_blocks_twocol_path_idx" ON "_technology_v_blocks_twocol" USING btree ("_path");
  CREATE INDEX "_technology_v_blocks_twocol_locale_idx" ON "_technology_v_blocks_twocol" USING btree ("_locale");
  CREATE INDEX "_technology_v_version_highlights_order_idx" ON "_technology_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_technology_v_version_highlights_parent_id_idx" ON "_technology_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_technology_v_version_highlights_locale_idx" ON "_technology_v_version_highlights" USING btree ("_locale");
  CREATE INDEX "_technology_v_parent_idx" ON "_technology_v" USING btree ("parent_id");
  CREATE INDEX "_technology_v_version_version_tenant_idx" ON "_technology_v" USING btree ("version_tenant_id");
  CREATE INDEX "_technology_v_version_version_source_id_idx" ON "_technology_v" USING btree ("version_source_id");
  CREATE INDEX "_technology_v_version_version_slug_idx" ON "_technology_v" USING btree ("version_slug");
  CREATE INDEX "_technology_v_version_version_updated_at_idx" ON "_technology_v" USING btree ("version_updated_at");
  CREATE INDEX "_technology_v_version_version_created_at_idx" ON "_technology_v" USING btree ("version_created_at");
  CREATE INDEX "_technology_v_version_version__status_idx" ON "_technology_v" USING btree ("version__status");
  CREATE INDEX "_technology_v_created_at_idx" ON "_technology_v" USING btree ("created_at");
  CREATE INDEX "_technology_v_updated_at_idx" ON "_technology_v" USING btree ("updated_at");
  CREATE INDEX "_technology_v_snapshot_idx" ON "_technology_v" USING btree ("snapshot");
  CREATE INDEX "_technology_v_published_locale_idx" ON "_technology_v" USING btree ("published_locale");
  CREATE INDEX "_technology_v_latest_idx" ON "_technology_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_technology_v_locales_locale_parent_id_unique" ON "_technology_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pricing_categories_v_parent_idx" ON "_pricing_categories_v" USING btree ("parent_id");
  CREATE INDEX "_pricing_categories_v_version_version_tenant_idx" ON "_pricing_categories_v" USING btree ("version_tenant_id");
  CREATE INDEX "_pricing_categories_v_version_version_source_id_idx" ON "_pricing_categories_v" USING btree ("version_source_id");
  CREATE INDEX "_pricing_categories_v_version_version_updated_at_idx" ON "_pricing_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_pricing_categories_v_version_version_created_at_idx" ON "_pricing_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_pricing_categories_v_version_version__status_idx" ON "_pricing_categories_v" USING btree ("version__status");
  CREATE INDEX "_pricing_categories_v_created_at_idx" ON "_pricing_categories_v" USING btree ("created_at");
  CREATE INDEX "_pricing_categories_v_updated_at_idx" ON "_pricing_categories_v" USING btree ("updated_at");
  CREATE INDEX "_pricing_categories_v_snapshot_idx" ON "_pricing_categories_v" USING btree ("snapshot");
  CREATE INDEX "_pricing_categories_v_published_locale_idx" ON "_pricing_categories_v" USING btree ("published_locale");
  CREATE INDEX "_pricing_categories_v_latest_idx" ON "_pricing_categories_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pricing_categories_v_locales_locale_parent_id_unique" ON "_pricing_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pricing_items_v_parent_idx" ON "_pricing_items_v" USING btree ("parent_id");
  CREATE INDEX "_pricing_items_v_version_version_tenant_idx" ON "_pricing_items_v" USING btree ("version_tenant_id");
  CREATE INDEX "_pricing_items_v_version_version_source_id_idx" ON "_pricing_items_v" USING btree ("version_source_id");
  CREATE INDEX "_pricing_items_v_version_version_category_idx" ON "_pricing_items_v" USING btree ("version_category_id");
  CREATE INDEX "_pricing_items_v_version_version_updated_at_idx" ON "_pricing_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_pricing_items_v_version_version_created_at_idx" ON "_pricing_items_v" USING btree ("version_created_at");
  CREATE INDEX "_pricing_items_v_version_version__status_idx" ON "_pricing_items_v" USING btree ("version__status");
  CREATE INDEX "_pricing_items_v_created_at_idx" ON "_pricing_items_v" USING btree ("created_at");
  CREATE INDEX "_pricing_items_v_updated_at_idx" ON "_pricing_items_v" USING btree ("updated_at");
  CREATE INDEX "_pricing_items_v_snapshot_idx" ON "_pricing_items_v" USING btree ("snapshot");
  CREATE INDEX "_pricing_items_v_published_locale_idx" ON "_pricing_items_v" USING btree ("published_locale");
  CREATE INDEX "_pricing_items_v_latest_idx" ON "_pricing_items_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pricing_items_v_locales_locale_parent_id_unique" ON "_pricing_items_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pricing_comparison_sets_v_parent_idx" ON "_pricing_comparison_sets_v" USING btree ("parent_id");
  CREATE INDEX "_pricing_comparison_sets_v_version_version_tenant_idx" ON "_pricing_comparison_sets_v" USING btree ("version_tenant_id");
  CREATE INDEX "_pricing_comparison_sets_v_version_version_source_id_idx" ON "_pricing_comparison_sets_v" USING btree ("version_source_id");
  CREATE INDEX "_pricing_comparison_sets_v_version_version_slug_idx" ON "_pricing_comparison_sets_v" USING btree ("version_slug");
  CREATE INDEX "_pricing_comparison_sets_v_version_version_updated_at_idx" ON "_pricing_comparison_sets_v" USING btree ("version_updated_at");
  CREATE INDEX "_pricing_comparison_sets_v_version_version_created_at_idx" ON "_pricing_comparison_sets_v" USING btree ("version_created_at");
  CREATE INDEX "_pricing_comparison_sets_v_version_version__status_idx" ON "_pricing_comparison_sets_v" USING btree ("version__status");
  CREATE INDEX "_pricing_comparison_sets_v_created_at_idx" ON "_pricing_comparison_sets_v" USING btree ("created_at");
  CREATE INDEX "_pricing_comparison_sets_v_updated_at_idx" ON "_pricing_comparison_sets_v" USING btree ("updated_at");
  CREATE INDEX "_pricing_comparison_sets_v_snapshot_idx" ON "_pricing_comparison_sets_v" USING btree ("snapshot");
  CREATE INDEX "_pricing_comparison_sets_v_published_locale_idx" ON "_pricing_comparison_sets_v" USING btree ("published_locale");
  CREATE INDEX "_pricing_comparison_sets_v_latest_idx" ON "_pricing_comparison_sets_v" USING btree ("latest");
  CREATE INDEX "_pricing_comparison_rows_v_parent_idx" ON "_pricing_comparison_rows_v" USING btree ("parent_id");
  CREATE INDEX "_pricing_comparison_rows_v_version_version_tenant_idx" ON "_pricing_comparison_rows_v" USING btree ("version_tenant_id");
  CREATE INDEX "_pricing_comparison_rows_v_version_version_source_id_idx" ON "_pricing_comparison_rows_v" USING btree ("version_source_id");
  CREATE INDEX "_pricing_comparison_rows_v_version_version_set_idx" ON "_pricing_comparison_rows_v" USING btree ("version_set_id");
  CREATE INDEX "_pricing_comparison_rows_v_version_version_updated_at_idx" ON "_pricing_comparison_rows_v" USING btree ("version_updated_at");
  CREATE INDEX "_pricing_comparison_rows_v_version_version_created_at_idx" ON "_pricing_comparison_rows_v" USING btree ("version_created_at");
  CREATE INDEX "_pricing_comparison_rows_v_version_version__status_idx" ON "_pricing_comparison_rows_v" USING btree ("version__status");
  CREATE INDEX "_pricing_comparison_rows_v_created_at_idx" ON "_pricing_comparison_rows_v" USING btree ("created_at");
  CREATE INDEX "_pricing_comparison_rows_v_updated_at_idx" ON "_pricing_comparison_rows_v" USING btree ("updated_at");
  CREATE INDEX "_pricing_comparison_rows_v_snapshot_idx" ON "_pricing_comparison_rows_v" USING btree ("snapshot");
  CREATE INDEX "_pricing_comparison_rows_v_published_locale_idx" ON "_pricing_comparison_rows_v" USING btree ("published_locale");
  CREATE INDEX "_pricing_comparison_rows_v_latest_idx" ON "_pricing_comparison_rows_v" USING btree ("latest");
  CREATE INDEX "_international_why_items_v_parent_idx" ON "_international_why_items_v" USING btree ("parent_id");
  CREATE INDEX "_international_why_items_v_version_version_tenant_idx" ON "_international_why_items_v" USING btree ("version_tenant_id");
  CREATE INDEX "_international_why_items_v_version_version_source_id_idx" ON "_international_why_items_v" USING btree ("version_source_id");
  CREATE INDEX "_international_why_items_v_version_version_updated_at_idx" ON "_international_why_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_international_why_items_v_version_version_created_at_idx" ON "_international_why_items_v" USING btree ("version_created_at");
  CREATE INDEX "_international_why_items_v_version_version__status_idx" ON "_international_why_items_v" USING btree ("version__status");
  CREATE INDEX "_international_why_items_v_created_at_idx" ON "_international_why_items_v" USING btree ("created_at");
  CREATE INDEX "_international_why_items_v_updated_at_idx" ON "_international_why_items_v" USING btree ("updated_at");
  CREATE INDEX "_international_why_items_v_snapshot_idx" ON "_international_why_items_v" USING btree ("snapshot");
  CREATE INDEX "_international_why_items_v_published_locale_idx" ON "_international_why_items_v" USING btree ("published_locale");
  CREATE INDEX "_international_why_items_v_latest_idx" ON "_international_why_items_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_international_why_items_v_locales_locale_parent_id_unique" ON "_international_why_items_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_international_treatments_v_parent_idx" ON "_international_treatments_v" USING btree ("parent_id");
  CREATE INDEX "_international_treatments_v_version_version_tenant_idx" ON "_international_treatments_v" USING btree ("version_tenant_id");
  CREATE INDEX "_international_treatments_v_version_version_source_id_idx" ON "_international_treatments_v" USING btree ("version_source_id");
  CREATE INDEX "_international_treatments_v_version_version_updated_at_idx" ON "_international_treatments_v" USING btree ("version_updated_at");
  CREATE INDEX "_international_treatments_v_version_version_created_at_idx" ON "_international_treatments_v" USING btree ("version_created_at");
  CREATE INDEX "_international_treatments_v_version_version__status_idx" ON "_international_treatments_v" USING btree ("version__status");
  CREATE INDEX "_international_treatments_v_created_at_idx" ON "_international_treatments_v" USING btree ("created_at");
  CREATE INDEX "_international_treatments_v_updated_at_idx" ON "_international_treatments_v" USING btree ("updated_at");
  CREATE INDEX "_international_treatments_v_snapshot_idx" ON "_international_treatments_v" USING btree ("snapshot");
  CREATE INDEX "_international_treatments_v_published_locale_idx" ON "_international_treatments_v" USING btree ("published_locale");
  CREATE INDEX "_international_treatments_v_latest_idx" ON "_international_treatments_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_international_treatments_v_locales_locale_parent_id_unique" ON "_international_treatments_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_international_steps_v_parent_idx" ON "_international_steps_v" USING btree ("parent_id");
  CREATE INDEX "_international_steps_v_version_version_tenant_idx" ON "_international_steps_v" USING btree ("version_tenant_id");
  CREATE INDEX "_international_steps_v_version_version_source_id_idx" ON "_international_steps_v" USING btree ("version_source_id");
  CREATE INDEX "_international_steps_v_version_version_updated_at_idx" ON "_international_steps_v" USING btree ("version_updated_at");
  CREATE INDEX "_international_steps_v_version_version_created_at_idx" ON "_international_steps_v" USING btree ("version_created_at");
  CREATE INDEX "_international_steps_v_version_version__status_idx" ON "_international_steps_v" USING btree ("version__status");
  CREATE INDEX "_international_steps_v_created_at_idx" ON "_international_steps_v" USING btree ("created_at");
  CREATE INDEX "_international_steps_v_updated_at_idx" ON "_international_steps_v" USING btree ("updated_at");
  CREATE INDEX "_international_steps_v_snapshot_idx" ON "_international_steps_v" USING btree ("snapshot");
  CREATE INDEX "_international_steps_v_published_locale_idx" ON "_international_steps_v" USING btree ("published_locale");
  CREATE INDEX "_international_steps_v_latest_idx" ON "_international_steps_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_international_steps_v_locales_locale_parent_id_unique" ON "_international_steps_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_timeline_events_v_parent_idx" ON "_timeline_events_v" USING btree ("parent_id");
  CREATE INDEX "_timeline_events_v_version_version_tenant_idx" ON "_timeline_events_v" USING btree ("version_tenant_id");
  CREATE INDEX "_timeline_events_v_version_version_source_id_idx" ON "_timeline_events_v" USING btree ("version_source_id");
  CREATE INDEX "_timeline_events_v_version_version_updated_at_idx" ON "_timeline_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_timeline_events_v_version_version_created_at_idx" ON "_timeline_events_v" USING btree ("version_created_at");
  CREATE INDEX "_timeline_events_v_version_version__status_idx" ON "_timeline_events_v" USING btree ("version__status");
  CREATE INDEX "_timeline_events_v_created_at_idx" ON "_timeline_events_v" USING btree ("created_at");
  CREATE INDEX "_timeline_events_v_updated_at_idx" ON "_timeline_events_v" USING btree ("updated_at");
  CREATE INDEX "_timeline_events_v_snapshot_idx" ON "_timeline_events_v" USING btree ("snapshot");
  CREATE INDEX "_timeline_events_v_published_locale_idx" ON "_timeline_events_v" USING btree ("published_locale");
  CREATE INDEX "_timeline_events_v_latest_idx" ON "_timeline_events_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_timeline_events_v_locales_locale_parent_id_unique" ON "_timeline_events_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_branches_v_parent_idx" ON "_branches_v" USING btree ("parent_id");
  CREATE INDEX "_branches_v_version_version_tenant_idx" ON "_branches_v" USING btree ("version_tenant_id");
  CREATE INDEX "_branches_v_version_version_source_id_idx" ON "_branches_v" USING btree ("version_source_id");
  CREATE INDEX "_branches_v_version_version_slug_idx" ON "_branches_v" USING btree ("version_slug");
  CREATE INDEX "_branches_v_version_version_updated_at_idx" ON "_branches_v" USING btree ("version_updated_at");
  CREATE INDEX "_branches_v_version_version_created_at_idx" ON "_branches_v" USING btree ("version_created_at");
  CREATE INDEX "_branches_v_version_version__status_idx" ON "_branches_v" USING btree ("version__status");
  CREATE INDEX "_branches_v_created_at_idx" ON "_branches_v" USING btree ("created_at");
  CREATE INDEX "_branches_v_updated_at_idx" ON "_branches_v" USING btree ("updated_at");
  CREATE INDEX "_branches_v_snapshot_idx" ON "_branches_v" USING btree ("snapshot");
  CREATE INDEX "_branches_v_published_locale_idx" ON "_branches_v" USING btree ("published_locale");
  CREATE INDEX "_branches_v_latest_idx" ON "_branches_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_branches_v_locales_locale_parent_id_unique" ON "_branches_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_clinical_cases_v_parent_idx" ON "_clinical_cases_v" USING btree ("parent_id");
  CREATE INDEX "_clinical_cases_v_version_version_tenant_idx" ON "_clinical_cases_v" USING btree ("version_tenant_id");
  CREATE INDEX "_clinical_cases_v_version_version_source_id_idx" ON "_clinical_cases_v" USING btree ("version_source_id");
  CREATE INDEX "_clinical_cases_v_version_version_slug_idx" ON "_clinical_cases_v" USING btree ("version_slug");
  CREATE INDEX "_clinical_cases_v_version_version_updated_at_idx" ON "_clinical_cases_v" USING btree ("version_updated_at");
  CREATE INDEX "_clinical_cases_v_version_version_created_at_idx" ON "_clinical_cases_v" USING btree ("version_created_at");
  CREATE INDEX "_clinical_cases_v_version_version__status_idx" ON "_clinical_cases_v" USING btree ("version__status");
  CREATE INDEX "_clinical_cases_v_created_at_idx" ON "_clinical_cases_v" USING btree ("created_at");
  CREATE INDEX "_clinical_cases_v_updated_at_idx" ON "_clinical_cases_v" USING btree ("updated_at");
  CREATE INDEX "_clinical_cases_v_snapshot_idx" ON "_clinical_cases_v" USING btree ("snapshot");
  CREATE INDEX "_clinical_cases_v_published_locale_idx" ON "_clinical_cases_v" USING btree ("published_locale");
  CREATE INDEX "_clinical_cases_v_latest_idx" ON "_clinical_cases_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_clinical_cases_v_locales_locale_parent_id_unique" ON "_clinical_cases_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_partners_v_parent_idx" ON "_partners_v" USING btree ("parent_id");
  CREATE INDEX "_partners_v_version_version_tenant_idx" ON "_partners_v" USING btree ("version_tenant_id");
  CREATE INDEX "_partners_v_version_version_source_id_idx" ON "_partners_v" USING btree ("version_source_id");
  CREATE INDEX "_partners_v_version_version_category_idx" ON "_partners_v" USING btree ("version_category_id");
  CREATE INDEX "_partners_v_version_version_updated_at_idx" ON "_partners_v" USING btree ("version_updated_at");
  CREATE INDEX "_partners_v_version_version_created_at_idx" ON "_partners_v" USING btree ("version_created_at");
  CREATE INDEX "_partners_v_version_version__status_idx" ON "_partners_v" USING btree ("version__status");
  CREATE INDEX "_partners_v_created_at_idx" ON "_partners_v" USING btree ("created_at");
  CREATE INDEX "_partners_v_updated_at_idx" ON "_partners_v" USING btree ("updated_at");
  CREATE INDEX "_partners_v_snapshot_idx" ON "_partners_v" USING btree ("snapshot");
  CREATE INDEX "_partners_v_published_locale_idx" ON "_partners_v" USING btree ("published_locale");
  CREATE INDEX "_partners_v_latest_idx" ON "_partners_v" USING btree ("latest");
  CREATE INDEX "_partner_categories_v_parent_idx" ON "_partner_categories_v" USING btree ("parent_id");
  CREATE INDEX "_partner_categories_v_version_version_tenant_idx" ON "_partner_categories_v" USING btree ("version_tenant_id");
  CREATE INDEX "_partner_categories_v_version_version_source_id_idx" ON "_partner_categories_v" USING btree ("version_source_id");
  CREATE INDEX "_partner_categories_v_version_version_updated_at_idx" ON "_partner_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_partner_categories_v_version_version_created_at_idx" ON "_partner_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_partner_categories_v_version_version__status_idx" ON "_partner_categories_v" USING btree ("version__status");
  CREATE INDEX "_partner_categories_v_created_at_idx" ON "_partner_categories_v" USING btree ("created_at");
  CREATE INDEX "_partner_categories_v_updated_at_idx" ON "_partner_categories_v" USING btree ("updated_at");
  CREATE INDEX "_partner_categories_v_snapshot_idx" ON "_partner_categories_v" USING btree ("snapshot");
  CREATE INDEX "_partner_categories_v_published_locale_idx" ON "_partner_categories_v" USING btree ("published_locale");
  CREATE INDEX "_partner_categories_v_latest_idx" ON "_partner_categories_v" USING btree ("latest");
  CREATE INDEX "_faq_items_v_parent_idx" ON "_faq_items_v" USING btree ("parent_id");
  CREATE INDEX "_faq_items_v_version_version_tenant_idx" ON "_faq_items_v" USING btree ("version_tenant_id");
  CREATE INDEX "_faq_items_v_version_version_source_id_idx" ON "_faq_items_v" USING btree ("version_source_id");
  CREATE INDEX "_faq_items_v_version_version_updated_at_idx" ON "_faq_items_v" USING btree ("version_updated_at");
  CREATE INDEX "_faq_items_v_version_version_created_at_idx" ON "_faq_items_v" USING btree ("version_created_at");
  CREATE INDEX "_faq_items_v_version_version__status_idx" ON "_faq_items_v" USING btree ("version__status");
  CREATE INDEX "_faq_items_v_created_at_idx" ON "_faq_items_v" USING btree ("created_at");
  CREATE INDEX "_faq_items_v_updated_at_idx" ON "_faq_items_v" USING btree ("updated_at");
  CREATE INDEX "_faq_items_v_snapshot_idx" ON "_faq_items_v" USING btree ("snapshot");
  CREATE INDEX "_faq_items_v_published_locale_idx" ON "_faq_items_v" USING btree ("published_locale");
  CREATE INDEX "_faq_items_v_latest_idx" ON "_faq_items_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_faq_items_v_locales_locale_parent_id_unique" ON "_faq_items_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_news_articles_v_version_body_order_idx" ON "_news_articles_v_version_body" USING btree ("_order");
  CREATE INDEX "_news_articles_v_version_body_parent_id_idx" ON "_news_articles_v_version_body" USING btree ("_parent_id");
  CREATE INDEX "_news_articles_v_version_body_locale_idx" ON "_news_articles_v_version_body" USING btree ("_locale");
  CREATE INDEX "_news_articles_v_parent_idx" ON "_news_articles_v" USING btree ("parent_id");
  CREATE INDEX "_news_articles_v_version_version_tenant_idx" ON "_news_articles_v" USING btree ("version_tenant_id");
  CREATE INDEX "_news_articles_v_version_version_source_id_idx" ON "_news_articles_v" USING btree ("version_source_id");
  CREATE INDEX "_news_articles_v_version_version_slug_idx" ON "_news_articles_v" USING btree ("version_slug");
  CREATE INDEX "_news_articles_v_version_version_updated_at_idx" ON "_news_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_articles_v_version_version_created_at_idx" ON "_news_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_news_articles_v_version_version__status_idx" ON "_news_articles_v" USING btree ("version__status");
  CREATE INDEX "_news_articles_v_created_at_idx" ON "_news_articles_v" USING btree ("created_at");
  CREATE INDEX "_news_articles_v_updated_at_idx" ON "_news_articles_v" USING btree ("updated_at");
  CREATE INDEX "_news_articles_v_snapshot_idx" ON "_news_articles_v" USING btree ("snapshot");
  CREATE INDEX "_news_articles_v_published_locale_idx" ON "_news_articles_v" USING btree ("published_locale");
  CREATE INDEX "_news_articles_v_latest_idx" ON "_news_articles_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_news_articles_v_locales_locale_parent_id_unique" ON "_news_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_community_articles_v_version_body_order_idx" ON "_community_articles_v_version_body" USING btree ("_order");
  CREATE INDEX "_community_articles_v_version_body_parent_id_idx" ON "_community_articles_v_version_body" USING btree ("_parent_id");
  CREATE INDEX "_community_articles_v_version_body_locale_idx" ON "_community_articles_v_version_body" USING btree ("_locale");
  CREATE INDEX "_community_articles_v_version_images_order_idx" ON "_community_articles_v_version_images" USING btree ("_order");
  CREATE INDEX "_community_articles_v_version_images_parent_id_idx" ON "_community_articles_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_community_articles_v_parent_idx" ON "_community_articles_v" USING btree ("parent_id");
  CREATE INDEX "_community_articles_v_version_version_tenant_idx" ON "_community_articles_v" USING btree ("version_tenant_id");
  CREATE INDEX "_community_articles_v_version_version_source_id_idx" ON "_community_articles_v" USING btree ("version_source_id");
  CREATE INDEX "_community_articles_v_version_version_slug_idx" ON "_community_articles_v" USING btree ("version_slug");
  CREATE INDEX "_community_articles_v_version_version_updated_at_idx" ON "_community_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_community_articles_v_version_version_created_at_idx" ON "_community_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_community_articles_v_version_version__status_idx" ON "_community_articles_v" USING btree ("version__status");
  CREATE INDEX "_community_articles_v_created_at_idx" ON "_community_articles_v" USING btree ("created_at");
  CREATE INDEX "_community_articles_v_updated_at_idx" ON "_community_articles_v" USING btree ("updated_at");
  CREATE INDEX "_community_articles_v_snapshot_idx" ON "_community_articles_v" USING btree ("snapshot");
  CREATE INDEX "_community_articles_v_published_locale_idx" ON "_community_articles_v" USING btree ("published_locale");
  CREATE INDEX "_community_articles_v_latest_idx" ON "_community_articles_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_community_articles_v_locales_locale_parent_id_unique" ON "_community_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_publications_v_parent_idx" ON "_publications_v" USING btree ("parent_id");
  CREATE INDEX "_publications_v_version_version_tenant_idx" ON "_publications_v" USING btree ("version_tenant_id");
  CREATE INDEX "_publications_v_version_version_source_id_idx" ON "_publications_v" USING btree ("version_source_id");
  CREATE INDEX "_publications_v_version_version_updated_at_idx" ON "_publications_v" USING btree ("version_updated_at");
  CREATE INDEX "_publications_v_version_version_created_at_idx" ON "_publications_v" USING btree ("version_created_at");
  CREATE INDEX "_publications_v_version_version__status_idx" ON "_publications_v" USING btree ("version__status");
  CREATE INDEX "_publications_v_created_at_idx" ON "_publications_v" USING btree ("created_at");
  CREATE INDEX "_publications_v_updated_at_idx" ON "_publications_v" USING btree ("updated_at");
  CREATE INDEX "_publications_v_snapshot_idx" ON "_publications_v" USING btree ("snapshot");
  CREATE INDEX "_publications_v_published_locale_idx" ON "_publications_v" USING btree ("published_locale");
  CREATE INDEX "_publications_v_latest_idx" ON "_publications_v" USING btree ("latest");
  CREATE INDEX "_videos_v_parent_idx" ON "_videos_v" USING btree ("parent_id");
  CREATE INDEX "_videos_v_version_version_tenant_idx" ON "_videos_v" USING btree ("version_tenant_id");
  CREATE INDEX "_videos_v_version_version_source_id_idx" ON "_videos_v" USING btree ("version_source_id");
  CREATE INDEX "_videos_v_version_version_updated_at_idx" ON "_videos_v" USING btree ("version_updated_at");
  CREATE INDEX "_videos_v_version_version_created_at_idx" ON "_videos_v" USING btree ("version_created_at");
  CREATE INDEX "_videos_v_version_version__status_idx" ON "_videos_v" USING btree ("version__status");
  CREATE INDEX "_videos_v_created_at_idx" ON "_videos_v" USING btree ("created_at");
  CREATE INDEX "_videos_v_updated_at_idx" ON "_videos_v" USING btree ("updated_at");
  CREATE INDEX "_videos_v_snapshot_idx" ON "_videos_v" USING btree ("snapshot");
  CREATE INDEX "_videos_v_published_locale_idx" ON "_videos_v" USING btree ("published_locale");
  CREATE INDEX "_videos_v_latest_idx" ON "_videos_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_videos_v_locales_locale_parent_id_unique" ON "_videos_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_career_positions_v_version_requirements_order_idx" ON "_career_positions_v_version_requirements" USING btree ("_order");
  CREATE INDEX "_career_positions_v_version_requirements_parent_id_idx" ON "_career_positions_v_version_requirements" USING btree ("_parent_id");
  CREATE INDEX "_career_positions_v_version_requirements_locale_idx" ON "_career_positions_v_version_requirements" USING btree ("_locale");
  CREATE INDEX "_career_positions_v_version_benefits_order_idx" ON "_career_positions_v_version_benefits" USING btree ("_order");
  CREATE INDEX "_career_positions_v_version_benefits_parent_id_idx" ON "_career_positions_v_version_benefits" USING btree ("_parent_id");
  CREATE INDEX "_career_positions_v_version_benefits_locale_idx" ON "_career_positions_v_version_benefits" USING btree ("_locale");
  CREATE INDEX "_career_positions_v_parent_idx" ON "_career_positions_v" USING btree ("parent_id");
  CREATE INDEX "_career_positions_v_version_version_tenant_idx" ON "_career_positions_v" USING btree ("version_tenant_id");
  CREATE INDEX "_career_positions_v_version_version_source_id_idx" ON "_career_positions_v" USING btree ("version_source_id");
  CREATE INDEX "_career_positions_v_version_version_slug_idx" ON "_career_positions_v" USING btree ("version_slug");
  CREATE INDEX "_career_positions_v_version_version_updated_at_idx" ON "_career_positions_v" USING btree ("version_updated_at");
  CREATE INDEX "_career_positions_v_version_version_created_at_idx" ON "_career_positions_v" USING btree ("version_created_at");
  CREATE INDEX "_career_positions_v_version_version__status_idx" ON "_career_positions_v" USING btree ("version__status");
  CREATE INDEX "_career_positions_v_created_at_idx" ON "_career_positions_v" USING btree ("created_at");
  CREATE INDEX "_career_positions_v_updated_at_idx" ON "_career_positions_v" USING btree ("updated_at");
  CREATE INDEX "_career_positions_v_snapshot_idx" ON "_career_positions_v" USING btree ("snapshot");
  CREATE INDEX "_career_positions_v_published_locale_idx" ON "_career_positions_v" USING btree ("published_locale");
  CREATE INDEX "_career_positions_v_latest_idx" ON "_career_positions_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_career_positions_v_locales_locale_parent_id_unique" ON "_career_positions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE INDEX "brand_logos__status_idx" ON "brand_logos" USING btree ("_status");
  CREATE INDEX "site_stats__status_idx" ON "site_stats" USING btree ("_status");
  CREATE INDEX "feature_cards__status_idx" ON "feature_cards" USING btree ("_status");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "doctors__status_idx" ON "doctors" USING btree ("_status");
  CREATE INDEX "technology__status_idx" ON "technology" USING btree ("_status");
  CREATE INDEX "pricing_categories__status_idx" ON "pricing_categories" USING btree ("_status");
  CREATE INDEX "pricing_items__status_idx" ON "pricing_items" USING btree ("_status");
  CREATE INDEX "pricing_comparison_sets__status_idx" ON "pricing_comparison_sets" USING btree ("_status");
  CREATE INDEX "pricing_comparison_rows__status_idx" ON "pricing_comparison_rows" USING btree ("_status");
  CREATE INDEX "international_why_items__status_idx" ON "international_why_items" USING btree ("_status");
  CREATE INDEX "international_treatments__status_idx" ON "international_treatments" USING btree ("_status");
  CREATE INDEX "international_steps__status_idx" ON "international_steps" USING btree ("_status");
  CREATE INDEX "timeline_events__status_idx" ON "timeline_events" USING btree ("_status");
  CREATE INDEX "branches__status_idx" ON "branches" USING btree ("_status");
  CREATE INDEX "clinical_cases__status_idx" ON "clinical_cases" USING btree ("_status");
  CREATE INDEX "partners__status_idx" ON "partners" USING btree ("_status");
  CREATE INDEX "partner_categories__status_idx" ON "partner_categories" USING btree ("_status");
  CREATE INDEX "faq_items__status_idx" ON "faq_items" USING btree ("_status");
  CREATE INDEX "news_articles__status_idx" ON "news_articles" USING btree ("_status");
  CREATE INDEX "community_articles__status_idx" ON "community_articles" USING btree ("_status");
  CREATE INDEX "publications__status_idx" ON "publications" USING btree ("_status");
  CREATE INDEX "videos__status_idx" ON "videos" USING btree ("_status");
  CREATE INDEX "career_positions__status_idx" ON "career_positions" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_homepage_v_version_hero_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_version_hero_buttons_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_version_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_version_slides_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_brand_logos_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_stats_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_stats_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_feature_cards_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_feature_cards_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_callout_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricetable_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricetable" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_self_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_pair" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_text_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_callout_2_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_callout_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_list_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_list_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_steps_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_steps_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricetable_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricetable_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_2_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_self_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_pair_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_text_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_callout_3_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_callout_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_list_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_list_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cards_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_steps_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_steps_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricing_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricetable_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_pricetable_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_3_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_self_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_image_pair_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_twocol" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_callout_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricing_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricetable_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricetable" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_self_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_image_pair" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_text_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_callout_2_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_callout_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_list_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_list_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cards_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cards_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_steps_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_steps_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricing_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricing_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricetable_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricetable_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_gallery_2_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_gallery_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_image_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_self_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_image_pair_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_text_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_callout_3_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_callout_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_list_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_list_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cards_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cards_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_steps_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_steps_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricing_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricing_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricetable_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_pricetable_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_gallery_3_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_gallery_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_image_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_self_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_image_pair_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_twocol" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_doctors_v_version_specialty" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_doctors_v_version_languages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_doctors_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_doctors_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_callout_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricing_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricetable_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricetable" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_self_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_image_pair" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_text_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_callout_2_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_callout_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_list_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_list_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_cards_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_cards_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_steps_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_steps_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricing_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricing_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricetable_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricetable_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_gallery_2_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_gallery_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_image_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_self_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_image_pair_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_text_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_callout_3_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_callout_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_list_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_list_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_cards_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_cards_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_steps_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_steps_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricing_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricing_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricetable_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_pricetable_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_gallery_3_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_gallery_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_image_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_self_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_image_pair_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_blocks_twocol" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_version_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_technology_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pricing_categories_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pricing_categories_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pricing_items_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pricing_items_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pricing_comparison_sets_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pricing_comparison_rows_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_international_why_items_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_international_why_items_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_international_treatments_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_international_treatments_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_international_steps_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_international_steps_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timeline_events_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timeline_events_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_branches_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_branches_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_clinical_cases_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_clinical_cases_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partner_categories_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_faq_items_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_faq_items_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_news_articles_v_version_body" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_news_articles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_news_articles_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_community_articles_v_version_body" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_community_articles_v_version_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_community_articles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_community_articles_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_publications_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_videos_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_videos_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_career_positions_v_version_requirements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_career_positions_v_version_benefits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_career_positions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_career_positions_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_homepage_v_version_hero_buttons" CASCADE;
  DROP TABLE "_homepage_v_version_hero_buttons_locales" CASCADE;
  DROP TABLE "_homepage_v_version_slides" CASCADE;
  DROP TABLE "_homepage_v_version_slides_locales" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_locales" CASCADE;
  DROP TABLE "_brand_logos_v" CASCADE;
  DROP TABLE "_site_stats_v" CASCADE;
  DROP TABLE "_site_stats_v_locales" CASCADE;
  DROP TABLE "_feature_cards_v" CASCADE;
  DROP TABLE "_feature_cards_v_locales" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "_testimonials_v_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_text" CASCADE;
  DROP TABLE "_pages_v_blocks_callout_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_callout" CASCADE;
  DROP TABLE "_pages_v_blocks_list_items" CASCADE;
  DROP TABLE "_pages_v_blocks_list" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_items" CASCADE;
  DROP TABLE "_pages_v_blocks_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_items" CASCADE;
  DROP TABLE "_pages_v_blocks_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing" CASCADE;
  DROP TABLE "_pages_v_blocks_pricetable_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_pricetable" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_images" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_video" CASCADE;
  DROP TABLE "_pages_v_blocks_self_video" CASCADE;
  DROP TABLE "_pages_v_blocks_image_pair" CASCADE;
  DROP TABLE "_pages_v_blocks_text_2" CASCADE;
  DROP TABLE "_pages_v_blocks_callout_2_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_callout_2" CASCADE;
  DROP TABLE "_pages_v_blocks_list_2_items" CASCADE;
  DROP TABLE "_pages_v_blocks_list_2" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_2_items" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_2" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_2_items" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_2" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_2_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_2" CASCADE;
  DROP TABLE "_pages_v_blocks_pricetable_2_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_pricetable_2" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_2_images" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_2" CASCADE;
  DROP TABLE "_pages_v_blocks_image_2" CASCADE;
  DROP TABLE "_pages_v_blocks_video_2" CASCADE;
  DROP TABLE "_pages_v_blocks_self_video_2" CASCADE;
  DROP TABLE "_pages_v_blocks_image_pair_2" CASCADE;
  DROP TABLE "_pages_v_blocks_text_3" CASCADE;
  DROP TABLE "_pages_v_blocks_callout_3_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_callout_3" CASCADE;
  DROP TABLE "_pages_v_blocks_list_3_items" CASCADE;
  DROP TABLE "_pages_v_blocks_list_3" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_3_items" CASCADE;
  DROP TABLE "_pages_v_blocks_cards_3" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_3_items" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_3" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_3_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_3" CASCADE;
  DROP TABLE "_pages_v_blocks_pricetable_3_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_pricetable_3" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_3_images" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_3" CASCADE;
  DROP TABLE "_pages_v_blocks_image_3" CASCADE;
  DROP TABLE "_pages_v_blocks_video_3" CASCADE;
  DROP TABLE "_pages_v_blocks_self_video_3" CASCADE;
  DROP TABLE "_pages_v_blocks_image_pair_3" CASCADE;
  DROP TABLE "_pages_v_blocks_twocol" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_services_v_blocks_text" CASCADE;
  DROP TABLE "_services_v_blocks_callout_stats" CASCADE;
  DROP TABLE "_services_v_blocks_callout" CASCADE;
  DROP TABLE "_services_v_blocks_list_items" CASCADE;
  DROP TABLE "_services_v_blocks_list" CASCADE;
  DROP TABLE "_services_v_blocks_cards_items" CASCADE;
  DROP TABLE "_services_v_blocks_cards" CASCADE;
  DROP TABLE "_services_v_blocks_steps_items" CASCADE;
  DROP TABLE "_services_v_blocks_steps" CASCADE;
  DROP TABLE "_services_v_blocks_pricing_rows" CASCADE;
  DROP TABLE "_services_v_blocks_pricing" CASCADE;
  DROP TABLE "_services_v_blocks_pricetable_rows" CASCADE;
  DROP TABLE "_services_v_blocks_pricetable" CASCADE;
  DROP TABLE "_services_v_blocks_gallery_images" CASCADE;
  DROP TABLE "_services_v_blocks_gallery" CASCADE;
  DROP TABLE "_services_v_blocks_image" CASCADE;
  DROP TABLE "_services_v_blocks_video" CASCADE;
  DROP TABLE "_services_v_blocks_self_video" CASCADE;
  DROP TABLE "_services_v_blocks_image_pair" CASCADE;
  DROP TABLE "_services_v_blocks_text_2" CASCADE;
  DROP TABLE "_services_v_blocks_callout_2_stats" CASCADE;
  DROP TABLE "_services_v_blocks_callout_2" CASCADE;
  DROP TABLE "_services_v_blocks_list_2_items" CASCADE;
  DROP TABLE "_services_v_blocks_list_2" CASCADE;
  DROP TABLE "_services_v_blocks_cards_2_items" CASCADE;
  DROP TABLE "_services_v_blocks_cards_2" CASCADE;
  DROP TABLE "_services_v_blocks_steps_2_items" CASCADE;
  DROP TABLE "_services_v_blocks_steps_2" CASCADE;
  DROP TABLE "_services_v_blocks_pricing_2_rows" CASCADE;
  DROP TABLE "_services_v_blocks_pricing_2" CASCADE;
  DROP TABLE "_services_v_blocks_pricetable_2_rows" CASCADE;
  DROP TABLE "_services_v_blocks_pricetable_2" CASCADE;
  DROP TABLE "_services_v_blocks_gallery_2_images" CASCADE;
  DROP TABLE "_services_v_blocks_gallery_2" CASCADE;
  DROP TABLE "_services_v_blocks_image_2" CASCADE;
  DROP TABLE "_services_v_blocks_video_2" CASCADE;
  DROP TABLE "_services_v_blocks_self_video_2" CASCADE;
  DROP TABLE "_services_v_blocks_image_pair_2" CASCADE;
  DROP TABLE "_services_v_blocks_text_3" CASCADE;
  DROP TABLE "_services_v_blocks_callout_3_stats" CASCADE;
  DROP TABLE "_services_v_blocks_callout_3" CASCADE;
  DROP TABLE "_services_v_blocks_list_3_items" CASCADE;
  DROP TABLE "_services_v_blocks_list_3" CASCADE;
  DROP TABLE "_services_v_blocks_cards_3_items" CASCADE;
  DROP TABLE "_services_v_blocks_cards_3" CASCADE;
  DROP TABLE "_services_v_blocks_steps_3_items" CASCADE;
  DROP TABLE "_services_v_blocks_steps_3" CASCADE;
  DROP TABLE "_services_v_blocks_pricing_3_rows" CASCADE;
  DROP TABLE "_services_v_blocks_pricing_3" CASCADE;
  DROP TABLE "_services_v_blocks_pricetable_3_rows" CASCADE;
  DROP TABLE "_services_v_blocks_pricetable_3" CASCADE;
  DROP TABLE "_services_v_blocks_gallery_3_images" CASCADE;
  DROP TABLE "_services_v_blocks_gallery_3" CASCADE;
  DROP TABLE "_services_v_blocks_image_3" CASCADE;
  DROP TABLE "_services_v_blocks_video_3" CASCADE;
  DROP TABLE "_services_v_blocks_self_video_3" CASCADE;
  DROP TABLE "_services_v_blocks_image_pair_3" CASCADE;
  DROP TABLE "_services_v_blocks_twocol" CASCADE;
  DROP TABLE "_services_v_version_features" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP TABLE "_doctors_v_version_specialty" CASCADE;
  DROP TABLE "_doctors_v_version_languages" CASCADE;
  DROP TABLE "_doctors_v" CASCADE;
  DROP TABLE "_doctors_v_locales" CASCADE;
  DROP TABLE "_technology_v_blocks_text" CASCADE;
  DROP TABLE "_technology_v_blocks_callout_stats" CASCADE;
  DROP TABLE "_technology_v_blocks_callout" CASCADE;
  DROP TABLE "_technology_v_blocks_list_items" CASCADE;
  DROP TABLE "_technology_v_blocks_list" CASCADE;
  DROP TABLE "_technology_v_blocks_cards_items" CASCADE;
  DROP TABLE "_technology_v_blocks_cards" CASCADE;
  DROP TABLE "_technology_v_blocks_steps_items" CASCADE;
  DROP TABLE "_technology_v_blocks_steps" CASCADE;
  DROP TABLE "_technology_v_blocks_pricing_rows" CASCADE;
  DROP TABLE "_technology_v_blocks_pricing" CASCADE;
  DROP TABLE "_technology_v_blocks_pricetable_rows" CASCADE;
  DROP TABLE "_technology_v_blocks_pricetable" CASCADE;
  DROP TABLE "_technology_v_blocks_gallery_images" CASCADE;
  DROP TABLE "_technology_v_blocks_gallery" CASCADE;
  DROP TABLE "_technology_v_blocks_image" CASCADE;
  DROP TABLE "_technology_v_blocks_video" CASCADE;
  DROP TABLE "_technology_v_blocks_self_video" CASCADE;
  DROP TABLE "_technology_v_blocks_image_pair" CASCADE;
  DROP TABLE "_technology_v_blocks_text_2" CASCADE;
  DROP TABLE "_technology_v_blocks_callout_2_stats" CASCADE;
  DROP TABLE "_technology_v_blocks_callout_2" CASCADE;
  DROP TABLE "_technology_v_blocks_list_2_items" CASCADE;
  DROP TABLE "_technology_v_blocks_list_2" CASCADE;
  DROP TABLE "_technology_v_blocks_cards_2_items" CASCADE;
  DROP TABLE "_technology_v_blocks_cards_2" CASCADE;
  DROP TABLE "_technology_v_blocks_steps_2_items" CASCADE;
  DROP TABLE "_technology_v_blocks_steps_2" CASCADE;
  DROP TABLE "_technology_v_blocks_pricing_2_rows" CASCADE;
  DROP TABLE "_technology_v_blocks_pricing_2" CASCADE;
  DROP TABLE "_technology_v_blocks_pricetable_2_rows" CASCADE;
  DROP TABLE "_technology_v_blocks_pricetable_2" CASCADE;
  DROP TABLE "_technology_v_blocks_gallery_2_images" CASCADE;
  DROP TABLE "_technology_v_blocks_gallery_2" CASCADE;
  DROP TABLE "_technology_v_blocks_image_2" CASCADE;
  DROP TABLE "_technology_v_blocks_video_2" CASCADE;
  DROP TABLE "_technology_v_blocks_self_video_2" CASCADE;
  DROP TABLE "_technology_v_blocks_image_pair_2" CASCADE;
  DROP TABLE "_technology_v_blocks_text_3" CASCADE;
  DROP TABLE "_technology_v_blocks_callout_3_stats" CASCADE;
  DROP TABLE "_technology_v_blocks_callout_3" CASCADE;
  DROP TABLE "_technology_v_blocks_list_3_items" CASCADE;
  DROP TABLE "_technology_v_blocks_list_3" CASCADE;
  DROP TABLE "_technology_v_blocks_cards_3_items" CASCADE;
  DROP TABLE "_technology_v_blocks_cards_3" CASCADE;
  DROP TABLE "_technology_v_blocks_steps_3_items" CASCADE;
  DROP TABLE "_technology_v_blocks_steps_3" CASCADE;
  DROP TABLE "_technology_v_blocks_pricing_3_rows" CASCADE;
  DROP TABLE "_technology_v_blocks_pricing_3" CASCADE;
  DROP TABLE "_technology_v_blocks_pricetable_3_rows" CASCADE;
  DROP TABLE "_technology_v_blocks_pricetable_3" CASCADE;
  DROP TABLE "_technology_v_blocks_gallery_3_images" CASCADE;
  DROP TABLE "_technology_v_blocks_gallery_3" CASCADE;
  DROP TABLE "_technology_v_blocks_image_3" CASCADE;
  DROP TABLE "_technology_v_blocks_video_3" CASCADE;
  DROP TABLE "_technology_v_blocks_self_video_3" CASCADE;
  DROP TABLE "_technology_v_blocks_image_pair_3" CASCADE;
  DROP TABLE "_technology_v_blocks_twocol" CASCADE;
  DROP TABLE "_technology_v_version_highlights" CASCADE;
  DROP TABLE "_technology_v" CASCADE;
  DROP TABLE "_technology_v_locales" CASCADE;
  DROP TABLE "_pricing_categories_v" CASCADE;
  DROP TABLE "_pricing_categories_v_locales" CASCADE;
  DROP TABLE "_pricing_items_v" CASCADE;
  DROP TABLE "_pricing_items_v_locales" CASCADE;
  DROP TABLE "_pricing_comparison_sets_v" CASCADE;
  DROP TABLE "_pricing_comparison_rows_v" CASCADE;
  DROP TABLE "_international_why_items_v" CASCADE;
  DROP TABLE "_international_why_items_v_locales" CASCADE;
  DROP TABLE "_international_treatments_v" CASCADE;
  DROP TABLE "_international_treatments_v_locales" CASCADE;
  DROP TABLE "_international_steps_v" CASCADE;
  DROP TABLE "_international_steps_v_locales" CASCADE;
  DROP TABLE "_timeline_events_v" CASCADE;
  DROP TABLE "_timeline_events_v_locales" CASCADE;
  DROP TABLE "_branches_v" CASCADE;
  DROP TABLE "_branches_v_locales" CASCADE;
  DROP TABLE "_clinical_cases_v" CASCADE;
  DROP TABLE "_clinical_cases_v_locales" CASCADE;
  DROP TABLE "_partners_v" CASCADE;
  DROP TABLE "_partner_categories_v" CASCADE;
  DROP TABLE "_faq_items_v" CASCADE;
  DROP TABLE "_faq_items_v_locales" CASCADE;
  DROP TABLE "_news_articles_v_version_body" CASCADE;
  DROP TABLE "_news_articles_v" CASCADE;
  DROP TABLE "_news_articles_v_locales" CASCADE;
  DROP TABLE "_community_articles_v_version_body" CASCADE;
  DROP TABLE "_community_articles_v_version_images" CASCADE;
  DROP TABLE "_community_articles_v" CASCADE;
  DROP TABLE "_community_articles_v_locales" CASCADE;
  DROP TABLE "_publications_v" CASCADE;
  DROP TABLE "_videos_v" CASCADE;
  DROP TABLE "_videos_v_locales" CASCADE;
  DROP TABLE "_career_positions_v_version_requirements" CASCADE;
  DROP TABLE "_career_positions_v_version_benefits" CASCADE;
  DROP TABLE "_career_positions_v" CASCADE;
  DROP TABLE "_career_positions_v_locales" CASCADE;
  DROP INDEX "homepage__status_idx";
  DROP INDEX "brand_logos__status_idx";
  DROP INDEX "site_stats__status_idx";
  DROP INDEX "feature_cards__status_idx";
  DROP INDEX "testimonials__status_idx";
  DROP INDEX "pages__status_idx";
  DROP INDEX "services__status_idx";
  DROP INDEX "doctors__status_idx";
  DROP INDEX "technology__status_idx";
  DROP INDEX "pricing_categories__status_idx";
  DROP INDEX "pricing_items__status_idx";
  DROP INDEX "pricing_comparison_sets__status_idx";
  DROP INDEX "pricing_comparison_rows__status_idx";
  DROP INDEX "international_why_items__status_idx";
  DROP INDEX "international_treatments__status_idx";
  DROP INDEX "international_steps__status_idx";
  DROP INDEX "timeline_events__status_idx";
  DROP INDEX "branches__status_idx";
  DROP INDEX "clinical_cases__status_idx";
  DROP INDEX "partners__status_idx";
  DROP INDEX "partner_categories__status_idx";
  DROP INDEX "faq_items__status_idx";
  DROP INDEX "news_articles__status_idx";
  DROP INDEX "community_articles__status_idx";
  DROP INDEX "publications__status_idx";
  DROP INDEX "videos__status_idx";
  DROP INDEX "career_positions__status_idx";
  ALTER TABLE "homepage_hero_buttons" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "brand_logos" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "brand_logos" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "site_stats" ALTER COLUMN "key" SET NOT NULL;
  ALTER TABLE "feature_cards" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "feature_cards_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "testimonials" ALTER COLUMN "author_name" SET NOT NULL;
  ALTER TABLE "services_features" ALTER COLUMN "feature" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "services_locales" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "doctors_specialty" ALTER COLUMN "value" SET NOT NULL;
  ALTER TABLE "doctors_languages" ALTER COLUMN "value" SET NOT NULL;
  ALTER TABLE "doctors" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "technology_highlights" ALTER COLUMN "value" SET NOT NULL;
  ALTER TABLE "technology" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "technology_locales" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "pricing_categories_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pricing_items_locales" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "pricing_comparison_sets" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "pricing_comparison_rows" ALTER COLUMN "treatment" SET NOT NULL;
  ALTER TABLE "international_why_items_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "international_treatments_locales" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "international_steps_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "timeline_events" ALTER COLUMN "year" SET NOT NULL;
  ALTER TABLE "timeline_events_locales" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "branches" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "clinical_cases" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "clinical_cases_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "partners" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "partner_categories" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "faq_items_locales" ALTER COLUMN "question" SET NOT NULL;
  ALTER TABLE "news_articles_body" ALTER COLUMN "paragraph" SET NOT NULL;
  ALTER TABLE "news_articles" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "news_articles_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "community_articles_body" ALTER COLUMN "paragraph" SET NOT NULL;
  ALTER TABLE "community_articles_images" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "community_articles" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "community_articles_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "publications" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "videos" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "videos_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "career_positions_requirements" ALTER COLUMN "value" SET NOT NULL;
  ALTER TABLE "career_positions_benefits" ALTER COLUMN "value" SET NOT NULL;
  ALTER TABLE "career_positions" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "career_positions_locales" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "homepage" DROP COLUMN "_status";
  ALTER TABLE "brand_logos" DROP COLUMN "_status";
  ALTER TABLE "site_stats" DROP COLUMN "_status";
  ALTER TABLE "feature_cards" DROP COLUMN "_status";
  ALTER TABLE "testimonials" DROP COLUMN "_status";
  ALTER TABLE "pages" DROP COLUMN "_status";
  ALTER TABLE "services" DROP COLUMN "_status";
  ALTER TABLE "doctors" DROP COLUMN "_status";
  ALTER TABLE "technology" DROP COLUMN "_status";
  ALTER TABLE "pricing_categories" DROP COLUMN "_status";
  ALTER TABLE "pricing_items" DROP COLUMN "_status";
  ALTER TABLE "pricing_comparison_sets" DROP COLUMN "_status";
  ALTER TABLE "pricing_comparison_rows" DROP COLUMN "_status";
  ALTER TABLE "international_why_items" DROP COLUMN "_status";
  ALTER TABLE "international_treatments" DROP COLUMN "_status";
  ALTER TABLE "international_steps" DROP COLUMN "_status";
  ALTER TABLE "timeline_events" DROP COLUMN "_status";
  ALTER TABLE "branches" DROP COLUMN "_status";
  ALTER TABLE "clinical_cases" DROP COLUMN "_status";
  ALTER TABLE "partners" DROP COLUMN "_status";
  ALTER TABLE "partner_categories" DROP COLUMN "_status";
  ALTER TABLE "faq_items" DROP COLUMN "_status";
  ALTER TABLE "news_articles" DROP COLUMN "_status";
  ALTER TABLE "community_articles" DROP COLUMN "_status";
  ALTER TABLE "publications" DROP COLUMN "_status";
  ALTER TABLE "videos" DROP COLUMN "_status";
  ALTER TABLE "career_positions" DROP COLUMN "_status";
  ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN "api_key";
  ALTER TABLE "users" DROP COLUMN "api_key_index";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_version_status";
  DROP TYPE "public"."enum__homepage_v_published_locale";
  DROP TYPE "public"."enum_brand_logos_status";
  DROP TYPE "public"."enum__brand_logos_v_version_status";
  DROP TYPE "public"."enum__brand_logos_v_published_locale";
  DROP TYPE "public"."enum_site_stats_status";
  DROP TYPE "public"."enum__site_stats_v_version_status";
  DROP TYPE "public"."enum__site_stats_v_published_locale";
  DROP TYPE "public"."enum_feature_cards_status";
  DROP TYPE "public"."enum__feature_cards_v_version_status";
  DROP TYPE "public"."enum__feature_cards_v_published_locale";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum__testimonials_v_published_locale";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_callout_icon";
  DROP TYPE "public"."enum__pages_v_blocks_cards_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_image_size";
  DROP TYPE "public"."enum__pages_v_blocks_callout_2_icon";
  DROP TYPE "public"."enum__pages_v_blocks_cards_2_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_image_2_size";
  DROP TYPE "public"."enum__pages_v_blocks_callout_3_icon";
  DROP TYPE "public"."enum__pages_v_blocks_cards_3_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_image_3_size";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_blocks_callout_icon";
  DROP TYPE "public"."enum__services_v_blocks_cards_items_icon";
  DROP TYPE "public"."enum__services_v_blocks_image_size";
  DROP TYPE "public"."enum__services_v_blocks_callout_2_icon";
  DROP TYPE "public"."enum__services_v_blocks_cards_2_items_icon";
  DROP TYPE "public"."enum__services_v_blocks_image_2_size";
  DROP TYPE "public"."enum__services_v_blocks_callout_3_icon";
  DROP TYPE "public"."enum__services_v_blocks_cards_3_items_icon";
  DROP TYPE "public"."enum__services_v_blocks_image_3_size";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";
  DROP TYPE "public"."enum_doctors_status";
  DROP TYPE "public"."enum__doctors_v_version_department";
  DROP TYPE "public"."enum__doctors_v_version_status";
  DROP TYPE "public"."enum__doctors_v_published_locale";
  DROP TYPE "public"."enum_technology_status";
  DROP TYPE "public"."enum__technology_v_blocks_callout_icon";
  DROP TYPE "public"."enum__technology_v_blocks_cards_items_icon";
  DROP TYPE "public"."enum__technology_v_blocks_image_size";
  DROP TYPE "public"."enum__technology_v_blocks_callout_2_icon";
  DROP TYPE "public"."enum__technology_v_blocks_cards_2_items_icon";
  DROP TYPE "public"."enum__technology_v_blocks_image_2_size";
  DROP TYPE "public"."enum__technology_v_blocks_callout_3_icon";
  DROP TYPE "public"."enum__technology_v_blocks_cards_3_items_icon";
  DROP TYPE "public"."enum__technology_v_blocks_image_3_size";
  DROP TYPE "public"."enum__technology_v_version_status";
  DROP TYPE "public"."enum__technology_v_published_locale";
  DROP TYPE "public"."enum_pricing_categories_status";
  DROP TYPE "public"."enum__pricing_categories_v_version_status";
  DROP TYPE "public"."enum__pricing_categories_v_published_locale";
  DROP TYPE "public"."enum_pricing_items_status";
  DROP TYPE "public"."enum__pricing_items_v_version_status";
  DROP TYPE "public"."enum__pricing_items_v_published_locale";
  DROP TYPE "public"."enum_pricing_comparison_sets_status";
  DROP TYPE "public"."enum__pricing_comparison_sets_v_version_status";
  DROP TYPE "public"."enum__pricing_comparison_sets_v_published_locale";
  DROP TYPE "public"."enum_pricing_comparison_rows_status";
  DROP TYPE "public"."enum__pricing_comparison_rows_v_version_status";
  DROP TYPE "public"."enum__pricing_comparison_rows_v_published_locale";
  DROP TYPE "public"."enum_international_why_items_status";
  DROP TYPE "public"."enum__international_why_items_v_version_status";
  DROP TYPE "public"."enum__international_why_items_v_published_locale";
  DROP TYPE "public"."enum_international_treatments_status";
  DROP TYPE "public"."enum__international_treatments_v_version_status";
  DROP TYPE "public"."enum__international_treatments_v_published_locale";
  DROP TYPE "public"."enum_international_steps_status";
  DROP TYPE "public"."enum__international_steps_v_version_status";
  DROP TYPE "public"."enum__international_steps_v_published_locale";
  DROP TYPE "public"."enum_timeline_events_status";
  DROP TYPE "public"."enum__timeline_events_v_version_status";
  DROP TYPE "public"."enum__timeline_events_v_published_locale";
  DROP TYPE "public"."enum_branches_status";
  DROP TYPE "public"."enum__branches_v_version_status";
  DROP TYPE "public"."enum__branches_v_published_locale";
  DROP TYPE "public"."enum_clinical_cases_status";
  DROP TYPE "public"."enum__clinical_cases_v_version_status";
  DROP TYPE "public"."enum__clinical_cases_v_published_locale";
  DROP TYPE "public"."enum_partners_status";
  DROP TYPE "public"."enum__partners_v_version_status";
  DROP TYPE "public"."enum__partners_v_published_locale";
  DROP TYPE "public"."enum_partner_categories_status";
  DROP TYPE "public"."enum__partner_categories_v_version_status";
  DROP TYPE "public"."enum__partner_categories_v_published_locale";
  DROP TYPE "public"."enum_faq_items_status";
  DROP TYPE "public"."enum__faq_items_v_version_status";
  DROP TYPE "public"."enum__faq_items_v_published_locale";
  DROP TYPE "public"."enum_news_articles_status";
  DROP TYPE "public"."enum__news_articles_v_version_status";
  DROP TYPE "public"."enum__news_articles_v_published_locale";
  DROP TYPE "public"."enum_community_articles_status";
  DROP TYPE "public"."enum__community_articles_v_version_status";
  DROP TYPE "public"."enum__community_articles_v_published_locale";
  DROP TYPE "public"."enum_publications_status";
  DROP TYPE "public"."enum__publications_v_version_status";
  DROP TYPE "public"."enum__publications_v_published_locale";
  DROP TYPE "public"."enum_videos_status";
  DROP TYPE "public"."enum__videos_v_version_status";
  DROP TYPE "public"."enum__videos_v_published_locale";
  DROP TYPE "public"."enum_career_positions_status";
  DROP TYPE "public"."enum__career_positions_v_version_status";
  DROP TYPE "public"."enum__career_positions_v_published_locale";`)
}
