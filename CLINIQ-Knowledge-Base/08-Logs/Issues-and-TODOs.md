# Issues and TODOs

## Open decisions, waiting on someone outside the dev team

- **Physical barcode/QR scanner for the clinic PC.** Raised in a September 24 team discussion (garbled AI transcript, low confidence on specifics): MCA may already have an existing student masterlist with barcoded student IDs; a USB scanner (~₱1,000–2,500, possibly Principal-funded) was discussed as a way to import/use that existing data instead of building `YYYY-NNNNN` numbers from scratch. **Explicitly not being acted on** — team decided to keep building the current design and revisit only if the school approves the proposal. If approved, expect this to touch: `06-Decisions/ADR-005` (Student Number scheme), the QR module, and the Project Plan's Section 1.4 "RFID/barcode hardware" out-of-scope line.
- **Full school-events calendar** — who would maintain it (Staff, adding workload, vs. Admin/Principal, who has no write access today) is unresolved. Current phase uses lightweight free-text event tagging instead.
- **Canteen Staff QR access** — designed, not built. No blocker, just not this phase.
- **Additional backup layer beyond local + external drive** — team is still evaluating what this should be (possibly off-site/cloud). Not yet decided.
- **Who manages the system when the nurse is absent** — pending a reply from Ms. Jennesse Baas.

## Report an Issue follow-up

- **Recipient email.** Temporary placeholder `team@example.com` is used by the footer modal's `mailto:` fallback; replace it with the team's real contact in `frontend/src/features/issue-reports/reportIssueConfig.ts` when one is designated. Added Thursday, October 01, 2026 — 13:09 PHT.

## Login redesign follow-ups — Saturday, October 03, 2026 — 02:11 PHT

