import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_stats_locales" ADD COLUMN "display_value" varchar;
  ALTER TABLE "site_stats_locales" ADD COLUMN "suffix" varchar;
  ALTER TABLE "_site_stats_v_locales" ADD COLUMN "version_display_value" varchar;
  ALTER TABLE "_site_stats_v_locales" ADD COLUMN "version_suffix" varchar;
  ALTER TABLE "site_stats_locales" ADD COLUMN "original_display_value" varchar;
  ALTER TABLE "_site_stats_v_locales" ADD COLUMN "version_original_display_value" varchar;

  -- Copy each record's own values, including private drafts and older revisions.
  UPDATE "site_stats_locales" l SET "display_value" = s."display_value", "suffix" = s."suffix", "original_display_value" = s."display_value"
    FROM "site_stats" s WHERE l."_parent_id" = s."id";
  INSERT INTO "site_stats_locales" ("_parent_id", "_locale", "display_value", "suffix", "original_display_value")
    SELECT s."id", loc, s."display_value", s."suffix", s."display_value"
    FROM "site_stats" s CROSS JOIN unnest(enum_range(NULL::"_locales")) loc
    WHERE NOT EXISTS (SELECT 1 FROM "site_stats_locales" l WHERE l."_parent_id" = s."id" AND l."_locale" = loc);
  UPDATE "_site_stats_v_locales" l SET "version_display_value" = s."version_display_value", "version_suffix" = s."version_suffix", "version_original_display_value" = s."version_display_value"
    FROM "_site_stats_v" s WHERE l."_parent_id" = s."id";
  INSERT INTO "_site_stats_v_locales" ("_parent_id", "_locale", "version_display_value", "version_suffix", "version_original_display_value")
    SELECT s."id", loc, s."version_display_value", s."version_suffix", s."version_display_value"
    FROM "_site_stats_v" s CROSS JOIN unnest(enum_range(NULL::"_locales")) loc
    WHERE NOT EXISTS (SELECT 1 FROM "_site_stats_v_locales" l WHERE l."_parent_id" = s."id" AND l."_locale" = loc);
  -- Original global columns are intentionally retained as recovery data.`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Refusing to discard localized staff edits. Export all locales and use a reviewed recovery migration.')
}
