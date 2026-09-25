# ADR-006: Interface-Construction-First Development

**Date:** This session (Obsidian vault setup)
**Status:** Accepted

## Context
Team wants to build and show the frontend to the client for feedback before backend logic is fully finalized for a given feature.

## Decision
Within each iteration of the existing iterative-incremental framework (Project Plan, Section 4.1), construct the interface first — against the planned API contract, with mock/stub data where needed — get client feedback, then finalize backend logic.

## Alternatives Considered
Building backend-first (API and logic complete before any UI) — the team's existing default assumption in most of the prior planning, but not explicitly stated as a sequencing rule until now.

## Consequences
The Frontend Context Brief and Frontend Design Reference documents become load-bearing earlier in the actual build than they might otherwise have been — they need to be complete enough to build a *convincing, feedback-worthy* prototype from, not just complete enough to eventually code from.
