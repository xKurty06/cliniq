Date/Day/Time: Sunday, September 27, 2026 — 05:09
Agent: Claude Code (Opus 5.5)
Task: Fix the oversized "Custom range" panel in the dashboard date range picker
Status: Completed
Prompt/Request: "Fix Custom range in date range bug, it becomes big" (with a screenshot of the dashboard header after choosing Custom range)
Files Modified:
- cliniq-frontend/src/components/ui/DateRangePicker.tsx
- cliniq-frontend/src/features/dashboard/components/DashboardHeader.tsx
Changes Made:
- In `compact` mode the picker root is now a right-aligned column (trigger, then the From/To panel), and the panel uses `w-fit p-2` instead of `basis-full p-3`, so it hugs the two date inputs.
- Non-compact mode keeps the previous full-row panel.
- The header's right cluster aligns items to the top so the Print button stays level with the dropdown trigger when the panel is open.
Reason: `basis-full` made the custom panel claim the whole flex row. Inside the header's right cluster that stretched the picker to the full available width, pushed Print onto its own line, and left a large mostly-empty card.
Testing Performed: `tsc -b` clean; `vitest run src/features/dashboard` — 3 files, 23 tests passed. Not visually re-checked in a browser this session.
Known Issues: None known.
Next Steps: Visually confirm at desktop and narrow widths.

---

Date/Day/Time: Sunday, September 27, 2026 — 05:22
Agent: Claude Code (Opus 5.5)
Task: Follow-up — the custom panel should overlay like a dropdown, not move the page
Status: Completed
Prompt/Request: "It shouldn't move upwards when custom range is chosen just like a drop down." (screenshots: with Custom range open, the greeting and cards sat lower than with a preset selected)
Files Modified:
- cliniq-frontend/src/components/ui/DateRangePicker.tsx
- cliniq-frontend/src/features/dashboard/components/DashboardHeader.tsx (reverted the right-cluster alignment back to items-center)
Changes Made:
- In compact mode the From/To panel is now absolutely positioned (`absolute top-full right-0 z-30`, `shadow-raised`), matching the preset menu, so it takes no space in the header.
- Added `customOpen` state: picking "Custom range" opens the panel; picking another preset, clicking outside, or pressing Escape closes it (focus returns to the trigger). The custom range stays applied. To edit it again, pick "Custom range" from the menu.
- Non-compact mode is unchanged (inline full-row panel).
Reason: The first fix kept the panel in the page flow, so opening it still made the header taller and moved the content below.
Testing Performed: `tsc -b` clean; `vitest run src/features/dashboard` — 23/23 passed. Not visually re-checked in a browser this session.
Known Issues: If an invalid range is entered and the panel is closed, the error is hidden with it. The invalid range is still never applied.
Next Steps: Visually confirm the overlay position at desktop and narrow widths.

---

Date/Day/Time: Sunday, September 27, 2026 — 05:39
Agent: Claude Code (Opus 5.5)
Task: Follow-up — add a save/apply step to the custom range popover
Status: Completed
Prompt/Request: "It must have like save or whatever"
Files Modified:
- cliniq-frontend/src/components/ui/DateRangePicker.tsx
- cliniq-frontend/src/features/dashboard/DashboardPage.test.tsx
Changes Made:
- The From/To fields now edit a draft only, and editing clears any stale error. The panel is a `<form noValidate>`: **Apply** (primary, or Enter) runs the existing validation and commits the range. The header popover then closes.
- Header popover gets **Cancel** (neutral). Cancel and Escape discard the draft, close the popover, and return focus to the trigger.
- In compact mode, choosing "Custom range" no longer switches the preset right away. The trigger keeps its previous label until Apply succeeds, so cancelling leaves the old range untouched.
- `noValidate`: the inputs' native `max` would otherwise block submit silently. Our own inline messages cover that case.
- Tests: the invalid-range test now clicks Apply. Added "applies a custom date range only after Apply is pressed".
Reason: Applying on every keystroke made the popover feel unfinished, and there was no clear way to confirm or back out.
Testing Performed: `tsc -b` clean; ESLint clean on touched files; `vitest run` — 4 files, 27/27 passed. Not visually checked in a browser.
Known Issues: None new. This supersedes the previous entry's note about the hidden error: with Cancel/close the draft is discarded.
Next Steps: Visual check of the popover buttons.
