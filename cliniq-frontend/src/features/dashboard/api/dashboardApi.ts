import { todayISO } from '../../../lib/dates'
import { getMockDataset } from '../../../lib/mocks/dataset'
import type { ISODate } from '../../../types/entities'
import type { CalendarDay, DashboardQuery, DashboardSummary } from '../types'
import { buildCalendarDays, buildDashboardSummary } from './aggregate'

/**
 * Dashboard data access. It's read-only (GET-style) on purpose: this screen never creates, updates,
 * or deletes anything, so no audit-log call is needed here (see `.claude/skills/cliniq-audit-trail/`).
 *
 * MOCK: resolves from the shared mock dataset for now (Phase F1 runs on mock data, per ADR-006).
 * When Phase B9 lands, swap these bodies for real requests to the Laravel API. The signatures and
 * return types are the contract, so the components don't change.
 *
 * Dev-only knob: add `?mock=error`, `?mock=empty`, or `?mock=slow` to the URL to preview the error,
 * empty, and loading states.
 */

type MockMode = 'normal' | 'error' | 'empty' | 'slow'

function mockMode(): MockMode {
  if (typeof window === 'undefined') return 'normal'
  const mode = new URLSearchParams(window.location.search).get('mock')
  return mode === 'error' || mode === 'empty' || mode === 'slow' ? mode : 'normal'
}

async function simulateLatency(mode: MockMode) {
  if (import.meta.env.MODE === 'test') return
  await new Promise((resolve) => setTimeout(resolve, mode === 'slow' ? 2500 : 250))
}

export async function fetchDashboardSummary(query: DashboardQuery): Promise<DashboardSummary> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock dashboard failure')
  const dataset = getMockDataset(todayISO())
  const source =
    mode === 'empty'
      ? { ...dataset, visits: [], incidents: [], followUps: [], inventory: [] }
      : dataset
  return buildDashboardSummary(source, query, new Date().toISOString())
}

export async function fetchCalendarDays(from: ISODate, to: ISODate): Promise<CalendarDay[]> {
  const mode = mockMode()
  await simulateLatency(mode)
  if (mode === 'error') throw new Error('Mock calendar failure')
  const dataset = getMockDataset(todayISO())
  const source = mode === 'empty' ? { ...dataset, visits: [], incidents: [] } : dataset
  return buildCalendarDays(source, from, to)
}
