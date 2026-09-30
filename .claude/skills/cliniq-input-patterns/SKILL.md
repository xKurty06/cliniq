---
name: cliniq-input-patterns
description: Apply when building or changing a CLINIQ text, search, number, date, or password input. Keeps all shared text inputs visually and dimensionally aligned with standard selects.
---

# CLINIQ Input Patterns

Use this with `cliniq-interactive-states` whenever a text input is created or changed.

## One standard control treatment

- Reuse `frontend/src/components/ui/Input.tsx`; do not create page-local text input styling.
- Standard inputs are 40px tall, with `border-border`, a light card shadow, semibold 14px values, and a `brand-green` focus ring. This deliberately matches the shared `Select` trigger beside it.
- Keep the real visible label above the field, required indicator, nearby hint/error text, hover response, and visible keyboard focus treatment.
- Use an explicit local override only where a documented compact control is necessary; do not shrink filter inputs merely to create a different height from their paired dropdown.

## Scope

This rule covers text, search, number, date, and password fields. It does not replace `Select`, `DateRangePicker`, or `MultiSelect`; use the relevant shared control for those choices.
