---
name: cliniq-interactive-states
description: Apply whenever building or reviewing any button, link, dropdown/select, icon action, or navigable list row/card. Ensures cursor states, hover feedback, and dropdown styling are never left as unstyled defaults.
---

# CLINIQ Interactive States

This skill exists because the first real build (the Dashboard) shipped without cursor states, without hover feedback, and with native unstyled dropdowns — despite hover already being listed as a required state in the design system. The requirement wasn't new; it was just too vague to actually verify against. This skill makes it concrete and checkable.

## The rule, per element type

**Anything clickable gets `cursor: pointer` on hover. Anything not clickable doesn't.** Buttons, links, dropdown/select triggers, icon-only actions, table/list rows that navigate on click — all of these. Don't add pointer cursor to static text or non-interactive containers just because they're near something clickable.

**Every interactive element needs a real hover color, not just a cursor change:**
- Primary buttons (`brand-green` fill) → darken to `brand-green-dark` on hover
- Secondary/outlined buttons → pick up a light `surface` background tint on hover
- Destructive buttons (`error` fill) → darken the same way
- Plain list rows/cards that navigate → subtle `surface` background tint on hover, so the whole row visibly responds
- Links → an underline or color shift, not silence

**Dropdowns and selects must match the design system — never left as native OS/browser chrome.** A plain `<select>` renders with whatever the operating system defaults to, and that default has nothing to do with `brand-green`, this system's border-radius, or its focus-ring treatment. Minimum fix, no new dependency required: `appearance: none`, a custom chevron icon, and the same border/background/border-radius/focus-ring styling already used on text inputs. Only reach for a headless UI library (Radix UI, Headless UI) if genuinely richer interaction is needed later — not as the default fix for basic styling.

## When to apply this

Every time you build or touch a button, link, dropdown, icon action, or navigable row — check this before considering it done, as part of the Audit step in `04-Development/Frontend-Loop-Engineering.md`. Don't wait for a visual review to catch a missing hover state; it should never ship without one in the first place.

## Full source

`03-Design/Design-System.md`, "Buttons, Controls & Shape Language" — the canonical, more detailed version of this rule.
