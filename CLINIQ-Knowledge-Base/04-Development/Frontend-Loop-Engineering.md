# Frontend Loop Engineering — Build, Countercheck, Audit, Simulate, Confirm

This is the **operating manual an agent keeps open while actually building**, not a one-time read. `Development-Phases.md` says *what* to build and in what order (F0→F3); this file says *how* to build each individual screen without drifting from what's already been decided, and gives a resumable checklist so a fresh agent can pick up exactly where a previous one stopped — including mid-token-limit, mid-screen.

**Frontend only.** This covers F0–F3. There is no backend equivalent of this file yet.

---

## The Loop

Run this cycle for **every screen or shared component**, no exceptions, before checking its box below.

### 1. Read
Pull the exact requirements for this specific item — not the whole project, just this one:
- Its entry in `03-Design/Screen-Inventory.md` (or `Module-Overview.md` for the underlying feature logic)
- `03-Design/Design-System.md` for anything general (colors, spacing, button hierarchy)
- If it's one of the 5 reference screens, or maps to one via the extrapolation table: `03-Design/Reference-Screens.md`
- If a matching screen exists in the reference mockup image (see "Using the Reference Mockup Image" below): note what it shows, but don't build from the image alone

### 2. Build
Write the screen/component.

### 3. Countercheck
Go back to the **Read** step's sources and verify, item by item, that every documented requirement for *this specific screen* is actually present — not "looks about right." If the source says a field is required, confirm the field exists and is marked required. If it says a button routes somewhere specific, confirm the route target. Treat this like grading against a rubric, not a vibe check.

### 4. Audit
- **Display-privacy rule** — check against `.claude/skills/cliniq-display-privacy/`: does this screen show a name where it should show a Student Number, or vice versa?
- **Audit trail** — check against `.claude/skills/cliniq-audit-trail/`: if this screen creates/edits/deletes/approves anything, is the logging call wired in?
- **Interactive states** — check against `.claude/skills/cliniq-interactive-states/`: does every button, link, dropdown, and navigable row have a cursor state and a real hover color, not just a cursor change? Are all dropdowns/selects custom-styled, not native OS chrome? This was missed entirely on the first Dashboard build — verify explicitly, don't assume it's handled.
- **Skeleton loading state** — if this screen fetches data on load (nearly all of them do), does it show a skeleton matching its final layout, not a spinner or a blank screen? Per `Design-System.md`'s Feedback & System States — this applies universally, not just to the Dashboard where it was first specified.
- **Accessibility** — run the accessibility skills (`better-accessibility`, `claude-a11y-skill` once installed) against the screen: contrast, focus states, labels, keyboard operability.
- **Color tokens** — every color used traces back to `Design-System.md`'s actual token table, not a value picked by eye.
- **Reference mockup cross-check, where applicable** — see below.

### 5. Simulate
Trace the **complete end-to-end flow** this screen participates in, as if the whole app were already finished — not just this screen in isolation. Use `02-Architecture/Database/Activity-Diagram.md`'s three diagrammed flows as the actual test script wherever this screen touches one of them:
- Does a QR scan correctly land here with the right pre-filled data, and does the action taken here correctly hand off to the next screen in that flow?
- If this is part of the two-stage incident flow: does the Stage-1→Stage-2 status transition actually work, or does the screen only make sense in isolation?
- If this screen can trigger a Follow-Up: does the inline prompt actually appear, save correctly, and does the resulting Follow-Up actually show up on the Dashboard's due list later?

This step exists specifically to catch integration bugs a single-screen check would miss — a screen can pass Countercheck and Audit perfectly and still break the moment it's used in the actual sequence a nurse would follow.

### 6. Confirm
Explicit pass/fail. If anything failed Countercheck, Audit, or Simulate, fix it and re-run the loop from step 3 — don't check the box with known issues "to fix later."

### 7. Log + Check Off
- Add an `08-Logs/Agent-Sessions/` entry per the standard `AGENTS.md` format (with a real timestamp).
- Check the box below.
- **Fill in the Resume Note** — one line: what's actually done, and what the very next action would be if you had to stop right now. This is what makes handoff to a fresh agent possible.

---

## Using the Reference Mockup Image

