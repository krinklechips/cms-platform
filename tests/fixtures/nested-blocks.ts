// Entirely synthetic. IDs deliberately overlap between version tables, not within them.
export const locales = ['en', 'kh', 'cn'] as const
export const wording = (locale: string, phase: string) =>
  `${locale} ${phase}: 'quoted'\n${locale === 'kh' ? '\u1780\u17d2\u1798\u17c2\u179a' : locale === 'cn' ? '\u4e2d\u6587' : 'Synthetic text'}`

export function nestedBlockFixture(collection: 'services' | 'technology', parent: number, phase: string, media: number, version: boolean) {
  const prefix = version ? `_${collection}_v` : collection
  const rootPath = version ? 'version.sections' : 'sections'
  const rows: Record<string, Record<string, unknown>[]> = {}
  const add = (table: string, row: Record<string, unknown>) => (rows[`${prefix}_blocks_${table}`] ??= []).push(row)
  for (const locale of locales) {
    const base = { _parent_id: parent, _locale: locale, _path: rootPath }
    const id = (suffix: string) => ({ [version ? '_uuid' : 'id']: `${collection}-${phase}-${locale}-${suffix}` })
    const position = collection === 'services' ? 0 : 2
    add('twocol', { ...base, ...id('columns'), _order: position + 1, block_name: `${locale} columns` })
    for (let i = 0; i < (collection === 'services' ? 1 : 2); i++) add('text', {
      ...base, ...id(`root-${i}`), _order: collection === 'services' ? 2 : i + 1,
      heading: `${locale} root`, body: `${phase} untouched root ${i}`, card: null, block_name: null,
    })
    add('text_2', { ...base, ...id('left'), _path: `${rootPath}.${position}.left`, _order: 1,
      heading: `${locale} ${phase} left`, body: wording(locale, phase), card: false, block_name: `${locale} left` })
    const right = { ...base, ...id('right'), _path: `${rootPath}.${position}.right`, _order: 1, block_name: null }
    if (collection === 'services') add('callout_3', {
      ...right, title: `${locale} ${phase} right`, body: `${wording(locale, phase)} right`, icon: 'Tooth',
    })
    else add('image_3', { ...right, media_id: media, src: 'https://example.invalid/fallback.png',
      alt: `${locale} ${phase} alt`, heading: null, subheading: '', caption: `${locale} ${phase} caption`,
      size: 'medium', width: 640, height: 480 })
    if (collection === 'services') add('callout', { ...base, ...id('root-callout'), _order: 3,
      title: `${locale} root callout`, body: `${phase} untouched callout`, icon: 'Tooth', block_name: null })
    else add('image', { ...base, ...id('root-image'), _order: 4, media_id: media,
      src: 'https://example.invalid/root.png', alt: `${locale} root photo`, size: 'small', block_name: null })
  }
  return rows
}
