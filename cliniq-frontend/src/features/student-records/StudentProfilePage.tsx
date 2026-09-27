import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Icon,
  ListRow,
  RowList,
  Skeleton,
  StatusBadge,
  type StatusMap,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import { cn } from '../../lib/cn'
import { formatDate } from '../../lib/dates'
import { getMockSessionUser, type SessionUser } from '../../lib/mocks/session'
import type { Disposition, Incident, Student, Visit } from '../../types/entities'
import { fetchStudentProfile } from './api/studentProfileApi'

const incidentStageMap = {
  1: { label: 'Needs completion', tone: 'warning', icon: 'alertTriangle', variant: 'soft' },
  2: { label: 'Complete', tone: 'success', icon: 'checkCircle', variant: 'soft' },
} satisfies StatusMap<'1' | '2'>

const dispositionLabel: Record<Disposition, string> = {
  returned_to_class: 'Returned to class',
  sent_home: 'Sent home',
  referred_to_hospital: 'Referred to hospital',
}

function formatDateTime(value: string): string {
  return `${formatDate(value.slice(0, 10))} · ${value.slice(11, 16)}`
}

function tagList(items: string[], empty: string) {
  if (!items.length) return <p className="text-sm text-text-secondary">{empty}</p>
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item}>
          <Badge tone="neutral" variant="soft" icon={null}>
            {item}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

function StudentProfileSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[1120px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-52 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="p-5">
            <Skeleton className="h-5 w-40" />
            <div className="mt-4 flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ProfileHeader({ student, viewer }: { student: Student; viewer: SessionUser }) {
  const staffCanAct = viewer.role === 'staff'
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {student.fullName}
            </h1>
            {student.archived && (
              <Badge tone="neutral" variant="outline" icon="archive">
                Archived
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {student.studentNumber} · {student.gradeLevel}
          </p>
          {viewer.role === 'instructor' && (
            <p className="mt-2 text-xs font-semibold text-text-secondary">
              Read-only profile view. No record actions are available for this role.
            </p>
          )}
        </div>
        {staffCanAct && (
          <div className="flex flex-wrap justify-end gap-2 print:hidden">
            <Button variant="secondary">Edit</Button>
            <Button variant="secondary" icon="printer" onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="neutral">Archive</Button>
          </div>
        )}
      </div>
    </Card>
  )
}

function OverviewCard({ student }: { student: Student }) {
  const contact = student.emergencyContact
  return (
    <Card aria-labelledby="profile-overview">
      <CardHeader titleId="profile-overview" title="Overview" icon={<Icon name="users" />} />
      <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-text-secondary">Grade level</p>
          <p className="text-sm font-semibold text-text-primary">{student.gradeLevel}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-text-secondary">Student Number</p>
          <p className="text-sm font-semibold text-text-primary">{student.studentNumber}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-text-secondary">Contact info</p>
          <p className="text-sm font-semibold text-text-primary">{student.contactInfo || 'Not recorded'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-text-secondary">Record status</p>
          <Badge tone={student.recordComplete ? 'success' : 'warning'} variant="soft">
            {student.recordComplete ? 'Complete' : 'Incomplete'}
          </Badge>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold text-text-secondary">Emergency contact</p>
          {contact ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-primary">
              <span className="font-semibold">{contact.name}</span>
              <span>{contact.relationship}</span>
              <span>{contact.phone}</span>
              <Badge tone={contact.verified ? 'success' : 'warning'} variant="soft">
                {contact.verified ? 'Verified' : 'Needs verification'}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No emergency contact recorded.</p>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

function MedicalHistoryCard({ student }: { student: Student }) {
  return (
    <Card aria-labelledby="medical-history">
      <CardHeader
        titleId="medical-history"
        title="Medical History"
        icon={<Icon name="stethoscope" />}
      />
      <CardBody className="flex flex-col gap-4">
        <section aria-labelledby="allergies-heading">
          <h3 id="allergies-heading" className="text-sm font-semibold text-text-primary">
            Allergies and restrictions
          </h3>
          <div className="mt-2">
            {tagList(student.allergies, 'No allergies or food restrictions recorded.')}
          </div>
        </section>
        <section aria-labelledby="conditions-heading">
          <h3 id="conditions-heading" className="text-sm font-semibold text-text-primary">
            Conditions
          </h3>
          <div className="mt-2">
            {tagList(student.medicalConditions, 'No medical conditions recorded.')}
          </div>
        </section>
      </CardBody>
    </Card>
  )
}

function VisitHistoryCard({ visits }: { visits: Visit[] }) {
  return (
    <Card aria-labelledby="visit-history" className="flex flex-col">
      <CardHeader
        titleId="visit-history"
        title="Visit History"
        icon={<Icon name="stethoscope" />}
        description="Most recent clinic visits for this student."
      />
      {visits.length ? (
        <RowList labelledBy="visit-history">
          {visits.map((visit) => (
            <ListRow
              key={visit.id}
              primary={visit.complaint}
              secondary={visit.treatment}
              meta={formatDateTime(visit.dateTime)}
              trailing={
                <Badge tone="info" variant="soft" icon="checkCircle">
                  {dispositionLabel[visit.disposition]}
                </Badge>
              }
            />
          ))}
        </RowList>
      ) : (
        <EmptyState title="No visit history yet" description="No clinic visits are recorded for this student." />
      )}
    </Card>
  )
}

function IncidentHistoryCard({ incidents }: { incidents: Incident[] }) {
  return (
    <Card aria-labelledby="incident-history" className="flex flex-col">
      <CardHeader
        titleId="incident-history"
        title="Incident History"
        icon={<Icon name="alertTriangle" />}
        description="Emergency incidents, including fast-capture records that still need completion."
      />
      {incidents.length ? (
        <RowList labelledBy="incident-history">
          {incidents.map((incident) => (
            <ListRow
              key={incident.id}
              primary={incident.complaint}
              secondary={
                incident.hospitalReferral
                  ? `Hospital referral: ${incident.hospitalReferral.destination}`
                  : 'No hospital referral recorded'
              }
              meta={formatDateTime(incident.time)}
              trailing={<StatusBadge status={String(incident.stage) as '1' | '2'} map={incidentStageMap} />}
            />
          ))}
        </RowList>
      ) : (
        <EmptyState
          title="No incident history yet"
          description="No emergency incidents are recorded for this student."
        />
      )}
    </Card>
  )
}

/**
 * Student Profile (Screen #7 / Reference 3). This is a deliberate single-student lookup, so the
 * full name is correct per ADR-004 and `.claude/skills/cliniq-display-privacy`.
 */
export function StudentProfilePage({
  viewer = getMockSessionUser(),
  studentId,
}: {
  viewer?: SessionUser
  studentId?: string
}) {
  const { data, status, reload } = useAsyncData(`student-profile|${studentId ?? 'default'}`, () =>
    fetchStudentProfile(studentId),
  )

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-8">
        <ErrorState title="Unable to load the student profile." onRetry={reload} />
      </div>
    )
  }

  if (!data) {
    return (
      <>
        <p className="sr-only" role="status">
          Loading student profile…
        </p>
        <StudentProfileSkeleton />
      </>
    )
  }

  return (
    <div
      className={cn(
        'mx-auto flex max-w-[1120px] flex-col gap-4 px-4 py-6 sm:px-8',
        viewer.role === 'instructor' && 'min-h-screen bg-surface',
      )}
    >
      <ProfileHeader student={data.student} viewer={viewer} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col gap-4">
          <OverviewCard student={data.student} />
          <MedicalHistoryCard student={data.student} />
        </div>
        <div className="flex flex-col gap-4">
          <VisitHistoryCard visits={data.visits} />
          <IncidentHistoryCard incidents={data.incidents} />
        </div>
      </div>
    </div>
  )
}
