'use client'

import React from 'react'
import { MenuIcon, useNav, usePreferences, useWindowInfo } from '@payloadcms/ui'
import { PREFERENCE_KEYS } from 'payload/shared'

export const SidebarControl = () => {
  const { navOpen, setNavOpen } = useNav()
  const { setPreference } = usePreferences()
  const { breakpoints: { l: largeBreak } } = useWindowInfo()
  const label = navOpen ? 'Hide sidebar' : 'Show sidebar'

  const toggle = async () => {
    setNavOpen(!navOpen)
    if (!largeBreak) {
      await setPreference(PREFERENCE_KEYS.NAV, { open: !navOpen }, true)
    }
  }

  return (
    <button
      className="cms-sidebar-control"
      type="button"
      aria-label={label}
      aria-expanded={navOpen}
      aria-controls="cms-tenant-navigation"
      title={label}
      onClick={toggle}
    >
      <MenuIcon />
    </button>
  )
}
