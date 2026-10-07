# ADR-020: Read-Only National Holidays on the Dashboard Calendar

**Date:** Wednesday, October 07, 2026 — 17:38
**Status:** Accepted

## Context
ADR-019 gave the Dashboard calendar Staff-maintained school events and left holidays as a separate,
later decision. Without holidays, a regular holiday with zero visits looks the same as an ordinary
quiet school day, so the nurse can't tell "no class" from "no illness". Typing every national
holiday in by hand each year would add to Staff's data entry and would get dates wrong, especially
the Islamic holidays, which are proclaimed only weeks ahead.

## Decision
1. **The calendar has three layers, each with its own data and rules:**
   - **Holidays:** nationwide Philippine holidays. Read-only reference data, from a source. No role
     can add, edit, or delete them in CLINIQ.
   - **Staff events** (ADR-019): editable by Staff, viewed by Admin/Principal.
   - **Visit and incident tags:** the free-text tag typed on a visit or incident. Unchanged.
2. **Holiday data:** each entry has a date, a name, a kind (`regular`, `special-non-working`,
   `special-working`, `islamic`) and a `confirmed` flag (false means the date is an estimate, mainly
   for Islamic holidays awaiting their proclamation). The dataset carries `lastUpdated` and a source
   name. National holidays only: local town or province days and class suspensions are entered by
   Staff as events.
3. **Read through the data-access layer only.** `fetchHolidays(from, to)` (Dashboard `api/`) calls
   `getHolidays` in `lib/mock-db/api.ts`. The frontend never fetches holidays from the network. In
   the frontend-first phase the source is a bundled file, `frontend/src/lib/mock-db/holidays-ph.json`,
   seeded with the 2026 holidays and the proclamation references (Proclamation No. 1006, s. 2025;
   Nos. 1189 and 1264, s. 2026). It is separate from `mock-db.json` because holiday dates are real
   and fixed by proclamation, so ADR-014's relative-date rule can't apply to them. When the backend
   lands, `getHolidays` returns the backend's synced copy in the same shape, with no UI change.
4. **Display:** a gray chip that says "Holiday: <name>" in text, so it never relies on color and is
   distinct from Staff's yellow events. Shown in the Month, Week, Year, and Table views, including
   on future days. Long names truncate, with the full name in a tooltip and the day's accessible
   name. An unconfirmed date shows "(estimated)". Holiday chips come first in a day, then events and
   tags, within the existing 2-chip limit and "+N more".
5. **No-class styling:** a regular holiday, special non-working day, or Islamic holiday with zero
   visits and incidents gets faint diagonal stripes. A special working day is a normal school day:
   it shows the chip but no stripes.
6. **Day panel:** Staff's day panel lists that date's holidays and their kind, with no edit or
   delete controls.
7. **Source line:** under the calendar, "Holidays updated <date> · Source <name>", seen by Staff and
   Admin. A warning variant ("No holidays loaded for <year>.") appears if the source has nothing for
   the current year, or "Holidays could not be loaded." if the read fails.
8. **Automatic updating is a backend-phase task** (Development-Phases, Phase B9): a monthly
   scheduled job fetches this year's and next year's holidays when internet is available, keeps the
   last good data on failure, updates `lastUpdated`, and warns when the sync is stale (about 45 days)
   or next year's list is still missing in December.
9. **The source is still open.** Two Philippines-specific candidates, neither validated:
   - **GodModeArch `ph-holidays-mcp`** (MIT, TypeScript): data from the Official Gazette with
     proclamation references, and a two-phase model for Islamic holidays (estimated until
     confirmed). Its README lists a public endpoint reached by JSON-RPC over HTTP, not a
     conventional REST API. One maintainer, no SLA. The repo's data JSON may allow a downloadable
     fallback.
   - **`innonazarene/ph-holiday-calendar`** (Laravel package, MIT): runs inside our backend and
     returns regular, special non-working, and special working days. Very new, one maintainer,
     little adoption. Its dependencies (an HTTP client and an HTML parser) suggest it reads the
     Official Gazette pages, so check how it fetches and what happens when the page layout changes.
     Islamic coverage is unknown.
   - A generic worldwide API (for example Nager.Date) is a last resort, and only if it is confirmed
     to include special and Islamic days.
10. **Evaluation steps for the backend phase:** read the source code, call it, compare its output
    for the current year against the official proclamation, check Islamic and special days, test
    failure cases (site down, empty result, layout change), pin versions, and keep last-good data.

## Alternatives Considered
- **Staff type holidays in as events.** Rejected: yearly data entry, and dates prone to error.
  Staff still enter local holidays and class suspensions as events.
- **Fetch holidays from the browser.** Rejected: the deployment is LAN-only, and the frontend reads
  only through the data layer (ADR-014).
- **Put holidays in `mock-db.json`.** Rejected: that file's dates are relative to "today" by design,
  and holidays are real fixed dates, not synthetic data.

## Consequences
- The bundled 2026 list must be replaced or extended each year until the backend sync exists. The
  warning line makes a missing year visible instead of silently blank.
- The 2026 dates were checked on Wednesday, October 07, 2026 against the proclamation texts in the
  Supreme Court E-Library (No. 1006) and Lawphil (Nos. 1189 and 1264), because
  officialgazette.gov.ph blocked automated access. A person should confirm them on the Official
  Gazette pages. A unit test pins the list to those texts.
- **Canonical documents need updating** (not edited here, per Source of Truth rules):
  `CLINIQ_Modules_and_Features.md` Module 9 (holiday layer and the backend sync job),
  `CLINIQ_Frontend_Context_Brief.md` §5 (a read-only `Holiday` reference shape) and §9, and
  `CLINIQ_Frontend_Design_Reference.md` Reference 1 item 5 (the calendar now shows holidays and
  Staff events as well as tags).
