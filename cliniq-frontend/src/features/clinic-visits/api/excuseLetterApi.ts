import { formatDate, todayISO } from '../../../lib/dates'
import { recordMockAudit } from '../../../lib/mocks/audit'
import { getMockDataset } from '../../../lib/mocks/dataset'
import type { ISODateTime, Student, Visit } from '../../../types/entities'

type MockMode = 'normal' | 'error' | 'slow'

export interface ExcuseLetterContext {
  id: string
  student: Student
  visit: Visit
  issuedAt: ISODateTime
  checkedBy: string
  recipient: string
  body: string
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

function defaultBody(student: Student, visit: Visit): string {
  return [
    `This is to confirm that ${student.fullName} visited the school clinic on ${formatDate(visit.dateTime.slice(0, 10))}.`,
    'The student was assessed by the clinic staff and may be excused for the clinic visit period as recorded in CLINIQ.',
    'This clinic excuse letter is for school attendance documentation only.',
  ].join('\n\n')
}

/** `visitId` comes from `/visits/:visitId/excuse-letter`; omitted, the latest active visit is used. */
export async function fetchExcuseLetterContext(visitId?: string): Promise<ExcuseLetterContext> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock excuse letter failure')

  const dataset = getMockDataset(todayISO())
  const visit = visitId
    ? dataset.visits.find((candidate) => candidate.id === visitId)
    : [...dataset.visits].reverse().find((candidate) => {
        const student = dataset.students.find((item) => item.id === candidate.studentId)
        return student && !student.archived
      })
  if (!visit) throw new Error('Visit not found')

  const student = dataset.students.find((item) => item.id === visit.studentId)
  if (!student) throw new Error('Mock visit has no student')

  return {
    id: `excuse-${visit.id}`,
    student,
    visit,
    issuedAt: new Date().toISOString(),
    checkedBy: 'Ms. Jenne Baas',
    recipient: 'Class Adviser',
    body: defaultBody(student, visit),
  }
}

export async function approveExcuseLetter(context: ExcuseLetterContext): Promise<void> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock excuse letter approval failure')

  recordMockAudit({
    userId: 'usr-nurse',
    actionType: 'approve',
    targetRecord: { type: 'excuse-letter', id: context.id },
    timestamp: new Date().toISOString(),
  })
}
