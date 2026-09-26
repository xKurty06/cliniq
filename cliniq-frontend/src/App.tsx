import { DashboardPage } from './features/dashboard/DashboardPage'
import { AppShell } from './layouts/AppShell'
import { getMockSessionUser } from './lib/mocks/session'

/**
 * Temporary root. There's no router yet (the routing library is an open decision,
 * Development-Phases.md §0), so the visual App Shell wraps the only built screen. `?role=admin`
 * previews the Admin/Principal view.
 */
export default function App() {
  const user = getMockSessionUser()
  return (
    <AppShell user={user} active="dashboard">
      <DashboardPage viewer={user} />
    </AppShell>
  )
}
