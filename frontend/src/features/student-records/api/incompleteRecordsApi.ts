import { getIncompleteRecordQueue, resolveIncompleteRecord, type IncompleteRecord as QueueRow } from '../../../lib/mock-db'
import type { SessionUser } from '../../../lib/mock-db'
import type { ISODate, ISODateTime } from '../../../types/entities'

/**
 * Incomplete Records Review Queue (#9). Which fields are missing is computed by the data layer from
 * the student record itself, so fixing a record on Add/Edit Student removes it from this queue and
 * from the Dashboard's pending-records count at the same time.
 */
export interface IncompleteRecord {
  id: string
  studentId: string
  studentNumber: string
  fullName: string
  gradeLevel: string
  missingFields: string[]
  importedBy: string
  importedAt: ISODate | null
  resolvedBy: string | null
  resolvedAt: ISODateTime | null
}

function toRecord(row: QueueRow): IncompleteRecord {
  return {
    id: `incomplete-${row.student.studentNumber}`,
    studentId: row.student.id,
    studentNumber: row.student.studentNumber,
    fullName: row.student.fullName,
    gradeLevel: row.student.gradeLevel,
    missingFields: row.missingFields,
    importedBy: row.review?.importedBy ?? 'Flagged in CLINIQ',
    importedAt: row.review?.importedAt ?? null,
    resolvedBy: row.resolvedByName,
    resolvedAt: row.review?.resolvedAt ?? null,
  }
}

export async function fetchIncompleteRecords(): Promise<IncompleteRecord[]> {
  const rows = await getIncompleteRecordQueue()
  return rows
    .map(toRecord)
    .sort((a, b) => (b.importedAt ?? '').localeCompare(a.importedAt ?? '') || a.fullName.localeCompare(b.fullName))
}

export async function markIncompleteRecordResolved(
  record: IncompleteRecord,
  actor?: SessionUser,
): Promise<IncompleteRecord> {
  return toRecord(await resolveIncompleteRecord(record.studentNumber, actor))
}
