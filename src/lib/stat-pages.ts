type StatPage = { label: string; path: string }

const home = { label: 'Home page', path: '' }
const about = { label: 'About Roomchang', path: '/about' }
const facilities = { label: 'Our Facilities', path: '/about/facilities' }
const clinical = { label: 'Clinical Results', path: '/clinical-results' }

const pages: Record<string, StatPage[]> = {
  years_experience: [home],
  specialist_dentists: [home, about, facilities, clinical],
  branches_count: [home, about],
  patients_treated: [home, clinical],
  year_established: [about],
  dental_chairs: [facilities, about],
  surgical_theatres: [facilities],
  building_storeys: [facilities],
  clinical_experience: [clinical],
}

export const getStatPages = (key: string): readonly StatPage[] => Object.hasOwn(pages, key) ? pages[key] : []
