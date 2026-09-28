import type { Visit } from '../../../types/entities'

export interface ComplaintCount {
  complaint: string
  count: number
}

/** Visits per complaint, most frequent first (ties alphabetical, so the order is stable). */
export function complaintCounts(visits: Visit[]): ComplaintCount[] {
  const counts = new Map<string, number>()
  for (const visit of visits) counts.set(visit.complaint, (counts.get(visit.complaint) ?? 0) + 1)
  return [...counts]
    .map(([complaint, count]) => ({ complaint, count }))
    .sort((a, b) => b.count - a.count || a.complaint.localeCompare(b.complaint))
}
