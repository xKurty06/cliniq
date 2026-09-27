import { recordMockAudit } from '../../../lib/mocks/audit'
import { getMockDataset } from '../../../lib/mocks/dataset'
import { todayISO } from '../../../lib/dates'
import type { Disposition, FollowUp, Student, Visit } from '../../../types/entities'
import type { SessionUser } from '../../../lib/mocks/session'

type MockMode = 'normal' | 'error' | 'slow'

export interface NewVisitContext {
  student: Student
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

function mockMode(): MockMode {
  if (typeof window === 'undefined') return 'normal'
  const mode = new URLSearchParams(window.location.search).get('mock')
  return mode === 'error' || mode === 'slow' ? mode : 'normal'
}

async function simulateLatency(mode: MockMode) {
  if (import.meta.env.MODE === 'test') return
  await new Promise((resolve) => setTimeout(resolve, mode === 'slow' ? 1800 : 250))
}

function defaultStudent(): Student {
  const dataset = getMockDataset(todayISO())
  return dataset.students.find((s) => !s.archived && s.recordComplete) ?? dataset.students[0]
}

export async function fetchNewVisitContext(studentId?: string): Promise<NewVisitContext> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock visit context failure')
  const dataset = getMockDataset(todayISO())
  const student = dataset.students.find((s) => s.id === studentId) ?? defaultStudent()
  return { student }
}

export async function submitNewVisit(input: NewVisitInput, user: SessionUser): Promise<NewVisitResult> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock visit submit failure')

  const visit: Visit = {
    id: `mock-visit-${Date.now()}`,
    studentId: input.studentId,
    dateTime: new Date().toISOString(),
    complaint: input.complaint,
    treatment: input.treatment,
    disposition: input.disposition,
    loggedByUserId: user.id,
    eventTag: null,
  }
  const followUp: FollowUp | null = input.followUp
    ? {
        id: `mock-follow-up-${Date.now()}`,
        studentId: input.studentId,
        relatedRecord: { type: 'visit', id: visit.id },
        followUpDate: input.followUp.followUpDate,
        reason: input.followUp.reason,
        status: 'pending',
        notes: input.followUp.notes,
        createdByUserId: user.id,
      }
    : null

  const timestamp = new Date().toISOString()
  recordMockAudit({
    userId: user.id,
    actionType: 'submit',
    targetRecord: { type: 'visit', id: visit.id },
    timestamp,
  })
  if (followUp) {
    recordMockAudit({
      userId: user.id,
      actionType: 'create',
      targetRecord: { type: 'follow-up', id: followUp.id },
      timestamp,
    })
  }

  return { visit, followUp }
}
