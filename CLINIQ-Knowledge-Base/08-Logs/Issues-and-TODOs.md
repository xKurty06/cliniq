# Issues and TODOs

## Open decisions, waiting on someone outside the dev team

- **Physical barcode/QR scanner for the clinic PC.** Raised in a September 24 team discussion (garbled AI transcript, low confidence on specifics): MCA may already have an existing student masterlist with barcoded student IDs; a USB scanner (~₱1,000–2,500, possibly Principal-funded) was discussed as a way to import/use that existing data instead of building `YYYY-NNNNN` numbers from scratch. **Explicitly not being acted on** — team decided to keep building the current design and revisit only if the school approves the proposal. If approved, expect this to touch: `06-Decisions/ADR-005` (Student Number scheme), the QR module, and the Project Plan's Section 1.4 "RFID/barcode hardware" out-of-scope line.
- **Full school-events calendar** — who would maintain it (Staff, adding workload, vs. Admin/Principal, who has no write access today) is unresolved. Current phase uses lightweight free-text event tagging instead.
- **Canteen Staff QR access** — designed, not built. No blocker, just not this phase.
- **Additional backup layer beyond local + external drive** — team is still evaluating what this should be (possibly off-site/cloud). Not yet decided.
- **Who manages the system when the nurse is absent** — pending a reply from Ms. Jenne Baas.

## Resolved since last update

- ~~Laravel Sanctum, Vite, and QR libraries~~ — confirmed September 25, 2026, after researching current maintenance/compatibility status. See `06-Decisions/ADR-007-Stack-Finalization.md` and `02-Architecture/Tech-Stack.md`.
- ~~XAMPP standardization~~ — confirmed.
- ~~Chart.js vs. Recharts~~ — Chart.js chosen, for bundle size and Canvas rendering given the 4GB RAM target.

## Known gaps

- No SRS (DFD, Use-Case Diagram, ERD, Activity Diagram) uploaded yet — `02-Architecture/Database/` has placeholders waiting for it.
- No code exists yet — this vault was set up before implementation began, per the team's explicit request.

## Format for new entries
When you find or resolve something, add it here with a date and enough context that someone with zero memory of the conversation that created it can still act on it.
