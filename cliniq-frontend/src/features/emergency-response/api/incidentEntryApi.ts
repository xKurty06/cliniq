import { recordMockAudit } from '../../../lib/mocks/audit'
import { getMockDataset } from '../../../lib/mocks/dataset'
import { todayISO } from '../../../lib/dates'
import type {
  FollowUp,
  HospitalReferral,
  Incident,
  ParentNotificationAttempt,
  Student,
} from '../../../types/entities'
import type { SessionUser } from '../../../lib/mock-db'

type MockMode = 'normal' | 'error' | 'slow'

export interface IncidentEntryContext {
  student: Student
}

export interface StageOneIncidentInput {
  studentId: string
  complaint: string
  temperatureC: string
  pulseBpm: string
}

export interface StageTwoIncidentInput {
  incidentId: string
  studentId: string
  complaint: string
  temperatureC: string
  pulseBpm: string
  bloodPressure: string
  oxygenSaturation: string
  treatmentNotes: string
  hospitalReferral: HospitalReferral | null
  parentNotifications: ParentNotificationAttempt[]
  followUp: null | Pick<FollowUp, 'followUpDate' | 'reason' | 'notes'>
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

export async function fetchIncidentEntryContext(studentNumber?: string): Promise<IncidentEntryContext> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock incident context failure')
  const dataset = getMockDataset(todayISO())
  // `studentNumber` is the route's `?student=` pre-selection; without one a demo student is used.
  const student = studentNumber
    ? dataset.students.find((s) => s.studentNumber === studentNumber)
    : defaultStudent()
  if (!student) throw new Error('Student not found')
  return { student }
}

export async function saveStageOneIncident(
  input: StageOneIncidentInput,
  user: SessionUser,
): Promise<Incident> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock incident Stage 1 failure')

  const incident: Incident = {
    id: `mock-incident-${Date.now()}`,
    studentId: input.studentId,
    time: new Date().toISOString(),
    complaint: input.complaint,
    vitals: {
      temperatureC: Number(input.temperatureC),
      pulseBpm: Number(input.pulseBpm),
    },
    hospitalReferral: null,
    parentNotifications: [],
    stage: 1,
    eventTag: null,
  }

  recordMockAudit({
    userId: user.id,
    actionType: 'submit',
    targetRecord: { type: 'incident-stage-1', id: incident.id },
    timestamp: new Date().toISOString(),
  })

  return incident
}

export async function completeStageTwoIncident(
  input: StageTwoIncidentInput,
  user: SessionUser,
): Promise<{ incident: Incident; followUp: FollowUp | null }> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock incident Stage 2 failure')

  const incident: Incident = {
    id: input.incidentId,
    studentId: input.studentId,
    time: new Date().toISOString(),
    complaint: input.complaint,
    vitals: {
      temperatureC: Number(input.temperatureC),
      pulseBpm: Number(input.pulseBpm),
      bloodPressure: input.bloodPressure,
      oxygenSaturation: input.oxygenSaturation,
      treatmentNotes: input.treatmentNotes,
    },
    hospitalReferral: input.hospitalReferral,
    parentNotifications: input.parentNotifications,
    stage: 2,
    eventTag: null,
  }

  const followUp: FollowUp | null = input.followUp
    ? {
        id: `mock-incident-follow-up-${Date.now()}`,
        studentId: input.studentId,
        relatedRecord: { type: 'incident', id: incident.id },
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
    actionType: 'update',
    targetRecord: { type: 'incident-stage-2', id: incident.id },
    timestamp,
  })
  for (const [index] of input.parentNotifications.entries()) {
    recordMockAudit({
      userId: user.id,
      actionType: 'create',
      targetRecord: { type: 'parent-notification', id: `${incident.id}-${index + 1}` },
      timestamp,
    })
  }
  if (followUp) {
    recordMockAudit({
      userId: user.id,
      actionType: 'create',
      targetRecord: { type: 'follow-up', id: followUp.id },
      timestamp,
    })
  }

  return { incident, followUp }
}
