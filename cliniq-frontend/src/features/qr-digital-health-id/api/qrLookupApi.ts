import { recordMockAudit } from '../../../lib/mocks/audit'
import { getMockDataset } from '../../../lib/mocks/dataset'
import { todayISO } from '../../../lib/dates'
import type { Incident, Student, StudentNumber, Visit } from '../../../types/entities'
import type { SessionUser } from '../../../lib/mock-db'

type MockMode = 'normal' | 'error' | 'slow'

export interface QrLookupResult {
  student: Student
  visits: Visit[]
  incidents: Incident[]
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

export function demoStudentNumber(): StudentNumber {
  return getMockDataset(todayISO()).students.find((student) => !student.archived)?.studentNumber ?? '2026-00001'
}

export async function lookupStudentByNumber(
  studentNumber: StudentNumber,
  user: SessionUser,
): Promise<QrLookupResult> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock QR lookup failure')

  const dataset = getMockDataset(todayISO())
  const student = dataset.students.find((item) => item.studentNumber === studentNumber)
  if (!student) throw new Error('Student not found')

  recordMockAudit({
    userId: user.id,
    actionType: 'scan',
    targetRecord: { type: 'student', id: student.id },
    timestamp: new Date().toISOString(),
  })

  return {
    student,
    visits: dataset.visits
      .filter((visit) => visit.studentId === student.id)
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
      .slice(0, 4),
    incidents: dataset.incidents
      .filter((incident) => incident.studentId === student.id)
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 4),
  }
}
