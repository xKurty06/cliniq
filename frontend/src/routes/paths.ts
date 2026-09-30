/**
 * Every URL in the app, built in one place (Development-Phases.md §0: path = which screen,
 * query = what state that screen is in). Screens link through these builders instead of
 * hand-writing strings, so a route change is one edit here.
 *
 * Kept free of page imports so any feature can import it without pulling in other screens'
 * lazily-loaded code.
 */
const seg = encodeURIComponent

function withStudent(path: string, studentNumber?: string): string {
  return studentNumber ? `${path}?student=${seg(studentNumber)}` : path
}

export const paths = {
  login: '/login',
  forcePasswordChange: '/force-password-change',
  dashboard: '/',
  students: '/students',
  studentNew: '/students/new',
  incompleteRecords: '/students/incomplete',
  studentProfile: (studentNumber: string) => `/students/${seg(studentNumber)}`,
  studentEdit: (studentNumber: string) => `/students/${seg(studentNumber)}/edit`,
  visits: '/visits',
  /** `?student=` pre-selects the identified student (e.g. from a QR lookup). */
  visitNew: (studentNumber?: string) => withStudent('/visits/new', studentNumber),
  peReferral: '/visits/pe-referral',
  visitDetail: (visitId: string) => `/visits/${seg(visitId)}`,
  excuseLetter: (visitId: string) => `/visits/${seg(visitId)}/excuse-letter`,
  incidents: '/incidents',
  /** `?student=` pre-selects the identified student; the Emergency button opens it without one. */
  incidentNew: (studentNumber?: string) => withStudent('/incidents/new', studentNumber),
  qrScan: '/qr/scan',
  inventory: '/inventory',
  inventoryNew: '/inventory/new',
  inventoryDispense: (studentNumber?: string) => withStudent('/inventory/dispense', studentNumber),
  followUps: '/follow-ups',
  qrPrint: '/qr/print',
  qrDesktop: '/qr/desktop',
  emergencyMobile: '/emergency/mobile',
  reports: '/reports',
  incidentNotifications: (incidentId?: string) => incidentId ? `/incidents/${encodeURIComponent(incidentId)}/notifications` : '/incidents/notifications',
  incidentReport: (incidentId?: string) => incidentId ? `/incidents/${encodeURIComponent(incidentId)}/report` : '/incidents/report',
  users: '/users',
  userNew: '/users/new',
  userEdit: (userId: string) => `/users/${encodeURIComponent(userId)}/edit`,
  backup: '/backup',
} as const
