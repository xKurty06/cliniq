import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router'
import { Button, Card, Icon } from './components'
import { getMockSessionUser, selectMockSessionUser, type SessionUser } from './lib/mock-db'
import { AppRoutes } from './routes/AppRoutes'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'

/**
 * Root: path-based routing with React Router (Development-Phases.md §0). The route table, role
 * guards, and shell placement live in `routes/AppRoutes.tsx`; URLs are built in `routes/paths.ts`.
 * `?role=admin` / `?role=instructor` still previews other roles until Sanctum auth lands.
 */
export default function App() {
  const [user, setUser] = useState<SessionUser>(() => getMockSessionUser())
  const [isSignedOut, setIsSignedOut] = useState(false)

  useEffect(() => {
    if (isSignedOut) document.title = 'CLINIQ — Demo Sign In'
  }, [isSignedOut])

  function signInAs(role: SessionUser['role']) {
    setUser(selectMockSessionUser(role))
    setIsSignedOut(false)
  }

  if (isSignedOut) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
        <Card className="w-full max-w-md p-6 text-center">
          <Icon name="logout" size={28} className="mx-auto text-brand-green-dark" />
          <h1 className="mt-3 text-xl font-bold text-text-primary">You have logged out</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Choose a user to continue the client-demo prototype.
          </p>
          <section className="mt-5 border-t border-border pt-4 text-left" aria-labelledby="demo-sign-in-title">
            <h2 id="demo-sign-in-title" className="text-sm font-semibold text-text-primary">
              Demo sign in
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Prototype access only — this does not use a password or authenticate a real account.
            </p>
            <div className="mt-3 grid gap-2">
              <Button variant="primary" className="w-full" onClick={() => signInAs('staff')}>
                Continue as School Clinician
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => signInAs('admin')}>
                Continue as Admin / Principal
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => signInAs('instructor')}>
                Continue as PE/Sports Instructor
              </Button>
            </div>
          </section>
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
