export const isNavigationItemActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`)
