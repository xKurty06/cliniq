Shared, generic UI components only: design-system-level pieces from `CLINIQ-Knowledge-Base/03-Design/Design-System.md`. If something is specific to one feature, it belongs in that feature's folder instead.

**Import from the barrel:** `import { Button, ListCard, StatusBadge } from '../../components'`. Check this list before building anything new; reuse beats a near-duplicate.

## Catalog

| Component                                          | File                                                    | Use it for                                                                                                                                                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`                                           | `ui/Button.tsx`                                         | Every button. `variant`: `primary` (the one likely action), `secondary` (quieter outline), `neutral` (cancel/back), `destructive` (irreversible only). Optional `icon`, `loading`.                                                                     |
| `Card`, `CardHeader`, `CardBody`                   | `ui/Card.tsx`                                           | Any panel/section. `CardHeader` takes title, description, icon, and right-aligned `actions`. Use `CARD_SURFACE` for any custom container (white, soft shadow, no outline).                                                                             |
| `Badge`                                            | `ui/Badge.tsx`                                          | Icon + label chip. Never color alone. Tones: `neutral`, `info`, `success`, `warning`, `error`, `accent`. Variants: `soft` (pale pill, the default in status maps), `solid`, `outline`.                                                                 |
| `StatusBadge`                                      | `ui/StatusBadge.tsx`                                    | Renders a status value from a `StatusMap`, so one status looks the same on every screen.                                                                                                                                                               |
| `StatCard`                                         | `ui/StatCard.tsx`                                       | Accent label → large figure → caption, with the icon as a tinted chip. `tone`: `brand` / `error` / `warning` / `neutral`. Optional scope ("Current") or neutral trend.                                                                                 |
| `ListRow`, `RowList`                               | `ui/ListRow.tsx`                                        | **The list-row pattern** (Reference-Screens.md §5) for Visit Log, Incident Log, Follow-Up List, Inventory List, User List. `primary` = Student Number in multi-student lists.                                                                          |
| `ListCard`                                         | `ui/ListCard.tsx`                                       | Card + heading + count + scrollable `RowList` + empty state. The dashboard alert-group pattern.                                                                                                                                                        |
| `SegmentedControl`                                 | `ui/SegmentedControl.tsx`                               | Toggles (Weekly/Monthly, Chart/Table, Disposition…). ARIA radiogroup, arrow-key operable.                                                                                                                                                              |
| `DateRangePicker`                                  | `ui/DateRangePicker.tsx`                                | Date filter: presets + validated custom From/To. Uses `lib/dateRange.ts`.                                                                                                                                                                              |
| `Input`                                            | `ui/Input.tsx`                                          | Labeled text/date input with hint, required marker, and inline error.                                                                                                                                                                                  |
| `DataTable`                                        | `ui/DataTable.tsx`                                      | Semantic table. Also the required table fallback for every chart.                                                                                                                                                                                      |
| `Skeleton`, `StatCardSkeleton`, `ListCardSkeleton` | `ui/Skeleton.tsx`, `ui/StatCard.tsx`, `ui/ListCard.tsx` | **Every screen that loads data shows a skeleton shaped like its final layout** (Design-System.md, Feedback & System States): never one generic block, never a spinner. Compose `Skeleton` bars into the real structure; reuse the card/list skeletons. |
| `EmptyState`                                       | `ui/EmptyState.tsx`                                     | Calm "nothing here" message.                                                                                                                                                                                                                           |
| `ErrorState`                                       | `ui/ErrorState.tsx`                                     | Plain-language load failure + "Try again".                                                                                                                                                                                                             |
| `Icon`                                             | `icons/Icon.tsx`                                        | Inline SVG icon set. Add new icons here rather than adding an icon dependency.                                                                                                                                                                         |
| `chartSetup`                                       | `charts/chartSetup.ts`                                  | Import once before any `react-chartjs-2` chart (registers Chart.js pieces, disables animation).                                                                                                                                                        |

## Domain status maps (`status/`)

Shared label + tone + icon definitions, used with `StatusBadge`:

- `followUpStatusMap` (pending/completed/missed/cancelled) and `followUpDueMap` (overdue/due today/upcoming): `status/followUp.ts`
- `inventoryFlagMap` (low stock / nearing expiration / expired, always separate badges): `status/inventory.ts`
- `frequentVisitorMap` (a warning, never a diagnosis): `status/frequentVisitor.ts`

Add the Incident stage badge (Reference 5) here when that screen is built.

## Related shared code outside this folder

- `src/layouts/AppShell.tsx` + `navigation.ts`: the (visual-only) sidebar + top bar every desktop screen renders inside. Pages render a `<div>`, not `<main>`; the shell owns `<main id="main-content">`.
- `src/lib/mocks/session.ts`: mock signed-in user (`?role=admin` for the Admin view).

- `src/index.css`: the design tokens (the only colors that compile) and contrast rules.
- `src/lib/tokens.ts`: read a color token from JS (for canvas charts).
- `src/lib/dates.ts`, `src/lib/dateRange.ts`: timezone-safe date helpers and date-range presets.
- `src/lib/mocks/dataset.ts`: the one shared mock clinic every screen should read during F1/F2.
- `src/hooks/useAsyncData.ts`: placeholder loading hook until the data-fetching decision is made.
- `src/types/entities.ts`: Frontend Context Brief §5 entities, plus `StudentListRef` for privacy-safe lists.
