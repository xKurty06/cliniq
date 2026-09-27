# Issues and TODOs

## Open decisions, waiting on someone outside the dev team

- **Physical barcode/QR scanner for the clinic PC.** Raised in a September 24 team discussion (garbled AI transcript, low confidence on specifics): MCA may already have an existing student masterlist with barcoded student IDs; a USB scanner (~₱1,000–2,500, possibly Principal-funded) was discussed as a way to import/use that existing data instead of building `YYYY-NNNNN` numbers from scratch. **Explicitly not being acted on** — team decided to keep building the current design and revisit only if the school approves the proposal. If approved, expect this to touch: `06-Decisions/ADR-005` (Student Number scheme), the QR module, and the Project Plan's Section 1.4 "RFID/barcode hardware" out-of-scope line.
- **Full school-events calendar** — who would maintain it (Staff, adding workload, vs. Admin/Principal, who has no write access today) is unresolved. Current phase uses lightweight free-text event tagging instead.
- **Canteen Staff QR access** — designed, not built. No blocker, just not this phase.
- **Additional backup layer beyond local + external drive** — team is still evaluating what this should be (possibly off-site/cloud). Not yet decided.
- **Who manages the system when the nurse is absent** — pending a reply from Ms. Jenne Baas.

## Phase 2 (Cross-Check & Audit) findings logged during Phase 1 — Sunday, September 27, 2026 — 09:48

- **#10 Visit Log List omits the complaint column** because it was built while `cliniq-display-privacy` still (incorrectly) described reason visibility as open. ADR-010 (Option A) says the reason stays visible next to the Student Number. Fix during #10's Audit; the skill text is now corrected.
- **#16 Incident Entry: follow-up prompt sits in Stage 2**, but Screen Inventory #18b says it appears at the end of Stage 1. Resolve during the F1 Incident Entry audit (move it, or confirm with the owner that Stage 2 is acceptable).
- **Shared `Select`/`Textarea`/`FollowUpPrompt` now exist** (`components/ui/`, `components/forms/`) but New Visit, Incident Entry, Student List, Student Form, and PE Referral still inline their own copies. Consolidate during Phase 2 (#18b's build = swapping `FollowUpPrompt` into #11 and #16).
- **Login (#1) and Force Password Change (#2) aren't in any F-phase or the loop checklist.** Decide whether they belong in F2 or wait for B2 (Sanctum) before building.

## Resolved since last update

- **Sunday, September 27, 2026 — 07:39:** ~~No code exists yet~~ — resolved. `cliniq-frontend/` now contains the Vite/React scaffold, shared UI components, App Shell/Nav, mock data utilities, and the built/audited Clinic Overview Dashboard. Remaining frontend work should continue from `04-Development/Frontend-Loop-Engineering.md`, not from the old empty-skeleton assumption.
- ~~Laravel Sanctum, Vite, and QR libraries~~ — confirmed September 25, 2026, after researching current maintenance/compatibility status. See `06-Decisions/ADR-007-Stack-Finalization.md` and `02-Architecture/Tech-Stack.md`.
- ~~XAMPP standardization~~ — confirmed.
- ~~Chart.js vs. Recharts~~ — Chart.js chosen, for bundle size and Canvas rendering given the 4GB RAM target.
- ~~No DFD, Use-Case Diagram, or Activity Diagram~~ — built directly from already-documented requirements rather than waiting on an external upload; see `02-Architecture/Database/`. The ERD is separate and remains TBA (see Known gaps below) — those three don't commit to a database schema the way an ERD does, so they weren't reverted with it.

## Known gaps

- Database design (ERD) is TBA — not yet finalized, and shouldn't be inferred as a substitute for the team actually designing it. `02-Architecture/Database/ERD.md` lists the already-documented data entities as a reference point only.

## Format for new entries
When you find or resolve something, add it here with a date and enough context that someone with zero memory of the conversation that created it can still act on it.
