import { lazy, Suspense, useEffect, type ComponentType, type ReactNode } from 'react'
import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router'
import { AppShell } from '../layouts/AppShell'
import type { NavKey } from '../layouts/navigation'
import type { SessionUser } from '../lib/mock-db'
import type { UserRole } from '../types/entities'
import { NotFoundPage } from './NotFoundPage'
import { paths } from './paths'
import { Card, Skeleton } from '../components'
import { LoginPage } from '../features/auth/LoginPage'
import { ForcePasswordChangePage } from '../features/auth/ForcePasswordChangePage'

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
const IncidentLogListPage = page(
  () => import('../features/emergency-response/IncidentLogListPage'),
  'IncidentLogListPage',
)
const QrMobileHubPage = page(
  () => import('../features/qr-digital-health-id/mobile/QrMobileHubPage'),
  'QrMobileHubPage',
)
const InventoryListPage = page(() => import('../features/inventory/InventoryListPage'), 'InventoryListPage')
const InventoryFormPage = page(() => import('../features/inventory/InventoryFormPage'), 'InventoryFormPage')
const InventoryDispensePage = page(() => import('../features/inventory/InventoryDispensePage'), 'InventoryDispensePage')
const FollowUpListPage = page(() => import('../features/emergency-response/FollowUpListPage'), 'FollowUpListPage')
const QrDesktopHubPage = page(() => import('../features/qr-digital-health-id/desktop/QrDesktopHubPage'), 'QrDesktopHubPage')
const QrPrintPage = page(() => import('../features/qr-digital-health-id/desktop/QrPrintPage'), 'QrPrintPage')
const EmergencyMobilePage = page(() => import('../features/emergency-response/EmergencyMobilePage'), 'EmergencyMobilePage')
const ReportsPage = page(() => import('../features/reports/ReportsPage'), 'ReportsPage')
const ParentNotificationPage = page(() => import('../features/emergency-response/ParentNotificationPage'), 'ParentNotificationPage')
const IncidentReportPage = page(() => import('../features/emergency-response/IncidentReportPage'), 'IncidentReportPage')
const UserListPage = page(() => import('../features/user-management/UserListPage'), 'UserListPage')
const UserFormPage = page(() => import('../features/user-management/UserFormPage'), 'UserFormPage')
const BackupStatusPage = page(() => import('../features/backup/BackupStatusPage'), 'BackupStatusPage')
const AuditLogPage = page(() => import('../features/audit-log/AuditLogPage'), 'AuditLogPage')

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

function IncidentCompleteRoute({ viewer }: Viewer) {
  const { incidentId } = useParams()
  return <IncidentEntryPage viewer={viewer} incidentId={incidentId} />
}

function VisitDetailRoute({ viewer }: Viewer) {
  const { visitId } = useParams()
  return <VisitDetailPage viewer={viewer} visitId={visitId} />
}

function ExcuseLetterRoute({ viewer }: Viewer) {
  const { visitId } = useParams()
  return <ExcuseLetterPage viewer={viewer} visitId={visitId} />
}
function IncidentNotificationRoute({ viewer }: Viewer) { const { incidentId } = useParams(); return <ParentNotificationPage viewer={viewer} incidentId={incidentId} /> }
function IncidentReportRoute({ viewer }: Viewer) { const { incidentId } = useParams(); return <IncidentReportPage viewer={viewer} incidentId={incidentId} /> }
function UserFormRoute() { const { userId } = useParams(); return <UserFormPage userId={userId} /> }
function ForcePasswordChangeRoute({ viewer, onComplete }: Viewer & { onComplete: (user: SessionUser) => void }) {
  return <ForcePasswordChangePage viewer={viewer} onComplete={onComplete} />
}

interface AppRoute {
  path: string
  /** Browser-tab label, paired with the route so it changes with the active screen. */
  title: string
  roles: UserRole[]
  /** Sidebar item highlighted while this screen is open. */
  nav: NavKey
  shell: boolean
  /** `onLogout` is for shell-free screens, which have no shell header to sign out from. */
  render: (viewer: SessionUser, onLogout: () => void) => ReactNode
}

function PageTitle({ children, title }: { children: ReactNode; title: string }) {
  useEffect(() => {
    document.title = `CLINIQ — ${title}`
  }, [title])

  return children
}

