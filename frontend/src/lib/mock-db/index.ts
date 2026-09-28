/**
 * CLINIQ mock data layer: the single entry point for reading and writing data during the
 * frontend-first phases (ADR-006, ADR-014). Feature `api/` modules import from here; pages never
 * import `mock-db.json` or the store directly. See README.md in this folder.
 */
export * from './api'
export type { SessionUser } from './session'
export { getMockSessionUser, ROLE_LABELS } from './session'
export type {
  ComplaintType,
  ExcuseLetterApproval,
  InventoryTransaction,
  MockDbConfig,
  PeReferral,
  RecordReview,
} from './types'
export type { BackupStatus, FrequentVisitor, IncompleteRecordRow, InventoryStatus } from './selectors'
export { getMockToday, getRecordedAuditEntries, resetMockDb, setMockPersistence, setMockToday } from './store'
export { queryParam } from './devToggles'
