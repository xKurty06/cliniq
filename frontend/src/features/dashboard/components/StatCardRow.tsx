import {
  Icon,
  StatCard,
  StatCardSkeleton,
  type IconName,
  type StatTone,
  type StatTrend,
} from '../../../components'
import { Link } from 'react-router'
import { rangeLengthDays, type DateRange } from '../../../lib/dateRange'
import { paths } from '../../../routes/paths'
import type { DashboardSummary } from '../../../types/dashboard'

/**
 * Icon, label, and accent per card, shared by the loaded cards and their skeletons so the two never
 * drift. Accents follow the reference mockup and each color's single meaning: brand = routine
 * activity, error = emergencies, warning = needs attention, neutral = plain count.
 */
const CARDS = {
  visits: { icon: 'activity', label: 'Clinic visits', tone: 'brand' },
  incidents: { icon: 'alertTriangle', label: 'Incidents', tone: 'error' },
  pending: { icon: 'clipboardList', label: 'Incomplete records', tone: 'warning' },
  lowStock: { icon: 'package', label: 'Low-stock items', tone: 'warning' },
  students: { icon: 'users', label: 'Active students', tone: 'neutral' },
} satisfies Record<string, { icon: IconName; label: string; tone: StatTone }>

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'

function StatLabelLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-0.5 text-current cursor-pointer transition-[color,text-decoration-color] hover:underline hover:brightness-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green motion-reduce:transition-none"
    >
      {label}
      <Icon name="chevronRight" size={14} />
    </Link>
  )
}

export function StatCardRowSkeleton() {
  return (
    <ul aria-hidden="true" className={GRID}>
      {Object.values(CARDS).map((c) => (
        <li key={c.label} className="flex">
          <StatCardSkeleton icon={c.icon} label={c.label} tone={c.tone} />
        </li>
      ))}
    </ul>
  )
}

function trendFor(current: number, previous: number, range: DateRange): StatTrend {
  const days = rangeLengthDays(range)
  const period = days === 1 ? 'prior day' : `prior ${days} days`
  if (previous === 0) {
    return current === 0
      ? { direction: 'flat', text: `No change vs ${period}` }
      : { direction: 'up', text: `Up from 0 (${period})` }
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return { direction: 'flat', text: `No change vs ${period}` }
  return {
    direction: pct > 0 ? 'up' : 'down',
    text: `${Math.abs(pct)}% vs ${period}`,
  }
}

/**
 * Five cards: visits, incidents, pending/incomplete records, low-stock items, active students.
 * This covers Reference 1's four cards plus Module 9's "active students" (confirmed with the team,
 * 2026-09-26, ADR-011). Range-scoped cards compare against the previous equal period (the header
 * shows which period); the others say "Current".
 */
export function StatCardRow({
  summary,
  range,
  canNavigate,
}: {
  summary: DashboardSummary
  range: DateRange
  canNavigate: boolean
}) {
  const { counts, previousCounts } = summary
  const cards = [
    {
      to: paths.visits,
      card: (
        <StatCard
          icon={CARDS.visits.icon}
          label={CARDS.visits.label}
          tone={CARDS.visits.tone}
          value={counts.visits}
          trend={trendFor(counts.visits, previousCounts.visits, range)}
          labelAction={
            canNavigate ? <StatLabelLink to={paths.visits} label={CARDS.visits.label} /> : undefined
          }
        />
      ),
    },
    {
      to: paths.incidents,
      card: (
        <StatCard
          icon={CARDS.incidents.icon}
          label={CARDS.incidents.label}
          tone={CARDS.incidents.tone}
          value={counts.incidents}
          trend={trendFor(counts.incidents, previousCounts.incidents, range)}
          footnote={
            counts.incidentsAtStage1 > 0
              ? `${counts.incidentsAtStage1} still at Stage 1`
              : undefined
          }
          labelAction={
            canNavigate ? <StatLabelLink to={paths.incidents} label={CARDS.incidents.label} /> : undefined
          }
        />
      ),
    },
    {
      to: paths.incompleteRecords,
      card: (
        <StatCard
          icon={CARDS.pending.icon}
          label={CARDS.pending.label}
          tone={CARDS.pending.tone}
          value={counts.pendingRecords}
          scope="Current · missing required fields"
          labelAction={
            canNavigate ? <StatLabelLink to={paths.incompleteRecords} label={CARDS.pending.label} /> : undefined
          }
        />
      ),
    },
    {
      to: paths.inventory,
      card: (
        <StatCard
          icon={CARDS.lowStock.icon}
          label={CARDS.lowStock.label}
          tone={CARDS.lowStock.tone}
          value={counts.lowStockItems}
          scope="Current · below threshold"
          labelAction={
            canNavigate ? <StatLabelLink to={paths.inventory} label={CARDS.lowStock.label} /> : undefined
          }
        />
      ),
    },
    {
      to: paths.students,
      card: (
        <StatCard
          icon={CARDS.students.icon}
          label={CARDS.students.label}
          tone={CARDS.students.tone}
          value={counts.activeStudents}
          scope="Current · excludes archived"
          labelAction={
            canNavigate ? <StatLabelLink to={paths.students} label={CARDS.students.label} /> : undefined
          }
        />
      ),
    },
  ]
  return (
    <section aria-label="Summary counts">
      <ul className={GRID}>
        {cards.map(({ to, card }) => (
          <li key={to} className="flex">
            {card}
          </li>
        ))}
      </ul>
    </section>
  )
}
