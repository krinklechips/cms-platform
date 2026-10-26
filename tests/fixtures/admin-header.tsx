/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element -- Standalone browser fixture mirrors native markup without a Next router or image server. */
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { compile } from 'sass'
import ts from 'typescript'

const root = resolve(import.meta.dirname, '../..')
function load<T>(file: string, doubles: Record<string, unknown>): T {
  const url = new URL(`../../${file}`, import.meta.url)
  const require = createRequire(url)
  const exports = {}
  const compiled = ts.transpileModule(readFileSync(url, 'utf8'), { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText
  new Function('require', 'module', 'exports', compiled)((name: string) => name in doubles ? doubles[name] : require(name), { exports }, exports)
  return exports as T
}
const Link = ({ prefetch: _prefetch, ...props }: React.ComponentProps<'a'> & { prefetch?: boolean }) => <a {...props} />
const Icon = () => <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" /></svg>
const logo = `data:image/png;base64,${readFileSync(resolve(root, 'public/roomchang-logo.png')).toString('base64')}`
export const adminHeaderCSS = `${readFileSync(resolve(root, 'node_modules/@payloadcms/next/dist/prod/styles.css'), 'utf8')}\n${compile(resolve(root, 'src/app/(payload)/custom.scss')).css}`

// Native DefaultTemplate nesting, with actual local component output. Hooks
// resolve only navigation state here; Chromium uses unchanged shipped CSS.
export async function adminHeaderMarkup(locale: string, open: boolean, dark = false) {
  const nav = { navOpen: open, setNavOpen: () => {}, hydrated: true, shouldAnimate: false, navRef: { current: null } }
  const ui = { Link, MenuIcon: Icon, ChevronIcon: Icon, XIcon: Icon, useNav: () => nav,
    usePreferences: () => ({ setPreference: async () => {} }), useWindowInfo: () => ({ breakpoints: { l: false } }) }
  const doubles = { '@payloadcms/ui': ui, 'next/link': Link,
    'next/navigation': { usePathname: () => '/admin/collections/services/1', useSearchParams: () => new URLSearchParams() },
    'next/headers': { headers: async () => new Headers({ host: 'roomchang.serviettelab.com' }) },
    '@/lib/get-tenant-by-host': { getTenantByHost: async () => ({ name: 'Roomchang Dental Hospital', slug: 'roomchang', logoUrl: logo }) },
  }
  const sidebar = load<{ SidebarControl: React.ComponentType }>('src/components/SidebarControl.tsx', doubles)
  const branding = load<{ TenantNavBanner: (props: { payload: object }) => Promise<React.ReactNode> }>('src/components/TenantNavBanner.tsx', doubles)
  const navigation = load<{ TenantNavigation: React.ComponentType<Record<string, unknown>> }>('src/components/TenantNavigation.tsx', doubles)
  let header: React.ReactNode = <sidebar.SidebarControl />
  const config = readFileSync(resolve(root, 'src/payload.config.ts'), 'utf8')
  if (config.includes("'/components/TenantWorkspaceHeader#TenantWorkspaceHeader'") && existsSync(resolve(root, 'src/components/TenantWorkspaceHeader.tsx'))) {
    const workspace = load<{ TenantWorkspaceHeader: (props: { payload: object }) => Promise<React.ReactNode> }>('src/components/TenantWorkspaceHeader.tsx', {
      ...doubles, './SidebarControl': sidebar, './TenantNavBanner': branding,
    })
    header = await workspace.TenantWorkspaceHeader({ payload: {} })
  }
  const identity = await branding.TenantNavBanner({ payload: {} })
  const html = `<!doctype html><html lang="en" data-theme="${dark ? 'dark' : 'light'}" dir="ltr"><head><meta charset="utf-8"></head><body>${renderToStaticMarkup(<>
    {header}
    <div style={{ position: 'relative' }}>
      <div className={`template-default template-default--nav-hydrated${open ? ' template-default--nav-open' : ''}`}>
        <navigation.TenantNavigation identity={identity} groups={[{ label: 'Main Pages', items: [{ id: 'nav-services', label: 'Technology & Equipment', href: '/admin/collections/services' }] }]} />
        <div className="template-default__wrap">
          <header className={`app-header${open ? ' app-header--nav-open' : ''}`}>
            <div className="app-header__content"><div className="app-header__wrapper"><div className="app-header__controls-wrapper">
              <div className="app-header__step-nav-wrapper"><nav className="step-nav app-header__step-nav"><a className="step-nav__home" href="/admin"><img src={logo} alt="Roomchang Dental Hospital" /></a><span>/</span><a href="/admin/collections/services">Services</a><span>/</span><span className="step-nav__last">Implant Bridges</span></nav></div>
              <div className="app-header__actions-wrapper"><div className="app-header__actions" /></div>
              <div className="localizer-button app-header__localizer-spacing"><div className="localizer-button__label">Locale: </div><div className="localizer-button__current"><span>{locale}</span><Icon /></div></div>
              <a className="app-header__account" href="/admin/account" aria-label="My account"><Icon /></a>
            </div></div></div>
            <div className="localizer app-header__localizer"><button type="button" className="popup-button"><span className="localizer-button"><span className="localizer-button__label">Locale: </span><span className="localizer-button__current"><span>{locale}</span><Icon /></span></span></button></div>
          </header>
          <main className="gutter gutter--left gutter--right"><h1>Implant Bridges</h1><input aria-label="Unsaved title" defaultValue="Borin's unsaved text" /></main>
        </div>
      </div>
    </div>
  </>)}</body></html>`
  const mark = `data:image/png;base64,${readFileSync(resolve(root, 'public/roomchang-mark.png')).toString('base64')}`
  return html.replaceAll('src="/roomchang-mark.png"', `src="${mark}"`)
}
