import { useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, DataTable, Icon, type DataTableColumn } from '../../components'
import { getMockDataset } from '../../lib/mocks/dataset'
import { todayISO } from '../../lib/dates'
import type { Incident } from '../../types/entities'
import type { SessionUser } from '../../lib/mock-db'
import { HealthSummary } from './components/HealthSummary'

type ReportView = 'monthly' | 'incidents' | 'health'

function monthLabel(value: string) { return new Date(`${value}-01T00:00:00`).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }) }

function incidentColumns(studentNumberById: ReadonlyMap<string, string>): Array<DataTableColumn<Incident>> {
  return [
  { key: 'student', header: 'Student Number', rowHeader: true, cell: (incident) => studentNumberById.get(incident.studentId) ?? 'Unknown student' },
  { key: 'date', header: 'Date', cell: (incident) => incident.time.slice(0, 10) },
  { key: 'complaint', header: 'Complaint', cell: (incident) => incident.complaint },
  { key: 'status', header: 'Status', cell: (incident) => <Badge tone={incident.stage === 1 ? 'warning' : 'success'} variant="soft">{incident.stage === 1 ? 'Needs completion' : 'Complete'}</Badge> },
  ]
}

export function ReportsPage({ viewer }: { viewer: SessionUser }) {
  const [view, setView] = useState<ReportView>('monthly')
  const [month, setMonth] = useState(todayISO().slice(0, 7))
  const data = getMockDataset(todayISO())
  const studentNumberById = new Map(data.students.map((student) => [student.id, student.studentNumber]))
  const visits = data.visits.filter((visit) => visit.dateTime.startsWith(month))
  const incidents = data.incidents.filter((incident) => incident.time.startsWith(month))
  const title = view === 'monthly' ? 'Monthly Report' : view === 'incidents' ? 'Incident Report Archive' : 'Health Summaries'
  return <main className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8"><Card className="p-5 print:hidden"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-text-primary">Reports</h1><p className="mt-1 text-sm text-text-secondary">Generate, review, and print clinic reports for {viewer.role === 'admin' ? 'administrative review' : 'clinic operations'}.</p></div><Button variant="secondary" icon="printer" onClick={() => window.print()}>Print / Save as PDF</Button></div><div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Report type"><Button variant={view === 'monthly' ? 'primary' : 'secondary'} role="tab" aria-selected={view === 'monthly'} onClick={() => setView('monthly')}>Monthly report</Button><Button variant={view === 'incidents' ? 'primary' : 'secondary'} role="tab" aria-selected={view === 'incidents'} onClick={() => setView('incidents')}>Incident archive</Button><Button variant={view === 'health' ? 'primary' : 'secondary'} role="tab" aria-selected={view === 'health'} onClick={() => setView('health')}>Health summaries</Button></div></Card><Card aria-labelledby="report-title"><CardHeader titleId="report-title" title={title} description={`Reporting period: ${monthLabel(month)}`} icon={<Icon name="fileText" />} /><CardBody><div className="mb-5 max-w-xs print:hidden"><label className="flex flex-col gap-1 text-xs font-semibold text-text-primary" htmlFor="report-month">Report month<input id="report-month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="h-10 cursor-pointer rounded-md border border-border bg-background px-3 text-sm font-normal text-text-primary transition-colors hover:border-brand-green hover:bg-surface" /></label></div>{view === 'monthly' && <div className="grid gap-4 sm:grid-cols-3"><Summary label="Clinic visits" value={visits.length} /><Summary label="Incidents" value={incidents.length} /><Summary label="Follow-ups" value={data.followUps.filter((item) => item.followUpDate.startsWith(month)).length} /></div>}{view === 'incidents' && <DataTable caption="Incident report archive" columns={incidentColumns(studentNumberById)} rows={incidents} rowKey={(incident) => incident.id} />}{view === 'health' && <HealthSummary visits={visits} />}</CardBody></Card></main>
}

function Summary({ label, value }: { label: string; value: number }) { return <div className="rounded-md border border-border bg-surface p-4"><p className="text-xs font-semibold text-text-secondary">{label}</p><p className="mt-2 text-3xl font-bold tabular-nums text-text-primary">{value}</p></div> }
