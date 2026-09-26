import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon, type IconName } from '../icons/Icon'

/**
 * Button hierarchy (Design-System.md, "Button Hierarchy & Color"):
 * - primary: the one likely action. Filled brand-green-dark with white text. Button labels are
 *   14px, which counts as *small* text, and the contrast rules only allow small white text on
 *   brand-green-dark (9.19:1), not brand-green (3.74:1).
 * - secondary: quieter outline with brand-green-dark text (brand-green text is only 3.74:1).
 * - neutral: cancel / go back. Visible, never competing.
 * - destructive: filled error red, reserved for genuinely irreversible actions only.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'destructive'
export type ButtonSize = 'sm' | 'md'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-green-dark text-white border border-brand-green-dark hover:bg-brand-green-dark/90',
  secondary: 'bg-background text-brand-green-dark border border-brand-green hover:bg-surface',
  neutral:
    'bg-background text-text-secondary border border-border hover:bg-surface hover:text-text-primary',
  destructive: 'bg-error text-white border border-error hover:bg-error/90',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 gap-1.5 text-sm',
  md: 'h-9 px-4 gap-2 text-sm',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Leading icon, always shown alongside the visible label (icon + text). */
  icon?: IconName
  /** Shows a busy state and blocks repeat clicks. */
  loading?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold whitespace-nowrap',
        'transition-colors duration-150 motion-reduce:transition-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Icon name="refresh" className="animate-spin motion-reduce:animate-none" />
      ) : (
        icon && <Icon name={icon} />
      )}
      {children}
    </button>
  )
}
