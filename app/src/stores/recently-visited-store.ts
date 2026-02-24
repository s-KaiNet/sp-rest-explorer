import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Types ──

export interface RecentlyVisitedItem {
  name: string // Display name (e.g. "GetByTitle")
  path: string // Full hash path (e.g. "/_api/web/Lists/GetByTitle")
  kind: 'function' | 'navProperty' | 'root' | 'entity' // For icon coloring
  timestamp: number // Date.now() when visited
}

interface RecentlyVisitedState {
  items: RecentlyVisitedItem[]
  addVisit: (item: Omit<RecentlyVisitedItem, 'timestamp'>) => void
  clearAll: () => void
}

const MAX_ITEMS = 12

// ── Store ──

export const useRecentlyVisitedStore = create<RecentlyVisitedState>()(
  persist(
    (set) => ({
      items: [],

      addVisit: (item) =>
        set((state) => {
          // Remove existing entry with same path (if any)
          const filtered = state.items.filter((i) => i.path !== item.path)
          // Prepend new entry with current timestamp, cap at MAX_ITEMS
          return {
            items: [{ ...item, timestamp: Date.now() }, ...filtered].slice(
              0,
              MAX_ITEMS,
            ),
          }
        }),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'recently-visited',
      version: 2,
      // Any version < 2 gets wiped — clears buggy old entries
      migrate: () => ({ items: [] }),
    },
  ),
)
