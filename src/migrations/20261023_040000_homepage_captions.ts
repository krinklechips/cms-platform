import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// No database default or backfill: existing published and draft locale rows remain unchanged.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
ALTER TABLE "homepage_locales" ADD COLUMN "show_captions" boolean;
ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_show_captions" boolean;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Refused destructive rollback. Preserve homepage caption settings and draft history; review a forward migration for recovery.')
}
