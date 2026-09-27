import { todayISO } from '../../../lib/dates'
import { recordMockAudit } from '../../../lib/mocks/audit'
import { getMockDataset } from '../../../lib/mocks/dataset'
import type { Student, StudentNumber } from '../../../types/entities'
import { gradeLevels } from './studentListApi'

type MockMode = 'normal' | 'error' | 'slow'
export type StudentFormMode = 'add' | 'edit'

export interface StudentFormValues {
  fullName: string
  gradeLevel: string
  contactInfo: string
  emergencyContactName: string
  emergencyContactRelationship: string
  emergencyContactPhone: string
  allergies: string
  medicalConditions: string
}

export interface StudentFormContext {
  mode: StudentFormMode
  gradeLevels: string[]
  nextStudentNumber: StudentNumber
  student: Student | null
}

export interface DuplicateMatch {
  id: string
  fullName: string
  studentNumber: StudentNumber
  gradeLevel: string
}

export type StudentFormSubmitResult =
  | { status: 'duplicate'; matches: DuplicateMatch[] }
  | { status: 'saved'; student: Student; action: 'create' | 'update' }

function mockMode(): MockMode {
  if (typeof window === 'undefined') return 'normal'
  const mode = new URLSearchParams(window.location.search).get('mock')
  return mode === 'error' || mode === 'slow' ? mode : 'normal'
}

function formMode(): StudentFormMode {
  if (typeof window === 'undefined') return 'add'
  return new URLSearchParams(window.location.search).get('mode') === 'edit' ? 'edit' : 'add'
}

async function simulateLatency(mode: MockMode) {
  if (import.meta.env.MODE === 'test') return
  await new Promise((resolve) => setTimeout(resolve, mode === 'slow' ? 1200 : 200))
}

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item.toLowerCase() !== 'none')
}

function nextStudentNumber(students: Student[]): StudentNumber {
  const year = todayISO().slice(0, 4)
  const maxSequence = students
    .map((student) => student.studentNumber)
    .filter((number) => number.startsWith(`${year}-`))
    .map((number) => Number(number.slice(5)))
    .filter(Number.isFinite)
    .reduce((max, sequence) => Math.max(max, sequence), 0)
  return `${year}-${String(maxSequence + 1).padStart(5, '0')}`
}

export async function fetchStudentFormContext(): Promise<StudentFormContext> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock student form failure')

  const dataset = getMockDataset(todayISO())
  const activeStudents = dataset.students.filter((student) => !student.archived)
  const student = formMode() === 'edit' ? activeStudents[0] : null
  return {
    mode: formMode(),
    gradeLevels: gradeLevels(),
    nextStudentNumber: nextStudentNumber(dataset.students),
    student,
  }
}

export async function submitStudentForm(
  values: StudentFormValues,
  options: { mode: StudentFormMode; studentId?: string; confirmDuplicate?: boolean },
): Promise<StudentFormSubmitResult> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock student save failure')

  const dataset = getMockDataset(todayISO())
  const normalizedName = values.fullName.trim().toLowerCase()
  const matches = dataset.students
    .filter((student) => student.id !== options.studentId)
    .filter((student) => !student.archived)
    .filter(
      (student) =>
        student.fullName.trim().toLowerCase() === normalizedName &&
        student.gradeLevel === values.gradeLevel,
    )
    .map((student) => ({
      id: student.id,
      fullName: student.fullName,
      studentNumber: student.studentNumber,
      gradeLevel: student.gradeLevel,
    }))

  if (options.mode === 'add' && matches.length > 0 && !options.confirmDuplicate) {
    return { status: 'duplicate', matches }
  }

  const existing = options.studentId
    ? dataset.students.find((student) => student.id === options.studentId)
    : null
  const action = existing ? 'update' : 'create'
  const student: Student = {
    id: existing?.id ?? `stu-new-${Date.now()}`,
    studentNumber: existing?.studentNumber ?? nextStudentNumber(dataset.students),
    fullName: values.fullName.trim(),
    gradeLevel: values.gradeLevel,
    contactInfo: values.contactInfo.trim(),
    allergies: parseList(values.allergies),
    medicalConditions: parseList(values.medicalConditions),
    emergencyContact: {
      name: values.emergencyContactName.trim(),
      relationship: values.emergencyContactRelationship.trim(),
      phone: values.emergencyContactPhone.trim(),
      verified: existing?.emergencyContact?.verified ?? false,
    },
    recordComplete: true,
    archived: existing?.archived ?? false,
  }

  recordMockAudit({
    userId: 'usr-nurse',
    actionType: action,
    targetRecord: { type: 'student', id: student.id },
    timestamp: new Date().toISOString(),
  })

  return { status: 'saved', student, action }
}
