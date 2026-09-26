import type { ISODate } from '../types/entities'
import { addDays, diffDays, formatDateRange, startOfMonth } from './dates'

export type DateRangePreset = 'today' | 'last7' | 'last30' | 'thisMonth' | 'custom'

export interface DateRange {
  preset: DateRangePreset
  from: ISODate
  to: ISODate
}

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: 'Today',
  last7: 'Last 7 days',
  last30: 'Last 30 days',
  thisMonth: 'This month',
  custom: 'Custom range',
}

export function rangeForPreset(
  preset: Exclude<DateRangePreset, 'custom'>,
  today: ISODate,
): DateRange {
  switch (preset) {
    case 'today':
      return { preset, from: today, to: today }
    case 'last7':
      return { preset, from: addDays(today, -6), to: today }
    case 'last30':
      return { preset, from: addDays(today, -29), to: today }
    case 'thisMonth':
      return { preset, from: startOfMonth(today), to: today }
  }
}

/** Human label for what a range covers, e.g. "Last 30 days" or "Sep 1 – Sep 12, 2026". */
export function describeRange(range: DateRange): string {
  return range.preset === 'custom'
    ? formatDateRange(range.from, range.to)
    : PRESET_LABELS[range.preset]
}

/** The equal-length period immediately before `range`, used for "vs previous period" trends. */
export function previousPeriod(range: DateRange): { from: ISODate; to: ISODate } {
  const length = diffDays(range.from, range.to) + 1
  return { from: addDays(range.from, -length), to: addDays(range.from, -1) }
}

export function rangeLengthDays(range: { from: ISODate; to: ISODate }): number {
  return diffDays(range.from, range.to) + 1
}
