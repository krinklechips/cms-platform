import { getPayload } from 'payload'
import config from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config })
  const doc = await payload.create({
    collection: 'pages',
    locale: 'en',
    overrideAccess: true,
    data: {
      title: 'Welcome to Roomchang',
      tenant: 1,
      published: true,
      sections: [
        {
          blockType: 'text',
          heading: 'A page made in the CMS',
          body: 'This page was created from the CMS with just a title — the web address was generated automatically. It renders through the same section system as every service page.',
        },
        {
          blockType: 'cards',
          heading: 'What editors can add',
          items: [
            { title: 'Sections', body: 'Text, cards, steps, galleries, videos — the full toolkit.', icon: 'Sparkles' },
            { title: 'No slugs', body: 'The address came from the title. Nobody typed it.', icon: 'Check' },
          ],
        },
      ],
    },
  })
  console.log('created page id', doc.id, '| web address:', doc.slug)
  process.exit(0)
}
run()
