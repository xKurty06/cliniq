import { useState, type ReactNode } from 'react'
import { Icon } from '../components'
import { cn } from '../lib/cn'
import { logoutMockSession, ROLE_LABELS, type SessionUser } from '../lib/mock-db'
import { showKeyboardShortcuts } from '../lib/shortcuts'
import { BrandLogo, Sidebar } from './Sidebar'
import type { NavKey } from './navigation'

/**
 * App shell: left sidebar (logo + role-aware nav) and a top bar (user chip), following the reference
 * mockup's layout.
 *
 * Placed around each screen by `routes/AppRoutes.tsx`; `active` is the route's nav item (`null` on
 * the not-found page). Nav items for screens that exist link to their routes; the rest are marked
 * "Soon" and aren't clickable. No search box and no notification bell: neither exists as a feature
 * yet, and a dead control would mislead.
 */

export interface AppShellProps {
  user: SessionUser
  active: NavKey | null
  children: ReactNode
  onLogout: () => void
}

export function AppShell({ user, active, children, onLogout }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logoutMockSession(user)
      onLogout()
    } catch {
      setIsLoggingOut(false)
    }
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-surface transition-[grid-template-columns] duration-200 motion-reduce:transition-none lg:grid print:block print:bg-background',
        isSidebarCollapsed
          ? 'lg:grid-cols-[4.75rem_minmax(0,1fr)]'
          : 'lg:grid-cols-[16rem_minmax(0,1fr)]',
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:cursor-pointer focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:hover:bg-surface"
      >
        Skip to main content
      </a>

      <Sidebar
        active={active}
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        user={user}
      />

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-8 print:hidden">
          <div className="lg:hidden">
            <BrandLogo />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            {/* Keyboard help belongs to the desktop workstation; it has no use on a touch screen. */}
            <button
              type="button"
              aria-label="Show keyboard shortcuts"
              onClick={showKeyboardShortcuts}
              className="mr-1 hidden h-8 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green-dark motion-reduce:transition-none md:inline-flex"
            >
              Shortcuts <span className="ml-1" aria-hidden="true">?</span>
            </button>
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full bg-brand-green-light text-xs font-bold text-text-primary ring-2 ring-background"
            >
              <Icon name="user" size={20} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-text-primary">{user.name}</span>
              <span className="text-xs text-text-secondary">{ROLE_LABELS[user.role]}</span>
            </span>
            <button
              type="button"
              aria-label={isLoggingOut ? 'Logging out' : 'Log out'}
              title="Log out"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-error transition-colors hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="logout" className={isLoggingOut ? 'animate-spin motion-reduce:animate-none' : undefined} />
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}
