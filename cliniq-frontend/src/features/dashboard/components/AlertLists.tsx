import {
  inventoryFlagMap,
  followUpDueMap,
  frequentVisitorMap,
  ListCard,
  ListCardSkeleton,
  ListRow,
  StatusBadge,
} from '../../../components'
import { formatDate } from '../../../lib/dates'
import { describeRange, type DateRange } from '../../../lib/dateRange'
import type { DashboardSummary, DueFollowUpRow, InventoryAlertRow } from '../types'

/*
 * The three alert groups (Reference 1, item 3). All three are read-only: no resolve or complete
 * actions here, for Staff or Admin (Module 9: the dashboard is view-only). Follow-up status
 * changes happen on the Follow-Up List (#18c).
 *
 * Display-privacy (ADR-004): multi-student lists show the Student Number, never the name. The
 * row data can't carry a name (see `StudentListRef`). Showing the follow-up reason next to the
 * Student Number follows ADR-010.
 */

/** Titles + icons shared by the loaded lists and their skeletons. */
const LISTS = {
  followUps: { title: 'Due & upcoming follow-ups', icon: 'calendarClock' },
  frequent: { title: 'Frequent-visitor warnings', icon: 'repeat' },
  inventory: { title: 'Low-stock & expiring items', icon: 'package' },
} as const

export const ALERT_GRID = 'grid grid-cols-1 gap-4 lg:grid-cols-3'

export function AlertListsSkeleton() {
  return (
    <div aria-hidden="true" className={ALERT_GRID}>
      <ListCardSkeleton {...LISTS.followUps} />
      <ListCardSkeleton {...LISTS.frequent} withSecondary={false} />
      <ListCardSkeleton {...LISTS.inventory} />
    </div>
  )
}

function dueText(row: DueFollowUpRow): string {
  const date = formatDate(row.followUp.followUpDate)
  if (row.daysFromToday < 0) {
    const n = -row.daysFromToday
    return `${date} (${n} ${n === 1 ? 'day' : 'days'} ago)`
  }
  if (row.daysFromToday === 0) return `${date} (today)`
  return `${date} (in ${row.daysFromToday} ${row.daysFromToday === 1 ? 'day' : 'days'})`
}

export function FollowUpsAlert({ summary }: { summary: DashboardSummary }) {
  const rows = summary.dueFollowUps
  return (
    <ListCard
      title={LISTS.followUps.title}
      icon={LISTS.followUps.icon}
      count={rows.length}
      description={`Pending follow-ups that are overdue, due today, or due in the next ${summary.upcomingWindowDays} days. Always counted from today, not from the date range.`}
      empty={{
        title: 'No follow-ups due',
        description: `Nothing is overdue, due today, or due in the next ${summary.upcomingWindowDays} days.`,
      }}
    >
      {rows.map((row) => (
        <ListRow
          key={row.followUp.id}
          primary={row.student.studentNumber}
          secondary={row.followUp.reason}
          meta={<time dateTime={row.followUp.followUpDate}>{dueText(row)}</time>}
          trailing={<StatusBadge status={row.dueState} map={followUpDueMap} />}
        />
      ))}
    </ListCard>
  )
}

export function FrequentVisitorsAlert({
  summary,
  range,
}: {
  summary: DashboardSummary
  range: DateRange
}) {
  const rows = summary.frequentVisitors
  const scope = describeRange(range).toLowerCase()
  return (
    <ListCard
      title={LISTS.frequent.title}
      icon={LISTS.frequent.icon}
      count={rows.length}
      description={`Students with ${summary.frequentVisitorMinVisits} or more visits (${scope}). This is a warning only, not a diagnosis or a recommended action.`}
      empty={{
        title: 'No frequent-visitor warnings',
        description: `No student reached ${summary.frequentVisitorMinVisits} visits in this date range.`,
      }}
    >
      {rows.map((row) => (
        <ListRow
          key={row.student.id}
          primary={row.student.studentNumber}
          meta={`${row.visitCount} visits`}
          trailing={<StatusBadge status="frequent_visits" map={frequentVisitorMap} />}
        />
      ))}
    </ListCard>
  )
}

function expiryLabel(row: InventoryAlertRow): string | undefined {
  if (row.daysUntilExpiry === null) return undefined
  const n = Math.abs(row.daysUntilExpiry)
  const days = `${n} ${n === 1 ? 'day' : 'days'}`
  if (row.daysUntilExpiry < 0) return `Expired ${days} ago`
  if (row.daysUntilExpiry === 0) return 'Expires today'
  return `Expires in ${days}`
}

export function InventoryAlert({ summary }: { summary: DashboardSummary }) {
  const rows = summary.inventoryAlerts
  return (
    <ListCard
      title={LISTS.inventory.title}
      icon={LISTS.inventory.icon}
      count={rows.length}
      description="Current inventory. Low stock and expiry are separate flags, and an item can have both."
      empty={{
        title: 'No inventory alerts',
        description: 'Every item is above its low-stock threshold and not close to expiring.',
      }}
    >
      {rows.map((row) => (
        <ListRow
          key={row.item.id}
          primary={row.item.name}
          secondary={`${row.item.currentStock} ${row.item.unit} in stock · threshold ${row.item.lowStockThreshold}`}
          trailing={
            <>
              {row.flags.map((flag) => (
                <StatusBadge
                  key={flag}
                  status={flag}
                  map={inventoryFlagMap}
                  label={flag === 'low_stock' ? undefined : expiryLabel(row)}
                />
              ))}
            </>
          }
        />
      ))}
    </ListCard>
  )
}
