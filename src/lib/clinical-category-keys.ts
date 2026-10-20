export const clinicalCategoryOptions = [
  { label: 'Full Mouth Reconstruction', value: 'full-mouth-reconstruction' },
  { label: 'Implants & Crowns', value: 'implants-and-crowns' },
  { label: 'Implant Bridges', value: 'implant-bridges' },
  { label: 'Orthodontics', value: 'orthodontics' },
  { label: 'Cosmetic & E-Max', value: 'cosmetic-and-emax' },
]

const legacyEnglishKeys = new Map([
  ['Full Mouth', 'full-mouth-reconstruction'],
  ['Implants & Crowns', 'implants-and-crowns'],
  ['Implant Bridges', 'implant-bridges'],
  ['Orthodontics', 'orthodontics'],
  ['Cosmetic & E-Max', 'cosmetic-and-emax'],
  ...clinicalCategoryOptions.map(({ value }) => [value, value] as [string, string]),
])

// Only known English labels and canonical URL keys are safe to infer.
export function clinicalCategoryKeyFromEnglish(value: string | null | undefined): string | null {
  return typeof value === 'string' ? legacyEnglishKeys.get(value) ?? null : null
}
