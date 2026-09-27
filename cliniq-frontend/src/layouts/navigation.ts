import type { IconName } from '../components'
import { paths } from '../routes/paths'
import type { UserRole } from '../types/entities'

/**
 * Role-aware navigation (Screen Inventory #3; Module-Overview Access Summary). Staff sees every
 * module; Admin/Principal sees Dashboard + Reports only; PE/Sports Instructor gets no shell at all.
 *
 * `to` is the item's route (routes/paths.ts). `available: false` marks screens not built yet (no
 * route exists). The shell shows them as "Soon" and not clickable,
 * so nothing looks like it works when it doesn't. Groups organize destinations around the user's
 * work: overview, care delivery, operations, and administration.
 */
export type NavKey =
  | 'dashboard'
  | 'students'
  | 'visits'
  | 'incidents'
  | 'followUps'
  | 'qrLookup'
  | 'inventory'
  | 'reports'
  | 'accounts'
  | 'backup'

export interface NavItem {
  key: NavKey
  label: string
  icon: IconName
  available: boolean
  to?: string
}

const ALL: Record<NavKey, NavItem> = {
  dashboard: { key: 'dashboard', label: 'Dashboard', icon: 'layoutGrid', available: true, to: paths.dashboard },
  students: { key: 'students', label: 'Students', icon: 'users', available: true, to: paths.students },
  visits: { key: 'visits', label: 'Visits', icon: 'stethoscope', available: true, to: paths.visits },
  // No incident list screen exists yet; the item opens a new incident (Stage 1) until it does.
  incidents: { key: 'incidents', label: 'Incidents', icon: 'alertTriangle', available: true, to: paths.incidentNew() },
  followUps: { key: 'followUps', label: 'Follow-Ups', icon: 'calendarClock', available: false },
  qrLookup: { key: 'qrLookup', label: 'QR Lookup', icon: 'qrCode', available: true, to: paths.qrScan },
  inventory: { key: 'inventory', label: 'Inventory', icon: 'package', available: false },
  reports: { key: 'reports', label: 'Reports', icon: 'fileText', available: false },
  accounts: { key: 'accounts', label: 'Accounts', icon: 'userCog', available: false },
  backup: { key: 'backup', label: 'Backup', icon: 'refresh', available: false },
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export function navGroupsFor(role: UserRole): NavGroup[] {
  if (role === 'admin') {
    return [
      { label: 'Overview', items: [ALL.dashboard] },
      { label: 'Reporting', items: [ALL.reports] },
    ]
  }
  if (role === 'staff') {
    return [
      { label: 'Overview', items: [ALL.dashboard] },
      {
        label: 'Student Care',
        items: [ALL.students, ALL.visits, ALL.incidents, ALL.followUps, ALL.qrLookup],
      },
      { label: 'Operations', items: [ALL.inventory, ALL.reports] },
      { label: 'Administration', items: [ALL.accounts, ALL.backup] },
    ]
  }
  return []
}
