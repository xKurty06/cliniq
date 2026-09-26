import '../../../components/charts/chartSetup'
import type { Chart, ChartOptions, Plugin } from 'chart.js'
import { useId, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  Icon,
  SegmentedControl,
  Skeleton,
  type DataTableColumn,
} from '../../../components'
import { formatDate } from '../../../lib/dates'
import { colorToken } from '../../../lib/tokens'
import type {
  ComplaintSeries,
  ComplaintTrends as Trends,
  TrendBucket,
  TrendGranularity,
} from '../types'

type ViewMode = 'chart' | 'table'

function bucketName(bucket: TrendBucket, granularity: TrendGranularity): string {
  return granularity === 'week'
    ? `Week of ${formatDate(bucket.from)}`
    : formatDate(bucket.from, { month: 'long', year: 'numeric' })
}

/**
 * The symptom-cluster marker: a small warning triangle with "!" drawn above each flagged bar. The
 * bar's warning color is never the only signal. There's the marker shape, the text callout above
 * the charts, and the table view.
 */
const clusterMarker: Plugin<'bar'> = {
  id: 'clusterMarker',
  afterDatasetsDraw(chart: Chart<'bar'>) {
    const clusters = (chart.options.plugins as { clusterMarker?: { indexes: number[] } })
      .clusterMarker?.indexes
    if (!clusters?.length) return
    const { ctx } = chart
    const meta = chart.getDatasetMeta(0)
    const fill = colorToken('warning')
    ctx.save()
    for (const index of clusters) {
      const bar = meta.data[index]
      if (!bar) continue
      const { x, y } = bar.getProps(['x', 'y'], true) as { x: number; y: number }
      const top = y - 16
      ctx.beginPath()
      ctx.moveTo(x, top)
      ctx.lineTo(x + 7, top + 12)
      ctx.lineTo(x - 7, top + 12)
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
      ctx.fillStyle = colorToken('white')
      ctx.font = 'bold 9px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('!', x, top + 10.5)
    }
    ctx.restore()
  },
}

function MiniChart({
  series,
  buckets,
  granularity,
  yMax,
}: {
  series: ComplaintSeries
  buckets: TrendBucket[]
  granularity: TrendGranularity
  yMax: number
}) {
  const green = colorToken('brand-green')
  const warning = colorToken('warning')
  const grid = colorToken('border')
  const tick = colorToken('text-secondary')
  const clusterSet = new Set(series.clusterBuckets)

  const data = {
    labels: buckets.map((b) => b.label),
    datasets: [
      {
        label: series.complaint,
        data: series.counts,
        backgroundColor: series.counts.map((_, i) => (clusterSet.has(i) ? warning : green)),
        hoverBackgroundColor: series.counts.map((_, i) => (clusterSet.has(i) ? warning : green)),
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: 'bottom' as const,
        maxBarThickness: 24,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
    ],
  }

  const options: ChartOptions<'bar'> & { plugins: { clusterMarker: { indexes: number[] } } } = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 18 } },
    scales: {
      x: {
        grid: { display: false },
        border: { color: grid },
        ticks: { color: tick, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
      },
      y: {
        beginAtZero: true,
        max: yMax,
        grid: { color: grid },
        border: { display: false },
        ticks: { color: tick, precision: 0, maxTicksLimit: 3 },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: (items) => bucketName(buckets[items[0].dataIndex], granularity),
          label: (item) => `${item.parsed.y} cases`,
          afterLabel: (item) => (clusterSet.has(item.dataIndex) ? 'Possible symptom cluster' : ''),
        },
      },
      clusterMarker: { indexes: series.clusterBuckets },
    },
  }

  const summary = `${series.complaint}, ${series.total} total. ${buckets
    .map(
      (b, i) =>
        `${bucketName(b, granularity)}: ${series.counts[i]}${clusterSet.has(i) ? ' (possible cluster)' : ''}`,
    )
    .join('; ')}.`

  return (
    <figure className="flex min-w-0 flex-col gap-1 rounded-md border border-border p-3 print:break-inside-avoid">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-semibold text-text-primary">{series.complaint}</span>
        <span className="shrink-0 text-xs text-text-secondary">{series.total} total</span>
      </figcaption>
      <div className="relative h-36">
        <Bar
          data={data}
          options={options}
          plugins={[clusterMarker]}
          role="img"
          aria-label={summary}
        />
      </div>
    </figure>
  )
}

function TrendTable({ trends }: { trends: Trends }) {
  const rows = [...trends.series, ...trends.otherComplaints]
  const columns: Array<DataTableColumn<ComplaintSeries>> = [
    { key: 'complaint', header: 'Complaint', cell: (r) => r.complaint, rowHeader: true },
    ...trends.buckets.map((b, i) => ({
      key: b.key,
      header: bucketName(b, trends.granularity),
      align: 'right' as const,
      cell: (r: ComplaintSeries) =>
        r.clusterBuckets.includes(i) ? (
          <span className="inline-flex items-center gap-1 font-semibold">
            <Icon name="alertTriangle" size={12} className="text-warning" />
            {r.counts[i]}
            <span className="sr-only"> (possible symptom cluster)</span>
          </span>
        ) : (
          r.counts[i]
        ),
    })),
    { key: 'total', header: 'Total', align: 'right', cell: (r) => <strong>{r.total}</strong> },
  ]
  return (
    <DataTable
      caption="Complaint counts per period, visits and incidents combined. A warning icon marks a possible symptom cluster."
      columns={columns}
      rows={rows}
      rowKey={(r) => r.complaint}
    />
  )
}

