# Frontend Loop Engineering — Build Everything, Then Cross-Check & Audit Everything

This is the **operating manual an agent keeps open while actually building**, not a one-time read. `Development-Phases.md` says *what* to build and in what order (F0→F3); this file says *how*, and gives a resumable checklist so a fresh agent can pick up exactly where a previous one stopped — including mid-token-limit, mid-screen.

**Frontend only.** This covers F0–F3. There is no backend equivalent of this file yet.

**Sequencing, revised from the original per-screen loop:** build every screen first, completely, before any cross-checking or auditing happens. Don't interleave build-then-check-then-build-then-check per screen — that was the original design, and it burns tokens/credits fast, since every single screen triggered a full Countercheck+Audit+Simulate cycle before the next one could start. Now: one full Build Phase across everything, then one full Cross-Check & Audit Phase across everything, screen by screen, afterward.

**Known trade-off, accepted deliberately:** if an early screen gets a color token or a shared-component pattern wrong, every later screen that copies it inherits the mistake before anyone catches it — versus catching it on screen one under the old per-screen loop. That's a real cost. It's accepted here because the Simulate step (Phase 2) actually gets *better* under this sequencing, not worse: tracing a full cross-screen flow (QR scan → Record Visit → Follow-Up → Dashboard) only genuinely works once every screen in that chain actually exists, which wasn't true when screens were being audited one at a time as they were built.

---

## Phase 0 — Read What's Changed, Before Building Anything

**Do this once, before Phase 1 starts building any screen at all — not per screen.** Building 30 screens against a stale understanding of the design system, then discovering the mistake during Phase 2, is exactly the expensive failure mode this restructuring is supposed to avoid.

1. Read `08-Logs/Changelog.md` in full — not just skimmed, since this is the record of every rule, skill, and requirement change made since the source documents (`Design-System.md`, `Reference-Screens.md`, `Module-Overview.md`, `Screen-Inventory.md`) were last substantively rewritten.
2. Read `06-Decisions/` — every ADR, especially any dated after your last understanding of the project. Don't contradict one; if a decision seems to require reversing, stop and ask rather than building around it silently.
3. Read `08-Logs/Issues-and-TODOs.md` for open items that could affect multiple screens (e.g., the two blocking F0 decisions, the reason-visibility question flagged in the design audit).
4. Read `.claude/skills/` in full — `cliniq-display-privacy`, `cliniq-audit-trail`, `cliniq-interactive-states` (check `04-Development/Skills-Setup.md` for the current complete list; don't trust a hardcoded name list anywhere, including in this file, since that's exactly the kind of thing that goes stale).
5. Only after all four of the above: proceed to Phase 1.

**Run this phase once per continuous session, not once per screen.** If you're building several screens back to back in one session, the context from this read-through is already loaded — re-reading it before every individual screen just burns credits for no new information. Only redo Phase 0 when starting a genuinely fresh session or after a real time gap.

**Model tiering, if your environment supports switching:** the 5 reference screens (Phase 1, F1) and this Phase 0 reasoning benefit from a more capable model — they're foundational, and mistakes here propagate. Most of Phase 1's remaining F2 screens are pattern-following once F1 establishes the shared components, and don't need the same tier. See `AGENTS.md`'s "While you work" section for the full cost-conscious practices this project expects, including preferring deterministic tools (linters, test runners, accessibility CLIs) over an AI reasoning pass wherever one exists.

This step exists because of a real incident, not a hypothetical one — the Dashboard was built before `cliniq-interactive-states` existed, and needed a retroactive audit once it was added. Reading the logs first, once, before building 30+ screens, is far cheaper than discovering the same gap after everything is already built.

---

## Phase 1 — Build (Every Screen)

For each screen or shared component, in the order given in the Checklist below:

### 1. Read
Pull the exact requirements for this specific item — not the whole project, just this one:
- Its entry in `03-Design/Screen-Inventory.md` (or `Module-Overview.md` for the underlying feature logic)
- `03-Design/Design-System.md` for anything general (colors, spacing, button hierarchy, interactive states, skeleton loading)
- If it's one of the 5 reference screens, or maps to one via the extrapolation table: `03-Design/Reference-Screens.md`
- If a matching screen exists in the reference mockup image (see "Using the Reference Mockup Image" below): note what it shows, but don't build from the image alone

### 2. Build
Write the screen/component.

