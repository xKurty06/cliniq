import type { IconName } from '../components'
import type { UserRole } from '../types/entities'

/**
 * Role-aware navigation (Screen Inventory #3; Module-Overview Access Summary). Staff sees every
 * module; Admin/Principal sees Dashboard + Reports only; PE/Sports Instructor gets no shell at all.
 *
 * `available: false` marks screens not built yet. The shell shows them as "Soon" and not clickable,
 * so nothing looks like it works when it doesn't. Item list and order follow the reference mockup.
 * Where Follow-Ups, QR lookup, and Backup appear is still for #3 to decide.
 */
export type NavKey =
  'dashboard' | 'students' | 'visits' | 'incidents' | 'inventory' | 'reports' | 'accounts'

export interface NavItem {
  key: NavKey
  label: string
  icon: IconName
  available: boolean
}

const ALL: Record<NavKey, NavItem> = {
  dashboard: { key: 'dashboard', label: 'Dashboard', icon: 'layoutGrid', available: true },
  students: { key: 'students', label: 'Students', icon: 'users', available: false },
  visits: { key: 'visits', label: 'Visits', icon: 'stethoscope', available: false },
  incidents: { key: 'incidents', label: 'Incidents', icon: 'alertTriangle', available: false },
  inventory: { key: 'inventory', label: 'Inventory', icon: 'package', available: false },
  reports: { key: 'reports', label: 'Reports', icon: 'fileText', available: false },
  accounts: { key: 'accounts', label: 'Accounts', icon: 'userCog', available: false },
}

export function navItemsFor(role: UserRole): NavItem[] {
  if (role === 'admin') return [ALL.dashboard, ALL.reports]
  if (role === 'staff') return Object.values(ALL)
  return []
}
