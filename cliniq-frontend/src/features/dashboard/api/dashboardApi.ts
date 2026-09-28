import { getCalendarDays, getDashboardSummary } from '../../../lib/mock-db'
import type { ISODate } from '../../../types/entities'
import type { CalendarDay, DashboardQuery, DashboardSummary } from '../../../types/dashboard'

/**
 * Dashboard data access. It's read-only (GET-style) on purpose: this screen never creates, updates,
 * or deletes anything, so no audit-log call is needed here (see `.claude/skills/cliniq-audit-trail/`).
 *
 * Every count, flag, and trend is computed by the data layer (`lib/mock-db/`) from raw records, so
 * the Dashboard always agrees with the list screens it summarizes. When Phase B9 lands, the layer
 * becomes real requests to the Laravel API; these signatures stay the contract.
 *
 * Preview switches: `?mock=slow`, `?mock=empty`, `?mock=error` (see `lib/mock-db/devToggles.ts`).
 */

export function fetchDashboardSummary(query: DashboardQuery): Promise<DashboardSummary> {
  return getDashboardSummary(query)
}

export function fetchCalendarDays(from: ISODate, to: ISODate): Promise<CalendarDay[]> {
  return getCalendarDays(from, to)
}
