import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * Card: the standard white container on the page. The border and radius are shared by every panel,
 * so sections separate by outline, not by heavy shadow.
 */
export function Card({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        'rounded-lg border border-border bg-background print:break-inside-avoid',
        className,
      )}
      {...rest}
    />
  )
}

export interface CardHeaderProps {
  /** Rendered as an h2 by default; pass `headingLevel` to fit the page outline. */
  title: ReactNode
  titleId?: string
  headingLevel?: 2 | 3
  description?: ReactNode
  /** Leading icon element, shown before the title. */
  icon?: ReactNode
  /** Right-aligned controls (toggles, counts). */
  actions?: ReactNode
  className?: string
}

export function CardHeader({
  title,
  titleId,
  headingLevel = 2,
  description,
  icon,
  actions,
  className,
}: CardHeaderProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        {icon && <span className="mt-0.5 shrink-0 text-text-secondary">{icon}</span>}
        <div className="min-w-0">
          <Heading id={titleId} className="text-base font-semibold text-text-primary">
            {title}
          </Heading>
          {description && <p className="text-xs text-text-secondary">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 print:hidden">{actions}</div>}
    </div>
  )
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4', className)} {...rest} />
}
