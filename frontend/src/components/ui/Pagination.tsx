import { Button } from './Button'

export interface PaginationProps {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  itemLabel: string
}

/** A compact, semantic pager for growing operational lists. */
export function Pagination({ page, pageCount, total, pageSize, onPageChange, itemLabel }: PaginationProps) {
  if (total === 0) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <nav aria-label={`${itemLabel} pagination`} className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 print:hidden">
      <p className="text-sm text-text-secondary">Showing {from}–{to} of {total.toLocaleString('en-PH')} {itemLabel}</p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>Previous</Button>
        <span className="text-sm font-semibold tabular-nums text-text-primary" aria-current="page">Page {page} of {pageCount}</span>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === pageCount}>Next</Button>
      </div>
    </nav>
  )
}
