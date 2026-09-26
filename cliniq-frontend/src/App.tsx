import { DashboardPage } from './features/dashboard/DashboardPage'

/**
 * Temporary root. There's no router or App Shell yet: the routing library is an open decision
 * (Development-Phases.md §0) and the App Shell/Nav is its own checklist item (#3). The Clinic
 * Overview Dashboard renders on its own until then.
 */
export default function App() {
  return <DashboardPage />
}
