---
name: cliniq-multi-select-patterns
description: Apply when building or changing a CLINIQ filter that deliberately accepts multiple values.
---

# CLINIQ Multi-Select Patterns

Use this only when the requirement calls for multiple selected values. Reuse
`frontend/src/components/ui/MultiSelect.tsx` rather than creating a second filter popover.

## Behavior

- The trigger states whether all values apply or how many are selected.
- Options are labeled checkboxes; users can make several selections without reopening the control.
- The option panel overlays content below the trigger and closes on outside click or Escape, returning
  focus to the trigger for Escape.

Follow `cliniq-interactive-states` for cursor, hover, focus, and reduced-motion behavior.
