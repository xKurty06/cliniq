Date/Day/Time: Friday, October 2, 2026 — 01:30 PHT
Agent: Claude Code (Opus 5.5)
Task: Default the Clinic Overview date range to This month
Status: Completed
Prompt/Request: "for clinic overview make the default this month"
Files Modified:
- frontend/src/features/dashboard/DashboardPage.tsx
- frontend/src/features/dashboard/DashboardPage.test.tsx
- .claude/skills/cliniq-date-range-patterns/SKILL.md
Changes Made:
- Dashboard initial range: rangeForPreset('all') -> rangeForPreset('thisMonth'). All is still the first preset in the menu.
- Skill edit (cliniq-date-range-patterns): old -> every date-range filter starts on All; new -> same, with the Dashboard (a summary view) as a documented This-month exception. Operational logs are unchanged.
- Tests: the default-selection assertion now expects This month; six tests that rely on the full mock history (frequent visitors, alert cards, complaint table, view-only button scan, admin view) switch to All first via a `showAllTime` helper.
Reason: User request; the Dashboard summarises current activity rather than listing records.
Testing Performed: `tsc -b` clean; `vitest run` 49 files / 222 tests pass.
Known Issues: Early in a month the Dashboard will show sparse counts by design.
Next Steps: None.
