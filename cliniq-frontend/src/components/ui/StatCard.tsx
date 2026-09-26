import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from '../icons/Icon'
import { Skeleton } from './Skeleton'

export interface StatTrend {
  direction: 'up' | 'down' | 'flat'
  /** Always spelled out, e.g. "12% vs previous 30 days". Arrows never stand alone. */
  text: string
}

export interface StatCardProps {
  icon: IconName
  label: string
  value: number
  /** Says what the number covers, e.g. "Last 30 days" or "Current". Keeps cards honest when a
   * date filter only applies to some of them. */
  scope?: string
  trend?: StatTrend
  /** Extra note below the value (e.g. "3 still in Stage 1"). */
  footnote?: ReactNode
  className?: string
}

const trendIcon: Record<StatTrend['direction'], IconName> = {
  up: 'arrowUp',
  down: 'arrowDown',
  flat: 'minus',
}

/**
 * StatCard: icon, large number, label, optional trend. Trends stay neutral (text-secondary),
 * never green or red: more clinic visits isn't "good" or "bad", so coloring it would imply
 * a judgment the data doesn't make.
 */
export function StatCard({ icon, label, value, scope, trend, footnote, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-1 rounded-lg border border-border bg-background p-4 print:break-inside-avoid',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface text-brand-green-dark">
            <Icon name={icon} />
          </span>
          {label}
        </span>
        {scope && <span className="text-xs text-text-secondary">{scope}</span>}
      </div>
      <p className="text-2xl font-semibold text-text-primary">{value.toLocaleString('en-PH')}</p>
      {trend && (
        <p className="flex items-center gap-1 text-xs text-text-secondary">
          <Icon name={trendIcon[trend.direction]} size={12} />
          {trend.text}
        </p>
      )}
      {footnote && <p className="text-xs text-text-secondary">{footnote}</p>}
    </div>
  )
}

/**
 * Loading placeholder with StatCard's exact shape: the same container, the real icon + label
 * (static text, known before data arrives), and bars where the scope, number, and footnote will be.
 */
export function StatCardSkeleton({
  icon,
  label,
  className,
}: {
  icon: IconName
  label: string
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      data-skeleton="stat-card"
      className={cn(
        'flex w-full flex-col gap-1 rounded-lg border border-border bg-background p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface text-brand-green-dark">
            <Icon name={icon} />
          </span>
          {label}
        </span>
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="my-1 h-7 w-20" />
      <Skeleton className="h-3 w-40 max-w-full" />
    </div>
  )
}
