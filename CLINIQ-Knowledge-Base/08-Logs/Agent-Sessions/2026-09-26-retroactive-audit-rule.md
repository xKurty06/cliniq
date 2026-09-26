Date/Day/Time: Saturday, September 26, 2026 — actual time not available (no system clock access in this environment)
Agent: Claude (chat session)
Task: Answer whether the standing instructions actually tell an agent to reconcile past completed work against later changes/logs — and fix the gap found
Status: Completed
Prompt/Request: "does the current obsidian instructions tells AI to understand the changes or logs so it knows what are the changes or what needs to be iterate before actually doing what were asked?"
Files Modified: AGENTS.md, CLAUDE.md (both updated, kept identical), CLINIQ-Knowledge-Base/04-Development/Frontend-Loop-Engineering.md
Changes Made:
- Checked the actual current AGENTS.md text rather than answering from memory, and found a concrete, demonstrable bug: the "While you work" section still named only cliniq-display-privacy and cliniq-audit-trail by name, even though cliniq-interactive-states was added two sessions ago. The instructions had already gone stale relative to a real change.
- Identified the more general gap the user was actually asking about: the Changelog-check step (step 6) was purely forward-looking ("does this affect what I'm about to build") with no instruction to also ask whether a change means something already marked done needs to be reopened. This is exactly why the Dashboard kickoff prompt (two turns ago) needed a hand-written instruction telling the agent not to assume the Dashboard already satisfied the interactive-states skill — that reasoning wasn't something the standing rules would have produced on their own.
- Fixed both: reworded step 6 into an explicit two-way check (forward-looking AND retroactive), fixed the stale skills mention to point at Skills-Setup.md as the live source rather than naming specific skills in a sentence that will go stale again the next time one is added, and added a matching note to Frontend-Loop-Engineering.md's checklist section stating explicitly that a checked box is not permanently final if the Changelog shows a rule change postdating it.
- Used the Dashboard/interactive-states incident as the explicit example inside both files, so a future agent reading this rule sees the actual precedent, not just an abstract instruction.
Reason: A direct, valid question about whether the standing instructions were actually sufficient, or whether every future rule change would need the same manual, task-specific reminder I'd been writing by hand.
Testing Performed: N/A — documentation only.
Known Issues: None new. This is a self-correcting fix to the instruction file itself, verified against the actual current text rather than assumed.
Next Steps: Going forward, an agent working from AGENTS.md/CLAUDE.md should surface this kind of retroactive-audit need on its own, without a human needing to notice and prompt for it each time — worth watching whether that actually holds up in practice.
