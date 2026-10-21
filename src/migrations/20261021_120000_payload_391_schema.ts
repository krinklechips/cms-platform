import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Null keys retain the legacy prefix/filename location. Never backfill object identity.
  await db.execute(sql`ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar`)
  // Payload 3.91 also reads this hidden field when serializing authenticated users.
  await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Refusing to discard storage keys or password-reset request state. Use a reviewed recovery migration.')
}
