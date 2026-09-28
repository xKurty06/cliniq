import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from '../icons/Icon'

/** Calm "nothing here" message. It explains why the section is empty; it isn't an error. */
export function EmptyState({
  icon = 'inbox',
  title,
  description,
  className,
}: {
  icon?: IconName
  title: string
  description?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 px-4 py-6 text-center',
        className,
      )}
    >
      <Icon name={icon} size={20} className="text-text-secondary" />
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      {description && <p className="max-w-sm text-xs text-text-secondary">{description}</p>}
    </div>
  )
}
