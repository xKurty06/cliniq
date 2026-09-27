import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router'
import { AppShell } from '../layouts/AppShell'
import type { NavKey } from '../layouts/navigation'
import type { SessionUser } from '../lib/mocks/session'
import type { UserRole } from '../types/entities'
import { NotFoundPage } from './NotFoundPage'
import { paths } from './paths'

/**
 * The route table (Development-Phases.md §0: path-based routes, React Router).
 *
 * - Each screen is its own lazy chunk, so opening the Dashboard doesn't download screens that
 *   haven't been visited (Performance NFR, 4GB-RAM workstation).
 * - Role access is declared on the route (`roles`) and enforced by one guard, so "who can open
 *   what" is readable in this file alone. Screens still keep their own role checks as a second
 *   layer, since the backend will enforce roles independently anyway.
 * - `shell: false` screens (the QR mobile flow) render without the desktop sidebar, and the
 *   PE/Sports Instructor never gets the shell at all.
 */

/** Lazily loads a named page export as its own chunk. */
function page<K extends string, P>(
  load: () => Promise<Record<K, ComponentType<P>>>,
  name: K,
) {
  return lazy(async () => ({ default: (await load())[name] }))
}

const DashboardPage = page(() => import('../features/dashboard/DashboardPage'), 'DashboardPage')
const StudentListPage = page(
  () => import('../features/student-records/StudentListPage'),
  'StudentListPage',
)
const StudentFormPage = page(
  () => import('../features/student-records/StudentFormPage'),
  'StudentFormPage',
)
const IncompleteRecordsQueuePage = page(
  () => import('../features/student-records/IncompleteRecordsQueuePage'),
  'IncompleteRecordsQueuePage',
)
const StudentProfilePage = page(
  () => import('../features/student-records/StudentProfilePage'),
  'StudentProfilePage',
)
const VisitLogListPage = page(
  () => import('../features/clinic-visits/VisitLogListPage'),
  'VisitLogListPage',
)
const NewVisitEntryPage = page(
  () => import('../features/clinic-visits/NewVisitEntryPage'),
  'NewVisitEntryPage',
)
const PeSportsReferralPage = page(
  () => import('../features/clinic-visits/PeSportsReferralPage'),
  'PeSportsReferralPage',
)
const VisitDetailPage = page(
  () => import('../features/clinic-visits/VisitDetailPage'),
  'VisitDetailPage',
)
const ExcuseLetterPage = page(
  () => import('../features/clinic-visits/ExcuseLetterPage'),
  'ExcuseLetterPage',
)
const IncidentEntryPage = page(
  () => import('../features/emergency-response/IncidentEntryPage'),
  'IncidentEntryPage',
)
const QrMobileHubPage = page(
  () => import('../features/qr-digital-health-id/mobile/QrMobileHubPage'),
  'QrMobileHubPage',
)

type Viewer = { viewer: SessionUser }

function StudentProfileRoute({ viewer }: Viewer) {
  const { studentNumber } = useParams()
  return <StudentProfilePage viewer={viewer} studentNumber={studentNumber} />
}

function StudentEditRoute({ viewer }: Viewer) {
  const { studentNumber } = useParams()
  return <StudentFormPage viewer={viewer} studentNumber={studentNumber} />
}

function NewVisitRoute({ viewer }: Viewer) {
  const [search] = useSearchParams()
  return <NewVisitEntryPage viewer={viewer} studentNumber={search.get('student') ?? undefined} />
}

function IncidentEntryRoute({ viewer }: Viewer) {
  const [search] = useSearchParams()
  return <IncidentEntryPage viewer={viewer} studentNumber={search.get('student') ?? undefined} />
}

function VisitDetailRoute({ viewer }: Viewer) {
  const { visitId } = useParams()
  return <VisitDetailPage viewer={viewer} visitId={visitId} />
}

function ExcuseLetterRoute({ viewer }: Viewer) {
  const { visitId } = useParams()
  return <ExcuseLetterPage viewer={viewer} visitId={visitId} />
}

