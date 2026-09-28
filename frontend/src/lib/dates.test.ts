import { describe, expect, it } from 'vitest'
import { addDays, addMonths, diffDays, endOfMonth, startOfWeek } from './dates'

describe('dates', () => {
  it('does calendar-day arithmetic without timezone drift', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(diffDays('2026-09-26', '2026-10-03')).toBe(7)
    expect(endOfMonth('2028-02-10')).toBe('2028-02-29')
  })
  it('clamps month arithmetic to the last day of the month', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
  })
  it('starts weeks on Sunday', () => {
    expect(startOfWeek('2026-09-26')).toBe('2026-09-20')
    expect(startOfWeek('2026-09-20')).toBe('2026-09-20')
  })
})
