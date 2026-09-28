import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'
import {
  PRESET_LABELS,
  rangeForPreset,
  type DateRange,
  type DateRangePreset,
} from '../../lib/dateRange'
import type { ISODate } from '../../types/entities'
import { Icon } from '../icons/Icon'
import { Button } from './Button'
import { Input } from './Input'

export interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  /** Today's date; custom ranges can't go past it. */
  today: ISODate
  /** Inline label + select, for a page header's top-right slot (the reference's period dropdown). */
  compact?: boolean
  /** Presets available in this context. Defaults to the dashboard's reporting ranges. */
  presets?: ReadonlyArray<DateRangePreset>
  /** Context-specific display labels, such as “This week” for an operational log. */
  presetLabels?: Partial<Record<DateRangePreset, string>>
  /** Float the custom dates below this control instead of changing the surrounding layout. */
  customPopover?: boolean
  className?: string
}

const defaultPresetOrder: DateRangePreset[] = ['today', 'last7', 'last30', 'thisMonth', 'custom']

/**
 * Date-range filter: presets first, with a custom From/To pair behind "Custom range". Editing the
 * dates only changes a draft; nothing is applied until Apply (or Enter). An invalid custom range is
 * explained inline and never applied, so the rest of the page keeps showing the last valid range.
 */
