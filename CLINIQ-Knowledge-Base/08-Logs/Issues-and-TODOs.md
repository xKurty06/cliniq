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

- Wednesday, September 30, 2026 — 19:06 PHT — Final F3 validation found and resolved an Audit Log pagination implementation issue: filters now reset pagination as part of their event update rather than synchronously setting state in an effect. Added regression coverage; lint has no errors, and the complete test/typecheck/build verification passes.
- Wednesday, September 30, 2026 — 17:29 — Completed the remaining F2 audit follow-ups: Student List rows now provide View profile links with stable table geometry; Parent Notification Log shows emergency-contact context; QR manual lookup formats `YYYYNNNNN` as `YYYY-NNNNN`; and relevant Visit/Incident Cancel actions return without submitting.

- Tuesday, September 29, 2026 - 09:34 - F2 authentication screens: Login (#1) and Force Password Change (#2) now exist as frontend-first mock screens. Production Sanctum enforcement, token expiry, and server-side password history remain Phase B2 work.

- ~~Monday, September 28, 2026 — 08:40 — F2 audit finding: Follow-Up List generated a pseudo Student Number from its internal ID and offered no way to update a pending follow-up.~~ Resolved Monday, September 28, 2026 — 08:40: the list now resolves the actual linked Student Number, exposes an audited “Mark completed” action, and has regression coverage.
- ~~Sunday, September 27, 2026 — 16:10 — F2 audit blocker: Screen #15 Incident Log List is missing.~~ Resolved Monday, September 28, 2026 — 08:25: added the Staff Incident Log List, `/incidents` route and navigation destination, privacy-safe Student Number rows, ADR-010-approved reason/description context, and Needs Completion/Complete status badges.
- ~~Monday, September 28, 2026 — 08:12 — F2 audit finding: Incident Report Archive displays a fabricated Student Number.~~ Resolved Monday, September 28, 2026 — 08:25: the archive now maps each incident's `studentId` to the linked `Student.studentNumber`, with regression coverage.
- ~~Laravel Sanctum, Vite, and QR libraries~~ — confirmed September 25, 2026, after researching current maintenance/compatibility status. See `06-Decisions/ADR-007-Stack-Finalization.md` and `02-Architecture/Tech-Stack.md`.
- ~~XAMPP standardization~~ — confirmed.
- ~~Chart.js vs. Recharts~~ — Chart.js chosen, for bundle size and Canvas rendering given the 4GB RAM target.
- ~~No DFD, Use-Case Diagram, or Activity Diagram~~ — built directly from already-documented requirements rather than waiting on an external upload; see `02-Architecture/Database/`. The ERD is separate and remains TBA (see Known gaps below) — those three don't commit to a database schema the way an ERD does, so they weren't reverted with it.

## Known gaps

- Database design (ERD) is TBA — not yet finalized, and shouldn't be inferred as a substitute for the team actually designing it. `02-Architecture/Database/ERD.md` lists the already-documented data entities as a reference point only.
- Frontend mock implementation is now substantially built through the F2 screen set; Laravel API integration, database schema, and production authentication remain future backend work.

## Reported UI/UX follow-ups — Monday, September 28, 2026 — 08:17

These items were supplied for the frontend backlog. Confirmed implementation gaps are stated as such; items whose desired behavior needs a visual or product decision are retained as validation tasks rather than silently interpreted.

### QR scan/lookup

- **Align QR-screen text consistently.** Review the mobile and desktop scan/lookup headings, descriptions, manual-entry label, and result-card text at their intended breakpoints; correct any inconsistent alignment without compromising the mobile-first flow.
- **Clarify and label optional fields.** Identify which QR-related fields are optional, display that status consistently, and keep the manual Student Number path usable without unnecessary required fields.
- **Show fields that depend on the selected complaint.** Confirm the intended complaint-to-field rules and implement them consistently in the visit and incident flows. New Visit currently changes its Smart Triage checklist by complaint; this request may require additional conditional fields and must not be guessed.
- **Auto-insert the Student Number dash.** Manual QR lookup currently trims and uppercases input but does not convert `YYYYNNNNN` to `YYYY-NNNNN`; add safe formatting while allowing deletion and paste.
- **Provide a working Cancel action on every relevant form.** Audit all entry forms. The current Incident Stage 1 Cancel button has no handler; each Cancel must safely return to the prior relevant screen without submitting data.

### Student records

- **Prevent the masterlist table layout from shifting when “Include archived” is toggled.** Reproduce at desktop widths, identify the changing column/row geometry, and preserve a stable table layout during the refetch.
- **Add a “View profile” action to Student List rows.** The masterlist currently displays static rows only; add an accessible profile link for each student, including archived records when they are shown.

### Dashboard

- **Make dashboard alerts redirect to their respective module pages.** The current alert-list rows are static. Add appropriate, privacy-safe navigation targets for follow-ups, frequent-visitor/student context, and inventory alerts, preserving the Dashboard's view-only rule.

### Visit and incident entry

- **Confirm the intended meaning of independent visit and incident entry.** Separate routes already exist (`/visits/new` and `/incidents/new`), but validate whether the requested independence means separate standalone navigation/actions, separate data workflows, or removal of shared assumptions before changing the flow.
- **Add parent contact information near Parent Notification Log.** Display the selected student's relevant emergency-contact name, relationship, phone number, and verification status near the outcome controls, subject to the single-student privacy rule.
- **Add an optional General Notes field to Incident Stage 1.** It must remain optional so the fast-capture requirement is not weakened, and must carry forward into Stage 2/report data once the API contract is finalized.

### Interaction-based UI/UX review — Wednesday, September 30, 2026 — 19:55

A live review of the running frontend (`http://localhost:5173`, Vite dev server, mock-data layer) using a real Chromium browser driven by Playwright. Every Screen-Inventory screen was opened and used as Staff, Admin/Principal, and PE/Sports Instructor where the role can reach it. The review clicked each button, opened each dropdown, submitted each form empty and valid, and forced loading/empty/error states with `?mock=slow|empty|error`. It ran at 1440px desktop and at 390px for the QR/mobile flows, and added an axe-core scan of every route. Severity: **broken** (prevents the task) · **inconsistent** (works, but differs from the documented pattern) · **cosmetic** · **judgment call** (awkward placement, not a rule violation). Evidence and fixes: `08-Logs/Agent-Sessions/2026-09-30-interaction-ui-ux-review.md`.

**Fixed in this session (confirmed implementation gaps, now resolved and regression-tested):**

- **Broken — Incident Entry (#16/#25), Staff.** Tapping the mobile Emergency button (or the QR hub's Emergency button before any scan) → Start Stage 1 opened a form already attached to a hardcoded demo student ("Gian Quizon") with no way to change it, so the incident was filed against the wrong student. Stage 1 now shows a required Student Number field when no student was identified.
- **Broken — Incident Entry Stage 2 (#16b), Staff.** Stage 2 existed only in the same sitting as Stage 1. A "Needs completion" incident in the Incident Log could never be reopened, although #16b and Reference 5 require reopening the same record later. Added `/incidents/:incidentId/complete` and a "Complete Stage 2" row action. Stage 1 also can no longer be submitted twice, which previously created a duplicate incident.
- **Broken — Student Profile (#7), Staff.** Clicking Archive did nothing; the button had no handler, and the existing `archiveStudent` API was never called. It now archives after a confirmation dialog and shows the Archived badge; the audit entry is written.
- **Broken — Visit Log (#10) and Incident Log (#15), Staff.** Both lists silently cut results at 120 rows, so 39 of the 159 seed visits were unreachable under "All". The cap was removed.
- **Broken — Instructor Lookup (#26) and Staff mobile hub (#23), 390px.** The shell-free mobile screen had no sign-out control, so an Instructor could not log out at all. A red, icon-only Log out control matching the desktop header was added.
- **Inconsistent — Visit Log and Incident Log.** No pagination, against `cliniq-pagination-patterns`. Both now use the shared `Pagination`, and filter changes reset to page 1.
- **Inconsistent — Incident Log.** Used separate From/To date inputs defaulting to the last 30 days, against `cliniq-date-range-patterns`. It now uses the shared `DateRangePicker` defaulting to All.
- **Inconsistent — Incident Report (#18).** Vitals were labelled with raw data keys (`temperatureC`, `pulseBpm`, `treatmentNotes`) and the timestamp was ISO. It now shows plain labels with units and the shared date format.
- **Inconsistent — Incident Report (#18).** "Approve report", an irreversible sign-off, applied on one click. It now asks for confirmation first, like the Excuse Letter's approval gate.
- **Inconsistent — New Visit Entry (#11).** A successful Save left the form filled, so a second click recorded the visit twice; Reference 2 says success clears the form. It now clears after every successful save, and the confirmation banner stays.
- **Inconsistent — Add/Edit User (#34).** Submitting empty did nothing and showed nothing. Inline required-field messages were added, along with an `h1` page header; the page had none.
- **Inconsistent — Edit User (#34) and Edit Inventory Item (#29).** The load-error state had no retry action. "Try again" was added.
- **Inconsistent — Login (#1) and Force Password Change (#2).** An empty submit showed the browser's native tooltip instead of CLINIQ's inline field errors. They now use inline messages.
- **Inconsistent — accessibility landmarks.** Nine shell screens (QR desktop, QR print, Reports, Audit Log, Users, Add User, Backup, Parent Notifications, Incident Report) nested a second `<main>` inside the shell's, and the Instructor profile had none (axe `landmark-no-duplicate-main`, `landmark-one-main`). Each screen now has exactly one `main`.
- **Inconsistent — Follow-Up List (#18c).** The Cancelled status badge had no icon, while every other status badge has one. It now has one.
- **Inconsistent — QR mobile hub (#23), 390px.** Scan QR Code was desktop-sized (40px) although Reference 4 makes it the dominant, thumb-sized control; it is now 56px on phones. The floating "Shortcuts ?" keyboard-help button covered "Look up student"; it is now hidden below `md`.
- **Cosmetic — QR quick actions.** "Dispense Medicine" used a grey neutral style unlike its sibling actions, and "Log Emergency" had no horizontal padding. Both now match.
- **Cosmetic — grade-level dropdowns (Student List, Add/Edit Student).** "Kinder" was sorted after "Grade 12". It now comes first.

**Confirmed gaps logged, not fixed (each needs a product or scope decision first):**

- **Broken — PE/Sports Injury Referral (#14), Staff.** The `/visits/pe-referral` route is linked from nowhere, and it always files the referral against a hardcoded demo student with no way to choose one. Decide the entry point (Visit flow, QR quick-actions, Instructor-initiated?) and how the student is identified. The Audit box was un-checked.
- **Inconsistent — Visit Log (#10) vs `ADR-010`.** The list shows "Visit recorded" instead of the complaint, and a test asserts no complaint column. ADR-010 (Option A) names the Visit Log as a list where the reason stays visible. This was left as-is because it widens health-data exposure on a shared screen. Decide whether to show the complaint or amend ADR-010. The Audit box was un-checked.
- **Inconsistent — Follow-Up List (#18c).** Only "Mark completed" exists; there is no way to mark Missed or Cancelled, and no follow-up view/edit (which Screen-Inventory says shows the full name). The Audit box was un-checked.
- **Inconsistent — Staff Dashboard (#4).** Staff land on the shared Clinic Overview (#31). #4's backup-status widget and quick "New Visit" action are absent, and it shows range totals rather than a "today's visit count" card. No ADR merges #4 into #31, and #4 has no checklist row. Decide whether #4 is folded into #31 (and record it) or built.
- **Inconsistent — New Visit Entry (#11) without `?student=`.** Opening `/visits/new` directly still uses a hardcoded demo student. Every in-app link passes a student, but Screen-Inventory lists "student lookup" as part of #11. Reuse the Stage-1 Student Number pattern, or redirect to lookup.
- **Inconsistent — primary-button contrast, all roles.** White 14px semibold labels on `brand-green` (#039935) measure 3.74:1 and fail WCAG AA for normal text. axe flagged this on 15 Staff screens plus Admin Reports and Instructor QR. Design-System.md contradicts itself: the Color System says small white text never goes on `brand-green`, while Button Hierarchy says button labels pass. Decide between a `brand-green-dark` fill and larger/bolder labels, then update Design-System.md.
- **Inconsistent — date/time formats.** ISO dates appear on Follow-Ups (due date), Inventory (expiration), User List (last login), Parent Notifications (attempts), the Instructor lookup history, the Incident Report selector, and the Incident Archive. Elsewhere the format is "Sep 30, 2026 · 7:48 AM", and the Student Profile and Visit Detail use 24-hour "08:42". The Incident Archive also sorts oldest-first while the Incident Log sorts newest-first. Pick one display format and order.
- **Inconsistent — Add User accepts a duplicate username** (e.g. `demo.nurse`), unlike Add Student's duplicate check. It needs a frontend check now and a unique constraint in the backend phase.
- **Inconsistent — no navigation below the `lg` breakpoint.** On shell screens the sidebar is hidden with no menu replacement. This matters for screens opened from mobile QR quick-actions (New Visit, Incident Entry, Dispense, Profile), where only browser Back leaves the screen. Decide whether mobile shell navigation is in scope.
- **Inconsistent — the shared `Modal` doesn't move or trap focus.** This session's dialogs set `autoFocus` on Cancel as a workaround. Add focus management to the shared component.
- **Cosmetic — Parent Notifications.** Adding an attempt reloads the page and swaps the whole screen for the skeleton for about 1–2 seconds, because `reload()` clears data.
- **Cosmetic — QR lookup.** A previous "Student not found" message stays visible after a new camera scan starts.
- **Cosmetic — Student Profile.** The "Overview" card and the sidebar "Overview" group share an accessible name (axe `landmark-unique`).
- **Cosmetic — capitalization.** It's inconsistent across titles and buttons: "Add Student" vs "Add inventory item" vs "Add user"; "Save Student" vs "Save changes" vs "Create user"; "Mark Reviewed" vs "Mark completed" vs "Mark as verified". This needs a sentence-case or title-case rule.

**Judgment calls, for a visual/product decision (not rule violations):**

- **Page titles read like spec labels:** "Visit Log List", "Incident Log List", "Visit Detail/Edit" (with a slash), "Incomplete Records Review Queue", "QR Code Print View".
- **Page structure varies.** The Dashboard header is uncarded while every other screen uses a header card. Content widths vary (1180/1120/1040/960/900/760px), so Backup and Add User look noticeably narrower and off-center compared with neighbouring screens.
- **The desktop "Shortcuts ?" floating button** sits over the bottom-right of long tables at 1440×900. On Follow-Ups it lands beside the last row's "Mark completed".
- **Internal record IDs are shown to users:** the Excuse Letter reads "source visit visit-0001", including on the printed letter, and the Audit Log shows "Incident incident-0022".
- **The Incident Report** is a single-record sign-off screen but embeds a dropdown of every incident, so switching records there risks approving the wrong one. Its "generated summary" also omits hospital referral and parent-notification outcomes.
- **"Use PE Defaults"** sits in the PE Referral page header, far from the fields it fills, and fills only 2 of the 5 required fields.
- **The mobile Emergency button** is labelled literally "Emergency button".
- **No confirmation on two irreversible actions.** "Mark completed" (Follow-Ups) can't be undone from the UI, and "Mark as verified" (Backup) records permanently. Decide whether these routine actions warrant a confirmation.
- **Small text for a low-vision audience.** Sidebar group labels (10–11px uppercase), the brand subtitle (10px), and calendar event tags (11px) are small for the audience Design-System.md describes.
- **Dashboard low-stock list** truncates item details ("9 tablets in …") when an item name wraps at 1440px.
- **The Follow-Ups Status select** stretches to about 320px, much wider than its content, unlike the other filter controls.
- **Privacy classification to confirm:** the Incomplete Records Review Queue (#9) lists full names in a multi-student view. It looks like a masterlist-style roster (no medical fields), but `cliniq-display-privacy` says to ask when a screen doesn't cleanly fit either case.

## Open product decisions from the mock-data layer — Monday, September 28, 2026 — 09:19

*(This entry was lost when a zip overwrote the file and was rebuilt from `ADR-014` and that session's log.)*

- **Config values now in `mock-db.json`, carried over from the Dashboard mock — not requirements, they need a team or nurse decision:** `frequentVisitorMinVisits` (3), `frequentVisitorWindowDays` (30; the Dashboard uses its selected range instead), `upcomingFollowUpDays` (7), `expiryWarningDays` (30), `clusterMinCount` (8), `clusterRatio` (2), `topComplaints` (5). Also open: whether stock *at* the threshold counts as low (currently strictly below).
- **`frontendOnly` data to review when the ERD is designed:** `devAccounts` (credentials, `mustChangePassword`), `visitComplaintTypes` (incl. Smart Triage steps), `incidentComplaintTypes`, `inventoryTransactions`, `recordReviews`, `excuseLetterApprovals`, `peReferrals`.

## Resolved since last update

- **Tuesday, September 29, 2026 — 09:34 — F2 authentication screens:** Login (#1) and Force Password Change (#2) now exist as frontend-first mock screens. Login covers generic failures, five-attempt/30-minute lockout, role-aware redirects, and login audit calls; Force Password Change covers the 8-character minimum, recent-password reuse check, first-login completion, and update audit call. Production Sanctum enforcement, token expiry, and server-side password history remain Phase B2 work.

## Format for new entries
When you find or resolve something, add it here with a date and enough context that someone with zero memory of the conversation that created it can still act on it.
