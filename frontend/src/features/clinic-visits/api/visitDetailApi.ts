import { getLatestVisit, getStudentById, getUser, getVisit, updateVisit, type SessionUser } from '../../../lib/mock-db'
import type { Disposition, ISODateTime, Student } from '../../../types/entities'

export interface VisitDetail {
  id: string
  student: Student
  dateTime: ISODateTime
  complaint: string
  treatment: string
  disposition: Disposition
  eventTag: string
  loggedBy: string
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
  const [student, loggedBy] = await Promise.all([
    getStudentById(visit.studentId),
    getUser(visit.loggedByUserId).then((user) => user.name, () => 'Unknown user'),
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
  }
}

export async function updateVisitDetail(
  visit: VisitDetail,
  values: VisitDetailValues,
  actor?: SessionUser,
): Promise<VisitDetail> {
  const updated = await updateVisit(
    visit.id,
    {
      complaint: values.complaint.trim(),
      treatment: values.treatment.trim(),
      disposition: values.disposition,
      eventTag: values.eventTag.trim() || null,
    },
    actor,
  )
  return { ...visit, ...updated, eventTag: updated.eventTag ?? '' }
}