`03-Design/assets/reference-mockup.png` — a 12-screen AI-generated reference, already fully audited in `03-Design/Design-Audit-Reference-Mockup.md`. **Use it for layout density, spacing rhythm, and general component arrangement only.** Do not use its colors (they don't match the actual sampled brand tokens) and do not replicate its known gaps — the audit file lists these explicitly. When a screen below has a matching mockup screen, this loop's Audit step includes cross-checking layout against it *with the corrections already applied*:

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

---

## Checklist

Every box gets a **Resume Note** filled in when checked — that's what makes this handoff-safe. Leave unchecked boxes' notes blank until you actually start that item.

**A checked box is not permanently final.** If `08-Logs/Changelog.md` shows a design-system rule, skill, or requirement was added or changed *after* a screen's box was checked, that screen was built before the rule existed — it needs a re-audit against the new rule, not a pass on the assumption that "checked" means "still correct." This already happened once: the Dashboard was checked off before `cliniq-interactive-states` existed, and needed a retroactive Audit pass once that skill was added. Don't wait for a human to notice and prompt for it a second time — check the Changelog against every already-checked box's date before assuming past work is still compliant, per `AGENTS.md`'s "Before you start" step 6.

### Phase F0 — Environment, Design Foundation, Shared Components

- [ ] Two blocking decisions resolved (data-fetching library, routing library) — see `Development-Phases.md` §0
  Resume note:
- [ ] Vite scaffold run into `cliniq-frontend/`
  Resume note:
- [ ] Confirmed dependencies installed (Tailwind, `qr-scanner`, `chart.js`+`react-chartjs-2`, Vitest+RTL)
  Resume note:
- [ ] Design tokens (colors, typography scale, spacing) encoded into Tailwind config/CSS variables
  Resume note:
- [ ] Shared component: Button (primary/secondary/cancel/destructive hierarchy)
  Resume note:
- [ ] Shared component: Card
  Resume note:
- [ ] Shared component: Badge (icon+color+label, never color alone)
  Resume note:
- [ ] Shared component: Input
  Resume note:
- [ ] Shared component: Modal
  Resume note:
- [ ] Layout: App Shell/Nav (role-aware: Staff full, Admin Reports+Dashboard only, Instructor no shell)
  Resume note:
- [ ] Layout: mobile wrapper (for QR mobile flows)
  Resume note:
- [ ] **F0 exit check:** blank app shell renders, role-aware nav switches correctly on mock auth state, every shared component matches sampled color tokens
  Resume note:

### Phase F1 — The 5 Reference Screens (Full Loop, In Order)

#### 1. Student Profile (`features/student-records/`)
- [ ] Read → Build → Countercheck → Audit → Simulate → Confirm → Log (all 7 steps)
  Resume note:

#### 2. New Visit Entry (`features/clinic-visits/`)
- [ ] Read → Build → Countercheck → Audit → Simulate → Confirm → Log — **including the Follow-Up prompt and Smart Triage panel; do NOT use a Visit/Incident type dropdown**
  Resume note:

#### 3. Incident Entry, two-stage (`features/emergency-response/`)
- [ ] Read → Build → Countercheck → Audit → Simulate → Confirm → Log — **Stage 1 and Stage 2 both built; status badge visible; Simulate step must trace the full Stage 1→2 transition using the Activity Diagram**
  Resume note:

#### 4. QR Scan/Lookup Hub + Quick-Actions, mobile (`features/qr-digital-health-id/mobile/` + `shared/`)
- [ ] Read → Build → Countercheck → Audit → Simulate → Confirm → Log — **Staff hub, Emergency button, and Instructor read-only variant all built; shared scanner wrapper used by all three, not duplicated**
  Resume note:

#### 5. Clinic Overview Dashboard (`features/dashboard/`)
- [ ] Read → Build → Countercheck → Audit → Simulate → Confirm → Log — **including the calendar view and due/upcoming Follow-Ups section, both absent from the reference mockup**
  Resume note:

- [ ] **F1 exit check:** all 5 screens work end-to-end against mock data; accessibility pass run against each; ready to show the client for feedback per ADR-006
  Resume note:

### Phase F2 — Remaining Screens, Module by Module

*(Full loop applies to each; entries below are the tracking checklist, not a shortcut around the loop.)*

**Student Records**
- [ ] #3 App Shell/Nav — Resume note:
- [ ] #6 Student List — Resume note:
- [ ] #8 Add/Edit Student — Resume note:
- [ ] #9 Incomplete Records Review Queue — Resume note:

**Clinic Visit Monitoring**
- [ ] #10 Visit Log List — Resume note:
- [ ] #12 Visit Detail/Edit — Resume note:
- [ ] #13 Excuse Letter Generator (+ print layout) — Resume note:
- [ ] #14 PE/Sports Injury Referral Form — Resume note:

**QR Digital Health ID (remaining)**
- [ ] #22 QR Code Print View — Resume note:
- [ ] #23 Scan/Lookup Hub (desktop) — Resume note:
- [ ] #24 Student Quick-Actions (desktop) — Resume note:
- [ ] #25 Emergency Button (mobile) — Resume note:

**Emergency Response (remaining)**
- [ ] #17 Parent Notification Outcome Logging — Resume note:
- [ ] #18 Incident Report View/Print — Resume note:

**Follow-Up Handling**
- [ ] #18b Follow-Up Prompt — Resume note:
- [ ] #18c Follow-Up List View — Resume note:

**Medicine & Supply Inventory Tracker**
- [ ] #28 Inventory List — Resume note:
- [ ] #29 Add/Edit Inventory Item — Resume note:
- [ ] #30 Dispense/Log Usage — Resume note:

**Reports Generation**
- [ ] #19 Monthly Report View/Generate (+ print) — Resume note:
- [ ] #20 Incident Report Archive (+ print) — Resume note:
- [ ] #21 Health Summaries View (+ print) — Resume note:

**User Management**
- [ ] #33 User List — Resume note:
- [ ] #34 Add/Edit User & Role Assignment — Resume note:

**Backup Verification Assistant**
- [ ] #32 Backup Status Screen — Resume note:

- [ ] **F2 exit check:** every screen above matches its reference pattern (Reference-Screens.md §5 mapping table), display-privacy rule verified per screen, no orphaned mock-data dependencies left unresolved
  Resume note:

### Phase F3 — Polish & Client Demo Prep

- [ ] Keyboard shortcuts wired for highest-frequency actions (`04-Development/Keyboard-Shortcuts-and-Efficiency.md`)
  Resume note:
- [ ] Full `interface-review` accessibility sweep across every screen (not just the 5 references)
  Resume note:
- [ ] Responsive check on QR mobile flows specifically
  Resume note:
- [ ] Final Simulate pass: walk all three Activity-Diagram flows start to finish across the finished app, not per-screen
  Resume note:
- [ ] **F3 exit check / demo-ready:** every box above checked, every Resume Note filled, no known issues left unresolved in any Agent-Session log
  Resume note:
