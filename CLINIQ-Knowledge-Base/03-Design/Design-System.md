# Design System — Full Detail

Complete design guidelines, kept in sync with the canonical **Frontend Context Brief**, Section 7, and the **Frontend Design Reference** document (both in `09-References/Canonical-Documents/`). If you edit one, edit all.

---

## 7. Design & UX Guidelines

These are system-wide frontend design requirements — they should guide every UI/UX decision across all ~35 screens, not just the ones called out explicitly elsewhere in this brief. Apply them consistently rather than re-deriving a look-and-feel per screen.

### Overall Direction
Modern, minimalist, clean, professional, approachable, consistent, easy to scan, smooth and responsive, accessible to non-technical stakeholders. Some users may have difficulty reading small text or distinguishing between many interface elements, so prioritize clarity, readability, and intuitive interaction — without tipping into looking overly simplistic or childish. When a requirement doesn't specify a UI/UX behavior, decide using this priority order: **Usability → Clarity → Accessibility → Consistency → Efficiency → Visual polish.** Never trade usability or accessibility for aesthetics.

### Typography
Small-to-medium sizing throughout — not so small it strains readability, not so large it wastes screen space. Build hierarchy through font weight, spacing, and placement rather than simply bumping font size. Keep body text comfortable to read, and keep headings, labels, body text, supporting text, and important/status information clearly distinct from each other. The overall feel should be compact and information-efficient while still comfortable to read.

### Buttons, Controls & Shape Language
Small-to-medium, easy to identify, consistent throughout, clearly differentiated by purpose, comfortable to interact with. Use slightly rounded corners — softened modern UI, not sharp squares, but not pill-shaped or playfully rounded either. Apply this same restrained corner-radius logic consistently across buttons, inputs, cards, dialogs, and containers, using one consistent set of radius values system-wide.

### Button Hierarchy & Color
When multiple buttons appear together, use visual weight to guide the user toward the likely action: primary actions get stronger emphasis, secondary actions stay visually quieter, cancel/neutral actions remain visible without competing, destructive actions get an appropriate warning treatment. Not every button should be equally prominent. The interface should suggest "this is probably the action you want" through hierarchy, contrast, and placement — not intrusive prompts. Never rely on color alone; pair it with labels, icons, or positioning.

Concretely, with the tokens defined below: **primary** = filled `brand-green`, white text (button-label-sized text passes as large text/UI at this contrast level — see the Color System contrast rules below for exactly where the line is); **secondary** = outlined or `surface`-filled with `brand-green` text, no heavy fill; **cancel/neutral** = plain text or a quiet gray outline; **destructive** = filled `error` red, reserved only for genuinely irreversible actions (per the Modals & Confirmation guidance below) — never used for routine negative actions like "cancel" or "go back."

### Color System
Restrained, cohesive palette. Prioritize strong text/background contrast, consistent semantic colors, and a clear, consistent distinction between normal, primary, warning, error, success, and disabled states. Keep highly saturated colors limited and accent-color usage consistent. Don't introduce a color just for decoration — every color should communicate the same thing everywhere it appears.

**Brand colors — extracted by actually sampling pixels from the uploaded logo and poster** (median-cut color quantization, cross-checked across both images), not eyeballed. The real values turned out more vivid than a visual guess would suggest — the "gold" is closer to a pure saturated yellow than a warm amber gold, which matters for contrast, below.

| Token | Hex (sampled) | Use |
|---|---|---|
| `brand-green` | `#039935` | Primary brand color — buttons, active nav, headers. **Large text/UI only when paired with white** (contrast 3.74:1 — passes the 3.0 threshold for large text and UI components, fails the 4.5 threshold for normal body text) |
| `brand-green-dark` | `#035419` | Sampled from the seal's shield outline. Safe for white text **at any size** (9.19:1) — use this, not `brand-green`, anywhere white text needs to be small (nav labels, dense buttons) |
| `brand-green-light` | `#8CCC7E` | The sage-green from the logo's circular badges. Background/surface tint only — pairs well with dark text (9.16:1) but is unusable with white (1.90:1) |
| `brand-yellow` | `#EAEA09` | Secondary/accent — highlights, non-critical CTAs, badges. **Never pair with white text (1.29:1, unusable)** — always `text-primary` or `brand-green-dark` (13.49:1, excellent) |
| `brand-yellow-dark` | `#AFAF07` | Hover/active state for yellow elements. Still needs dark text even when darkened (2.34:1 with white — still fails) |
| `text-primary` | `#1A1A1A` | Main body text, headings |
| `text-secondary` | `#616161` | Supporting/secondary text |
| `text-muted` | `#9E9E9E` | Placeholder-adjacent, disabled text, timestamps |
| `background` | `#FFFFFF` | Page background |
| `surface` | `#F5F5F5` | Card/panel background, distinct from page background |
| `border` | `#E0E0E0` | Dividers, input borders, card outlines |

