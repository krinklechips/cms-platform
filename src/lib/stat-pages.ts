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
