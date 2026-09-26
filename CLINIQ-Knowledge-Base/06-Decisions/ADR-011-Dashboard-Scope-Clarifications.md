# ADR-011: Clinic Overview Dashboard — View-Only for Both Roles, Five Stat Cards

**Date:** Saturday, September 26, 2026 — 20:43
**Status:** Accepted

## Context
Building the Clinic Overview Dashboard (Screen Inventory #31) turned up two places where the canonical documents disagree:

1. **Actions.** `03-Design/Reference-Screens.md` (Reference 1) says Admin/Principal's dashboard is "fully view-only — same layout, **no clickable resolve/complete actions**", which implies Staff *does* get resolve/complete actions (e.g. marking a follow-up done from the alert list). `01-Requirements/Features/Module-Overview.md` (Module 9) and its Access Summary table say the dashboard is **view-only for both Staff and Admin/Principal**.
2. **Stat cards.** Reference 1 lists 3–4 cards (visits, incidents, pending/incomplete records, low-stock items). Module 9 also asks for total **active students**.

## Decision
1. **View-only for both roles.** The dashboard has no create/update/delete actions for anyone. Staff change follow-up statuses on the Follow-Up List (#18c). Consequence: the screen writes no audit-log entries (`.claude/skills/cliniq-audit-trail/`), since it only reads, filters, and prints.
2. **Five stat cards:** clinic visits, incidents, incomplete records, low-stock items, active students. This satisfies both documents, one card above Reference 1's "3–4" guidance.

Both chosen by the project owner when asked directly during the Dashboard build (Saturday, September 26, 2026).

## Alternatives Considered
- Staff-only "mark Completed/Missed/Cancelled" buttons on dashboard follow-up rows: faster for the nurse, but it contradicts Module 9, adds a mutation (and audit logging) to a screen meant for Admin too, and duplicates #18c.
- Reference 1's four cards only (drops Module 9's active-students count), or four cards with low-stock moved to the alert list header only.

## Consequences
- Staff and Admin render the identical Dashboard component. There's no role-conditional code on this screen.
- **Canonical documents need a matching update**: *Frontend Design Reference* Reference 1 should drop the implication that Staff has resolve/complete actions and list five cards. `03-Design/Reference-Screens.md` should change in the same edit, since it mirrors that document.
