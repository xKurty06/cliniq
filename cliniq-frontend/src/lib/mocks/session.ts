import type { User, UserRole } from '../../types/entities'

/**
 * MOCK SESSION: stands in for Sanctum auth until Phase B2 lands. Defaults to Staff; add `?role=admin`
 * or `?role=instructor` to the URL to preview role-conditional frontend states. The previewed role
 * is kept for the browser tab (sessionStorage) so in-app navigation, which drops the query string,
 * doesn't silently switch back to Staff; `?role=staff` switches back. Staff uses the
 * client contact documented in the project knowledge base rather than the fictional reference-mockup
 * name.
 */
export type SessionUser = Pick<User, 'id' | 'name' | 'role'>

const USERS: Record<UserRole, SessionUser> = {
  staff: { id: 'usr-nurse', name: 'Ms. Jenne Baas', role: 'staff' },
  admin: { id: 'usr-principal', name: 'Principal', role: 'admin' },
  instructor: { id: 'usr-pe', name: 'PE Instructor', role: 'instructor' },
}

const ROLE_STORAGE_KEY = 'cliniq.mockRole'

function isRole(value: string | null): value is UserRole {
  return value === 'staff' || value === 'admin' || value === 'instructor'
}

export function getMockSessionUser(): SessionUser {
  if (typeof window === 'undefined') return USERS.staff
  const fromUrl = new URLSearchParams(window.location.search).get('role')
  try {
    if (isRole(fromUrl)) {
      window.sessionStorage.setItem(ROLE_STORAGE_KEY, fromUrl)
      return USERS[fromUrl]
    }
    const stored = window.sessionStorage.getItem(ROLE_STORAGE_KEY)
    return isRole(stored) ? USERS[stored] : USERS.staff
  } catch {
    // Storage can be blocked (private mode, previews); fall back to the URL alone.
    return isRole(fromUrl) ? USERS[fromUrl] : USERS.staff
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  staff: 'School Clinician',
  admin: 'Admin / Principal',
  instructor: 'PE/Sports Instructor',
}
