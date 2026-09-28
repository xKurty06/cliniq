import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from '../icons/Icon'
import { buttonClassName, type ButtonSize, type ButtonVariant } from './buttonClassName'

export type { ButtonSize, ButtonVariant }

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Leading icon, always shown alongside the visible label (icon + text). */
  icon?: IconName
  /** Shows a busy state and blocks repeat clicks. */
  loading?: boolean
}

/** Variant hierarchy and colors are documented in `./buttonClassName.ts`. */
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
      className={buttonClassName({ variant, size, className })}
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
