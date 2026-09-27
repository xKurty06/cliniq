/**
 * MOCK ONLY: the shared `?mock=error|slow` switch and simulated network delay for feature `api/`
 * modules. Replaced by real request handling once the data-fetching decision lands
 * (Development-Phases.md §0).
 */
export type MockMode = 'normal' | 'error' | 'slow'

export function mockMode(): MockMode {
  if (typeof window === 'undefined') return 'normal'
  const mode = new URLSearchParams(window.location.search).get('mock')
  return mode === 'error' || mode === 'slow' ? mode : 'normal'
}

/** Waits like a LAN request would, then throws in `?mock=error` mode. Instant under Vitest. */
export async function mockRequest(failureMessage: string): Promise<void> {
  const mode = mockMode()
  if (import.meta.env.MODE !== 'test') {
    await new Promise((resolve) => setTimeout(resolve, mode === 'slow' ? 1200 : 200))
  }
  if (mode === 'error') throw new Error(failureMessage)
}

/** Reads one query-string value (temporary, until the routing decision lands). */
export function queryParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(name)
}