export function DateRangePicker({
  value,
  onChange,
  today,
  compact = false,
  presets = defaultPresetOrder,
  presetLabels,
  customPopover = false,
  className,
}: DateRangePickerProps) {
  const selectId = useId()
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [draft, setDraft] = useState({ from: value.from, to: value.to })
  const [error, setError] = useState<string | undefined>()
  const [open, setOpen] = useState(false)
  // Compact (page header) only: the From/To panel floats like a dropdown, so it needs its own
  // open state instead of showing whenever the preset is "custom".
  const [customOpen, setCustomOpen] = useState(false)
  const showCustom = compact ? customOpen && !open : value.preset === 'custom'
  const selectedIndex = Math.max(
    0,
    presets.findIndex((preset) => preset === value.preset),
  )
  const labelForPreset = (preset: DateRangePreset) => presetLabels?.[preset] ?? PRESET_LABELS[preset]

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setCustomOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function editDraft(next: { from: ISODate; to: ISODate }) {
    setDraft(next)
    setError(undefined)
  }

  function closeCustom() {
    setCustomOpen(false)
    triggerRef.current?.focus()
  }

  function applyCustom(next: { from: ISODate; to: ISODate }) {
    if (!next.from || !next.to) {
      setError('Enter both a start and an end date.')
    } else if (next.from > next.to) {
      setError('The start date must be on or before the end date.')
    } else if (next.to > today) {
      setError('The end date can’t be later than today.')
    } else {
      setError(undefined)
      onChange({ preset: 'custom', ...next })
      if (compact) closeCustom()
    }
  }

  function cancelCustom() {
    setDraft({ from: value.from, to: value.to })
    setError(undefined)
    closeCustom()
  }

  function onPresetChange(preset: DateRangePreset) {
    setOpen(false)
    setCustomOpen(preset === 'custom')
    if (preset === 'custom') {
      setError(undefined)
      setDraft({ from: value.from, to: value.to })
      // Compact: the popover holds the draft, and the preset only switches once Apply succeeds.
      if (!compact) onChange({ ...value, preset: 'custom' })
    } else {
      setError(undefined)
      onChange(rangeForPreset(preset, today))
    }
  }

  function focusOption(index: number) {
    optionRefs.current[index]?.focus()
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      window.setTimeout(() =>
        focusOption(event.key === 'ArrowDown' ? selectedIndex : presets.length - 1),
      )
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen((next) => !next)
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  function onOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      focusOption((index + direction + presets.length) % presets.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusOption(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusOption(presets.length - 1)
    } else if (event.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        compact || customPopover
          ? 'relative flex justify-end'
          : 'flex flex-wrap items-end gap-3',
        className,
      )}
    >
      <div className={cn('flex', compact ? 'items-center gap-2' : 'flex-col gap-1')}>
        <label
          htmlFor={selectId}
          className={cn(
            'text-xs font-semibold',
            compact ? 'text-text-secondary' : 'text-text-primary',
          )}
        >
          Date range
        </label>
        <div className="relative inline-flex">
          <button
            ref={triggerRef}
            id={selectId}
            type="button"
            aria-label="Date range"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            onClick={() => setOpen((next) => !next)}
            onKeyDown={onTriggerKeyDown}
            className={cn(
              'inline-flex items-center rounded-md border border-border bg-background text-sm font-semibold text-text-primary shadow-card',
              'cursor-pointer transition-colors duration-150 hover:border-brand-green hover:bg-surface motion-reduce:transition-none',
              compact ? 'h-10 min-w-40 pr-8 pl-3' : 'h-8 min-w-36 pr-8 pl-2',
            )}
          >
            <span className="mr-2 inline-flex size-5 items-center justify-center text-brand-green-dark">
              <Icon name="calendar" size={14} />
            </span>
            <span className="min-w-0 flex-1 text-left">{labelForPreset(value.preset)}</span>
          </button>
          <Icon
            name="chevronDown"
            size={14}
            className={cn(
              'pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-brand-green-dark transition-transform duration-150 motion-reduce:transition-none',
              open && 'rotate-180',
            )}
          />
          {open && (
            <div
              id={listboxId}
              role="listbox"
              aria-label="Date range presets"
              className="absolute top-full right-0 z-30 mt-1.5 min-w-full w-max max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-border bg-background p-1 shadow-raised"
            >
              {presets.map((preset, index) => {
                const selected = preset === value.preset
                return (
                  <button
                    key={preset}
                    ref={(node) => {
                      optionRefs.current[index] = node
                    }}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => onPresetChange(preset)}
                    onKeyDown={(event) => onOptionKeyDown(event, index)}
                    className={cn(
                      'flex w-full cursor-pointer whitespace-nowrap rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors duration-150 motion-reduce:transition-none',
                      selected
                        ? 'bg-surface font-semibold text-brand-green-dark'
                        : 'text-text-primary hover:bg-surface',
                    )}
                  >
                    <span>{labelForPreset(preset)}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      {showCustom && (
        <form
          aria-label="Custom date range"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            applyCustom(draft)
          }}
          onKeyDown={(event) => {
            if (compact && event.key === 'Escape') cancelCustom()
          }}
          className={cn(
            'rounded-md border border-border bg-background',
            // Popover variants overlay below the trigger so custom dates never shift page content.
            compact || customPopover
              ? 'absolute top-full right-0 z-30 mt-1.5 w-max p-3 shadow-raised'
              : 'basis-full p-3 shadow-card',
          )}
        >
          <div className="flex flex-wrap items-start gap-3">
            <Input
              type="date"
              label="From"
              value={draft.from}
              max={today}
              onChange={(e) => editDraft({ ...draft, from: e.target.value })}
              aria-describedby={error ? `${selectId}-range-error` : undefined}
              inputClassName="border-border bg-background hover:border-brand-green"
            />
            <Input
              type="date"
              label="To"
              value={draft.to}
              max={today}
              onChange={(e) => editDraft({ ...draft, to: e.target.value })}
              aria-describedby={error ? `${selectId}-range-error` : undefined}
              inputClassName="border-border bg-background hover:border-brand-green"
            />
          </div>
          {error && (
            <p
              id={`${selectId}-range-error`}
              role="alert"
              className="mt-2 text-xs font-semibold text-error"
            >
              {error}
            </p>
          )}
          <div className="mt-3 flex justify-end gap-2">
            {compact && (
              <Button type="button" variant="neutral" size="sm" onClick={cancelCustom}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" size="sm">
              Apply
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
