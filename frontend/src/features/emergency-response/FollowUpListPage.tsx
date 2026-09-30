import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Icon,
  Select,
  Skeleton,
  DataTable,
  type DataTableColumn,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { getMockSessionUser } from '../../lib/mock-db'
import type { FollowUpStatus } from '../../types/entities'
import { fetchFollowUps, updateFollowUpStatus, type FollowUpRow } from './api/followUpApi'

function FollowUpSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pt-10 pb-8 sm:px-8"
    >
      <Card className="p-5">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </Card>
      <Card className="p-5">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="mt-5 h-56 w-full" />
      </Card>
    </div>
  )
}

function statusBadge(status: FollowUpStatus) {
  const tone =
    status === 'completed'
      ? 'success'
      : status === 'missed'
        ? 'error'
        : status === 'cancelled'
          ? 'neutral'
          : 'warning'
  return (
    // Neutral has no default icon; Cancelled still gets one so every status is icon + label.
    <Badge tone={tone} variant="soft" icon={status === 'cancelled' ? 'xCircle' : undefined}>
      {status[0].toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function FollowUpListPage() {
  const [statusFilter, setStatusFilter] = useState<'' | FollowUpStatus>('')
  const [statusOverrides, setStatusOverrides] = useState<Record<string, FollowUpStatus>>({})
  const { data, status, reload } = useAsyncData(statusFilter, () => fetchFollowUps(statusFilter))
  if (status === 'error')
    return (
      <div className="mx-auto max-w-[1180px] px-4 pt-10 pb-8 sm:px-8">
        <ErrorState title="Unable to load follow-ups." onRetry={reload} />
      </div>
    )
  if (!data)
    return (
      <>
        <p className="sr-only" role="status">
          Loading follow-ups...
        </p>
        <FollowUpSkeleton />
      </>
    )
  const rows = data.map((item) => ({ ...item, status: statusOverrides[item.id] ?? item.status }))
  async function markComplete(item: FollowUpRow) {
    // Optimistic: the row flips immediately; the data layer writes the status and its audit entry.
    setStatusOverrides((current) => ({ ...current, [item.id]: 'completed' }))
    await updateFollowUpStatus(item.id, 'completed', getMockSessionUser())
  }
  const columns: Array<DataTableColumn<FollowUpRow>> = [
    {
      key: 'student',
      header: 'Student Number',
      rowHeader: true,
      cell: (item) => item.studentNumber,
    },
    { key: 'reason', header: 'Reason', cell: (item) => item.reason },
    { key: 'due', header: 'Due date', cell: (item) => item.followUpDate },
    { key: 'status', header: 'Status', cell: (item) => statusBadge(item.status) },
    {
      key: 'actions',
      header: 'Actions',
      cell: (item) =>
        item.status === 'pending' ? (
          <Button size="sm" variant="secondary" onClick={() => markComplete(item)}>
            Mark completed
          </Button>
        ) : (
          '—'
        ),
    },
  ]
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Follow-Ups</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Review upcoming care tasks and close the loop on student follow-up plans.
        </p>
      </Card>
      <Card aria-labelledby="follow-up-list-title">
        <CardHeader
          titleId="follow-up-list-title"
          title="Follow-up tasks"
          description={`${rows.length} task${rows.length === 1 ? '' : 's'} shown`}
          icon={<Icon name="calendarClock" />}
          actions={
            <Select
              className="w-full sm:w-[23rem]"
              label="Status"
              inline
              value={statusFilter}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'missed', label: 'Missed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              placeholder="All statuses"
              onChange={(value) => setStatusFilter(value as '' | FollowUpStatus)}
            />
          }
        />
        <CardBody>
          {rows.length ? (
            <DataTable
              caption=""
              columns={columns}
              rows={rows}
              rowKey={(item) => item.id}
            />
          ) : (
            <EmptyState
              icon="calendarClock"
              title="No follow-ups found"
              description="Try a different status filter."
            />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
