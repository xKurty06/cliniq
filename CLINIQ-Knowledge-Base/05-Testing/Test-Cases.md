# Test Cases

Organized to mirror the module structure in `01-Requirements/Features/Module-Overview.md`. Automated cases live next to the code (`*.test.ts(x)`, run with `npm test` in `cliniq-frontend/`).

## Module 9 — Clinic Overview Dashboard (added Saturday, September 26, 2026 — 20:43)

Automated: `src/features/dashboard/DashboardPage.test.tsx`, `src/features/dashboard/api/aggregate.test.ts`, `src/lib/dates.test.ts` (24 tests incl. `DashboardLoading.test.tsx`, all passing).

| # | Case | Expected | Covered by |
|---|---|---|---|
| D1 | Page loads with default range | Header, date filter, 5 stat cards, 3 alert lists, complaint trends, calendar, and print button all render | DashboardPage.test |
| D1b | First-load skeletons (re-audited 2026-09-26 20:59) | Stat cards, all 3 alert lists, trends chart, and calendar each show a skeleton in their own final shape; no spinner; loading announced to screen readers | DashboardLoading.test |
| D2 | Display privacy | No student full name anywhere in the rendered page or in the summary payload; frequent-visitor rows lead with a `YYYY-NNNNN` Student Number | DashboardPage.test, aggregate.test |
| D3 | View-only | The only buttons are Print, calendar Previous/Today/Next, and error Retry. No mutation actions, so no audit-log writes | DashboardPage.test |
| D4 | Due/upcoming follow-ups | Only `pending` items up to today + window; overdue / due today / upcoming labelled correctly; completed/missed excluded | aggregate.test |
| D5 | Inventory flags | Low stock (< threshold) and nearing expiration are separate badges that can both appear on one item; expired shown separately | aggregate.test |
| D6 | Frequent visitor | Flag raised at the threshold, by Student Number only | aggregate.test |
| D7 | Trend buckets | Week/month buckets clipped to the selected range; top complaints charted, the rest in the table | aggregate.test |
| D8 | Symptom cluster | Spike flagged only when there are ≥ 2 buckets to compare | aggregate.test |
| D9 | Calendar | Per-day visit/incident counts; distinct event tags per day; weekly/monthly/yearly switch via keyboard arrows | aggregate.test, DashboardPage.test |
| D10 | Chart table fallback | "Table" toggle shows a semantic table of complaint counts | DashboardPage.test |
| D11 | Invalid custom range | Start after end shows an inline message and isn't applied | DashboardPage.test |
| D12 | Error / empty states | Error shows a plain message + Try again; empty data shows calm per-section empty states | DashboardPage.test |
| D13 | Accessibility (manual/axe) | axe-core WCAG 2.2 AA: 0 violations in normal, empty, and error states; Tab order follows visual order; focus ring visible on every control | Run manually 2026-09-26; see session log |
| D14 | Responsive | No page-level horizontal scroll at 400px; month calendar scrolls inside its own container | Checked manually 2026-09-26 |
| D15 | Print | Controls hidden, every list row expanded, heatmap/badge colors kept (`print-color-adjust: exact`) | Checked manually (print media emulation) |
