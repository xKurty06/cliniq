import { recordMockAudit } from '../../../lib/mocks/audit'
import { getMockDataset } from '../../../lib/mocks/dataset'
import { todayISO } from '../../../lib/dates'
import type { Disposition, Student } from '../../../types/entities'

type MockMode = 'normal' | 'error' | 'slow'

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

function mockMode(): MockMode {
  if (typeof window === 'undefined') return 'normal'
  const mode = new URLSearchParams(window.location.search).get('mock')
  return mode === 'error' || mode === 'slow' ? mode : 'normal'
}

async function simulateLatency(mode: MockMode) {
  if (import.meta.env.MODE === 'test') return
  await new Promise((resolve) => setTimeout(resolve, mode === 'slow' ? 1200 : 200))
}

export async function fetchPeReferralContext(): Promise<PeReferralContext> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock PE referral failure')

  const dataset = getMockDataset(todayISO())
  const student = dataset.students.find((candidate) => !candidate.archived && candidate.recordComplete)
  if (!student) throw new Error('No mock student available')

  return {
    student,
    referredBy: 'PE Instructor',
    activity: 'Physical Education class',
  }
}

export async function submitPeReferral(values: PeReferralValues, student: Student): Promise<void> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock PE referral submit failure')

  recordMockAudit({
    userId: 'usr-nurse',
    actionType: 'submit',
    targetRecord: { type: 'pe-sports-referral', id: `pe-ref-${student.id}` },
    timestamp: new Date().toISOString(),
  })

  if (values.disposition === 'referred_to_hospital') {
    recordMockAudit({
      userId: 'usr-nurse',
      actionType: 'create',
      targetRecord: { type: 'incident-escalation', id: `inc-from-pe-${student.id}` },
      timestamp: new Date().toISOString(),
    })
  }
}
