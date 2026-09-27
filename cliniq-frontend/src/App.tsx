import { DashboardPage } from './features/dashboard/DashboardPage'
import { NewVisitEntryPage } from './features/clinic-visits/NewVisitEntryPage'
import { ExcuseLetterPage } from './features/clinic-visits/ExcuseLetterPage'
import { VisitDetailPage } from './features/clinic-visits/VisitDetailPage'
import { VisitLogListPage } from './features/clinic-visits/VisitLogListPage'
import { PeSportsReferralPage } from './features/clinic-visits/PeSportsReferralPage'
import { IncidentEntryPage } from './features/emergency-response/IncidentEntryPage'
import { QrMobileHubPage } from './features/qr-digital-health-id/mobile/QrMobileHubPage'
import { IncompleteRecordsQueuePage } from './features/student-records/IncompleteRecordsQueuePage'
import { StudentFormPage } from './features/student-records/StudentFormPage'
import { StudentListPage } from './features/student-records/StudentListPage'
import { StudentProfilePage } from './features/student-records/StudentProfilePage'
import { AppShell } from './layouts/AppShell'
import { getMockSessionUser } from './lib/mocks/session'
import type { NavKey } from './layouts/navigation'

/**
 * Temporary root. There's no router yet (the routing library is an open decision,
 * Development-Phases.md §0), so the visual App Shell wraps the only built screen. `?role=admin`
 * previews the Admin/Principal view.
 */
export default function App() {
  const user = getMockSessionUser()
  const screen =
    typeof window === 'undefined'
      ? 'dashboard'
      : new URLSearchParams(window.location.search).get('screen')
  const active: NavKey =
    screen === 'student-profile'
      ? 'students'
      : screen === 'student-list'
        ? 'students'
        : screen === 'student-form'
          ? 'students'
          : screen === 'incomplete-records'
            ? 'students'
            : screen === 'visit-log'
              ? 'visits'
              : screen === 'visit-detail'
                ? 'visits'
                : screen === 'excuse-letter'
                  ? 'visits'
                  : screen === 'pe-referral'
                    ? 'visits'
                  : screen === 'new-visit'
                      ? 'visits'
                      : screen === 'incident-entry'
                        ? 'incidents'
                        : screen === 'qr-mobile'
                          ? 'qrLookup'
                          : 'dashboard'
  const page =
    screen === 'student-profile' ? (
      <StudentProfilePage viewer={user} />
    ) : screen === 'student-list' ? (
      <StudentListPage />
    ) : screen === 'student-form' ? (
      <StudentFormPage viewer={user} />
    ) : screen === 'incomplete-records' ? (
      <IncompleteRecordsQueuePage viewer={user} />
    ) : screen === 'visit-log' ? (
      <VisitLogListPage />
    ) : screen === 'visit-detail' ? (
      <VisitDetailPage viewer={user} />
    ) : screen === 'excuse-letter' ? (
      <ExcuseLetterPage viewer={user} />
    ) : screen === 'pe-referral' ? (
      <PeSportsReferralPage viewer={user} />
    ) : screen === 'new-visit' ? (
      <NewVisitEntryPage viewer={user} />
    ) : screen === 'incident-entry' ? (
      <IncidentEntryPage viewer={user} />
    ) : screen === 'qr-mobile' ? (
      <QrMobileHubPage viewer={user} />
    ) : (
      <DashboardPage viewer={user} />
    )

  if (user.role === 'instructor' || screen === 'qr-mobile') return page

  return (
    <AppShell user={user} active={active}>
      {page}
    </AppShell>
  )
}
