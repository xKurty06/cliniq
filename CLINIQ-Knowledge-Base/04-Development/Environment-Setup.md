# Environment Setup

**Frontend: partially executed (Saturday, September 26, 2026 — 20:14).** The Vite react-ts scaffold, Tailwind, chart.js + react-chartjs-2, Vitest + RTL, and ESLint + Prettier are installed in `cliniq-frontend/` (run `npm install`, then `npm run dev` / `npm test` / `npm run lint`). Still pending: `qr-scanner` (install with the QR screens). Built and tested on Node v26.5.0 / npm 11.17.0; pinning a Node LTS across machines is still open. **Backend: not yet executed.** The Laravel/Sanctum/MySQL rows below are still the plan.

| Step | Command (illustrative) | Purpose |
|---|---|---|
| Laravel init | `composer create-project laravel/laravel cliniq-backend` | Scaffolds the backend |
| React init | `npm create vite@latest cliniq-frontend -- --template react-ts` | Scaffolds frontend with TypeScript, via Vite |
| Tailwind | `npm install tailwindcss` + config | Styling |
| Sanctum | `composer require laravel/sanctum` | SPA authentication |
| QR generation (backend) | `composer require endroid/qr-code` | Server-side QR generation |
| QR scanning (frontend) | `npm install qr-scanner` | Camera-based scanning with a Safari/iOS-safe fallback; needs a small custom React wrapper component around it |
| Charts | `npm install chart.js react-chartjs-2` | Dashboard charts |
| MySQL | Configure Laravel `.env` against XAMPP's MySQL | Database connection |
| Git | `git init` at the repo root | Version control from day one |

Standardize all dev machines on **XAMPP**, not Laravel Herd — matches the client's production environment exactly. Check the target XAMPP install's bundled PHP version before picking a Laravel version (Laravel 11+ needs PHP 8.2+). Pin a Node LTS version across all machines/agents.
