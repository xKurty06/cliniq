import { useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, ErrorState, Icon, Select, Skeleton } from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { getMockSessionUser, type SessionUser } from '../../lib/mock-db'
import { approveReport, fetchIncidentRecord } from './api/incidentRecordApi'

function ReportSkeleton() {
  return <div aria-hidden="true" className="mx-auto flex max-w-[900px] flex-col gap-4 px-4 py-6 sm:px-8"><Card className="p-5"><Skeleton className="h-7 w-52" /><Skeleton className="mt-2 h-4 w-80 max-w-full" /></Card><Card className="p-5"><Skeleton className="h-10 w-72 max-w-full" /><div className="mt-5 grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-10" />)}</div><div className="mt-5 grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-16" />)}</div></Card></div>
}

export function IncidentReportPage({ viewer = getMockSessionUser(), incidentId }: { viewer?: SessionUser; incidentId?: string }) {
  const [selectedId, setSelectedId] = useState(incidentId)
  const { data, status, reload } = useAsyncData(`incident-report|${selectedId ?? 'default'}`, () => fetchIncidentRecord(selectedId))
  const [approvedId, setApprovedId] = useState<string | null>(null)
  if (status === 'error') return <main className="mx-auto max-w-[900px] px-4 py-6 sm:px-8"><ErrorState title="Unable to load the incident report." onRetry={reload} /></main>
  if (data === undefined) return <><p className="sr-only" role="status">Loading incident report...</p><ReportSkeleton /></>
  if (data === null) return <main className="mx-auto max-w-[900px] px-4 py-6 sm:px-8"><Card><CardBody>No incident report is available.</CardBody></Card></main>
  const { incident, student, options } = data
  const approved = approvedId === incident.id
  async function approve() { await approveReport(incident.id, viewer); setApprovedId(incident.id) }
  return <main className="mx-auto flex max-w-[900px] flex-col gap-4 px-4 py-6 sm:px-8"><Card className="p-5 print:hidden"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-text-primary">Incident Report</h1><p className="mt-1 text-sm text-text-secondary">Review, approve, and print one incident report.</p></div><div className="flex gap-2"><Button variant="secondary" icon="printer" onClick={() => window.print()}>Print / Save as PDF</Button><Button variant="primary" onClick={approve} disabled={approved}>{approved ? 'Approved' : 'Approve report'}</Button></div></div></Card>
    <Card><CardHeader title="Incident summary" icon={<Icon name="fileText" />} actions={<Badge tone={incident.stage === 1 ? 'warning' : 'success'} variant="soft">{incident.stage === 1 ? 'Needs completion' : 'Complete'}</Badge>} /><CardBody className="flex flex-col gap-5"><div className="max-w-sm print:hidden"><Select label="Incident" value={incident.id} options={options} onChange={setSelectedId} /></div><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold text-text-secondary">Student</dt><dd className="text-sm font-semibold text-text-primary">{student.fullName} · {student.studentNumber}</dd></div><div><dt className="text-xs font-semibold text-text-secondary">Recorded</dt><dd className="text-sm text-text-primary">{incident.time.slice(0, 16).replace('T', ' ')}</dd></div><div><dt className="text-xs font-semibold text-text-secondary">Complaint</dt><dd className="text-sm text-text-primary">{incident.complaint}</dd></div><div><dt className="text-xs font-semibold text-text-secondary">Parent notifications</dt><dd className="text-sm text-text-primary">{incident.parentNotifications.length} attempt(s)</dd></div></dl><section className="border-t border-border pt-4"><h2 className="text-sm font-semibold text-text-primary">Vitals and response</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{Object.entries(incident.vitals).map(([key, value]) => <div key={key} className="rounded-md border border-border bg-surface p-3"><p className="text-xs text-text-secondary">{key}</p><p className="mt-1 text-sm font-semibold text-text-primary">{String(value)}</p></div>)}</div></section>{approved && <p role="status" className="rounded-md border border-success bg-success/10 px-3 py-2 text-sm font-semibold text-text-primary">Report approved and logged.</p>}</CardBody></Card></main>
}
