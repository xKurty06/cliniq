import type {
  AuditActionType,
  AuditLogEntry,
  Disposition,
  FollowUp,
  FollowUpStatus,
  HospitalReferral,
  Incident,
  InventoryCategory,
  InventoryItem,
  ISODate,
  ISODateTime,
  ParentNotificationAttempt,
  ParentNotificationOutcome,
  Report,
  ReportType,
  Student,
  StudentNumber,
  User,
  UserRole,
  Visit,
} from '../../types/entities'
import type { CalendarDay, DashboardQuery, DashboardSummary } from '../../types/dashboard'
import type { FollowUpDueState } from '../../components/status/followUp'
import { buildCalendarDays, buildDashboardSummary } from './dashboard'
import { isEmptied, simulateRequest } from './devToggles'
import {
  backupStatus,
  dateOf,
  followUpDueState,
  gradeLevels,
  incompleteRecordQueue,
  inventoryStatusFor,
  monthlyCounts,
  nextStudentNumber,
  studentsById,
  toStudent,
  type BackupStatus,
  type IncompleteRecordRow,
  type InventoryStatus,
} from './selectors'
import { clearMockSession, getMockSessionUser, type SessionUser } from './session'
import { commit, db } from './store'
import type {
  ComplaintType,
  DbState,
  ExcuseLetterApproval,
  PeReferral,
  SeedStudent,
} from './types'

/**
 * THE DATA-ACCESS LAYER. Every screen reads and writes CLINIQ data through these functions (via
 * its feature `api/` module). They're async on purpose: when the Laravel API lands (Phase B9),
 * this file is what gets replaced with HTTP calls, and nothing above it has to change.
 *
 * - Reads return copies, with derived values computed by `selectors.ts` on every call.
 * - Writes update the in-memory store (seeded from `mock-db.json`) and append to the audit log in
 *   the same call (`.claude/skills/cliniq-audit-trail/`).
 * - Latency and the error/empty preview switches live in `devToggles.ts`.
 */

// ---- plumbing ------------------------------------------------------------------------------

/** A read-only view of the store with any `?mock=empty` / `?mockEmpty=` collections emptied. */
function view(): DbState {
  const s = db()
  return {
    ...s,
    users: isEmptied('users') ? [] : s.users,
    students: isEmptied('students') ? [] : s.students,
    visits: isEmptied('visits') ? [] : s.visits,
    incidents: isEmptied('incidents') ? [] : s.incidents,
    followUps: isEmptied('followUps') ? [] : s.followUps,
    inventoryItems: isEmptied('inventoryItems') ? [] : s.inventoryItems,
    reports: isEmptied('reports') ? [] : s.reports,
    backupLogs: isEmptied('backupLogs') ? [] : s.backupLogs,
    auditLog: isEmptied('auditLog') ? [] : s.auditLog,
  }
}

async function read<T>(label: string, select: (state: DbState) => T): Promise<T> {
  await simulateRequest(label)
  return structuredClone(select(view()))
}

async function write<T>(label: string, mutate: (state: DbState) => T): Promise<T> {
  await simulateRequest(label)
  const result = mutate(db())
  commit()
  return structuredClone(result)
}

class NotFoundError extends Error {}

function must<T>(value: T | undefined | null, what: string): T {
  if (value === undefined || value === null) throw new NotFoundError(`${what} not found`)
  return value
}

/**
 * "Now" on the store's today, at the current wall-clock time, in Philippine time. Anchoring to the
 * store's today (not `toISOString()`, which is UTC) keeps a record written at 7 a.m. from landing on
 * yesterday's date, and keeps writes consistent with a pinned test "today".
 */
