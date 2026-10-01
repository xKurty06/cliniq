---
name: cliniq-sidebar-patterns
description: Apply when building or changing CLINIQ's shared application sidebar or its brand lockup.
---

# CLINIQ Sidebar Patterns

## Brand lockup

- Use `/Healware_Logo.png` as the system mark in both the expanded `BrandLogo` and collapsed sidebar state. It must match the browser favicon asset declared in `frontend/index.html`.
- In the expanded state, keep `CLINIQ` with `Mendez Christian Academy` directly below it.
- In the collapsed state, show only the Healware mark: no colored tile, outer outline, box, or shadow around it.

## Implementation boundary

- The shared sidebar and `BrandLogo` live in `frontend/src/layouts/Sidebar.tsx`; update this shared source rather than recreating its brand lockup in a route.
- Keep the collapsed expand control's accessible label and existing crossfade behavior intact.
- Apply `cliniq-interactive-states` for changes to the collapse/expand control.

## Sidebar footer links

- Put legal/support destinations in a dedicated footer block after the scrollable nav groups, kept at the bottom of the sidebar without a separator line.
- Footer links are visually lightweight legal/support text rather than filled nav buttons: use small muted text in the expanded sidebar, underline or shift text color on hover, and a subtle text-only active treatment. Preserve a roughly 40px hit target and visible keyboard focus without adding a button-like background.
- A footer item may navigate to a route or open a modal. Modal actions use a button styled with the same lightweight text treatment, expose `aria-haspopup="dialog"`, and leave the current page in place so the report keeps its context.
- In the collapsed sidebar, retain an accessible label and tooltip/title while using the existing icon treatment so the link does not become an unlabeled control.
- Put the version and HealWare attribution in one compact, non-interactive muted block within the horizontal expanded footer row after the actual footer links. In the collapsed sidebar, keep the metadata stacked beneath the icon actions. The version reads from the build-injected app-version constant; the credit has no hover/focus treatment because it is not a destination.
- `Sidebar.tsx` owns shared footer entry points, `routes/paths.ts` owns route destinations, and the feature component owns modal content and submission behavior.
