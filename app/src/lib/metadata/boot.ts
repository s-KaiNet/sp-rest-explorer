import { METADATA_URL } from '@/lib/constants'
import { useAppStore } from '@/stores/app-store'
import { getCachedMetadata, setCachedMetadata } from './metadata-cache'
import { getLookupMaps, initLookupMaps } from './lookup-maps'
import { setMetadata } from './metadata-store'
import { initSearchIndex } from './search-index'
import { initTypeIndexes } from './type-indexes'
import type { Metadata } from './types'

/** Hydrate the data layer: cache → fetch → freeze → build maps → build index → ready. */
export async function bootMetadata(): Promise<void> {
  const { setStatus } = useAppStore.getState()
  setStatus('loading')

  const t0 = performance.now()

  try {
    // Try IndexedDB cache first
    const cached = await getCachedMetadata()

    if (cached) {
      // Serve cached data immediately
      hydrate(cached)
      setStatus('ready')

      console.log(
        '[SP Explorer] Metadata loaded from cache in',
        Math.round(performance.now() - t0),
        'ms',
      )

      // Background revalidation — fetch fresh, update cache only (not live singleton)
      fetchFresh()
        .then((fresh) => setCachedMetadata(fresh))
        .catch(() => {
          /* silent — cached data still valid */
        })

      return
    }

    // No cache — fetch from Azure
    const data = await fetchFresh()
    hydrate(data)
    await setCachedMetadata(data)
    setStatus('ready')

    console.log(
      '[SP Explorer] Metadata loaded from network in',
      Math.round(performance.now() - t0),
      'ms',
    )
  } catch {
    setStatus(
      'error',
      'Failed to load API metadata from Azure. Check your connection and try again.',
    )
  }
}

/** Reset and retry the boot sequence. */
export async function retryBoot(): Promise<void> {
  useAppStore.getState().setStatus('idle')
  return bootMetadata()
}

// ── Internal helpers ──

function hydrate(data: Metadata): void {
  setMetadata(data)
  initLookupMaps(data)
  initSearchIndex(data, getLookupMaps()!)
  initTypeIndexes(data, getLookupMaps()!)
}

async function fetchFresh(): Promise<Metadata> {
  const res = await fetch(METADATA_URL)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  return (await res.json()) as Metadata
}
