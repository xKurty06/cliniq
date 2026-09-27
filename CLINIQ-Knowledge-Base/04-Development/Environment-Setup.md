# Environment Setup

**Not yet executed — confirmed plan, pending your go-ahead to actually run it.**

| Step | Command (illustrative) | Purpose |
|---|---|---|
| Laravel init | `composer create-project laravel/laravel cliniq-backend` | Scaffolds the backend |
| React init | `npm create vite@latest cliniq-frontend -- --template react-ts` | Scaffolds frontend with TypeScript, via Vite |
| Tailwind | `npm install tailwindcss` + config | Styling |
| Sanctum | `composer require laravel/sanctum` | SPA authentication |
| QR generation (backend) | `composer require endroid/qr-code` | Server-side QR generation |
| QR scanning (frontend) | `npm install qr-scanner` | Camera-based scanning with a Safari/iOS-safe fallback; needs a small custom React wrapper component around it |
| Charts | `npm install chart.js react-chartjs-2` | Dashboard charts |
| Routing | `npm install react-router` | Path-based routes, lazy-loaded screens, role guards (ADR-012). The production web server must fall back to `index.html` for unknown paths so deep links like `/students/2026-00001` load the app |
| MySQL | Configure Laravel `.env` against XAMPP's MySQL | Database connection |
| Git | `git init` at the repo root | Version control from day one |

Standardize all dev machines on **XAMPP**, not Laravel Herd — matches the client's production environment exactly. Check the target XAMPP install's bundled PHP version before picking a Laravel version (Laravel 11+ needs PHP 8.2+). Pin a Node LTS version across all machines/agents.
