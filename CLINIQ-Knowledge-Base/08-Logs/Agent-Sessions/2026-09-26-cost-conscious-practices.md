Date/Day/Time: Saturday, September 26, 2026 — actual time not available (no system clock access in this environment)
Agent: Claude (chat session)
Task: Add standing cost/credit-conscious practices to the project's operating instructions
Status: Completed
Prompt/Request: "any more way to less exhausting my credits?" — follow-up after the build-then-audit restructuring, asking for further token/credit reduction strategies.
Files Modified: AGENTS.md, CLAUDE.md (both updated, kept identical), CLINIQ-Knowledge-Base/04-Development/Frontend-Loop-Engineering.md
Changes Made:
- Gave the user a prioritized practical list in chat (model tiering, avoiding redundant re-reads, preferring deterministic tools over AI reasoning, surgical file edits, a lightweight-task carve-out) and then formalized the clear, uncontroversial ones into the actual operating documents rather than letting them stay chat-only advice.
- Added a "Be cost-conscious" bullet group to AGENTS.md's "While you work" section: model tiering guidance (capable model for foundational/ambiguous work, mid-tier for pattern-following), surgical edits over full-file rewrites, a preference for deterministic tooling (linters, test runners, accessibility CLIs) over AI reasoning wherever a tool exists — citing this project's own precedent (the SRS diagrams were validated by actually running Mermaid's parser, not eyeballed), and a lightweight carve-out for trivial fixes that don't need the full phase process.
- Added a direct clarification to Frontend-Loop-Engineering.md's Phase 0: it runs once per continuous session, not once per screen, since re-reading the Changelog/Decisions/Issues before every individual screen in an ongoing session burns credits without adding new information.
Reason: Direct follow-up request for further cost reduction, after the credits concern was already the stated reason for last session's restructuring.
Testing Performed: N/A — documentation only.
Known Issues: None new.
Next Steps: None specific — these are now standing practices an agent should follow automatically rather than needing to be re-requested.
