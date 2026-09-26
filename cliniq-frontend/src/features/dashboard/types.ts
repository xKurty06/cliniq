import type { FollowUpDueState, InventoryFlag } from '../../components'
import type { DateRange } from '../../lib/dateRange'
import type {
  FollowUp,
  ISODate,
  ISODateTime,
  InventoryItem,
  StudentListRef,
} from '../../types/entities'

/**
 * The Clinic Overview Dashboard's data contract (Screen Inventory #31, Module 9). This is the shape
 * the Phase B9 aggregation endpoint is expected to return. Every row is built from the shared
 * entities in `types/entities.ts`, so it lines up with Frontend Context Brief §5.
 *
 * Privacy by type: every student reference here is a `StudentListRef` (id + Student Number only).
 * A dashboard component can't render a name because it never receives one (ADR-004).
 */

export type TrendGranularity = 'week' | 'month'

export interface DashboardQuery {
  range: DateRange
  trendGranularity: TrendGranularity
}

export interface DashboardCounts {
  /** Scoped to the selected date range. */
  visits: number
  incidents: number
  /** Incidents in range still at Stage 1 (fast-capture, not yet completed). */
  incidentsAtStage1: number
  /** Current state, not scoped to the date range. */
  pendingRecords: number
  lowStockItems: number
  activeStudents: number
}

export interface DueFollowUpRow {
  followUp: Pick<FollowUp, 'id' | 'followUpDate' | 'reason' | 'status' | 'relatedRecord'>
  student: StudentListRef
  dueState: FollowUpDueState
  /** Negative = overdue by N days. */
  daysFromToday: number
}

export interface FrequentVisitorRow {
  student: StudentListRef
  visitCount: number
}

export interface InventoryAlertRow {
  item: Pick<
    InventoryItem,
    'id' | 'name' | 'category' | 'currentStock' | 'unit' | 'lowStockThreshold' | 'expirationDate'
  >
  flags: InventoryFlag[]
  /** Days until the expiration date (negative = already expired); null if the item doesn't expire. */
  daysUntilExpiry: number | null
}

export interface TrendBucket {
  key: string
  /** Short axis label, e.g. "Sep 14" (week of) or "Sep 2026". */
  label: string
  from: ISODate
  to: ISODate
}

export interface ComplaintSeries {
  complaint: string
  /** One count per bucket, aligned with `ComplaintTrends.buckets`. */
  counts: number[]
  total: number
  /** Bucket indexes flagged as a possible symptom cluster (an early-warning signal only). */
  clusterBuckets: number[]
}

export interface ComplaintTrends {
  granularity: TrendGranularity
  buckets: TrendBucket[]
  /** The most common complaints in range, charted. */
  series: ComplaintSeries[]
  /** Everything outside the top series, listed in the table view so no complaint is hidden. */
  otherComplaints: ComplaintSeries[]
}

export interface DashboardSummary {
  /** Server's "today". Due/upcoming follow-ups are computed against this at request time. */
  today: ISODate
  generatedAt: ISODateTime
  range: { from: ISODate; to: ISODate }
  counts: DashboardCounts
  /** Same counts for the equal-length period just before `range`, for the trend indicator. */
  previousCounts: Pick<DashboardCounts, 'visits' | 'incidents'>
  dueFollowUps: DueFollowUpRow[]
  /** How many days ahead counts as "upcoming". Returned by the API so the UI never hardcodes it. */
  upcomingWindowDays: number
  frequentVisitors: FrequentVisitorRow[]
  /** Minimum visit count that raised the flag. Shown to the nurse so the warning is explainable. */
  frequentVisitorMinVisits: number
  inventoryAlerts: InventoryAlertRow[]
  complaintTrends: ComplaintTrends
}

export interface CalendarDay {
  date: ISODate
  visits: number
  incidents: number
  /** Distinct free-text event tags Staff attached to that day's visits/incidents. */
  eventTags: string[]
}
