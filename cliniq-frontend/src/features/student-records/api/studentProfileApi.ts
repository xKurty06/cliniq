import { todayISO } from '../../../lib/dates'
import { getMockDataset } from '../../../lib/mocks/dataset'
import type { Incident, Student, Visit } from '../../../types/entities'

/**
 * Student Profile data access (Screen #7 / Reference 3).
 *
 * MOCK: resolves from the shared dataset while Phase F1 is frontend-first. This is a read-only
 * profile fetch, so no audit-log write is needed for Staff; Instructor profile views will be
 * logged once the authenticated QR lookup flow and backend endpoints exist.
 */

type MockMode = 'normal' | 'error' | 'slow' | 'empty-history'

export interface StudentProfileData {
  student: Student
  visits: Visit[]
  incidents: Incident[]
}

function mockMode(): MockMode {
  if (typeof window === 'undefined') return 'normal'
  const mode = new URLSearchParams(window.location.search).get('mock')
  return mode === 'error' || mode === 'slow' || mode === 'empty-history' ? mode : 'normal'
}

async function simulateLatency(mode: MockMode) {
  if (import.meta.env.MODE === 'test') return
  await new Promise((resolve) => setTimeout(resolve, mode === 'slow' ? 2500 : 250))
}

function defaultStudentId(): string {
  const dataset = getMockDataset(todayISO())
  const visitIds = new Set(dataset.visits.map((v) => v.studentId))
  const incidentIds = new Set(dataset.incidents.map((i) => i.studentId))
  const candidate = dataset.students.find(
    (s) => !s.archived && visitIds.has(s.id) && incidentIds.has(s.id),
  )
  return candidate?.id ?? dataset.students.find((s) => !s.archived)?.id ?? dataset.students[0].id
}

/** `studentNumber` comes from the `/students/:studentNumber` route; omitted, a demo student is used. */
export async function fetchStudentProfile(studentNumber?: string): Promise<StudentProfileData> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock student profile failure')

  const dataset = getMockDataset(todayISO())
  const student = studentNumber
    ? dataset.students.find((s) => s.studentNumber === studentNumber)
    : dataset.students.find((s) => s.id === defaultStudentId())
  if (!student) throw new Error('Student not found')
  const visits =
    mode === 'empty-history'
      ? []
      : dataset.visits
          .filter((v) => v.studentId === student.id)
          .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
          .slice(0, 8)
  const incidents =
    mode === 'empty-history'
      ? []
      : dataset.incidents
          .filter((i) => i.studentId === student.id)
          .sort((a, b) => b.time.localeCompare(a.time))
          .slice(0, 8)

  return { student, visits, incidents }
}
