---
name: cliniq-multi-select-patterns
description: Apply when building or changing a CLINIQ filter that deliberately accepts multiple values.
---

# CLINIQ Multi-Select Patterns

Use this only when the requirement calls for multiple selected values. Reuse
`frontend/src/components/ui/MultiSelect.tsx` rather than creating a second filter popover.

## Behavior

- The trigger states whether all values apply or how many are selected. It and the panel take the shared dropdown look from `frontend/src/components/ui/dropdownClassName.ts` (see `cliniq-dropdown-patterns`); only the option rows differ, because they are checkboxes.
- The first option is the all-values checkbox (`allLabel`), selected by default when no values are
  chosen; selecting it clears narrower choices. Remaining options are labeled checkboxes, so users
  can make several selections without reopening the control.
- The option panel overlays content below the trigger and closes on outside click or Escape, returning
  focus to the trigger for Escape.

Follow `cliniq-interactive-states` for cursor, hover, focus, and reduced-motion behavior.
