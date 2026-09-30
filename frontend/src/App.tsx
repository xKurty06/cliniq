import { useState } from 'react'
import { BrowserRouter, useNavigate } from 'react-router'
import { getMockSessionUser, type SessionUser } from './lib/mock-db'
import { AppRoutes } from './routes/AppRoutes'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { paths } from './routes/paths'

/**
 * Root: path-based routing with React Router (Development-Phases.md §0). The route
 * guards and shell placement live in `routes/AppRoutes.tsx`; URLs are built in
 * `routes/paths.ts`.
 */
function AppContent() {
  const navigate = useNavigate()
  const [user, setUser] = useState<SessionUser>(() => getMockSessionUser())

  function signIn(nextUser: SessionUser) {
    setUser(nextUser)
  }

  return (
    <>
      <AppRoutes
        user={user}
        onLogin={signIn}
        onLogout={() => navigate(paths.login, { replace: true })}
      />
      <KeyboardShortcuts />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
