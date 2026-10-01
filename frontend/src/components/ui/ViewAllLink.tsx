import type { ReactNode } from 'react'
import { Link, type To } from 'react-router'
import { cn } from '../../lib/cn'
import { Icon } from '../icons/Icon'

export function ViewAllLink({
  to,
  children = 'View all',
  className,
}: {
  to: To
  children?: ReactNode
  className?: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold text-brand-green-dark underline decoration-brand-green-dark/40 underline-offset-2 cursor-pointer transition-colors hover:text-brand-green hover:decoration-brand-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green motion-reduce:transition-none',
        'whitespace-nowrap',
        className,
      )}
    >
      {children}
      <Icon name="arrowRight" size={14} />
    </Link>
  )
}
