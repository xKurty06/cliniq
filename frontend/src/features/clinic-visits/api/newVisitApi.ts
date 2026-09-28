import {
  getDemoStudent,
  getStudent,
  getVisitComplaintTypes,
  recordVisit,
  type ComplaintType,
  type SessionUser,
} from '../../../lib/mock-db'
import type { Disposition, FollowUp, Student, Visit } from '../../../types/entities'

export interface NewVisitContext {
  student: Student
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

/** `studentNumber` is the route's `?student=` pre-selection; without one a demo student is used. */
export async function fetchNewVisitContext(studentNumber?: string): Promise<NewVisitContext> {
  const [student, complaintTypes] = await Promise.all([
    studentNumber ? getStudent(studentNumber) : getDemoStudent(),
    getVisitComplaintTypes(),
  ])
  return { student, complaintTypes }
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
