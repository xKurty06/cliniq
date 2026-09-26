import type { FollowUpDueState, InventoryFlag } from '../../../components'
import {
  addDays,
  diffDays,
  eachDay,
  endOfMonth,
  formatDate,
  formatShortDate,
  isWithin,
  startOfMonth,
  startOfWeek,
} from '../../../lib/dates'
import { previousPeriod } from '../../../lib/dateRange'
import type { MockDataset } from '../../../lib/mocks/dataset'
import type { ISODate, Student, StudentListRef } from '../../../types/entities'
import type {
  CalendarDay,
  ComplaintSeries,
  ComplaintTrends,
  DashboardQuery,
  DashboardSummary,
  DueFollowUpRow,
  InventoryAlertRow,
  TrendBucket,
  TrendGranularity,
} from '../types'

/**
 * MOCK AGGREGATION: a stand-in for the Phase B9 dashboard endpoint (Development-Phases.md), which
 * will own these calculations server-side. The UI only renders what this returns.
 *
 * PLACEHOLDER RULES: none of these thresholds is specified in any requirement document. They're
 * only here so the mock has something to show. Each one needs a team/nurse decision before B9,
 * and none is a clinical rule:
 */
export const MOCK_RULES = {
  /** Visits in the selected range that raise a frequent-visitor warning. */
  frequentVisitorMinVisits: 3,
  /** How many days ahead a pending follow-up counts as "upcoming". */
  upcomingFollowUpDays: 7,
  /** Days before the expiration date that an item counts as "nearing expiration". */
  expiryWarningDays: 30,
  /** Complaint count in one bucket that can count as a possible cluster... */
  clusterMinCount: 8,
  /** ...when it's at least this multiple of that complaint's average in the other buckets. */
  clusterRatio: 2,
  /** How many top complaints are charted (the rest go in the table). */
  topComplaints: 5,
} as const

const dateOf = (timestamp: string): ISODate => timestamp.slice(0, 10)

function toListRef(student: Student): StudentListRef {
  // Only id + Student Number leave this function. The name is dropped here on purpose (ADR-004).
  return { id: student.id, studentNumber: student.studentNumber }
}

export function buildDashboardSummary(
  data: MockDataset,
  query: DashboardQuery,
  generatedAt: string,
): DashboardSummary {
  const { today } = data
  const { from, to } = query.range
  const studentsById = new Map(data.students.map((s) => [s.id, s]))

  const visitsInRange = data.visits.filter((v) => isWithin(dateOf(v.dateTime), from, to))
  const incidentsInRange = data.incidents.filter((i) => isWithin(dateOf(i.time), from, to))
  const prev = previousPeriod(query.range)

  const lowStockIds = new Set(
    data.inventory.filter((i) => i.currentStock < i.lowStockThreshold).map((i) => i.id),
  )

  return {
    today,
    generatedAt,
    range: { from, to },
    counts: {
      visits: visitsInRange.length,
      incidents: incidentsInRange.length,
      incidentsAtStage1: incidentsInRange.filter((i) => i.stage === 1).length,
      pendingRecords: data.students.filter((s) => !s.archived && !s.recordComplete).length,
      lowStockItems: lowStockIds.size,
      activeStudents: data.students.filter((s) => !s.archived).length,
    },
    previousCounts: {
      visits: data.visits.filter((v) => isWithin(dateOf(v.dateTime), prev.from, prev.to)).length,
      incidents: data.incidents.filter((i) => isWithin(dateOf(i.time), prev.from, prev.to)).length,
    },
    dueFollowUps: buildDueFollowUps(data, studentsById),
    upcomingWindowDays: MOCK_RULES.upcomingFollowUpDays,
    frequentVisitors: buildFrequentVisitors(visitsInRange, studentsById),
    frequentVisitorMinVisits: MOCK_RULES.frequentVisitorMinVisits,
    inventoryAlerts: buildInventoryAlerts(data, lowStockIds),
    complaintTrends: buildComplaintTrends(
      [
        ...visitsInRange.map((v) => ({ date: dateOf(v.dateTime), complaint: v.complaint })),
        ...incidentsInRange.map((i) => ({ date: dateOf(i.time), complaint: i.complaint })),
      ],
      from,
      to,
      query.trendGranularity,
    ),
  }
}

/**
 * Due/upcoming follow-ups: status `pending` with a date on or before today + the upcoming window.
 * Overdue items stay listed (still `pending`) until Staff marks them Completed or Missed.
 * The date filter doesn't apply here. Module 9 says these are computed against *today*.
 */
export function buildDueFollowUps(
  data: MockDataset,
  studentsById: Map<string, Student>,
): DueFollowUpRow[] {
  const horizon = addDays(data.today, MOCK_RULES.upcomingFollowUpDays)
  return data.followUps
    .filter((f) => f.status === 'pending' && f.followUpDate <= horizon)
    .flatMap((f) => {
      const student = studentsById.get(f.studentId)
      if (!student) return []
      const daysFromToday = diffDays(data.today, f.followUpDate)
      const dueState: FollowUpDueState =
        daysFromToday < 0 ? 'overdue' : daysFromToday === 0 ? 'due_today' : 'upcoming'
      return [
        {
          followUp: {
            id: f.id,
            followUpDate: f.followUpDate,
            reason: f.reason,
            status: f.status,
            relatedRecord: f.relatedRecord,
          },
          student: toListRef(student),
          dueState,
          daysFromToday,
        },
      ]
    })
    .sort((a, b) => a.followUp.followUpDate.localeCompare(b.followUp.followUpDate))
}

