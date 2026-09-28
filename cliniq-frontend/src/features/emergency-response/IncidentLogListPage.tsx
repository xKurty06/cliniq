import { useState } from 'react'
import { Link } from 'react-router'
import {
  Badge,
  buttonClassName,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  SegmentedControl,
  Skeleton,
  type BadgeTone,
  type DataTableColumn,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { formatDate, todayISO } from '../../lib/dates'
import { paths } from '../../routes/paths'
import {
  defaultIncidentLogRange,
  fetchIncidentLog,
  type IncidentCompletion,
  type IncidentLogRow,
} from './api/incidentLogApi'

type CompletionFilter = IncidentCompletion | 'all'

const completionOptions = [
  { value: 'all', label: 'All' },
  { value: 'needs_completion', label: 'Needs completion' },
  { value: 'complete', label: 'Complete' },
] satisfies Array<{ value: CompletionFilter; label: string }>

const completionMeta: Record<IncidentCompletion, { label: string; tone: BadgeTone }> = {
  needs_completion: { label: 'Needs completion', tone: 'warning' },
  complete: { label: 'Complete', tone: 'success' },
}

function formatDateTime(value: string): string {
  const [date, time] = value.split('T')
  const [hour, minute] = time.slice(0, 5).split(':')
  const parsedHour = Number(hour)
  const suffix = parsedHour >= 12 ? 'PM' : 'AM'
  return `${formatDate(date)} · ${parsedHour % 12 || 12}:${minute} ${suffix}`
}

function IncidentLogSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5"><Skeleton className="h-7 w-48 max-w-full" /><Skeleton className="mt-2 h-4 w-96 max-w-full" /></Card>
      <Card className="p-5"><div className="grid grid-cols-1 gap-3 md:grid-cols-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-64 max-w-full" /></div><Skeleton className="mt-5 h-64 w-full" /></Card>
    </div>
  )
}

const columns: Array<DataTableColumn<IncidentLogRow>> = [
  { key: 'time', header: 'Date and time', rowHeader: true, cell: (row) => formatDateTime(row.time) },
  { key: 'student', header: 'Student Number', cell: (row) => <div><p>{row.studentNumber}</p><p className="text-xs text-text-secondary">{row.gradeLevel}</p></div> },
  { key: 'complaint', header: 'Reason / description', cell: (row) => <div><p>{row.complaint}</p>{row.eventTag && <p className="text-xs text-text-secondary">{row.eventTag}</p>}</div> },
  { key: 'status', header: 'Status', cell: (row) => <Badge tone={completionMeta[row.completion].tone} variant="soft">{completionMeta[row.completion].label}</Badge> },
  { key: 'actions', header: 'Actions', cell: (row) => <Link to={paths.incidentReport(row.id)} className={buttonClassName({ size: 'sm' })}><Icon name="fileText" />View report</Link> },
]

export function IncidentLogListPage() {
  const defaultRange = defaultIncidentLogRange()
  const [from, setFrom] = useState(defaultRange.from)
  const [to, setTo] = useState(defaultRange.to)
  const [search, setSearch] = useState('')
  const [completion, setCompletion] = useState<CompletionFilter>('all')
  const { data, status, isRefetching, reload } = useAsyncData(
    `${from}|${to}|${search}|${completion}`,
    () => fetchIncidentLog({ from, to, search, completion }),
  )

  if (status === 'error') return <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8"><ErrorState title="Unable to load incident log." onRetry={reload} /></div>
  if (!data) return <><p className="sr-only" role="status">Loading incident log...</p><IncidentLogSkeleton /></>

  return <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8">
    <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-text-primary">Incident Log List</h1><p className="mt-1 text-sm text-text-secondary">Review incidents by Student Number and complete records that still need follow-up detail.</p></div><Badge tone="info" variant="soft">{formatDate(from)} to {formatDate(to)}</Badge></div></Card>
    <Card aria-labelledby="incident-log-title"><CardHeader titleId="incident-log-title" title="Incidents" description={`${data.length.toLocaleString('en-PH')} record${data.length === 1 ? '' : 's'} shown`} icon={<Icon name="alertTriangle" />} actions={<SegmentedControl label="Completion filter" value={completion} onChange={(value) => setCompletion(value as CompletionFilter)} options={completionOptions} />} /><CardBody className="flex flex-col gap-4"><div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem]"><Input label="Search" value={search} placeholder="Student Number, grade, reason, or event" onChange={(event) => setSearch(event.target.value)} /><Input label="From" type="date" max={to || todayISO()} value={from} onChange={(event) => setFrom(event.target.value)} /><Input label="To" type="date" min={from} value={to} onChange={(event) => setTo(event.target.value)} /></div><div aria-busy={isRefetching} className={isRefetching ? 'opacity-60' : undefined}>{data.length ? <DataTable caption="Clinic incident log" columns={columns} rows={data} rowKey={(row) => row.id} /> : <EmptyState icon="alertTriangle" title="No incidents found" description="Try another date range, Student Number, reason, or completion status." />}</div></CardBody></Card>
  </div>
}
