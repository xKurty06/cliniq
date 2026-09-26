import type { ReactNode } from 'react'
import { Icon } from '../components'
import { cn } from '../lib/cn'
import { ROLE_LABELS, type SessionUser } from '../lib/mocks/session'
import { navItemsFor, type NavKey } from './navigation'

/**
 * App shell: left sidebar (logo + role-aware nav) and a top bar (user chip), following the reference
 * mockup's layout.
 *
 * VISUAL SHELL ONLY. There's no router yet (the routing library is an open decision,
 * Development-Phases.md §0), and the full App Shell/Nav is its own screen (#3). Only the Dashboard
 * item is live; the rest are marked "Soon" and aren't clickable. No search box and no notification
 * bell: neither exists as a feature yet, and a dead control would mislead.
 */
function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-md bg-brand-green-dark text-white shadow-raised">
        <Icon name="shieldPlus" size={20} />
      </span>
      <span className="text-xl font-bold tracking-tight text-brand-green-dark">CLINIQ</span>
    </span>
  )
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export interface AppShellProps {
  user: SessionUser
  active: NavKey
  children: ReactNode
}

export function AppShell({ user, active, children }: AppShellProps) {
  const items = navItemsFor(user.role)
  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] print:block print:bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:cursor-pointer focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:hover:bg-surface"
      >
        Skip to main content
      </a>

      <aside className="sticky top-0 hidden h-screen flex-col gap-8 border-r border-border bg-background px-4 py-6 lg:flex print:hidden">
        <div className="px-2">
          <Logo />
        </div>
        <nav aria-label="Main">
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => {
              const isActive = item.key === active
              if (item.available) {
                return (
                  <li key={item.key}>
                    <a
                      href="#main-content"
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex h-11 cursor-pointer items-center gap-3 rounded-md px-3.5 text-sm transition-colors duration-150 motion-reduce:transition-none',
                        isActive
                          ? 'bg-brand-green-dark font-semibold text-white shadow-raised hover:brightness-90'
                          : 'font-medium text-text-primary hover:bg-surface',
                      )}
                    >
                      <Icon name={item.icon} />
                      {item.label}
                    </a>
                  </li>
                )
              }
              return (
                <li key={item.key}>
                  <span
                    aria-disabled="true"
                    title="Coming soon"
                    className="flex h-11 cursor-not-allowed items-center gap-3 rounded-md px-3.5 text-sm font-medium text-text-secondary"
                  >
                    <Icon name={item.icon} />
                    {item.label}
                    <span className="sr-only"> (not available yet)</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </nav>
        <p className="mt-auto px-2 text-xs leading-snug text-text-secondary">
          Mendez Christian Academy
          <br />
          School Clinic
        </p>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 bg-surface/90 px-4 backdrop-blur-sm sm:px-8 print:hidden">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full bg-brand-green-light text-xs font-bold text-text-primary ring-2 ring-background"
            >
              {initials(user.name)}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-text-primary">{user.name}</span>
              <span className="text-xs text-text-secondary">{ROLE_LABELS[user.role]}</span>
            </span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}
