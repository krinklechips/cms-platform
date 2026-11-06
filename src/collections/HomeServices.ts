import type { CollectionConfig } from 'payload'

export const HomeServices: CollectionConfig = {
  slug: 'home-services',
  labels: { singular: 'Services Section', plural: 'Services Section' },
  indexes: [{ fields: ['tenant'], unique: true }],
  admin: {
    group: 'Home Page', useAsTitle: 'heading',
    description: 'The heading and six service shortcuts below the home page statistics.',
    components: { views: { list: { Component: '/components/HomepageSingleRedirect#HomepageSingleRedirect' } } },
  },
  access: { read: () => true },
  fields: [
    { name: 'eyebrow', label: 'Small heading', type: 'text', localized: true },
    { name: 'heading', label: 'Section heading', type: 'text', localized: true },
    { name: 'seeAll', label: 'View all services link label', type: 'text', localized: true },
    ...[
      ['implants', 'Dental implants'], ['crowns', 'Crowns and bridges'], ['aligners', 'Orthodontics'],
      ['cosmetic', 'Cosmetic dentistry'], ['whitening', 'Teeth whitening'], ['surgery', 'Oral surgery'],
    ].map(([name, label]) => ({ name, label: `${label} shortcut label`, type: 'text' as const, localized: true })),
  ],
}
