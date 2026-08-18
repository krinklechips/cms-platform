import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_blocks_image_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum_services_blocks_image_2_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum_services_blocks_image_3_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum_technology_blocks_image_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum_technology_blocks_image_2_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum_technology_blocks_image_3_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TABLE "services_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"card" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_callout_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"tag" varchar,
  	"icon" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "services_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar NOT NULL,
  	"detail" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_pricing_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_pricetable_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_pricetable" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum_services_blocks_image_size",
  	"width" numeric,
  	"height" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_self_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"heading" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_src" varchar NOT NULL,
  	"left_alt" varchar NOT NULL,
  	"left_caption" varchar,
  	"right_src" varchar NOT NULL,
  	"right_alt" varchar NOT NULL,
  	"right_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_text_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"card" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_callout_2_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_callout_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_list_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_list_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_cards_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"tag" varchar,
  	"icon" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "services_blocks_cards_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_steps_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar NOT NULL,
  	"detail" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_steps_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_pricing_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_pricing_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_pricetable_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_pricetable_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_gallery_2_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_gallery_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_image_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum_services_blocks_image_2_size",
  	"width" numeric,
  	"height" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_self_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"heading" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_image_pair_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_src" varchar NOT NULL,
  	"left_alt" varchar NOT NULL,
  	"left_caption" varchar,
  	"right_src" varchar NOT NULL,
  	"right_alt" varchar NOT NULL,
  	"right_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_text_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"card" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_callout_3_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_callout_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_list_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_list_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_cards_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"tag" varchar,
  	"icon" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "services_blocks_cards_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_steps_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar NOT NULL,
  	"detail" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_steps_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_pricing_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_pricing_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_pricetable_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_pricetable_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_gallery_3_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "services_blocks_gallery_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_image_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum_services_blocks_image_3_size",
  	"width" numeric,
  	"height" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_self_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"heading" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_image_pair_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_src" varchar NOT NULL,
  	"left_alt" varchar NOT NULL,
  	"left_caption" varchar,
  	"right_src" varchar NOT NULL,
  	"right_alt" varchar NOT NULL,
  	"right_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "services_blocks_twocol" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"card" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_callout_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"tag" varchar,
  	"icon" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "technology_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar NOT NULL,
  	"detail" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_pricing_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_pricetable_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_pricetable" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum_technology_blocks_image_size",
  	"width" numeric,
  	"height" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_self_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"heading" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_src" varchar NOT NULL,
  	"left_alt" varchar NOT NULL,
  	"left_caption" varchar,
  	"right_src" varchar NOT NULL,
  	"right_alt" varchar NOT NULL,
  	"right_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_text_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"card" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_callout_2_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_callout_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_list_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_list_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_cards_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"tag" varchar,
  	"icon" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "technology_blocks_cards_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_steps_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar NOT NULL,
  	"detail" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_steps_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_pricing_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_pricing_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_pricetable_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_pricetable_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_gallery_2_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_gallery_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_image_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum_technology_blocks_image_2_size",
  	"width" numeric,
  	"height" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_self_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"heading" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_image_pair_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_src" varchar NOT NULL,
  	"left_alt" varchar NOT NULL,
  	"left_caption" varchar,
  	"right_src" varchar NOT NULL,
  	"right_alt" varchar NOT NULL,
  	"right_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_text_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"card" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_callout_3_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_callout_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"icon" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_list_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_list_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_cards_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"tag" varchar,
  	"icon" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "technology_blocks_cards_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_steps_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar NOT NULL,
  	"detail" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_steps_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_pricing_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_pricing_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_pricetable_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar NOT NULL,
  	"price" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_pricetable_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_gallery_3_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "technology_blocks_gallery_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_image_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum_technology_blocks_image_3_size",
  	"width" numeric,
  	"height" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" varchar NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_self_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar NOT NULL,
  	"heading" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_image_pair_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_src" varchar NOT NULL,
  	"left_alt" varchar NOT NULL,
  	"left_caption" varchar,
  	"right_src" varchar NOT NULL,
  	"right_alt" varchar NOT NULL,
  	"right_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "technology_blocks_twocol" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  ALTER TABLE "homepage_hero_buttons_locales" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "services_blocks_text" ADD CONSTRAINT "services_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_callout_stats" ADD CONSTRAINT "services_blocks_callout_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_callout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_callout" ADD CONSTRAINT "services_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_list_items" ADD CONSTRAINT "services_blocks_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_list" ADD CONSTRAINT "services_blocks_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cards_items" ADD CONSTRAINT "services_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cards" ADD CONSTRAINT "services_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_steps_items" ADD CONSTRAINT "services_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_steps" ADD CONSTRAINT "services_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricing_rows" ADD CONSTRAINT "services_blocks_pricing_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricing" ADD CONSTRAINT "services_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricetable_rows" ADD CONSTRAINT "services_blocks_pricetable_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_pricetable"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricetable" ADD CONSTRAINT "services_blocks_pricetable_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_images" ADD CONSTRAINT "services_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery" ADD CONSTRAINT "services_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image" ADD CONSTRAINT "services_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_video" ADD CONSTRAINT "services_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_self_video" ADD CONSTRAINT "services_blocks_self_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image_pair" ADD CONSTRAINT "services_blocks_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_text_2" ADD CONSTRAINT "services_blocks_text_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_callout_2_stats" ADD CONSTRAINT "services_blocks_callout_2_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_callout_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_callout_2" ADD CONSTRAINT "services_blocks_callout_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_list_2_items" ADD CONSTRAINT "services_blocks_list_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_list_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_list_2" ADD CONSTRAINT "services_blocks_list_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cards_2_items" ADD CONSTRAINT "services_blocks_cards_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_cards_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cards_2" ADD CONSTRAINT "services_blocks_cards_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_steps_2_items" ADD CONSTRAINT "services_blocks_steps_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_steps_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_steps_2" ADD CONSTRAINT "services_blocks_steps_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricing_2_rows" ADD CONSTRAINT "services_blocks_pricing_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_pricing_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricing_2" ADD CONSTRAINT "services_blocks_pricing_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricetable_2_rows" ADD CONSTRAINT "services_blocks_pricetable_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_pricetable_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricetable_2" ADD CONSTRAINT "services_blocks_pricetable_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_2_images" ADD CONSTRAINT "services_blocks_gallery_2_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_gallery_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_2" ADD CONSTRAINT "services_blocks_gallery_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image_2" ADD CONSTRAINT "services_blocks_image_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_video_2" ADD CONSTRAINT "services_blocks_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_self_video_2" ADD CONSTRAINT "services_blocks_self_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image_pair_2" ADD CONSTRAINT "services_blocks_image_pair_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_text_3" ADD CONSTRAINT "services_blocks_text_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_callout_3_stats" ADD CONSTRAINT "services_blocks_callout_3_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_callout_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_callout_3" ADD CONSTRAINT "services_blocks_callout_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_list_3_items" ADD CONSTRAINT "services_blocks_list_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_list_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_list_3" ADD CONSTRAINT "services_blocks_list_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cards_3_items" ADD CONSTRAINT "services_blocks_cards_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_cards_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cards_3" ADD CONSTRAINT "services_blocks_cards_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_steps_3_items" ADD CONSTRAINT "services_blocks_steps_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_steps_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_steps_3" ADD CONSTRAINT "services_blocks_steps_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricing_3_rows" ADD CONSTRAINT "services_blocks_pricing_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_pricing_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricing_3" ADD CONSTRAINT "services_blocks_pricing_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricetable_3_rows" ADD CONSTRAINT "services_blocks_pricetable_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_pricetable_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_pricetable_3" ADD CONSTRAINT "services_blocks_pricetable_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_3_images" ADD CONSTRAINT "services_blocks_gallery_3_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_gallery_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_3" ADD CONSTRAINT "services_blocks_gallery_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image_3" ADD CONSTRAINT "services_blocks_image_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_video_3" ADD CONSTRAINT "services_blocks_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_self_video_3" ADD CONSTRAINT "services_blocks_self_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_image_pair_3" ADD CONSTRAINT "services_blocks_image_pair_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_twocol" ADD CONSTRAINT "services_blocks_twocol_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_text" ADD CONSTRAINT "technology_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_callout_stats" ADD CONSTRAINT "technology_blocks_callout_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_callout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_callout" ADD CONSTRAINT "technology_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_list_items" ADD CONSTRAINT "technology_blocks_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_list" ADD CONSTRAINT "technology_blocks_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_cards_items" ADD CONSTRAINT "technology_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_cards" ADD CONSTRAINT "technology_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_steps_items" ADD CONSTRAINT "technology_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_steps" ADD CONSTRAINT "technology_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricing_rows" ADD CONSTRAINT "technology_blocks_pricing_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricing" ADD CONSTRAINT "technology_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricetable_rows" ADD CONSTRAINT "technology_blocks_pricetable_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_pricetable"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricetable" ADD CONSTRAINT "technology_blocks_pricetable_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_gallery_images" ADD CONSTRAINT "technology_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_gallery" ADD CONSTRAINT "technology_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_image" ADD CONSTRAINT "technology_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_video" ADD CONSTRAINT "technology_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_self_video" ADD CONSTRAINT "technology_blocks_self_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_pair" ADD CONSTRAINT "technology_blocks_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_text_2" ADD CONSTRAINT "technology_blocks_text_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_callout_2_stats" ADD CONSTRAINT "technology_blocks_callout_2_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_callout_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_callout_2" ADD CONSTRAINT "technology_blocks_callout_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_list_2_items" ADD CONSTRAINT "technology_blocks_list_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_list_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_list_2" ADD CONSTRAINT "technology_blocks_list_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_cards_2_items" ADD CONSTRAINT "technology_blocks_cards_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_cards_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_cards_2" ADD CONSTRAINT "technology_blocks_cards_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_steps_2_items" ADD CONSTRAINT "technology_blocks_steps_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_steps_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_steps_2" ADD CONSTRAINT "technology_blocks_steps_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricing_2_rows" ADD CONSTRAINT "technology_blocks_pricing_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_pricing_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricing_2" ADD CONSTRAINT "technology_blocks_pricing_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricetable_2_rows" ADD CONSTRAINT "technology_blocks_pricetable_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_pricetable_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricetable_2" ADD CONSTRAINT "technology_blocks_pricetable_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_gallery_2_images" ADD CONSTRAINT "technology_blocks_gallery_2_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_gallery_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_gallery_2" ADD CONSTRAINT "technology_blocks_gallery_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_2" ADD CONSTRAINT "technology_blocks_image_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_video_2" ADD CONSTRAINT "technology_blocks_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_self_video_2" ADD CONSTRAINT "technology_blocks_self_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_pair_2" ADD CONSTRAINT "technology_blocks_image_pair_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_text_3" ADD CONSTRAINT "technology_blocks_text_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_callout_3_stats" ADD CONSTRAINT "technology_blocks_callout_3_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_callout_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_callout_3" ADD CONSTRAINT "technology_blocks_callout_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_list_3_items" ADD CONSTRAINT "technology_blocks_list_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_list_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_list_3" ADD CONSTRAINT "technology_blocks_list_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_cards_3_items" ADD CONSTRAINT "technology_blocks_cards_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_cards_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_cards_3" ADD CONSTRAINT "technology_blocks_cards_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_steps_3_items" ADD CONSTRAINT "technology_blocks_steps_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_steps_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_steps_3" ADD CONSTRAINT "technology_blocks_steps_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricing_3_rows" ADD CONSTRAINT "technology_blocks_pricing_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_pricing_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricing_3" ADD CONSTRAINT "technology_blocks_pricing_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricetable_3_rows" ADD CONSTRAINT "technology_blocks_pricetable_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_pricetable_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_pricetable_3" ADD CONSTRAINT "technology_blocks_pricetable_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_gallery_3_images" ADD CONSTRAINT "technology_blocks_gallery_3_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology_blocks_gallery_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_gallery_3" ADD CONSTRAINT "technology_blocks_gallery_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_3" ADD CONSTRAINT "technology_blocks_image_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_video_3" ADD CONSTRAINT "technology_blocks_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_self_video_3" ADD CONSTRAINT "technology_blocks_self_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_pair_3" ADD CONSTRAINT "technology_blocks_image_pair_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technology_blocks_twocol" ADD CONSTRAINT "technology_blocks_twocol_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technology"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_blocks_text_order_idx" ON "services_blocks_text" USING btree ("_order");
  CREATE INDEX "services_blocks_text_parent_id_idx" ON "services_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_text_path_idx" ON "services_blocks_text" USING btree ("_path");
  CREATE INDEX "services_blocks_text_locale_idx" ON "services_blocks_text" USING btree ("_locale");
  CREATE INDEX "services_blocks_callout_stats_order_idx" ON "services_blocks_callout_stats" USING btree ("_order");
  CREATE INDEX "services_blocks_callout_stats_parent_id_idx" ON "services_blocks_callout_stats" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_callout_stats_locale_idx" ON "services_blocks_callout_stats" USING btree ("_locale");
  CREATE INDEX "services_blocks_callout_order_idx" ON "services_blocks_callout" USING btree ("_order");
  CREATE INDEX "services_blocks_callout_parent_id_idx" ON "services_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_callout_path_idx" ON "services_blocks_callout" USING btree ("_path");
  CREATE INDEX "services_blocks_callout_locale_idx" ON "services_blocks_callout" USING btree ("_locale");
  CREATE INDEX "services_blocks_list_items_order_idx" ON "services_blocks_list_items" USING btree ("_order");
  CREATE INDEX "services_blocks_list_items_parent_id_idx" ON "services_blocks_list_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_list_items_locale_idx" ON "services_blocks_list_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_list_order_idx" ON "services_blocks_list" USING btree ("_order");
  CREATE INDEX "services_blocks_list_parent_id_idx" ON "services_blocks_list" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_list_path_idx" ON "services_blocks_list" USING btree ("_path");
  CREATE INDEX "services_blocks_list_locale_idx" ON "services_blocks_list" USING btree ("_locale");
  CREATE INDEX "services_blocks_cards_items_order_idx" ON "services_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "services_blocks_cards_items_parent_id_idx" ON "services_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cards_items_locale_idx" ON "services_blocks_cards_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_cards_order_idx" ON "services_blocks_cards" USING btree ("_order");
  CREATE INDEX "services_blocks_cards_parent_id_idx" ON "services_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cards_path_idx" ON "services_blocks_cards" USING btree ("_path");
  CREATE INDEX "services_blocks_cards_locale_idx" ON "services_blocks_cards" USING btree ("_locale");
  CREATE INDEX "services_blocks_steps_items_order_idx" ON "services_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "services_blocks_steps_items_parent_id_idx" ON "services_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_steps_items_locale_idx" ON "services_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_steps_order_idx" ON "services_blocks_steps" USING btree ("_order");
  CREATE INDEX "services_blocks_steps_parent_id_idx" ON "services_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_steps_path_idx" ON "services_blocks_steps" USING btree ("_path");
  CREATE INDEX "services_blocks_steps_locale_idx" ON "services_blocks_steps" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricing_rows_order_idx" ON "services_blocks_pricing_rows" USING btree ("_order");
  CREATE INDEX "services_blocks_pricing_rows_parent_id_idx" ON "services_blocks_pricing_rows" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricing_rows_locale_idx" ON "services_blocks_pricing_rows" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricing_order_idx" ON "services_blocks_pricing" USING btree ("_order");
  CREATE INDEX "services_blocks_pricing_parent_id_idx" ON "services_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricing_path_idx" ON "services_blocks_pricing" USING btree ("_path");
  CREATE INDEX "services_blocks_pricing_locale_idx" ON "services_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricetable_rows_order_idx" ON "services_blocks_pricetable_rows" USING btree ("_order");
  CREATE INDEX "services_blocks_pricetable_rows_parent_id_idx" ON "services_blocks_pricetable_rows" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricetable_rows_locale_idx" ON "services_blocks_pricetable_rows" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricetable_order_idx" ON "services_blocks_pricetable" USING btree ("_order");
  CREATE INDEX "services_blocks_pricetable_parent_id_idx" ON "services_blocks_pricetable" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricetable_path_idx" ON "services_blocks_pricetable" USING btree ("_path");
  CREATE INDEX "services_blocks_pricetable_locale_idx" ON "services_blocks_pricetable" USING btree ("_locale");
  CREATE INDEX "services_blocks_gallery_images_order_idx" ON "services_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_images_parent_id_idx" ON "services_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_images_locale_idx" ON "services_blocks_gallery_images" USING btree ("_locale");
  CREATE INDEX "services_blocks_gallery_order_idx" ON "services_blocks_gallery" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_parent_id_idx" ON "services_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_path_idx" ON "services_blocks_gallery" USING btree ("_path");
  CREATE INDEX "services_blocks_gallery_locale_idx" ON "services_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "services_blocks_image_order_idx" ON "services_blocks_image" USING btree ("_order");
  CREATE INDEX "services_blocks_image_parent_id_idx" ON "services_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_path_idx" ON "services_blocks_image" USING btree ("_path");
  CREATE INDEX "services_blocks_image_locale_idx" ON "services_blocks_image" USING btree ("_locale");
  CREATE INDEX "services_blocks_video_order_idx" ON "services_blocks_video" USING btree ("_order");
  CREATE INDEX "services_blocks_video_parent_id_idx" ON "services_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_video_path_idx" ON "services_blocks_video" USING btree ("_path");
  CREATE INDEX "services_blocks_video_locale_idx" ON "services_blocks_video" USING btree ("_locale");
  CREATE INDEX "services_blocks_self_video_order_idx" ON "services_blocks_self_video" USING btree ("_order");
  CREATE INDEX "services_blocks_self_video_parent_id_idx" ON "services_blocks_self_video" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_self_video_path_idx" ON "services_blocks_self_video" USING btree ("_path");
  CREATE INDEX "services_blocks_self_video_locale_idx" ON "services_blocks_self_video" USING btree ("_locale");
  CREATE INDEX "services_blocks_image_pair_order_idx" ON "services_blocks_image_pair" USING btree ("_order");
  CREATE INDEX "services_blocks_image_pair_parent_id_idx" ON "services_blocks_image_pair" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_pair_path_idx" ON "services_blocks_image_pair" USING btree ("_path");
  CREATE INDEX "services_blocks_image_pair_locale_idx" ON "services_blocks_image_pair" USING btree ("_locale");
  CREATE INDEX "services_blocks_text_2_order_idx" ON "services_blocks_text_2" USING btree ("_order");
  CREATE INDEX "services_blocks_text_2_parent_id_idx" ON "services_blocks_text_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_text_2_path_idx" ON "services_blocks_text_2" USING btree ("_path");
  CREATE INDEX "services_blocks_text_2_locale_idx" ON "services_blocks_text_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_callout_2_stats_order_idx" ON "services_blocks_callout_2_stats" USING btree ("_order");
  CREATE INDEX "services_blocks_callout_2_stats_parent_id_idx" ON "services_blocks_callout_2_stats" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_callout_2_stats_locale_idx" ON "services_blocks_callout_2_stats" USING btree ("_locale");
  CREATE INDEX "services_blocks_callout_2_order_idx" ON "services_blocks_callout_2" USING btree ("_order");
  CREATE INDEX "services_blocks_callout_2_parent_id_idx" ON "services_blocks_callout_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_callout_2_path_idx" ON "services_blocks_callout_2" USING btree ("_path");
  CREATE INDEX "services_blocks_callout_2_locale_idx" ON "services_blocks_callout_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_list_2_items_order_idx" ON "services_blocks_list_2_items" USING btree ("_order");
  CREATE INDEX "services_blocks_list_2_items_parent_id_idx" ON "services_blocks_list_2_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_list_2_items_locale_idx" ON "services_blocks_list_2_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_list_2_order_idx" ON "services_blocks_list_2" USING btree ("_order");
  CREATE INDEX "services_blocks_list_2_parent_id_idx" ON "services_blocks_list_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_list_2_path_idx" ON "services_blocks_list_2" USING btree ("_path");
  CREATE INDEX "services_blocks_list_2_locale_idx" ON "services_blocks_list_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_cards_2_items_order_idx" ON "services_blocks_cards_2_items" USING btree ("_order");
  CREATE INDEX "services_blocks_cards_2_items_parent_id_idx" ON "services_blocks_cards_2_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cards_2_items_locale_idx" ON "services_blocks_cards_2_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_cards_2_order_idx" ON "services_blocks_cards_2" USING btree ("_order");
  CREATE INDEX "services_blocks_cards_2_parent_id_idx" ON "services_blocks_cards_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cards_2_path_idx" ON "services_blocks_cards_2" USING btree ("_path");
  CREATE INDEX "services_blocks_cards_2_locale_idx" ON "services_blocks_cards_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_steps_2_items_order_idx" ON "services_blocks_steps_2_items" USING btree ("_order");
  CREATE INDEX "services_blocks_steps_2_items_parent_id_idx" ON "services_blocks_steps_2_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_steps_2_items_locale_idx" ON "services_blocks_steps_2_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_steps_2_order_idx" ON "services_blocks_steps_2" USING btree ("_order");
  CREATE INDEX "services_blocks_steps_2_parent_id_idx" ON "services_blocks_steps_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_steps_2_path_idx" ON "services_blocks_steps_2" USING btree ("_path");
  CREATE INDEX "services_blocks_steps_2_locale_idx" ON "services_blocks_steps_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricing_2_rows_order_idx" ON "services_blocks_pricing_2_rows" USING btree ("_order");
  CREATE INDEX "services_blocks_pricing_2_rows_parent_id_idx" ON "services_blocks_pricing_2_rows" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricing_2_rows_locale_idx" ON "services_blocks_pricing_2_rows" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricing_2_order_idx" ON "services_blocks_pricing_2" USING btree ("_order");
  CREATE INDEX "services_blocks_pricing_2_parent_id_idx" ON "services_blocks_pricing_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricing_2_path_idx" ON "services_blocks_pricing_2" USING btree ("_path");
  CREATE INDEX "services_blocks_pricing_2_locale_idx" ON "services_blocks_pricing_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricetable_2_rows_order_idx" ON "services_blocks_pricetable_2_rows" USING btree ("_order");
  CREATE INDEX "services_blocks_pricetable_2_rows_parent_id_idx" ON "services_blocks_pricetable_2_rows" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricetable_2_rows_locale_idx" ON "services_blocks_pricetable_2_rows" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricetable_2_order_idx" ON "services_blocks_pricetable_2" USING btree ("_order");
  CREATE INDEX "services_blocks_pricetable_2_parent_id_idx" ON "services_blocks_pricetable_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricetable_2_path_idx" ON "services_blocks_pricetable_2" USING btree ("_path");
  CREATE INDEX "services_blocks_pricetable_2_locale_idx" ON "services_blocks_pricetable_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_gallery_2_images_order_idx" ON "services_blocks_gallery_2_images" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_2_images_parent_id_idx" ON "services_blocks_gallery_2_images" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_2_images_locale_idx" ON "services_blocks_gallery_2_images" USING btree ("_locale");
  CREATE INDEX "services_blocks_gallery_2_order_idx" ON "services_blocks_gallery_2" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_2_parent_id_idx" ON "services_blocks_gallery_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_2_path_idx" ON "services_blocks_gallery_2" USING btree ("_path");
  CREATE INDEX "services_blocks_gallery_2_locale_idx" ON "services_blocks_gallery_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_image_2_order_idx" ON "services_blocks_image_2" USING btree ("_order");
  CREATE INDEX "services_blocks_image_2_parent_id_idx" ON "services_blocks_image_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_2_path_idx" ON "services_blocks_image_2" USING btree ("_path");
  CREATE INDEX "services_blocks_image_2_locale_idx" ON "services_blocks_image_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_video_2_order_idx" ON "services_blocks_video_2" USING btree ("_order");
  CREATE INDEX "services_blocks_video_2_parent_id_idx" ON "services_blocks_video_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_video_2_path_idx" ON "services_blocks_video_2" USING btree ("_path");
  CREATE INDEX "services_blocks_video_2_locale_idx" ON "services_blocks_video_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_self_video_2_order_idx" ON "services_blocks_self_video_2" USING btree ("_order");
  CREATE INDEX "services_blocks_self_video_2_parent_id_idx" ON "services_blocks_self_video_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_self_video_2_path_idx" ON "services_blocks_self_video_2" USING btree ("_path");
  CREATE INDEX "services_blocks_self_video_2_locale_idx" ON "services_blocks_self_video_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_image_pair_2_order_idx" ON "services_blocks_image_pair_2" USING btree ("_order");
  CREATE INDEX "services_blocks_image_pair_2_parent_id_idx" ON "services_blocks_image_pair_2" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_pair_2_path_idx" ON "services_blocks_image_pair_2" USING btree ("_path");
  CREATE INDEX "services_blocks_image_pair_2_locale_idx" ON "services_blocks_image_pair_2" USING btree ("_locale");
  CREATE INDEX "services_blocks_text_3_order_idx" ON "services_blocks_text_3" USING btree ("_order");
  CREATE INDEX "services_blocks_text_3_parent_id_idx" ON "services_blocks_text_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_text_3_path_idx" ON "services_blocks_text_3" USING btree ("_path");
  CREATE INDEX "services_blocks_text_3_locale_idx" ON "services_blocks_text_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_callout_3_stats_order_idx" ON "services_blocks_callout_3_stats" USING btree ("_order");
  CREATE INDEX "services_blocks_callout_3_stats_parent_id_idx" ON "services_blocks_callout_3_stats" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_callout_3_stats_locale_idx" ON "services_blocks_callout_3_stats" USING btree ("_locale");
  CREATE INDEX "services_blocks_callout_3_order_idx" ON "services_blocks_callout_3" USING btree ("_order");
  CREATE INDEX "services_blocks_callout_3_parent_id_idx" ON "services_blocks_callout_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_callout_3_path_idx" ON "services_blocks_callout_3" USING btree ("_path");
  CREATE INDEX "services_blocks_callout_3_locale_idx" ON "services_blocks_callout_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_list_3_items_order_idx" ON "services_blocks_list_3_items" USING btree ("_order");
  CREATE INDEX "services_blocks_list_3_items_parent_id_idx" ON "services_blocks_list_3_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_list_3_items_locale_idx" ON "services_blocks_list_3_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_list_3_order_idx" ON "services_blocks_list_3" USING btree ("_order");
  CREATE INDEX "services_blocks_list_3_parent_id_idx" ON "services_blocks_list_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_list_3_path_idx" ON "services_blocks_list_3" USING btree ("_path");
  CREATE INDEX "services_blocks_list_3_locale_idx" ON "services_blocks_list_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_cards_3_items_order_idx" ON "services_blocks_cards_3_items" USING btree ("_order");
  CREATE INDEX "services_blocks_cards_3_items_parent_id_idx" ON "services_blocks_cards_3_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cards_3_items_locale_idx" ON "services_blocks_cards_3_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_cards_3_order_idx" ON "services_blocks_cards_3" USING btree ("_order");
  CREATE INDEX "services_blocks_cards_3_parent_id_idx" ON "services_blocks_cards_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cards_3_path_idx" ON "services_blocks_cards_3" USING btree ("_path");
  CREATE INDEX "services_blocks_cards_3_locale_idx" ON "services_blocks_cards_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_steps_3_items_order_idx" ON "services_blocks_steps_3_items" USING btree ("_order");
  CREATE INDEX "services_blocks_steps_3_items_parent_id_idx" ON "services_blocks_steps_3_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_steps_3_items_locale_idx" ON "services_blocks_steps_3_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_steps_3_order_idx" ON "services_blocks_steps_3" USING btree ("_order");
  CREATE INDEX "services_blocks_steps_3_parent_id_idx" ON "services_blocks_steps_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_steps_3_path_idx" ON "services_blocks_steps_3" USING btree ("_path");
  CREATE INDEX "services_blocks_steps_3_locale_idx" ON "services_blocks_steps_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricing_3_rows_order_idx" ON "services_blocks_pricing_3_rows" USING btree ("_order");
  CREATE INDEX "services_blocks_pricing_3_rows_parent_id_idx" ON "services_blocks_pricing_3_rows" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricing_3_rows_locale_idx" ON "services_blocks_pricing_3_rows" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricing_3_order_idx" ON "services_blocks_pricing_3" USING btree ("_order");
  CREATE INDEX "services_blocks_pricing_3_parent_id_idx" ON "services_blocks_pricing_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricing_3_path_idx" ON "services_blocks_pricing_3" USING btree ("_path");
  CREATE INDEX "services_blocks_pricing_3_locale_idx" ON "services_blocks_pricing_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricetable_3_rows_order_idx" ON "services_blocks_pricetable_3_rows" USING btree ("_order");
  CREATE INDEX "services_blocks_pricetable_3_rows_parent_id_idx" ON "services_blocks_pricetable_3_rows" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricetable_3_rows_locale_idx" ON "services_blocks_pricetable_3_rows" USING btree ("_locale");
  CREATE INDEX "services_blocks_pricetable_3_order_idx" ON "services_blocks_pricetable_3" USING btree ("_order");
  CREATE INDEX "services_blocks_pricetable_3_parent_id_idx" ON "services_blocks_pricetable_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_pricetable_3_path_idx" ON "services_blocks_pricetable_3" USING btree ("_path");
  CREATE INDEX "services_blocks_pricetable_3_locale_idx" ON "services_blocks_pricetable_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_gallery_3_images_order_idx" ON "services_blocks_gallery_3_images" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_3_images_parent_id_idx" ON "services_blocks_gallery_3_images" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_3_images_locale_idx" ON "services_blocks_gallery_3_images" USING btree ("_locale");
  CREATE INDEX "services_blocks_gallery_3_order_idx" ON "services_blocks_gallery_3" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_3_parent_id_idx" ON "services_blocks_gallery_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_3_path_idx" ON "services_blocks_gallery_3" USING btree ("_path");
  CREATE INDEX "services_blocks_gallery_3_locale_idx" ON "services_blocks_gallery_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_image_3_order_idx" ON "services_blocks_image_3" USING btree ("_order");
  CREATE INDEX "services_blocks_image_3_parent_id_idx" ON "services_blocks_image_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_3_path_idx" ON "services_blocks_image_3" USING btree ("_path");
  CREATE INDEX "services_blocks_image_3_locale_idx" ON "services_blocks_image_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_video_3_order_idx" ON "services_blocks_video_3" USING btree ("_order");
  CREATE INDEX "services_blocks_video_3_parent_id_idx" ON "services_blocks_video_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_video_3_path_idx" ON "services_blocks_video_3" USING btree ("_path");
  CREATE INDEX "services_blocks_video_3_locale_idx" ON "services_blocks_video_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_self_video_3_order_idx" ON "services_blocks_self_video_3" USING btree ("_order");
  CREATE INDEX "services_blocks_self_video_3_parent_id_idx" ON "services_blocks_self_video_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_self_video_3_path_idx" ON "services_blocks_self_video_3" USING btree ("_path");
  CREATE INDEX "services_blocks_self_video_3_locale_idx" ON "services_blocks_self_video_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_image_pair_3_order_idx" ON "services_blocks_image_pair_3" USING btree ("_order");
  CREATE INDEX "services_blocks_image_pair_3_parent_id_idx" ON "services_blocks_image_pair_3" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_image_pair_3_path_idx" ON "services_blocks_image_pair_3" USING btree ("_path");
  CREATE INDEX "services_blocks_image_pair_3_locale_idx" ON "services_blocks_image_pair_3" USING btree ("_locale");
  CREATE INDEX "services_blocks_twocol_order_idx" ON "services_blocks_twocol" USING btree ("_order");
  CREATE INDEX "services_blocks_twocol_parent_id_idx" ON "services_blocks_twocol" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_twocol_path_idx" ON "services_blocks_twocol" USING btree ("_path");
  CREATE INDEX "services_blocks_twocol_locale_idx" ON "services_blocks_twocol" USING btree ("_locale");
  CREATE INDEX "technology_blocks_text_order_idx" ON "technology_blocks_text" USING btree ("_order");
  CREATE INDEX "technology_blocks_text_parent_id_idx" ON "technology_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_text_path_idx" ON "technology_blocks_text" USING btree ("_path");
  CREATE INDEX "technology_blocks_text_locale_idx" ON "technology_blocks_text" USING btree ("_locale");
  CREATE INDEX "technology_blocks_callout_stats_order_idx" ON "technology_blocks_callout_stats" USING btree ("_order");
  CREATE INDEX "technology_blocks_callout_stats_parent_id_idx" ON "technology_blocks_callout_stats" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_callout_stats_locale_idx" ON "technology_blocks_callout_stats" USING btree ("_locale");
  CREATE INDEX "technology_blocks_callout_order_idx" ON "technology_blocks_callout" USING btree ("_order");
  CREATE INDEX "technology_blocks_callout_parent_id_idx" ON "technology_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_callout_path_idx" ON "technology_blocks_callout" USING btree ("_path");
  CREATE INDEX "technology_blocks_callout_locale_idx" ON "technology_blocks_callout" USING btree ("_locale");
  CREATE INDEX "technology_blocks_list_items_order_idx" ON "technology_blocks_list_items" USING btree ("_order");
  CREATE INDEX "technology_blocks_list_items_parent_id_idx" ON "technology_blocks_list_items" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_list_items_locale_idx" ON "technology_blocks_list_items" USING btree ("_locale");
  CREATE INDEX "technology_blocks_list_order_idx" ON "technology_blocks_list" USING btree ("_order");
  CREATE INDEX "technology_blocks_list_parent_id_idx" ON "technology_blocks_list" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_list_path_idx" ON "technology_blocks_list" USING btree ("_path");
  CREATE INDEX "technology_blocks_list_locale_idx" ON "technology_blocks_list" USING btree ("_locale");
  CREATE INDEX "technology_blocks_cards_items_order_idx" ON "technology_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "technology_blocks_cards_items_parent_id_idx" ON "technology_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_cards_items_locale_idx" ON "technology_blocks_cards_items" USING btree ("_locale");
  CREATE INDEX "technology_blocks_cards_order_idx" ON "technology_blocks_cards" USING btree ("_order");
  CREATE INDEX "technology_blocks_cards_parent_id_idx" ON "technology_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_cards_path_idx" ON "technology_blocks_cards" USING btree ("_path");
  CREATE INDEX "technology_blocks_cards_locale_idx" ON "technology_blocks_cards" USING btree ("_locale");
  CREATE INDEX "technology_blocks_steps_items_order_idx" ON "technology_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "technology_blocks_steps_items_parent_id_idx" ON "technology_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_steps_items_locale_idx" ON "technology_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "technology_blocks_steps_order_idx" ON "technology_blocks_steps" USING btree ("_order");
  CREATE INDEX "technology_blocks_steps_parent_id_idx" ON "technology_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_steps_path_idx" ON "technology_blocks_steps" USING btree ("_path");
  CREATE INDEX "technology_blocks_steps_locale_idx" ON "technology_blocks_steps" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricing_rows_order_idx" ON "technology_blocks_pricing_rows" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricing_rows_parent_id_idx" ON "technology_blocks_pricing_rows" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricing_rows_locale_idx" ON "technology_blocks_pricing_rows" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricing_order_idx" ON "technology_blocks_pricing" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricing_parent_id_idx" ON "technology_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricing_path_idx" ON "technology_blocks_pricing" USING btree ("_path");
  CREATE INDEX "technology_blocks_pricing_locale_idx" ON "technology_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricetable_rows_order_idx" ON "technology_blocks_pricetable_rows" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricetable_rows_parent_id_idx" ON "technology_blocks_pricetable_rows" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricetable_rows_locale_idx" ON "technology_blocks_pricetable_rows" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricetable_order_idx" ON "technology_blocks_pricetable" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricetable_parent_id_idx" ON "technology_blocks_pricetable" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricetable_path_idx" ON "technology_blocks_pricetable" USING btree ("_path");
  CREATE INDEX "technology_blocks_pricetable_locale_idx" ON "technology_blocks_pricetable" USING btree ("_locale");
  CREATE INDEX "technology_blocks_gallery_images_order_idx" ON "technology_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "technology_blocks_gallery_images_parent_id_idx" ON "technology_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_gallery_images_locale_idx" ON "technology_blocks_gallery_images" USING btree ("_locale");
  CREATE INDEX "technology_blocks_gallery_order_idx" ON "technology_blocks_gallery" USING btree ("_order");
  CREATE INDEX "technology_blocks_gallery_parent_id_idx" ON "technology_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_gallery_path_idx" ON "technology_blocks_gallery" USING btree ("_path");
  CREATE INDEX "technology_blocks_gallery_locale_idx" ON "technology_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "technology_blocks_image_order_idx" ON "technology_blocks_image" USING btree ("_order");
  CREATE INDEX "technology_blocks_image_parent_id_idx" ON "technology_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_image_path_idx" ON "technology_blocks_image" USING btree ("_path");
  CREATE INDEX "technology_blocks_image_locale_idx" ON "technology_blocks_image" USING btree ("_locale");
  CREATE INDEX "technology_blocks_video_order_idx" ON "technology_blocks_video" USING btree ("_order");
  CREATE INDEX "technology_blocks_video_parent_id_idx" ON "technology_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_video_path_idx" ON "technology_blocks_video" USING btree ("_path");
  CREATE INDEX "technology_blocks_video_locale_idx" ON "technology_blocks_video" USING btree ("_locale");
  CREATE INDEX "technology_blocks_self_video_order_idx" ON "technology_blocks_self_video" USING btree ("_order");
  CREATE INDEX "technology_blocks_self_video_parent_id_idx" ON "technology_blocks_self_video" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_self_video_path_idx" ON "technology_blocks_self_video" USING btree ("_path");
  CREATE INDEX "technology_blocks_self_video_locale_idx" ON "technology_blocks_self_video" USING btree ("_locale");
  CREATE INDEX "technology_blocks_image_pair_order_idx" ON "technology_blocks_image_pair" USING btree ("_order");
  CREATE INDEX "technology_blocks_image_pair_parent_id_idx" ON "technology_blocks_image_pair" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_image_pair_path_idx" ON "technology_blocks_image_pair" USING btree ("_path");
  CREATE INDEX "technology_blocks_image_pair_locale_idx" ON "technology_blocks_image_pair" USING btree ("_locale");
  CREATE INDEX "technology_blocks_text_2_order_idx" ON "technology_blocks_text_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_text_2_parent_id_idx" ON "technology_blocks_text_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_text_2_path_idx" ON "technology_blocks_text_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_text_2_locale_idx" ON "technology_blocks_text_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_callout_2_stats_order_idx" ON "technology_blocks_callout_2_stats" USING btree ("_order");
  CREATE INDEX "technology_blocks_callout_2_stats_parent_id_idx" ON "technology_blocks_callout_2_stats" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_callout_2_stats_locale_idx" ON "technology_blocks_callout_2_stats" USING btree ("_locale");
  CREATE INDEX "technology_blocks_callout_2_order_idx" ON "technology_blocks_callout_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_callout_2_parent_id_idx" ON "technology_blocks_callout_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_callout_2_path_idx" ON "technology_blocks_callout_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_callout_2_locale_idx" ON "technology_blocks_callout_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_list_2_items_order_idx" ON "technology_blocks_list_2_items" USING btree ("_order");
  CREATE INDEX "technology_blocks_list_2_items_parent_id_idx" ON "technology_blocks_list_2_items" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_list_2_items_locale_idx" ON "technology_blocks_list_2_items" USING btree ("_locale");
  CREATE INDEX "technology_blocks_list_2_order_idx" ON "technology_blocks_list_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_list_2_parent_id_idx" ON "technology_blocks_list_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_list_2_path_idx" ON "technology_blocks_list_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_list_2_locale_idx" ON "technology_blocks_list_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_cards_2_items_order_idx" ON "technology_blocks_cards_2_items" USING btree ("_order");
  CREATE INDEX "technology_blocks_cards_2_items_parent_id_idx" ON "technology_blocks_cards_2_items" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_cards_2_items_locale_idx" ON "technology_blocks_cards_2_items" USING btree ("_locale");
  CREATE INDEX "technology_blocks_cards_2_order_idx" ON "technology_blocks_cards_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_cards_2_parent_id_idx" ON "technology_blocks_cards_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_cards_2_path_idx" ON "technology_blocks_cards_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_cards_2_locale_idx" ON "technology_blocks_cards_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_steps_2_items_order_idx" ON "technology_blocks_steps_2_items" USING btree ("_order");
  CREATE INDEX "technology_blocks_steps_2_items_parent_id_idx" ON "technology_blocks_steps_2_items" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_steps_2_items_locale_idx" ON "technology_blocks_steps_2_items" USING btree ("_locale");
  CREATE INDEX "technology_blocks_steps_2_order_idx" ON "technology_blocks_steps_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_steps_2_parent_id_idx" ON "technology_blocks_steps_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_steps_2_path_idx" ON "technology_blocks_steps_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_steps_2_locale_idx" ON "technology_blocks_steps_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricing_2_rows_order_idx" ON "technology_blocks_pricing_2_rows" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricing_2_rows_parent_id_idx" ON "technology_blocks_pricing_2_rows" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricing_2_rows_locale_idx" ON "technology_blocks_pricing_2_rows" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricing_2_order_idx" ON "technology_blocks_pricing_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricing_2_parent_id_idx" ON "technology_blocks_pricing_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricing_2_path_idx" ON "technology_blocks_pricing_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_pricing_2_locale_idx" ON "technology_blocks_pricing_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricetable_2_rows_order_idx" ON "technology_blocks_pricetable_2_rows" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricetable_2_rows_parent_id_idx" ON "technology_blocks_pricetable_2_rows" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricetable_2_rows_locale_idx" ON "technology_blocks_pricetable_2_rows" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricetable_2_order_idx" ON "technology_blocks_pricetable_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricetable_2_parent_id_idx" ON "technology_blocks_pricetable_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricetable_2_path_idx" ON "technology_blocks_pricetable_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_pricetable_2_locale_idx" ON "technology_blocks_pricetable_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_gallery_2_images_order_idx" ON "technology_blocks_gallery_2_images" USING btree ("_order");
  CREATE INDEX "technology_blocks_gallery_2_images_parent_id_idx" ON "technology_blocks_gallery_2_images" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_gallery_2_images_locale_idx" ON "technology_blocks_gallery_2_images" USING btree ("_locale");
  CREATE INDEX "technology_blocks_gallery_2_order_idx" ON "technology_blocks_gallery_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_gallery_2_parent_id_idx" ON "technology_blocks_gallery_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_gallery_2_path_idx" ON "technology_blocks_gallery_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_gallery_2_locale_idx" ON "technology_blocks_gallery_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_image_2_order_idx" ON "technology_blocks_image_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_image_2_parent_id_idx" ON "technology_blocks_image_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_image_2_path_idx" ON "technology_blocks_image_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_image_2_locale_idx" ON "technology_blocks_image_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_video_2_order_idx" ON "technology_blocks_video_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_video_2_parent_id_idx" ON "technology_blocks_video_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_video_2_path_idx" ON "technology_blocks_video_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_video_2_locale_idx" ON "technology_blocks_video_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_self_video_2_order_idx" ON "technology_blocks_self_video_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_self_video_2_parent_id_idx" ON "technology_blocks_self_video_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_self_video_2_path_idx" ON "technology_blocks_self_video_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_self_video_2_locale_idx" ON "technology_blocks_self_video_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_image_pair_2_order_idx" ON "technology_blocks_image_pair_2" USING btree ("_order");
  CREATE INDEX "technology_blocks_image_pair_2_parent_id_idx" ON "technology_blocks_image_pair_2" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_image_pair_2_path_idx" ON "technology_blocks_image_pair_2" USING btree ("_path");
  CREATE INDEX "technology_blocks_image_pair_2_locale_idx" ON "technology_blocks_image_pair_2" USING btree ("_locale");
  CREATE INDEX "technology_blocks_text_3_order_idx" ON "technology_blocks_text_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_text_3_parent_id_idx" ON "technology_blocks_text_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_text_3_path_idx" ON "technology_blocks_text_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_text_3_locale_idx" ON "technology_blocks_text_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_callout_3_stats_order_idx" ON "technology_blocks_callout_3_stats" USING btree ("_order");
  CREATE INDEX "technology_blocks_callout_3_stats_parent_id_idx" ON "technology_blocks_callout_3_stats" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_callout_3_stats_locale_idx" ON "technology_blocks_callout_3_stats" USING btree ("_locale");
  CREATE INDEX "technology_blocks_callout_3_order_idx" ON "technology_blocks_callout_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_callout_3_parent_id_idx" ON "technology_blocks_callout_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_callout_3_path_idx" ON "technology_blocks_callout_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_callout_3_locale_idx" ON "technology_blocks_callout_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_list_3_items_order_idx" ON "technology_blocks_list_3_items" USING btree ("_order");
  CREATE INDEX "technology_blocks_list_3_items_parent_id_idx" ON "technology_blocks_list_3_items" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_list_3_items_locale_idx" ON "technology_blocks_list_3_items" USING btree ("_locale");
  CREATE INDEX "technology_blocks_list_3_order_idx" ON "technology_blocks_list_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_list_3_parent_id_idx" ON "technology_blocks_list_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_list_3_path_idx" ON "technology_blocks_list_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_list_3_locale_idx" ON "technology_blocks_list_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_cards_3_items_order_idx" ON "technology_blocks_cards_3_items" USING btree ("_order");
  CREATE INDEX "technology_blocks_cards_3_items_parent_id_idx" ON "technology_blocks_cards_3_items" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_cards_3_items_locale_idx" ON "technology_blocks_cards_3_items" USING btree ("_locale");
  CREATE INDEX "technology_blocks_cards_3_order_idx" ON "technology_blocks_cards_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_cards_3_parent_id_idx" ON "technology_blocks_cards_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_cards_3_path_idx" ON "technology_blocks_cards_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_cards_3_locale_idx" ON "technology_blocks_cards_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_steps_3_items_order_idx" ON "technology_blocks_steps_3_items" USING btree ("_order");
  CREATE INDEX "technology_blocks_steps_3_items_parent_id_idx" ON "technology_blocks_steps_3_items" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_steps_3_items_locale_idx" ON "technology_blocks_steps_3_items" USING btree ("_locale");
  CREATE INDEX "technology_blocks_steps_3_order_idx" ON "technology_blocks_steps_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_steps_3_parent_id_idx" ON "technology_blocks_steps_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_steps_3_path_idx" ON "technology_blocks_steps_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_steps_3_locale_idx" ON "technology_blocks_steps_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricing_3_rows_order_idx" ON "technology_blocks_pricing_3_rows" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricing_3_rows_parent_id_idx" ON "technology_blocks_pricing_3_rows" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricing_3_rows_locale_idx" ON "technology_blocks_pricing_3_rows" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricing_3_order_idx" ON "technology_blocks_pricing_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricing_3_parent_id_idx" ON "technology_blocks_pricing_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricing_3_path_idx" ON "technology_blocks_pricing_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_pricing_3_locale_idx" ON "technology_blocks_pricing_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricetable_3_rows_order_idx" ON "technology_blocks_pricetable_3_rows" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricetable_3_rows_parent_id_idx" ON "technology_blocks_pricetable_3_rows" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricetable_3_rows_locale_idx" ON "technology_blocks_pricetable_3_rows" USING btree ("_locale");
  CREATE INDEX "technology_blocks_pricetable_3_order_idx" ON "technology_blocks_pricetable_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_pricetable_3_parent_id_idx" ON "technology_blocks_pricetable_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_pricetable_3_path_idx" ON "technology_blocks_pricetable_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_pricetable_3_locale_idx" ON "technology_blocks_pricetable_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_gallery_3_images_order_idx" ON "technology_blocks_gallery_3_images" USING btree ("_order");
  CREATE INDEX "technology_blocks_gallery_3_images_parent_id_idx" ON "technology_blocks_gallery_3_images" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_gallery_3_images_locale_idx" ON "technology_blocks_gallery_3_images" USING btree ("_locale");
  CREATE INDEX "technology_blocks_gallery_3_order_idx" ON "technology_blocks_gallery_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_gallery_3_parent_id_idx" ON "technology_blocks_gallery_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_gallery_3_path_idx" ON "technology_blocks_gallery_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_gallery_3_locale_idx" ON "technology_blocks_gallery_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_image_3_order_idx" ON "technology_blocks_image_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_image_3_parent_id_idx" ON "technology_blocks_image_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_image_3_path_idx" ON "technology_blocks_image_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_image_3_locale_idx" ON "technology_blocks_image_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_video_3_order_idx" ON "technology_blocks_video_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_video_3_parent_id_idx" ON "technology_blocks_video_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_video_3_path_idx" ON "technology_blocks_video_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_video_3_locale_idx" ON "technology_blocks_video_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_self_video_3_order_idx" ON "technology_blocks_self_video_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_self_video_3_parent_id_idx" ON "technology_blocks_self_video_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_self_video_3_path_idx" ON "technology_blocks_self_video_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_self_video_3_locale_idx" ON "technology_blocks_self_video_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_image_pair_3_order_idx" ON "technology_blocks_image_pair_3" USING btree ("_order");
  CREATE INDEX "technology_blocks_image_pair_3_parent_id_idx" ON "technology_blocks_image_pair_3" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_image_pair_3_path_idx" ON "technology_blocks_image_pair_3" USING btree ("_path");
  CREATE INDEX "technology_blocks_image_pair_3_locale_idx" ON "technology_blocks_image_pair_3" USING btree ("_locale");
  CREATE INDEX "technology_blocks_twocol_order_idx" ON "technology_blocks_twocol" USING btree ("_order");
  CREATE INDEX "technology_blocks_twocol_parent_id_idx" ON "technology_blocks_twocol" USING btree ("_parent_id");
  CREATE INDEX "technology_blocks_twocol_path_idx" ON "technology_blocks_twocol" USING btree ("_path");
  CREATE INDEX "technology_blocks_twocol_locale_idx" ON "technology_blocks_twocol" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_callout_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricing_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricetable_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricetable" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_self_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image_pair" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_text_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_callout_2_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_callout_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_list_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_list_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cards_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cards_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_steps_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_steps_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricing_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricing_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricetable_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricetable_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_2_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_self_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image_pair_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_text_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_callout_3_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_callout_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_list_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_list_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cards_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cards_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_steps_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_steps_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricing_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricing_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricetable_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_pricetable_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_3_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_self_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_image_pair_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_twocol" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_callout_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricing_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricetable_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricetable" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_self_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_image_pair" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_text_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_callout_2_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_callout_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_list_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_list_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_cards_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_cards_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_steps_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_steps_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricing_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricing_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricetable_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricetable_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_gallery_2_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_gallery_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_image_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_self_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_image_pair_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_text_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_callout_3_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_callout_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_list_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_list_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_cards_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_cards_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_steps_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_steps_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricing_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricing_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricetable_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_pricetable_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_gallery_3_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_gallery_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_image_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_self_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_image_pair_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "technology_blocks_twocol" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_blocks_text" CASCADE;
  DROP TABLE "services_blocks_callout_stats" CASCADE;
  DROP TABLE "services_blocks_callout" CASCADE;
  DROP TABLE "services_blocks_list_items" CASCADE;
  DROP TABLE "services_blocks_list" CASCADE;
  DROP TABLE "services_blocks_cards_items" CASCADE;
  DROP TABLE "services_blocks_cards" CASCADE;
  DROP TABLE "services_blocks_steps_items" CASCADE;
  DROP TABLE "services_blocks_steps" CASCADE;
  DROP TABLE "services_blocks_pricing_rows" CASCADE;
  DROP TABLE "services_blocks_pricing" CASCADE;
  DROP TABLE "services_blocks_pricetable_rows" CASCADE;
  DROP TABLE "services_blocks_pricetable" CASCADE;
  DROP TABLE "services_blocks_gallery_images" CASCADE;
  DROP TABLE "services_blocks_gallery" CASCADE;
  DROP TABLE "services_blocks_image" CASCADE;
  DROP TABLE "services_blocks_video" CASCADE;
  DROP TABLE "services_blocks_self_video" CASCADE;
  DROP TABLE "services_blocks_image_pair" CASCADE;
  DROP TABLE "services_blocks_text_2" CASCADE;
  DROP TABLE "services_blocks_callout_2_stats" CASCADE;
  DROP TABLE "services_blocks_callout_2" CASCADE;
  DROP TABLE "services_blocks_list_2_items" CASCADE;
  DROP TABLE "services_blocks_list_2" CASCADE;
  DROP TABLE "services_blocks_cards_2_items" CASCADE;
  DROP TABLE "services_blocks_cards_2" CASCADE;
  DROP TABLE "services_blocks_steps_2_items" CASCADE;
  DROP TABLE "services_blocks_steps_2" CASCADE;
  DROP TABLE "services_blocks_pricing_2_rows" CASCADE;
  DROP TABLE "services_blocks_pricing_2" CASCADE;
  DROP TABLE "services_blocks_pricetable_2_rows" CASCADE;
  DROP TABLE "services_blocks_pricetable_2" CASCADE;
  DROP TABLE "services_blocks_gallery_2_images" CASCADE;
  DROP TABLE "services_blocks_gallery_2" CASCADE;
  DROP TABLE "services_blocks_image_2" CASCADE;
  DROP TABLE "services_blocks_video_2" CASCADE;
  DROP TABLE "services_blocks_self_video_2" CASCADE;
  DROP TABLE "services_blocks_image_pair_2" CASCADE;
  DROP TABLE "services_blocks_text_3" CASCADE;
  DROP TABLE "services_blocks_callout_3_stats" CASCADE;
  DROP TABLE "services_blocks_callout_3" CASCADE;
  DROP TABLE "services_blocks_list_3_items" CASCADE;
  DROP TABLE "services_blocks_list_3" CASCADE;
  DROP TABLE "services_blocks_cards_3_items" CASCADE;
  DROP TABLE "services_blocks_cards_3" CASCADE;
  DROP TABLE "services_blocks_steps_3_items" CASCADE;
  DROP TABLE "services_blocks_steps_3" CASCADE;
  DROP TABLE "services_blocks_pricing_3_rows" CASCADE;
  DROP TABLE "services_blocks_pricing_3" CASCADE;
  DROP TABLE "services_blocks_pricetable_3_rows" CASCADE;
  DROP TABLE "services_blocks_pricetable_3" CASCADE;
  DROP TABLE "services_blocks_gallery_3_images" CASCADE;
  DROP TABLE "services_blocks_gallery_3" CASCADE;
  DROP TABLE "services_blocks_image_3" CASCADE;
  DROP TABLE "services_blocks_video_3" CASCADE;
  DROP TABLE "services_blocks_self_video_3" CASCADE;
  DROP TABLE "services_blocks_image_pair_3" CASCADE;
  DROP TABLE "services_blocks_twocol" CASCADE;
  DROP TABLE "technology_blocks_text" CASCADE;
  DROP TABLE "technology_blocks_callout_stats" CASCADE;
  DROP TABLE "technology_blocks_callout" CASCADE;
  DROP TABLE "technology_blocks_list_items" CASCADE;
  DROP TABLE "technology_blocks_list" CASCADE;
  DROP TABLE "technology_blocks_cards_items" CASCADE;
  DROP TABLE "technology_blocks_cards" CASCADE;
  DROP TABLE "technology_blocks_steps_items" CASCADE;
  DROP TABLE "technology_blocks_steps" CASCADE;
  DROP TABLE "technology_blocks_pricing_rows" CASCADE;
  DROP TABLE "technology_blocks_pricing" CASCADE;
  DROP TABLE "technology_blocks_pricetable_rows" CASCADE;
  DROP TABLE "technology_blocks_pricetable" CASCADE;
  DROP TABLE "technology_blocks_gallery_images" CASCADE;
  DROP TABLE "technology_blocks_gallery" CASCADE;
  DROP TABLE "technology_blocks_image" CASCADE;
  DROP TABLE "technology_blocks_video" CASCADE;
  DROP TABLE "technology_blocks_self_video" CASCADE;
  DROP TABLE "technology_blocks_image_pair" CASCADE;
  DROP TABLE "technology_blocks_text_2" CASCADE;
  DROP TABLE "technology_blocks_callout_2_stats" CASCADE;
  DROP TABLE "technology_blocks_callout_2" CASCADE;
  DROP TABLE "technology_blocks_list_2_items" CASCADE;
  DROP TABLE "technology_blocks_list_2" CASCADE;
  DROP TABLE "technology_blocks_cards_2_items" CASCADE;
  DROP TABLE "technology_blocks_cards_2" CASCADE;
  DROP TABLE "technology_blocks_steps_2_items" CASCADE;
  DROP TABLE "technology_blocks_steps_2" CASCADE;
  DROP TABLE "technology_blocks_pricing_2_rows" CASCADE;
  DROP TABLE "technology_blocks_pricing_2" CASCADE;
  DROP TABLE "technology_blocks_pricetable_2_rows" CASCADE;
  DROP TABLE "technology_blocks_pricetable_2" CASCADE;
  DROP TABLE "technology_blocks_gallery_2_images" CASCADE;
  DROP TABLE "technology_blocks_gallery_2" CASCADE;
  DROP TABLE "technology_blocks_image_2" CASCADE;
  DROP TABLE "technology_blocks_video_2" CASCADE;
  DROP TABLE "technology_blocks_self_video_2" CASCADE;
  DROP TABLE "technology_blocks_image_pair_2" CASCADE;
  DROP TABLE "technology_blocks_text_3" CASCADE;
  DROP TABLE "technology_blocks_callout_3_stats" CASCADE;
  DROP TABLE "technology_blocks_callout_3" CASCADE;
  DROP TABLE "technology_blocks_list_3_items" CASCADE;
  DROP TABLE "technology_blocks_list_3" CASCADE;
  DROP TABLE "technology_blocks_cards_3_items" CASCADE;
  DROP TABLE "technology_blocks_cards_3" CASCADE;
  DROP TABLE "technology_blocks_steps_3_items" CASCADE;
  DROP TABLE "technology_blocks_steps_3" CASCADE;
  DROP TABLE "technology_blocks_pricing_3_rows" CASCADE;
  DROP TABLE "technology_blocks_pricing_3" CASCADE;
  DROP TABLE "technology_blocks_pricetable_3_rows" CASCADE;
  DROP TABLE "technology_blocks_pricetable_3" CASCADE;
  DROP TABLE "technology_blocks_gallery_3_images" CASCADE;
  DROP TABLE "technology_blocks_gallery_3" CASCADE;
  DROP TABLE "technology_blocks_image_3" CASCADE;
  DROP TABLE "technology_blocks_video_3" CASCADE;
  DROP TABLE "technology_blocks_self_video_3" CASCADE;
  DROP TABLE "technology_blocks_image_pair_3" CASCADE;
  DROP TABLE "technology_blocks_twocol" CASCADE;
  ALTER TABLE "homepage_hero_buttons_locales" ALTER COLUMN "label" SET NOT NULL;
  DROP TYPE "public"."enum_services_blocks_image_size";
  DROP TYPE "public"."enum_services_blocks_image_2_size";
  DROP TYPE "public"."enum_services_blocks_image_3_size";
  DROP TYPE "public"."enum_technology_blocks_image_size";
  DROP TYPE "public"."enum_technology_blocks_image_2_size";
  DROP TYPE "public"."enum_technology_blocks_image_3_size";`)
}
