import { getDemoStudent, getStudent, getStudentHistory } from '../../../lib/mock-db'
import type { Incident, Student, Visit } from '../../../types/entities'

/**
 * Student Profile data access (Screen #7 / Reference 3). A read-only profile fetch, so no audit-log
 * write is needed for Staff; Instructor profile views are logged through the QR lookup flow.
 *
 * Preview an empty history with `?mockEmpty=visits,incidents` (`lib/mock-db/devToggles.ts`).
 */

export interface StudentProfileData {
  student: Student
  visits: Visit[]
  incidents: Incident[]
}

/** `studentNumber` comes from the `/students/:studentNumber` route; omitted, a demo student is used. */
export async function fetchStudentProfile(studentNumber?: string): Promise<StudentProfileData> {
  const student = studentNumber ? await getStudent(studentNumber) : await getDemoStudent({ withHistory: true })
  const history = await getStudentHistory(student.id)
  return { student, ...history }
}
