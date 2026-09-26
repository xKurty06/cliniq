Clinic Overview Dashboard (Screen Inventory #31, Reference 1, Module 9): counts, pending records, trends, frequent-visitor flags (Student Number only, per the display-privacy rule), due follow-ups, and a calendar view with event tagging.

**Status:** built (Phase F1, on mock data). View-only for Staff and Admin/Principal (ADR-011).

- `DashboardPage.tsx`: the screen, rendered inside `layouts/AppShell` (header with greeting + period selector + Print → stat cards → three alert lists → visits trend + common complaints → calendar). Layout follows the reference mockup.
- `types.ts`: the data contract the Phase B9 endpoint should return (`DashboardSummary`, `CalendarDay`).
- `api/dashboardApi.ts`: data access. It's mock for now; swap the function bodies for real requests at B9. Dev-only URL knob: `?mock=error|empty|slow`.
- `api/aggregate.ts`: mock stand-in for the B9 aggregation. `MOCK_RULES` holds **placeholder** thresholds that no document defines yet (see Issues-and-TODOs).
- `lib/calendar.ts`: calendar periods, month grid, heatmap scale.
- `components/`: screen-specific pieces. Anything reusable lives in `src/components/` instead.
