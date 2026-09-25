# System Architecture

**Shape:** three-tier — React+TypeScript SPA (Tailwind-styled) → Laravel REST API (business logic, auth via Sanctum) → MySQL.

**Frontend/backend communication:** in development, Vite's dev server runs separately and proxies API calls to Laravel (standard pattern, avoids CORS friction). In production, the *built* React assets are copied into Laravel's public folder and Laravel/Apache serves everything from one origin — this is what "build once, Apache serves it" (Project Plan, Section 6.2/6.3) actually means mechanically.

**LAN → Cloud path:** because the frontend only ever talks to the backend through an API, moving the backend to a remote/cloud host later is a deployment change (new URL, new server config), not an architecture change. Nothing about the current design needs a rewrite to support this.

**Repository shape:** monorepo, confirmed and built. One Git repo, root pushed to GitHub:

```
CLINIQ/
├── AGENTS.md                  ← entry point for any AI agent
├── CLAUDE.md                  ← pointer to AGENTS.md
├── README.md
├── cliniq-frontend/           ← React + TypeScript + Vite, feature-based structure (see ADR-008)
│   └── src/features/          ← one folder per module; qr-digital-health-id/ further split into desktop/mobile/shared/api
├── cliniq-backend/            ← Laravel API
└── CLINIQ-Knowledge-Base/     ← this vault
```

Full reasoning for the frontend structure, and specifically why QR scanning splits into desktop/mobile/shared rather than being one responsive component or a separate mobile project: `06-Decisions/ADR-008-Frontend-Folder-Structure.md`.

**Development methodology:** see `Development-Methodology.md` for the iterative + interface-construction (frontend-first) approach.
