Date/Day/Time: Monday, September 28, 2026 — actual time not available (no system clock access in this environment)
Agent: Claude (chat session)
Task: Rename the top-level code folders from cliniq-frontend / cliniq-backend to frontend / backend and update every reference
Status: Completed (in this export). The real repo's folders still need renaming by the user/their agent — this export only carries the skeleton folders.
Prompt/Request: "also I want to change my frontend and backend folder to just the name, no cliniq-"
Files Modified: .gitignore, AGENTS.md, CLAUDE.md (kept identical), README.md, System-Architecture.md, Coding-Conventions.md, Development-Phases.md, Environment-Setup.md, Frontend-Loop-Engineering.md (one checklist line), ADR-008, ADR-009 (rename notes added), 09-References/Canonical-Documents.md, the two folder READMEs; skeleton folders renamed cliniq-frontend/ -> frontend/ and cliniq-backend/ -> backend/
Changes Made:
- Counted every reference first (grep, whole repo) and split live files from history: the Changelog and Agent-Session logs describe what was true at the time, so they keep the old names; everything else was updated. The canonical documents (Project Plan, Modules & Features, Frontend Context Brief, Design Reference) never named these folders, so no revision bump was needed.
- Realigned the arrow columns in the README and System-Architecture tree diagrams, which the shorter names would otherwise have broken.
- .gitignore had 15 path patterns under the old names; updated them so build output, vendor/, and .env files under the new folders stay ignored.
- Added a note to AGENTS.md Step 0a (mirrored to CLAUDE.md) and a dated rename note to ADR-008/009, so an older zip or document using the old names is still recognized and the never-overwrite-real-code rule still applies to it.
- Verified after: only the four intentional rename notes still contain the old names outside the history logs; CLAUDE.md still contains AGENTS.md verbatim.
Reason: Direct user request.
Testing Performed: grep verification only — documentation and skeleton folders, no application code.
Known Issues: Two things this export cannot do. (1) Rename the real folders — a rename in the real repo must be done there (git mv), then references updated, including code/config files this export doesn't contain (package.json scripts, path aliases, composer autoload, CI). (2) Frontend-Loop-Engineering.md was edited here, but the user's live copy holds checklist progress; it must not be overwritten from this export — apply the one-line path change there instead.
Next Steps: Rename the real folders and references in the actual repo, then copy documentation from this export (never frontend/ or backend/).
