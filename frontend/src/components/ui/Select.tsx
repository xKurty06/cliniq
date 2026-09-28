import { useId, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../icons/Icon'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'onChange' | 'value'> {
  label: string
  value: string
  options: ReadonlyArray<SelectOption>
  onChange: (value: string) => void
  /** Adds an empty first option, e.g. "Select item". */
  placeholder?: string
  hint?: string
  error?: string
  id?: string
  className?: string
  /** Places the label beside the control from the small breakpoint upward. */
  inline?: boolean
}

/**
 * Custom-styled select (cliniq-interactive-states): `appearance-none`, a brand chevron, and the same
 * border/radius/hover treatment as other fields, so it never renders as native OS chrome. It stays a
 * real `<select>` underneath for keyboard and screen-reader support.
 */
export function Select({
  label,
  value,
  options,
  onChange,
  placeholder,
  hint,
  error,
  id,
  required,
  className,
  inline = false,
  ...rest
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  const hintId = hint ? `${selectId}-hint` : undefined
  const errorId = error ? `${selectId}-error` : undefined
  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        inline && 'sm:flex-row sm:items-center sm:gap-3',
        className,
      )}
    >
      <label
        htmlFor={selectId}
        className={cn('text-xs font-semibold text-text-primary', inline && 'sm:shrink-0')}
      >
        {label}
        {required && (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <div className={cn('relative', inline && 'sm:min-w-0 sm:flex-1')}>
        <select
          id={selectId}
          value={value}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hintId, errorId) || undefined}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'h-10 w-full cursor-pointer appearance-none rounded-md border bg-background px-3 pr-9 text-sm text-text-primary shadow-card',
            'transition-colors duration-150 hover:border-brand-green hover:bg-surface motion-reduce:transition-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-error' : 'border-border',
          )}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-brand-green-dark"
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  )
}