**Semantic colors — each one checked for contrast, not assumed:**

| Token | Hex | Use | Contrast w/ white | Note |
|---|---|---|---|---|
| `success` | `#20753A` | Confirmation messages, success buttons/badges carrying white text | 5.73:1 — passes normal text | The original brighter green idea (`#2E9E4F`) only reaches 3.43:1 — fine for a large icon or bold label, not safe for a small white-text badge, so this darker shade is the one to actually build with |
| `success-light` | `#2E9E4F` | Icon color, or badge/accent paired with dark text, where a slightly brighter green reads better | — (used with dark text, not white) | |
| `warning` | `#A85F00` | Low-stock, nearing-expiration, frequent-visitor warnings — anywhere carrying white text | 4.88:1 — passes normal text | The first candidate (`#ED8B00`) measured **2.53:1 — an outright fail**, not just borderline. Genuinely don't use that shade with white text anywhere |
| `warning-light` | `#ED8B00` | Badge/icon backgrounds paired with dark text only | — (used with dark text, not white) | |
| `error` / `destructive` | `#D32F2F` | Delete/irreversible actions, validation errors, missed follow-ups | 4.98:1 — passes | Outside the brand palette entirely — unambiguous |
| `info` | `#1976D2` | Neutral system messages | 4.60:1 — passes | The one cool hue in the palette, reserved for neutral/informational only |

**Contrast rules, stated plainly:**
- Small white text: only ever on `brand-green-dark`, `success`, `warning`, `error`, or `info` — never on `brand-green`, `brand-yellow`, `brand-yellow-dark`, `brand-green-light`, `success-light`, or `warning-light`.
- Large text (≈18pt+, or 14pt+ bold) and UI components like button fills and icons: `brand-green` becomes usable with white on top of the above list.
- The `-light` variants and `brand-green-light` exist specifically for badge/accent backgrounds — always pair them with `text-primary`, never white.
- Per the Accessibility guidance already in this document: pair every semantic color with an icon or label, never color alone — this matters even more here since `brand-green` is both the brand's primary identity color *and* the family `success` is drawn from.

### Layout & Spacing
Clean, organized, compact, comfortable, uncluttered — avoid both extremes: crowded/hard-to-interact-with, and so much whitespace the system feels inefficient. Use consistent spacing and alignment to show relationships between elements; group related information and visually separate unrelated information.

### Forms
Should be especially intuitive for non-technical users. Use real labels, not placeholder-text-only. Group related fields, clearly mark required fields, explain a confusing field when necessary, and give understandable validation messages rather than exposing raw technical errors. Preserve entered data when validation fails, where possible. A user should always be able to answer: *What do I enter? → Why am I entering it? → What happens next?*

### Navigation
Predictable and simple. Familiar terminology over technical jargon. Make the current location obvious, keep important functionality easy to discover, keep recurring controls in a consistent place, and organize navigation around what the user is trying to do — not around the app's internal module structure.

### Accessibility
Treat as part of the normal design process, not an optional pass at the end. Ensure readable text, adequate contrast, clear labels, obviously-interactive elements, understandable error messages, visible focus/interaction states, meaningful feedback, and no dependence on color alone.

### Feedback & System States
Clearly communicate what's happening: loading, saving, success, error, warning, empty data, disabled, hover, focus, and completed-action states all need a defined look. Messages should be concise and actionable — prefer "Unable to save changes. Please check the required fields." over surfacing a raw database/API error.

