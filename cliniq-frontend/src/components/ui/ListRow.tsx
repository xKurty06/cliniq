import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * The list-row pattern. Reference-Screens.md §5 names this as the template for every list view
 * (Visit Log, Incident Log, Follow-Up List, Inventory List, User List).
 *
 * Display-privacy rule (ADR-004): in a multi-student list, `primary` is the Student Number,
 * never the student's name. See `.claude/skills/cliniq-display-privacy/`.
 */
export interface ListRowProps {
  /** The row's identifier (Student Number, item name). */
  primary: ReactNode
  /** Supporting detail under the identifier. */
  secondary?: ReactNode
  /** A right-aligned fact before the badge, e.g. a due date or a count. */
  meta?: ReactNode
  /** Status badge(s). */
  trailing?: ReactNode
  className?: string
}

export function ListRow({ primary, secondary, meta, trailing, className }: ListRowProps) {
  return (
    <li
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2.5',
        className,
      )}
    >
      <div className="min-w-0 flex-1 basis-40">
        <div className="text-sm font-semibold text-text-primary tabular-nums">{primary}</div>
        {secondary && <div className="truncate text-xs text-text-secondary">{secondary}</div>}
      </div>
      {(meta || trailing) && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {meta && <span className="text-xs text-text-secondary tabular-nums">{meta}</span>}
          {trailing}
        </div>
      )}
    </li>
  )
}

export interface RowListProps {
  children: ReactNode
  /** Accessible name for the list (usually the id of the card heading). */
  labelledBy?: string
  className?: string
}

export function RowList({ children, labelledBy, className }: RowListProps) {
  return (
    <ul aria-labelledby={labelledBy} className={cn('divide-y divide-border', className)}>
      {children}
    </ul>
  )
}
