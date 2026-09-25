# Changelog

One line per entry. Full detail for planning-level changes lives in the Project Plan's own revision table (Section, "Document Change Control"); this changelog covers vault/implementation-level activity going forward, cross-referencing the Project Plan revision number where relevant.

**Timestamp rule (applies from the start of actual coding onward):** every new entry gets a real day-of-week + date + time, pulled from the agent's actual system clock — see `AGENTS.md` at the repo root, "Timestamps" section. The rows below, from the planning phase before any code existed, are date-only because that's what was genuinely available at the time — they aren't being back-filled with invented times.

| Date | Summary | Detail |
|---|---|---|
| 2026-09-13 | Project Plan created; tech stack upgraded to React+Laravel; group roster corrected | Project Plan rev 1.0–1.2 |
| 2026-09-13 | Review of Existing Alternatives rebuilt with 10 researched systems | Project Plan rev 1.3 |
| 2026-09-17 | QR Digital Health ID redesigned as Staff-only hub; Student Number scheme added | `06-Decisions/ADR-002`, `ADR-005`; Project Plan rev 1.7 |
| 2026-09-18 | App-icon/auto-launch deployment steps added | Project Plan rev 1.6 |
| 2026-09-19 | PE/Sports Instructor access undeferred; dashboard expanded; two-stage emergency flow; audit trail expanded; display-privacy rule added | `ADR-003`, `ADR-004`; Project Plan rev 1.8 |
| 2026-09-20 | Display-privacy rule corrected (QR scan shows full name, not Student Number) | `ADR-004` (updated); Project Plan rev 1.9 |
| 2026-09-20 | Follow-Up Handling added; lightweight calendar event-tagging added | Project Plan rev 2.0 |
| 2026-09-20 | Formal data retention policy (5-year post-archive) added; inventory stock-flow documented in full | Project Plan rev 2.1 |
| 2026-09-24 | Brand colors sampled from logo/poster (pixel quantization + WCAG contrast computed); Frontend Design Reference created for designer handoff | — |
| 2026-09-24 | Barcode scanner proposal and MCA existing-masterlist question raised, deliberately not acted on pending Principal approval | See `Issues-and-TODOs.md` |
| 2026-09-25 | Added Development-Phases.md: full frontend (F0-F3) and backend (B0-B10) phase sequences, an interleaving table connecting them per ADR-006, and two flagged blocking decisions (data-fetching library, routing library) that were never actually resolved in planning. AGENTS.md/CLAUDE.md updated to point to it | `04-Development/Development-Phases.md` |
| 2026-09-25 | Skills research substantially expanded: accessibility (3 more skills beyond the first pass), full frontend ecosystem pack (TypeScript/Tailwind/forms/state/testing), Laravel security auditing and RBAC options, and a new Security & Privacy category (PII detection) — with explicit reasoning for what was deliberately left out (TanStack Query/shadcn until those decisions are made, GDPR-specific tools, Vue-based bundles) | `04-Development/Skills-Setup.md` (rewritten) |
| 2026-09-25 | CLAUDE.md rewritten as a full duplicate of AGENTS.md (was a pointer-only file); added 2 bespoke skills (cliniq-display-privacy, cliniq-audit-trail) plus researched external skill recommendations; audited the ChatGPT-generated reference mockup against confirmed requirements (found: Visit/Incident merge conflicts with the two-stage design, Follow-Up Handling and calendar view both missing, no two-stage status badge, brand colors not applied) | `03-Design/Design-Audit-Reference-Mockup.md`, `04-Development/Skills-Setup.md`, `.claude/skills/` |
| 2026-09-25 | Vault expanded from pointer-summaries to full detail across Project Core, Requirements, Features, and Design — pulled verbatim from the canonical documents, nothing invented. Caught and fixed a stale reference to "Laravel's built-in authentication" in the Project Plan (should have said Sanctum since rev 2.2) | Project Plan rev 2.3 |
| 2026-09-25 | Monorepo structure built: cliniq-frontend (feature-based, QR split into desktop/mobile/shared/api), cliniq-backend skeleton, AGENTS.md/CLAUDE.md moved to true repo root | `ADR-008` |
| 2026-09-25 | All pending tech stack items finalized after researching current maintenance/compatibility (Vite, Sanctum, XAMPP, `endroid/qr-code`, `qr-scanner`, Chart.js) — notably, the "obvious modern" QR scanner choice was rejected for a real Safari/iOS compatibility gap | `ADR-007`; Project Plan rev 2.2 |
| 2026-09-24 | Obsidian knowledge base structure created | This session — see `Agent-Sessions/` |
