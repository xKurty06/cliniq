import { useEffect, useId, useRef, useState } from 'react'
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  Skeleton,
  type DataTableColumn,
} from '../../components'
import { useAsyncData } from '../../hooks/useAsyncData'
import type { Student } from '../../types/entities'
import { fetchGradeLevels, fetchStudentList } from './api/studentListApi'

function StudentListSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <Skeleton className="h-7 w-48 max-w-full" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </Card>
      <Card className="p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      </Card>
    </div>
  )
}

function GradeSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const { data: gradeLevels = [] } = useAsyncData('grade-levels', fetchGradeLevels)
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-text-primary">
        Grade level
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full cursor-pointer appearance-none rounded-md border border-border bg-background px-3 pr-9 text-sm text-text-primary shadow-card transition-colors duration-150 hover:border-brand-green hover:bg-surface motion-reduce:transition-none"
        >
          <option value="">All grade levels</option>
          {gradeLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-brand-green-dark"
        />
      </div>
    </div>
  )
}

const columns: Array<DataTableColumn<Student>> = [
  {
    key: 'name',
    header: 'Full name',
    rowHeader: true,
    cell: (student) => student.fullName,
  },
  {
    key: 'number',
    header: 'Student Number',
    cell: (student) => student.studentNumber,
  },
  {
    key: 'grade',
    header: 'Grade level',
    cell: (student) => student.gradeLevel,
  },
  {
    key: 'status',
    header: 'Record status',
    cell: (student) => (
      <div className="flex flex-wrap gap-1">
        <Badge tone={student.recordComplete ? 'success' : 'warning'} variant="soft">
          {student.recordComplete ? 'Complete' : 'Incomplete'}
        </Badge>
        {student.archived && (
          <Badge tone="neutral" variant="outline" icon="archive">
            Archived
          </Badge>
        )}
      </div>
    ),
  },
]

/**
 * Student List (Screen #6). This is the masterlist special case: full names are correct, but no
 * medical/confidential fields are shown inline.
 */
export function StudentListPage() {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [includeArchived, setIncludeArchived] = useState(false)
  const key = `${search}|${gradeLevel}|${includeArchived}`
  const { data, status, isRefetching, reload } = useAsyncData(key, () =>
    fetchStudentList({ search, gradeLevel, includeArchived }),
  )

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('focus') === 'search') {
      searchInputRef.current?.focus()
    }
  }, [])

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8">
        <ErrorState title="Unable to load student records." onRetry={reload} />
      </div>
    )
  }

  if (!data) {
    return (
      <>
        <p className="sr-only" role="status">
          Loading student list...
        </p>
        <StudentListSkeleton />
      </>
    )
  }

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-4 py-6 sm:px-8">
      <Card className="p-5">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Student List</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Search the masterlist by full name or Student Number. Medical details stay inside the
          individual profile.
        </p>
      </Card>

      <Card aria-labelledby="student-list-title">
        <CardHeader
          titleId="student-list-title"
          title="Student records"
          description={`${data.length.toLocaleString('en-PH')} result${data.length === 1 ? '' : 's'} shown`}
          icon={<Icon name="users" />}
        />
        <CardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_16rem_auto]">
            <Input
              ref={searchInputRef}
              label="Search"
              value={search}
              placeholder="Name or Student Number"
              onChange={(event) => setSearch(event.target.value)}
            />
            <GradeSelect value={gradeLevel} onChange={setGradeLevel} />
            <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-semibold text-text-primary shadow-card transition-colors hover:bg-surface">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(event) => setIncludeArchived(event.target.checked)}
                className="size-4 cursor-pointer accent-brand-green-dark"
              />
              Include archived
            </label>
          </div>

          <div aria-busy={isRefetching} className={isRefetching ? 'opacity-60' : undefined}>
            {data.length ? (
              <DataTable
                caption="Student masterlist"
                columns={columns}
                rows={data}
                rowKey={(student) => student.id}
              />
            ) : (
              <EmptyState
                icon="users"
                title="No students found"
                description="Try a different search or grade-level filter."
              />
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
