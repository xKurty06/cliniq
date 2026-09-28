import { addDays, isWithin, todayISO } from '../../../lib/dates'
import { getMockDataset } from '../../../lib/mocks/dataset'
import type { ISODate, ISODateTime } from '../../../types/entities'

type MockMode = 'normal' | 'error' | 'slow'

export type IncidentCompletion = 'needs_completion' | 'complete'

export interface IncidentLogQuery {
  from: ISODate
  to: ISODate
  search: string
  completion: IncidentCompletion | 'all'
}

export interface IncidentLogRow {
  id: string
  studentNumber: string
  gradeLevel: string
  time: ISODateTime
  complaint: string
  completion: IncidentCompletion
  eventTag: string | null
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

export function defaultIncidentLogRange(today = todayISO()): { from: ISODate; to: ISODate } {
  return { from: addDays(today, -30), to: today }
}

export async function fetchIncidentLog(query: IncidentLogQuery): Promise<IncidentLogRow[]> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock incident log failure')

  const dataset = getMockDataset(todayISO())
  const studentsById = new Map(dataset.students.map((student) => [student.id, student]))
  const search = query.search.trim().toLowerCase()

  return dataset.incidents
    .filter((incident) => isWithin(incident.time.slice(0, 10), query.from, query.to))
    .map((incident) => {
      const student = studentsById.get(incident.studentId)
      if (!student) return null
      const completion: IncidentCompletion = incident.stage === 1 ? 'needs_completion' : 'complete'
      return {
        id: incident.id,
        studentNumber: student.studentNumber,
        gradeLevel: student.gradeLevel,
        time: incident.time,
        complaint: incident.complaint,
        completion,
        eventTag: incident.eventTag,
      }
    })
    .filter((row): row is IncidentLogRow => Boolean(row))
    .filter((row) => query.completion === 'all' || row.completion === query.completion)
    .filter((row) => {
      if (!search) return true
      return (
        row.studentNumber.toLowerCase().includes(search) ||
        row.gradeLevel.toLowerCase().includes(search) ||
        row.complaint.toLowerCase().includes(search) ||
        (row.eventTag?.toLowerCase().includes(search) ?? false)
      )
    })
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 120)
}
