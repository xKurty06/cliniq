import { useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, DataTable, ErrorState, Icon, Skeleton, type DataTableColumn } from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { formatDateTime, todayISO } from '../../lib/dates'
import type { SessionUser } from '../../lib/mock-db'
import { fetchMonthlyReport, type MonthlyReportData } from './api/reportsApi'
import { HealthSummary } from './components/HealthSummary'

type ReportView = 'monthly' | 'incidents' | 'health'
type ArchiveRow = MonthlyReportData['incidents'][number]

function monthLabel(value: string) { return new Date(`${value}-01T00:00:00`).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) }

const incidentColumns: Array<DataTableColumn<ArchiveRow>> = [
  { key: 'student', header: 'Student Number', rowHeader: true, cell: (incident) => incident.studentNumber },
  { key: 'date', header: 'Date', cell: (incident) => formatDateTime(incident.time) },
  { key: 'complaint', header: 'Complaint', cell: (incident) => incident.complaint },
  { key: 'status', header: 'Status', cell: (incident) => <Badge tone={incident.stage === 1 ? 'warning' : 'success'} variant="soft">{incident.stage === 1 ? 'Needs completion' : 'Complete'}</Badge> },
]

function ReportBodySkeleton() {
  return <div aria-hidden="true" className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div>
}

export function ReportsPage({ viewer }: { viewer: SessionUser }) {
  const [view, setView] = useState<ReportView>('monthly')
  const [month, setMonth] = useState(todayISO().slice(0, 7))
  const { data, status, isRefetching, reload } = useAsyncData(`report|${month}`, () => fetchMonthlyReport(month))
  const title = view === 'monthly' ? 'Monthly Report' : view === 'incidents' ? 'Incident Report Archive' : 'Health Summaries'
  let body
  if (status === 'error') body = <ErrorState title="Unable to generate this report." onRetry={reload} />
  else if (!data) body = <><p className="sr-only" role="status">Generating report...</p><ReportBodySkeleton /></>
  else body = <div aria-busy={isRefetching} className={isRefetching ? 'opacity-60' : undefined}>{view === 'monthly' && <div className="grid gap-4 sm:grid-cols-3"><Summary label="Clinic visits" value={data.counts.visits} /><Summary label="Incidents" value={data.counts.incidents} /><Summary label="Follow-ups" value={data.counts.followUps} /></div>}{view === 'incidents' && <DataTable caption="Incident report archive" columns={incidentColumns} rows={data.incidents} rowKey={(incident) => incident.id} />}{view === 'health' && <HealthSummary rows={data.complaintCounts} />}</div>
  return <div className="mx-auto flex max-w-page-wide flex-col gap-4 px-4 pt-10 pb-8 sm:px-8"><Card className="p-5 print:hidden"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-text-primary">Reports</h1><p className="mt-1 text-sm text-text-secondary">Generate, review, and print clinic reports for {viewer.role === 'admin' ? 'administrative review' : 'clinic operations'}.</p></div><Button variant="secondary" icon="printer" onClick={() => window.print()}>Print / Save as PDF</Button></div><div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Report type"><Button variant={view === 'monthly' ? 'primary' : 'secondary'} role="tab" aria-selected={view === 'monthly'} onClick={() => setView('monthly')}>Monthly Report</Button><Button variant={view === 'incidents' ? 'primary' : 'secondary'} role="tab" aria-selected={view === 'incidents'} onClick={() => setView('incidents')}>Incident Archive</Button><Button variant={view === 'health' ? 'primary' : 'secondary'} role="tab" aria-selected={view === 'health'} onClick={() => setView('health')}>Health Summaries</Button></div></Card><Card aria-labelledby="report-title"><CardHeader titleId="report-title" title={title} description={`Reporting period: ${monthLabel(month)}`} icon={<Icon name="fileText" />} /><CardBody><div className="mb-5 max-w-xs print:hidden"><label className="flex flex-col gap-1 text-xs font-semibold text-text-primary" htmlFor="report-month">Report month<input id="report-month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="h-10 cursor-pointer rounded-md border border-border bg-background px-3 text-sm font-normal text-text-primary transition-colors hover:border-brand-green hover:bg-surface" /></label></div>{body}</CardBody></Card></div>
}

function Summary({ label, value }: { label: string; value: number }) { return <div className="rounded-md border border-border bg-surface p-4"><p className="text-xs font-semibold text-text-secondary">{label}</p><p className="mt-2 text-3xl font-bold tabular-nums text-text-primary">{value}</p></div> }
