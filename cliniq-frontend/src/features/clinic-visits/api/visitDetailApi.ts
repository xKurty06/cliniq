import { recordMockAudit } from '../../../lib/mocks/audit'
import { getMockDataset } from '../../../lib/mocks/dataset'
import { todayISO } from '../../../lib/dates'
import type { Disposition, ISODateTime, Student } from '../../../types/entities'

type MockMode = 'normal' | 'error' | 'slow'

export interface VisitDetail {
  id: string
  student: Student
  dateTime: ISODateTime
  complaint: string
  treatment: string
  disposition: Disposition
  eventTag: string
  loggedBy: string
}

export interface VisitDetailValues {
  complaint: string
  treatment: string
  disposition: Disposition
  eventTag: string
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

export function valuesFromVisit(visit: VisitDetail): VisitDetailValues {
  return {
    complaint: visit.complaint,
    treatment: visit.treatment,
    disposition: visit.disposition,
    eventTag: visit.eventTag,
  }
}

export async function fetchVisitDetail(): Promise<VisitDetail> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock visit detail failure')

  const dataset = getMockDataset(todayISO())
  const visit = [...dataset.visits].reverse().find((candidate) => {
    const student = dataset.students.find((item) => item.id === candidate.studentId)
    return student && !student.archived
  })
  if (!visit) throw new Error('No mock visit available')

  const student = dataset.students.find((item) => item.id === visit.studentId)
  if (!student) throw new Error('Mock visit has no student')

  return {
    id: visit.id,
    student,
    dateTime: visit.dateTime,
    complaint: visit.complaint,
    treatment: visit.treatment,
    disposition: visit.disposition,
    eventTag: visit.eventTag ?? '',
    loggedBy: 'Staff Nurse',
  }
}

export async function updateVisitDetail(
  visit: VisitDetail,
  values: VisitDetailValues,
): Promise<VisitDetail> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock visit update failure')

  recordMockAudit({
    userId: 'usr-nurse',
    actionType: 'update',
    targetRecord: { type: 'visit', id: visit.id },
    timestamp: new Date().toISOString(),
  })

  return {
    ...visit,
    complaint: values.complaint.trim(),
    treatment: values.treatment.trim(),
    disposition: values.disposition,
    eventTag: values.eventTag.trim(),
  }
}
