import { useSyncExternalStore } from 'react'
import type { Metadata } from './types'

// ── Module-level singleton ──

let metadata: Metadata | null = null
const listeners = new Set<() => void>()

// ── Subscription (useSyncExternalStore contract) ──

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot(): Metadata | null {
  return metadata
}

// ── Public API ──

/** Store metadata as a frozen singleton and notify subscribers. */
export function setMetadata(data: Metadata): void {
  metadata = Object.freeze(data)
  listeners.forEach((cb) => cb())
}

/** Get current metadata (for non-React code). */
export function getMetadata(): Metadata | null {
  return metadata
}

/** React hook — returns Metadata | null, re-renders on change. */
export function useMetadataSnapshot(): Metadata | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
