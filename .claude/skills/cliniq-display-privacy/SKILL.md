---
name: cliniq-display-privacy
description: Apply whenever building or reviewing any screen that displays a student — lists, tables, dashboard widgets, cards, or detail views. Determines whether to show the student's full name or their Student Number.
---

# CLINIQ Display-Privacy Rule

CLINIQ's screen-context display rule (Modules & Features, cross-cutting; ADR-004) exists because a bystander glancing at an open desktop screen can attach a specific, identifiable student to a health pattern. This is a real project requirement, not a style preference — apply it to every new screen without being asked.

## The rule

**Multi-student list/aggregate views → Student Number, never the name.**
Any screen showing more than one student at a glance: visit logs, incident logs, the Dashboard's frequent-visitor section, any future list view. These are the screens someone could walk past and read.

**Single deliberate lookups → full name is correct and expected.**
A QR scan result, the full Student Profile, search results, the masterlist/student directory. Someone has already identified and is looking at one specific student for a legitimate reason — hiding the name here would be unhelpful, not safer.

**The masterlist is a special case:** show full names freely (it's just a roster of who's enrolled — low sensitivity), but never show medical/confidential fields inline in that list. Allergies, conditions, visit reasons, or anything else diagnostic still requires opening the individual profile.

## Applying it to a new screen

Ask one question: **does this screen show one specific student the user has already identified, or a set of multiple students at once?**
- One student, deliberately opened → name.
- Multiple students, glanceable → Student Number.

If you're building something that doesn't cleanly fit either case, don't guess — flag it and ask, the same way the open question about visit-reason visibility in list rows was flagged rather than resolved unilaterally (see `CLINIQ-Knowledge-Base/03-Design/Design-Audit-Reference-Mockup.md`).

## Reasons and descriptions in list rows: resolved (ADR-010, Option A)

This used to be an open question. It's now decided: in multi-student list views, a visit's complaint, an incident's description, and a follow-up's reason **stay visible** next to the Student Number. Only the name is withheld. See `CLINIQ-Knowledge-Base/06-Decisions/ADR-010-Reason-Visibility-in-List-Rows.md`.

## Enforce it with types, not just care

In code, a multi-student list receives `StudentListRef` (`id` + `studentNumber` only, in `cliniq-frontend/src/types/entities.ts`), never a full `Student`. A list component then can't render a name, because it never gets one. The Clinic Overview Dashboard is the reference implementation (`src/features/dashboard/`), and its tests assert that no student name reaches the rendered page.

## Where this has already been applied correctly

Reference these as the working pattern: the Visit Log List, Incident Log List, and Dashboard frequent-visitor section (Student Number); the Student Profile, QR scan result, and masterlist (full name). See `CLINIQ-Knowledge-Base/01-Requirements/User-Roles-and-Permissions.md` for the full rule text.
