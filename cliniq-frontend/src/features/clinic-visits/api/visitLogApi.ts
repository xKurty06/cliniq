import { addDays, isWithin, todayISO } from '../../../lib/dates'
import { getMockDataset } from '../../../lib/mocks/dataset'
import type { Disposition, ISODate, ISODateTime } from '../../../types/entities'

type MockMode = 'normal' | 'error' | 'slow'

export interface VisitLogQuery {
  from: ISODate
  to: ISODate
  search: string
  disposition: Disposition | 'all'
}

export interface VisitLogRow {
  id: string
  studentNumber: string
  gradeLevel: string
  dateTime: ISODateTime
  disposition: Disposition
  eventTag: string | null
  loggedBy: string
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

export function defaultVisitLogRange(today = todayISO()): { from: ISODate; to: ISODate } {
  return { from: addDays(today, -30), to: today }
}

export async function fetchVisitLog(query: VisitLogQuery): Promise<VisitLogRow[]> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock visit log failure')

  const dataset = getMockDataset(todayISO())
  const studentsById = new Map(dataset.students.map((student) => [student.id, student]))
  const search = query.search.trim().toLowerCase()

  return dataset.visits
    .filter((visit) => isWithin(visit.dateTime.slice(0, 10), query.from, query.to))
    .filter((visit) => query.disposition === 'all' || visit.disposition === query.disposition)
    .map((visit) => {
      const student = studentsById.get(visit.studentId)
      return student
        ? {
            id: visit.id,
            studentNumber: student.studentNumber,
            gradeLevel: student.gradeLevel,
            dateTime: visit.dateTime,
            disposition: visit.disposition,
            eventTag: visit.eventTag,
            loggedBy: 'Staff Nurse',
          }
        : null
    })
    .filter((row): row is VisitLogRow => Boolean(row))
    .filter((row) => {
      if (!search) return true
      return (
        row.studentNumber.toLowerCase().includes(search) ||
        row.gradeLevel.toLowerCase().includes(search) ||
        (row.eventTag?.toLowerCase().includes(search) ?? false)
      )
    })
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
    .slice(0, 120)
}