**Loading state, specifically — skeleton screens, on every page, not spinners and not a blank screen.** This applies universally: every screen that fetches data on load (which is most of them) shows a skeleton — gray placeholder shapes matching the final layout's structure — while that data is in flight, rather than a spinner or a blank white screen. Two reasons this is a stated rule and not a style preference:
1. **Perceived performance on the target hardware.** The Performance NFR already commits to running acceptably on a 4GB RAM machine — a skeleton makes a load that takes a beat *feel* faster than the same load behind a spinner, because the eye has structure to anticipate rather than nothing to look at.
2. **Reassurance for non-technical users.** The Usability NFR requires the system be learnable in a single training session by clinic staff who are not technical. A blank screen or a lone spinner reads as "did it freeze?" to that user in a way a skeleton — which visibly resembles the page about to appear — doesn't.

Apply this to every list, table, card grid, and detail view — not just the Dashboard (where it was first specified in `Reference-Screens.md`). A form that pre-fills from a QR scan or search result should skeleton the fields being populated, not just appear blank until the fetch resolves. The one exception: a *save/submit* action's in-progress state (a button showing a spinner while a POST is in flight) is a different state than *page load* and doesn't need a full-page skeleton — that's still just a loading button, per the existing pattern in `Reference-Screens.md`.

### Modals & Confirmation
Use only when they add real value — don't interrupt users with confirmations for harmless, reversible actions. For destructive or irreversible actions: clearly explain what will happen, visually distinguish the destructive action from the cancel option, and never make a destructive and a safe action look visually identical.

### Animation & Microinteractions
Subtle, and only when it improves usability — communicating state changes, feedback, transitions, loading, or interaction responses. No bouncing effects, unnecessary transitions, or decorative motion. The system should feel smooth and responsive, not flashy. (This also serves the 4GB RAM performance constraint below — lightweight motion is both a UX and a hardware requirement here.)

### Consistency
Reuse established typography, font weights, spacing, colors, button styles, input styles, border radii, shadows, icons, and status/component states rather than creating a visually different one-off for a similar problem. In this stack, that means leaning on Tailwind's design tokens (spacing scale, color palette, radius scale) as the single source of truth, not ad hoc utility combinations per component.

### Visual Hierarchy
Every page should let the user quickly answer: Where am I? What is this page for? What information matters? What actions are available? Which action is most relevant? What happened after I acted? Build this with size, weight, spacing, position, and contrast — not by making everything large, bold, or colorful.

### Implicit Decisions
Where a requirement doesn't specify behavior, use established usability judgment: clear empty states, tooltips where genuinely necessary, icon+text pairing when it helps, hover/focus/disabled/loading states, graceful error recovery, success feedback, logical grouping, responsive behavior, keyboard accessibility, and protection against accidental destructive actions. Don't add an element just because it looks good — every element needs a usability reason to exist.

### CLINIQ-Specific Implementation Notes
- Must render fast on a 4GB RAM machine — keep bundle size and animation weight modest; avoid heavy chart libraries if a lighter one covers the Clinic Overview Dashboard's needs.
- Tailwind CSS for styling; keep the palette simple and consistent across all ~35 screens.
- Print layouts (excuse letters, incident reports, monthly reports, QR stickers) are first-class, not an afterthought.
- Mobile-responsive is required for the QR mobile flows (Staff and PE/Sports Instructor) — the rest is primarily used on the one desktop workstation, but reasonable responsiveness doesn't hurt.


---

## Key Interaction Flows

## 6. Key Interaction Flows Worth Getting Right

- **New Visit → Smart Triage:** selecting a complaint (e.g. "fainting") surfaces a standardized checklist inline, not a separate page — it should feel like part of filling the form, not an interruption.
- **QR scan/lookup → Quick-Actions:** scanning (or manually entering a Student Number) should feel instant and stay inside the Staff member's current session — no extra auth step, no separate app state. Landing on Record Visit or Log Emergency with the student already identified is the whole point; don't make the user re-select the student on the next screen.
- **Duplicate detection:** on saving a new student, if name+grade level matches an existing record, block save and show a confirmation modal rather than silently creating a duplicate.
- **Low-stock / expiring-item alerts:** should be visible from the Staff Dashboard, not buried only inside the Inventory page.
- **Emergency button → Stage 1 save:** tapping Emergency on mobile should reach a savable form in as few taps as possible — only complaint and immediate vitals required. Saving Stage 1 must succeed even if Stage 2 fields are empty; don't validate the full form up front or you defeat the point of the two-stage design.
- **Instructor scan → read-only view:** the Instructor's scan result should make it visually obvious there are no actions available — no greyed-out buttons implying something is almost clickable, just a clean read-only display of profile + injury history.

