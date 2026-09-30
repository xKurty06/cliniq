import type { FollowUpDueState } from '../../components/status/followUp'
import type { InventoryFlag } from '../../components/status/inventory'
import { addDays, diffDays, isWithin } from '../dates'
import type {
  AuditActionType,
  AuditLogEntry,
  BackupLog,
  FollowUp,
  ISODate,
  InventoryItem,
  Student,
  StudentListRef,
} from '../../types/entities'
import type { DbState, RecordReview, SeedStudent } from './types'

/**
 * SELECTORS: every derived value the screens show is computed here, from raw records, on every
 * read. Nothing below is stored in `mock-db.json`, and no component recomputes any of it. That's
 * what keeps every screen in sync: change a raw record and every count, flag, and status follows.
 *
 * All pure functions of (state, today, config), so they're unit-testable with a hand-built state.
 */

export const dateOf = (timestamp: string): ISODate => timestamp.slice(0, 10)

// ---- Audit log ------------------------------------------------------------------------------

export const auditTargetTypes = [
  'student',
  'visit',
  'incident',
  'inventory',
  'user',
  'report',
  'backup',
  'follow-up',
] as const

export type AuditTargetType = (typeof auditTargetTypes)[number]

export interface AuditLogQuery {
  from: ISODate
  to: ISODate
  userId: string
  actionTypes: ReadonlyArray<AuditActionType>
  targetTypes: ReadonlyArray<AuditTargetType>
}

export interface AuditLogRow {
  id: string
  timestamp: ISODate
  dateTime: string
  userId: string
  userName: string
  actionType: AuditActionType
  target: {
    type: AuditTargetType
    id: string
    label: string
    studentNumber?: string
  } | null
}

export interface AuditLogList {
  rows: AuditLogRow[]
  users: Array<{ id: string; name: string }>
}

function auditTargetType(target: NonNullable<AuditLogEntry['targetRecord']>): AuditTargetType {
  if (target.type.startsWith('inventory')) return 'inventory'
  if (target.type === 'followup') return 'follow-up'
  if (auditTargetTypes.includes(target.type as AuditTargetType)) return target.type as AuditTargetType
  return 'report'
}

function auditTargetLabel(state: DbState, target: NonNullable<AuditLogEntry['targetRecord']>) {
  const type = auditTargetType(target)
  if (type === 'student') {
    const student = studentsById(state).get(target.id)
    return { type, id: target.id, label: student ? `Student ${student.studentNumber}` : 'Student record', studentNumber: student?.studentNumber }
  }
  if (type === 'inventory') return { type, id: target.id, label: state.inventoryItems.find((item) => item.id === target.id)?.name ?? 'Inventory record' }
  if (type === 'user') return { type, id: target.id, label: state.users.find((user) => user.id === target.id)?.name ?? 'User account' }
  if (type === 'follow-up') {
    const followUp = state.followUps.find((item) => item.id === target.id)
    const student = followUp ? studentsById(state).get(followUp.studentId) : undefined
    return { type, id: target.id, label: student ? `Follow-up for ${student.studentNumber}` : 'Follow-up record' }
  }
  return { type, id: target.id, label: `${type[0].toUpperCase()}${type.slice(1)} ${target.id}` }
}

/** Resolves audit actors and privacy-safe targets before a screen can render them. */
export function auditLogList(state: DbState, query: AuditLogQuery): AuditLogList {
  const userNames = new Map(state.users.map((user) => [user.id, user.name]))
  const rows = state.auditLog
    .map((entry, index): AuditLogRow => ({
      id: `${entry.timestamp}|${entry.userId}|${entry.actionType}|${index}`,
      timestamp: dateOf(entry.timestamp),
      dateTime: entry.timestamp,
      userId: entry.userId,
      userName: userNames.get(entry.userId) ?? 'Unknown user',
      actionType: entry.actionType,
      target: entry.targetRecord ? auditTargetLabel(state, entry.targetRecord) : null,
    }))
    .filter((row) => row.timestamp >= query.from && row.timestamp <= query.to)
    .filter((row) => !query.userId || row.userId === query.userId)
    .filter((row) => query.actionTypes.length === 0 || query.actionTypes.includes(row.actionType))
    .filter((row) => query.targetTypes.length === 0 || (row.target && query.targetTypes.includes(row.target.type)))
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
  return { rows, users: state.users.map((user) => ({ id: user.id, name: user.name })).sort((a, b) => a.name.localeCompare(b.name)) }
}

