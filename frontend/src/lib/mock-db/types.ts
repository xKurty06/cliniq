import type {
  AuditLogEntry,
  BackupLog,
  Disposition,
  FollowUp,
  HospitalReferral,
  Incident,
  InventoryItem,
  ISODate,
  ISODateTime,
  ParentNotificationAttempt,
  Report,
  Student,
  StudentNumber,
  User,
  UserRole,
  Visit,
} from '../../types/entities'

/**
 * Types for `mock-db.json` (the seed) and for the resolved in-memory store.
 *
 * The seed is the §5 entity shapes from `types/entities.ts` with exactly three kinds of change:
 * 1. Dates are relative to "today" (`{ daysAgo }` / `{ daysFromNow }`, plus `time` for timestamps),
 *    so the seed never goes stale. The data layer resolves them.
 * 2. Records point at students by `studentNumber` (ADR-005), not the internal `id`.
 * 3. Derived values are left out (`Student.recordComplete`, `Report.data`). Selectors compute them.
 * Everything else is the entity type itself, so a shape change in `types/entities.ts` breaks here.
 */

export type RelativeDate = { daysAgo: number } | { daysFromNow: number }
/** `time` is "HH:MM", Philippine time (UTC+8). */
export type RelativeDateTime = RelativeDate & { time: string }

type Replace<T, R> = Omit<T, keyof R> & R

export type SeedUser = Replace<User, { lastLogin: RelativeDateTime | null }>

export type SeedStudent = Omit<Student, 'recordComplete'>

export type SeedVisit = Omit<Replace<Visit, { dateTime: RelativeDateTime }>, 'studentId'> & {
  studentNumber: StudentNumber
}

export type SeedIncident = Omit<
  Replace<
    Incident,
    {
      time: RelativeDateTime
      hospitalReferral: Replace<HospitalReferral, { departureTime: RelativeDateTime }> | null
      parentNotifications: Array<Replace<ParentNotificationAttempt, { timestamp: RelativeDateTime }>>
    }
  >,
  'studentId'
> & { studentNumber: StudentNumber }

export type SeedFollowUp = Omit<Replace<FollowUp, { followUpDate: RelativeDate }>, 'studentId'> & {
  studentNumber: StudentNumber
}

export type SeedInventoryItem = Replace<InventoryItem, { expirationDate: RelativeDate | null }>

/** `data` is generated on read, so only the request (type + range) is stored. */
export type SeedReport = Omit<Report, 'data' | 'dateRange'> & {
  dateRange: { from: RelativeDate; to: RelativeDate }
}

export type SeedBackupLog = Replace<BackupLog, { lastRun: RelativeDateTime }>

export type SeedAuditLogEntry = Replace<AuditLogEntry, { timestamp: RelativeDateTime }>

/**
 * OPEN PRODUCT DECISIONS: thresholds and windows. None is defined in the requirements; the values
 * were carried over from the Dashboard mock. See ADR-014.
 */
export interface MockDbConfig {
  /** Visits within the window that raise the frequent-visitor warning. */
  frequentVisitorMinVisits: number
  /** Default window when a caller doesn't pass a date range (the Dashboard passes its own). */
  frequentVisitorWindowDays: number
  /** How many days ahead a pending follow-up counts as "upcoming". */
  upcomingFollowUpDays: number
  /** Days before the expiration date that an item counts as "nearing expiration". */
  expiryWarningDays: number
  /** Complaint count in one trend bucket that can count as a possible symptom cluster... */
  clusterMinCount: number
  /** ...when it's at least this multiple of that complaint's average in the other buckets. */
  clusterRatio: number
  /** How many top complaints the trend chart draws (the rest go in its table). */
  topComplaints: number
}

// ---- frontendOnly: MOCK-ONLY data that §5 doesn't define. Not a schema. ----------------------

export interface DevAccount {
  userId: string
  /** Dev-only, obviously fake. Never a real credential. */
  password: string
  /** Exercises the Force Password Change screen (#2). */
  mustChangePassword: boolean
}

export interface ComplaintType {
  label: string
  /** Smart Triage checklist (#27). Empty = no checklist for this complaint. Guidance only. */
  triageSteps: string[]
}

export type InventoryTransactionType = 'dispense' | 'restock'

/** Dispense/restock history (Module 8, stock flow steps 2 and 4). History only: never re-summed. */
export interface InventoryTransaction<D = ISODateTime> {
  id: string
  itemId: string
  type: InventoryTransactionType
  quantity: number
  timestamp: D
  userId: string
  studentNumber: StudentNumber | null
  visitId: string | null
}

/** Registrar-import review tracking for the Incomplete Records queue (#9). */
export interface RecordReview<D = ISODate, T = ISODateTime> {
  studentNumber: StudentNumber
  importedAt: D
  importedBy: string
  resolvedByUserId: string | null
  resolvedAt: T | null
}

export interface ExcuseLetterApproval<T = ISODateTime> {
  id: string
  visitId: string
  approvedByUserId: string
  approvedAt: T
}

export interface PeReferral<T = ISODateTime> {
  id: string
  studentNumber: StudentNumber
  referredByUserId: string
  activity: string
  injurySummary: string
  clinicalAssessment: string
  treatment: string
  disposition: Disposition
  createdAt: T
}

export interface IssueReport<T = ISODateTime> {
  id: string
  description: string
  route: string
  pageName: string
  role: UserRole
  reportedByUserId: string
  createdAt: T
}

export interface SeedFrontendOnly {
  _note: string
  devAccounts: DevAccount[]
  visitComplaintTypes: ComplaintType[]
  incidentComplaintTypes: string[]
  inventoryTransactions: Array<InventoryTransaction<RelativeDateTime>>
  recordReviews: Array<RecordReview<RelativeDate, RelativeDateTime>>
  excuseLetterApprovals: Array<ExcuseLetterApproval<RelativeDateTime>>
  peReferrals: Array<PeReferral<RelativeDateTime>>
  issueReports: Array<IssueReport<RelativeDateTime>>
}

export interface MockDbSeed {
  meta: Record<string, string>
  config: MockDbConfig & { _note?: string }
  users: SeedUser[]
  students: SeedStudent[]
  visits: SeedVisit[]
  incidents: SeedIncident[]
  followUps: SeedFollowUp[]
  inventoryItems: SeedInventoryItem[]
  reports: SeedReport[]
  backupLogs: SeedBackupLog[]
  auditLog: SeedAuditLogEntry[]
  frontendOnly: SeedFrontendOnly
}

// ---- Resolved store: absolute dates, internal ids, §5 shapes. --------------------------------

export interface FrontendOnlyState {
  devAccounts: DevAccount[]
  visitComplaintTypes: ComplaintType[]
  incidentComplaintTypes: string[]
  inventoryTransactions: InventoryTransaction[]
  recordReviews: RecordReview[]
  excuseLetterApprovals: ExcuseLetterApproval[]
  peReferrals: PeReferral[]
  issueReports: IssueReport[]
}

/** Raw records only. `Student` here never carries `recordComplete`; selectors add it on read. */
export interface DbState {
  today: ISODate
  config: MockDbConfig
  users: User[]
  students: SeedStudent[]
  visits: Visit[]
  incidents: Incident[]
  followUps: FollowUp[]
  inventoryItems: InventoryItem[]
  reports: Array<Omit<Report, 'data'>>
  backupLogs: BackupLog[]
  auditLog: AuditLogEntry[]
  frontendOnly: FrontendOnlyState
}
