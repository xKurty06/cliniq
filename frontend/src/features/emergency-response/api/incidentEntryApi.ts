import {
  completeIncidentStageTwo,
  getDemoStudent,
  getIncidentComplaintTypes,
  getStudent,
  saveIncidentStageOne,
  type SessionUser,
} from '../../../lib/mock-db'
import type {
  FollowUp,
  HospitalReferral,
  Incident,
  ParentNotificationAttempt,
  Student,
} from '../../../types/entities'

export interface IncidentEntryContext {
  student: Student
  /** Incident complaint options (mock-only vocabulary; see mock-db.json). */
  complaintTypes: string[]
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
  /** Attempts logged on this form; appended to the incident's notification log. */
  parentNotifications: ParentNotificationAttempt[]
  followUp: null | Pick<FollowUp, 'followUpDate' | 'reason' | 'notes'>
}

/** `studentNumber` is the route's `?student=` pre-selection; without one a demo student is used. */
export async function fetchIncidentEntryContext(studentNumber?: string): Promise<IncidentEntryContext> {
  const [student, complaintTypes] = await Promise.all([
    studentNumber ? getStudent(studentNumber) : getDemoStudent(),
    getIncidentComplaintTypes(),
  ])
  return { student, complaintTypes }
}

/** Stage 1 saves with only complaint + immediate vitals; the layer logs it as its own event. */
export function saveStageOneIncident(input: StageOneIncidentInput, user: SessionUser): Promise<Incident> {
  return saveIncidentStageOne(
    {
      studentId: input.studentId,
      complaint: input.complaint,
      vitals: { temperatureC: Number(input.temperatureC), pulseBpm: Number(input.pulseBpm) },
    },
    user,
  )
}

export function completeStageTwoIncident(
  input: StageTwoIncidentInput,
  user: SessionUser,
): Promise<{ incident: Incident; followUp: FollowUp | null }> {
  return completeIncidentStageTwo(
    {
      incidentId: input.incidentId,
      complaint: input.complaint,
      vitals: {
        temperatureC: Number(input.temperatureC),
        pulseBpm: Number(input.pulseBpm),
        bloodPressure: input.bloodPressure,
        oxygenSaturation: input.oxygenSaturation,
        treatmentNotes: input.treatmentNotes,
      },
      hospitalReferral: input.hospitalReferral,
      newParentNotifications: input.parentNotifications,
      followUp: input.followUp,
    },
    user,
  )
}