- **Official school photo for the Login backdrop.** Updated Saturday, October 03, 2026 — 02:21 PHT: a stand-in is now in place at `frontend/public/brand/login-backdrop.jpg`, a frame from a campus drone video of the main building, blurred in CSS. Replace it with an official Mendez Christian Academy photo when one is available: same path, no code change. The unused alternative `frontend/public/brand/campus-courtyard.jpg` (~0.9 MB) still ships in the build; delete it if it isn't wanted.
- **Force Password Change (#2) still uses the old plain gray layout**, so the first-login flow changes look between Login and that screen. Left as-is by the requester's choice (Login-only scope); decide whether it should share the backdrop.
- **The shared `Modal` overlay doesn't scroll.** A dialog taller than the viewport is centered with its top and bottom off-screen, so on a phone its ✕ and Close are unreachable. Demo Accounts works around it with a local `max-h`/`overflow-y-auto`; a shared fix in `frontend/src/components/ui/Modal.tsx` would cover every dialog.
- **`BrandLogo` academy subtitle is 11px**, below the Design-System 12px floor (pre-existing; now also shown on Login).

## Verification notes

- Saturday, October 3, 2026 — 14:52 PHT — **Dashboard trend table “no longer horizontally scrollable” not reproduced.** Before any change, with `fixedLayout` + `[&_table]:min-w-max` at 1280px, the table overflowed and a real horizontal wheel scrolled it to its maximum: Last 30 days 1828px in a 585px scroller (max 1243), This year 1590px (max 1005), All 1846px (max 1261). It also scrolled at 390/768/1024/1440px. On the default This month range (3 days into October) the table has only 3 period columns, so there is just 91px to scroll, which may have looked like no scrolling. Only Chromium could be tested.
- Saturday, October 3, 2026 — 13:58 PHT — **Dashboard Alerts row “blank middle card” not reproduced.** Live Playwright checks of `FrequentVisitorsAlert` at 1440/1280/1024/900/768px, across every date-range preset (mid-refetch and settled), the first-load skeleton (`?mock=slow`), `?mock=empty`, print media, and a generated PDF all rendered its header, count, and empty state. The only headerless blank card reproduced was a full-page-screenshot artifact: a capture taken while scrolled paints sticky elements (AppShell bar, Visits trend header) at the scroll position, leaving the Visits trend card looking empty. If it recurs, note the width, range, scroll position, and how the screenshot was taken.
- Thursday, October 01, 2026 — 15:42 PHT — `npm run lint` currently fails on the pre-existing `react-hooks/set-state-in-effect` error in `frontend/src/features/issue-reports/ReportIssueModal.tsx`; the Dashboard inventory badge change does not touch that file.

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

- **Saturday, October 3, 2026 — 14:52 PHT — Dashboard trend table relied on `min-width: max-content` with `table-layout: fixed`.** That pairing worked in Chromium but isn't consistently defined across browsers. The table now keeps `fixedLayout`, which keeps its column widths stable under the zero-activity toggle, and overflows through an explicit `minTableWidth` equal to its column sum.
- **Saturday, October 3, 2026 — 13:58 PHT — Dashboard Alerts lists overflowed in print.** Print lifts each `ListCard` height cap, but the Alerts grid kept its fixed `26rem` rows, so full follow-up and inventory lists spilled over the Visits trend / Common complaints row. The grid now uses `print:auto-rows-auto`; screen layout is unchanged.
- **Saturday, October 3, 2026 — 14:13 PHT — Dashboard trend granularity could contradict the date range.** Daily was selectable on All (re-creating the 50+ column problem) and Yearly on Today. The manual toggle is removed; `trendGranularityFor` derives the bucket size from the range preset and span. An empty All range no longer builds monthly buckets back to 1900.
- **Saturday, October 3, 2026 — 03:07 PHT — Dashboard Chart control covered while scrolling.** The Visits Trend card header now sticks below the AppShell top bar (`top-16`, below the shell's `z-30` layer), keeping Chart/Table controls visible and clickable while the dashboard scrolls.

- **Saturday, October 3, 2026 — 02:20 PHT — Dashboard Chart control unreachable for one-period ranges.** The earlier mode-state correction made the automatic table fallback keep Table selected, so Chart could not be selected. The fallback is now explicit: Chart and Table both remain interactive, with the single-period comparison notice retained.

- **Saturday, October 3, 2026 — 02:07 PHT — Dashboard trend table overlapped the sticky top bar while scrolling.** The shared AppShell header was `z-10`, below the DataTable sticky edge cells at `z-20`; it now uses `z-30`, keeping table stickies below the header while preserving their horizontal-scroll behavior.

- **Saturday, October 3, 2026 — 02:02 PHT — Dashboard trend mode mismatch.** With a month-to-date range containing one weekly bucket, the Visits Trend component correctly rendered its table fallback but left the Chart segment selected. The control now reflects the rendered Table mode; the This month range and its possibly empty frequent-visitor card remain intentional.

- **Thursday, October 1, 2026 — 15:23 PHT — Dashboard trend-table visible Total mismatch.** With the newest-12-period table cap, a complaint whose cases existed only in an earlier hidden period could show zero in every visible period but still show its full-range Total. The table Total now sums only the displayed periods; chart and Common complaints totals remain full-range.

- **Thursday, October 1, 2026 — 15:18 PHT — Dashboard trend-table edge visibility and weekly header density.** The Total summary could disappear during horizontal scrolling, the Complaint column was wider than the current content required, and weekly table headers repeated “Week of.” Resolved with shared right-edge stickiness, data-derived Complaint width, and compact weekly Table labels; chart wording remains explicit.

- **Thursday, October 1, 2026 — 15:02 PHT — Dashboard complaint-trend table usability.** The weekly table could lose the Complaint column under horizontal scroll, render an unreadable number of period columns, and make zero-activity complaint types compete with active rows. Resolved with shared `DataTable` sticky-first-column support, a table-only newest-12-period window plus overflow note, and a Show all complaint types toggle; the Common complaints card remains full-range and unchanged.

- **Thursday, October 1, 2026 — 08:31 PHT — Dashboard trend-table overflow.** The fixed layout applied to the complaint-trend fallback table made its many period columns divide the card width, so headers and values overlapped. Resolved by assigning deliberate widths to the complaint, period, and total columns and setting an intrinsic minimum table width so the existing focused horizontal scroller is used.

- **Thursday, October 1, 2026 — 07:33 PHT — Filter-driven table movement.** Changing grade levels or other filters could redistribute columns because the shared tables used browser auto-layout. All current DataTables now opt into a fixed layout; Student List columns have explicit widths, and visible table captions are hidden while remaining available to screen readers.

- **Wednesday, September 30, 2026 — 22:55 — Security/accountability gap found and fixed: the app required no Login.** A never-signed-in browser could open every route, including the QR hubs, Emergency, Incident Stage 1, and Reports; `?role=instructor` impersonated any role; Log out did not block the next visit; and `/force-password-change?user=<id>` could set any account's password. Now a session exists only after Login, every route redirects to Login without one (and returns the user afterwards), a first-login account has no session until its password is changed, and Log out ends access. Recorded in `06-Decisions/ADR-002-QR-Staff-Only-Redesign.md` (security clarification). The backend must enforce the same rule in Phase B2.
- ~~**Broken — PE/Sports Injury Referral (#14), Staff.** The `/visits/pe-referral` route is linked from nowhere, and it always files the referral against a hardcoded demo student with no way to choose one. Decide the entry point (Visit flow, QR quick-actions, Instructor-initiated?) and how the student is identified. The Audit box was un-checked.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: it is now the 5th Student Quick-Action ("PE/Sports Referral") on the desktop hub and mobile quick-actions, pre-filled through `paths.peReferral(studentNumber)`. Opened without a student, it asks for the Student Number; it never uses a default student. "Use PE Defaults" moved beside the fields and fills all five.
- ~~**Inconsistent — Visit Log (#10) vs `ADR-010`.** The list shows "Visit recorded" instead of the complaint, and a test asserts no complaint column. ADR-010 (Option A) names the Visit Log as a list where the reason stays visible. This was left as-is because it widens health-data exposure on a shared screen. Decide whether to show the complaint or amend ADR-010. The Audit box was un-checked.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: the owner confirmed ADR-010 stands. The Visit Log shows the complaint beside the Student Number (`VisitLogListPage.tsx`, `visitLogApi.ts`), search covers it, and the test now asserts it. The stale "unresolved" text in `cliniq-display-privacy` was corrected.
- ~~**Inconsistent — Follow-Up List (#18c).** Only "Mark completed" exists; there is no way to mark Missed or Cancelled, and no follow-up view/edit (which Screen-Inventory says shows the full name). The Audit box was un-checked.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: each pending row has one status select (Completed / Missed / Cancelled). Missed and Cancelled ask for confirmation; Completed applies at once. By the owner's decision there is no separate follow-up detail screen, and Screen-Inventory #18c now says so.
- ~~**Inconsistent — Staff Dashboard (#4).** Staff land on the shared Clinic Overview (#31). #4's backup-status widget and quick "New Visit" action are absent, and it shows range totals rather than a "today's visit count" card. No ADR merges #4 into #31, and #4 has no checklist row. Decide whether #4 is folded into #31 (and record it) or built.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: Staff get a strip under the Dashboard header with a "New Visit" action and a backup-status indicator (status + last-backup date) linking to Backup (`dashboard/components/StaffShortcuts.tsx`). Recorded in Reference-Screens.md Reference 1, Screen-Inventory #4, and an ADR-011 amendment. Admin does not see it.
- ~~**Inconsistent — New Visit Entry (#11) without `?student=`.** Opening `/visits/new` directly still uses a hardcoded demo student. Every in-app link passes a student, but Screen-Inventory lists "student lookup" as part of #11. Reuse the Stage-1 Student Number pattern, or redirect to lookup.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: New Visit shows the same Student Number field as Incident Stage 1 (shared `StudentNumberField` + `useIdentifiedStudent`) and no longer falls back to a demo student.
- ~~**Inconsistent — primary-button contrast, all roles.** White 14px semibold labels on `brand-green` (#039935) measure 3.74:1 and fail WCAG AA for normal text. axe flagged this on 15 Staff screens plus Admin Reports and Instructor QR. Design-System.md contradicts itself: the Color System says small white text never goes on `brand-green`, while Button Hierarchy says button labels pass. Decide between a `brand-green-dark` fill and larger/bolder labels, then update Design-System.md.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: primary buttons are filled `brand-green-dark` (9.19:1). Design-System.md's contradicting lines were corrected, with the canonical Frontend Context Brief and `cliniq-interactive-states`. axe reports no contrast violation on any route for any role.
- ~~**Inconsistent — date/time formats.** ISO dates appear on Follow-Ups (due date), Inventory (expiration), User List (last login), Parent Notifications (attempts), the Instructor lookup history, the Incident Report selector, and the Incident Archive. Elsewhere the format is "Sep 30, 2026 · 7:48 AM", and the Student Profile and Visit Detail use 24-hour "08:42". The Incident Archive also sorts oldest-first while the Incident Log sorts newest-first. Pick one display format and order.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: one format everywhere, `Sep 27, 2026 · 9:05 AM` (12-hour, Philippine time), through `formatDateTime`/`formatDate` in `lib/dates.ts`; five local copies and every raw ISO display were removed; the rule is in Design-System.md. The Incident Archive's sort order was not part of the decision and is logged below.
- ~~**Cosmetic — capitalization.** It's inconsistent across titles and buttons: "Add Student" vs "Add inventory item" vs "Add user"; "Save Student" vs "Save changes" vs "Create user"; "Mark Reviewed" vs "Mark completed" vs "Mark as verified". This needs a sentence-case or title-case rule.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: every button label is Title Case, and the rule is in Design-System.md. Page titles were made Title Case in the same pass.
- ~~**Page titles read like spec labels:** "Visit Log List", "Incident Log List", "Visit Detail/Edit" (with a slash), "Incomplete Records Review Queue", "QR Code Print View".~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: renamed to what a nurse would read: Visit Log, Incident Log, Visit Details, Incomplete Records, New Visit, Report Incident, Excuse Letter, Print QR Health IDs, PE/Sports Injury Referral.
- ~~**Page structure varies.** The Dashboard header is uncarded while every other screen uses a header card. Content widths vary (1180/1120/1040/960/900/760px), so Backup and Add User look noticeably narrower and off-center compared with neighbouring screens.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: two container tokens only, `max-w-page-wide` (1200px) and `max-w-page-narrow` (720px), defined in `index.css`, documented in Design-System.md, and applied to every screen; Student Profile, Visit Details, and Excuse Letter now stack in one column. The uncarded Dashboard header was not part of the decision and is logged below.
- ~~**The desktop "Shortcuts ?" floating button** sits over the bottom-right of long tables at 1440×900. On Follow-Ups it lands beside the last row's "Mark completed".~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: the button moved into the shell header, so nothing floats over table content; `?` still opens the list.
- ~~**Internal record IDs are shown to users:** the Excuse Letter reads "source visit visit-0001", including on the printed letter, and the Audit Log shows "Incident incident-0022".~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: the Excuse Letter (screen and print) and the Audit Log describe a record by Student Number and time instead of `visit-0001`. The backend reference number is logged below as a follow-up.
- ~~**The Incident Report** is a single-record sign-off screen but embeds a dropdown of every incident, so switching records there risks approving the wrong one. Its "generated summary" also omits hospital referral and parent-notification outcomes.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: the picker lists only reports pending sign-off (derived from the audit trail), an approved report can't be approved again, and the summary now includes hospital referral and parent-notification attempts.
- ~~**"Use PE Defaults"** sits in the PE Referral page header, far from the fields it fills, and fills only 2 of the 5 required fields.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: the button sits in the Referral details card header beside the fields and fills all five. The three clinical defaults are placeholder wording; see the follow-up below.
- ~~**The mobile Emergency button** is labelled literally "Emergency button".~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: relabelled "Emergency".
- ~~**No confirmation on two irreversible actions.** "Mark completed" (Follow-Ups) can't be undone from the UI, and "Mark as verified" (Backup) records permanently. Decide whether these routine actions warrant a confirmation.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: Backup "Mark as Verified" now confirms first. Follow-Ups: Missed and Cancelled confirm; Completed does not, following the owner's more specific instruction for #18c (see the note below).
- ~~**Small text for a low-vision audience.** Sidebar group labels (10–11px uppercase), the brand subtitle (10px), and calendar event tags (11px) are small for the audience Design-System.md describes.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: sidebar group labels, the brand subtitle, and calendar event tags are 12px; no rendered text is below 12px on any route, and the minimum is a Design-System.md rule.
- ~~**Dashboard low-stock list** truncates item details ("9 tablets in …") when an item name wraps at 1440px.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: list rows wrap their detail line instead of truncating it (shared `ListRow`).
- ~~**The Follow-Ups Status select** stretches to about 320px, much wider than its content, unlike the other filter controls.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: it sizes to its content (127px instead of about 320px).
- ~~**Privacy classification to confirm:** the Incomplete Records Review Queue (#9) lists full names in a multi-student view. It looks like a masterlist-style roster (no medical fields), but `cliniq-display-privacy` says to ask when a screen doesn't cleanly fit either case.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 22:55: decided: the queue keeps full names, because it is a missing-paperwork list with no health information. Written into `cliniq-display-privacy` as a decided edge case.
- ~~**Inconsistent — Add User accepts a duplicate username** (e.g. `demo.nurse`), unlike Add Student's duplicate check. It needs a frontend check now and a unique constraint in the backend phase.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 20:18: `saveUser` (`frontend/src/lib/mock-db/api.ts`) now rejects a username another account uses, case-insensitively, matching how Login looks accounts up; Add/Edit User shows an inline error and writes nothing.
- ~~**Inconsistent — the shared `Modal` doesn't move or trap focus.** This session's dialogs set `autoFocus` on Cancel as a workaround. Add focus management to the shared component.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 20:18: `frontend/src/components/ui/Modal.tsx` now moves focus into the dialog (to a `data-autofocus` child, else the first control), keeps Tab and Shift+Tab inside it, and returns focus to the opener on close. It also uses a unique title id. The Archive and Approve dialogs mark Cancel with `data-autofocus`.
- ~~**Cosmetic — Parent Notifications.** Adding an attempt reloads the page and swaps the whole screen for the skeleton for about 1–2 seconds, because `reload()` clears data.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 20:18: fixed in the shared `frontend/src/hooks/useAsyncData.ts`. `reload()` now keeps the last loaded data on screen (`isRefetching`), as the hook's own contract says, instead of clearing it, so a save no longer flashes the skeleton. This also covers Dispense and Profile archive. A failed load still shows the skeleton on retry.
- ~~**Cosmetic — QR lookup.** A previous "Student not found" message stays visible after a new camera scan starts.~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 20:18: the shared `QrScannerView` gained an `onScanStart` callback; the mobile (Staff/Instructor) and desktop hubs clear a previous lookup error when the camera starts.
- ~~**Cosmetic — Student Profile.** The "Overview" card and the sidebar "Overview" group share an accessible name (axe `landmark-unique`).~~ (UI/UX review, Wednesday, September 30, 2026 — 19:55) Resolved Wednesday, September 30, 2026 — 20:18: the sidebar nav groups (`frontend/src/layouts/Sidebar.tsx`) are now named `role="group"` elements instead of labelled `<section>`s, so they no longer register as landmark regions that collide with page regions such as the profile's "Overview". axe reports no violations on the profile.
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

- **Canonical Frontend Context Brief §5 needs the optional AuditLogEntry `summary` field** (Friday, October 2, 2026 — 00:28 PHT). ADR-017 added it (field names only, never values). ERD.md is updated; the canonical brief's AuditLogEntry line still lists only user / action / target / timestamp.

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

- **Inconsistent — no navigation below the `lg` breakpoint.** On shell screens the sidebar is hidden with no menu replacement. This matters for screens opened from mobile QR quick-actions (New Visit, Incident Entry, Dispense, Profile), where only browser Back leaves the screen. Decide whether mobile shell navigation is in scope.
- **Inconsistent — Desktop QR Scan/Lookup (#23), Staff, 1440px (found Wednesday, September 30, 2026 — 20:18, while fixing the stale-message item).** Before any lookup, the page shows a skeleton placeholder under the scanner, although nothing is loading. Design-System.md reserves skeletons for data in flight. The idle state should be an empty/instruction state or nothing. Not fixed: it was outside the review's findings list.

**Judgment calls, for a visual/product decision (not rule violations):**

- All 12 were decided by the project owner and resolved on Wednesday, September 30, 2026 — 22:55; see "Resolved since last update".


### Open after the Group B fixes — Wednesday, September 30, 2026 — 22:55

Left open by the session that applied the review's Group B decisions (`08-Logs/Agent-Sessions/2026-09-30-login-gate-and-group-b-fixes.md`).

**Not covered by the decisions given, so not changed:**

- **No navigation below the `lg` breakpoint** (still listed above). Is mobile shell navigation in scope?
- **The Dashboard header is uncarded** while other screens use a header card. The page-width decision covered widths only.
- **The Incident Archive sorts oldest-first**; the Incident Log sorts newest-first. The date decision covered format only.
- **Desktop QR Scan/Lookup idle skeleton** (still listed above): a confirmed bug outside the review's list, awaiting a go-ahead.

**Choices made while implementing, for the owner to confirm or reverse:**

- **Follow-Up "Completed" has no confirmation.** The #18c instruction said to confirm Missed and Cancelled "specifically (not Completed)"; the irreversible-actions instruction said to add one to "Mark completed". They conflict, so the more specific one was followed. Adding the confirmation is a one-line change in `FollowUpListPage.tsx` (`chooseStatus`).
- **Primary-button hover lightens slightly** (`hover:brightness-125`, about 6.9:1). No source says what hover does once the fill is already the darkest brand green.
- **"Use PE Defaults" wording for the three clinical fields is placeholder text** ("Injury reported during PE/Sports activity. Area affected: ", "Assessed in the clinic. Findings: ", "First aid given: "). No requirement specifies it. The School Head Nurse should confirm or replace it (`features/clinic-visits/api/peReferralApi.ts`, `CLINICAL_DEFAULTS`).
- **A Stage-1 ("Needs completion") incident can still be signed off.** "Pending sign-off" was implemented as "not yet approved". Should sign-off require a completed incident?

**Follow-ups for the backend phase:**

- **A human-facing reference number for printed documents.** Excuse Letters, Incident Reports, and the Audit Log now identify a record by Student Number and time, because internal ids must never be shown. The backend needs a real reference number scheme for printed documents.
- **Server-side authentication and authorization (Phase B2).** The Login gate is enforced in the frontend mock only; Sanctum must enforce login and role access on every endpoint, and the password-change endpoint must act only on the authenticated account.

**New findings from this session's live re-verification:**

- **Cosmetic — Dashboard at 390px, Staff.** axe reports `scrollable-region-focusable` on a horizontally scrolling region (not keyboard-focusable). The Dashboard is a desktop screen, so this is low priority.
- **Inconsistent — Add/Edit Student's duplicate-record dialog is hand-built** instead of using the shared `Modal`, so it lacks the focus handling `cliniq-modal-patterns` now requires.

### Open after the dropdown consistency pass — Wednesday, September 30, 2026 — 23:22

Left open by the session that made every dropdown match the Dashboard's date-range control (`08-Logs/Agent-Sessions/2026-09-30-dropdown-consistency.md`).

**Choices made while implementing, for the owner to confirm or reverse:**

- **Dropdowns and text inputs now differ more visibly inside forms.** A dropdown's value is semibold with a light `border-border` and a soft shadow (the reference's look); an `Input` beside it has regular-weight text and the darker `border-text-secondary`. Aligning them means changing `Input`, which was out of scope.
- **Filter rows pair a 32px search `Input` with a 40px dropdown.** Visit Log and Incident Log now match Student List and Inventory in this. One height for both needs a decision on `Input`.
- **A placeholder stays in the option list as its first row** ("Update status", "Select complaint"), as it did in the native control. Choosing it changes nothing.

**New findings from this session's live verification:**

- **Cosmetic — top bar at 390px.** With a visible vertical scrollbar (375px usable width), the account area in the top bar overflows the page by 7px, on every shell screen. Not caused by the dropdown work.
- **Cosmetic — long option labels at 390px.** On Dispense Item the option text ("Salbutamol Nebule 2.5mg — 14 nebules available") is cut at the panel's right edge. The panel itself stays inside the viewport.

## Resolved since last update

- **Thursday, October 1, 2026 — 00:04 PHT — Resolved remaining actionable frontend review findings.** The shared shell now provides role-aware mobile navigation below `lg`, with compact header identity treatment to prevent the 390px overflow. The Dashboard header now uses the shared Card surface; the Incident Archive now sorts newest-first; the desktop QR hub shows an instructional empty state rather than an idle skeleton; and all shared horizontally scrollable DataTables are keyboard-focusable with a visible focus ring. Add/Edit Student now uses the shared keyboard-safe Modal. Shared text inputs now match standard selects (40px, `border-border`, semibold, light shadow), and Dispense Item uses a concise mobile-safe stock option label. The completed follow-up/PE-default/stage-1 sign-off items remain product decisions, not implementation defects.

## Open product decisions from the mock-data layer — Monday, September 28, 2026 — 09:19

*(This entry was lost when a zip overwrote the file and was rebuilt from `ADR-014` and that session's log.)*

- **Config values now in `mock-db.json`, carried over from the Dashboard mock — not requirements, they need a team or nurse decision:** `frequentVisitorMinVisits` (3), `frequentVisitorWindowDays` (30; the Dashboard uses its selected range instead), `upcomingFollowUpDays` (7), `expiryWarningDays` (30), `clusterMinCount` (8), `clusterRatio` (2), `topComplaints` (5). Also open: whether stock *at* the threshold counts as low (currently strictly below).
- **`frontendOnly` data to review when the ERD is designed:** `devAccounts` (credentials, `mustChangePassword`), `visitComplaintTypes` (incl. Smart Triage steps), `incidentComplaintTypes`, `inventoryTransactions`, `recordReviews`, `excuseLetterApprovals`, `peReferrals`.

## Resolved since last update

- **Tuesday, September 29, 2026 — 09:34 — F2 authentication screens:** Login (#1) and Force Password Change (#2) now exist as frontend-first mock screens. Login covers generic failures, five-attempt/30-minute lockout, role-aware redirects, and login audit calls; Force Password Change covers the 8-character minimum, recent-password reuse check, first-login completion, and update audit call. Production Sanctum enforcement, token expiry, and server-side password history remain Phase B2 work.

## Resolved since last update

- **Thursday, October 01, 2026 — 22:33:50 PHT — Logout icon animation:** Removed the misleading `animate-spin` state from the desktop shell and shell-free mobile logout controls. The controls still disable repeat clicks and preserve the logout audit/session flow.

- **Thursday, October 01, 2026 — 22:42:14 PHT — Calendar card clarity:** Dashboard day cards now show compact short-month dates and labelled visit totals; their heatmap colors, detailed tooltips, and event tags are unchanged.

## Format for new entries
When you find or resolve something, add it here with a date and enough context that someone with zero memory of the conversation that created it can still act on it.
