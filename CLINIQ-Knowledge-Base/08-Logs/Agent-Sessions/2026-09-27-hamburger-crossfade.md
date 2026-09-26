Date/Day/Time: Sunday, September 27, 2026 — 05:43
Agent: Claude Code (Opus 5.5)
Task: Smooth the collapsed-sidebar logo → hamburger transition
Status: Completed
Prompt/Request: "also for hamburger, when transitioning from logo it should be smooth"
Files Modified:
- cliniq-frontend/src/layouts/Sidebar.tsx
Changes Made:
- Before: the logo tile and the menu icon toggled with `hidden`/`flex` on hover and focus-visible. `display` can't animate, so they snapped.
- Now: both sit absolutely stacked inside the (now `relative`) expand button. On hover/focus-visible the logo fades out and shrinks to 75%, while the hamburger fades in and scales up from 75% (`transition-[opacity,transform] duration-200 ease-out`).
- Both layers are `aria-hidden`; the button keeps its "Expand sidebar" label.
- `motion-reduce:transition-none` is kept, so reduced-motion users get an instant swap.
Reason: Requested smoother hover feedback. Matches the earlier sidebar animation smoothing work.
Testing Performed: `tsc -b` clean; ESLint clean on `src/layouts`; `vitest run` — 27/27 passed. Not visually checked in a browser.
Known Issues: None.
Next Steps: Visual check of the timing (200ms) in the browser.
