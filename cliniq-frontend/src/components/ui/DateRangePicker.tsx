import { useId, useState } from 'react'
import { cn } from '../../lib/cn'
import {
  PRESET_LABELS,
  rangeForPreset,
  type DateRange,
  type DateRangePreset,
} from '../../lib/dateRange'
import type { ISODate } from '../../types/entities'
import { Input } from './Input'

export interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  /** Today's date; custom ranges can't go past it. */
  today: ISODate
  className?: string
}

const presetOrder: DateRangePreset[] = ['today', 'last7', 'last30', 'thisMonth', 'custom']

/**
 * Date-range filter: presets first (a native select, which is keyboard- and screen-reader-friendly
 * for free), with a custom From/To pair behind "Custom range". An invalid custom range is explained
 * inline and never applied, so the rest of the page keeps showing the last valid range.
 */
export function DateRangePicker({ value, onChange, today, className }: DateRangePickerProps) {
  const selectId = useId()
  const [draft, setDraft] = useState({ from: value.from, to: value.to })
  const [error, setError] = useState<string | undefined>()

  function applyCustom(next: { from: ISODate; to: ISODate }) {
    setDraft(next)
    if (!next.from || !next.to) {
      setError('Enter both a start and an end date.')
    } else if (next.from > next.to) {
      setError('The start date must be on or before the end date.')
    } else if (next.to > today) {
      setError('The end date can’t be later than today.')
    } else {
      setError(undefined)
      onChange({ preset: 'custom', ...next })
    }
  }

  function onPresetChange(preset: DateRangePreset) {
    if (preset === 'custom') {
      setError(undefined)
      setDraft({ from: value.from, to: value.to })
      onChange({ ...value, preset: 'custom' })
    } else {
      setError(undefined)
      onChange(rangeForPreset(preset, today))
    }
  }

  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      <div className="flex flex-col gap-1">
        <label htmlFor={selectId} className="text-xs font-semibold text-text-primary">
          Date range
        </label>
        <select
          id={selectId}
          value={value.preset}
          onChange={(e) => onPresetChange(e.target.value as DateRangePreset)}
          className="h-8 rounded-md border border-text-secondary bg-background px-2 text-sm text-text-primary"
        >
          {presetOrder.map((p) => (
            <option key={p} value={p}>
              {PRESET_LABELS[p]}
            </option>
          ))}
        </select>
      </div>
      {value.preset === 'custom' && (
        <>
          <Input
            type="date"
            label="From"
            value={draft.from}
            max={today}
            onChange={(e) => applyCustom({ ...draft, from: e.target.value })}
            aria-describedby={error ? `${selectId}-range-error` : undefined}
          />
          <Input
            type="date"
            label="To"
            value={draft.to}
            max={today}
            onChange={(e) => applyCustom({ ...draft, to: e.target.value })}
            aria-describedby={error ? `${selectId}-range-error` : undefined}
          />
          {error && (
            <p
              id={`${selectId}-range-error`}
              role="alert"
              className="basis-full text-xs font-semibold text-error"
            >
              {error}
            </p>
          )}
        </>
      )}
    </div>
  )
}
