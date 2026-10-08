import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { parseISODate, toISODate } from '../lib/dates'
import type { DateRange } from '../lib/dateRange'
import type { ISODate } from '../types/entities'

function isISODate(value: string): value is ISODate {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && toISODate(parseISODate(value as ISODate)) === value
}

/**
 * Reads a one-time `from`/`to` entry filter. A screen keeps the returned range in local state;
 * it does not re-apply the entry filter after an in-screen range change or remount.
 */
export function dateRangeFromEntryParams(
  searchParams: URLSearchParams,
  defaultRange: DateRange,
): DateRange {
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''
  return isISODate(from) && isISODate(to) && from <= to
    ? { preset: 'custom', from, to }
    : defaultRange
}

/**
 * Date parameters are entry filters rather than persistent screen state. Valid values apply once
 * on arrival; a screen calls `clearDateParams` after the user chooses a new range.
 */
export function useDateRangeEntryParams(defaultRange: DateRange) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [initialRange] = useState(() => dateRangeFromEntryParams(searchParams, defaultRange))

  function clearDateParams() {
    if (!searchParams.has('from') && !searchParams.has('to')) return
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('from')
        next.delete('to')
        return next
      },
      { replace: true },
    )
  }

  return { initialRange, clearDateParams }
}
