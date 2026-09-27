import { useState } from 'react'
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
import { Link } from 'react-router'
import { useAsyncData } from '../../hooks/useAsyncData'
import { formatDate, todayISO } from '../../lib/dates'
import { paths } from '../../routes/paths'
import type { Disposition } from '../../types/entities'
import {
  defaultVisitLogRange,
  fetchVisitLog,
  type VisitLogRow,
} from './api/visitLogApi'

type DispositionFilter = Disposition | 'all'

const dispositionOptions = [
  { value: 'all', label: 'All' },
  { value: 'returned_to_class', label: 'Returned' },
  { value: 'sent_home', label: 'Sent home' },
  { value: 'referred_to_hospital', label: 'Hospital' },
] satisfies Array<{ value: DispositionFilter; label: string }>

const dispositionMeta: Record<Disposition, { label: string; tone: BadgeTone }> = {
  returned_to_class: { label: 'Returned to class', tone: 'success' },
  sent_home: { label: 'Sent home', tone: 'warning' },
  referred_to_hospital: { label: 'Referred to hospital', tone: 'error' },
}

function formatDateTime(value: string): string {
  const [date, time] = value.split('T')
  const [hour, minute] = time.slice(0, 5).split(':')
  const parsedHour = Number(hour)
  const suffix = parsedHour >= 12 ? 'PM' : 'AM'
  const displayHour = parsedHour % 12 || 12
  return `${formatDate(date)} · ${displayHour}:${minute} ${suffix}`
}

function VisitLogSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <Skeleton className="h-7 w-48 max-w-full" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </Card>
      <Card className="p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-64 max-w-full" />
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      </Card>
    </div>
  )
}

const columns: Array<DataTableColumn<VisitLogRow>> = [
  {
    key: 'date',
    header: 'Date and time',
    rowHeader: true,
    cell: (row) => formatDateTime(row.dateTime),
  },
  {
    key: 'student',
    header: 'Student Number',
    cell: (row) => (
      <div>
        <p>{row.studentNumber}</p>
        <p className="text-xs text-text-secondary">{row.gradeLevel}</p>
      </div>
    ),
  },
  {
    key: 'summary',
    header: 'Record',
    cell: (row) => (
      <div>
        <p>Visit recorded</p>
        {row.eventTag && <p className="text-xs text-text-secondary">{row.eventTag}</p>}
      </div>
    ),
  },
  {
    key: 'disposition',
    header: 'Disposition',
    cell: (row) => (
      <Badge tone={dispositionMeta[row.disposition].tone} variant="soft">
        {dispositionMeta[row.disposition].label}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    cell: (row) => (
      <Link to={paths.visitDetail(row.id)} className={buttonClassName({ size: 'sm' })}>
        <Icon name="fileText" />
        View Detail
      </Link>
    ),
  },
]

export function VisitLogListPage() {
  const defaultRange = defaultVisitLogRange()
  const [from, setFrom] = useState(defaultRange.from)
  const [to, setTo] = useState(defaultRange.to)
  const [search, setSearch] = useState('')
  const [disposition, setDisposition] = useState<DispositionFilter>('all')

  const { data, status, isRefetching, reload } = useAsyncData(
    `${from}|${to}|${search}|${disposition}`,
    () => fetchVisitLog({ from, to, search, disposition }),
  )

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8">
        <ErrorState title="Unable to load visit log." onRetry={reload} />
      </div>
    )
  }

  if (!data) {
    return (
      <>
        <p className="sr-only" role="status">
          Loading visit log...
        </p>
        <VisitLogSkeleton />
      </>
    )
  }

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Visit Log List
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Review daily clinic visits by Student Number. Complaint and treatment details open
              from the individual record.
            </p>
          </div>
          <Badge tone="info" variant="soft">
            {formatDate(from)} to {formatDate(to)}
          </Badge>
        </div>
      </Card>

      <Card aria-labelledby="visit-log-title">
        <CardHeader
          titleId="visit-log-title"
          title="Visits"
          description={`${data.length.toLocaleString('en-PH')} record${data.length === 1 ? '' : 's'} shown`}
          icon={<Icon name="clipboardList" />}
          actions={
            <SegmentedControl
              label="Disposition filter"
              value={disposition}
              onChange={setDisposition}
              options={dispositionOptions}
            />
          }
        />
        <CardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem]">
            <Input
              label="Search"
              value={search}
              placeholder="Student Number, grade, or event"
              onChange={(event) => setSearch(event.target.value)}
            />
            <Input
              label="From"
              type="date"
              max={to || todayISO()}
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
            <Input
              label="To"
              type="date"
              min={from}
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>

          <div aria-busy={isRefetching} className={isRefetching ? 'opacity-60' : undefined}>
            {data.length ? (
              <DataTable
                caption="Clinic visit log"
                columns={columns}
                rows={data}
                rowKey={(row) => row.id}
              />
            ) : (
              <EmptyState
                icon="clipboardList"
                title="No visits found"
                description="Try another date range, Student Number, or disposition filter."
              />
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
