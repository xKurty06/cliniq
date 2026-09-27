# Issues and TODOs

## Open decisions, waiting on someone outside the dev team

- **Physical barcode/QR scanner for the clinic PC.** Raised in a September 24 team discussion (garbled AI transcript, low confidence on specifics): MCA may already have an existing student masterlist with barcoded student IDs; a USB scanner (~₱1,000–2,500, possibly Principal-funded) was discussed as a way to import/use that existing data instead of building `YYYY-NNNNN` numbers from scratch. **Explicitly not being acted on** — team decided to keep building the current design and revisit only if the school approves the proposal. If approved, expect this to touch: `06-Decisions/ADR-005` (Student Number scheme), the QR module, and the Project Plan's Section 1.4 "RFID/barcode hardware" out-of-scope line.
- **Full school-events calendar** — who would maintain it (Staff, adding workload, vs. Admin/Principal, who has no write access today) is unresolved. Current phase uses lightweight free-text event tagging instead.
- **Canteen Staff QR access** — designed, not built. No blocker, just not this phase.
- **Additional backup layer beyond local + external drive** — team is still evaluating what this should be (possibly off-site/cloud). Not yet decided.
- **Who manages the system when the nurse is absent** — pending a reply from Ms. Jenne Baas.

## Open design questions — school year handling & grade promotion

**This was a real gap: this whole discussion happened in chat and was never actually written down here — caught late, when it should have been captured the same session it came up, like everything else in this file.** Nothing below has been decided; these are the open questions as originally raised, not resolved answers.

**What's already in place, relevant to this:**
- Student Number stays fixed for life at the school (`YYYY-NNNNN`, tied to enrollment year, not current grade) — deliberately designed so promotion doesn't force a new ID.
- Archive, not delete, for students who leave — hidden from active lists, kept for up to 5 years post-archive, then deleted (data retention policy).
- Registrar's Office is documented as the source of student data, but only for the *initial* import — nothing describes an ongoing yearly process.

**What's actually undecided:**
1. **Grade-level promotion at year rollover.** Does the system bulk-promote every active student one grade level at the start of a new school year? Who triggers it — Staff clicks a button, or does it happen automatically on a date? What about a student repeating a grade — how does Staff exclude them from the bulk promotion?
2. **Section reassignment.** Sections often get reshuffled each year independent of grade level. Same question: bulk operation, manual per-student, or does this just come from a Registrar re-import?
3. **A repeatable Registrar sync, not just a one-time import.** At the start of each year: some students are new (need a Student Number generated), some are continuing (need grade/section updated), some have left (need archiving). Is that one combined yearly process, or three separate manual actions?
4. **Historical grade-level accuracy — a real data-integrity consequence, not just a preference.** If a Visit or Incident record reads grade level live off the Student record rather than snapshotting it at the time of the visit, an old visit from when a student was in Grade 7 will show "Grade 8" once they're promoted — because nothing captures what grade they were in *at the time*. Matters if historical reporting by grade level matters ("how many Grade 7 students visited last year"); if it doesn't, current behavior is fine as-is. This is a real choice, not a default to assume either way.
5. **Re-enrollment mechanics.** The 5-year retention window was partly justified by "a transferred student might come back" — but nothing decides what happens then. Does a returning student get their *original* archived Student Number un-archived and reused, or a brand-new `YYYY-NNNNN` (since the format is literally "enrollment year")? If the latter, is the old archived record ever linked to the new one?
6. **Does the reason a student left matter?** "Archived" currently covers graduated, transferred, and dropped out identically. Worth distinguishing for reporting, or is a generic archived flag enough?
7. **Timing of archival.** Does Staff archive a student the moment the Registrar reports them gone, or is this batched into one end-of-year operation alongside the promotion/section work above?

## Resolved since last update

- ~~Laravel Sanctum, Vite, and QR libraries~~ — confirmed September 25, 2026, after researching current maintenance/compatibility status. See `06-Decisions/ADR-007-Stack-Finalization.md` and `02-Architecture/Tech-Stack.md`.
- ~~XAMPP standardization~~ — confirmed.
- ~~Chart.js vs. Recharts~~ — Chart.js chosen, for bundle size and Canvas rendering given the 4GB RAM target.
- ~~No DFD, Use-Case Diagram, or Activity Diagram~~ — built directly from already-documented requirements rather than waiting on an external upload; see `02-Architecture/Database/`. The ERD is separate and remains TBA (see Known gaps below) — those three don't commit to a database schema the way an ERD does, so they weren't reverted with it.

## Known gaps

- **Sunday, September 27, 2026 — 16:10 — F2 audit blocker: Screen #15 Incident Log List is missing.** `Screen-Inventory.md` and `Development-Phases.md` both require a Staff multi-student incident list showing Student Number, the ADR-010-approved reason/description, and a Needs Completion/Complete badge. No `IncidentLogListPage`, `/incidents` route, or navigation destination exists; the current Incidents navigation opens `/incidents/new` instead. Build and audit this screen before marking F2 or F3 demo-ready.
- Database design (ERD) is TBA — not yet finalized, and shouldn't be inferred as a substitute for the team actually designing it. `02-Architecture/Database/ERD.md` lists the already-documented data entities as a reference point only.
- Frontend mock implementation is now substantially built through the F2 screen set; Laravel API integration, database schema, and production authentication remain future backend work.

## Format for new entries
When you find or resolve something, add it here with a date and enough context that someone with zero memory of the conversation that created it can still act on it.
