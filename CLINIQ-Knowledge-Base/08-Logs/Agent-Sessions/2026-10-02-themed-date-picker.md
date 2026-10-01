Date/Day/Time: Friday, October 2, 2026 — 00:39 PHT
Agent: Claude Code (Opus 5.5)
Task: Replace native, generic-looking date UI with a themed shared picker
Status: Completed (live browser screenshot not taken — Playwright browser was locked by another session)
Prompt/Request: "Fix any date-related UI it looks generic and native" (with a screenshot of the Reports "Report month" native month picker).
Files Modified:
- frontend/src/components/ui/DatePicker.tsx (new: `DatePicker`, `MonthPicker`)
- frontend/src/components/index.ts
- frontend/src/components/ui/DateRangePicker.tsx (custom From/To now DatePickers)
- frontend/src/components/forms/FollowUpPrompt.tsx
- frontend/src/features/reports/ReportsPage.tsx
- frontend/src/features/inventory/InventoryFormPage.tsx
- frontend/src/features/clinic-visits/NewVisitEntryPage.tsx
- frontend/src/features/emergency-response/IncidentEntryPage.tsx
- frontend/src/index.css (hide native time-field clock popup)
- frontend/src/test/pickDate.ts (new test helper) and the Reports, Dashboard, Visit Log tests
- .claude/skills/cliniq-input-patterns/SKILL.md, 04-Development/Skills-Setup.md, 03-Design/Design-System.md
Changes Made:
- New dependency-free `DatePicker` (value YYYY-MM-DD) and `MonthPicker` (YYYY-MM). Trigger reuses the shared 40px dropdown trigger with a brand calendar icon and the standard display format. Calendar panel is fixed-positioned (cannot be clipped; flips upward when needed), has day/month/year views, selected = brand-green-dark fill, today = brand-green ring, Today/This month and optional Clear footer, min/max disabling. Keyboard: arrows, Home/End, PageUp/PageDown (Shift for years), Escape (stops propagation so the date-range popover isn't dismissed).
- All 7 native date controls replaced. Incident "Departure time" (datetime-local) split into "Departure date" (DatePicker, max today) + "Departure time" (typed time input); payload format unchanged (`YYYY-MM-DDTHH:mm`, current time when both empty).
- Skill edit (cliniq-input-patterns): old → dates were `Input type="date"` under the shared Input rule; new → date/month fields must use DatePicker/MonthPicker, never native calendars.
Reason: Native date/month calendars are OS chrome and don't match the design system, the same reasoning that retired native `<select>`.
Testing Performed: `tsc -b` clean; `vitest run` 49 files / 222 tests pass (date tests now pick through the calendar via `pickDate`/`pickMonth`); `eslint src` shows only the pre-existing ReportIssueModal set-state-in-effect error.
Known Issues: Not visually verified in a live browser this session. Time entry still uses the browser's segmented time field (typed), with its popup hidden.
Next Steps: Visually check Reports, New Visit follow-up, Incident Stage 2, Inventory form, and a log's Custom range popover at desktop and phone widths.
