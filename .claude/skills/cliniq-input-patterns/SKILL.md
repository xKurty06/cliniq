---
name: cliniq-input-patterns
description: Apply when building or changing a CLINIQ text, search, number, date, month, time, or password input. Keeps all shared text inputs visually and dimensionally aligned with standard selects, and keeps date and month fields on the themed DatePicker instead of native browser calendars.
---

# CLINIQ Input Patterns

Use this with `cliniq-interactive-states` whenever a text input is created or changed.

## One standard control treatment

- Reuse `frontend/src/components/ui/Input.tsx`; do not create page-local text input styling.
- Standard inputs are 40px tall, with `border-border`, a light card shadow, semibold 14px values, and a `brand-green` focus ring. This deliberately matches the shared `Select` trigger beside it.
- Keep the real visible label above the field, required indicator, nearby hint/error text, hover response, and visible keyboard focus treatment.
- Use an explicit local override only where a documented compact control is necessary; do not shrink filter inputs merely to create a different height from their paired dropdown.

## Date, month, and time fields

- Never use a native `type="date"`, `type="month"`, or `type="datetime-local"` input: their calendars are operating-system chrome. Use `DatePicker` (value `YYYY-MM-DD`) or `MonthPicker` (value `YYYY-MM`) from `frontend/src/components/ui/DatePicker.tsx`.
- The trigger is the shared 40px dropdown trigger with a `brand-green-dark` calendar icon, showing the value in the standard `Oct 2, 2026` / `October 2026` format and a muted placeholder when empty.
- The calendar is a floating, viewport-pinned panel: selected day/month in `brand-green-dark` with white text, today ringed in `brand-green`, a heading that zooms out to month and year grids, and a Today/This month footer action. Pass `min`/`max` instead of validating out-of-range picks afterward.
- `Clear` appears only for optional fields; pass `clearable={false}` for a value that must always exist without a required asterisk (for example a report period).
- A date-and-time value is a `DatePicker` plus a typed `Input type="time"`; the global stylesheet hides the browser's clock popup.
- Tests pick dates through `pickDate` / `pickMonth` in `frontend/src/test/pickDate.ts`.

## Scope

This rule covers text, search, number, date, month, time, and password fields. It does not replace `Select`, `DateRangePicker`, or `MultiSelect`; use the relevant shared control for those choices (the date-range custom From/To fields are themselves `DatePicker`s).
