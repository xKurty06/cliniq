import { addDays, diffDays, todayISO } from '../../../lib/dates'
import { recordMockAudit } from '../../../lib/mocks/audit'
import { getMockDataset } from '../../../lib/mocks/dataset'
import type { ISODate, Student } from '../../../types/entities'

type MockMode = 'normal' | 'error' | 'slow'

export interface IncompleteRecord {
  id: string
  studentId: string
  studentNumber: string
  fullName: string
  gradeLevel: string
  missingFields: string[]
  importedBy: string
  importedAt: ISODate
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

function missingFieldsFor(student: Student): string[] {
  const sequence = Number(student.id.replace('stu-', '')) || 0
  const fields = new Set<string>()
  if (!student.emergencyContact) fields.add('Emergency contact')
  if (!student.contactInfo.trim()) fields.add('Student contact information')
  if (sequence % 2 === 0) fields.add('Allergies confirmation')
  if (sequence % 3 === 0) fields.add('Medical conditions confirmation')
  if (fields.size === 0) fields.add('Required-field review')
  return [...fields]
}

export async function fetchIncompleteRecords(): Promise<IncompleteRecord[]> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock incomplete records failure')

  const today = todayISO()
  return getMockDataset(today)
    .students.filter((student) => !student.archived && !student.recordComplete)
    .map((student, index) => ({
      id: `incomplete-${student.id}`,
      studentId: student.id,
      studentNumber: student.studentNumber,
      fullName: student.fullName,
      gradeLevel: student.gradeLevel,
      missingFields: missingFieldsFor(student),
      importedBy: 'Registrar import',
      importedAt: addDays(today, -1 - (index % 14)),
    }))
    .sort((a, b) => diffDays(b.importedAt, a.importedAt) || a.fullName.localeCompare(b.fullName))
}

export async function markIncompleteRecordResolved(record: IncompleteRecord): Promise<void> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock incomplete record resolution failure')

  recordMockAudit({
    userId: 'usr-nurse',
    actionType: 'approve',
    targetRecord: { type: 'student', id: record.studentId },
    timestamp: new Date().toISOString(),
  })
}
