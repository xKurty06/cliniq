import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Minimal async-loading hook: plain promise + React state.
 *
 * PLACEHOLDER. The data-fetching library (TanStack Query / SWR / plain fetch) is still an open
 * decision (Development-Phases.md §0). Screens call this hook instead of a library directly, so
 * when that decision lands, only this file and the feature `api/` modules need to change.
 *
 * - `key` identifies the request. When it changes, the loader runs again.
 * - Previous data is kept while a new key loads or `reload()` runs (`isRefetching`), so the page
 *   holds its frame instead of flashing back to skeletons.
 */
export type AsyncStatus = 'loading' | 'success' | 'error'

export interface AsyncData<T> {
  data: T | undefined
  status: AsyncStatus
  isRefetching: boolean
  reload: () => void
}

interface Settled<T> {
  requestKey: string
  data: T | undefined
  failed: boolean
}

export function useAsyncData<T>(key: string, loader: () => Promise<T>): AsyncData<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | undefined>()
  const loaderRef = useRef(loader)
  useLayoutEffect(() => {
    loaderRef.current = loader
  })

  const requestKey = `${key}#${attempt}`

  useEffect(() => {
    let cancelled = false
    loaderRef.current().then(
      (data) => {
        if (!cancelled) setSettled({ requestKey, data, failed: false })
      },
      () => {
        if (!cancelled) setSettled({ requestKey, data: undefined, failed: true })
      },
    )
    return () => {
      cancelled = true
    }
  }, [requestKey])

  // Re-running keeps the last good data on screen (isRefetching) instead of flashing back to the
  // skeleton after a save. A failed request has no data, so "Try again" still shows the skeleton.
  const reload = useCallback(() => {
    setAttempt((n) => n + 1)
  }, [])

  const isCurrent = settled?.requestKey === requestKey
  const data = settled?.failed ? undefined : settled?.data
  // A superseded request (new key in flight) keeps showing its previous data, never a stale error.
  let status: AsyncStatus = 'loading'
  if (isCurrent) status = settled.failed ? 'error' : 'success'
  else if (data !== undefined) status = 'success'

  return { data, status, isRefetching: !isCurrent && data !== undefined, reload }
}
