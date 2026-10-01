---
name: cliniq-table-patterns
description: Apply when building or changing a CLINIQ data table, especially one whose rows change with search, filters, sorting, pagination, date ranges, or report periods. Keeps columns stable and table names accessible without repeating visible card headings.
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

## Verification

- In the screen test, assert that changing the relevant filter still leaves the same table structure and that a fixed table has the `table-fixed` class.
- For calibrated tables, assert the `col` widths so a later content change cannot silently restore auto-layout.
- Apply the display-privacy rule to the row content and the pagination pattern when the list can grow.
