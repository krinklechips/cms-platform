export type NavigationGroup = {
  label: string
  items: { label: string; href: string; id: string }[]
}

export const isNavigationItemActive = (pathname: string, href: string, search = ''): boolean => {
  const target = new URL(href, 'https://cms.invalid')
  if (pathname !== target.pathname && !pathname.startsWith(`${target.pathname}/`)) return false
  const statPage = target.searchParams.get('statPage')
  return !statPage || new URLSearchParams(search).get('statPage') === statPage
}