const APP_ROUTES: AppRoute[] = [
  {
    path: paths.dashboard,
    title: 'Clinic Overview',
    roles: ['staff', 'admin'],
    nav: 'dashboard',
    shell: true,
    render: (viewer) => <DashboardPage viewer={viewer} />,
  },
  {
    path: paths.students,
    title: 'Student List',
    roles: ['staff'],
    nav: 'students',
    shell: true,
    render: () => <StudentListPage />,
  },
  {
    path: paths.studentNew,
    title: 'Add Student',
    roles: ['staff'],
    nav: 'students',
    shell: true,
    render: (viewer) => <StudentFormPage viewer={viewer} />,
  },
  {
    path: paths.incompleteRecords,
    title: 'Incomplete Records',
    roles: ['staff'],
    nav: 'students',
    shell: true,
    render: (viewer) => <IncompleteRecordsQueuePage viewer={viewer} />,
  },
  {
    // Instructors reach this read-only from a QR lookup; the page hides every record action.
    path: '/students/:studentNumber',
    title: 'Student Profile',
    roles: ['staff', 'instructor'],
    nav: 'students',
    shell: true,
    render: (viewer) => <StudentProfileRoute viewer={viewer} />,
  },
  {
    path: '/students/:studentNumber/edit',
    title: 'Edit Student',
    roles: ['staff'],
    nav: 'students',
    shell: true,
    render: (viewer) => <StudentEditRoute viewer={viewer} />,
  },
  {
    path: paths.visits,
    title: 'Visit Log',
    roles: ['staff'],
    nav: 'visits',
    shell: true,
    render: () => <VisitLogListPage />,
  },
  {
    path: '/visits/new',
    title: 'New Visit',
    roles: ['staff'],
    nav: 'visits',
    shell: true,
    render: (viewer) => <NewVisitRoute viewer={viewer} />,
  },
  {
    path: paths.peReferral,
    title: 'PE/Sports Referrals',
    roles: ['staff'],
    nav: 'visits',
    shell: true,
    render: (viewer) => <PeSportsReferralPage viewer={viewer} />,
  },
  {
    path: '/visits/:visitId',
    title: 'Visit Details',
    roles: ['staff'],
    nav: 'visits',
    shell: true,
    render: (viewer) => <VisitDetailRoute viewer={viewer} />,
  },
  {
    path: '/visits/:visitId/excuse-letter',
    title: 'Excuse Letter',
    roles: ['staff'],
    nav: 'visits',
    shell: true,
    render: (viewer) => <ExcuseLetterRoute viewer={viewer} />,
  },
  {
    path: paths.incidents,
    title: 'Incident Log',
    roles: ['staff'],
    nav: 'incidents',
    shell: true,
    render: () => <IncidentLogListPage />,
  },
  {
    path: '/incidents/new',
    title: 'Report Incident',
    roles: ['staff'],
    nav: 'incidents',
    shell: true,
    render: (viewer) => <IncidentEntryRoute viewer={viewer} />,
  },
  { path: '/incidents/:incidentId/complete', title: 'Complete Incident', roles: ['staff'], nav: 'incidents', shell: true, render: (viewer) => <IncidentCompleteRoute viewer={viewer} /> },
  { path: '/incidents/notifications', title: 'Parent Notifications', roles: ['staff'], nav: 'incidents', shell: true, render: (viewer) => <IncidentNotificationRoute viewer={viewer} /> },
  { path: '/incidents/:incidentId/notifications', title: 'Parent Notifications', roles: ['staff'], nav: 'incidents', shell: true, render: (viewer) => <IncidentNotificationRoute viewer={viewer} /> },
  { path: '/incidents/report', title: 'Incident Report', roles: ['staff'], nav: 'incidents', shell: true, render: (viewer) => <IncidentReportRoute viewer={viewer} /> },
  { path: '/incidents/:incidentId/report', title: 'Incident Report', roles: ['staff'], nav: 'incidents', shell: true, render: (viewer) => <IncidentReportRoute viewer={viewer} /> },
  {
    path: paths.inventory,
    title: 'Inventory',
    roles: ['staff'],
    nav: 'inventory',
    shell: true,
    render: () => <InventoryListPage />,
  },
  {
    path: paths.inventoryNew,
    title: 'Add Inventory Item',
    roles: ['staff'],
    nav: 'inventory',
    shell: true,
    render: () => <InventoryFormPage />,
  },
  {
    path: '/inventory/dispense',
    title: 'Dispense Item',
    roles: ['staff'],
    nav: 'inventory',
    shell: true,
    render: () => <InventoryDispensePage />,
  },
  {
    path: paths.followUps,
    title: 'Follow-Ups',
    roles: ['staff'],
    nav: 'followUps',
    shell: true,
    render: () => <FollowUpListPage />,
  },
  {
    path: paths.qrScan,
    title: 'QR Lookup',
    roles: ['staff', 'instructor'],
    nav: 'qrLookup',
    shell: false,
    render: (viewer, onLogout) => <QrMobileHubPage viewer={viewer} onLogout={onLogout} />,
  },
  { path: paths.qrDesktop, title: 'QR Health IDs', roles: ['staff'], nav: 'qrLookup', shell: true, render: (viewer) => <QrDesktopHubPage viewer={viewer} /> },
  { path: paths.qrPrint, title: 'Print QR Health IDs', roles: ['staff'], nav: 'qrLookup', shell: true, render: () => <QrPrintPage /> },
  { path: paths.emergencyMobile, title: 'Emergency Response', roles: ['staff'], nav: 'incidents', shell: false, render: () => <EmergencyMobilePage /> },
  { path: paths.reports, title: 'Reports', roles: ['staff', 'admin'], nav: 'reports', shell: true, render: (viewer) => <ReportsPage viewer={viewer} /> },
  { path: paths.auditLog, title: 'Audit Log', roles: ['staff', 'admin'], nav: 'auditLog', shell: true, render: (viewer) => <AuditLogPage viewer={viewer} /> },
  { path: paths.users, title: 'User Accounts', roles: ['staff'], nav: 'accounts', shell: true, render: () => <UserListPage /> },
  { path: paths.userNew, title: 'Add User', roles: ['staff'], nav: 'accounts', shell: true, render: () => <UserFormPage /> },
  { path: '/users/:userId/edit', title: 'Edit User', roles: ['staff'], nav: 'accounts', shell: true, render: () => <UserFormRoute /> },
  { path: paths.backup, title: 'Backup', roles: ['staff'], nav: 'backup', shell: true, render: () => <BackupStatusPage /> },
]

