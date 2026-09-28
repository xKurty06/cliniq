import { isRelativeDate, isRelativeDateTime } from './relativeDates'
import type { MockDbSeed } from './types'

/**
 * Integrity rules for `mock-db.json`. Returns one readable message per problem (empty = healthy).
 * Run by `integrity.test.ts`, and by the store on load so a bad hand-edit fails loudly.
 *
 * Checks: exact field sets per record (catches typos AND stored derived values), readable unique
 * ids, Student Number format/uniqueness (ADR-005), every cross-record reference, enum values, and
 * relative-date syntax. No validation library on purpose (ADR-014): plain functions + Vitest.
 */

export const STUDENT_NUMBER = /^\d{4}-\d{5}$/

const FIELDS = {
  top: ['meta', 'config', 'users', 'students', 'visits', 'incidents', 'followUps', 'inventoryItems', 'reports', 'backupLogs', 'auditLog', 'frontendOnly'],
  config: ['_note', 'frequentVisitorMinVisits', 'frequentVisitorWindowDays', 'upcomingFollowUpDays', 'expiryWarningDays', 'clusterMinCount', 'clusterRatio', 'topComplaints'],
  users: ['id', 'name', 'username', 'role', 'lastLogin'],
  students: ['id', 'studentNumber', 'fullName', 'gradeLevel', 'contactInfo', 'allergies', 'medicalConditions', 'emergencyContact', 'archived'],
  emergencyContact: ['name', 'relationship', 'phone', 'verified'],
  visits: ['id', 'studentNumber', 'dateTime', 'complaint', 'treatment', 'disposition', 'loggedByUserId', 'eventTag'],
  incidents: ['id', 'studentNumber', 'time', 'complaint', 'vitals', 'hospitalReferral', 'parentNotifications', 'stage', 'eventTag'],
  hospitalReferral: ['destination', 'transportMode', 'departureTime'],
  parentNotification: ['outcome', 'timestamp'],
  followUps: ['id', 'studentNumber', 'relatedRecord', 'followUpDate', 'reason', 'status', 'notes', 'createdByUserId'],
  inventoryItems: ['id', 'name', 'category', 'currentStock', 'unit', 'expirationDate', 'lowStockThreshold'],
  reports: ['type', 'dateRange'],
  backupLogs: ['lastRun', 'fileSizeBytes', 'status', 'verifiedByUserId'],
  auditLog: ['userId', 'actionType', 'targetRecord', 'timestamp'],
  frontendOnly: ['_note', 'devAccounts', 'visitComplaintTypes', 'incidentComplaintTypes', 'inventoryTransactions', 'recordReviews', 'excuseLetterApprovals', 'peReferrals'],
} as const

/**
 * Values a selector computes. Named here so the failure message says *why* the field is rejected,
 * not just that it's unexpected.
 */
const DERIVED_FIELDS = new Set([
  'recordComplete', 'missingFields', 'incomplete', 'isIncomplete',
  'visitCount', 'visitsCount', 'isFrequentVisitor', 'frequentVisitor',
  'dueState', 'isOverdue', 'overdue', 'isDueToday', 'isUpcoming', 'daysFromToday',
  'flags', 'isLowStock', 'lowStock', 'nearingExpiration', 'isExpired', 'expired', 'daysUntilExpiry', 'belowZero',
  'total', 'totals', 'count', 'counts', 'data', 'needsVerification', 'backupStatus',
])

const ENUMS = {
  role: ['staff', 'admin', 'instructor'],
  disposition: ['returned_to_class', 'sent_home', 'referred_to_hospital'],
  stage: [1, 2],
  followUpStatus: ['pending', 'completed', 'missed', 'cancelled'],
  relatedType: ['visit', 'incident'],
  category: ['medicine', 'supply'],
  reportType: ['monthly', 'incident', 'health_summary'],
  backupStatus: ['ok', 'failed'],
  actionType: ['login', 'logout', 'scan', 'submit', 'approve', 'create', 'update', 'delete', 'archive'],
  outcome: ['reached', 'not_reached', 'voicemail', 'left_message'],
  transactionType: ['dispense', 'restock'],
} as const

const ID_PATTERNS: Record<string, RegExp> = {
  users: /^user-(staff|admin|instructor)-\d{2}$/,
  students: /^student-\d{4}$/,
  visits: /^visit-\d{4}$/,
  incidents: /^incident-\d{4}$/,
  followUps: /^followup-\d{4}$/,
  inventoryItems: /^item-\d{4}$/,
}

type Rec = Record<string, unknown>