function now(state: DbState): ISODateTime {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${state.today}T${hh}:${mm}:${ss}+08:00`
}

/** Next readable id in a collection, e.g. "visit-0160". */
function nextId(prefix: string, existing: Array<{ id: string }>): string {
  const max = existing.reduce((m, r) => {
    const n = Number(r.id.slice(prefix.length + 1))
    return r.id.startsWith(`${prefix}-`) && Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}

/** User ids follow the seed's "user-<role>-NN" pattern. */
function nextUserId(state: DbState, role: UserRole): string {
  for (let n = 1; ; n++) {
    const id = `user-${role}-${String(n).padStart(2, '0')}`
    if (!state.users.some((u) => u.id === id)) return id
  }
}

function audit(
  state: DbState,
  actor: SessionUser,
  actionType: AuditActionType,
  targetRecord: AuditLogEntry['targetRecord'],
) {
  state.auditLog.push({ userId: actor.id, actionType, targetRecord, timestamp: now(state) })
}

function actorOr(actor?: SessionUser): SessionUser {
  return actor ?? getMockSessionUser()
}

/**
 * Development stand-in for Sanctum's logout endpoint. It keeps logout accountable even while the
 * frontend uses the mock session, then clears the selected mock role from this browser tab.
 */
export async function logoutMockSession(actor: SessionUser): Promise<void> {
  await write('logout', (s) => {
    audit(s, actor, 'logout', null)
  })
  clearMockSession()
}

// ---- authentication (frontend-first mock only) --------------------------------------------

export interface MockAuthResult {
  user: SessionUser
  mustChangePassword: boolean
}

export type MockAuthFailure = 'invalid_credentials' | 'locked'

export class MockAuthError extends Error {
  readonly reason: MockAuthFailure
  readonly lockedUntil?: number

  constructor(reason: MockAuthFailure, lockedUntil?: number) {
    super(reason)
    this.reason = reason
    this.lockedUntil = lockedUntil
  }
}

interface LoginAttemptState {
  failures: number
  lockedUntil: number | null
}

const loginAttempts = new Map<string, LoginAttemptState>()
const passwordHistory = new Map<string, string[]>()
const changedPasswordUsers = new Set<string>()

/** Test/demo reset for the frontend-only authentication state. The backend will own this later. */
export function resetMockAuth() {
  loginAttempts.clear()
  passwordHistory.clear()
  changedPasswordUsers.clear()
}

function attemptFor(username: string): LoginAttemptState {
  const current = loginAttempts.get(username)
  if (current) return current
  const created = { failures: 0, lockedUntil: null }
  loginAttempts.set(username, created)
  return created
}

function fakePasswordHistory(state: DbState, userId: string): string[] {
  const existing = passwordHistory.get(userId)
  if (existing) return existing
  const current = state.frontendOnly.devAccounts.find((account) => account.userId === userId)?.password
  const history = current ? [current] : []
  passwordHistory.set(userId, history)
  return history
}

/**
 * Development stand-in for the future Sanctum login endpoint. It intentionally never returns a
 * password or token. Lockout and password history live in memory until the real backend exists.
 */
export async function authenticateMockUser(username: string, password: string): Promise<MockAuthResult> {
  await simulateRequest('login')
  const normalized = username.trim().toLowerCase()
  const attempt = attemptFor(normalized)
  if (attempt.lockedUntil && attempt.lockedUntil > Date.now()) {
    throw new MockAuthError('locked', attempt.lockedUntil)
  }
  if (attempt.lockedUntil && attempt.lockedUntil <= Date.now()) {
    attempt.failures = 0
    attempt.lockedUntil = null
  }

  const state = view()
  const user = state.users.find((candidate) => candidate.username.toLowerCase() === normalized)
  const account = user && state.frontendOnly.devAccounts.find((candidate) => candidate.userId === user.id)
  const currentPassword = account ? fakePasswordHistory(state, user.id)[0] : null
  if (!user || !account || currentPassword !== password) {
    attempt.failures += 1
    if (attempt.failures >= 5) {
      attempt.failures = 0
      attempt.lockedUntil = Date.now() + 30 * 60 * 1000
      throw new MockAuthError('locked', attempt.lockedUntil)
    }
    throw new MockAuthError('invalid_credentials')
  }

  attempt.failures = 0
  attempt.lockedUntil = null
  const actor = { id: user.id, name: user.name, role: user.role }
  await write('login', (current) => {
    audit(current, actor, 'login', { type: 'user', id: user.id })
    return actor
  })
  return {
    user: actor,
    mustChangePassword: Boolean(account.mustChangePassword && !changedPasswordUsers.has(user.id)),
  }
}

export async function changeMockPassword(userId: string, nextPassword: string): Promise<void> {
  const trimmed = nextPassword.trim()
  await write('change password', (state) => {
    const user = must(state.users.find((candidate) => candidate.id === userId), 'User')
    must(
      state.frontendOnly.devAccounts.find((candidate) => candidate.userId === userId),
      'Development account',
    )
    const history = fakePasswordHistory(state, userId)
    if (trimmed.length < 8) throw new Error('Password must be at least 8 characters.')
    if (history.includes(trimmed)) throw new Error('Choose a password that was not used recently.')
    passwordHistory.set(userId, [trimmed, ...history].slice(0, 5))
    changedPasswordUsers.add(userId)
    audit(state, { id: user.id, name: user.name, role: user.role }, 'update', {
      type: 'user',
      id: userId,
    })
  })
}

function userName(state: DbState, id: string | null): string | null {
  if (!id) return null
  return state.users.find((u) => u.id === id)?.name ?? 'Unknown user'
}

function studentOf(state: DbState, studentId: string): SeedStudent {
  return must(studentsById(state).get(studentId), 'Student')
}

// ---- reference vocabularies (frontendOnly, mock-only) ---------------------------------------

export function getVisitComplaintTypes(): Promise<ComplaintType[]> {
  return read('visit complaint types', (s) => s.frontendOnly.visitComplaintTypes)
}

export function getIncidentComplaintTypes(): Promise<string[]> {
  return read('incident complaint types', (s) => s.frontendOnly.incidentComplaintTypes)
}

export function getGradeLevels(): Promise<string[]> {
  return read('grade levels', gradeLevels)
}

// ---- users ---------------------------------------------------------------------------------

export function listUsers(): Promise<User[]> {
  return read('users', (s) => [...s.users].sort((a, b) => a.name.localeCompare(b.name)))
}

export function getUser(id: string): Promise<User> {
  return read('user', (s) => must(s.users.find((u) => u.id === id), 'User'))
}

export interface UserInput {
  name: string
  username: string
  role: UserRole
}

export function saveUser(input: UserInput, options: { userId?: string; actor?: SessionUser } = {}): Promise<User> {
  return write('save user', (s) => {
    const existing = options.userId ? must(s.users.find((u) => u.id === options.userId), 'User') : null
    const user: User = existing
      ? Object.assign(existing, { name: input.name.trim(), username: input.username.trim(), role: input.role })
      : {
          id: nextUserId(s, input.role),
          name: input.name.trim(),
          username: input.username.trim(),
          role: input.role,
          lastLogin: null,
        }
    if (!existing) s.users.push(user)
    audit(s, actorOr(options.actor), existing ? 'update' : 'create', { type: 'user', id: user.id })
    return user
  })
}

// ---- students ------------------------------------------------------------------------------

export interface StudentQuery {
  search?: string
  gradeLevel?: string
  includeArchived?: boolean
  limit?: number
}

export function listStudents(query: StudentQuery = {}): Promise<Student[]> {
  return read('students', (s) => {
    const search = query.search?.trim().toLowerCase() ?? ''
    return s.students
      .filter((st) => query.includeArchived || !st.archived)
      .filter((st) => !query.gradeLevel || st.gradeLevel === query.gradeLevel)
      .filter(
        (st) =>
          !search || st.fullName.toLowerCase().includes(search) || st.studentNumber.toLowerCase().includes(search),
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .slice(0, query.limit ?? Infinity)
      .map(toStudent)
  })
}

export function getStudent(studentNumber: StudentNumber): Promise<Student> {
  return read('student', (s) =>
    toStudent(must(s.students.find((st) => st.studentNumber === studentNumber), 'Student')),
  )
}

export function getStudentById(id: string): Promise<Student> {
  return read('student', (s) => toStudent(studentOf(s, id)))
}

/**
 * A default student for screens opened without one (demo convenience until real navigation always
 * supplies a Student Number): the first active, complete record, preferring one with history.
 */
export function getDemoStudent(options: { withHistory?: boolean } = {}): Promise<Student> {
  return read('demo student', (s) => {
    const active = s.students.filter((st) => !st.archived).map(toStudent)
    const complete = active.filter((st) => st.recordComplete)
    const withHistory = complete.find(
      (st) => s.visits.some((v) => v.studentId === st.id) && s.incidents.some((i) => i.studentId === st.id),
    )
    return must((options.withHistory && withHistory) || complete[0] || active[0], 'Student')
  })
}

export interface StudentHistory {
  visits: Visit[]
  incidents: Incident[]
}

export function getStudentHistory(studentId: string, limit = 8): Promise<StudentHistory> {
  return read('student history', (s) => ({
    visits: s.visits
      .filter((v) => v.studentId === studentId)
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
      .slice(0, limit),
    incidents: s.incidents
      .filter((i) => i.studentId === studentId)
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, limit),
  }))
}

export function getNextStudentNumber(): Promise<StudentNumber> {
  return read('next student number', nextStudentNumber)
}

export type StudentInput = Pick<
  Student,
  'fullName' | 'gradeLevel' | 'contactInfo' | 'allergies' | 'medicalConditions' | 'emergencyContact'
>

export interface DuplicateMatch {
  id: string
  fullName: string
  studentNumber: StudentNumber
  gradeLevel: string
}

export type SaveStudentResult =
  | { status: 'duplicate'; matches: DuplicateMatch[] }
  | { status: 'saved'; student: Student; action: 'create' | 'update' }

/**
 * Create or update a student. On create, a name + grade-level match against an active record blocks
 * the save until `confirmDuplicate` is passed (Frontend Context Brief §6, duplicate detection).
 */
export function saveStudent(
  input: StudentInput,
  options: { studentId?: string; confirmDuplicate?: boolean; actor?: SessionUser } = {},
): Promise<SaveStudentResult> {
  return write('save student', (s): SaveStudentResult => {
    const name = input.fullName.trim().toLowerCase()
    const matches = s.students
      .filter((st) => st.id !== options.studentId && !st.archived)
      .filter((st) => st.fullName.trim().toLowerCase() === name && st.gradeLevel === input.gradeLevel)
      .map((st) => ({ id: st.id, fullName: st.fullName, studentNumber: st.studentNumber, gradeLevel: st.gradeLevel }))
    if (!options.studentId && matches.length && !options.confirmDuplicate) return { status: 'duplicate', matches }

    const existing = options.studentId ? studentOf(s, options.studentId) : null
    const fields = {
      fullName: input.fullName.trim(),
      gradeLevel: input.gradeLevel,
      contactInfo: input.contactInfo.trim(),
      allergies: input.allergies,
      medicalConditions: input.medicalConditions,
      emergencyContact: input.emergencyContact,
    }
    let record: SeedStudent
    if (existing) record = Object.assign(existing, fields)
    else {
      record = { id: nextId('student', s.students), studentNumber: nextStudentNumber(s), archived: false, ...fields }
      s.students.push(record)
    }
    const action = existing ? 'update' : 'create'
    audit(s, actorOr(options.actor), action, { type: 'student', id: record.id })
    return { status: 'saved', student: toStudent(record), action }
  })
}

/** Archive, never delete (data retention policy): hidden from active lists, kept for 5 years. */
export function archiveStudent(studentNumber: StudentNumber, actor?: SessionUser): Promise<Student> {
  return write('archive student', (s) => {
    const record = must(s.students.find((st) => st.studentNumber === studentNumber), 'Student')
    record.archived = true
    audit(s, actorOr(actor), 'archive', { type: 'student', id: record.id })
    return toStudent(record)
  })
}

export type IncompleteRecord = IncompleteRecordRow & { resolvedByName: string | null }

export function getIncompleteRecordQueue(): Promise<IncompleteRecord[]> {
  return read('incomplete records', (s) =>
    incompleteRecordQueue(s).map((row) => ({ ...row, resolvedByName: userName(s, row.review?.resolvedByUserId ?? null) })),
  )
}

/** Staff marks a flagged record resolved; who resolved it is recorded (Module 2). */
export function resolveIncompleteRecord(studentNumber: StudentNumber, actor?: SessionUser): Promise<IncompleteRecord> {
  return write('resolve incomplete record', (s) => {
    const by = actorOr(actor)
    const student = must(s.students.find((st) => st.studentNumber === studentNumber), 'Student')
    let review = s.frontendOnly.recordReviews.find((r) => r.studentNumber === studentNumber)
    if (!review) {
      review = { studentNumber, importedAt: s.today, importedBy: 'Flagged in CLINIQ', resolvedByUserId: null, resolvedAt: null }
      s.frontendOnly.recordReviews.push(review)
    }
    review.resolvedByUserId = by.id
    review.resolvedAt = now(s)
    audit(s, by, 'approve', { type: 'student', id: student.id })
    const row = must(incompleteRecordQueue(s).find((r) => r.student.studentNumber === studentNumber), 'Record')
    return { ...row, resolvedByName: userName(s, by.id) }
  })
}

// ---- visits --------------------------------------------------------------------------------

export function listVisits(range?: { from: ISODate; to: ISODate }): Promise<Visit[]> {
  return read('visits', (s) =>
    s.visits
      .filter((v) => !range || (dateOf(v.dateTime) >= range.from && dateOf(v.dateTime) <= range.to))
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime)),
  )
}

export function getVisit(id: string): Promise<Visit> {
  return read('visit', (s) => must(s.visits.find((v) => v.id === id), 'Visit'))
}

/** The most recent visit by an active student (default for detail screens opened without an id). */
export function getLatestVisit(): Promise<Visit> {
  return read('latest visit', (s) => {
    const byId = studentsById(s)
    const sorted = [...s.visits].sort((a, b) => b.dateTime.localeCompare(a.dateTime))
    return must(sorted.find((v) => !byId.get(v.studentId)?.archived), 'Visit')
  })
}

export type FollowUpInput = Pick<FollowUp, 'followUpDate' | 'reason' | 'notes'>

export interface RecordVisitInput {
  studentId: string
  complaint: string
  treatment: string
  disposition: Disposition
  eventTag?: string | null
  followUp: FollowUpInput | null
}

function createFollowUp(
  s: DbState,
  actor: SessionUser,
  studentId: string,
  related: FollowUp['relatedRecord'],
  input: FollowUpInput,
): FollowUp {
  const followUp: FollowUp = {
    id: nextId('followup', s.followUps),
    studentId,
    relatedRecord: related,
    followUpDate: input.followUpDate,
    reason: input.reason,
    status: 'pending',
    notes: input.notes,
    createdByUserId: actor.id,
  }
  s.followUps.push(followUp)
  audit(s, actor, 'create', { type: 'follow-up', id: followUp.id })
  return followUp
}

/** Saves a visit and, if requested, its follow-up together: one flow (Activity Diagram 3). */
export function recordVisit(
  input: RecordVisitInput,
  actor?: SessionUser,
): Promise<{ visit: Visit; followUp: FollowUp | null }> {
  return write('record visit', (s) => {
    const by = actorOr(actor)
    studentOf(s, input.studentId)
    const visit: Visit = {
      id: nextId('visit', s.visits),
      studentId: input.studentId,
      dateTime: now(s),
      complaint: input.complaint,
      treatment: input.treatment,
      disposition: input.disposition,
      loggedByUserId: by.id,
      eventTag: input.eventTag?.trim() || null,
    }
    s.visits.push(visit)
    audit(s, by, 'submit', { type: 'visit', id: visit.id })
    const followUp = input.followUp
      ? createFollowUp(s, by, input.studentId, { type: 'visit', id: visit.id }, input.followUp)
      : null
    return { visit, followUp }
  })
}

export function updateVisit(
  id: string,
  patch: Pick<Visit, 'complaint' | 'treatment' | 'disposition' | 'eventTag'>,
  actor?: SessionUser,
): Promise<Visit> {
  return write('update visit', (s) => {
    const visit = must(s.visits.find((v) => v.id === id), 'Visit')
    Object.assign(visit, patch)
    audit(s, actorOr(actor), 'update', { type: 'visit', id })
    return visit
  })
}

// ---- excuse letters & PE referrals (frontendOnly) ------------------------------------------

export function getExcuseLetterApproval(visitId: string): Promise<ExcuseLetterApproval | null> {
  return read('excuse letter', (s) => s.frontendOnly.excuseLetterApprovals.find((a) => a.visitId === visitId) ?? null)
}

export function approveExcuseLetter(visitId: string, actor?: SessionUser): Promise<ExcuseLetterApproval> {
  return write('approve excuse letter', (s) => {
    const by = actorOr(actor)
    must(s.visits.find((v) => v.id === visitId), 'Visit')
    const approval: ExcuseLetterApproval = { id: `excuse-${visitId}`, visitId, approvedByUserId: by.id, approvedAt: now(s) }
    s.frontendOnly.excuseLetterApprovals = [
      ...s.frontendOnly.excuseLetterApprovals.filter((a) => a.visitId !== visitId),
      approval,
    ]
    audit(s, by, 'approve', { type: 'excuse-letter', id: approval.id })
    return approval
  })
}

export type PeReferralInput = Omit<PeReferral, 'id' | 'referredByUserId' | 'createdAt'> & {
  referredByUserId?: string
}

export function submitPeReferral(input: PeReferralInput, actor?: SessionUser): Promise<PeReferral> {
  return write('submit PE referral', (s) => {
    const by = actorOr(actor)
    must(s.students.find((st) => st.studentNumber === input.studentNumber), 'Student')
    const referral: PeReferral = {
      ...input,
      id: nextId('pe-referral', s.frontendOnly.peReferrals),
      referredByUserId: input.referredByUserId ?? by.id,
      createdAt: now(s),
    }
    s.frontendOnly.peReferrals.push(referral)
    audit(s, by, 'submit', { type: 'pe-sports-referral', id: referral.id })
    if (input.disposition === 'referred_to_hospital')
      audit(s, by, 'create', { type: 'incident-escalation', id: referral.id })
    return referral
  })
}

// ---- incidents -------------------------------------------------------------------------------

export function listIncidents(range?: { from: ISODate; to: ISODate }): Promise<Incident[]> {
  return read('incidents', (s) =>
    s.incidents
      .filter((i) => !range || (dateOf(i.time) >= range.from && dateOf(i.time) <= range.to))
      .sort((a, b) => b.time.localeCompare(a.time)),
  )
}

export function getIncident(id: string): Promise<Incident> {
  return read('incident', (s) => must(s.incidents.find((i) => i.id === id), 'Incident'))
}

export interface StageOneInput {
  studentId: string
  complaint: string
  vitals: Incident['vitals']
}

/** Stage 1 fast capture: saves with only complaint + immediate vitals (Activity Diagram 2). */
export function saveIncidentStageOne(input: StageOneInput, actor?: SessionUser): Promise<Incident> {
  return write('save incident stage 1', (s) => {
    const by = actorOr(actor)
    studentOf(s, input.studentId)
    const incident: Incident = {
      id: nextId('incident', s.incidents),
      studentId: input.studentId,
      time: now(s),
      complaint: input.complaint,
      vitals: input.vitals,
      hospitalReferral: null,
      parentNotifications: [],
      stage: 1,
      eventTag: null,
    }
    s.incidents.push(incident)
    audit(s, by, 'submit', { type: 'incident-stage-1', id: incident.id })
    return incident
  })
}

export interface StageTwoInput {
  incidentId: string
  complaint: string
  vitals: Incident['vitals']
  hospitalReferral: HospitalReferral | null
  /** Attempts logged while completing Stage 2 (appended to the incident's log). */
  newParentNotifications: ParentNotificationAttempt[]
  followUp: FollowUpInput | null
}

/** Stage 2 completion: same record, now complete. Logged separately from Stage 1. */
export function completeIncidentStageTwo(
  input: StageTwoInput,
  actor?: SessionUser,
): Promise<{ incident: Incident; followUp: FollowUp | null }> {
  return write('complete incident stage 2', (s) => {
    const by = actorOr(actor)
    const incident = must(s.incidents.find((i) => i.id === input.incidentId), 'Incident')
    Object.assign(incident, {
      complaint: input.complaint,
      vitals: input.vitals,
      hospitalReferral: input.hospitalReferral,
      stage: 2 as const,
    })
    audit(s, by, 'update', { type: 'incident-stage-2', id: incident.id })
    for (const attempt of input.newParentNotifications) {
      incident.parentNotifications.push(attempt)
      audit(s, by, 'create', {
        type: 'parent-notification',
        id: `${incident.id}-${incident.parentNotifications.length}`,
      })
    }
    const followUp = input.followUp
      ? createFollowUp(s, by, incident.studentId, { type: 'incident', id: incident.id }, input.followUp)
      : null
    return { incident, followUp }
  })
}

export function addParentNotification(
  incidentId: string,
  outcome: ParentNotificationOutcome,
  actor?: SessionUser,
): Promise<ParentNotificationAttempt> {
  return write('add parent notification', (s) => {
    const incident = must(s.incidents.find((i) => i.id === incidentId), 'Incident')
    const attempt: ParentNotificationAttempt = { outcome, timestamp: now(s) }
    incident.parentNotifications.push(attempt)
    audit(s, actorOr(actor), 'create', {
      type: 'parent-notification',
      id: `${incident.id}-${incident.parentNotifications.length}`,
    })
    return attempt
  })
}

export function approveIncidentReport(incidentId: string, actor?: SessionUser): Promise<void> {
  return write('approve incident report', (s) => {
    must(s.incidents.find((i) => i.id === incidentId), 'Incident')
    audit(s, actorOr(actor), 'approve', { type: 'incident-report', id: incidentId })
  })
}

// ---- follow-ups ------------------------------------------------------------------------------

export type FollowUpView = FollowUp & { studentNumber: StudentNumber; dueState: FollowUpDueState | null }

export function listFollowUps(query: { status?: FollowUpStatus | '' } = {}): Promise<FollowUpView[]> {
  return read('follow-ups', (s) => {
    const byId = studentsById(s)
    return s.followUps
      .filter((f) => !query.status || f.status === query.status)
      .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
      .map((f) => ({
        ...f,
        studentNumber: byId.get(f.studentId)?.studentNumber ?? 'Unknown student',
        dueState: followUpDueState(f, s.today),
      }))
  })
}

export function setFollowUpStatus(id: string, status: FollowUpStatus, actor?: SessionUser): Promise<FollowUp> {
  return write('update follow-up', (s) => {
    const followUp = must(s.followUps.find((f) => f.id === id), 'Follow-up')
    followUp.status = status
    audit(s, actorOr(actor), 'update', { type: 'follow-up', id })
    return followUp
  })
}

// ---- inventory -------------------------------------------------------------------------------

export type InventoryItemView = InventoryItem & InventoryStatus

export function listInventory(query: { search?: string; category?: InventoryCategory | '' } = {}): Promise<InventoryItemView[]> {
  return read('inventory', (s) => {
    const search = query.search?.trim().toLowerCase() ?? ''
    return s.inventoryItems
      .filter((i) => !search || i.name.toLowerCase().includes(search))
      .filter((i) => !query.category || i.category === query.category)
      .map((i) => ({ ...i, ...inventoryStatusFor(s, i) }))
  })
}

export function getInventoryItem(id: string): Promise<InventoryItemView> {
  return read('inventory item', (s) => {
    const item = must(s.inventoryItems.find((i) => i.id === id), 'Inventory item')
    return { ...item, ...inventoryStatusFor(s, item) }
  })
}

export type InventoryInput = Omit<InventoryItem, 'id'>

export function saveInventoryItem(input: InventoryInput, options: { itemId?: string; actor?: SessionUser } = {}): Promise<InventoryItem> {
  return write('save inventory item', (s) => {
    const existing = options.itemId ? must(s.inventoryItems.find((i) => i.id === options.itemId), 'Inventory item') : null
    const item = existing ? Object.assign(existing, input) : { id: nextId('item', s.inventoryItems), ...input }
    if (!existing) s.inventoryItems.push(item)
    audit(s, actorOr(options.actor), existing ? 'update' : 'create', { type: 'inventory', id: item.id })
    return item
  })
}

export interface DispenseResult {
  item: InventoryItemView
  remainingStock: number
  /** Module 8: dispensing below zero warns but never blocks recording that care was given. */
  belowZero: boolean
}

export function dispenseInventoryItem(
  itemId: string,
  quantity: number,
  link: { studentNumber?: StudentNumber; visitId?: string } = {},
  actor?: SessionUser,
): Promise<DispenseResult> {
  return write('dispense', (s) => {
    const by = actorOr(actor)
    const item = must(s.inventoryItems.find((i) => i.id === itemId), 'Inventory item')
    item.currentStock -= quantity
    const txn = {
      id: nextId('txn', s.frontendOnly.inventoryTransactions),
      itemId,
      type: 'dispense' as const,
      quantity,
      timestamp: now(s),
      userId: by.id,
      studentNumber: link.studentNumber ?? null,
      visitId: link.visitId ?? null,
    }
    s.frontendOnly.inventoryTransactions.push(txn)
    audit(s, by, 'submit', { type: 'inventory-dispensation', id: txn.id })
    const status = inventoryStatusFor(s, item)
    return { item: { ...item, ...status }, remainingStock: item.currentStock, belowZero: status.belowZero }
  })
}

/** Restock (Module 8, stock flow step 4): increments stock and confirms the expiration date. */
export function restockInventoryItem(
  itemId: string,
  quantity: number,
  expirationDate: ISODate | null,
  actor?: SessionUser,
): Promise<InventoryItemView> {
  return write('restock', (s) => {
    const by = actorOr(actor)
    const item = must(s.inventoryItems.find((i) => i.id === itemId), 'Inventory item')
    item.currentStock += quantity
    item.expirationDate = expirationDate
    const id = nextId('txn', s.frontendOnly.inventoryTransactions)
    s.frontendOnly.inventoryTransactions.push({
      id, itemId, type: 'restock', quantity, timestamp: now(s), userId: by.id, studentNumber: null, visitId: null,
    })
    audit(s, by, 'submit', { type: 'inventory-restock', id })
    return { ...item, ...inventoryStatusFor(s, item) }
  })
}

// ---- reports ---------------------------------------------------------------------------------

export interface ComplaintCount {
  complaint: string
  count: number
}

export interface MonthlyReportData {
  month: string
  counts: { visits: number; incidents: number; followUps: number }
  /** Incident archive rows carry the Student Number only (multi-student list, ADR-004). */
  incidents: Array<Incident & { studentNumber: StudentNumber }>
  /** Visits per complaint, most frequent first (ties alphabetical, so the order is stable). */
  complaintCounts: ComplaintCount[]
}

function complaintCounts(visits: Visit[]): ComplaintCount[] {
  const counts = new Map<string, number>()
  for (const v of visits) counts.set(v.complaint, (counts.get(v.complaint) ?? 0) + 1)
  return [...counts]
    .map(([complaint, count]) => ({ complaint, count }))
    .sort((a, b) => b.count - a.count || a.complaint.localeCompare(b.complaint))
}

/** `month` is "YYYY-MM". Everything is generated from raw records on each call. */
export function getMonthlyReport(month: string): Promise<MonthlyReportData> {
  return read('monthly report', (s) => {
    const byId = studentsById(s)
    return {
      month,
      counts: monthlyCounts(s, month),
      incidents: s.incidents
        .filter((i) => i.time.startsWith(month))
        .sort((a, b) => a.time.localeCompare(b.time))
        .map((i) => ({ ...i, studentNumber: byId.get(i.studentId)?.studentNumber ?? 'Unknown student' })),
      complaintCounts: complaintCounts(s.visits.filter((v) => v.dateTime.startsWith(month))),
    }
  })
}

/** Previously generated reports, with `data` regenerated from current records (never stored). */
export function listReports(): Promise<Report[]> {
  return read('reports', (s) =>
    s.reports.map((r) => ({ ...r, data: reportData(s, r.type, r.dateRange) })),
  )
}

function reportData(s: DbState, type: ReportType, range: { from: ISODate; to: ISODate }) {
  const inRange = (d: string) => d >= range.from && d <= range.to
  const visits = s.visits.filter((v) => inRange(dateOf(v.dateTime)))
  const incidents = s.incidents.filter((i) => inRange(dateOf(i.time)))
  if (type === 'incident') return { incidents: incidents.length }
  if (type === 'health_summary') return { complaintCounts: complaintCounts(visits) }
  return { visits: visits.length, incidents: incidents.length }
}

// ---- backups -------------------------------------------------------------------------------

export type BackupStatusView = BackupStatus & { verifiedByName: string | null }

export function getBackupStatus(): Promise<BackupStatusView> {
  return read('backup status', (s) => {
    const status = backupStatus(s)
    return { ...status, verifiedByName: userName(s, status.latest?.verifiedByUserId ?? null) }
  })
}

/** Staff confirms the latest backup file exists and looks right (Backup Verification #32). */
export function verifyLatestBackup(actor?: SessionUser): Promise<BackupStatusView> {
  return write('verify backup', (s) => {
    const by = actorOr(actor)
    const latest = must(backupStatus(s).latest, 'Backup')
    const record = must(s.backupLogs.find((b) => b.lastRun === latest.lastRun), 'Backup')
    record.verifiedByUserId = by.id
    audit(s, by, 'update', { type: 'backup', id: record.lastRun })
    return { ...backupStatus(s), verifiedByName: userName(s, by.id) }
  })
}

// ---- dashboard -----------------------------------------------------------------------------

export function getDashboardSummary(query: DashboardQuery): Promise<DashboardSummary> {
  return read('dashboard summary', (s) => buildDashboardSummary(s, query, new Date().toISOString()))
}

export function getCalendarDays(from: ISODate, to: ISODate): Promise<CalendarDay[]> {
  return read('calendar', (s) => buildCalendarDays(s, from, to))
}

// ---- QR lookup & audit ---------------------------------------------------------------------

/** A QR scan (or manual Student Number entry) is itself audited: who looked up whom, when. */
export function lookupStudentByScan(
  studentNumber: StudentNumber,
  actor?: SessionUser,
): Promise<{ student: Student } & StudentHistory> {
  return write('QR lookup', (s) => {
    const student = must(view().students.find((st) => st.studentNumber === studentNumber), 'Student')
    audit(s, actorOr(actor), 'scan', { type: 'student', id: student.id })
    const history = (list: Array<{ studentId: string }>) => list.filter((r) => r.studentId === student.id)
    const v = view()
    return {
      student: toStudent(student),
      visits: (history(v.visits) as Visit[]).sort((a, b) => b.dateTime.localeCompare(a.dateTime)).slice(0, 4),
      incidents: (history(v.incidents) as Incident[]).sort((a, b) => b.time.localeCompare(a.time)).slice(0, 4),
    }
  })
}

export function getAuditLog(): Promise<AuditLogEntry[]> {
  return read('audit log', (s) => [...s.auditLog].sort((a, b) => b.timestamp.localeCompare(a.timestamp)))
}
