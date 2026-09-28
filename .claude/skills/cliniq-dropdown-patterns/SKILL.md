---
name: cliniq-dropdown-patterns
description: Apply when building or changing a CLINIQ dropdown, select, listbox, or menu of mutually exclusive options. Keeps selection feedback compact, icon-free, accessible, and sized to its content.
---

# CLINIQ Dropdown Patterns

Use this alongside `cliniq-interactive-states` whenever a dropdown's trigger or option list is created or changed.

## Selected option

- Do not show a checkmark, radio glyph, or empty icon spacer beside the selected option.
- Use `bg-surface`, `font-semibold`, and `text-brand-green-dark` for the selected row. The background and weight make the state clear without relying only on green text.
- Keep non-selected options `text-text-primary` and give them the established `hover:bg-surface` response.

## Menu sizing

- First match the option panel to its trigger with `min-w-full`; then let it expand for its longest label with `w-max`.
- Keep `whitespace-nowrap` on option labels so the intrinsic width reflects the complete option.
- Constrain panels on small screens with `max-w-[calc(100vw-2rem)]`; do not allow a long option to create horizontal page overflow.
- Do not reserve width for a removed selection icon.

## Implementation boundary

- Reuse or update the nearest shared dropdown component before creating a one-off pattern. `DateRangePicker` is the shared pattern for date-range menus.
- Keep keyboard behavior, focus restoration, `aria-expanded`, and `role="listbox"` / `role="option"` semantics intact when a custom menu is used.
- A native `<select>` cannot control the operating system's open-menu selection indicator or its content width. Use a custom accessible listbox only when this visual behavior is required; otherwise retain the native control's existing accessibility and styling.
