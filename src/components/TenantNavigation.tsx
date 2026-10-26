'use client'

import React from 'react'
import { ChevronIcon, Link, useNav } from '@payloadcms/ui'
import { usePathname, useSearchParams } from 'next/navigation'
import { isNavigationItemActive, type NavigationGroup } from '@/lib/navigation-state'

export type TenantNavigationGroup = NavigationGroup

export const TenantNavigation = ({ groups, footer }: {
  groups: TenantNavigationGroup[]
  footer?: React.ReactNode
}) => {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const { navOpen, navRef, hydrated, shouldAnimate, setNavOpen } = useNav()
  const isActive = (href: string) => isNavigationItemActive(pathname, href, search)
  return (
    <aside id="cms-tenant-navigation" className={`nav cms-tenant-nav${navOpen ? ' nav--nav-open' : ''}${hydrated ? ' nav--nav-hydrated' : ''}${shouldAnimate ? ' nav--nav-animate' : ''}`} inert={!navOpen || undefined}>
      <div className="nav__scroll" ref={navRef}>
        <nav className="nav__wrap" aria-label="Website content">
          <p className="cms-nav-environment" title="CMS publishing updates the preview website, not roomchang.com.">Preview workspace</p>
          <Link className="cms-overview-link" href="/admin" prefetch={false} aria-current={pathname === '/admin' ? 'page' : undefined}>Overview</Link>
          {groups.map((group) => {
            const active = group.items.some((item) => isActive(item.href))
            return (
              <details className="cms-nav-group" key={`${group.label}:${active}`} open={active || undefined}>
                <summary>{group.label}<ChevronIcon /></summary>
                <div>
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      id={item.id}
                      href={item.href}
                      prefetch={false}
                      className={`nav__link${isActive(item.href) ? ' cms-nav-link--active' : ''}`}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      onClick={() => { if (window.matchMedia('(max-width: 1024px)').matches) setNavOpen(false) }}
                    >{item.label}</Link>
                  ))}
                </div>
              </details>
            )
          })}
          {footer}
          <div className="cms-nav-footer">
            <Link href="/admin/account" prefetch={false}>My account</Link>
            <Link href="/admin/logout" prefetch={false}>Log out</Link>
          </div>
        </nav>
      </div>
    </aside>
  )
}
