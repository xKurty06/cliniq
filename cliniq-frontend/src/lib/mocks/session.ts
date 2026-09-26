import type { User, UserRole } from '../../types/entities'

/**
 * MOCK SESSION: stands in for Sanctum auth until Phase B2 lands. Defaults to Staff; add `?role=admin`
 * to the URL to preview the Admin/Principal view. Names are fictional (taken from the reference
 * mockup).
 */
export type SessionUser = Pick<User, 'id' | 'name' | 'role'>

const USERS: Record<Exclude<UserRole, 'instructor'>, SessionUser> = {
  staff: { id: 'usr-nurse', name: 'Nurse Jane', role: 'staff' },
  admin: { id: 'usr-principal', name: 'Principal', role: 'admin' },
}

export function getMockSessionUser(): SessionUser {
  if (typeof window === 'undefined') return USERS.staff
  const role = new URLSearchParams(window.location.search).get('role')
  return role === 'admin' ? USERS.admin : USERS.staff
}

export const ROLE_LABELS: Record<UserRole, string> = {
  staff: 'Staff',
  admin: 'Admin / Principal',
  instructor: 'PE/Sports Instructor',
}
