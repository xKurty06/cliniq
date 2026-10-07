import { useState } from 'react'
import { useAsyncData } from '../../hooks/useAsyncData'
import { STUDENT_SEARCH_MIN_LENGTH } from '../../lib/studentNumber'
import type { StudentSearchResult } from '../../types/entities'
import { Combobox } from '../ui/Combobox'
import { ListItemLink } from '../ui/ListItemLink'

/**
 * Student lookup for an entry form that opened without an identified student
 * (cliniq-combobox-patterns): type a Student Number or a name, then pick. A Combobox without free
 * text. Nothing is listed before 2 characters, and the search returns at most 8 active students, so
 * it never reads as a roster. Each result shows the Student Number, full name, and grade: a
 * deliberate single lookup, where the full name is correct (cliniq-display-privacy).
 *
 * The query is left as typed. A Student Number matches with or without its dash ("202600001"
 * finds 2026-00001), and a complete one highlights its match, so typing it and pressing Enter works.
 * `search` is the feature's own `api/` function (ADR-013), so the backend can replace it.
 */
export function StudentPicker({
  search,
  onSelect,
  label = 'Student',
  hint = 'Type a Student Number or at least 2 letters of the name, then pick the student.',
  error,
  addStudentHref,
  autoFocus,
}: {
  search: (query: string) => Promise<StudentSearchResult[]>
  onSelect: (student: StudentSearchResult) => void
  label?: string
  hint?: string
  error?: string
  /** Shown with "no match" when given; pass it only to roles that can add a student (Staff). */
  addStudentHref?: string
  autoFocus?: boolean
}) {
  const [query, setQuery] = useState('')
  const trimmed = query.trim()
  const ready = trimmed.length >= STUDENT_SEARCH_MIN_LENGTH
  const { data, status, isRefetching } = useAsyncData(`student-search|${ready ? trimmed.toLowerCase() : ''}`, () =>
    ready ? search(trimmed) : Promise.resolve([]),
  )
  const loading = ready && (status === 'loading' || isRefetching)
  const failed = ready && status === 'error'
  // While a new search runs, list nothing: Enter must never pick a stale result.
  const results = ready && !loading && !failed ? (data ?? []) : []
  const noMatch = ready && !loading && !failed && results.length === 0

  return (
    <div className="flex flex-col gap-1">
      <Combobox
        label={label}
        required
        value={query}
        onValueChange={setQuery}
        options={results}
        optionKey={(student) => student.id}
        optionLabel={(student) => `${student.studentNumber} ${student.fullName}`}
        renderOption={(student) => (
          <span className="flex w-full items-baseline gap-3">
            <span className="tabular-nums text-text-secondary">{student.studentNumber}</span>
            <span className="font-semibold">{student.fullName}</span>
            <span className="ml-auto pl-3 text-xs text-text-secondary">{student.gradeLevel}</span>
          </span>
        )}
        onPick={onSelect}
        allowFreeText={false}
        // A full 9-digit Student Number, dash or not: Enter picks its match.
        autoHighlight={/^\d{4}-?\d{5}$/.test(trimmed)}
        openOnFocus={false}
        loading={loading}
        loadError={failed ? "Couldn't search students. Keep typing to try again." : undefined}
        // "No match" is said below the field instead, where the Add-student link can be reached.
        noMatchesText={null}
        placeholder="YYYY-NNNNN or name"
        hint={hint}
        error={error}
        autoFocus={autoFocus}
      />
      {noMatch && (
        <p role="status" className="text-xs text-text-secondary">
          No active student matches “{trimmed}”.{' '}
          {addStudentHref && <ListItemLink to={addStudentHref}>Add a student</ListItemLink>}
        </p>
      )}
    </div>
  )
}
