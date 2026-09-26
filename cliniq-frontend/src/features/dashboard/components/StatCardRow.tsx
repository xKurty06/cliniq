import { StatCard, StatCardSkeleton, type IconName, type StatTrend } from '../../../components'
import { describeRange, rangeLengthDays, type DateRange } from '../../../lib/dateRange'
import type { DashboardSummary } from '../types'

/** Icon + label per card, shared by the loaded cards and their skeletons so the two never drift. */
const CARDS = {
  visits: { icon: 'activity', label: 'Clinic visits' },
  incidents: { icon: 'alertTriangle', label: 'Incidents' },
  pending: { icon: 'clipboardList', label: 'Incomplete records' },
  lowStock: { icon: 'package', label: 'Low-stock items' },
  students: { icon: 'users', label: 'Active students' },
} satisfies Record<string, { icon: IconName; label: string }>

const GRID = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'

export function StatCardRowSkeleton() {
  return (
    <ul aria-hidden="true" className={GRID}>
      {Object.values(CARDS).map((c) => (
        <li key={c.label} className="flex">
          <StatCardSkeleton icon={c.icon} label={c.label} />
        </li>
      ))}
    </ul>
  )
}

function trendFor(current: number, previous: number, range: DateRange): StatTrend {
  const days = rangeLengthDays(range)
  const period = days === 1 ? 'previous day' : `previous ${days} days`
  if (previous === 0) {
    return current === 0
      ? { direction: 'flat', text: `No change vs ${period}` }
      : { direction: 'up', text: `Up from 0 in ${period}` }
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return { direction: 'flat', text: `No change vs ${period}` }
  return {
    direction: pct > 0 ? 'up' : 'down',
    text: `${pct > 0 ? 'Up' : 'Down'} ${Math.abs(pct)}% vs ${period}`,
  }
}

/**
 * Five cards: visits, incidents, pending/incomplete records, low-stock items, active students.
 * This covers Reference 1's four cards plus Module 9's "active students" (confirmed with the team,
 * 2026-09-26). Range-scoped cards say which range they cover; the others say "Current".
 */
export function StatCardRow({ summary, range }: { summary: DashboardSummary; range: DateRange }) {
  const { counts, previousCounts } = summary
  const scope = describeRange(range)
  return (
    <section aria-label="Summary counts">
      <ul className={GRID}>
        <li className="flex">
          <StatCard
            icon={CARDS.visits.icon}
            label={CARDS.visits.label}
            value={counts.visits}
            scope={scope}
            trend={trendFor(counts.visits, previousCounts.visits, range)}
          />
        </li>
        <li className="flex">
          <StatCard
            icon={CARDS.incidents.icon}
            label={CARDS.incidents.label}
            value={counts.incidents}
            scope={scope}
            trend={trendFor(counts.incidents, previousCounts.incidents, range)}
            footnote={
              counts.incidentsAtStage1 > 0
                ? `${counts.incidentsAtStage1} still at Stage 1 (needs completion)`
                : undefined
            }
          />
        </li>
        <li className="flex">
          <StatCard
            icon={CARDS.pending.icon}
            label={CARDS.pending.label}
            value={counts.pendingRecords}
            scope="Current"
            footnote="Student records missing required fields"
          />
        </li>
        <li className="flex">
          <StatCard
            icon={CARDS.lowStock.icon}
            label={CARDS.lowStock.label}
            value={counts.lowStockItems}
            scope="Current"
            footnote="Below their low-stock threshold"
          />
        </li>
        <li className="flex">
          <StatCard
            icon={CARDS.students.icon}
            label={CARDS.students.label}
            value={counts.activeStudents}
            scope="Current"
            footnote="Excludes archived records"
          />
        </li>
      </ul>
    </section>
  )
}
