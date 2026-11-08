import { type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE TYPE "public"."service_section_spacing" AS ENUM('default', 'compact', 'none');
ALTER TABLE "services_blocks_text" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_callout" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_list" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_cards" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_steps" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_pricing" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_pricetable" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_gallery" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_image" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_video" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_self_video" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_image_pair" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "services_blocks_twocol" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_text" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_callout" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_list" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_cards" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_steps" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_pricing" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_pricetable" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_gallery" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_image" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_video" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_self_video" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_image_pair" ADD COLUMN "section_spacing" "service_section_spacing";
ALTER TABLE "_services_v_blocks_twocol" ADD COLUMN "section_spacing" "service_section_spacing";
`);
}

export async function down(): Promise<void> {
  throw new Error('Service spacing settings and all editorial data are retained. Roll back application code, not stored updates.');
}
