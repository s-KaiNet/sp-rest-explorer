import { useShallow } from 'zustand/react/shallow'
import { useRecentlyVisitedStore } from '@/stores/recently-visited-store'

// Re-export the type for backward compatibility (HomePage imports it from here)
export type { RecentlyVisitedItem } from '@/stores/recently-visited-store'

// ── Thin wrapper hook ──

export function useRecentlyVisited() {
  return useRecentlyVisitedStore(
    useShallow((s) => ({
      items: s.items,
      addVisit: s.addVisit,
      clearAll: s.clearAll,
    })),
  )
}
