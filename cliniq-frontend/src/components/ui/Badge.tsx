import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from '../icons/Icon'

/**
 * Badge: always icon + label, never color alone (Design-System.md, Accessibility / Color System).
 *
 * Tone → token mapping (every combination is contrast-checked; see src/index.css):
 * - solid info/success/warning/error: semantic fill + white text (4.60–5.73:1, all pass for
 *   small text). Use when the state needs to be noticed at a glance.
 * - outline: white fill, semantic border + icon, text-primary label. The quieter version.
 * - neutral: surface fill, text-secondary (5.68:1).
 * - accent: brand-yellow fill + text-primary (13.49:1). Brand highlight, not a status.
 */
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'accent'
export type BadgeVariant = 'solid' | 'outline'

const defaultIcons: Partial<Record<BadgeTone, IconName>> = {
  info: 'info',
  success: 'checkCircle',
  warning: 'alertTriangle',
  error: 'alertOctagon',
}

const solidClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface text-text-secondary border-border',
  info: 'bg-info text-white border-info',
  success: 'bg-success text-white border-success',
  warning: 'bg-warning text-white border-warning',
  error: 'bg-error text-white border-error',
  accent: 'bg-brand-yellow text-text-primary border-brand-yellow-dark',
}

const outlineIconClasses: Record<BadgeTone, string> = {
  neutral: 'text-text-secondary',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  accent: 'text-text-primary',
}

const outlineBorderClasses: Record<BadgeTone, string> = {
  neutral: 'border-border',
  info: 'border-info',
  success: 'border-success',
  warning: 'border-warning',
  error: 'border-error',
  accent: 'border-brand-yellow-dark',
}

export interface BadgeProps {
  tone?: BadgeTone
  variant?: BadgeVariant
  /** Overrides the tone's default icon. Pass `null` for a text-only neutral badge. */
  icon?: IconName | null
  children: ReactNode
  className?: string
}

export function Badge({
  tone = 'neutral',
  variant = 'solid',
  icon,
  children,
  className,
}: BadgeProps) {
  const iconName = icon === null ? undefined : (icon ?? defaultIcons[tone])
  const isOutline = variant === 'outline'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        isOutline
          ? cn('bg-background text-text-primary', outlineBorderClasses[tone])
          : solidClasses[tone],
        // Forced-colors / print: keep a visible outline so the badge still reads as a badge.
        'forced-colors:border-[CanvasText] print:border-current',
        className,
      )}
    >
      {iconName && (
        <Icon
          name={iconName}
          size={12}
          className={cn('shrink-0', isOutline && outlineIconClasses[tone])}
        />
      )}
      {children}
    </span>
  )
}
