import { useState } from 'react'
import { Badge, Card, CardBody, CardHeader, EmptyState, ErrorState, Icon, Select, Skeleton, DataTable, type DataTableColumn } from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { getMockDataset } from '../../lib/mocks/dataset'
import { todayISO } from '../../lib/dates'
import type { FollowUp, FollowUpStatus } from '../../types/entities'

function fetchFollowUps(status: '' | FollowUpStatus): FollowUp[] {
  return getMockDataset(todayISO()).followUps.filter((item) => !status || item.status === status)
}

function FollowUpSkeleton() {
  return <div aria-hidden="true" className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8"><Card className="p-5"><Skeleton className="h-7 w-52" /><Skeleton className="mt-2 h-4 w-96 max-w-full" /></Card><Card className="p-5"><Skeleton className="h-10 w-44" /><Skeleton className="mt-5 h-56 w-full" /></Card></div>
}

function statusBadge(status: FollowUpStatus) {
  const tone = status === 'completed' ? 'success' : status === 'missed' ? 'error' : status === 'cancelled' ? 'neutral' : 'warning'
  return <Badge tone={tone} variant="soft">{status[0].toUpperCase() + status.slice(1)}</Badge>
}

const columns: Array<DataTableColumn<FollowUp>> = [
  { key: 'student', header: 'Student Number', rowHeader: true, cell: (item) => item.studentId.replace('stu-', '2026-') },
  { key: 'reason', header: 'Reason', cell: (item) => item.reason },
  { key: 'due', header: 'Due date', cell: (item) => item.followUpDate },
  { key: 'status', header: 'Status', cell: (item) => statusBadge(item.status) },
]

export function FollowUpListPage() {
  const [statusFilter, setStatusFilter] = useState<'' | FollowUpStatus>('')
  const { data, status } = useAsyncData(statusFilter, () => Promise.resolve(fetchFollowUps(statusFilter)))
  if (status === 'error') return <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8"><ErrorState title="Unable to load follow-ups." /></div>
  if (!data) return <><p className="sr-only" role="status">Loading follow-ups...</p><FollowUpSkeleton /></>
  return <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8"><Card className="p-5"><h1 className="text-2xl font-bold tracking-tight text-text-primary">Follow-Ups</h1><p className="mt-1 text-sm text-text-secondary">Review upcoming care tasks and close the loop on student follow-up plans.</p></Card><Card aria-labelledby="follow-up-list-title"><CardHeader titleId="follow-up-list-title" title="Follow-up tasks" description={`${data.length} task${data.length === 1 ? '' : 's'} shown`} icon={<Icon name="calendarClock" />} /><CardBody className="flex flex-col gap-4"><div className="max-w-xs"><Select label="Status" value={statusFilter} options={[{ value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }, { value: 'missed', label: 'Missed' }, { value: 'cancelled', label: 'Cancelled' }]} placeholder="All statuses" onChange={(value) => setStatusFilter(value as '' | FollowUpStatus)} /></div>{data.length ? <DataTable caption="Follow-up tasks" columns={columns} rows={data} rowKey={(item) => item.id} /> : <EmptyState icon="calendarClock" title="No follow-ups found" description="Try a different status filter." />}</CardBody></Card></div>
}
