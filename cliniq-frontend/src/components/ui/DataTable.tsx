import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface DataTableColumn<Row> {
  key: string
  header: ReactNode
  cell: (row: Row) => ReactNode
  align?: 'left' | 'right'
  /** Marks the column that names each row (rendered as a row header, `<th scope="row">`). */
  rowHeader?: boolean
}

export interface DataTableProps<Row> {
  caption: string
  /** Visually hide the caption when a card heading already says the same thing. */
  hideCaption?: boolean
  columns: ReadonlyArray<DataTableColumn<Row>>
  rows: ReadonlyArray<Row>
  rowKey: (row: Row) => string
  className?: string
}

/**
 * Plain semantic table. It's the accessible, low-spec fallback every chart must offer (Screen
 * Inventory #31: "Charts should have a simple table fallback"). Scrolls horizontally inside its
 * own container, so the page itself never scrolls sideways.
 */
export function DataTable<Row>({
  caption,
  hideCaption = false,
  columns,
  rows,
  rowKey,
  className,
}: DataTableProps<Row>) {
  return (
    <div className={cn('relative overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <caption
          className={cn('pb-2 text-left text-xs text-text-secondary', hideCaption && 'sr-only')}
        >
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-2 py-1.5 text-xs font-semibold whitespace-nowrap text-text-secondary',
                  col.align === 'right' ? 'text-right' : 'text-left',
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-border last:border-b-0">
              {columns.map((col) => {
                const Cell = col.rowHeader ? 'th' : 'td'
                return (
                  <Cell
                    key={col.key}
                    scope={col.rowHeader ? 'row' : undefined}
                    className={cn(
                      'px-2 py-1.5 text-text-primary tabular-nums',
                      col.rowHeader ? 'font-semibold' : 'font-normal',
                      col.align === 'right' ? 'text-right' : 'text-left',
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