export interface ComplaintTrendsProps {
  trends: Trends
  granularity: TrendGranularity
  onGranularityChange: (g: TrendGranularity) => void
}

export function ComplaintTrends({
  trends,
  granularity,
  onGranularityChange,
}: ComplaintTrendsProps) {
  const headingId = useId()
  const [view, setView] = useState<ViewMode>('chart')
  const yMax = useMemo(
    () => Math.max(1, ...trends.series.flatMap((s) => s.counts)),
    [trends.series],
  )
  const clusters = trends.series.flatMap((s) =>
    s.clusterBuckets.map((i) => ({
      complaint: s.complaint,
      bucket: trends.buckets[i],
      count: s.counts[i],
    })),
  )
  const hasData = trends.series.length > 0
  const tooFewBuckets = trends.buckets.length < 2
  const showTable = view === 'table' || tooFewBuckets

  return (
    <Card aria-labelledby={headingId}>
      <CardHeader
        titleId={headingId}
        icon={<Icon name="barChart" />}
        title="Common complaints"
        description={`The ${trends.series.length || 'top'} most common complaints, visits and incidents combined, grouped by ${granularity}. Charts share one scale.`}
        actions={
          <>
            <SegmentedControl
              label="Group complaints by"
              value={granularity}
              onChange={onGranularityChange}
              options={[
                { value: 'week', label: 'Weekly' },
                { value: 'month', label: 'Monthly' },
              ]}
            />
            <SegmentedControl
              label="Show complaints as"
              value={view}
              onChange={setView}
              options={[
                { value: 'chart', label: 'Chart', icon: 'barChart' },
                { value: 'table', label: 'Table', icon: 'table' },
              ]}
            />
          </>
        }
      />
      <CardBody className="flex flex-col gap-3">
        {!hasData ? (
          <EmptyState
            icon="barChart"
            title="No complaints recorded in this date range"
            description="Choose a different date range to see complaint trends."
          />
        ) : (
          <>
            {clusters.length > 0 && (
              <div
                role="note"
                className="flex gap-2 rounded-md border border-warning bg-background px-3 py-2"
              >
                <Icon name="alertTriangle" className="mt-0.5 shrink-0 text-warning" />
                <div className="text-sm text-text-primary">
                  <p className="font-semibold">Possible symptom cluster</p>
                  <ul className="text-xs text-text-secondary">
                    {clusters.map((c) => (
                      <li key={`${c.complaint}-${c.bucket.key}`}>
                        {c.complaint}: {c.count} cases, {bucketName(c.bucket, trends.granularity)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-xs text-text-secondary">
                    An early-warning signal to review, not a confirmed outbreak.
                  </p>
                </div>
              </div>
            )}
            {tooFewBuckets && (
              <p className="text-xs text-text-secondary">
                This date range fits in a single {granularity}, so there's nothing to compare over
                time. Showing totals as a table. Choose a longer range to see trends.
              </p>
            )}
            {showTable ? (
              <TrendTable trends={trends} />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {trends.series.map((s) => (
                  <MiniChart
                    key={s.complaint}
                    series={s}
                    buckets={trends.buckets}
                    granularity={trends.granularity}
                    yMax={yMax}
                  />
                ))}
              </div>
            )}
            {!showTable && trends.otherComplaints.length > 0 && (
              <p className="text-xs text-text-secondary print:hidden">
                {trends.otherComplaints.length} less common complaint types aren't charted. Switch
                to Table to see them all.
              </p>
            )}
          </>
        )}
      </CardBody>
    </Card>
  )
}

// Fixed bar heights (percent of the plot) so the placeholder reads as a bar chart, not a grey block.
const SKELETON_BARS = [35, 60, 45, 80, 50]

/**
 * Loading placeholder with the trends card's exact shape: the real title + icon, bars for the
 * description and the two toggles, and five small-multiple figures (the same grid as the loaded
 * charts) with baseline-anchored placeholder bars.
 */
export function ComplaintTrendsSkeleton() {
  return (
    <div
      aria-hidden="true"
      data-skeleton="complaint-trends"
      className="rounded-lg border border-border bg-background"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 shrink-0 text-text-secondary">
            <Icon name="barChart" />
          </span>
          <div className="flex flex-col gap-1.5">
            <span className="text-base font-semibold text-text-primary">Common complaints</span>
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
        {SKELETON_BARS.map((_, i) => (
          <div
            key={i}
            data-skeleton="mini-chart"
            className="flex flex-col gap-1 rounded-md border border-border p-3"
          >
            <div className="flex justify-between gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex h-36 items-end justify-around gap-2 border-b border-border px-2">
              {SKELETON_BARS.map((h, j) => (
                <Skeleton
                  key={j}
                  className="w-4 rounded-b-none"
                  // Rotate heights per chart so the five don't look identical.
                  style={{ height: `${SKELETON_BARS[(i + j) % SKELETON_BARS.length] ?? h}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
