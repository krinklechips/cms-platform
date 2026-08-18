import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_doctors_department" AS ENUM('GENERAL', 'ORTHODONTICS', 'IMPLANTOLOGY', 'COSMETIC', 'PEDIATRICS', 'SENIOR_CONSULTANT', 'DIRECTOR');
  ALTER TABLE "doctors" ALTER COLUMN "department" SET DATA TYPE "public"."enum_doctors_department" USING "department"::"public"."enum_doctors_department";
  ALTER TABLE "pages_blocks_gallery_images" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_blocks_image" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_blocks_image_pair" ADD COLUMN "left_media_id" integer;
  ALTER TABLE "pages_blocks_image_pair" ADD COLUMN "right_media_id" integer;
  ALTER TABLE "pages_blocks_gallery_2_images" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_blocks_image_2" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_blocks_image_pair_2" ADD COLUMN "left_media_id" integer;
  ALTER TABLE "pages_blocks_image_pair_2" ADD COLUMN "right_media_id" integer;
  ALTER TABLE "pages_blocks_gallery_3_images" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_blocks_image_3" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_blocks_image_pair_3" ADD COLUMN "left_media_id" integer;
  ALTER TABLE "pages_blocks_image_pair_3" ADD COLUMN "right_media_id" integer;
  ALTER TABLE "services_blocks_gallery_images" ADD COLUMN "media_id" integer;
  ALTER TABLE "services_blocks_image" ADD COLUMN "media_id" integer;
  ALTER TABLE "services_blocks_image_pair" ADD COLUMN "left_media_id" integer;
  ALTER TABLE "services_blocks_image_pair" ADD COLUMN "right_media_id" integer;
  ALTER TABLE "services_blocks_gallery_2_images" ADD COLUMN "media_id" integer;
  ALTER TABLE "services_blocks_image_2" ADD COLUMN "media_id" integer;
  ALTER TABLE "services_blocks_image_pair_2" ADD COLUMN "left_media_id" integer;
  ALTER TABLE "services_blocks_image_pair_2" ADD COLUMN "right_media_id" integer;
  ALTER TABLE "services_blocks_gallery_3_images" ADD COLUMN "media_id" integer;
  ALTER TABLE "services_blocks_image_3" ADD COLUMN "media_id" integer;
  ALTER TABLE "services_blocks_image_pair_3" ADD COLUMN "left_media_id" integer;
  ALTER TABLE "services_blocks_image_pair_3" ADD COLUMN "right_media_id" integer;
  ALTER TABLE "technology_blocks_gallery_images" ADD COLUMN "media_id" integer;
  ALTER TABLE "technology_blocks_image" ADD COLUMN "media_id" integer;
  ALTER TABLE "technology_blocks_image_pair" ADD COLUMN "left_media_id" integer;
  ALTER TABLE "technology_blocks_image_pair" ADD COLUMN "right_media_id" integer;
  ALTER TABLE "technology_blocks_gallery_2_images" ADD COLUMN "media_id" integer;
  ALTER TABLE "technology_blocks_image_2" ADD COLUMN "media_id" integer;
  ALTER TABLE "technology_blocks_image_pair_2" ADD COLUMN "left_media_id" integer;
  ALTER TABLE "technology_blocks_image_pair_2" ADD COLUMN "right_media_id" integer;
  ALTER TABLE "technology_blocks_gallery_3_images" ADD COLUMN "media_id" integer;
  ALTER TABLE "technology_blocks_image_3" ADD COLUMN "media_id" integer;
  ALTER TABLE "technology_blocks_image_pair_3" ADD COLUMN "left_media_id" integer;
  ALTER TABLE "technology_blocks_image_pair_3" ADD COLUMN "right_media_id" integer;
  ALTER TABLE "pages_blocks_gallery_images" ADD CONSTRAINT "pages_blocks_gallery_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pair" ADD CONSTRAINT "pages_blocks_image_pair_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pair" ADD CONSTRAINT "pages_blocks_image_pair_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_2_images" ADD CONSTRAINT "pages_blocks_gallery_2_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_2" ADD CONSTRAINT "pages_blocks_image_2_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pair_2" ADD CONSTRAINT "pages_blocks_image_pair_2_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pair_2" ADD CONSTRAINT "pages_blocks_image_pair_2_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_3_images" ADD CONSTRAINT "pages_blocks_gallery_3_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_3" ADD CONSTRAINT "pages_blocks_image_3_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pair_3" ADD CONSTRAINT "pages_blocks_image_pair_3_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_pair_3" ADD CONSTRAINT "pages_blocks_image_pair_3_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_images" ADD CONSTRAINT "services_blocks_gallery_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image" ADD CONSTRAINT "services_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_pair" ADD CONSTRAINT "services_blocks_image_pair_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_pair" ADD CONSTRAINT "services_blocks_image_pair_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_2_images" ADD CONSTRAINT "services_blocks_gallery_2_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_2" ADD CONSTRAINT "services_blocks_image_2_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_pair_2" ADD CONSTRAINT "services_blocks_image_pair_2_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_pair_2" ADD CONSTRAINT "services_blocks_image_pair_2_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery_3_images" ADD CONSTRAINT "services_blocks_gallery_3_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_3" ADD CONSTRAINT "services_blocks_image_3_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_pair_3" ADD CONSTRAINT "services_blocks_image_pair_3_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_image_pair_3" ADD CONSTRAINT "services_blocks_image_pair_3_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_gallery_images" ADD CONSTRAINT "technology_blocks_gallery_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_image" ADD CONSTRAINT "technology_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_pair" ADD CONSTRAINT "technology_blocks_image_pair_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_pair" ADD CONSTRAINT "technology_blocks_image_pair_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_gallery_2_images" ADD CONSTRAINT "technology_blocks_gallery_2_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_2" ADD CONSTRAINT "technology_blocks_image_2_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_pair_2" ADD CONSTRAINT "technology_blocks_image_pair_2_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_pair_2" ADD CONSTRAINT "technology_blocks_image_pair_2_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_gallery_3_images" ADD CONSTRAINT "technology_blocks_gallery_3_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_3" ADD CONSTRAINT "technology_blocks_image_3_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_pair_3" ADD CONSTRAINT "technology_blocks_image_pair_3_left_media_id_media_id_fk" FOREIGN KEY ("left_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "technology_blocks_image_pair_3" ADD CONSTRAINT "technology_blocks_image_pair_3_right_media_id_media_id_fk" FOREIGN KEY ("right_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_gallery_images_media_idx" ON "pages_blocks_gallery_images" USING btree ("media_id");
  CREATE INDEX "pages_blocks_image_media_idx" ON "pages_blocks_image" USING btree ("media_id");
  CREATE INDEX "pages_blocks_image_pair_left_left_media_idx" ON "pages_blocks_image_pair" USING btree ("left_media_id");
  CREATE INDEX "pages_blocks_image_pair_right_right_media_idx" ON "pages_blocks_image_pair" USING btree ("right_media_id");
  CREATE INDEX "pages_blocks_gallery_2_images_media_idx" ON "pages_blocks_gallery_2_images" USING btree ("media_id");
  CREATE INDEX "pages_blocks_image_2_media_idx" ON "pages_blocks_image_2" USING btree ("media_id");
  CREATE INDEX "pages_blocks_image_pair_2_left_left_media_idx" ON "pages_blocks_image_pair_2" USING btree ("left_media_id");
  CREATE INDEX "pages_blocks_image_pair_2_right_right_media_idx" ON "pages_blocks_image_pair_2" USING btree ("right_media_id");
  CREATE INDEX "pages_blocks_gallery_3_images_media_idx" ON "pages_blocks_gallery_3_images" USING btree ("media_id");
  CREATE INDEX "pages_blocks_image_3_media_idx" ON "pages_blocks_image_3" USING btree ("media_id");
  CREATE INDEX "pages_blocks_image_pair_3_left_left_media_idx" ON "pages_blocks_image_pair_3" USING btree ("left_media_id");
  CREATE INDEX "pages_blocks_image_pair_3_right_right_media_idx" ON "pages_blocks_image_pair_3" USING btree ("right_media_id");
  CREATE INDEX "services_blocks_gallery_images_media_idx" ON "services_blocks_gallery_images" USING btree ("media_id");
  CREATE INDEX "services_blocks_image_media_idx" ON "services_blocks_image" USING btree ("media_id");
  CREATE INDEX "services_blocks_image_pair_left_left_media_idx" ON "services_blocks_image_pair" USING btree ("left_media_id");
  CREATE INDEX "services_blocks_image_pair_right_right_media_idx" ON "services_blocks_image_pair" USING btree ("right_media_id");
  CREATE INDEX "services_blocks_gallery_2_images_media_idx" ON "services_blocks_gallery_2_images" USING btree ("media_id");
  CREATE INDEX "services_blocks_image_2_media_idx" ON "services_blocks_image_2" USING btree ("media_id");
  CREATE INDEX "services_blocks_image_pair_2_left_left_media_idx" ON "services_blocks_image_pair_2" USING btree ("left_media_id");
  CREATE INDEX "services_blocks_image_pair_2_right_right_media_idx" ON "services_blocks_image_pair_2" USING btree ("right_media_id");
  CREATE INDEX "services_blocks_gallery_3_images_media_idx" ON "services_blocks_gallery_3_images" USING btree ("media_id");
  CREATE INDEX "services_blocks_image_3_media_idx" ON "services_blocks_image_3" USING btree ("media_id");
  CREATE INDEX "services_blocks_image_pair_3_left_left_media_idx" ON "services_blocks_image_pair_3" USING btree ("left_media_id");
  CREATE INDEX "services_blocks_image_pair_3_right_right_media_idx" ON "services_blocks_image_pair_3" USING btree ("right_media_id");
  CREATE INDEX "technology_blocks_gallery_images_media_idx" ON "technology_blocks_gallery_images" USING btree ("media_id");
  CREATE INDEX "technology_blocks_image_media_idx" ON "technology_blocks_image" USING btree ("media_id");
  CREATE INDEX "technology_blocks_image_pair_left_left_media_idx" ON "technology_blocks_image_pair" USING btree ("left_media_id");
  CREATE INDEX "technology_blocks_image_pair_right_right_media_idx" ON "technology_blocks_image_pair" USING btree ("right_media_id");
  CREATE INDEX "technology_blocks_gallery_2_images_media_idx" ON "technology_blocks_gallery_2_images" USING btree ("media_id");
  CREATE INDEX "technology_blocks_image_2_media_idx" ON "technology_blocks_image_2" USING btree ("media_id");
  CREATE INDEX "technology_blocks_image_pair_2_left_left_media_idx" ON "technology_blocks_image_pair_2" USING btree ("left_media_id");
  CREATE INDEX "technology_blocks_image_pair_2_right_right_media_idx" ON "technology_blocks_image_pair_2" USING btree ("right_media_id");
  CREATE INDEX "technology_blocks_gallery_3_images_media_idx" ON "technology_blocks_gallery_3_images" USING btree ("media_id");
  CREATE INDEX "technology_blocks_image_3_media_idx" ON "technology_blocks_image_3" USING btree ("media_id");
  CREATE INDEX "technology_blocks_image_pair_3_left_left_media_idx" ON "technology_blocks_image_pair_3" USING btree ("left_media_id");
  CREATE INDEX "technology_blocks_image_pair_3_right_right_media_idx" ON "technology_blocks_image_pair_3" USING btree ("right_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_gallery_images" DROP CONSTRAINT "pages_blocks_gallery_images_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_image" DROP CONSTRAINT "pages_blocks_image_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_image_pair" DROP CONSTRAINT "pages_blocks_image_pair_left_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_image_pair" DROP CONSTRAINT "pages_blocks_image_pair_right_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_gallery_2_images" DROP CONSTRAINT "pages_blocks_gallery_2_images_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_image_2" DROP CONSTRAINT "pages_blocks_image_2_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_image_pair_2" DROP CONSTRAINT "pages_blocks_image_pair_2_left_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_image_pair_2" DROP CONSTRAINT "pages_blocks_image_pair_2_right_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_gallery_3_images" DROP CONSTRAINT "pages_blocks_gallery_3_images_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_image_3" DROP CONSTRAINT "pages_blocks_image_3_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_image_pair_3" DROP CONSTRAINT "pages_blocks_image_pair_3_left_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_image_pair_3" DROP CONSTRAINT "pages_blocks_image_pair_3_right_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_gallery_images" DROP CONSTRAINT "services_blocks_gallery_images_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_image" DROP CONSTRAINT "services_blocks_image_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_image_pair" DROP CONSTRAINT "services_blocks_image_pair_left_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_image_pair" DROP CONSTRAINT "services_blocks_image_pair_right_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_gallery_2_images" DROP CONSTRAINT "services_blocks_gallery_2_images_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_image_2" DROP CONSTRAINT "services_blocks_image_2_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_image_pair_2" DROP CONSTRAINT "services_blocks_image_pair_2_left_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_image_pair_2" DROP CONSTRAINT "services_blocks_image_pair_2_right_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_gallery_3_images" DROP CONSTRAINT "services_blocks_gallery_3_images_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_image_3" DROP CONSTRAINT "services_blocks_image_3_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_image_pair_3" DROP CONSTRAINT "services_blocks_image_pair_3_left_media_id_media_id_fk";
  
  ALTER TABLE "services_blocks_image_pair_3" DROP CONSTRAINT "services_blocks_image_pair_3_right_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_gallery_images" DROP CONSTRAINT "technology_blocks_gallery_images_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_image" DROP CONSTRAINT "technology_blocks_image_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_image_pair" DROP CONSTRAINT "technology_blocks_image_pair_left_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_image_pair" DROP CONSTRAINT "technology_blocks_image_pair_right_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_gallery_2_images" DROP CONSTRAINT "technology_blocks_gallery_2_images_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_image_2" DROP CONSTRAINT "technology_blocks_image_2_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_image_pair_2" DROP CONSTRAINT "technology_blocks_image_pair_2_left_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_image_pair_2" DROP CONSTRAINT "technology_blocks_image_pair_2_right_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_gallery_3_images" DROP CONSTRAINT "technology_blocks_gallery_3_images_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_image_3" DROP CONSTRAINT "technology_blocks_image_3_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_image_pair_3" DROP CONSTRAINT "technology_blocks_image_pair_3_left_media_id_media_id_fk";
  
  ALTER TABLE "technology_blocks_image_pair_3" DROP CONSTRAINT "technology_blocks_image_pair_3_right_media_id_media_id_fk";
  
  DROP INDEX "pages_blocks_gallery_images_media_idx";
  DROP INDEX "pages_blocks_image_media_idx";
  DROP INDEX "pages_blocks_image_pair_left_left_media_idx";
  DROP INDEX "pages_blocks_image_pair_right_right_media_idx";
  DROP INDEX "pages_blocks_gallery_2_images_media_idx";
  DROP INDEX "pages_blocks_image_2_media_idx";
  DROP INDEX "pages_blocks_image_pair_2_left_left_media_idx";
  DROP INDEX "pages_blocks_image_pair_2_right_right_media_idx";
  DROP INDEX "pages_blocks_gallery_3_images_media_idx";
  DROP INDEX "pages_blocks_image_3_media_idx";
  DROP INDEX "pages_blocks_image_pair_3_left_left_media_idx";
  DROP INDEX "pages_blocks_image_pair_3_right_right_media_idx";
  DROP INDEX "services_blocks_gallery_images_media_idx";
  DROP INDEX "services_blocks_image_media_idx";
  DROP INDEX "services_blocks_image_pair_left_left_media_idx";
  DROP INDEX "services_blocks_image_pair_right_right_media_idx";
  DROP INDEX "services_blocks_gallery_2_images_media_idx";
  DROP INDEX "services_blocks_image_2_media_idx";
  DROP INDEX "services_blocks_image_pair_2_left_left_media_idx";
  DROP INDEX "services_blocks_image_pair_2_right_right_media_idx";
  DROP INDEX "services_blocks_gallery_3_images_media_idx";
  DROP INDEX "services_blocks_image_3_media_idx";
  DROP INDEX "services_blocks_image_pair_3_left_left_media_idx";
  DROP INDEX "services_blocks_image_pair_3_right_right_media_idx";
  DROP INDEX "technology_blocks_gallery_images_media_idx";
  DROP INDEX "technology_blocks_image_media_idx";
  DROP INDEX "technology_blocks_image_pair_left_left_media_idx";
  DROP INDEX "technology_blocks_image_pair_right_right_media_idx";
  DROP INDEX "technology_blocks_gallery_2_images_media_idx";
  DROP INDEX "technology_blocks_image_2_media_idx";
  DROP INDEX "technology_blocks_image_pair_2_left_left_media_idx";
  DROP INDEX "technology_blocks_image_pair_2_right_right_media_idx";
  DROP INDEX "technology_blocks_gallery_3_images_media_idx";
  DROP INDEX "technology_blocks_image_3_media_idx";
  DROP INDEX "technology_blocks_image_pair_3_left_left_media_idx";
  DROP INDEX "technology_blocks_image_pair_3_right_right_media_idx";
  ALTER TABLE "doctors" ALTER COLUMN "department" SET DATA TYPE varchar;
  ALTER TABLE "pages_blocks_gallery_images" DROP COLUMN "media_id";
  ALTER TABLE "pages_blocks_image" DROP COLUMN "media_id";
  ALTER TABLE "pages_blocks_image_pair" DROP COLUMN "left_media_id";
  ALTER TABLE "pages_blocks_image_pair" DROP COLUMN "right_media_id";
  ALTER TABLE "pages_blocks_gallery_2_images" DROP COLUMN "media_id";
  ALTER TABLE "pages_blocks_image_2" DROP COLUMN "media_id";
  ALTER TABLE "pages_blocks_image_pair_2" DROP COLUMN "left_media_id";
  ALTER TABLE "pages_blocks_image_pair_2" DROP COLUMN "right_media_id";
  ALTER TABLE "pages_blocks_gallery_3_images" DROP COLUMN "media_id";
  ALTER TABLE "pages_blocks_image_3" DROP COLUMN "media_id";
  ALTER TABLE "pages_blocks_image_pair_3" DROP COLUMN "left_media_id";
  ALTER TABLE "pages_blocks_image_pair_3" DROP COLUMN "right_media_id";
  ALTER TABLE "services_blocks_gallery_images" DROP COLUMN "media_id";
  ALTER TABLE "services_blocks_image" DROP COLUMN "media_id";
  ALTER TABLE "services_blocks_image_pair" DROP COLUMN "left_media_id";
  ALTER TABLE "services_blocks_image_pair" DROP COLUMN "right_media_id";
  ALTER TABLE "services_blocks_gallery_2_images" DROP COLUMN "media_id";
  ALTER TABLE "services_blocks_image_2" DROP COLUMN "media_id";
  ALTER TABLE "services_blocks_image_pair_2" DROP COLUMN "left_media_id";
  ALTER TABLE "services_blocks_image_pair_2" DROP COLUMN "right_media_id";
  ALTER TABLE "services_blocks_gallery_3_images" DROP COLUMN "media_id";
  ALTER TABLE "services_blocks_image_3" DROP COLUMN "media_id";
  ALTER TABLE "services_blocks_image_pair_3" DROP COLUMN "left_media_id";
  ALTER TABLE "services_blocks_image_pair_3" DROP COLUMN "right_media_id";
  ALTER TABLE "technology_blocks_gallery_images" DROP COLUMN "media_id";
  ALTER TABLE "technology_blocks_image" DROP COLUMN "media_id";
  ALTER TABLE "technology_blocks_image_pair" DROP COLUMN "left_media_id";
  ALTER TABLE "technology_blocks_image_pair" DROP COLUMN "right_media_id";
  ALTER TABLE "technology_blocks_gallery_2_images" DROP COLUMN "media_id";
  ALTER TABLE "technology_blocks_image_2" DROP COLUMN "media_id";
  ALTER TABLE "technology_blocks_image_pair_2" DROP COLUMN "left_media_id";
  ALTER TABLE "technology_blocks_image_pair_2" DROP COLUMN "right_media_id";
  ALTER TABLE "technology_blocks_gallery_3_images" DROP COLUMN "media_id";
  ALTER TABLE "technology_blocks_image_3" DROP COLUMN "media_id";
  ALTER TABLE "technology_blocks_image_pair_3" DROP COLUMN "left_media_id";
  ALTER TABLE "technology_blocks_image_pair_3" DROP COLUMN "right_media_id";
  DROP TYPE "public"."enum_doctors_department";`)
}
