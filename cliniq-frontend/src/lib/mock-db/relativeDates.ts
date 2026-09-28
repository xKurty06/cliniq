import { addDays } from '../dates'
import type { ISODate, ISODateTime } from '../../types/entities'
import type { RelativeDate, RelativeDateTime } from './types'

/**
 * Resolves the seed's relative dates against one "today", so the seed never goes stale: whatever
 * day the app is opened, an item seeded 11 days from expiry is still 11 days from expiry.
 */

export function resolveDate(value: RelativeDate, today: ISODate): ISODate {
  return 'daysAgo' in value ? addDays(today, -value.daysAgo) : addDays(today, value.daysFromNow)
}

/** Seed times are Philippine time (UTC+8), the clinic's only timezone. */
export function resolveDateTime(value: RelativeDateTime, today: ISODate): ISODateTime {
  return `${resolveDate(value, today)}T${value.time}:00+08:00`
}

export function isRelativeDate(value: unknown): value is RelativeDate {
  if (!value || typeof value !== 'object') return false
  const keys = Object.keys(value).filter((key) => key !== 'time')
  if (keys.length !== 1) return false
  const n = (value as Record<string, unknown>)[keys[0]]
  return (keys[0] === 'daysAgo' || keys[0] === 'daysFromNow') && Number.isInteger(n) && (n as number) >= 0
}

export function isRelativeDateTime(value: unknown): value is RelativeDateTime {
  const time = (value as { time?: unknown } | null)?.time
  return isRelativeDate(value) && typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
}
