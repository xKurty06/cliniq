import { BrowserRouter } from 'react-router'
import { getMockSessionUser } from './lib/mocks/session'
import { AppRoutes } from './routes/AppRoutes'

/**
 * Root: path-based routing with React Router (Development-Phases.md §0). The route table, role
 * guards, and shell placement live in `routes/AppRoutes.tsx`; URLs are built in `routes/paths.ts`.
 * `?role=admin` / `?role=instructor` still previews other roles until Sanctum auth lands.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes user={getMockSessionUser()} />
    </BrowserRouter>
  )
}
