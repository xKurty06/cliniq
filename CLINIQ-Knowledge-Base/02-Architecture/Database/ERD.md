# Entity-Relationship Diagram

**Status: TBA.** Database design hasn't been finalized and shouldn't be treated as decided yet — this isn't a gap to quietly fill in from inference. When the team is ready to design it, the already-documented data entities are the right starting reference (not a schema to copy from, since these describe frontend-facing shapes, not settled table structure):

See `04-Development/Backend-Readiness-Checklist.md` for the current pre-migration readiness checklist.

- **Student** — id, Student Number (`YYYY-NNNNN`), full name, grade level, contact info, allergies, medical conditions, emergency contact, record-complete flag, archived flag
- **User** — id, name, username, role (staff/admin/instructor), last login
- **Visit** — id, student, date/time, complaint, treatment, disposition, staff who logged it, optional event tag
- **Incident** — id, student, time, complaint, vitals, hospital referral fields, parent-notification log, stage (1=fast-capture / 2=complete), optional event tag
- **FollowUp** — id, student, related record (visit or incident), follow-up date, reason, status (pending/completed/missed/cancelled), notes, created-by
- **InventoryItem** — id, name, category, current stock, unit, expiration date, low-stock threshold
- **Report** — type, date range, generated file/data
- **BackupLog** — last run timestamp, file size, status, verified-by
- **AuditLogEntry** — user, action type, target record, timestamp, optional summary of what changed (field names only, never values — ADR-017)

Full source for these: `CLINIQ_Frontend_Context_Brief.md`, §5.

**Don't build migrations against this list directly.** It's a description of what the frontend expects to work with, not a normalized schema — real table structure, relationships, keys, and types are a genuine design step that hasn't happened yet.
