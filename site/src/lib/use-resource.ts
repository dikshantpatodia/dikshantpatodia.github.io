import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from './api'

export type ResourceStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ResourceState<T> {
  status: ResourceStatus
  data: T | null
  error: Error | null
}

export interface ResourceOptions {
  /** Set false to hold the request until a dependency (a search term, a tab) is ready. */
  enabled?: boolean
  /** Keep the previous result while the next one loads. Defaults to true. */
  keepPreviousData?: boolean
}

export interface Resource<T> extends ResourceState<T> {
  reload: () => void
}

function isAbort(error: unknown): boolean {
  if (error instanceof ApiError) return error.isAbort
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * Loads one asynchronous value for the lifetime of a component.
 *
 * Every runtime fetch should go through this instead of `useEffect` plus
 * `useState`: it aborts on unmount and on dependency change, ignores stale
 * responses, exposes a consistent status machine (`idle`/`loading`/`success`/
 * `error`) with `reload()`, and keeps the previous data during a refetch so the
 * layout does not collapse between requests.
 *
 * `deps` must keep a stable length between renders (same rule as `useEffect`).
 * Do not gate indexable content on this — that is prerendered at build time.
 */
export function useResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
  options: ResourceOptions = {},
): Resource<T> {
  const { enabled = true, keepPreviousData = true } = options

  const [state, setState] = useState<ResourceState<T>>(() => ({
    status: enabled ? 'loading' : 'idle',
    data: null,
    error: null,
  }))
  const [attempt, setAttempt] = useState(0)

  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'idle', data: null, error: null })
      return
    }

    const controller = new AbortController()
    let active = true

    setState((previous) => ({
      status: 'loading',
      data: keepPreviousData ? previous.data : null,
      error: null,
    }))

    loadRef.current(controller.signal).then(
      (data) => {
        if (active) setState({ status: 'success', data, error: null })
      },
      (error: unknown) => {
        if (!active || isAbort(error)) return
        setState((previous) => ({
          status: 'error',
          data: keepPreviousData ? previous.data : null,
          error: error instanceof Error ? error : new Error(String(error)),
        }))
      },
    )

    return () => {
      active = false
      controller.abort()
    }
    // The caller owns the dependency list, mirroring useEffect's contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, keepPreviousData, attempt, ...deps])

  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  return { ...state, reload }
}
