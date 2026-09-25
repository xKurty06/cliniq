# ADR-001: Upgrade from Plain HTML/CSS/JS + PHP to React + Laravel

**Date:** September 13, 2026
**Status:** Accepted

## Context
The original Software Engineering I Technical Documentation specified plain HTML/CSS/JS frontend with plain PHP backend.

## Decision
Upgrade to React + TypeScript (frontend) and Laravel/PHP (backend), styled with Tailwind CSS.

## Alternatives Considered
Staying with the original plain stack — simpler, but more custom code to write and maintain by hand for a 3-person team on a fixed semester timeline.

## Consequences
TypeScript's static typing catches a category of mismatches at build time rather than after the nurse hits "Save," directly supporting the error-reduction goal (Problem F). Laravel's built-in auth, migrations, and ORM reduce custom backend code. Trade-off: added build tooling (Node.js, Composer) during development — kept off the client's actual runtime hardware (see `02-Architecture/Tech-Stack.md`).

Full detail: Project Plan, Section 4.2 and 4.3.
