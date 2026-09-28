import { useState } from 'react'
import { BrowserRouter } from 'react-router'
import { Card, Icon } from './components'
import { getMockSessionUser } from './lib/mock-db'
import { AppRoutes } from './routes/AppRoutes'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'

/**
 * Root: path-based routing with React Router (Development-Phases.md §0). The route table, role
 * guards, and shell placement live in `routes/AppRoutes.tsx`; URLs are built in `routes/paths.ts`.
 * `?role=admin` / `?role=instructor` still previews other roles until Sanctum auth lands.
 */
export default function App() {
  const [user] = useState(() => getMockSessionUser())
  const [isSignedOut, setIsSignedOut] = useState(false)

  if (isSignedOut) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
        <Card className="w-full max-w-md p-6 text-center">
          <Icon name="logout" size={28} className="mx-auto text-brand-green-dark" />
          <h1 className="mt-3 text-xl font-bold text-text-primary">You have logged out</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Your session has ended. Sign in again when the authentication screen is available.
          </p>
        </Card>
      </main>
    )
  }

  return (
    <BrowserRouter>
      <AppRoutes user={user} onLogout={() => setIsSignedOut(true)} />
      <KeyboardShortcuts />
    </BrowserRouter>
  )
}