// ---- Students ------------------------------------------------------------------------------

/**
 * Required fields per Module 2 ("full name, grade level, emergency contact, allergies,
 * conditions"). OPEN QUESTION: `allergies`/`medicalConditions` are string arrays, and an empty
 * array can't tell "none" from "not yet recorded", so those two can't be checked until the API
 * contract distinguishes them. Contact info is checked because the Registrar import can omit it.
 */
export function missingRequiredFields(student: SeedStudent): string[] {
  const missing: string[] = []
  if (!student.fullName.trim()) missing.push('Full name')
  if (!student.gradeLevel.trim()) missing.push('Grade level')
  if (!student.contactInfo.trim()) missing.push('Student contact information')
  const contact = student.emergencyContact
  if (!contact) missing.push('Emergency contact')
  else {
    if (!contact.name.trim()) missing.push('Emergency contact name')
    if (!contact.phone.trim()) missing.push('Emergency contact phone')
  }
  return missing
}

/** The §5 `Student` shape, with `recordComplete` derived rather than stored. */
export function toStudent(student: SeedStudent): Student {
  return { ...student, recordComplete: missingRequiredFields(student).length === 0 }
}

export function toListRef(student: Pick<Student, 'id' | 'studentNumber'>): StudentListRef {
  // Only id + Student Number leave this function. The name is dropped on purpose (ADR-004).
  return { id: student.id, studentNumber: student.studentNumber }
}

export function studentsById(state: DbState): Map<string, SeedStudent> {
  return new Map(state.students.map((s) => [s.id, s]))
}

export function studentByNumber(state: DbState, studentNumber: string): SeedStudent | undefined {
  return state.students.find((s) => s.studentNumber === studentNumber)
}

export function activeStudents(state: DbState): SeedStudent[] {
  return state.students.filter((s) => !s.archived)
}

