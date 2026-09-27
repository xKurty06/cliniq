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

## Known open question — read before adding a "reason" or "description" column

The rule as written only covers **names**. It does not yet have a resolved answer for whether a visit's complaint or an incident's description should also be hidden/truncated in multi-student list views (a Student Number is still identifiable to anyone who can connect it to a person). If your task involves adding or exposing a reason/description field in a list view, **stop and ask** rather than assuming Option A, B, or C from the design audit — this is explicitly unresolved.

## Where this has already been applied correctly

Reference these as the working pattern: the Visit Log List, Incident Log List, and Dashboard frequent-visitor section (Student Number); the Student Profile, QR scan result, and masterlist (full name). See `CLINIQ-Knowledge-Base/01-Requirements/User-Roles-and-Permissions.md` for the full rule text.
