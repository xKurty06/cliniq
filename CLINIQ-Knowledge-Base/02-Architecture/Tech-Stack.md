# Tech Stack

All items below are **confirmed**, as of September 25, 2026 — the previously "proposed, pending confirmation" items were resolved after actually researching current maintenance status and compatibility, not just picking the first plausible-looking option. Full reasoning: `06-Decisions/ADR-007-Stack-Finalization.md`.

| Layer | Technology | Note |
|---|---|---|
| Frontend | React + TypeScript | |
| Build tool | **Vite** | Confirmed as the 2026 default for new React SPAs — Create React App is deprecated, Vite is the "safest choice for most teams" |
| Styling | Tailwind CSS | |
| Backend | Laravel (PHP) | |
| Auth | **Laravel Sanctum** | SPA-mode token/cookie auth, built specifically for a React+Laravel pairing — not plain "Laravel Authentication," which assumes Blade views |
| Database | MySQL | |
| Local dev | **XAMPP**, standardized across all machines | Matches the client's production environment exactly; deliberately not mixing in Laravel Herd |
| QR generation (backend) | **`endroid/qr-code`** | Actively maintained; multiple newer Laravel QR packages build on top of it. The original candidate, `simplesoftwareio/simple-qrcode`, has had no real release since 2021 — effectively unmaintained |
| QR scanning (frontend) | **`qr-scanner`** (nimiq) | **Not** `@yudiel/react-qr-scanner`, despite the latter looking more modern (React hooks, TypeScript-first). That library is built purely on the browser's native Barcode Detection API — which Safari on iOS has never supported and still doesn't as of mid-2026. A library built only on that API would silently fail to scan on every iPhone. `qr-scanner` uses the native API when available and falls back to its own WebWorker-based decoder otherwise — works everywhere. Needs a small custom React wrapper (a few lines); a low-risk trade for actually working on every device Staff or PE instructors carry |
| Dashboard charts | **Chart.js** (via `react-chartjs-2`) | Chosen over Recharts specifically for smaller bundle size and Canvas rendering — both matter more here than Recharts' nicer JSX composability, given the 4GB RAM target and the Dashboard's fairly simple chart needs (trend lines, a calendar heatmap, nothing exotic) |
| Frontend routing | **React Router** (`react-router` v7), path-based URLs | Confirmed Sunday, September 27, 2026 (ADR-012). Path = which screen (`/students/2026-00001`), query = that screen's state (`/visits?dateRange=last30days`). Each screen is a lazily-loaded chunk (4GB RAM target); role access is declared per route in `src/routes/AppRoutes.tsx` |
| Testing | Pest (backend), Vitest + React Testing Library (frontend) | |
| Deployment (current) | Local LAN | |
| Deployment (future) | Remote Server / Cloud | Documented future phase, not current work |

**Nothing here has been installed or executed yet** — this is the confirmed plan, not a completed setup. See `04-Development/Environment-Setup.md` for the (still not-yet-run) setup steps.
