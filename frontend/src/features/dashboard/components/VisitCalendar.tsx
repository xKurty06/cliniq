import { useId, useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  ErrorState,
  Icon,
  SegmentedControl,
  Skeleton,
  type DataTableColumn,
} from '../../../components'
import { useAsyncData } from '../../../hooks/useAsyncData'
import { cn } from '../../../lib/cn'
import { formatDate, parseISODate } from '../../../lib/dates'
import type { ISODate } from '../../../types/entities'
import { fetchCalendarDays } from '../api/dashboardApi'
import {
  heatClasses,
  heatLevel,
  heatScale,
  legendSteps,
  monthGrid,
  periodFor,
  shiftAnchor,
  type CalendarView,
  type HeatScale,
} from '../lib/calendar'
import type { CalendarDay } from '../../../types/dashboard'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function describeDay(day: CalendarDay): string {
  const parts = [
    `${day.visits} ${day.visits === 1 ? 'visit' : 'visits'}`,
    `${day.incidents} ${day.incidents === 1 ? 'incident' : 'incidents'}`,
  ]
  if (day.eventTags.length) parts.push(`event: ${day.eventTags.join(', ')}`)
  return `${formatDate(day.date, { weekday: 'long', month: 'long', day: 'numeric' })}: ${parts.join(', ')}`
}

