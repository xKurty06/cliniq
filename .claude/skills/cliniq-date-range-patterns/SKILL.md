---
name: cliniq-date-range-patterns
description: Apply when building or changing a CLINIQ date-range filter for a multi-record operational view. Keeps presets, the All default, custom-range confirmation, and overlay behavior consistent.
---

# CLINIQ Date-Range Patterns

Use this with `cliniq-dropdown-patterns` and `cliniq-interactive-states` whenever a screen filters a multi-record operational list by date.

## Shared implementation

- Reuse `frontend/src/components/ui/DateRangePicker.tsx`; do not build a second date-range menu or separate From/To filter pattern.
- For visit-log-like operational lists, configure the presets as Today, This week, This month, All, and Custom range. Use `presetLabels` when the underlying seven-day preset needs the user-facing label “This week”.
- Start this operational-list pattern on All, so opening the list does not hide historical records behind an arbitrary time window.

## Custom range

- Keep edits as a draft and apply them only after the user selects Apply (or presses Enter). Invalid or incomplete dates must explain the problem without changing the currently applied range.
- Use `customPopover` when the picker sits in a filter row above a table or list. The custom From/To panel must overlay content below the trigger, never reflow the controls, table, or page layout.
- Do not let a custom range end later than today.

## Interaction boundary

- Preserve the picker’s accessible listbox, keyboard navigation, focus restoration, and outside-click dismissal.
- Follow `cliniq-dropdown-patterns` for preset-menu sizing and selected-option treatment, and `cliniq-interactive-states` for cursor, hover, and focus behavior.
