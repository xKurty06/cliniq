import { useState } from 'react'
import { isStudentNumber, normalizeStudentNumber } from '../lib/studentNumber'
import type { Student } from '../types/entities'

/**
 * Which student an entry form is about. The student is either identified before the form opens (a
 * QR scan or a quick-action passes `?student=`), or typed into the form's Student Number field and
 * looked up on save. A form never falls back to a default student.
 *
 * `find` is the feature's own lookup (its `api/` module), so this hook stays free of data access.
 */
export function useIdentifiedStudent(
  /** The student identified before the form opened; may arrive once the form's data has loaded. */
  preselected: Student | null | undefined,
  find: (studentNumber: string) => Promise<Student>,
) {
  const [picked, setPicked] = useState<Student | null>(null)
  const student = preselected ?? picked
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | undefined>()

  return {
    student,
    input,
    error,
    /** True when the form opened without a student, so the Student Number field is shown. */
    needsStudentNumber: !student,
    setInput(value: string) {
      setInput(normalizeStudentNumber(value))
      setError(undefined)
    },
    /** Inline format check, run with the rest of the form's validation. */
    validate(): boolean {
      if (student || isStudentNumber(input)) return true
      setError('Enter the Student Number (YYYY-NNNNN).')
      return false
    },
    /** The identified student, looked up from the typed number when needed; `null` if not found. */
    async resolve(): Promise<Student | null> {
      if (student) return student
      try {
        const found = await find(input)
        setPicked(found)
        return found
      } catch {
        setError('No student has this Student Number. Check it and try again.')
        return null
      }
    },
    /** After a save on a form that identified its own student: ready for the next student. */
    reset() {
      setPicked(null)
      setInput('')
      setError(undefined)
    },
  }
}
