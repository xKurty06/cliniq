import { useState } from 'react'
import { Link } from 'react-router'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  DateRangePicker,
  EmptyState,
  ErrorState,
  Icon,
  MultiSelect,
  Pagination,
  Select,
  Skeleton,
  StatusBadge,
  type DataTableColumn,
  type StatusMap,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { describeRange, rangeForPreset, type DateRange } from '../../lib/dateRange'
import { formatDateTime, todayISO } from '../../lib/dates'
import { auditTargetTypes, type AuditLogRow, type AuditTargetType, type SessionUser } from '../../lib/mock-db'
import type { AuditActionType } from '../../types/entities'
import { paths } from '../../routes/paths'
import { fetchAuditLog } from './api/auditLogApi'

const PAGE_SIZE = 10

const actionOptions: Array<{ value: AuditActionType; label: string }> = [
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'scan', label: 'Scan' },
  { value: 'submit', label: 'Submit' },
  { value: 'approve', label: 'Approve' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'archive', label: 'Archive' },
]

const actionStatusMap: StatusMap<AuditActionType> = {
  login: { label: 'Login', tone: 'success' },
  logout: { label: 'Logout', tone: 'neutral' },
  scan: { label: 'Scan', tone: 'info' },
  submit: { label: 'Submit', tone: 'info' },
  approve: { label: 'Approve', tone: 'success' },
  create: { label: 'Create', tone: 'success' },
  update: { label: 'Update', tone: 'info' },
  delete: { label: 'Delete', tone: 'error' },
  archive: { label: 'Archive', tone: 'warning' },
}

const targetLabels: Record<AuditTargetType, string> = {
  student: 'Student',
  visit: 'Visit',
  incident: 'Incident',
  inventory: 'Inventory',
  user: 'User account',
  report: 'Report',
  backup: 'Backup',
  'follow-up': 'Follow-up',
}

interface AuditLogFilters {
  range: DateRange
  userId: string
  actionTypes: AuditActionType[]
  targetTypes: AuditTargetType[]
}

function AuditLogSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5"><Skeleton className="h-7 w-48 max-w-full" /><Skeleton className="mt-2 h-4 w-96 max-w-full" /></Card>
      <Card className="p-5"><div className="grid grid-cols-1 gap-3 md:grid-cols-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div><div className="mt-5 flex flex-col gap-2">{Array.from({ length: 10 }, (_, index) => <Skeleton key={index} className="h-9 w-full" />)}</div></Card>
    </div>
  )
}

function targetPath(row: AuditLogRow, viewer: SessionUser): string | undefined {
  const target = row.target
  if (!target) return undefined
  if (viewer.role === 'admin') return target.type === 'report' ? paths.reports : undefined
  switch (target.type) {
    case 'student':
      return target.studentNumber ? paths.studentProfile(target.studentNumber) : undefined
    case 'visit':
      return paths.visitDetail(target.id)
    case 'incident':
      return paths.incidentReport(target.id)
    case 'follow-up':
      return paths.followUps
    case 'report':
      return paths.reports
    case 'backup':
      return paths.backup
    default:
      return undefined
  }
}

function targetCell(row: AuditLogRow, viewer: SessionUser) {
  if (!row.target) return <span className="text-text-secondary">No record</span>
  const path = targetPath(row, viewer)
  const content = <><span className="text-xs text-text-secondary">{targetLabels[row.target.type]}</span><span>{row.target.label}</span></>
  return path ? <Link to={path} className="flex cursor-pointer flex-col rounded-sm underline decoration-brand-green/50 underline-offset-2 transition-colors duration-150 hover:text-brand-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green motion-reduce:transition-none">{content}</Link> : <div className="flex flex-col">{content}</div>
}

