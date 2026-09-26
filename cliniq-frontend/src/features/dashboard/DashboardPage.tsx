import { useState } from 'react'
import { DateRangePicker, ErrorState } from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { cn } from '../../lib/cn'
import { formatDateRange, todayISO } from '../../lib/dates'
import { rangeForPreset, type DateRange } from '../../lib/dateRange'
import { fetchDashboardSummary } from './api/dashboardApi'
import {
  ALERT_GRID,
  AlertListsSkeleton,
  FollowUpsAlert,
  FrequentVisitorsAlert,
  InventoryAlert,
} from './components/AlertLists'
import { ComplaintTrends, ComplaintTrendsSkeleton } from './components/ComplaintTrends'
import { DashboardHeader } from './components/DashboardHeader'
import { StatCardRow, StatCardRowSkeleton } from './components/StatCardRow'
import { VisitCalendar } from './components/VisitCalendar'
import type { TrendGranularity } from './types'

/**
 * First-load skeleton: each section's own shaped placeholder in the same grid positions as the
 * loaded page, so nothing shifts when data arrives (Design-System.md, Feedback & System States).
 * The calendar isn't here because it loads independently and shows its own view-shaped skeleton.
 */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <StatCardRowSkeleton />
      <AlertListsSkeleton />
      <ComplaintTrendsSkeleton />
    </div>
  )
}

/**
 * Clinic Overview Dashboard (Screen Inventory #31, Reference 1, Module 9).
 * Staff and Admin/Principal see the same layout. It's view-only for both: no create, update,
 * or delete happens here, so there are no audit-log writes (ADR-011).
 *
 * Top to bottom: header → date-range filter → stat cards → three alert groups → complaint trends →
 * calendar. The export/print button sits in the header. Every data section shows a skeleton shaped
 * like itself on first load; later refetches keep the previous render dimmed instead.
 */
export function DashboardPage() {
  const today = todayISO()
  const [range, setRange] = useState<DateRange>(() => rangeForPreset('last30', today))
  const [granularity, setGranularity] = useState<TrendGranularity>('week')

  const { data, status, isRefetching, reload } = useAsyncData(
    `${range.from}|${range.to}|${granularity}`,
    () => fetchDashboardSummary({ range, trendGranularity: granularity }),
  )

  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6">
      <DashboardHeader today={today} onPrint={() => window.print()} />

      <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
        <div className="print:hidden">
          <DateRangePicker value={range} onChange={setRange} today={today} />
        </div>
        <p className="text-xs text-text-secondary" aria-live="polite">
          {isRefetching ? 'Updating…' : `Showing ${formatDateRange(range.from, range.to)}`}
        </p>
      </div>

      {status === 'error' ? (
        <ErrorState title="Unable to load the clinic overview." onRetry={reload} />
      ) : status === 'loading' && !data ? (
        <>
          <p className="sr-only" role="status">
            Loading clinic overview…
          </p>
          <DashboardSkeleton />
        </>
      ) : data ? (
        <div
          aria-busy={isRefetching}
          className={cn(
            'flex flex-col gap-4 transition-opacity motion-reduce:transition-none',
            isRefetching && 'opacity-60',
          )}
        >
          <StatCardRow summary={data} range={range} />

          <section aria-label="Alerts" className={ALERT_GRID}>
            <FollowUpsAlert summary={data} />
            <FrequentVisitorsAlert summary={data} range={range} />
            <InventoryAlert summary={data} />
          </section>

          <ComplaintTrends
            trends={data.complaintTrends}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
        </div>
      ) : null}

      {/* Separate data source: loads in parallel with its own skeleton, and fails/retries on its own. */}
      <VisitCalendar today={today} initialAnchor={range.to} />
    </main>
  )
}
