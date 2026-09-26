Date/Day/Time: Saturday, September 26, 2026 — actual time not available (no system clock access in this environment)
Agent: Claude (chat session)
Task: Remove all prescribed formatter tooling from the project
Status: Completed
Prompt/Request: "remove formatter" — ambiguous on first read (multiple files/mentions could apply), asked a clarifying question rather than guessing which one; user's answer: "all formatting, I already have mine."
Files Modified: CLINIQ-Knowledge-Base/02-Architecture/Tech-Stack.md, CLINIQ-Knowledge-Base/04-Development/Coding-Conventions.md, AGENTS.md, CLAUDE.md (both kept identical)
Changes Made:
- Searched the whole repo for every mention of Pint/Prettier/ESLint before editing anything, rather than assuming scope — found exactly two files referencing them (Tech-Stack.md's stack table row, Coding-Conventions.md's Formatting bullet), plus the cost-conscious bullet added in the immediately preceding session, which cited "run the linter/formatter" as a deterministic-tooling example. Confirmed via grep that ADR-007 and the canonical Project Plan never actually named these tools, so no canonical-document or ADR correction was needed — a smaller, more contained change than it first appeared.
- Removed the Formatting row from Tech-Stack.md entirely.
- Replaced Coding-Conventions.md's Formatting bullet with an explicit note that formatting is deliberately not prescribed by this project (the team has its own setup) rather than silently deleting the line and leaving an unexplained gap — consistent with how other deliberate non-decisions are documented elsewhere (e.g., the ERD's TBA status, the README's License section).
- Fixed the cost-conscious bullet in AGENTS.md/CLAUDE.md to drop the formatter-specific example, and added a parenthetical warning explicitly telling a future agent not to reintroduce a formatter "as part of being efficient" — since that bullet's own logic (prefer deterministic tools) could otherwise lead an agent right back to suggesting Prettier/Pint on its own initiative.
- Ran a final grep sweep after all edits to confirm zero remaining mentions anywhere in the repo.
Reason: Explicit user request, clarified via a direct question before acting, given real ambiguity in what "formatter" referred to across multiple files.
Testing Performed: N/A — documentation only.
Known Issues: None new.
Next Steps: None — this is a closed, deliberate non-decision now, documented as such rather than left as a silent gap.
