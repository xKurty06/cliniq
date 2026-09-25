# ADR-002: QR Digital Health ID Redesigned as Staff Quick-Action Hub

**Date:** September 17, 2026
**Status:** Accepted (superseded the original "QR Viewer" external-role design)

## Context
Original design: a separate "QR Viewer" role with its own scoped sign-in (session lasting up to 1 week) for PE instructors to scan and view emergency info independently, outside the Staff login.

## Decision
Redesigned the QR feature around Staff's own workflow first: scan or type a Student Number from inside the existing Staff session, then jump straight into Record Visit / Log Emergency / View Profile, pre-filled.

## Alternatives Considered
Keeping the original external QR Viewer role as the primary design — rejected because it introduced a whole separate authentication/session model for what turned out to be a smaller slice of actual usage than Staff's own need for a fast lookup tool.

## Consequences
Simpler security story for this phase (no separate external access path to secure) — but PE/Sports Instructor access still needed a home, which is ADR-003/004 below.

Full detail: Project Plan, Section 5.3 (Revision 1.7 changelog entry).