export function gradeLevels(state: DbState): string[] {
  const levels = new Set(state.students.map((s) => s.gradeLevel).filter(Boolean))
  return [...levels].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

/** Next `YYYY-NNNNN` for the current year (ADR-005: system-generated at creation). */
export function nextStudentNumber(state: DbState): string {
  const year = state.today.slice(0, 4)
  const max = state.students
    .map((s) => s.studentNumber)
    .filter((n) => n.startsWith(`${year}-`))
    .reduce((m, n) => Math.max(m, Number(n.slice(5)) || 0), 0)
  return `${year}-${String(max + 1).padStart(5, '0')}`
}

// ---- Incomplete Records Review Queue (#9) ---------------------------------------------------

export interface IncompleteRecordRow {
  student: Student
  missingFields: string[]
  review: RecordReview | null
  status: 'open' | 'resolved'
}

/**
 * Queue rows: every active student whose record is currently incomplete, plus records Staff has
 * marked resolved. "Open" = incomplete and not yet resolved. The Dashboard's pending-records card
 * counts exactly these open rows, so the two screens can't disagree.
 */
export function incompleteRecordQueue(state: DbState): IncompleteRecordRow[] {
  const reviews = new Map(state.frontendOnly.recordReviews.map((r) => [r.studentNumber, r]))
  return activeStudents(state).flatMap((student) => {
    const missingFields = missingRequiredFields(student)
    const review = reviews.get(student.studentNumber) ?? null
    const resolved = Boolean(review?.resolvedAt)
    if (!missingFields.length && !resolved) return []
    return [{ student: toStudent(student), missingFields, review, status: resolved ? 'resolved' : 'open' }]
  })
}

export function pendingRecordCount(state: DbState): number {
  return incompleteRecordQueue(state).filter((row) => row.status === 'open').length
}

// ---- Frequent visitors ---------------------------------------------------------------------

export interface FrequentVisitor {
  student: StudentListRef
  visitCount: number
}

/**
 * Students at or over `frequentVisitorMinVisits` in the range. Without a range, the default window
 * is the last `frequentVisitorWindowDays` days. A warning only, never a diagnosis (Module 9).
 */
export function frequentVisitors(state: DbState, range?: { from: ISODate; to: ISODate }): FrequentVisitor[] {
  const { from, to } = range ?? {
    from: addDays(state.today, -(state.config.frequentVisitorWindowDays - 1)),
    to: state.today,
  }
  const byId = studentsById(state)
  const counts = new Map<string, number>()
  for (const v of state.visits)
    if (isWithin(dateOf(v.dateTime), from, to)) counts.set(v.studentId, (counts.get(v.studentId) ?? 0) + 1)
  return [...counts.entries()]
    .filter(([, n]) => n >= state.config.frequentVisitorMinVisits)
    .flatMap(([id, visitCount]) => {
      const student = byId.get(id)
      return student ? [{ student: toListRef(student), visitCount }] : []
    })
    .sort((a, b) => b.visitCount - a.visitCount || a.student.studentNumber.localeCompare(b.student.studentNumber))
}

// ---- Follow-ups ------------------------------------------------------------------------------

/** How close a *pending* follow-up is to its date, relative to today. Null once it's resolved. */
export function followUpDueState(followUp: FollowUp, today: ISODate): FollowUpDueState | null {
  if (followUp.status !== 'pending') return null
  const days = diffDays(today, followUp.followUpDate)
  return days < 0 ? 'overdue' : days === 0 ? 'due_today' : 'upcoming'
}

/** Pending follow-ups due on or before today + the upcoming window (overdue ones stay listed). */
export function dueFollowUps(state: DbState): FollowUp[] {
  const horizon = addDays(state.today, state.config.upcomingFollowUpDays)
  return state.followUps
    .filter((f) => f.status === 'pending' && f.followUpDate <= horizon)
    .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
}

// ---- Inventory -------------------------------------------------------------------------------

export interface InventoryStatus {
  flags: InventoryFlag[]
  /** Negative = already expired; null if the item doesn't expire. */
  daysUntilExpiry: number | null
  belowZero: boolean
}

/**
 * Low stock = strictly below the threshold (OPEN QUESTION: "at" the threshold isn't specified).
 * Low-stock and expiry flags are independent and can both apply (Module 8, stock flow step 5).
 */
export function inventoryStatus(item: InventoryItem, today: ISODate, expiryWarningDays: number): InventoryStatus {
  const daysUntilExpiry = item.expirationDate ? diffDays(today, item.expirationDate) : null
  const flags: InventoryFlag[] = []
  if (item.currentStock < item.lowStockThreshold) flags.push('low_stock')
  if (daysUntilExpiry !== null && daysUntilExpiry < 0) flags.push('expired')
  else if (daysUntilExpiry !== null && daysUntilExpiry <= expiryWarningDays) flags.push('nearing_expiration')
  return { flags, daysUntilExpiry, belowZero: item.currentStock < 0 }
}

export function inventoryStatusFor(state: DbState, item: InventoryItem): InventoryStatus {
  return inventoryStatus(item, state.today, state.config.expiryWarningDays)
}

export function lowStockCount(state: DbState): number {
  return state.inventoryItems.filter((i) => inventoryStatusFor(state, i).flags.includes('low_stock')).length
}

// ---- Backups -------------------------------------------------------------------------------

export interface BackupStatus {
  latest: BackupLog | null
  /** The latest run succeeded but nobody has checked it yet. */
  needsVerification: boolean
  /** The most recent failed run, if the latest run isn't it. */
  recentFailure: BackupLog | null
  history: BackupLog[]
}

export function backupStatus(state: DbState): BackupStatus {
  const history = [...state.backupLogs].sort((a, b) => b.lastRun.localeCompare(a.lastRun))
  const latest = history[0] ?? null
  return {
    latest,
    needsVerification: Boolean(latest && latest.status === 'ok' && !latest.verifiedByUserId),
    recentFailure: history.find((b) => b.status === 'failed') ?? null,
    history,
  }
}

// ---- Reports ---------------------------------------------------------------------------------

/** `month` is "YYYY-MM". */
export function monthlyCounts(state: DbState, month: string) {
  return {
    visits: state.visits.filter((v) => v.dateTime.startsWith(month)).length,
    incidents: state.incidents.filter((i) => i.time.startsWith(month)).length,
    followUps: state.followUps.filter((f) => f.followUpDate.startsWith(month)).length,
  }
}
