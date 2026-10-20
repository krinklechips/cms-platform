import type { CollectionConfig } from 'payload'
import { FaqItems } from '../../src/collections/FaqItems'
import { PricingComparisonRows } from '../../src/collections/PricingComparisonRows'
import { PricingComparisonSets } from '../../src/collections/PricingComparisonSets'
import { PartnerCategories } from '../../src/collections/PartnerCategories'
import { InternationalSteps } from '../../src/collections/InternationalSteps'
import { CareerPositions } from '../../src/collections/CareerPositions'
import { Videos } from '../../src/collections/Videos'
import { NewsArticles } from '../../src/collections/NewsArticles'
import { CommunityArticles } from '../../src/collections/CommunityArticles'
import { TimelineEvents } from '../../src/collections/TimelineEvents'
import { Publications } from '../../src/collections/Publications'
import { Branches } from '../../src/collections/Branches'
import { ClinicalCases } from '../../src/collections/ClinicalCases'

type Fixture = {
  config: CollectionConfig
  // Target field, original recovery column (also used for new display fields).
  fields: readonly (readonly [string, string])[]
  seed: Record<string, unknown>
  shared?: readonly string[]
}

export const localizedFieldFixtures: Fixture[] = [
  { config: FaqItems, fields: [['category', 'category']], seed: { question: 'English question' } },
  { config: PricingComparisonRows, fields: [['treatment', 'treatment']], seed: { roomchangPrice: '$100', australiaPrice: '$200', singaporePrice: '$150' }, shared: ['roomchangPrice', 'australiaPrice', 'singaporePrice', 'ada', 'sourceSetId'] },
  { config: PricingComparisonSets, fields: [['sourceNote', 'sourceNote']], seed: { slug: 'stable-set', exchangeRate: 4000 }, shared: ['slug', 'exchangeRate'] },
  { config: PartnerCategories, fields: [['name', 'name']], seed: {} },
  { config: InternationalSteps, fields: [['stepLabel', 'stepLabel']], seed: { title: 'English step' } },
  { config: CareerPositions, fields: [['department', 'department'], ['type', 'type'], ['location', 'location']], seed: { title: 'English position', slug: 'stable-position' }, shared: ['slug'] },
  { config: Videos, fields: [['topic', 'topic'], ['treatment', 'treatment']], seed: { title: 'English video', url: 'https://example.test/video', category: 'dentist-talks' }, shared: ['category', 'url'] },
  { config: NewsArticles, fields: [['imageAlt', 'imageAlt']], seed: { title: 'English news', slug: 'stable-news' }, shared: ['slug'] },
  { config: CommunityArticles, fields: [['imageAlt', 'imageAlt']], seed: { title: 'English community', slug: 'stable-community' }, shared: ['slug'] },
  { config: TimelineEvents, fields: [['imageAlt', 'imageAlt']], seed: { heading: 'English milestone', year: '2020' } },
  { config: Publications, fields: [['abstract', 'abstract'], ['displayTitle', 'title']], seed: { title: 'Original citation title', authors: 'Original authors', doi: '10.fixture/original' }, shared: ['title', 'authors', 'doi', 'journal', 'year'] },
  { config: Branches, fields: [['displayName', 'name'], ['shortDisplayName', 'shortName']], seed: { name: 'Official hospital', shortName: 'Official short', slug: 'stable-branch' }, shared: ['name', 'shortName', 'slug'] },
]

export const clinicalCaseFixture = ClinicalCases
export const toColumn = (field: string): string => field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