function buildFrequentVisitors(visits: MockDataset['visits'], studentsById: Map<string, Student>) {
  const counts = new Map<string, number>()
  for (const v of visits) counts.set(v.studentId, (counts.get(v.studentId) ?? 0) + 1)
  return [...counts.entries()]
    .filter(([, count]) => count >= MOCK_RULES.frequentVisitorMinVisits)
    .flatMap(([id, visitCount]) => {
      const student = studentsById.get(id)
      return student ? [{ student: toListRef(student), visitCount }] : []
    })
    .sort(
      (a, b) =>
        b.visitCount - a.visitCount ||
        a.student.studentNumber.localeCompare(b.student.studentNumber),
    )
}

export function buildInventoryAlerts(
  data: MockDataset,
  lowStockIds: Set<string>,
): InventoryAlertRow[] {
  return data.inventory
    .map((item) => {
      const daysUntilExpiry = item.expirationDate ? diffDays(data.today, item.expirationDate) : null
      const flags: InventoryFlag[] = []
      if (lowStockIds.has(item.id)) flags.push('low_stock')
      if (daysUntilExpiry !== null && daysUntilExpiry < 0) flags.push('expired')
      else if (daysUntilExpiry !== null && daysUntilExpiry <= MOCK_RULES.expiryWarningDays)
        flags.push('nearing_expiration')
      return { item, flags, daysUntilExpiry }
    })
    .filter((row) => row.flags.length > 0)
    .sort((a, b) => severity(b) - severity(a) || a.item.name.localeCompare(b.item.name))
}

function severity(row: InventoryAlertRow): number {
  return (row.flags.includes('expired') ? 4 : 0) + row.flags.length
}

export function buildBuckets(
  from: ISODate,
  to: ISODate,
  granularity: TrendGranularity,
): TrendBucket[] {
  const buckets: TrendBucket[] = []
  let cursor = granularity === 'week' ? startOfWeek(from) : startOfMonth(from)
  while (cursor <= to) {
    const end = granularity === 'week' ? addDays(cursor, 6) : endOfMonth(cursor)
    // Clip each bucket to the selected range so partial weeks/months never count outside it.
    const bFrom = cursor < from ? from : cursor
    const bTo = end > to ? to : end
    buckets.push({
      key: cursor,
      label:
        granularity === 'week'
          ? formatShortDate(bFrom)
          : formatDate(cursor, { month: 'short', year: 'numeric' }),
      from: bFrom,
      to: bTo,
    })
    cursor = addDays(end, 1)
  }
  return buckets
}

export function buildComplaintTrends(
  events: Array<{ date: ISODate; complaint: string }>,
  from: ISODate,
  to: ISODate,
  granularity: TrendGranularity,
): ComplaintTrends {
  const buckets = buildBuckets(from, to, granularity)
  const byComplaint = new Map<string, number[]>()
  for (const e of events) {
    const index = buckets.findIndex((b) => isWithin(e.date, b.from, b.to))
    if (index < 0) continue
    const counts = byComplaint.get(e.complaint) ?? new Array<number>(buckets.length).fill(0)
    counts[index] += 1
    byComplaint.set(e.complaint, counts)
  }

  const all: ComplaintSeries[] = [...byComplaint.entries()]
    .map(([complaint, counts]) => ({
      complaint,
      counts,
      total: counts.reduce((a, b) => a + b, 0),
      clusterBuckets: detectClusters(counts),
    }))
    .sort((a, b) => b.total - a.total || a.complaint.localeCompare(b.complaint))

  return {
    granularity,
    buckets,
    series: all.slice(0, MOCK_RULES.topComplaints),
    otherComplaints: all.slice(MOCK_RULES.topComplaints),
  }
}

/** PLACEHOLDER cluster rule (see MOCK_RULES). Needs at least 2 buckets to compare against. */
export function detectClusters(counts: number[]): number[] {
  if (counts.length < 2) return []
  const total = counts.reduce((a, b) => a + b, 0)
  return counts.flatMap((count, i) => {
    const othersAvg = (total - count) / (counts.length - 1)
    return count >= MOCK_RULES.clusterMinCount && count >= othersAvg * MOCK_RULES.clusterRatio
      ? [i]
      : []
  })
}

export function buildCalendarDays(data: MockDataset, from: ISODate, to: ISODate): CalendarDay[] {
  const days = new Map<ISODate, CalendarDay>(
    eachDay(from, to).map((date) => [date, { date, visits: 0, incidents: 0, eventTags: [] }]),
  )
  const addTag = (day: CalendarDay, tag: string | null) => {
    if (tag && !day.eventTags.includes(tag)) day.eventTags.push(tag)
  }
  for (const v of data.visits) {
    const day = days.get(dateOf(v.dateTime))
    if (!day) continue
    day.visits += 1
    addTag(day, v.eventTag)
  }
  for (const i of data.incidents) {
    const day = days.get(dateOf(i.time))
    if (!day) continue
    day.incidents += 1
    addTag(day, i.eventTag)
  }
  return [...days.values()]
}
