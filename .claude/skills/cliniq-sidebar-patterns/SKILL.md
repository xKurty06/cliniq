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
