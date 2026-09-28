import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** A real, visible label. Placeholder text never stands in for one. */
  label: string
  hint?: string
  /** Plain-language validation message, shown under the field. */
  error?: string
  id?: string
  className?: string
  inputClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  label,
  hint,
  error,
  id,
  required,
  className,
  inputClassName,
  ...rest
}: InputProps, ref) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={inputId} className="text-xs font-semibold text-text-primary">
        {label}
        {required && (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <input
        id={inputId}
        ref={ref}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hintId, errorId) || undefined}
        className={cn(
          'h-8 rounded-md border bg-background px-2 text-sm text-text-primary',
          error ? 'border-error' : 'border-text-secondary',
          inputClassName,
        )}
        {...rest}
      />
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
})
