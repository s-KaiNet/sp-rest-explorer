import { useSyncExternalStore } from 'react'
import type { DiffChanges, DiffStatus } from './types'
import { computeRawDiff } from './compute-diff'
import { transformDelta } from './transform-delta'
import { fetchHistoricalBlob } from './fetch-historical'
import { getMetadata } from '@/lib/metadata/metadata-store'

// ── Module-level singleton ──

let diffResult: DiffChanges | null = null
let diffStatus: DiffStatus = 'idle'
let diffError: string | null = null
const listeners = new Set<() => void>()

// ── Internal helpers ──

function notify(): void {
  listeners.forEach((cb) => cb())
}

function setLoading(): void {
  diffStatus = 'loading'
  diffError = null
  notify()
}

function setReady(result: DiffChanges): void {
  diffResult = result
  diffStatus = 'ready'
  diffError = null
  notify()
}

function setError(message: string): void {
  diffStatus = 'error'
  diffError = message
  diffResult = null
  notify()
}

// ── Subscription (useSyncExternalStore contract) ──

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getResultSnapshot(): DiffChanges | null {
  return diffResult
}

function getStatusSnapshot(): DiffStatus {
  return diffStatus
}

function getErrorSnapshot(): string | null {
  return diffError
}

// ── React hooks ──

/** React hook — returns DiffChanges | null, re-renders on change. */
export function useDiffSnapshot(): DiffChanges | null {
  return useSyncExternalStore(subscribe, getResultSnapshot, getResultSnapshot)
}

/** React hook — returns current diff status, re-renders on change. */
export function useDiffStatus(): DiffStatus {
  return useSyncExternalStore(subscribe, getStatusSnapshot, getStatusSnapshot)
}

/** React hook — returns current diff error message, re-renders on change. */
export function useDiffError(): string | null {
  return useSyncExternalStore(subscribe, getErrorSnapshot, getErrorSnapshot)
}

// ── Non-React getters (for imperative code) ──

/** Get current diff result (for non-React code). */
export function getDiffResult(): DiffChanges | null {
  return diffResult
}

/** Get current diff status (for non-React code). */
export function getDiffStatus(): DiffStatus {
  return diffStatus
}

/** Get current diff error message (for non-React code). */
export function getDiffError(): string | null {
  return diffError
}

// ── Orchestration ──

/**
 * Orchestrate the full diff pipeline:
 * 1. Get current metadata from metadata-store
 * 2. Fetch historical blob for the given year/month
 * 3. Compute raw jsondiffpatch delta
 * 4. Transform delta to UI-ready DiffChanges
 * 5. Store result for React consumption
 *
 * Sets status to 'loading' during computation, 'ready' on success,
 * 'error' with message on failure.
 *
 * Returns empty DiffChanges when historical blob returns 404 (graceful empty state).
 */
export async function computeDiff(
  year: number,
  month: number,
): Promise<void> {
  setLoading()

  try {
    const currentMetadata = getMetadata()
    if (!currentMetadata) {
      setError('Metadata not loaded yet')
      return
    }

    const historicalMetadata = await fetchHistoricalBlob(year, month)
    if (historicalMetadata === null) {
      // 404 — no historical blob for this month
      setReady({ entities: [], functions: [] })
      return
    }

    const delta = computeRawDiff(currentMetadata, historicalMetadata)
    if (delta === undefined) {
      // Identical snapshots — no changes
      setReady({ entities: [], functions: [] })
      return
    }

    const result = transformDelta(
      delta as Record<string, unknown>,
      currentMetadata,
    )
    setReady(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    setError(message)
  }
}

// ── Cleanup ──

/** Reset all diff state to idle. Used when navigating away from changelog page. */
export function resetDiff(): void {
  diffResult = null
  diffStatus = 'idle'
  diffError = null
  notify()
}