export function AuditLogPage({ viewer }: { viewer: SessionUser }) {
  const defaultRange = rangeForPreset('all', todayISO())
  const [filters, setFilters] = useState<AuditLogFilters>({ range: defaultRange, userId: '', actionTypes: [], targetTypes: [] })
  const [page, setPage] = useState(1)
  const { range, userId, actionTypes, targetTypes } = filters
  const queryKey = `${range.from}|${range.to}|${userId}|${actionTypes.join(',')}|${targetTypes.join(',')}`
  const { data, status, isRefetching, reload } = useAsyncData(queryKey, () => fetchAuditLog({ from: range.from, to: range.to, userId, actionTypes, targetTypes }))
  const updateFilters = (changes: Partial<AuditLogFilters>) => {
    setFilters((current) => ({ ...current, ...changes }))
    setPage(1)
  }

  if (status === 'error') return <main className="mx-auto max-w-[1180px] px-4 pt-10 pb-8 sm:px-8"><ErrorState title="Unable to load the audit log." onRetry={reload} /></main>
  if (!data) return <><p className="sr-only" role="status">Loading audit log...</p><AuditLogSkeleton /></>

  const pageCount = Math.max(1, Math.ceil(data.rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageRows = data.rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const columns: Array<DataTableColumn<AuditLogRow>> = [
    { key: 'timestamp', header: 'Timestamp', rowHeader: true, cell: (row) => formatDateTime(row.dateTime) },
    { key: 'user', header: 'Who', cell: (row) => row.userName },
    { key: 'action', header: 'Action', cell: (row) => <StatusBadge status={row.actionType} map={actionStatusMap} /> },
    { key: 'target', header: 'Target record', cell: (row) => targetCell(row, viewer) },
  ]
  const clearFilters = () => {
    updateFilters({ range: defaultRange, userId: '', actionTypes: [], targetTypes: [] })
  }

  return (
    <main className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pt-10 pb-8 sm:px-8">
      <Card className="p-5 print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Audit Log</h1>
            <p className="mt-1 text-sm text-text-secondary">Review accountable system activity. Audit entries are permanent and cannot be edited or deleted.</p>
          </div>
          <Button variant="secondary" icon="printer" onClick={() => window.print()}>Print / Save as PDF</Button>
        </div>
      </Card>

      <Card aria-labelledby="audit-log-title">
        <CardHeader titleId="audit-log-title" title="Audit entries" description={`${data.rows.length.toLocaleString('en-PH')} entr${data.rows.length === 1 ? 'y' : 'ies'} shown · ${describeRange(range)}`} icon={<Icon name="clipboardList" />} />
        <CardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-4 print:hidden">
            <DateRangePicker value={range} onChange={(value) => updateFilters({ range: value })} today={defaultRange.to} presets={['today', 'last7', 'thisMonth', 'all', 'custom']} presetLabels={{ last7: 'This week' }} customPopover />
            <Select label="User" value={userId} options={data.users.map((user) => ({ value: user.id, label: user.name }))} placeholder="All users" onChange={(value) => updateFilters({ userId: value })} />
            <MultiSelect label="Action type" values={actionTypes} options={actionOptions} allLabel="All actions" onChange={(values) => updateFilters({ actionTypes: values as AuditActionType[] })} />
            <MultiSelect label="Target / module" values={targetTypes} options={auditTargetTypes.map((type) => ({ value: type, label: targetLabels[type] }))} allLabel="All targets" onChange={(values) => updateFilters({ targetTypes: values as AuditTargetType[] })} />
          </div>
          <div className="flex justify-end print:hidden"><Button variant="neutral" size="sm" onClick={clearFilters}>Clear filters</Button></div>
          <div aria-busy={isRefetching} className={isRefetching ? 'opacity-60' : undefined}>
            {data.rows.length ? <><DataTable caption="Filtered audit log" columns={columns} rows={pageRows} rowKey={(row) => row.id} className="print:hidden" /><div aria-hidden="true" className="hidden print:block"><DataTable caption="Filtered audit log" columns={columns} rows={data.rows} rowKey={(row) => row.id} /></div><Pagination page={currentPage} pageCount={pageCount} total={data.rows.length} pageSize={PAGE_SIZE} itemLabel="entries" onPageChange={setPage} /></> : <EmptyState icon="clipboardList" title="No audit entries found" description="Try another date range, user, action type, or target/module filter." />}
          </div>
        </CardBody>
      </Card>
    </main>
  )
}
