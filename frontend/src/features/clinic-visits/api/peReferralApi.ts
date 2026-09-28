import {
  getDemoStudent,
  listUsers,
  submitPeReferral as submitToLayer,
  type SessionUser,
} from '../../../lib/mock-db'
import type { Disposition, Student } from '../../../types/entities'

export interface PeReferralContext {
  student: Student
  referredBy: string
  activity: string
}

export interface PeReferralValues {
  referredBy: string
  activity: string
  injurySummary: string
  clinicalAssessment: string
  treatment: string
  disposition: Disposition
}

export async function fetchPeReferralContext(): Promise<PeReferralContext> {
  const [student, users] = await Promise.all([getDemoStudent(), listUsers()])
  const instructor = users.find((user) => user.role === 'instructor')
  return {
    student,
    referredBy: instructor?.name ?? '',
    activity: 'Physical Education class',
  }
}

/**
 * Stores the referral (a mock-only record: §5 has no PE referral entity yet, see ADR-014). The
 * referring instructor is linked when the name matches a known account. The data layer writes the
 * submission audit entry, plus an escalation entry when the student is referred to hospital.
 */
export async function submitPeReferral(
  values: PeReferralValues,
  student: Student,
  actor?: SessionUser,
): Promise<void> {
  const users = await listUsers()
  const referrer = users.find(
    (user) => user.name.toLowerCase() === values.referredBy.trim().toLowerCase(),
  )
  await submitToLayer(
    {
      studentNumber: student.studentNumber,
      referredByUserId: referrer?.id,
      activity: values.activity,
      injurySummary: values.injurySummary,
      clinicalAssessment: values.clinicalAssessment,
      treatment: values.treatment,
      disposition: values.disposition,
    },
    actor,
  )
}
