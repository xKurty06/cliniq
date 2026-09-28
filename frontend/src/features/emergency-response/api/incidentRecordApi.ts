import {
  addParentNotification,
  approveIncidentReport,
  getIncident,
  getStudentById,
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
  /** Selector options for previewing other incidents when opened without an id. */
  options: Array<{ value: string; label: string }>
}

/** `null` when there are no incidents at all (an empty state, not an error). */
export async function fetchIncidentRecord(incidentId?: string): Promise<IncidentRecord | null> {
  const incidents = await listIncidents()
  const incident = incidentId ? await getIncident(incidentId) : incidents[0]
  if (!incident) return null
  const student = await getStudentById(incident.studentId)
  return {
    incident,
    student,
    options: incidents.map((item) => ({ value: item.id, label: `${item.time.slice(0, 10)} · ${item.complaint}` })),
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
