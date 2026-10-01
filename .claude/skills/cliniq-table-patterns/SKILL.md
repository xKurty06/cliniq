---
name: cliniq-table-patterns
description: Apply when building or changing a CLINIQ data table, especially one whose rows change with search, filters, sorting, pagination, date ranges, or report periods. Keeps columns stable, wide time-series tables readable, and table names accessible without repeating visible card headings.
---

# CLINIQ Table Patterns

Use this alongside `cliniq-interactive-states`, `cliniq-pagination-patterns`,
`cliniq-sorting-patterns`, and `cliniq-display-privacy` when a table is added or changed.

## Shared table boundary

- Reuse `frontend/src/components/ui/DataTable.tsx`; do not create a page-local table wrapper for the same behavior.
- Set `fixedLayout` whenever the table's row contents can change because of a search, filter, sort, pagination, date range, report period, tab, or other selection. This prevents browser auto-layout from moving columns when text lengths or badges differ between results.
- Use `DataTableColumn.width` for columns whose proportions matter. Widths should describe the table's intended hierarchy and add up to 100% when all columns are specified. Keep the table's existing horizontal scroller for narrow viewports.
- Keep the table semantic: use `rowHeader` for the identifying row cell, and keep column headers concise and accurate.

## Captions and visible headings

- Always provide a meaningful `caption`, even when the card header already names the table. The shared `DataTable` hides captions visually by default while keeping them available as the table's accessible name.
- Do not use an empty caption and do not duplicate a visible card heading inside the table. If the table must be visibly titled outside a card, opt out of `hideCaption` deliberately and preserve the caption text.

## Horizontal scrolling and sticky columns

- Keep horizontal scrolling on the shared `DataTable` wrapper; do not make the page itself scroll sideways.
- Set `stickyFirstColumn` when the first column identifies each row and users need to compare it against periods or other wide columns. The shared component keeps that column opaque, layered above scrolled cells, and visually separated at the right edge.
- Combine sticky columns with `fixedLayout` and calibrated widths. A sticky position without an intrinsic table width can still leave the browser compressing the columns until their content overlaps.
- Verify the actual scroll interaction at the left edge, middle, and far-right positions. The identifying column must remain inside the scroller viewport, readable, and not show the columns underneath through its background.

## Wide time-series tables

- Cap period columns in the table view itself when a date range can produce a wide time series; do not cap the shared aggregation or chart data just to make a table fit.
- Show the most recent periods, preserve the source bucket indexes for counts and cluster markers, and add a plain note below the table stating how many earlier periods are hidden and how to see them.
- Keep the cap local to the table's view model so charts, summary totals, and other dashboard panels continue to represent the full selected range.

## Low-signal rows

- For a dense period table, hide rows whose count is zero across every visible period by default. Decide this from the post-cap visible bucket window, not from the full source range.
- Provide a small, clearly labelled toggle with `aria-pressed` that reveals all complaint types, including rows hidden by the zero-activity rule.
- Filter only the table rows. Never mutate the source series or the totals used by another panel; the Common complaints card and its selected-range totals must remain unchanged.

## Verification

- In the screen test, assert that changing the relevant filter still leaves the same table structure and that a fixed table has the `table-fixed` class.
- For calibrated tables, assert the `col` widths so a later content change cannot silently restore auto-layout.
- For sticky wide tables, assert the sticky first-column classes and verify the identifying cell remains readable at multiple real horizontal scroll positions.
- For wide time-series tables, assert no more than 12 period columns, the earlier-period note, and that the chart still receives the uncapped bucket list.
- For low-signal filtering, assert a zero-activity row is hidden by default, appears after the labelled toggle is pressed, and does not alter another panel's totals.
- Apply the display-privacy rule to the row content and the pagination pattern when the list can grow.