export function checkSeedIntegrity(seed: MockDbSeed): string[] {
  const problems: string[] = []
  const fail = (message: string) => problems.push(message)
  const s = seed as unknown as Rec

  const checkFields = (where: string, record: unknown, allowed: readonly string[]) => {
    if (!record || typeof record !== 'object') return fail(`${where}: expected an object`)
    const keys = Object.keys(record)
    for (const key of keys) {
      if (DERIVED_FIELDS.has(key))
        fail(`${where}: "${key}" is a derived value. Selectors compute it; don't store it in the JSON.`)
      else if (!allowed.includes(key)) fail(`${where}: unexpected field "${key}"`)
    }
    for (const key of allowed) if (!key.startsWith('_') && !keys.includes(key)) fail(`${where}: missing field "${key}"`)
  }
  const oneOf = (where: string, value: unknown, allowed: readonly unknown[]) => {
    if (!allowed.includes(value)) fail(`${where}: "${String(value)}" is not one of ${allowed.join(', ')}`)
  }
  const relDate = (where: string, value: unknown, nullable = false) => {
    if (nullable && value === null) return
    if (!isRelativeDate(value) || 'time' in (value as object))
      fail(`${where}: expected {"daysAgo": n} or {"daysFromNow": n}`)
  }
  const relDateTime = (where: string, value: unknown, nullable = false) => {
    if (nullable && value === null) return
    if (!isRelativeDateTime(value)) fail(`${where}: expected {"daysAgo"|"daysFromNow": n, "time": "HH:MM"}`)
  }
  const list = (key: string): Rec[] => (Array.isArray(s[key]) ? (s[key] as Rec[]) : [])

  checkFields('top level', s, FIELDS.top)
  checkFields('config', s.config, FIELDS.config)
  for (const [key, value] of Object.entries((s.config ?? {}) as Rec))
    if (!key.startsWith('_') && !(typeof value === 'number' && value > 0)) fail(`config.${key}: must be a positive number`)
  if (!/synthetic/i.test(String((s.meta as Rec | undefined)?.notice ?? '')))
    fail('meta.notice: must state that the data is synthetic (RA 10173; public repository)')

  // Unique, readable ids.
  const ids: Record<string, Set<string>> = {}
  for (const [collection, pattern] of Object.entries(ID_PATTERNS)) {
    ids[collection] = new Set()
    for (const record of list(collection)) {
      const id = String(record.id)
      if (!pattern.test(id)) fail(`${collection}: id "${id}" doesn't match ${pattern}`)
      if (ids[collection].has(id)) fail(`${collection}: duplicate id "${id}"`)
      ids[collection].add(id)
    }
  }
  const userRole = new Map(list('users').map((u) => [String(u.id), u.role]))
  const userRef = (where: string, id: unknown, nullable = false) => {
    if (nullable && id === null) return
    if (!userRole.has(String(id))) fail(`${where}: user "${String(id)}" doesn't exist`)
  }

  // Users.
  list('users').forEach((u, i) => {
    const w = `users[${i}] (${String(u.id)})`
    checkFields(w, u, FIELDS.users)
    oneOf(`${w}.role`, u.role, ENUMS.role)
    relDateTime(`${w}.lastLogin`, u.lastLogin, true)
  })
  for (const role of ENUMS.role)
    if (![...userRole.values()].includes(role)) fail(`users: need at least one "${role}" account`)
  const usernames = list('users').map((u) => u.username)
  if (new Set(usernames).size !== usernames.length) fail('users: duplicate username')

  // Students.
  const numbers = new Set<string>()
  list('students').forEach((st, i) => {
    const w = `students[${i}] (${String(st.id)})`
    checkFields(w, st, FIELDS.students)
    const number = String(st.studentNumber)
    if (!STUDENT_NUMBER.test(number)) fail(`${w}.studentNumber: "${number}" isn't YYYY-NNNNN (ADR-005)`)
    else if (Number(number.slice(5)) === 0) fail(`${w}.studentNumber: sequence 00000 is invalid`)
    if (numbers.has(number)) fail(`${w}.studentNumber: duplicate "${number}"`)
    numbers.add(number)
    if (!Array.isArray(st.allergies) || !Array.isArray(st.medicalConditions))
      fail(`${w}: allergies and medicalConditions must be arrays`)
    if (st.emergencyContact !== null) checkFields(`${w}.emergencyContact`, st.emergencyContact, FIELDS.emergencyContact)
    if (typeof st.archived !== 'boolean') fail(`${w}.archived: must be true or false`)
  })
  const studentRef = (where: string, number: unknown, nullable = false) => {
    if (nullable && number === null) return
    if (!numbers.has(String(number))) fail(`${where}: Student Number "${String(number)}" doesn't exist`)
  }

  // Complaint vocabularies (frontendOnly) that visit/incident complaints must come from.
  const fo = (s.frontendOnly ?? {}) as Rec
  const visitComplaints = new Set(((fo.visitComplaintTypes ?? []) as Rec[]).map((c) => String(c.label)))
  const incidentComplaints = new Set((fo.incidentComplaintTypes ?? []) as string[])

  // Visits.
  const visitStudent = new Map<string, string>()
  list('visits').forEach((v, i) => {
    const w = `visits[${i}] (${String(v.id)})`
    checkFields(w, v, FIELDS.visits)
    studentRef(`${w}.studentNumber`, v.studentNumber)
    relDateTime(`${w}.dateTime`, v.dateTime)
    oneOf(`${w}.disposition`, v.disposition, ENUMS.disposition)
    userRef(`${w}.loggedByUserId`, v.loggedByUserId)
    if (userRole.has(String(v.loggedByUserId)) && userRole.get(String(v.loggedByUserId)) !== 'staff')
      fail(`${w}.loggedByUserId: only Staff log visits`)
    if (!visitComplaints.has(String(v.complaint))) fail(`${w}.complaint: "${String(v.complaint)}" isn't in frontendOnly.visitComplaintTypes`)
    visitStudent.set(String(v.id), String(v.studentNumber))
  })

  // Incidents.
  const incidentStudent = new Map<string, string>()
  list('incidents').forEach((inc, i) => {
    const w = `incidents[${i}] (${String(inc.id)})`
    checkFields(w, inc, FIELDS.incidents)
    studentRef(`${w}.studentNumber`, inc.studentNumber)
    relDateTime(`${w}.time`, inc.time)
    oneOf(`${w}.stage`, inc.stage, ENUMS.stage)
    if (!incidentComplaints.has(String(inc.complaint))) fail(`${w}.complaint: "${String(inc.complaint)}" isn't in frontendOnly.incidentComplaintTypes`)
    if (!inc.vitals || typeof inc.vitals !== 'object') fail(`${w}.vitals: must be an object`)
    else
      for (const [key, value] of Object.entries(inc.vitals as Rec)) {
        if (DERIVED_FIELDS.has(key)) fail(`${w}.vitals.${key}: "${key}" is a derived value`)
        if (typeof value !== 'string' && typeof value !== 'number') fail(`${w}.vitals.${key}: must be text or a number`)
      }
    if (inc.hospitalReferral !== null) {
      checkFields(`${w}.hospitalReferral`, inc.hospitalReferral, FIELDS.hospitalReferral)
      relDateTime(`${w}.hospitalReferral.departureTime`, (inc.hospitalReferral as Rec)?.departureTime)
    }
    ;((inc.parentNotifications ?? []) as Rec[]).forEach((n, k) => {
      checkFields(`${w}.parentNotifications[${k}]`, n, FIELDS.parentNotification)
      oneOf(`${w}.parentNotifications[${k}].outcome`, n.outcome, ENUMS.outcome)
      relDateTime(`${w}.parentNotifications[${k}].timestamp`, n.timestamp)
    })
    incidentStudent.set(String(inc.id), String(inc.studentNumber))
  })

  // Follow-ups: must point at a real visit/incident belonging to the same student.
  list('followUps').forEach((f, i) => {
    const w = `followUps[${i}] (${String(f.id)})`
    checkFields(w, f, FIELDS.followUps)
    studentRef(`${w}.studentNumber`, f.studentNumber)
    relDate(`${w}.followUpDate`, f.followUpDate)
    oneOf(`${w}.status`, f.status, ENUMS.followUpStatus)
    userRef(`${w}.createdByUserId`, f.createdByUserId)
    const related = (f.relatedRecord ?? {}) as Rec
    checkFields(`${w}.relatedRecord`, related, ['type', 'id'])
    oneOf(`${w}.relatedRecord.type`, related.type, ENUMS.relatedType)
    const owners = related.type === 'incident' ? incidentStudent : visitStudent
    const owner = owners.get(String(related.id))
    if (!owner) fail(`${w}.relatedRecord: ${String(related.type)} "${String(related.id)}" doesn't exist`)
    else if (owner !== f.studentNumber)
      fail(`${w}: student ${String(f.studentNumber)} doesn't match its ${String(related.type)}'s student ${owner}`)
  })

  // Inventory.
  list('inventoryItems').forEach((item, i) => {
    const w = `inventoryItems[${i}] (${String(item.id)})`
    checkFields(w, item, FIELDS.inventoryItems)
    oneOf(`${w}.category`, item.category, ENUMS.category)
    if (!Number.isInteger(item.currentStock)) fail(`${w}.currentStock: must be a whole number`)
    if (!Number.isInteger(item.lowStockThreshold) || (item.lowStockThreshold as number) < 0)
      fail(`${w}.lowStockThreshold: must be a whole number ≥ 0`)
    relDate(`${w}.expirationDate`, item.expirationDate, true)
  })

  list('reports').forEach((r, i) => {
    checkFields(`reports[${i}]`, r, FIELDS.reports)
    oneOf(`reports[${i}].type`, r.type, ENUMS.reportType)
    relDate(`reports[${i}].dateRange.from`, (r.dateRange as Rec | undefined)?.from)
    relDate(`reports[${i}].dateRange.to`, (r.dateRange as Rec | undefined)?.to)
  })

  list('backupLogs').forEach((b, i) => {
    const w = `backupLogs[${i}]`
    checkFields(w, b, FIELDS.backupLogs)
    relDateTime(`${w}.lastRun`, b.lastRun)
    oneOf(`${w}.status`, b.status, ENUMS.backupStatus)
    userRef(`${w}.verifiedByUserId`, b.verifiedByUserId, true)
  })

  list('auditLog').forEach((a, i) => {
    const w = `auditLog[${i}]`
    checkFields(w, a, FIELDS.auditLog)
    userRef(`${w}.userId`, a.userId)
    oneOf(`${w}.actionType`, a.actionType, ENUMS.actionType)
    relDateTime(`${w}.timestamp`, a.timestamp)
  })

  // frontendOnly (mock-only data; still referentially sound).
  checkFields('frontendOnly', fo, FIELDS.frontendOnly)
  const accounts = (fo.devAccounts ?? []) as Rec[]
  accounts.forEach((d, i) => userRef(`frontendOnly.devAccounts[${i}].userId`, d.userId))
  if (!accounts.some((d) => d.mustChangePassword === true))
    fail('frontendOnly.devAccounts: need one account with mustChangePassword: true (Force Password Change, #2)')
  if (accounts.some((d) => !/dev-only/i.test(String(d.password))))
    fail('frontendOnly.devAccounts: passwords must be obviously fake (contain "dev-only")')
  ;((fo.inventoryTransactions ?? []) as Rec[]).forEach((t, i) => {
    const w = `frontendOnly.inventoryTransactions[${i}]`
    if (!ids.inventoryItems?.has(String(t.itemId))) fail(`${w}.itemId: "${String(t.itemId)}" doesn't exist`)
    oneOf(`${w}.type`, t.type, ENUMS.transactionType)
    userRef(`${w}.userId`, t.userId)
    studentRef(`${w}.studentNumber`, t.studentNumber, true)
    if (t.visitId !== null && !visitStudent.has(String(t.visitId))) fail(`${w}.visitId: "${String(t.visitId)}" doesn't exist`)
    relDateTime(`${w}.timestamp`, t.timestamp)
  })
  ;((fo.recordReviews ?? []) as Rec[]).forEach((r, i) => {
    const w = `frontendOnly.recordReviews[${i}]`
    studentRef(`${w}.studentNumber`, r.studentNumber)
    relDate(`${w}.importedAt`, r.importedAt)
    userRef(`${w}.resolvedByUserId`, r.resolvedByUserId, true)
    relDateTime(`${w}.resolvedAt`, r.resolvedAt, true)
  })
  ;((fo.excuseLetterApprovals ?? []) as Rec[]).forEach((a, i) => {
    const w = `frontendOnly.excuseLetterApprovals[${i}]`
    if (!visitStudent.has(String(a.visitId))) fail(`${w}.visitId: "${String(a.visitId)}" doesn't exist`)
    userRef(`${w}.approvedByUserId`, a.approvedByUserId)
    relDateTime(`${w}.approvedAt`, a.approvedAt)
  })
  ;((fo.peReferrals ?? []) as Rec[]).forEach((p, i) => {
    const w = `frontendOnly.peReferrals[${i}]`
    studentRef(`${w}.studentNumber`, p.studentNumber)
    userRef(`${w}.referredByUserId`, p.referredByUserId)
    oneOf(`${w}.disposition`, p.disposition, ENUMS.disposition)
    relDateTime(`${w}.createdAt`, p.createdAt)
  })

  return problems
}
