# Issues and TODOs

## Open decisions, waiting on someone outside the dev team

- **Physical barcode/QR scanner for the clinic PC.** Raised in a September 24 team discussion (garbled AI transcript, low confidence on specifics): MCA may already have an existing student masterlist with barcoded student IDs; a USB scanner (~₱1,000–2,500, possibly Principal-funded) was discussed as a way to import/use that existing data instead of building `YYYY-NNNNN` numbers from scratch. **Explicitly not being acted on** — team decided to keep building the current design and revisit only if the school approves the proposal. If approved, expect this to touch: `06-Decisions/ADR-005` (Student Number scheme), the QR module, and the Project Plan's Section 1.4 "RFID/barcode hardware" out-of-scope line.
- **Full school-events calendar** — who would maintain it (Staff, adding workload, vs. Admin/Principal, who has no write access today) is unresolved. Current phase uses lightweight free-text event tagging instead.
- **Canteen Staff QR access** — designed, not built. No blocker, just not this phase.
- **Additional backup layer beyond local + external drive** — team is still evaluating what this should be (possibly off-site/cloud). Not yet decided.
- **Who manages the system when the nurse is absent** — pending a reply from Ms. Jenne Baas.

## Found while building the Clinic Overview Dashboard (Saturday, September 26, 2026 — 20:43)

Needs a team or nurse decision. The code has safe placeholders so nothing is blocked:

- **Undefined dashboard thresholds.** No document defines them. They're placeholders in `cliniq-frontend/src/features/dashboard/api/aggregate.ts` (`MOCK_RULES`) and must be decided before Phase B9: frequent-visitor threshold (placeholder: ≥ 3 visits in the selected range), the "upcoming" follow-up window (placeholder: 7 days), "nearing expiration" window (placeholder: 30 days, taken from the mockup's "Within 30 days"), symptom-cluster rule (placeholder: ≥ 8 cases in a bucket and ≥ 2× that complaint's average elsewhere), and the low-stock comparison (docs say "below" the threshold → implemented as strictly `<`).
- **Design-System.md contrast contradictions** (its own rules vs. its own token assignments). Implemented the stricter reading; the doc and the canonical Frontend Context Brief §7 should be corrected together:
  - *Primary button* is specified as filled `brand-green` + white text, but 14px button labels are small text and white on `brand-green` is 3.74:1; the same doc says to use `brand-green-dark` "anywhere white text needs to be small (… dense buttons)". Built primary with `brand-green-dark`.
  - *Secondary button* text in `brand-green` on white is 3.74:1 (fails small text). Built with `brand-green-dark` text and a `brand-green` border.
  - *`text-muted` (#9E9E9E)* is assigned to timestamps but is 2.68:1 on white, failing any readable text. It's used only for disabled/decorative; timestamps use `text-secondary`.
  - *`border` (#E0E0E0)* is assigned to input borders but is 1.32:1, below the WCAG 1.4.11 3:1 for input boundaries. Inputs use `text-secondary` as their border; `border` stays for dividers/cards.
- **Is printing/exporting the dashboard an auditable action?** The audit list (login, scan, submit, approve, create/update/delete/archive) doesn't include printing, so no entry is written. Confirm, since exports of reports may be expected to be logged under RA 10173.
- **"Pending/incomplete records" source.** Implemented as active students with `recordComplete = false`, approximating #9's review queue. The queue's real "who resolved it" model is pending the ERD.
- **Canonical docs need updates** for ADR-010 (reason visibility) and ADR-011 (dashboard view-only, 5 cards). See those ADRs.
- **Still open:** the data-fetching and routing libraries (Development-Phases §0), deferred with the owner's approval; must be decided before the App Shell (#3). Node LTS pinning (dev machine currently on Node v26.5.0).

## Resolved since last update

- ~~Reason/description visibility in multi-student list rows~~: Option A (visible) — ADR-010, Saturday, September 26, 2026.
- ~~Dashboard Staff actions vs. view-only; 4 vs. 5 stat cards~~: view-only for both roles, 5 cards — ADR-011, Saturday, September 26, 2026.

- ~~Laravel Sanctum, Vite, and QR libraries~~ — confirmed September 25, 2026, after researching current maintenance/compatibility status. See `06-Decisions/ADR-007-Stack-Finalization.md` and `02-Architecture/Tech-Stack.md`.
- ~~XAMPP standardization~~ — confirmed.
- ~~Chart.js vs. Recharts~~ — Chart.js chosen, for bundle size and Canvas rendering given the 4GB RAM target.
- ~~No DFD, Use-Case Diagram, or Activity Diagram~~ — built directly from already-documented requirements rather than waiting on an external upload; see `02-Architecture/Database/`. The ERD is separate and remains TBA (see Known gaps below) — those three don't commit to a database schema the way an ERD does, so they weren't reverted with it.

## Known gaps

- Database design (ERD) is TBA — not yet finalized, and shouldn't be inferred as a substitute for the team actually designing it. `02-Architecture/Database/ERD.md` lists the already-documented data entities as a reference point only.
- ~~No code exists yet~~: the frontend scaffold, design tokens, shared components, and the Clinic Overview Dashboard exist as of Saturday, September 26, 2026. The backend is still unscaffolded.

## Format for new entries
When you find or resolve something, add it here with a date and enough context that someone with zero memory of the conversation that created it can still act on it.
