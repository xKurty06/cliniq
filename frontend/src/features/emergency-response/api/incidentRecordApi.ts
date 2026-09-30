import { formatDateTime } from '../../../lib/dates'
import {
  addParentNotification,
  approveIncidentReport,
  getIncident,
  getStudentById,
  listApprovedIncidentReportIds,
  listIncidents,
  type SessionUser,
} from '../../../lib/mock-db'
import type { Incident, ParentNotificationOutcome, Student } from '../../../types/entities'

/**
 * One incident, deliberately opened (Incident Report #18, Parent Notification #17): full name is
 * correct here (single deliberate lookup, ADR-004).
 */
export interface IncidentRecord {
  incident: Incident
  student: Student
  /** True once this incident's report has been signed off. */
  approved: boolean
  /**
   * Selector options: only reports still pending sign-off, so a nurse can't pick and approve a
   * record that is already signed. The open record is included even when it is already approved.
   */
  options: Array<{ value: string; label: string }>
}

/** `null` when there is nothing to show: no incidents, or (opened without an id) none pending sign-off. */
export async function fetchIncidentRecord(incidentId?: string): Promise<IncidentRecord | null> {
  const [incidents, approvedIds] = await Promise.all([listIncidents(), listApprovedIncidentReportIds()])
  const approved = new Set(approvedIds)
  const pending = incidents.filter((item) => !approved.has(item.id))
  const incident = incidentId ? await getIncident(incidentId) : pending[0]
  if (!incident) return null
  const student = await getStudentById(incident.studentId)
  const listed = approved.has(incident.id) ? [incident, ...pending] : pending
  return {
    incident,
    student,
    approved: approved.has(incident.id),
    options: listed.map((item) => ({
      value: item.id,
      label: `${formatDateTime(item.time)} · ${item.complaint}${approved.has(item.id) ? ' (approved)' : ''}`,
    })),
  }
}

export async function approveReport(incidentId: string, actor?: SessionUser): Promise<void> {
  await approveIncidentReport(incidentId, actor)
}

export async function logParentNotification(
  incidentId: string,
  outcome: ParentNotificationOutcome,
  actor?: SessionUser,
) {
  return addParentNotification(incidentId, outcome, actor)
}
