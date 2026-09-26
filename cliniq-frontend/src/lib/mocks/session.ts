import type { User, UserRole } from '../../types/entities'

/**
 * MOCK SESSION: stands in for Sanctum auth until Phase B2 lands. Defaults to Staff; add `?role=admin`
 * to the URL to preview the Admin/Principal view. Staff uses the client contact documented in the
 * project knowledge base rather than the fictional reference-mockup name.
 */
export type SessionUser = Pick<User, 'id' | 'name' | 'role'>

const USERS: Record<Exclude<UserRole, 'instructor'>, SessionUser> = {
  staff: { id: 'usr-nurse', name: 'Ms. Jenne Baas', role: 'staff' },
  admin: { id: 'usr-principal', name: 'Principal', role: 'admin' },
}

export function getMockSessionUser(): SessionUser {
  if (typeof window === 'undefined') return USERS.staff
  const role = new URLSearchParams(window.location.search).get('role')
  return role === 'admin' ? USERS.admin : USERS.staff
}

export const ROLE_LABELS: Record<UserRole, string> = {
  staff: 'School Clinician',
  admin: 'Admin / Principal',
  instructor: 'PE/Sports Instructor',
}
