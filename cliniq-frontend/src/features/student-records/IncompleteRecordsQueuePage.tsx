import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
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
  type DataTableColumn,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { formatDate } from '../../lib/dates'
import { getMockSessionUser, type SessionUser } from '../../lib/mocks/session'
import {
  fetchIncompleteRecords,
  markIncompleteRecordResolved,
  type IncompleteRecord,
} from './api/incompleteRecordsApi'

type QueueFilter = 'open' | 'resolved' | 'all'

interface ResolvedRecord {
  resolvedBy: string
  resolvedAt: string
}

function QueueSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <Skeleton className="h-7 w-80 max-w-full" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </Card>
      <Card className="p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-10 w-40" />
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

function formatResolvedAt(value: string): string {
  return new Date(value).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function IncompleteRecordsQueuePage({
  viewer = getMockSessionUser(),
}: {
  viewer?: SessionUser
}) {
  const { data, status, isRefetching, reload } = useAsyncData(
    'incomplete-records',
    fetchIncompleteRecords,
  )
  const [filter, setFilter] = useState<QueueFilter>('open')
  const [search, setSearch] = useState('')
  const [resolved, setResolved] = useState<Record<string, ResolvedRecord>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  async function resolveRecord(record: IncompleteRecord) {
    setSavingId(record.id)
    try {
      await markIncompleteRecordResolved(record)
      setResolved((current) => ({
        ...current,
        [record.id]: { resolvedBy: viewer.name, resolvedAt: new Date().toISOString() },
      }))
    } finally {
      setSavingId(null)
    }
  }

  const visibleRows = useMemo(() => {
    if (!data) return []
    const term = search.trim().toLowerCase()
    return data
      .filter((record) => {
        const isResolved = Boolean(resolved[record.id])
        if (filter === 'open') return !isResolved
        if (filter === 'resolved') return isResolved
        return true
      })
      .filter((record) => {
        if (!term) return true
        return (
          record.fullName.toLowerCase().includes(term) ||
          record.studentNumber.toLowerCase().includes(term) ||
          record.gradeLevel.toLowerCase().includes(term)
        )
      })
  }, [data, filter, resolved, search])

  const columns: Array<DataTableColumn<IncompleteRecord>> = [
    {
      key: 'student',
      header: 'Student',
      rowHeader: true,
      cell: (record) => (
        <div>
          <p>{record.fullName}</p>
          <p className="text-xs font-normal text-text-secondary">{record.studentNumber}</p>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade level',
      cell: (record) => record.gradeLevel,
    },
    {
      key: 'missing',
      header: 'Missing fields',
      cell: (record) => (
        <div className="flex flex-wrap gap-1">
          {record.missingFields.map((field) => (
            <Badge key={field} tone="warning" variant="soft">
              {field}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'imported',
      header: 'Imported',
      cell: (record) => (
        <div>
          <p>{formatDate(record.importedAt)}</p>
          <p className="text-xs text-text-secondary">{record.importedBy}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Resolution',
      cell: (record) => {
        const resolution = resolved[record.id]
        if (resolution) {
          return (
            <div>
              <Badge tone="success" variant="soft" icon="checkCircle">
                Resolved
              </Badge>
              <p className="mt-1 text-xs text-text-secondary">
                {resolution.resolvedBy} · {formatResolvedAt(resolution.resolvedAt)}
              </p>
            </div>
          )
        }
        return (
          <Button
            size="sm"
            variant="secondary"
            icon="checkCircle"
            loading={savingId === record.id}
            onClick={() => void resolveRecord(record)}
          >
            Mark Reviewed
          </Button>
        )
      },
    },
  ]

  if (viewer.role !== 'staff') {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8">
        <ErrorState title="Staff access required." />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8">
        <ErrorState title="Unable to load incomplete records." onRetry={reload} />
      </div>
    )
  }

  if (!data) {
    return (
      <>
        <p className="sr-only" role="status">
          Loading incomplete records...
        </p>
        <QueueSkeleton />
      </>
    )
  }

  const openCount = data.filter((record) => !resolved[record.id]).length
  const resolvedCount = Object.keys(resolved).length

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Incomplete Records Review Queue
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Review Registrar-imported student records that still need required-field completion.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="warning" variant="soft">
              {openCount} open
            </Badge>
            <Badge tone="success" variant="soft">
              {resolvedCount} resolved this session
            </Badge>
          </div>
        </div>
      </Card>

      <Card aria-labelledby="incomplete-records-title">
        <CardHeader
          titleId="incomplete-records-title"
          title="Review queue"
          description={`${visibleRows.length.toLocaleString('en-PH')} record${visibleRows.length === 1 ? '' : 's'} shown`}
          icon={<Icon name="inbox" />}
          actions={
            <SegmentedControl
              label="Queue filter"
              value={filter}
              onChange={(value) => setFilter(value as QueueFilter)}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'all', label: 'All' },
              ]}
            />
          }
        />
        <CardBody className="flex flex-col gap-4">
          <Input
            label="Search"
            value={search}
            placeholder="Name, Student Number, or grade"
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-xl"
          />

          <div aria-busy={isRefetching} className={isRefetching ? 'opacity-60' : undefined}>
            {visibleRows.length ? (
              <DataTable
                caption="Incomplete student records"
                columns={columns}
                rows={visibleRows}
                rowKey={(record) => record.id}
              />
            ) : (
              <EmptyState
                icon="inbox"
                title="No records in this view"
                description="Try another queue filter or search term."
              />
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
