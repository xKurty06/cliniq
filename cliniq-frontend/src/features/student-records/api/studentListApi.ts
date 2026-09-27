import { getMockDataset } from '../../../lib/mocks/dataset'
import { todayISO } from '../../../lib/dates'
import type { Student } from '../../../types/entities'

type MockMode = 'normal' | 'error' | 'slow'

export interface StudentListQuery {
  search: string
  gradeLevel: string
  includeArchived: boolean
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

export async function fetchStudentList(query: StudentListQuery): Promise<Student[]> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock student list failure')

  const search = query.search.trim().toLowerCase()
  return getMockDataset(todayISO())
    .students.filter((student) => query.includeArchived || !student.archived)
    .filter((student) => !query.gradeLevel || student.gradeLevel === query.gradeLevel)
    .filter((student) => {
      if (!search) return true
      return (
        student.fullName.toLowerCase().includes(search) ||
        student.studentNumber.toLowerCase().includes(search)
      )
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .slice(0, 80)
}

export function gradeLevels(): string[] {
  const levels = new Set(getMockDataset(todayISO()).students.map((student) => student.gradeLevel))
  return [...levels].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}
