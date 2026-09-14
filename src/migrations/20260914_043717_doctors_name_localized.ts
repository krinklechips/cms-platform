import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "doctors_locales" ADD COLUMN "name" varchar;
  ALTER TABLE "_doctors_v_locales" ADD COLUMN "version_name" varchar;
  -- Hand-written: carry the English name into the locales tables BEFORE the
  -- generated drops below, or 40 doctor names would be lost.
  UPDATE "doctors_locales" l SET "name" = d."name" FROM "doctors" d WHERE l."_parent_id" = d."id" AND l."_locale" = 'en';
  INSERT INTO "doctors_locales" ("_parent_id", "_locale", "name")
    SELECT d."id", 'en', d."name" FROM "doctors" d
    WHERE NOT EXISTS (SELECT 1 FROM "doctors_locales" l WHERE l."_parent_id" = d."id" AND l."_locale" = 'en');
  UPDATE "_doctors_v_locales" l SET "version_name" = v."version_name" FROM "_doctors_v" v WHERE l."_parent_id" = v."id" AND l."_locale" = 'en';
  INSERT INTO "_doctors_v_locales" ("_parent_id", "_locale", "version_name")
    SELECT v."id", 'en', v."version_name" FROM "_doctors_v" v
    WHERE NOT EXISTS (SELECT 1 FROM "_doctors_v_locales" l WHERE l."_parent_id" = v."id" AND l."_locale" = 'en');
  ALTER TABLE "doctors" DROP COLUMN "name";
  ALTER TABLE "_doctors_v" DROP COLUMN "version_name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "doctors" ADD COLUMN "name" varchar;
  ALTER TABLE "_doctors_v" ADD COLUMN "version_name" varchar;
  ALTER TABLE "doctors_locales" DROP COLUMN "name";
  ALTER TABLE "_doctors_v_locales" DROP COLUMN "version_name";`)
}
