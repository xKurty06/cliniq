import { useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Icon, Input, Select } from '../../components'
import { getMockDataset } from '../../lib/mocks/dataset'
import { getMockSessionUser, type SessionUser } from '../../lib/mock-db'
import { todayISO } from '../../lib/dates'
import { recordMockAudit } from '../../lib/mocks/audit'
import type { ParentNotificationOutcome } from '../../types/entities'

const outcomes: Array<{ value: ParentNotificationOutcome; label: string }> = [
  { value: 'reached', label: 'Reached' }, { value: 'not_reached', label: 'Not reached' },
  { value: 'voicemail', label: 'Voicemail' }, { value: 'left_message', label: 'Left message' },
]

export function ParentNotificationPage({ viewer = getMockSessionUser(), incidentId }: { viewer?: SessionUser; incidentId?: string }) {
  const incidents = getMockDataset(todayISO()).incidents
  const [selectedId] = useState(incidentId ?? incidents[0]?.id ?? '')
  const incident = incidents.find((item) => item.id === selectedId)
  const students = getMockDataset(todayISO()).students
  const student = incident ? students.find((item) => item.id === incident.studentId) : undefined
  const [outcome, setOutcome] = useState<ParentNotificationOutcome>('reached')
  const [note, setNote] = useState('')
  const [attempts, setAttempts] = useState<Array<{ outcome: ParentNotificationOutcome; note: string; timestamp: string }>>([])
  const [saved, setSaved] = useState(false)

  function addAttempt() {
    const timestamp = new Date().toISOString()
    setAttempts((current) => [...current, { outcome, note: note.trim() || 'No additional note', timestamp }])
    recordMockAudit({ userId: viewer.id, actionType: 'create', targetRecord: { type: 'parent-notification', id: `${selectedId}-${Date.now()}` }, timestamp })
    setNote(''); setSaved(true)
  }

  if (!incident || !student) return <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-8"><EmptyState icon="activity" title="No incident selected" description="Open this screen from an incident record to log a parent notification." /></div>
  return <main className="mx-auto flex max-w-[900px] flex-col gap-4 px-4 py-6 sm:px-8">
    <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-text-primary">Parent Notification Log</h1><p className="mt-1 text-sm text-text-secondary">{student.fullName} · {student.studentNumber} · {incident.complaint}</p></div><Badge tone={incident.stage === 1 ? 'warning' : 'success'} variant="soft">{incident.stage === 1 ? 'Needs completion' : 'Complete'}</Badge></div></Card>
    <Card aria-labelledby="notification-title"><CardHeader titleId="notification-title" title="Record a notification attempt" icon={<Icon name="activity" />} description="Keep every attempt tied to this incident with its real timestamp." /><CardBody className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-end"><Select label="Outcome" value={outcome} options={outcomes} onChange={(value) => setOutcome(value as ParentNotificationOutcome)} /><Input label="Attempt note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional context" /><Button variant="primary" onClick={addAttempt}>Add attempt</Button></div>
      {saved && <p role="status" className="rounded-md border border-success bg-success/10 px-3 py-2 text-sm font-semibold text-text-primary">Notification attempt saved with an audit entry.</p>}
      {attempts.length ? <ol className="divide-y divide-border rounded-md border border-border">{attempts.map((attempt, index) => <li key={`${attempt.timestamp}-${index}`} className="flex flex-wrap items-center justify-between gap-2 p-3"><span className="font-semibold text-text-primary">{outcomes.find((item) => item.value === attempt.outcome)?.label}</span><span className="text-sm text-text-secondary">{attempt.note} · {attempt.timestamp.slice(0, 16).replace('T', ' ')}</span></li>)}</ol> : <p className="text-sm text-text-secondary">No new attempts have been added in this session.</p>}
    </CardBody></Card>
  </main>
}
