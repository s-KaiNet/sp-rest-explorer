import { useState, useCallback } from 'react'

// ── Types ──

export interface RecentlyVisitedItem {
  name: string // Display name (e.g. "GetByTitle")
  path: string // Full hash path (e.g. "/_api/web/Lists/GetByTitle")
  kind: 'function' | 'navProperty' | 'root' // For icon coloring
  timestamp: number // Date.now() when visited
}

const STORAGE_KEY = 'recently-visited'
const MAX_ITEMS = 12

// ── Helpers ──

function loadFromStorage(): RecentlyVisitedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentlyVisitedItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveToStorage(items: RecentlyVisitedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Silently ignore storage errors (quota exceeded, etc.)
  }
}

// ── Hook ──

export function useRecentlyVisited() {
  const [items, setItems] = useState<RecentlyVisitedItem[]>(loadFromStorage)

  const addVisit = useCallback(
    (item: Omit<RecentlyVisitedItem, 'timestamp'>) => {
      setItems((prev) => {
        // Remove existing entry with same path (if any)
        const filtered = prev.filter((i) => i.path !== item.path)
        // Prepend new entry with current timestamp
        const updated = [{ ...item, timestamp: Date.now() }, ...filtered].slice(
          0,
          MAX_ITEMS,
        )
        saveToStorage(updated)
        return updated
      })
    },
    [],
  )

  const clearAll = useCallback(() => {
    setItems([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Silently ignore
    }
  }, [])

  return { items, addVisit, clearAll }
}
