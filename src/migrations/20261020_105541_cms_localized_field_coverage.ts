import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Frozen migration mapping: target locale column -> original recovery column.
const localizedColumns: Record<string, Record<string, string>> = {
  faq_items: { category: 'category' },
  pricing_comparison_rows: { treatment: 'treatment' },
  pricing_comparison_sets: { source_note: 'source_note' },
  partner_categories: { name: 'name' },
  international_steps: { step_label: 'step_label' },
  career_positions: { department: 'department', type: 'type', location: 'location' },
  videos: { topic: 'topic', treatment: 'treatment' },
  news_articles: { image_alt: 'image_alt' },
  community_articles: { image_alt: 'image_alt' },
  timeline_events: { image_alt: 'image_alt' },
  publications: { abstract: 'abstract', display_title: 'title' },
  branches: { display_name: 'name', short_display_name: 'short_name' },
}
const firstLocaleTables = new Set(['pricing_comparison_rows', 'pricing_comparison_sets', 'partner_categories', 'publications'])
const englishCategoryKeys = [
  ['Full Mouth', 'full-mouth-reconstruction'],
  ['Implants & Crowns', 'implants-and-crowns'],
  ['Implant Bridges', 'implant-bridges'],
  ['Orthodontics', 'orthodontics'],
  ['Cosmetic & E-Max', 'cosmetic-and-emax'],
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [collection, mapping] of Object.entries(localizedColumns)) {
    for (const version of [false, true]) {
      const table = version ? `_${collection}_v` : collection
      const localeTable = `${table}_locales`
      const prefix = version ? 'version_' : ''
      const columns = Object.entries(mapping).map(([target, source]) => [prefix + target, prefix + source])
      if (firstLocaleTables.has(collection)) {
        await db.execute(sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(localeTable)} (
          "id" serial PRIMARY KEY NOT NULL,
          "_locale" "_locales" NOT NULL,
          "_parent_id" integer NOT NULL,
          CONSTRAINT ${sql.identifier(`${localeTable}_parent_id_fk`)} FOREIGN KEY ("_parent_id")
            REFERENCES ${sql.identifier(table)}("id") ON DELETE cascade ON UPDATE no action
        )`)
        await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS ${sql.identifier(`${localeTable}_locale_parent_id_unique`)}
          ON ${sql.identifier(localeTable)} USING btree ("_locale", "_parent_id")`)
      }
      for (const [target] of columns) {
        await db.execute(sql`ALTER TABLE ${sql.identifier(localeTable)} ADD COLUMN IF NOT EXISTS ${sql.identifier(target)} varchar`)
      }
      // Insert EN only, using this exact parent/version row, never its published parent.
      // On retry, retain staff edits (including empty strings) and all old locale columns.
      await db.execute(sql`INSERT INTO ${sql.identifier(localeTable)} AS localized
        ("_parent_id", "_locale", ${sql.join(columns.map(([target]) => sql.identifier(target)), sql`, `)})
        SELECT "id", 'en', ${sql.join(columns.map(([, source]) => sql.identifier(source)), sql`, `)} FROM ${sql.identifier(table)}
        ON CONFLICT ("_locale", "_parent_id") DO UPDATE SET
        ${sql.join(columns.map(([target]) => sql`${sql.identifier(target)} = COALESCE(localized.${sql.identifier(target)}, excluded.${sql.identifier(target)})`), sql`, `)}`)
    }
  }

  for (const version of [false, true]) {
    const table = version ? '_clinical_cases_v' : 'clinical_cases'
    const key = version ? 'version_category_key' : 'category_key'
    const category = version ? 'version_category' : 'category'
    const enumName = version ? 'enum__clinical_cases_v_version_category_key' : 'enum_clinical_cases_category_key'
    // All names/values are frozen constants, not configuration or editorial input.
    await db.execute(sql.raw(`DO $$ BEGIN
      CREATE TYPE "public"."${enumName}" AS ENUM (${englishCategoryKeys.map(([, value]) => `'${value}'`).join(', ')});
      EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`))
    await db.execute(sql`ALTER TABLE ${sql.identifier(table)} ADD COLUMN IF NOT EXISTS ${sql.identifier(key)} ${sql.identifier(enumName)}`)
    const mappings = englishCategoryKeys.flatMap(([label, value]) => [
      sql`WHEN ${label} THEN ${value}`,
      sql`WHEN ${value} THEN ${value}`,
    ])
    await db.execute(sql`UPDATE ${sql.identifier(table)} AS record
      SET ${sql.identifier(key)} = (CASE english.${sql.identifier(category)}
        ${sql.join(mappings, sql` `)} ELSE NULL END)::${sql.identifier(enumName)}
      FROM ${sql.identifier(`${table}_locales`)} AS english
      WHERE english."_parent_id" = record."id" AND english."_locale" = 'en'
        AND record.${sql.identifier(key)} IS NULL`)
  }
  // Every original global column is deliberately retained, including old draft/version values.
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Refusing data loss: localized edits and clinical category keys require an exported, reviewed recovery migration.')
}