### 3. Log + Check Off (Build)
- Check the screen's **Build** box in the Checklist below.
- Fill in its **Build Resume Note** — one line: what's actually built, and what's next if you had to stop right now.
- Add a brief `08-Logs/Agent-Sessions/` entry if this is a natural stopping point (a full entry per screen isn't required in this phase — batching several screens into one session log entry is fine, since the detailed verification happens in Phase 2 anyway).

**Do not Countercheck, Audit, Simulate, or Confirm in this phase.** That's Phase 2, deliberately deferred, for every screen, not just this one.

**Order still matters within this phase.** Build the 5 reference screens first, in the specified order (see Checklist, Phase 1 — F1 section) — later screens reuse the shared components and patterns those five establish, and building them out of order means re-deriving patterns that already existed.

---

## Phase 2 — Cross-Check & Audit (Every Screen, Only After Phase 1 Is Entirely Done)

**Do not start this phase until every screen's Build box is checked.** For each screen, in the same order it was built:

### 1. Countercheck
Go back to the same sources read in Phase 1 and verify, item by item, that every documented requirement for *this specific screen* actually made it into what got built — not "looks about right." If a source says a field is required, confirm it exists and is marked required. If it says a button routes somewhere specific, confirm the route target. Treat this like grading against a rubric.

### 2. Audit
- **Display-privacy rule** — check against `.claude/skills/cliniq-display-privacy/`: does this screen show a name where it should show a Student Number, or vice versa?
- **Audit trail** — check against `.claude/skills/cliniq-audit-trail/`: if this screen creates/edits/deletes/approves anything, is the logging call wired in?
- **Interactive states** — check against `.claude/skills/cliniq-interactive-states/`: does every button, link, dropdown, and navigable row have a cursor state and a real hover color, not just a cursor change? Are all dropdowns/selects custom-styled, not native OS chrome?
- **Skeleton loading state** — if this screen fetches data on load (nearly all of them do), does it show a skeleton matching its final layout, not a spinner or a blank screen?
- **Accessibility** — run the accessibility skills (`better-accessibility`, `claude-a11y-skill` once installed): contrast, focus states, labels, keyboard operability.
- **Color tokens** — every color used traces back to `Design-System.md`'s actual token table, not a value picked by eye.
- **Reference mockup cross-check, where applicable** — see below.
- **Retroactive check** — was this screen built before a rule that now applies to it existed (check the Changelog dates)? If so, this Audit pass is exactly where that gets caught — don't assume Phase 0's read-through means everything built afterward automatically complies.

### 3. Simulate
Trace the **complete end-to-end flow** this screen participates in — this now works properly, since every screen actually exists by this phase. Use `02-Architecture/Database/Activity-Diagram.md`'s three diagrammed flows as the actual test script wherever this screen touches one:
- Does a QR scan correctly land here with the right pre-filled data, and does the action taken here correctly hand off to the next real screen in that flow?
- If this is part of the two-stage incident flow: does the Stage-1→Stage-2 status transition actually work end to end, not just in isolation?
- If this screen can trigger a Follow-Up: does the inline prompt appear, save correctly, and does the resulting Follow-Up actually show up on the Dashboard's due list?

### 4. Confirm
Explicit pass/fail. If anything failed Countercheck, Audit, or Simulate, fix it and re-run this phase's steps for that screen before checking its box — never check a box with a known issue "to fix later."

### 5. Log + Check Off (Audit)
- Add a full `08-Logs/Agent-Sessions/` entry per the standard `AGENTS.md` format, with a real timestamp.
- Check the screen's **Audit** box in the Checklist below.
- Fill in its **Audit Resume Note.**

---

## Using the Reference Mockup Image

`03-Design/assets/reference-mockup.png` — a 12-screen AI-generated reference, already fully audited in `03-Design/Design-Audit-Reference-Mockup.md`. **Use it during Phase 1 (Build) for layout density, spacing rhythm, and general component arrangement only.** Do not use its colors (they don't match the actual sampled brand tokens) and do not replicate its known gaps. When a screen below has a matching mockup screen, Phase 2's Audit step includes cross-checking layout against it *with the corrections already applied*:

| Screen(s) below | Matching mockup screen | Known corrections required (from the audit) |
|---|---|---|
| #1 Login | Login | None — layout is fine as reference |
| #2 Force Password Change | Force Password Change | None |
| #4 Staff Dashboard, #31 Dashboard View | Staff Dashboard, Admin Dashboard | **Add the calendar view** (absent in the mockup) and **due/upcoming Follow-Ups section** (absent) |
| #5 Admin Dashboard | Admin Dashboard | Same as above |
| #6 Student List | Student List | None — correctly shows full names (masterlist) |
| #7 Student Profile | Student Profile | None — correctly shows full name (deliberate lookup) |
| #10 Visit Log List | Visits List | Resolve the reason-visibility open question before finalizing (see audit) |
| #11 New Visit Entry | New Visit | **Do not use the "Type" dropdown pattern** — Visit and Incident must stay separate entry points, not a type selector on one form. **Add the Follow-Up prompt** (absent in the mockup) |
| #15 Incident Log List | Incident Log | **Add a Stage-1/Complete status badge** (absent in the mockup); resolve the reason-visibility open question |
| #28 Inventory List | Inventory List | None significant |
| #19/20/21 Reports | Reports | None significant |
| #26 Instructor Scan/Lookup | Mobile Lookup (Instructor) | None — concept is well-aligned |

Everything else (#3, #8, #9, #12–14, #16–18, #18b–c, #22–25, #27, #29–30, #32–34) has **no matching mockup screen** — build these from `Screen-Inventory.md` and `Design-System.md` alone.

Also see the actual first build for comparison/lessons: `03-Design/assets/dashboard-build-v1-2026-09-26.png` and its audit trail in `08-Logs/Agent-Sessions/`.

---

## Checklist

Each screen now gets **two checkboxes** — Build and Audit — since the two phases happen at different times, potentially far apart. Every checked box gets its own **Resume Note**. Leave unchecked boxes' notes blank until you actually start that item.

**A checked box is not permanently final — for either phase.** If `08-Logs/Changelog.md` shows a design-system rule, skill, or requirement was added or changed *after* a screen's Build or Audit box was checked, that box needs re-verification, not a pass on the assumption that "checked" still means "compliant." This already happened once: the Dashboard was checked off before `cliniq-interactive-states` existed. Check the Changelog against every already-checked box's date before assuming past work still holds, per `AGENTS.md`'s "Before you start" step 6 and this file's own Phase 0.

### Phase F0 — Environment, Design Foundation, Shared Components

- [ ] Build / [ ] Audit — Two blocking decisions resolved (data-fetching library, routing library) — see `Development-Phases.md` §0
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Vite scaffold run into `cliniq-frontend/`
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Confirmed dependencies installed (Tailwind, `qr-scanner`, `chart.js`+`react-chartjs-2`, Vitest+RTL)
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Design tokens (colors, typography scale, spacing) encoded into Tailwind config/CSS variables
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Shared component: Button (primary/secondary/cancel/destructive hierarchy, cursor+hover states)
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Shared component: Card
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Shared component: Badge (icon+color+label, never color alone)
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Shared component: Input
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Shared component: Dropdown/Select (custom-styled, not native chrome)
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Shared component: Modal
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Shared component: Skeleton (matching each other component's shape)
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Layout: App Shell/Nav (role-aware: Staff full, Admin Reports+Dashboard only, Instructor no shell)
  Build note: · Audit note:
- [ ] Build / [ ] Audit — Layout: mobile wrapper (for QR mobile flows)
  Build note: · Audit note:
- [ ] **F0 exit check (Audit phase only):** blank app shell renders, role-aware nav switches correctly on mock auth state, every shared component matches sampled color tokens
  Audit note:

### Phase F1 — The 5 Reference Screens (Build in This Order; Audit After)

- [x] Build / [ ] Audit — **1. Student Profile** (`features/student-records/`)
  Build note: Sunday, September 27, 2026 — 07:43: built mock-backed Student Profile with full-name deliberate lookup, Overview, Medical History chips/empty states, Visit History, Incident History with stage badges, Staff-only Edit/Print/Archive actions, Instructor read-only state, shaped skeletons, and `?screen=student-profile` preview while routing remains undecided. · Audit note:
- [x] Build / [ ] Audit — **2. New Visit Entry** (`features/clinic-visits/`) — including the Follow-Up prompt and Smart Triage panel; do NOT use a Visit/Incident type dropdown
  Build note: Sunday, September 27, 2026 — 07:47: built mock-backed New Visit Entry with identified student header, custom-styled complaint select, inline Smart Triage checklist, treatment textarea, disposition segmented control, expandable Follow-Up prompt, mock audit entries for visit/follow-up saves, shaped skeletons, validation, success state, and `?screen=new-visit` preview while routing remains undecided. · Audit note:
- [x] Build / [ ] Audit — **3. Incident Entry, two-stage** (`features/emergency-response/`) — Stage 1 and Stage 2 both built; status badge visible
  Build note: Sunday, September 27, 2026 — 07:52: built mock-backed Incident Entry with Stage 1 fast capture, Stage 2 completion on the same saved record, visible Needs completion/In progress/Complete status badges, full vitals, treatment notes, hospital referral fields, parent-notification attempt log, optional follow-up prompt, mock audit entries for both stages, shaped skeletons, validation, success state, and `?screen=incident-entry` preview while routing remains undecided. · Audit note:
- [x] Build / [ ] Audit — **4. QR Scan/Lookup Hub + Quick-Actions, mobile** (`features/qr-digital-health-id/mobile/` + `shared/`) — Staff hub, Emergency button, and Instructor read-only variant all built; shared scanner wrapper used by all three, not duplicated
  Build note: Sunday, September 27, 2026 — 07:56: installed `qr-scanner` and built mobile QR flow with shared `useQrScanner`/`QrScannerView`, Staff scan/manual/demo lookup, standalone Emergency button, Staff quick-actions, Instructor read-only lookup/history with no action buttons, full-name deliberate lookup display, mock scan audit entries, and `?screen=qr-mobile` / `?screen=qr-mobile&role=instructor` previews while routing remains undecided. · Audit note:
- [x] Build / [x] Audit — **5. Clinic Overview Dashboard** (`features/dashboard/`) — including the calendar view and due/upcoming Follow-Ups section, both absent from the reference mockup
  Build note: Built first, before the rest of F1, so its shared components now seed later screens rather than consuming earlier reference patterns; includes five stat cards, alert lists, trends, table fallbacks, calendar heatmap, date range filtering, print action, shaped skeletons, empty/error states, and mock-data aggregation. · Audit note: Sunday, September 27, 2026 — 07:38: retroactive audit passed after fixing the Staff header to keep the required "Clinic Overview" page title; checked Reference 1, Screen #31, Module 9, Design-System skeleton/interaction rules, display-privacy, audit-trail, and interactive-states.
- [ ] **F1 exit check (Audit phase only):** all 5 screens work end-to-end against mock data; accessibility pass run against each; Simulate step traced across all 5 together; ready to show the client for feedback per ADR-006
  Audit note:

### Phase F2 — Remaining Screens, Module by Module

**Student Records**
- [x] Build / [ ] Audit — #3 App Shell/Nav — Build note: Sunday, September 27, 2026 — 07:57: existing App Shell/Nav verified as the F2 #3 build with Staff grouped module navigation, Admin limited to Dashboard/Reports, Instructor returning no shell groups, Dashboard/Student/Visit/Incident/QR preview active-state support, and focused role-navigation tests. · Audit note:
- [x] Build / [ ] Audit — #6 Student List — Build note: Sunday, September 27, 2026 — 08:01: built the student masterlist with full-name/Student Number search, grade-level filter, include-archived toggle, Complete/Incomplete/Archived record-status badges, shaped skeleton loading, privacy-safe table columns with no inline medical fields, focused tests, and temporary `?screen=student-list` preview routing. · Audit note:
- [x] Build / [ ] Audit — #8 Add/Edit Student — Build note: Sunday, September 27, 2026 — 08:08: built the Staff-only Add/Edit Student form with system-assigned Student Number display, required-field validation for identity/emergency/medical-history fields, grade select styling, add/edit preview modes, duplicate-detection confirmation dialog, mock create/update audit logging, shaped skeleton loading, focused tests, and temporary `?screen=student-form` / `?screen=student-form&mode=edit` preview routing. · Audit note:
- [x] Build / [ ] Audit — #9 Incomplete Records Review Queue — Build note: Sunday, September 27, 2026 — 08:12: built the Staff-only Registrar-import review queue with open/resolved/all filters, name/Student Number/grade search, privacy-safe missing-field labels, session-level resolver tracking, mock approve audit logging, shaped skeleton loading, focused tests, and temporary `?screen=incomplete-records` preview routing. · Audit note:

**Clinic Visit Monitoring**
- [x] Build / [ ] Audit — #10 Visit Log List — Build note: Sunday, September 27, 2026 — 08:16: built the Staff Visit Log List with date-range filters, Student Number/grade/event search, disposition segmented filter, privacy-safe table rows that omit full names and complaint/treatment details pending the unresolved reason-visibility decision, shaped skeleton loading, focused tests, and temporary `?screen=visit-log` preview routing. · Audit note:
- [x] Build / [ ] Audit — #12 Visit Detail/Edit — Build note: Sunday, September 27, 2026 — 08:19: built the Staff-only deliberate visit detail/edit screen with full student name and clinical details visible, read-mode context card, edit-mode complaint/treatment/disposition/event-tag controls, inline validation, mock update audit logging, shaped skeleton loading, focused tests, and temporary `?screen=visit-detail` preview routing. · Audit note:
- [x] Build / [ ] Audit — #13 Excuse Letter Generator (+ print layout) — Build note: Sunday, September 27, 2026 — 08:23: built the Staff-only Excuse Letter Generator with visit-backed draft text, explicit not-a-medical-certificate boundary, nurse check/approval gate, mock approve audit logging, printable letter preview with print-only controls hidden, shaped skeleton loading, focused tests, and temporary `?screen=excuse-letter` preview routing. · Audit note:
- [ ] Build / [ ] Audit — #14 PE/Sports Injury Referral Form — Build note: · Audit note:

**QR Digital Health ID (remaining)**
67- [ ] Build / [ ] Audit — #23 Scan/Lookup Hub (desktop) — Build note: · Audit note:
- [ ] Build / [ ] Audit — #24 Student Quick-Actions (desktop) — Build note: · Audit note:
- [ ] Build / [ ] Audit — #25 Emergency Button (mobile) — Build note: · Audit note:

**Emergency Response (remaining)**
- [ ] Build / [ ] Audit — #17 Parent Notification Outcome Logging — Build note: · Audit note:
- [ ] Build / [ ] Audit — #18 Incident Report View/Print — Build note: · Audit note:

**Follow-Up Handling**
- [ ] Build / [ ] Audit — #18b Follow-Up Prompt — Build note: · Audit note:
- [ ] Build / [ ] Audit — #18c Follow-Up List View — Build note: · Audit note:

**Medicine & Supply Inventory Tracker**
- [ ] Build / [ ] Audit — #28 Inventory List — Build note: · Audit note:
- [ ] Build / [ ] Audit — #29 Add/Edit Inventory Item — Build note: · Audit note:
- [ ] Build / [ ] Audit — #30 Dispense/Log Usage — Build note: · Audit note:

**Reports Generation**
- [ ] Build / [ ] Audit — #19 Monthly Report View/Generate (+ print) — Build note: · Audit note:
- [ ] Build / [ ] Audit — #20 Incident Report Archive (+ print) — Build note: · Audit note:
- [ ] Build / [ ] Audit — #21 Health Summaries View (+ print) — Build note: · Audit note:

**User Management**
- [ ] Build / [ ] Audit — #33 User List — Build note: · Audit note:
- [ ] Build / [ ] Audit — #34 Add/Edit User & Role Assignment — Build note: · Audit note:

**Backup Verification Assistant**
- [ ] Build / [ ] Audit — #32 Backup Status Screen — Build note: · Audit note:

- [ ] **F2 exit check (Audit phase only):** every screen above matches its reference pattern (`Reference-Screens.md` §5 mapping table), display-privacy rule verified per screen, no orphaned mock-data dependencies left unresolved
  Audit note:

### Phase F3 — Polish & Client Demo Prep

*(This phase has no separate Build/Audit split — it's inherently a post-build pass.)*

- [ ] Keyboard shortcuts wired for highest-frequency actions (`04-Development/Keyboard-Shortcuts-and-Efficiency.md`)
  Resume note:
- [ ] Full `interface-review` accessibility sweep across every screen (not just the 5 references)
  Resume note:
- [ ] Responsive check on QR mobile flows specifically
  Resume note:
- [ ] Final Simulate pass: walk all three Activity-Diagram flows start to finish across the finished app
  Resume note:
- [ ] **F3 exit check / demo-ready:** every box above checked, every Resume Note filled, no known issues left unresolved in any Agent-Session log
  Resume note:
