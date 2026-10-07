import {
  getLatestVisit,
  getStudentById,
  getUser,
  getVisit,
  listInventory,
  updateVisit,
  type InventoryItemView,
  type ItemLineInput,
  type SessionUser,
} from '../../../lib/mock-db'
import type { Disposition, ISODateTime, ItemGivenLine, Student } from '../../../types/entities'

export interface VisitDetail {
  id: string
  student: Student
  dateTime: ISODateTime
  complaint: string
  treatment: string
  disposition: Disposition
  eventTag: string
  loggedBy: string
  itemsGiven: ItemGivenLine[]
  /** Current inventory, for editing the medicine lines. */
  items: InventoryItemView[]
}

export interface VisitDetailValues {
  complaint: string
  treatment: string
  disposition: Disposition
  eventTag: string
}

export function valuesFromVisit(visit: VisitDetail): VisitDetailValues {
  return {
    complaint: visit.complaint,
    treatment: visit.treatment,
    disposition: visit.disposition,
    eventTag: visit.eventTag,
  }
}

/** `visitId` comes from the `/visits/:visitId` route; omitted, the latest active visit is used. */
export async function fetchVisitDetail(visitId?: string): Promise<VisitDetail> {
  const visit = visitId ? await getVisit(visitId) : await getLatestVisit()
  const [student, loggedBy, items] = await Promise.all([
    getStudentById(visit.studentId),
    getUser(visit.loggedByUserId).then((user) => user.name, () => 'Unknown user'),
    listInventory(),
  ])
  return {
    id: visit.id,
    student,
    dateTime: visit.dateTime,
    complaint: visit.complaint,
    treatment: visit.treatment,
    disposition: visit.disposition,
    eventTag: visit.eventTag ?? '',
    loggedBy,
    itemsGiven: visit.itemsGiven,
    items,
  }
}

/**
 * Saves the edit. Changed medicine lines adjust stock through `visit_edited` transactions in the
 * same write (ADR-018). Returns the updated visit with fresh stock figures and any items now below zero.
 */
export async function updateVisitDetail(
  visit: VisitDetail,
  values: VisitDetailValues,
  itemsGiven: ItemLineInput[],
  actor?: SessionUser,
): Promise<{ visit: VisitDetail; belowZero: string[] }> {
  const { visit: updated, belowZero } = await updateVisit(
    visit.id,
    {
      complaint: values.complaint.trim(),
      treatment: values.treatment.trim(),
      disposition: values.disposition,
      eventTag: values.eventTag.trim() || null,
      itemsGiven,
    },
    actor,
  )
  const items = await listInventory()
  return {
    visit: { ...visit, ...updated, eventTag: updated.eventTag ?? '', items },
    belowZero,
  }
}
