import type { AuditLogEntry } from '../../types/entities'

const entries: AuditLogEntry[] = []

export function recordMockAudit(entry: AuditLogEntry) {
  entries.push(entry)
}

export function getMockAuditEntries(): AuditLogEntry[] {
  return [...entries]
}

export function clearMockAuditEntries() {
  entries.length = 0
}
