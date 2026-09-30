import { listStudents, listUsers, listVisits } from '../../../lib/mock-db'
import { todayISO } from '../../../lib/dates'
import { rangeForPreset } from '../../../lib/dateRange'
import type { Disposition, ISODate, ISODateTime } from '../../../types/entities'

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

export function defaultVisitLogRange(today = todayISO()): { from: ISODate; to: ISODate } {
  return rangeForPreset('all', today)
}

export async function fetchVisitLog(query: VisitLogQuery): Promise<VisitLogRow[]> {
  const [visits, students, users] = await Promise.all([
    listVisits({ from: query.from, to: query.to }),
    listStudents({ includeArchived: true }),
    listUsers(),
  ])
  const studentsById = new Map(students.map((student) => [student.id, student]))
  const userNames = new Map(users.map((user) => [user.id, user.name]))
  const search = query.search.trim().toLowerCase()

  return visits
    .filter((visit) => query.disposition === 'all' || visit.disposition === query.disposition)
    .flatMap((visit): VisitLogRow[] => {
      const student = studentsById.get(visit.studentId)
      return student
        ? [
            {
              id: visit.id,
              studentNumber: student.studentNumber,
              gradeLevel: student.gradeLevel,
              dateTime: visit.dateTime,
              disposition: visit.disposition,
              eventTag: visit.eventTag,
              loggedBy: userNames.get(visit.loggedByUserId) ?? 'Unknown user',
            },
          ]
        : []
    })
    .filter((row) => {
      if (!search) return true
      return (
        row.studentNumber.toLowerCase().includes(search) ||
        row.gradeLevel.toLowerCase().includes(search) ||
        (row.eventTag?.toLowerCase().includes(search) ?? false)
      )
    })
}
