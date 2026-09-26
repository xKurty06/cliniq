# Mobile — QR Digital Health ID

The one genuinely mobile-first part of CLINIQ. Three distinct experiences live here:

- **Staff mobile hub** — same four actions as desktop, touch-sized, reachable from a phone over the school Wi-Fi.
- **Emergency button** — a separate, faster entry point than the hub; jumps straight to Stage-1 incident capture. Speed matters more here than anywhere else in the app.
- **Instructor lookup** — PE/Sports Instructor's read-only view. No action buttons at all; the absence of actions should be visually obvious, not just disabled-looking buttons.

All three use the same scanning mechanism from `../shared/` — only what happens _after_ a successful scan differs by role.

Full behavior spec: Frontend Context Brief, screens #22–26; design detail: Frontend Design Reference, Reference Screen 4.