/** Where a role lands on `/` or when it opens a screen it can't use. */
function homePathFor(role: UserRole): string {
  return role === 'instructor' ? paths.qrScan : paths.dashboard
}

function RouteLoading() {
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 pt-10 pb-8 sm:px-8" aria-busy="true">
      <p className="sr-only" role="status">Loading screen…</p>
      <Card className="p-5"><Skeleton className="h-7 w-56 max-w-full" /><Skeleton className="mt-2 h-4 w-96 max-w-full" /></Card>
      <Card className="p-5"><Skeleton className="h-10 w-full" /><Skeleton className="mt-4 h-40 w-full" /></Card>
    </div>
  )
}

function withShell(
  user: SessionUser,
  nav: NavKey | null,
  content: ReactNode,
  onLogout: () => void,
) {
  // Instructor has no shell, so the read-only profile needs its own main landmark.
  if (user.role === 'instructor') return <main id="main-content">{content}</main>
  return (
    <AppShell user={user} active={nav} onLogout={onLogout}>
      {content}
    </AppShell>
  )
}

export function AppRoutes({
  user,
  onLogout,
  onLogin = () => {},
}: {
  user: SessionUser
  onLogout: () => void
  onLogin?: (user: SessionUser) => void
}) {
  return (
    <Routes>
      <Route
        path={paths.login}
        element={
          <PageTitle title="Sign in">
            <LoginPage onLogin={onLogin} />
          </PageTitle>
        }
      />
      <Route
        path={paths.forcePasswordChange}
        element={
          <PageTitle title="Change Password">
            <ForcePasswordChangeRoute viewer={user} onComplete={onLogin} />
          </PageTitle>
        }
      />
      {APP_ROUTES.map((route) => {
        const allowed = route.roles.includes(user.role)
        const content = (
          <PageTitle title={route.title}>
            <Suspense fallback={<RouteLoading />}>{route.render(user, onLogout)}</Suspense>
          </PageTitle>
        )
        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              !allowed ? (
                <Navigate to={homePathFor(user.role)} replace />
              ) : route.shell ? (
                withShell(user, route.nav, content, onLogout)
              ) : (
                content
              )
            }
          />
        )
      })}
      <Route
        path="*"
        element={withShell(
          user,
          null,
          <PageTitle title="Page Not Found"><NotFoundPage home={homePathFor(user.role)} /></PageTitle>,
          onLogout,
        )}
      />
    </Routes>
  )
}
