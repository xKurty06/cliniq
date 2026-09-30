import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../icons/Icon'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  label: string
  values: ReadonlyArray<string>
  options: ReadonlyArray<MultiSelectOption>
  onChange: (values: string[]) => void
  allLabel: string
  className?: string
}

/**
 * Compact checkbox popover for filters that intentionally accept more than one value. It is kept
 * separate from Select: native selects cannot communicate or operate a multi-select filter well.
 */
export function MultiSelect({
  label,
  values,
  options,
  onChange,
  allLabel,
  className,
}: MultiSelectProps) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selected = new Set(values)
  const summary = values.length === 0 ? allLabel : `${values.length} selected`

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function toggle(value: string) {
    const next = new Set(values)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    onChange(options.filter((option) => next.has(option.value)).map((option) => option.value))
  }

  return (
    <div ref={rootRef} className={cn('relative flex flex-col gap-1', className)}>
      <span id={`${id}-label`} className="text-xs font-semibold text-text-primary">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-labelledby={`${id}-label ${id}-summary`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false)
            triggerRef.current?.focus()
          }
        }}
        className="relative h-10 w-full cursor-pointer rounded-md border border-border bg-background px-3 pr-9 text-left text-sm text-text-primary shadow-card transition-colors duration-150 hover:border-brand-green hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green motion-reduce:transition-none"
      >
        <span id={`${id}-summary`}>{summary}</span>
        <Icon name="chevronDown" className={cn('pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-brand-green-dark transition-transform duration-150 motion-reduce:transition-none', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="dialog"
          aria-labelledby={`${id}-label`}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false)
              triggerRef.current?.focus()
            }
          }}
          className="absolute top-full z-30 mt-1.5 min-w-full w-max max-w-[calc(100vw-2rem)] rounded-md border border-border bg-background p-2 shadow-raised"
        >
          <fieldset>
            <legend className="sr-only">{label}</legend>
            <div className="flex flex-col gap-1">
              {options.map((option) => {
                const optionId = `${id}-${option.value}`
                return (
                  <label key={option.value} htmlFor={optionId} className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-text-primary transition-colors duration-150 hover:bg-surface motion-reduce:transition-none">
                    <input
                      id={optionId}
                      type="checkbox"
                      checked={selected.has(option.value)}
                      onChange={() => toggle(option.value)}
                      className="size-4 cursor-pointer accent-brand-green-dark"
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  )
}
