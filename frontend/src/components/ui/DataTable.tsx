import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../icons/Icon'

export type DataTableSortDirection = 'ascending' | 'descending'

export interface DataTableColumn<Row> {
  key: string
  header: ReactNode
  cell: (row: Row) => ReactNode
  /** Fixed column width used when the table opts into `fixedLayout`. */
  width?: string
  align?: 'left' | 'right'
  /** Marks the column that names each row (rendered as a row header, `<th scope="row">`). */
  rowHeader?: boolean
  /** Optional accessible sort control for a column header. */
  sort?: {
    label: string
    direction?: DataTableSortDirection
    onSort: () => void
  }
}

export interface DataTableProps<Row> {
  caption: string
  /** Visually hide the caption when a card heading already says the same thing. */
  hideCaption?: boolean
  columns: ReadonlyArray<DataTableColumn<Row>>
  rows: ReadonlyArray<Row>
  rowKey: (row: Row) => string
  /** Prevent filtered row content from redistributing column positions. */
  fixedLayout?: boolean
  /** Keep the leftmost column opaque and visible while the table scrolls horizontally. */
  stickyFirstColumn?: boolean
  className?: string
}

/**
 * Plain semantic table. It's the accessible, low-spec fallback every chart must offer (Screen
 * Inventory #31: "Charts should have a simple table fallback"). Scrolls horizontally inside its
 * own container, so the page itself never scrolls sideways.
 */
export function DataTable<Row>({
  caption,
  hideCaption = true,
  columns,
  rows,
  rowKey,
  fixedLayout = false,
  stickyFirstColumn = false,
  className,
}: DataTableProps<Row>) {
  return (
    <div
      tabIndex={0}
      className={cn(
        'relative overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green',
        className,
      )}
    >
      <table className={cn('w-full border-collapse text-sm', fixedLayout && 'table-fixed')}>
        {fixedLayout && (
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={col.width ? { width: col.width } : undefined} />
            ))}
          </colgroup>
        )}
        <caption
          className={cn('pb-2 text-left text-xs text-text-secondary', hideCaption && 'sr-only')}
        >
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((col, columnIndex) => (
              <th
                key={col.key}
                scope="col"
                aria-sort={col.sort?.direction}
                className={cn(
                  'px-2 py-1.5 text-xs font-semibold whitespace-nowrap text-text-secondary',
                  col.align === 'right' ? 'text-right' : 'text-left',
                  stickyFirstColumn &&
                    columnIndex === 0 &&
                    'sticky left-0 z-20 border-r border-border bg-background',
                )}
              >
                {col.sort ? (
                  <button
                    type="button"
                    onClick={col.sort.onSort}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-sm transition-colors duration-150 hover:text-brand-green-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green motion-reduce:transition-none"
                    aria-label={`Sort by ${col.sort.label}${col.sort.direction ? `, currently ${col.sort.direction}` : ''}`}
                  >
                    {col.header}
                    {col.sort.direction ? (
                      <Icon
                        name={col.sort.direction === 'ascending' ? 'arrowUp' : 'arrowDown'}
                        size={13}
                      />
                    ) : (
                      <span aria-hidden="true" className="flex flex-col -space-y-1">
                        <Icon name="arrowUp" size={10} />
                        <Icon name="arrowDown" size={10} />
                      </span>
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-border last:border-b-0">
              {columns.map((col, columnIndex) => {
                const Cell = col.rowHeader ? 'th' : 'td'
                return (
                  <Cell
                    key={col.key}
                    scope={col.rowHeader ? 'row' : undefined}
                    className={cn(
                      'px-2 py-1.5 text-text-primary tabular-nums',
                      col.rowHeader ? 'font-semibold' : 'font-normal',
                      col.align === 'right' ? 'text-right' : 'text-left',
                      stickyFirstColumn &&
                        columnIndex === 0 &&
                        'sticky left-0 z-10 border-r border-border bg-background',
                    )}
                  >
                    {col.cell(row)}
                  </Cell>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
