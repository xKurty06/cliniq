import { Link } from 'react-router'
import { Icon } from '../components'
import { cn } from '../lib/cn'
import { navGroupsFor, type NavKey } from './navigation'
import type { SessionUser } from '../lib/mock-db'

function navGroupId(label: string): string {
  return `nav-group-${label.toLowerCase().replace(/\s+/g, '-')}`
}

export function BrandLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-md bg-brand-green-dark text-white shadow-raised">
        <Icon name="shieldPlus" size={20} />
      </span>
      <span className="text-xl font-bold tracking-tight text-brand-green-dark">CLINIQ</span>
    </span>
  )
}

interface SidebarProps {
  active: NavKey | null
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  user: SessionUser
}

export function Sidebar({ active, collapsed, onCollapsedChange, user }: SidebarProps) {
  const groups = navGroupsFor(user.role)
  const labelVisibility = collapsed ? 'sr-only' : ''

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen w-full flex-col border-r border-border bg-background py-5 lg:flex print:hidden',
        collapsed ? 'items-center gap-5 px-3' : 'gap-6 px-4',
      )}
    >
      <div className={cn('flex w-full items-center', collapsed ? 'justify-center' : 'justify-between pl-2 pr-0')}>
        {collapsed ? (
          <button
            type="button"
            aria-label="Expand sidebar"
            aria-expanded="false"
            onClick={() => onCollapsedChange(false)}
            className="group relative flex size-10 cursor-pointer items-center justify-center rounded-md text-brand-green-dark transition-colors duration-150 hover:text-text-primary focus-visible:outline-brand-green-dark motion-reduce:transition-none"
          >
            {/* Logo and hamburger are stacked and crossfaded, so hover never snaps between them. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center rounded-md bg-brand-green-dark text-white shadow-raised transition-[opacity,transform] duration-200 ease-out group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0 motion-reduce:transition-none"
            >
              <Icon name="shieldPlus" size={20} />
            </span>
            <span
              aria-hidden="true"
              className="absolute inset-0 flex scale-75 items-center justify-center opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
            >
              <Icon name="menu" size={20} />
            </span>
          </button>
        ) : (
          <>
            <BrandLogo />
            <button
              type="button"
              aria-label="Collapse sidebar"
              aria-expanded="true"
              onClick={() => onCollapsedChange(true)}
              className="-mr-2 flex size-9 cursor-pointer items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:text-text-primary motion-reduce:transition-none"
            >
              <Icon name="sidebarCollapse" size={22} />
            </button>
          </>
        )}
      </div>

      <nav
        aria-label="Main"
        className={cn('flex w-full flex-col overflow-y-auto', collapsed ? 'items-center gap-2 pr-0' : 'gap-4 pr-1')}
      >
        {groups.map((group) => {
          const groupId = navGroupId(group.label)
          return (
            <section
              key={group.label}
              aria-labelledby={groupId}
              className={cn('w-full', collapsed ? 'flex justify-center' : '')}
            >
              <h2
                id={groupId}
                className={cn(
                  'px-1.5 pb-1 text-left text-[0.6875rem] font-medium uppercase text-text-secondary',
                  labelVisibility,
                )}
              >
                {group.label}
              </h2>
              <ul className={cn('flex flex-col', collapsed ? 'items-center gap-1' : 'gap-1.5')}>
                {group.items.map((item) => {
                  const isActive = item.key === active
                  if (item.available && item.to) {
                    return (
                      <li key={item.key}>
                        <Link
                          to={item.to}
                          aria-label={collapsed ? item.label : undefined}
                          aria-current={isActive ? 'page' : undefined}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            'flex h-10 cursor-pointer items-center rounded-md text-sm transition-colors duration-150 motion-reduce:transition-none',
                            collapsed ? 'w-10 justify-center' : 'gap-3 px-3.5',
                            isActive
                              ? 'bg-brand-green-dark font-semibold text-white shadow-raised hover:brightness-90'
                              : 'font-medium text-text-primary hover:bg-surface',
                          )}
                        >
                          <Icon name={item.icon} />
                          <span className={labelVisibility}>{item.label}</span>
                        </Link>
                      </li>
                    )
                  }
                  return (
                    <li key={item.key}>
                      <span
                        aria-disabled="true"
                        title={collapsed ? `${item.label} - coming soon` : 'Coming soon'}
                        className={cn(
                          'flex h-10 cursor-not-allowed items-center rounded-md text-sm font-medium text-text-secondary',
                          collapsed ? 'w-10 justify-center' : 'gap-3 px-3.5',
                        )}
                      >
                        <Icon name={item.icon} />
                        <span className={labelVisibility}>{item.label}</span>
                        <span className="sr-only"> (not available yet)</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </nav>

      {!collapsed && (
        <p className="mt-auto px-2 text-xs leading-snug text-text-secondary">
          Mendez Christian Academy
          <br />
          School Clinic
        </p>
      )}
    </aside>
  )
}
