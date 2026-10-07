import {
  getBackupStatus,
  getCalendarDays,
  getDashboardSummary,
  getHolidays,
  listPendingExcuseLetters,
  type BackupStatusView,
  type PendingExcuseLetter,
} from '../../../lib/mock-db'
import type { ISODate } from '../../../types/entities'
import type { CalendarDay, DashboardQuery, DashboardSummary, HolidayFeed } from '../../../types/dashboard'

/**
 * Dashboard data access. Everything here is read-only except calendar events (bottom of the file),
 * whose writes the data layer audit-logs (see `.claude/skills/cliniq-audit-trail/`).
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

/** Nationwide holidays in a range, plus the source's last-updated date and name (ADR-020). */
export function fetchHolidays(from: ISODate, to: ISODate): Promise<HolidayFeed> {
  return getHolidays(from, to)
}

/** What the Staff Dashboard's backup indicator needs: the latest run and whether it still needs checking. */
export type BackupIndicator = Pick<BackupStatusView, 'latest' | 'needsVerification'>

export function fetchBackupIndicator(): Promise<BackupIndicator> {
  return getBackupStatus()
}

/** Staff only: excuse-letter drafts saved with visits and still awaiting approval. Not range-filtered. */
export function fetchPendingExcuseLetters(): Promise<PendingExcuseLetter[]> {
  return listPendingExcuseLetters()
}

/**
 * Calendar events (Module 9, ADR-019): Staff add, edit, and delete them; each write is audit-logged
 * by the data layer in the same call.
 */
export {
  CALENDAR_EVENT_TITLE_MAX,
  CalendarEventValidationError,
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
  validateCalendarEvent,
  type CalendarEventErrors,
  type CalendarEventInput,
} from '../../../lib/mock-db'
