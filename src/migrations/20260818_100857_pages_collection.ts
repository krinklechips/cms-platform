import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_callout_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_pages_blocks_cards_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_pages_blocks_image_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum_pages_blocks_callout_2_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_pages_blocks_cards_2_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_pages_blocks_image_2_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum_pages_blocks_callout_3_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_pages_blocks_cards_3_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_pages_blocks_image_3_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum_services_blocks_callout_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_services_blocks_cards_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_services_blocks_callout_2_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_services_blocks_cards_2_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_services_blocks_callout_3_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_services_blocks_cards_3_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_technology_blocks_callout_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_technology_blocks_cards_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_technology_blocks_callout_2_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_technology_blocks_cards_2_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_technology_blocks_callout_3_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TYPE "public"."enum_technology_blocks_cards_3_items_icon" AS ENUM('Tooth', 'Smile', 'Heart', 'Star', 'Sparkles', 'Check', 'Shield', 'Clock', 'DollarSign', 'Bone', 'Dumbbell', 'CircleDot', 'Zap', 'Eye', 'FirstAidKit', 'RotateCcw', 'ArrowRight');
  CREATE TABLE "pages_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum_pages_blocks_callout_icon",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "pages_blocks_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum_pages_blocks_cards_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "pages_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar
  );
  
  CREATE TABLE "pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricetable_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar
  );
  
  CREATE TABLE "pages_blocks_pricetable" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum_pages_blocks_image_size",
  	"width" numeric,
  	"height" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_self_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout_2_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_callout_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum_pages_blocks_callout_2_icon",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_list_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "pages_blocks_list_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum_pages_blocks_cards_2_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_2_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricetable_2_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar
  );
  
  CREATE TABLE "pages_blocks_pricetable_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_2_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum_pages_blocks_image_2_size",
  	"width" numeric,
  	"height" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_self_video_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_pair_2" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"card" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout_3_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_callout_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum_pages_blocks_callout_3_icon",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_list_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "pages_blocks_list_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"icon" "enum_pages_blocks_cards_3_items_icon",
  	"tag" varchar,
  	"badge" varchar,
  	"spec" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "pages_blocks_cards_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"numbered" boolean,
  	"columns" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_3_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"step" varchar,
  	"detail" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricetable_3_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"treatment" varchar,
  	"price" varchar
  );
  
  CREATE TABLE "pages_blocks_pricetable_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_3_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"alt" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"caption" varchar,
  	"size" "enum_pages_blocks_image_3_size",
  	"width" numeric,
  	"height" numeric,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_self_video_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"heading" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_pair_3" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_src" varchar,
  	"left_alt" varchar,
  	"left_caption" varchar,
  	"right_src" varchar,
  	"right_alt" varchar,
  	"right_caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_twocol" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"published" boolean DEFAULT false,
  	"seo_image" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "services_blocks_callout" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_services_blocks_callout_icon" USING "icon"::"public"."enum_services_blocks_callout_icon";
  ALTER TABLE "services_blocks_cards_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_services_blocks_cards_items_icon" USING "icon"::"public"."enum_services_blocks_cards_items_icon";
  ALTER TABLE "services_blocks_callout_2" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_services_blocks_callout_2_icon" USING "icon"::"public"."enum_services_blocks_callout_2_icon";
  ALTER TABLE "services_blocks_cards_2_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_services_blocks_cards_2_items_icon" USING "icon"::"public"."enum_services_blocks_cards_2_items_icon";
  ALTER TABLE "services_blocks_callout_3" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_services_blocks_callout_3_icon" USING "icon"::"public"."enum_services_blocks_callout_3_icon";
  ALTER TABLE "services_blocks_cards_3_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_services_blocks_cards_3_items_icon" USING "icon"::"public"."enum_services_blocks_cards_3_items_icon";
  ALTER TABLE "technology_blocks_callout" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_technology_blocks_callout_icon" USING "icon"::"public"."enum_technology_blocks_callout_icon";
  ALTER TABLE "technology_blocks_cards_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_technology_blocks_cards_items_icon" USING "icon"::"public"."enum_technology_blocks_cards_items_icon";
  ALTER TABLE "technology_blocks_callout_2" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_technology_blocks_callout_2_icon" USING "icon"::"public"."enum_technology_blocks_callout_2_icon";
  ALTER TABLE "technology_blocks_cards_2_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_technology_blocks_cards_2_items_icon" USING "icon"::"public"."enum_technology_blocks_cards_2_items_icon";
  ALTER TABLE "technology_blocks_callout_3" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_technology_blocks_callout_3_icon" USING "icon"::"public"."enum_technology_blocks_callout_3_icon";
  ALTER TABLE "technology_blocks_cards_3_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_technology_blocks_cards_3_items_icon" USING "icon"::"public"."enum_technology_blocks_cards_3_items_icon";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_blocks_text" ADD CONSTRAINT "pages_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout_stats" ADD CONSTRAINT "pages_blocks_callout_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_callout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout" ADD CONSTRAINT "pages_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_list_items" ADD CONSTRAINT "pages_blocks_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_list" ADD CONSTRAINT "pages_blocks_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_items" ADD CONSTRAINT "pages_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_rows" ADD CONSTRAINT "pages_blocks_pricing_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing" ADD CONSTRAINT "pages_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricetable_rows" ADD CONSTRAINT "pages_blocks_pricetable_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricetable"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricetable" ADD CONSTRAINT "pages_blocks_pricetable_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_self_video" ADD CONSTRAINT "pages_blocks_self_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pair" ADD CONSTRAINT "pages_blocks_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_2" ADD CONSTRAINT "pages_blocks_text_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout_2_stats" ADD CONSTRAINT "pages_blocks_callout_2_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_callout_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout_2" ADD CONSTRAINT "pages_blocks_callout_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_list_2_items" ADD CONSTRAINT "pages_blocks_list_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_list_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_list_2" ADD CONSTRAINT "pages_blocks_list_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_2_items" ADD CONSTRAINT "pages_blocks_cards_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_2" ADD CONSTRAINT "pages_blocks_cards_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_2_items" ADD CONSTRAINT "pages_blocks_steps_2_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_2" ADD CONSTRAINT "pages_blocks_steps_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_2_rows" ADD CONSTRAINT "pages_blocks_pricing_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_2" ADD CONSTRAINT "pages_blocks_pricing_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricetable_2_rows" ADD CONSTRAINT "pages_blocks_pricetable_2_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricetable_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricetable_2" ADD CONSTRAINT "pages_blocks_pricetable_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_2_images" ADD CONSTRAINT "pages_blocks_gallery_2_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery_2"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_2" ADD CONSTRAINT "pages_blocks_gallery_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_2" ADD CONSTRAINT "pages_blocks_image_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_2" ADD CONSTRAINT "pages_blocks_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_self_video_2" ADD CONSTRAINT "pages_blocks_self_video_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pair_2" ADD CONSTRAINT "pages_blocks_image_pair_2_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_3" ADD CONSTRAINT "pages_blocks_text_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout_3_stats" ADD CONSTRAINT "pages_blocks_callout_3_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_callout_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout_3" ADD CONSTRAINT "pages_blocks_callout_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_list_3_items" ADD CONSTRAINT "pages_blocks_list_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_list_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_list_3" ADD CONSTRAINT "pages_blocks_list_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_3_items" ADD CONSTRAINT "pages_blocks_cards_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cards_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards_3" ADD CONSTRAINT "pages_blocks_cards_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_3_items" ADD CONSTRAINT "pages_blocks_steps_3_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_3" ADD CONSTRAINT "pages_blocks_steps_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_3_rows" ADD CONSTRAINT "pages_blocks_pricing_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_3" ADD CONSTRAINT "pages_blocks_pricing_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricetable_3_rows" ADD CONSTRAINT "pages_blocks_pricetable_3_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricetable_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricetable_3" ADD CONSTRAINT "pages_blocks_pricetable_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_3_images" ADD CONSTRAINT "pages_blocks_gallery_3_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery_3"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_3" ADD CONSTRAINT "pages_blocks_gallery_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_3" ADD CONSTRAINT "pages_blocks_image_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_3" ADD CONSTRAINT "pages_blocks_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_self_video_3" ADD CONSTRAINT "pages_blocks_self_video_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pair_3" ADD CONSTRAINT "pages_blocks_image_pair_3_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_twocol" ADD CONSTRAINT "pages_blocks_twocol_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_text_order_idx" ON "pages_blocks_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_parent_id_idx" ON "pages_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_path_idx" ON "pages_blocks_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_locale_idx" ON "pages_blocks_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_callout_stats_order_idx" ON "pages_blocks_callout_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_stats_parent_id_idx" ON "pages_blocks_callout_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_stats_locale_idx" ON "pages_blocks_callout_stats" USING btree ("_locale");
  CREATE INDEX "pages_blocks_callout_order_idx" ON "pages_blocks_callout" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_parent_id_idx" ON "pages_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_path_idx" ON "pages_blocks_callout" USING btree ("_path");
  CREATE INDEX "pages_blocks_callout_locale_idx" ON "pages_blocks_callout" USING btree ("_locale");
  CREATE INDEX "pages_blocks_list_items_order_idx" ON "pages_blocks_list_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_list_items_parent_id_idx" ON "pages_blocks_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_list_items_locale_idx" ON "pages_blocks_list_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_list_order_idx" ON "pages_blocks_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_list_parent_id_idx" ON "pages_blocks_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_list_path_idx" ON "pages_blocks_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_list_locale_idx" ON "pages_blocks_list" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cards_items_order_idx" ON "pages_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_items_parent_id_idx" ON "pages_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_items_locale_idx" ON "pages_blocks_cards_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cards_order_idx" ON "pages_blocks_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_parent_id_idx" ON "pages_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_path_idx" ON "pages_blocks_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_locale_idx" ON "pages_blocks_cards" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_items_order_idx" ON "pages_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_items_parent_id_idx" ON "pages_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_items_locale_idx" ON "pages_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_steps_locale_idx" ON "pages_blocks_steps" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_rows_order_idx" ON "pages_blocks_pricing_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_rows_parent_id_idx" ON "pages_blocks_pricing_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_rows_locale_idx" ON "pages_blocks_pricing_rows" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_order_idx" ON "pages_blocks_pricing" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_parent_id_idx" ON "pages_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_path_idx" ON "pages_blocks_pricing" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricing_locale_idx" ON "pages_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricetable_rows_order_idx" ON "pages_blocks_pricetable_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricetable_rows_parent_id_idx" ON "pages_blocks_pricetable_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricetable_rows_locale_idx" ON "pages_blocks_pricetable_rows" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricetable_order_idx" ON "pages_blocks_pricetable" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricetable_parent_id_idx" ON "pages_blocks_pricetable" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricetable_path_idx" ON "pages_blocks_pricetable" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricetable_locale_idx" ON "pages_blocks_pricetable" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_images_order_idx" ON "pages_blocks_gallery_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_images_parent_id_idx" ON "pages_blocks_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_images_locale_idx" ON "pages_blocks_gallery_images" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_locale_idx" ON "pages_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_locale_idx" ON "pages_blocks_image" USING btree ("_locale");
  CREATE INDEX "pages_blocks_video_order_idx" ON "pages_blocks_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_parent_id_idx" ON "pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_path_idx" ON "pages_blocks_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_locale_idx" ON "pages_blocks_video" USING btree ("_locale");
  CREATE INDEX "pages_blocks_self_video_order_idx" ON "pages_blocks_self_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_self_video_parent_id_idx" ON "pages_blocks_self_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_self_video_path_idx" ON "pages_blocks_self_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_self_video_locale_idx" ON "pages_blocks_self_video" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_pair_order_idx" ON "pages_blocks_image_pair" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_pair_parent_id_idx" ON "pages_blocks_image_pair" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_pair_path_idx" ON "pages_blocks_image_pair" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_pair_locale_idx" ON "pages_blocks_image_pair" USING btree ("_locale");
  CREATE INDEX "pages_blocks_text_2_order_idx" ON "pages_blocks_text_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_2_parent_id_idx" ON "pages_blocks_text_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_2_path_idx" ON "pages_blocks_text_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_2_locale_idx" ON "pages_blocks_text_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_callout_2_stats_order_idx" ON "pages_blocks_callout_2_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_2_stats_parent_id_idx" ON "pages_blocks_callout_2_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_2_stats_locale_idx" ON "pages_blocks_callout_2_stats" USING btree ("_locale");
  CREATE INDEX "pages_blocks_callout_2_order_idx" ON "pages_blocks_callout_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_2_parent_id_idx" ON "pages_blocks_callout_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_2_path_idx" ON "pages_blocks_callout_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_callout_2_locale_idx" ON "pages_blocks_callout_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_list_2_items_order_idx" ON "pages_blocks_list_2_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_list_2_items_parent_id_idx" ON "pages_blocks_list_2_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_list_2_items_locale_idx" ON "pages_blocks_list_2_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_list_2_order_idx" ON "pages_blocks_list_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_list_2_parent_id_idx" ON "pages_blocks_list_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_list_2_path_idx" ON "pages_blocks_list_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_list_2_locale_idx" ON "pages_blocks_list_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cards_2_items_order_idx" ON "pages_blocks_cards_2_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_2_items_parent_id_idx" ON "pages_blocks_cards_2_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_2_items_locale_idx" ON "pages_blocks_cards_2_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cards_2_order_idx" ON "pages_blocks_cards_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_2_parent_id_idx" ON "pages_blocks_cards_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_2_path_idx" ON "pages_blocks_cards_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_2_locale_idx" ON "pages_blocks_cards_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_2_items_order_idx" ON "pages_blocks_steps_2_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_2_items_parent_id_idx" ON "pages_blocks_steps_2_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_2_items_locale_idx" ON "pages_blocks_steps_2_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_2_order_idx" ON "pages_blocks_steps_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_2_parent_id_idx" ON "pages_blocks_steps_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_2_path_idx" ON "pages_blocks_steps_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_steps_2_locale_idx" ON "pages_blocks_steps_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_2_rows_order_idx" ON "pages_blocks_pricing_2_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_2_rows_parent_id_idx" ON "pages_blocks_pricing_2_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_2_rows_locale_idx" ON "pages_blocks_pricing_2_rows" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_2_order_idx" ON "pages_blocks_pricing_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_2_parent_id_idx" ON "pages_blocks_pricing_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_2_path_idx" ON "pages_blocks_pricing_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricing_2_locale_idx" ON "pages_blocks_pricing_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricetable_2_rows_order_idx" ON "pages_blocks_pricetable_2_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricetable_2_rows_parent_id_idx" ON "pages_blocks_pricetable_2_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricetable_2_rows_locale_idx" ON "pages_blocks_pricetable_2_rows" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricetable_2_order_idx" ON "pages_blocks_pricetable_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricetable_2_parent_id_idx" ON "pages_blocks_pricetable_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricetable_2_path_idx" ON "pages_blocks_pricetable_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricetable_2_locale_idx" ON "pages_blocks_pricetable_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_2_images_order_idx" ON "pages_blocks_gallery_2_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_2_images_parent_id_idx" ON "pages_blocks_gallery_2_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_2_images_locale_idx" ON "pages_blocks_gallery_2_images" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_2_order_idx" ON "pages_blocks_gallery_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_2_parent_id_idx" ON "pages_blocks_gallery_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_2_path_idx" ON "pages_blocks_gallery_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_2_locale_idx" ON "pages_blocks_gallery_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_2_order_idx" ON "pages_blocks_image_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_2_parent_id_idx" ON "pages_blocks_image_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_2_path_idx" ON "pages_blocks_image_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_2_locale_idx" ON "pages_blocks_image_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_video_2_order_idx" ON "pages_blocks_video_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_2_parent_id_idx" ON "pages_blocks_video_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_2_path_idx" ON "pages_blocks_video_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_2_locale_idx" ON "pages_blocks_video_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_self_video_2_order_idx" ON "pages_blocks_self_video_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_self_video_2_parent_id_idx" ON "pages_blocks_self_video_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_self_video_2_path_idx" ON "pages_blocks_self_video_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_self_video_2_locale_idx" ON "pages_blocks_self_video_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_pair_2_order_idx" ON "pages_blocks_image_pair_2" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_pair_2_parent_id_idx" ON "pages_blocks_image_pair_2" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_pair_2_path_idx" ON "pages_blocks_image_pair_2" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_pair_2_locale_idx" ON "pages_blocks_image_pair_2" USING btree ("_locale");
  CREATE INDEX "pages_blocks_text_3_order_idx" ON "pages_blocks_text_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_3_parent_id_idx" ON "pages_blocks_text_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_3_path_idx" ON "pages_blocks_text_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_3_locale_idx" ON "pages_blocks_text_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_callout_3_stats_order_idx" ON "pages_blocks_callout_3_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_3_stats_parent_id_idx" ON "pages_blocks_callout_3_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_3_stats_locale_idx" ON "pages_blocks_callout_3_stats" USING btree ("_locale");
  CREATE INDEX "pages_blocks_callout_3_order_idx" ON "pages_blocks_callout_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_3_parent_id_idx" ON "pages_blocks_callout_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_3_path_idx" ON "pages_blocks_callout_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_callout_3_locale_idx" ON "pages_blocks_callout_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_list_3_items_order_idx" ON "pages_blocks_list_3_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_list_3_items_parent_id_idx" ON "pages_blocks_list_3_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_list_3_items_locale_idx" ON "pages_blocks_list_3_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_list_3_order_idx" ON "pages_blocks_list_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_list_3_parent_id_idx" ON "pages_blocks_list_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_list_3_path_idx" ON "pages_blocks_list_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_list_3_locale_idx" ON "pages_blocks_list_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cards_3_items_order_idx" ON "pages_blocks_cards_3_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_3_items_parent_id_idx" ON "pages_blocks_cards_3_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_3_items_locale_idx" ON "pages_blocks_cards_3_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cards_3_order_idx" ON "pages_blocks_cards_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_3_parent_id_idx" ON "pages_blocks_cards_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_3_path_idx" ON "pages_blocks_cards_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_3_locale_idx" ON "pages_blocks_cards_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_3_items_order_idx" ON "pages_blocks_steps_3_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_3_items_parent_id_idx" ON "pages_blocks_steps_3_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_3_items_locale_idx" ON "pages_blocks_steps_3_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_3_order_idx" ON "pages_blocks_steps_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_3_parent_id_idx" ON "pages_blocks_steps_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_3_path_idx" ON "pages_blocks_steps_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_steps_3_locale_idx" ON "pages_blocks_steps_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_3_rows_order_idx" ON "pages_blocks_pricing_3_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_3_rows_parent_id_idx" ON "pages_blocks_pricing_3_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_3_rows_locale_idx" ON "pages_blocks_pricing_3_rows" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_3_order_idx" ON "pages_blocks_pricing_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_3_parent_id_idx" ON "pages_blocks_pricing_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_3_path_idx" ON "pages_blocks_pricing_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricing_3_locale_idx" ON "pages_blocks_pricing_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricetable_3_rows_order_idx" ON "pages_blocks_pricetable_3_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricetable_3_rows_parent_id_idx" ON "pages_blocks_pricetable_3_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricetable_3_rows_locale_idx" ON "pages_blocks_pricetable_3_rows" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricetable_3_order_idx" ON "pages_blocks_pricetable_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricetable_3_parent_id_idx" ON "pages_blocks_pricetable_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricetable_3_path_idx" ON "pages_blocks_pricetable_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricetable_3_locale_idx" ON "pages_blocks_pricetable_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_3_images_order_idx" ON "pages_blocks_gallery_3_images" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_3_images_parent_id_idx" ON "pages_blocks_gallery_3_images" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_3_images_locale_idx" ON "pages_blocks_gallery_3_images" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_3_order_idx" ON "pages_blocks_gallery_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_3_parent_id_idx" ON "pages_blocks_gallery_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_3_path_idx" ON "pages_blocks_gallery_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_3_locale_idx" ON "pages_blocks_gallery_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_3_order_idx" ON "pages_blocks_image_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_3_parent_id_idx" ON "pages_blocks_image_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_3_path_idx" ON "pages_blocks_image_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_3_locale_idx" ON "pages_blocks_image_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_video_3_order_idx" ON "pages_blocks_video_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_3_parent_id_idx" ON "pages_blocks_video_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_3_path_idx" ON "pages_blocks_video_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_3_locale_idx" ON "pages_blocks_video_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_self_video_3_order_idx" ON "pages_blocks_self_video_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_self_video_3_parent_id_idx" ON "pages_blocks_self_video_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_self_video_3_path_idx" ON "pages_blocks_self_video_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_self_video_3_locale_idx" ON "pages_blocks_self_video_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_pair_3_order_idx" ON "pages_blocks_image_pair_3" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_pair_3_parent_id_idx" ON "pages_blocks_image_pair_3" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_pair_3_path_idx" ON "pages_blocks_image_pair_3" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_pair_3_locale_idx" ON "pages_blocks_image_pair_3" USING btree ("_locale");
  CREATE INDEX "pages_blocks_twocol_order_idx" ON "pages_blocks_twocol" USING btree ("_order");
  CREATE INDEX "pages_blocks_twocol_parent_id_idx" ON "pages_blocks_twocol" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_twocol_path_idx" ON "pages_blocks_twocol" USING btree ("_path");
  CREATE INDEX "pages_blocks_twocol_locale_idx" ON "pages_blocks_twocol" USING btree ("_locale");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_callout_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_callout" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricetable_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricetable" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_self_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_pair" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_text_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_callout_2_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_callout_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_list_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_list_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_2_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricetable_2_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricetable_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_2_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_self_video_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_pair_2" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_text_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_callout_3_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_callout_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_list_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_list_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cards_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_3_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricing_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricetable_3_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_pricetable_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_3_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_self_video_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_image_pair_3" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_twocol" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_text" CASCADE;
  DROP TABLE "pages_blocks_callout_stats" CASCADE;
  DROP TABLE "pages_blocks_callout" CASCADE;
  DROP TABLE "pages_blocks_list_items" CASCADE;
  DROP TABLE "pages_blocks_list" CASCADE;
  DROP TABLE "pages_blocks_cards_items" CASCADE;
  DROP TABLE "pages_blocks_cards" CASCADE;
  DROP TABLE "pages_blocks_steps_items" CASCADE;
  DROP TABLE "pages_blocks_steps" CASCADE;
  DROP TABLE "pages_blocks_pricing_rows" CASCADE;
  DROP TABLE "pages_blocks_pricing" CASCADE;
  DROP TABLE "pages_blocks_pricetable_rows" CASCADE;
  DROP TABLE "pages_blocks_pricetable" CASCADE;
  DROP TABLE "pages_blocks_gallery_images" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_blocks_video" CASCADE;
  DROP TABLE "pages_blocks_self_video" CASCADE;
  DROP TABLE "pages_blocks_image_pair" CASCADE;
  DROP TABLE "pages_blocks_text_2" CASCADE;
  DROP TABLE "pages_blocks_callout_2_stats" CASCADE;
  DROP TABLE "pages_blocks_callout_2" CASCADE;
  DROP TABLE "pages_blocks_list_2_items" CASCADE;
  DROP TABLE "pages_blocks_list_2" CASCADE;
  DROP TABLE "pages_blocks_cards_2_items" CASCADE;
  DROP TABLE "pages_blocks_cards_2" CASCADE;
  DROP TABLE "pages_blocks_steps_2_items" CASCADE;
  DROP TABLE "pages_blocks_steps_2" CASCADE;
  DROP TABLE "pages_blocks_pricing_2_rows" CASCADE;
  DROP TABLE "pages_blocks_pricing_2" CASCADE;
  DROP TABLE "pages_blocks_pricetable_2_rows" CASCADE;
  DROP TABLE "pages_blocks_pricetable_2" CASCADE;
  DROP TABLE "pages_blocks_gallery_2_images" CASCADE;
  DROP TABLE "pages_blocks_gallery_2" CASCADE;
  DROP TABLE "pages_blocks_image_2" CASCADE;
  DROP TABLE "pages_blocks_video_2" CASCADE;
  DROP TABLE "pages_blocks_self_video_2" CASCADE;
  DROP TABLE "pages_blocks_image_pair_2" CASCADE;
  DROP TABLE "pages_blocks_text_3" CASCADE;
  DROP TABLE "pages_blocks_callout_3_stats" CASCADE;
  DROP TABLE "pages_blocks_callout_3" CASCADE;
  DROP TABLE "pages_blocks_list_3_items" CASCADE;
  DROP TABLE "pages_blocks_list_3" CASCADE;
  DROP TABLE "pages_blocks_cards_3_items" CASCADE;
  DROP TABLE "pages_blocks_cards_3" CASCADE;
  DROP TABLE "pages_blocks_steps_3_items" CASCADE;
  DROP TABLE "pages_blocks_steps_3" CASCADE;
  DROP TABLE "pages_blocks_pricing_3_rows" CASCADE;
  DROP TABLE "pages_blocks_pricing_3" CASCADE;
  DROP TABLE "pages_blocks_pricetable_3_rows" CASCADE;
  DROP TABLE "pages_blocks_pricetable_3" CASCADE;
  DROP TABLE "pages_blocks_gallery_3_images" CASCADE;
  DROP TABLE "pages_blocks_gallery_3" CASCADE;
  DROP TABLE "pages_blocks_image_3" CASCADE;
  DROP TABLE "pages_blocks_video_3" CASCADE;
  DROP TABLE "pages_blocks_self_video_3" CASCADE;
  DROP TABLE "pages_blocks_image_pair_3" CASCADE;
  DROP TABLE "pages_blocks_twocol" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "services_blocks_callout" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "services_blocks_cards_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "services_blocks_callout_2" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "services_blocks_cards_2_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "services_blocks_callout_3" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "services_blocks_cards_3_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "technology_blocks_callout" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "technology_blocks_cards_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "technology_blocks_callout_2" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "technology_blocks_cards_2_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "technology_blocks_callout_3" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "technology_blocks_cards_3_items" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_pages_blocks_callout_icon";
  DROP TYPE "public"."enum_pages_blocks_cards_items_icon";
  DROP TYPE "public"."enum_pages_blocks_image_size";
  DROP TYPE "public"."enum_pages_blocks_callout_2_icon";
  DROP TYPE "public"."enum_pages_blocks_cards_2_items_icon";
  DROP TYPE "public"."enum_pages_blocks_image_2_size";
  DROP TYPE "public"."enum_pages_blocks_callout_3_icon";
  DROP TYPE "public"."enum_pages_blocks_cards_3_items_icon";
  DROP TYPE "public"."enum_pages_blocks_image_3_size";
  DROP TYPE "public"."enum_services_blocks_callout_icon";
  DROP TYPE "public"."enum_services_blocks_cards_items_icon";
  DROP TYPE "public"."enum_services_blocks_callout_2_icon";
  DROP TYPE "public"."enum_services_blocks_cards_2_items_icon";
  DROP TYPE "public"."enum_services_blocks_callout_3_icon";
  DROP TYPE "public"."enum_services_blocks_cards_3_items_icon";
  DROP TYPE "public"."enum_technology_blocks_callout_icon";
  DROP TYPE "public"."enum_technology_blocks_cards_items_icon";
  DROP TYPE "public"."enum_technology_blocks_callout_2_icon";
  DROP TYPE "public"."enum_technology_blocks_cards_2_items_icon";
  DROP TYPE "public"."enum_technology_blocks_callout_3_icon";
  DROP TYPE "public"."enum_technology_blocks_cards_3_items_icon";`)
}
