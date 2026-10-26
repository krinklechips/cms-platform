import React from 'react'
import { SidebarControl } from './SidebarControl'
import { TenantNavBanner } from './TenantNavBanner'

/** Keep the tenant's dashboard link and native sidebar toggle in one row,
 * outside the scrolling/collapsible navigation. */
export const TenantWorkspaceHeader = async (props: Parameters<typeof TenantNavBanner>[0]) => {
  const identity = await TenantNavBanner(props)
  return <div className="cms-workspace-header"><SidebarControl />{identity}</div>
}
