# CLINIQ

Intelligent Clinic Tracking and Monitoring System for Mendez Christian Academy — CvSU–CEIT, Software Engineering II.

**If you're an AI agent, read `AGENTS.md` first, not this file.**

## Repository layout

```
CLINIQ/
├── AGENTS.md                  ← start here (any AI agent)
├── CLAUDE.md                  ← pointer to AGENTS.md
├── cliniq-frontend/           ← React + TypeScript + Vite
├── cliniq-backend/            ← Laravel API
└── CLINIQ-Knowledge-Base/     ← project knowledge base (Obsidian vault) — requirements, architecture, decisions, logs
```

One repository, not three — frontend, backend, and the knowledge base travel together so nothing drifts out of sync. See `CLINIQ-Knowledge-Base/README.md` for how the vault relates to the five canonical planning documents (Project Plan, Modules & Features, Frontend Context Brief, Frontend Design Reference, Related Systems Review), which are also included under `CLINIQ-Knowledge-Base/09-References/Canonical-Documents/`.

## Status

Planning and architecture complete. No application code written yet — environment setup (`CLINIQ-Knowledge-Base/04-Development/Environment-Setup.md`) is specified but not yet executed.
