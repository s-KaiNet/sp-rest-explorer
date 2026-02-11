import { get, set } from 'idb-keyval'
import { CACHE_KEY } from '@/lib/constants'
import type { Metadata } from './types'

interface CachedMetadata {
  data: Metadata
  timestamp: number
}

/** Retrieve cached metadata from IndexedDB. Returns null if unavailable. */
export async function getCachedMetadata(): Promise<Metadata | null> {
  try {
    const cached = await get<CachedMetadata>(CACHE_KEY)
    return cached?.data ?? null
  } catch {
    // IndexedDB may be unavailable in private browsing
    return null
  }
}

/** Store metadata in IndexedDB cache. Silently ignores errors. */
export async function setCachedMetadata(data: Metadata): Promise<void> {
  try {
    await set(CACHE_KEY, { data, timestamp: Date.now() } satisfies CachedMetadata)
  } catch {
    // IndexedDB may be unavailable in private browsing
  }
}
