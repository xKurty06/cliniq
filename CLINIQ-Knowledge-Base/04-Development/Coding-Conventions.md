# Coding Conventions

- **Modular code organization** (backend and frontend both) — one folder per module, mirroring each other directly. Frontend: `cliniq-frontend/src/features/<module>/` (`06-Decisions/ADR-008-Frontend-Folder-Structure.md`). Backend: `cliniq-backend/app/Modules/<Module>/`, with a plain PSR-4 namespace mapping in `composer.json` — no `nwidart/laravel-modules` or similar package (`06-Decisions/ADR-009-Modular-Backend-Architecture.md`). Genuinely cross-cutting code (the audit trail, base classes) goes in `app/Shared/`, never duplicated per module and never owned by whichever module happened to need it first. Don't reach into another module's folder to reuse its logic directly — if two modules need to share something, it belongs in `Shared/`.
- **Formatting:** Laravel Pint (backend), ESLint + Prettier (frontend) — auto-formatting removes a whole category of merge friction when multiple AI agents touch the same code.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- **Branching:** trunk-based — `main` + short-lived `feature/<name>` branches.
- **PRs, even for agent work:** yes, even if self-merged — gives a reviewable diff and a natural place to link the matching `08-Logs/Agent-Sessions/` entry.
- **Avoiding agent collisions:** pull latest before starting, never work directly on `main`, check `06-Decisions/` and `08-Logs/` before starting, never force-push over another branch.