function Legend({ scale }: { scale: HeatScale }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
      <span>Visits + incidents per day:</span>
      <ul className="flex flex-wrap items-center gap-2">
        {legendSteps(scale).map((step) => (
          <li key={step.level} className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className={cn(
                'inline-block size-3.5 rounded-sm border border-border',
                heatClasses[step.level],
              )}
            />
            {step.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

function EventTags({ tags, className }: { tags: string[]; className?: string }) {
  if (!tags.length) return null
  return (
    <ul className={cn('flex flex-wrap gap-1', className)}>
      {tags.map((tag) => (
        <li
          key={tag}
          className="max-w-full truncate rounded-sm border border-brand-yellow-dark bg-brand-yellow px-1.5 py-0.5 text-[0.6875rem] leading-tight font-semibold text-text-primary"
          title={tag}
        >
          <span className="sr-only">Event: </span>
          {tag}
        </li>
      ))}
    </ul>
  )
}

function WeekView({
  days,
  scale,
  today,
}: {
  days: CalendarDay[]
  scale: HeatScale
  today: ISODate
}) {
  return (
    <ol className="grid grid-cols-1 gap-2 sm:grid-cols-7" aria-label="Days of the week">
      {days.map((day) => {
        const future = day.date > today
        const total = day.visits + day.incidents
        const d = parseISODate(day.date)
        return (
          <li
            key={day.date}
            className={cn(
              'flex min-h-28 flex-col gap-1 rounded-md p-2.5',
              future ? heatClasses[0] : heatClasses[heatLevel(total, scale)],
              'border-border',
              day.date === today && 'outline-2 outline-offset-1 outline-text-primary',
            )}
          >
            <span className="text-xs font-semibold">
              {WEEKDAYS_LONG[d.getDay()]},{' '}
              {formatDate(day.date, { month: 'short', day: 'numeric' })}
              {day.date === today && ' (today)'}
            </span>
            {future ? (
              <span className="text-xs">Not yet</span>
            ) : (
              <>
                <span className="text-xl font-semibold">{total}</span>
                <span className="text-xs">
                  {day.visits} {day.visits === 1 ? 'visit' : 'visits'} · {day.incidents}{' '}
                  {day.incidents === 1 ? 'incident' : 'incidents'}
                </span>
              </>
            )}
            <EventTags tags={day.eventTags} />
          </li>
        )
      })}
    </ol>
  )
}

function MonthView({
  monthStart,
  byDate,
  scale,
  today,
  label,
}: {
  monthStart: ISODate
  byDate: Map<ISODate, CalendarDay>
  scale: HeatScale
  today: ISODate
  label: string
}) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[36rem] table-fixed border-separate border-spacing-1.5">
        <caption className="sr-only">Visits and incidents per day, {label}</caption>
        <thead>
          <tr>
            {WEEKDAYS.map((w, i) => (
              <th key={w} scope="col" className="text-xs font-semibold text-text-secondary">
                <abbr title={WEEKDAYS_LONG[i]} className="no-underline">
                  {w}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(monthStart).map((week, wi) => (
            <tr key={wi}>
              {week.map((date, di) => {
                if (!date) return <td key={di} aria-hidden="true" />
                const day = byDate.get(date)
                const future = date > today
                const total = day ? day.visits + day.incidents : 0
                return (
                  <td
                    key={date}
                    title={day && !future ? describeDay(day) : undefined}
                    className={cn(
                      'h-16 rounded-md p-2 align-top',
                      future || !day ? heatClasses[0] : heatClasses[heatLevel(total, scale)],
                      'border-border',
                      date === today && 'outline-2 outline-offset-1 outline-text-primary',
                    )}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs">{parseISODate(date).getDate()}</span>
                      {!future && day && (
                        <span className="text-sm font-semibold">
                          {total}
                          <span className="sr-only">
                            {' '}
                            total: {day.visits} visits, {day.incidents} incidents
                          </span>
                        </span>
                      )}
                    </div>
                    {date === today && <span className="sr-only"> (today)</span>}
                    {day && <EventTags tags={day.eventTags} className="mt-1" />}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function YearView({
  year,
  byDate,
  scale,
  today,
}: {
  year: string
  byDate: Map<ISODate, CalendarDay>
  scale: HeatScale
  today: ISODate
}) {
  const months = Array.from(
    { length: 12 },
    (_, m) => `${year}-${String(m + 1).padStart(2, '0')}-01`,
  )
  const tagged = [...byDate.values()].filter((d) => d.eventTags.length > 0)
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {months.map((monthStart) => {
          const days = [...byDate.values()].filter(
            (d) => d.date.slice(0, 7) === monthStart.slice(0, 7),
          )
          const visits = days.reduce((s, d) => s + d.visits, 0)
          const incidents = days.reduce((s, d) => s + d.incidents, 0)
          return (
            <li key={monthStart} className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-text-primary">
                {formatDate(monthStart, { month: 'long' })}
                <span className="font-normal text-text-secondary">
                  {' '}
                  · {visits} visits · {incidents} incidents
                </span>
              </p>
              {/* The mini grid is a visual summary only. The line above, the tagged-day list, and
                  the Table view carry the same information for screen readers. */}
              <div aria-hidden="true" className="grid w-fit grid-cols-7 gap-0.5">
                {monthGrid(monthStart)
                  .flat()
                  .map((date, i) => {
                    if (!date) return <span key={`blank-${i}`} className="size-3" />
                    const day = byDate.get(date)
                    const total = day ? day.visits + day.incidents : 0
                    const future = date > today
                    return (
                      <span
                        key={date}
                        title={day && !future ? describeDay(day) : undefined}
                        className={cn(
                          'size-3 rounded-[2px] border',
                          future ? heatClasses[0] : heatClasses[heatLevel(total, scale)],
                          day?.eventTags.length ? 'border-text-primary' : 'border-border',
                        )}
                      />
                    )
                  })}
              </div>
            </li>
          )
        })}
      </ul>
      <div>
        <p className="text-xs font-semibold text-text-primary">Tagged days in {year}</p>
        <p className="text-xs text-text-secondary">Outlined squares above mark these days.</p>
        {tagged.length === 0 ? (
          <p className="text-xs text-text-secondary">No event tags this year.</p>
        ) : (
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-primary">
            {tagged.map((d) => (
              <li key={d.date}>
                <time dateTime={d.date} className="font-semibold">
                  {formatDate(d.date, { month: 'short', day: 'numeric' })}
                </time>{' '}
                {d.eventTags.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function CalendarTable({ view, days }: { view: CalendarView; days: CalendarDay[] }) {
  if (view === 'year') {
    const byMonth = new Map<
      string,
      { key: string; visits: number; incidents: number; tags: string[] }
    >()
    for (const d of days) {
      const key = d.date.slice(0, 7)
      const row = byMonth.get(key) ?? { key, visits: 0, incidents: 0, tags: [] }
      row.visits += d.visits
      row.incidents += d.incidents
      for (const t of d.eventTags) if (!row.tags.includes(t)) row.tags.push(t)
      byMonth.set(key, row)
    }
    const rows = [...byMonth.values()]
    const columns: Array<DataTableColumn<(typeof rows)[number]>> = [
      {
        key: 'month',
        header: 'Month',
        rowHeader: true,
        cell: (r) => formatDate(`${r.key}-01`, { month: 'long', year: 'numeric' }),
      },
      { key: 'visits', header: 'Visits', align: 'right', cell: (r) => r.visits },
      { key: 'incidents', header: 'Incidents', align: 'right', cell: (r) => r.incidents },
      { key: 'total', header: 'Total', align: 'right', cell: (r) => r.visits + r.incidents },
      { key: 'tags', header: 'Event tags', cell: (r) => r.tags.join(', ') || '—' },
    ]
    return (
      <DataTable
        caption="Visits and incidents per month"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.key}
      />
    )
  }
  const rows = days.filter((d) => d.visits + d.incidents > 0 || d.eventTags.length > 0)
  const columns: Array<DataTableColumn<CalendarDay>> = [
    {
      key: 'date',
      header: 'Date',
      rowHeader: true,
      cell: (d) => formatDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' }),
    },
    { key: 'visits', header: 'Visits', align: 'right', cell: (d) => d.visits },
    { key: 'incidents', header: 'Incidents', align: 'right', cell: (d) => d.incidents },
    { key: 'total', header: 'Total', align: 'right', cell: (d) => d.visits + d.incidents },
    { key: 'tags', header: 'Event tags', cell: (d) => d.eventTags.join(', ') || '—' },
  ]
  return rows.length ? (
    <DataTable
      caption="Days with clinic activity or an event tag"
      columns={columns}
      rows={rows}
      rowKey={(d) => d.date}
    />
  ) : (
    <p className="text-sm text-text-secondary">No clinic activity recorded in this period.</p>
  )
}

/**
 * Loading placeholder shaped like the selected view. The day grid itself (weekdays, dates, month
 * names) is known before any data arrives, so it's drawn for real; only the per-day counts, event
 * tags, and legend are placeholder bars.
 */
function CalendarSkeleton({ view, periodFrom }: { view: CalendarView; periodFrom: ISODate }) {
  const legend = (
    <div className="flex items-center gap-2">
      <Skeleton className="h-3 w-36" />
      <Skeleton className="h-3 w-40" />
    </div>
  )
  if (view === 'week') {
    const start = periodFrom
    return (
      <div aria-hidden="true" data-skeleton="calendar-week" className="flex flex-col gap-3">
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => {
            const d = parseISODate(start)
            d.setDate(d.getDate() + i)
            return (
              <li key={i} className="flex min-h-28 flex-col gap-2 rounded-md bg-surface p-2.5">
                <span className="text-xs font-semibold text-text-secondary">
                  {WEEKDAYS_LONG[d.getDay()]},{' '}
                  {d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </span>
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-3 w-24 max-w-full" />
              </li>
            )
          })}
        </ol>
        {legend}
      </div>
    )
  }
  if (view === 'year') {
    const year = periodFrom.slice(0, 4)
    return (
      <div aria-hidden="true" data-skeleton="calendar-year" className="flex flex-col gap-4">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, m) => {
            const monthStart = `${year}-${String(m + 1).padStart(2, '0')}-01`
            return (
              <li key={monthStart} className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  {formatDate(monthStart, { month: 'long' })}
                  <Skeleton className="h-3 w-20" />
                </span>
                <div className="grid w-fit grid-cols-7 gap-0.5">
                  {monthGrid(monthStart)
                    .flat()
                    .map((date, i) =>
                      date ? (
                        <span key={date} className="size-3 rounded-[2px] bg-border" />
                      ) : (
                        <span key={`blank-${i}`} className="size-3" />
                      ),
                    )}
                </div>
              </li>
            )
          })}
        </ul>
        {legend}
      </div>
    )
  }
  return (
    <div aria-hidden="true" data-skeleton="calendar-month" className="flex flex-col gap-3">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[36rem] table-fixed border-separate border-spacing-1.5">
          <thead>
            <tr>
              {WEEKDAYS.map((w) => (
                <th key={w} className="text-xs font-semibold text-text-secondary">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthGrid(periodFrom).map((week, wi) => (
              <tr key={wi}>
                {week.map((date, di) =>
                  date ? (
                    <td key={date} className="h-16 rounded-md bg-surface p-2 align-top">
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs text-text-secondary">
                          {parseISODate(date).getDate()}
                        </span>
                        <Skeleton className="h-4 w-5" />
                      </div>
                    </td>
                  ) : (
                    <td key={di} />
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {legend}
    </div>
  )
}

const viewNoun: Record<CalendarView, string> = { week: 'week', month: 'month', year: 'year' }

export interface VisitCalendarProps {
  today: ISODate
  /** The date the calendar opens on (the end of the dashboard's date range). */
  initialAnchor: ISODate
}

/**
 * Calendar view (Reference 1, item 5; Module 9): a weekly/monthly/yearly toggle and a heatmap of
 * visits + incidents per day, with Staff's free-text event tags shown as small text on each day.
 * It pages through time on its own (Previous / Next / Today) and loads only the visible period.
 */
export function VisitCalendar({ today, initialAnchor }: VisitCalendarProps) {
  const headingId = useId()
  const [view, setView] = useState<CalendarView>('month')
  const [display, setDisplay] = useState<'calendar' | 'table'>('calendar')
  const [anchor, setAnchor] = useState<ISODate>(initialAnchor)
  // When the dashboard date range changes, jump to its end date but keep the chosen view.
  const [lastInitial, setLastInitial] = useState(initialAnchor)
  if (lastInitial !== initialAnchor) {
    setLastInitial(initialAnchor)
    setAnchor(initialAnchor)
  }
  const period = periodFor(view, anchor)
  const { data, status, isRefetching, reload } = useAsyncData(`${period.from}|${period.to}`, () =>
    fetchCalendarDays(period.from, period.to),
  )

  const byDate = useMemo(() => new Map((data ?? []).map((d) => [d.date, d])), [data])
  const scale = useMemo(
    () => heatScale((data ?? []).filter((d) => d.date <= today).map((d) => d.visits + d.incidents)),
    [data, today],
  )
  const nextDisabled = period.to >= today

  return (
    <Card aria-labelledby={headingId}>
      <CardHeader
        titleId={headingId}
        icon={<Icon name="calendar" />}
        title="Calendar"
        description="Visits and incidents per day, with event tags Staff added to visits or incidents."
        actions={
          <>
            <SegmentedControl
              label="Calendar period"
              value={view}
              onChange={setView}
              options={[
                { value: 'week', label: 'Weekly' },
                { value: 'month', label: 'Monthly' },
                { value: 'year', label: 'Yearly' },
              ]}
            />
            <SegmentedControl
              label="Show calendar as"
              value={display}
              onChange={setDisplay}
              options={[
                { value: 'calendar', label: 'Calendar', icon: 'calendar' },
                { value: 'table', label: 'Table', icon: 'table' },
              ]}
            />
          </>
        }
      />
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-text-primary" aria-live="polite">
            {period.label}
          </h3>
          <div className="flex items-center gap-2 print:hidden">
            <Button
              size="sm"
              variant="neutral"
              icon="chevronLeft"
              onClick={() => setAnchor(shiftAnchor(view, anchor, -1))}
            >
              Previous<span className="sr-only"> {viewNoun[view]}</span>
            </Button>
            <Button size="sm" variant="neutral" onClick={() => setAnchor(today)}>
              Today
            </Button>
            <Button
              size="sm"
              variant="neutral"
              disabled={nextDisabled}
              onClick={() => setAnchor(shiftAnchor(view, anchor, 1))}
            >
              Next<span className="sr-only"> {viewNoun[view]}</span>
              <Icon name="chevronRight" />
            </Button>
          </div>
        </div>

        {status === 'error' ? (
          <ErrorState title="Unable to load the calendar." onRetry={reload} />
        ) : status === 'loading' && !data ? (
          <>
            <p className="sr-only" role="status">
              Loading calendar…
            </p>
            <CalendarSkeleton view={view} periodFrom={period.from} />
          </>
        ) : (
          <div
            aria-busy={isRefetching}
            className={cn(
              'flex flex-col gap-3 transition-opacity motion-reduce:transition-none',
              isRefetching && 'opacity-60',
            )}
          >
            {display === 'table' ? (
              <CalendarTable view={view} days={(data ?? []).filter((d) => d.date <= today)} />
            ) : (
              <>
                {view === 'week' && <WeekView days={data ?? []} scale={scale} today={today} />}
                {view === 'month' && (
                  <MonthView
                    monthStart={period.from}
                    byDate={byDate}
                    scale={scale}
                    today={today}
                    label={period.label}
                  />
                )}
                {view === 'year' && (
                  <YearView year={period.label} byDate={byDate} scale={scale} today={today} />
                )}
                <Legend scale={scale} />
              </>
            )}
            {scale.max === 0 && (
              <p className="text-xs text-text-secondary">
                No visits or incidents were recorded in this {viewNoun[view]}.
              </p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
