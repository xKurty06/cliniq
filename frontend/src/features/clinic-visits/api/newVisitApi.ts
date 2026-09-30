import {
  getStudent,
  getVisitComplaintTypes,
  recordVisit,
  type ComplaintType,
  type SessionUser,
} from '../../../lib/mock-db'
import type { Disposition, FollowUp, Student, Visit } from '../../../types/entities'

export interface NewVisitContext {
  /** `null` when the form was opened without an identified student; it then asks for the Student Number. */
  student: Student | null
  /** Complaint options + their Smart Triage checklists (mock-only content; see mock-db.json). */
  complaintTypes: ComplaintType[]
}

export interface NewVisitInput {
  studentId: string
  complaint: string
  treatment: string
  disposition: Disposition
  triageStepsCompleted: string[]
  followUp: null | Pick<FollowUp, 'followUpDate' | 'reason' | 'notes'>
}

export interface NewVisitResult {
  visit: Visit
  followUp: FollowUp | null
}

/** `studentNumber` is the route's `?student=` pre-selection; without one no student is attached. */
export async function fetchNewVisitContext(studentNumber?: string): Promise<NewVisitContext> {
  const [student, complaintTypes] = await Promise.all([
    studentNumber ? getStudent(studentNumber) : Promise.resolve(null),
    getVisitComplaintTypes(),
  ])
  return { student, complaintTypes }
}

/** Resolves the Student Number typed on the form when the student wasn't identified beforehand. */
export function findVisitStudent(studentNumber: string): Promise<Student> {
  return getStudent(studentNumber)
}

/**
 * Saves the visit and its optional follow-up in one flow. The data layer writes both audit entries.
 * `triageStepsCompleted` has no field in the §5 Visit shape yet, so it isn't persisted (ADR-014).
 */
export function submitNewVisit(input: NewVisitInput, user: SessionUser): Promise<NewVisitResult> {
  return recordVisit(
    {
      studentId: input.studentId,
      complaint: input.complaint,
      treatment: input.treatment,
      disposition: input.disposition,
      followUp: input.followUp,
    },
    user,
  )
}
