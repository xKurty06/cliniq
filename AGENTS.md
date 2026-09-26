# AGENTS.md — Start Here

You are working on **CLINIQ: Intelligent Clinic Tracking and Monitoring System**, a clinic tracking system for Mendez Christian Academy (a Philippine private school, ~900 students, one nurse, one shared workstation, LAN-only deployment). This file is the entry point — read it before touching any code or documentation.

## Before you start any task

1. Read `CLINIQ-Knowledge-Base/00-Project-Core/Overview.md` — what this system is and who it's for.
2. Read `CLINIQ-Knowledge-Base/02-Architecture/Tech-Stack.md` and `CLINIQ-Knowledge-Base/02-Architecture/System-Architecture.md`.
3. Read `CLINIQ-Knowledge-Base/01-Requirements/` for the requirement(s) relevant to your task.
4. If your task is actual feature-building (not a one-off fix), check `CLINIQ-Knowledge-Base/04-Development/Development-Phases.md` for where it falls in the frontend/backend phase sequence — don't build ahead of a phase's prerequisites (e.g., don't start backend schema work — the ERD is TBA, not yet designed; don't wire real API calls into a Phase F1 screen still meant to run on mock data).
5. **Check `CLINIQ-Knowledge-Base/06-Decisions/` — do not contradict an existing decision.** If your task seems to require reversing one, stop and ask rather than silently overriding it.
6. Check `CLINIQ-Knowledge-Base/08-Logs/Changelog.md` for recent changes that might affect your task.
7. Check `CLINIQ-Knowledge-Base/08-Logs/Issues-and-TODOs.md` for known issues and open items relevant to your task.
8. If anything is missing, ambiguous, or conflicting, ask for clarification rather than guessing.

## While you work

- Follow the architecture in `CLINIQ-Knowledge-Base/02-Architecture/` and the conventions in `CLINIQ-Knowledge-Base/04-Development/Coding-Conventions.md`.
- Check `.claude/skills/` for bespoke CLINIQ skills (display-privacy, audit-trail) before building a new screen or mutation — see `CLINIQ-Knowledge-Base/04-Development/Skills-Setup.md` for these plus recommended external skills.
- Don't change technology choices without approval (see `CLINIQ-Knowledge-Base/06-Decisions/`).
- Don't modify features or files unrelated to your task.
- Write tests where applicable (`CLINIQ-Knowledge-Base/05-Testing/Test-Strategy.md`).
- **Every feature or prompt-driven change gets documented** — this project's working rule, not just a suggestion. If a person's prompt or request led to a decision or a change, that's exactly what belongs in the agent log below.

## Timestamps — required on every log entry, changelog line, and ADR

Every entry you write — a session log, a changelog line, an ADR's Date field — must carry the **actual day of week, date, and time**, pulled from your real system clock at the moment you write it (e.g. `date "+%A, %B %d, %Y — %H:%M"` in bash, or whatever equivalent your environment gives you). Never estimate, round, or omit it, and never leave a placeholder. If your environment genuinely has no clock access, say so explicitly in the entry rather than guessing a value — an honest gap is fine; a fabricated timestamp is not.

## After you finish

1. Update whatever part of `01`–`05` your change actually affects.
2. Add an entry to `CLINIQ-Knowledge-Base/08-Logs/Agent-Sessions/` (format below) — **include the originating prompt/request**, not just the resulting diff, so the next agent or person understands *why*, not only *what*.
3. Add a one-line pointer to that session in `CLINIQ-Knowledge-Base/08-Logs/Changelog.md`, **with a real timestamp** (see above) — not just a bare date.
4. Update `CLINIQ-Knowledge-Base/08-Logs/Issues-and-TODOs.md` if you found or resolved something.
5. If you made a genuine requirement/scope decision (not just an implementation choice), add an ADR to `CLINIQ-Knowledge-Base/06-Decisions/` **and** flag that the matching canonical document (see `CLINIQ-Knowledge-Base/09-References/Canonical-Documents.md`) needs updating too — don't let the vault and the canonical docs quietly drift apart.
6. Give a concise summary of what you did.

## Agent Session Log Format

```
Date/Day/Time: (actual system timestamp, e.g. "Tuesday, October 6, 2026 — 14:32" — see Timestamps rule above; never estimated)
Agent:
Task:
Status: Completed / Partial / Blocked
Prompt/Request: (what was actually asked, in the requester's own words or a faithful paraphrase)
Files Modified:
Changes Made:
Reason:
Testing Performed:
Known Issues:
Next Steps:
```

## Source of Truth (conflict resolution)

1. Canonical documents (Project Plan, Modules & Features, Frontend Context Brief, Frontend Design Reference, Related Systems Review) — authoritative for **what** the system should do
2. `CLINIQ-Knowledge-Base/06-Decisions/` — authoritative for **how** it's being built
3. Current code + `CLINIQ-Knowledge-Base/02-Architecture/` — authoritative for what **currently exists**
4. `CLINIQ-Knowledge-Base/08-Logs/` — historical context, not itself current truth
5. Temporary notes, scratch work — never authoritative
6. AI-generated suggestions — never auto-promoted; only real once approved into `CLINIQ-Knowledge-Base/06-Decisions/`

A newer approved decision always overrides an older one. AI suggestions are not requirements until a person approves them.
