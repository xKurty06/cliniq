# Coding Conventions

- **Formatting:** Laravel Pint (backend), ESLint + Prettier (frontend) — auto-formatting removes a whole category of merge friction when multiple AI agents touch the same code.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- **Branching:** trunk-based — `main` + short-lived `feature/<name>` branches.
- **PRs, even for agent work:** yes, even if self-merged — gives a reviewable diff and a natural place to link the matching `08-Logs/Agent-Sessions/` entry.
- **Avoiding agent collisions:** pull latest before starting, never work directly on `main`, check `06-Decisions/` and `08-Logs/` before starting, never force-push over another branch.
