import type { User, UserRole } from '../../types/entities'
import { db } from './store'

/**
 * MOCK SESSION: stands in for Sanctum auth until Phase B2 lands. Defaults to Staff; add `?role=admin`
 * or `?role=instructor` to the URL to preview role-conditional frontend states. The previewed role
 * is kept for the browser tab (sessionStorage) so in-app navigation, which drops the query string,
 * doesn't silently switch back to Staff; `?role=staff` switches back.
 *
 * The signed-in user for each role is the first account of that role in `mock-db.json` that doesn't
 * still need a password change. Every account there is fictional (see the file's `meta.notice`).
 */
export type SessionUser = Pick<User, 'id' | 'name' | 'role'>

const ROLE_STORAGE_KEY = 'cliniq.mockRole'

function isRole(value: string | null): value is UserRole {
  return value === 'staff' || value === 'admin' || value === 'instructor'
}

function userForRole(role: UserRole): SessionUser {
  const state = db()
  const mustChange = new Set(
    state.frontendOnly.devAccounts.filter((a) => a.mustChangePassword).map((a) => a.userId),
  )
  const user =
    state.users.find((u) => u.role === role && !mustChange.has(u.id)) ??
    state.users.find((u) => u.role === role)
  if (!user) throw new Error(`mock-db.json has no "${role}" account`)
  return { id: user.id, name: user.name, role: user.role }
}

export function getMockSessionUser(): SessionUser {
  if (typeof window === 'undefined') return userForRole('staff')
  const fromUrl = new URLSearchParams(window.location.search).get('role')
  try {
    if (isRole(fromUrl)) {
      window.sessionStorage.setItem(ROLE_STORAGE_KEY, fromUrl)
      return userForRole(fromUrl)
    }
    const stored = window.sessionStorage.getItem(ROLE_STORAGE_KEY)
    return userForRole(isRole(stored) ? stored : 'staff')
  } catch {
    // Storage can be blocked (private mode, previews); fall back to the URL alone.
    return userForRole(isRole(fromUrl) ? fromUrl : 'staff')
  }
}

/**
 * Ends the development-only role preview. The real Sanctum logout endpoint will replace this
 * when authentication is implemented in Phase B2.
 */
export function clearMockSession() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(ROLE_STORAGE_KEY)
  } catch {
    // Storage can be blocked; the app still moves to its signed-out view.
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  staff: 'School Clinician',
  admin: 'Admin / Principal',
  instructor: 'PE/Sports Instructor',
}