interface AppRoute {
  path: string
  roles: UserRole[]
  /** Sidebar item highlighted while this screen is open. */
  nav: NavKey
  shell: boolean
  render: (viewer: SessionUser) => ReactNode
}

const APP_ROUTES: AppRoute[] = [
  {
    path: paths.dashboard,
    roles: ['staff', 'admin'],
    nav: 'dashboard',
    shell: true,
    render: (viewer) => <DashboardPage viewer={viewer} />,
  },
  {
    path: paths.students,
    roles: ['staff'],
    nav: 'students',
    shell: true,
    render: () => <StudentListPage />,
  },
  {
    path: paths.studentNew,
    roles: ['staff'],
    nav: 'students',
    shell: true,
    render: (viewer) => <StudentFormPage viewer={viewer} />,
  },
  {
    path: paths.incompleteRecords,
    roles: ['staff'],
    nav: 'students',
    shell: true,
    render: (viewer) => <IncompleteRecordsQueuePage viewer={viewer} />,
  },
  {
    // Instructors reach this read-only from a QR lookup; the page hides every record action.
    path: '/students/:studentNumber',
    roles: ['staff', 'instructor'],
    nav: 'students',
    shell: true,
    render: (viewer) => <StudentProfileRoute viewer={viewer} />,
  },
  {
    path: '/students/:studentNumber/edit',
    roles: ['staff'],
    nav: 'students',
    shell: true,
    render: (viewer) => <StudentEditRoute viewer={viewer} />,
  },
  {
    path: paths.visits,
    roles: ['staff'],
    nav: 'visits',
    shell: true,
    render: () => <VisitLogListPage />,
  },
  {
    path: '/visits/new',
    roles: ['staff'],
    nav: 'visits',
    shell: true,
    render: (viewer) => <NewVisitRoute viewer={viewer} />,
  },
  {
    path: paths.peReferral,
    roles: ['staff'],
    nav: 'visits',
    shell: true,
    render: (viewer) => <PeSportsReferralPage viewer={viewer} />,
  },
  {
    path: '/visits/:visitId',
    roles: ['staff'],
    nav: 'visits',
    shell: true,
    render: (viewer) => <VisitDetailRoute viewer={viewer} />,
  },
  {
    path: '/visits/:visitId/excuse-letter',
    roles: ['staff'],
    nav: 'visits',
    shell: true,
    render: (viewer) => <ExcuseLetterRoute viewer={viewer} />,
  },
  {
    path: '/incidents/new',
    roles: ['staff'],
    nav: 'incidents',
    shell: true,
    render: (viewer) => <IncidentEntryRoute viewer={viewer} />,
  },
  {
    path: paths.qrScan,
    roles: ['staff', 'instructor'],
    nav: 'qrLookup',
    shell: false,
    render: (viewer) => <QrMobileHubPage viewer={viewer} />,
  },
]

/** Where a role lands on `/` or when it opens a screen it can't use. */
function homePathFor(role: UserRole): string {
  return role === 'instructor' ? paths.qrScan : paths.dashboard
}

function RouteLoading() {
  return (
    <p className="sr-only" role="status">
      Loading screen…
    </p>
  )
}

function withShell(user: SessionUser, nav: NavKey | null, content: ReactNode) {
  if (user.role === 'instructor') return content
  return (
    <AppShell user={user} active={nav}>
      {content}
    </AppShell>
  )
}

export function AppRoutes({ user }: { user: SessionUser }) {
  return (
    <Routes>
      {APP_ROUTES.map((route) => {
        const allowed = route.roles.includes(user.role)
        const content = <Suspense fallback={<RouteLoading />}>{route.render(user)}</Suspense>
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              !allowed ? (
                <Navigate to={homePathFor(user.role)} replace />
              ) : route.shell ? (
                withShell(user, route.nav, content)
              ) : (
                content
              )
            }
          />
        )
      })}
      <Route path="*" element={withShell(user, null, <NotFoundPage home={homePathFor(user.role)} />)} />
    </Routes>
  )
}
