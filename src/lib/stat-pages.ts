import type { NavigationGroup } from './navigation-state'

type StatPage = { label: string; path: string }

const home = { label: 'Home page', path: '' }
const about = { label: 'About Roomchang', path: '/about' }
const facilities = { label: 'Our Facilities', path: '/about/facilities' }
const clinical = { label: 'Clinical Results', path: '/clinical-results' }
const team = { label: 'Our Team', path: '/team' }

const pages: Record<string, StatPage[]> = {
  years_experience: [home, team],
  specialist_dentists: [home, about, facilities, clinical, team],
  branches_count: [home, about, team],
  patients_treated: [home, clinical],
  year_established: [about],
  dental_chairs: [facilities, about],
  surgical_theatres: [facilities],
  building_storeys: [facilities],
  clinical_experience: [clinical],
}

export const getStatPages = (key: string): readonly StatPage[] => Object.hasOwn(pages, key) ? pages[key] : []

const labels: Record<string, string> = {
  years_experience: 'Years of experience',
  specialist_dentists: 'Specialist dentists',
  branches_count: 'Branches',
  patients_treated: 'Patients treated',
  year_established: 'Year established',
  dental_chairs: 'Dental chairs',
  surgical_theatres: 'Surgical theatres',
  building_storeys: 'Building storeys',
  patients_per_month: 'Patients per month',
  countries_served: 'Countries served',
  clinical_experience: 'Clinical experience',
}

export const getStatLabel = (key: string): string =>
  Object.hasOwn(labels, key) ? labels[key] : key || 'New statistic'

export const getStatPageSummary = (key: string): string => {
  const destinations = getStatPages(key)
  if (!destinations.length) return 'Not currently displayed'
  return destinations.map((page) => page.label).join(', ') + (destinations.length === 1 ? ' only' : '')
}

const statViews = [
  { id: 'home', page: home, group: 'Home Page', label: 'Stats Band' },
  { id: 'team', page: team, group: 'Main Pages', label: 'Our Team Statistics' },
  { id: 'clinical', page: clinical, group: 'Main Pages', label: 'Clinical Results Statistics' },
  { id: 'about', page: about, group: 'About Pages', label: 'About Roomchang Statistics' },
  { id: 'facilities', page: facilities, group: 'About Pages', label: 'Our Facilities Statistics' },
] as const

type StatViewID = (typeof statViews)[number]['id']

export const getStatPreviewPath = (key: string, viewID?: unknown): string | null => {
  const destinations = getStatPages(key)
  const requested = statViews.find(view => view.id === viewID && destinations.some(({ path }) => path === view.page.path))
  return requested?.page.path ?? destinations[0]?.path ?? null
}

export const getStatListHref = (viewID: StatViewID, adminRoute = '/admin'): string => {
  const view = statViews.find(({ id }) => id === viewID)!
  const query = new URLSearchParams({ statPage: view.id })
  Object.entries(pages)
    .filter(([, destinations]) => destinations.some(({ path }) => path === view.page.path))
    .forEach(([key], index) => query.set(`where[key][in][${index}]`, key))
  return `${adminRoute}/collections/site-stats?${query}`
}

export const getStatPageLinks = (key: string, adminRoute = '/admin') =>
  getStatPages(key).map((page) => {
    const view = statViews.find(({ page: target }) => target.path === page.path)!
    return { label: page.label, href: getStatListHref(view.id, adminRoute) }
  })

export const getStatRecordHref = (key: string, id: string | number, viewID?: unknown, adminRoute = '/admin'): string => {
  const destinations = getStatPages(key)
  const requested = statViews.find((view) => view.id === viewID && destinations.some(({ path }) => path === view.page.path))
  const view = requested ?? statViews.find(({ page }) => page.path === destinations[0]?.path)
  const href = `${adminRoute}/collections/site-stats/${encodeURIComponent(id)}`
  return view ? `${href}?${new URLSearchParams({ statPage: view.id })}` : href
}

export const withStatPageLinks = (groups: NavigationGroup[], adminRoute = '/admin'): NavigationGroup[] => {
  // The source item has already passed Payload's visibility and read checks.
  if (!groups.some(({ items }) => items.some(({ id }) => id === 'nav-site-stats'))) return groups
  const homePosition = groups.find(({ label }) => label === 'Home Page')?.items.findIndex(({ id }) => id === 'nav-site-stats') ?? -1
  const navID = (id: StatViewID) => id === 'home' ? 'nav-site-stats' : `nav-site-stats-${id}`
  const statIDs = new Set(statViews.map(({ id }) => navID(id)))
  const result = groups.map((group) => ({ ...group, items: group.items.filter(({ id }) => !statIDs.has(id)) }))
  for (const view of statViews) {
    let group = result.find(({ label }) => label === view.group)
    if (!group) {
      group = { label: view.group, items: [] }
      result.push(group)
    }
    const item = { id: navID(view.id), label: view.label, href: getStatListHref(view.id, adminRoute) }
    if (view.id === 'home' && homePosition >= 0) group.items.splice(homePosition, 0, item)
    else group.items.push(item)
  }
  return result.filter(({ items }) => items.length > 0)
}
