import { useState, type FormEvent } from 'react'
import { formatTime } from '../../lib/dates'
import { useLocation, useNavigate } from 'react-router'
import { Button, Card, Input } from '../../components'
import { authenticateMockUser, beginPasswordChange, MockAuthError, type SessionUser } from '../../lib/mock-db'
import { paths } from '../../routes/paths'

const DEMO_ACCOUNTS = [
  { role: 'School Clinician', username: 'demo.nurse', password: 'demo-nurse', note: 'Standard Staff access' },
  { role: 'Admin / Principal', username: 'demo.principal', password: 'demo-admin', note: 'Reports and Dashboard access' },
  { role: 'PE/Sports Instructor', username: 'demo.pe', password: 'demo-pe', note: 'Read-only mobile lookup' },
  { role: 'PE/Sports Instructor', username: 'demo.pe2', password: 'demo-change', note: 'Force Password Change scenario' },
]

/** Only an in-app path is a safe place to return to after Login (never another origin). */
function returnPath(state: unknown): string | null {
  const from = (state as { from?: unknown } | null)?.from
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : null
}

export function LoginPage({ onLogin }: { onLogin: (user: SessionUser) => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({})

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLockedUntil(null)
    // Inline messages like every other CLINIQ form, instead of the browser's native bubble.
    const nextFieldErrors = {
      username: username.trim() ? undefined : 'Enter your username.',
      password: password ? undefined : 'Enter your password.',
    }
    setFieldErrors(nextFieldErrors)
    if (nextFieldErrors.username || nextFieldErrors.password) return
    setLoading(true)
    try {
      const result = await authenticateMockUser(username, password)
      if (result.mustChangePassword) {
        // No session yet: the account must set a new password before it can open any screen.
        beginPasswordChange(result.user.id)
        navigate(paths.forcePasswordChange, { replace: true })
        return
      }
      onLogin(result.user)
      navigate(returnPath(location.state) ?? paths.dashboard, { replace: true })
    } catch (cause) {
      if (cause instanceof MockAuthError && cause.reason === 'locked') {
        setLockedUntil(cause.lockedUntil ?? null)
        setError('This account is temporarily locked after repeated failed attempts. Try again in 30 minutes.')
      } else {
        setError('Unable to sign in with those credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const lockMessage = lockedUntil ? `Locked until ${formatTime(lockedUntil)}.` : null
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <Card className="w-full max-w-md p-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-dark">CLINIQ</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Sign In</h1>
          <p className="mt-1 text-sm text-text-secondary">Use your assigned clinic account to continue.</p>
        </header>
        <form className="mt-6 flex flex-col gap-4" onSubmit={submit} noValidate>
          <Input label="Username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} error={fieldErrors.username} required />
          <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} error={fieldErrors.password} required />
          {error && <p role="alert" className="text-sm font-semibold text-error">{error}</p>}
          {lockMessage && <p className="text-xs text-text-secondary">{lockMessage}</p>}
          <Button type="submit" variant="primary" className="mt-2 w-full" loading={loading}>Sign In</Button>
        </form>
        <aside className="mt-6 border-t border-border pt-4" aria-labelledby="demo-accounts-title">
          <h2 id="demo-accounts-title" className="text-sm font-semibold text-text-primary">Sample accounts for this demo</h2>
          <p className="mt-1 text-xs text-text-secondary">Synthetic credentials only. These are not real clinic accounts or production passwords.</p>
          <div className="mt-3 grid gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.username} className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-semibold text-text-primary">{account.role}</span>
                  <span className="text-text-secondary">{account.note}</span>
                </div>
                <dl className="mt-1 grid gap-x-3 gap-y-1 sm:grid-cols-[auto_minmax(0,1fr)]">
                  <dt className="font-semibold text-text-secondary">Username</dt>
                  <dd className="break-all font-mono text-text-primary">{account.username}</dd>
                  <dt className="font-semibold text-text-secondary">Password</dt>
                  <dd className="break-all font-mono text-text-primary">{account.password}</dd>
                </dl>
              </div>
            ))}
          </div>
        </aside>
        <p className="mt-5 border-t border-border pt-4 text-xs text-text-secondary">Frontend demo only: authentication is simulated until the Laravel Sanctum API is connected.</p>
      </Card>
    </main>
  )
}
