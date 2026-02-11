import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import type { ChildEntry } from '@/lib/metadata'
import { SidebarItem } from './SidebarItem'

interface SidebarProps {
  entries: ChildEntry[]
  onNavigate: (child: ChildEntry) => void
  showTypeTags?: boolean
  variant?: 'default' | 'root'
}

export function Sidebar({
  entries,
  onNavigate,
  showTypeTags = true,
  variant = 'default',
}: SidebarProps) {
  const [filterText, setFilterText] = useState('')
  const entriesRef = useRef(entries)

  // Clear filter when entries change (new navigation)
  useEffect(() => {
    if (entries !== entriesRef.current) {
      setFilterText('')
      entriesRef.current = entries
    }
  }, [entries])

  // Filtered entries
  const filteredEntries = useMemo(() => {
    if (!filterText) return entries
    const lower = filterText.toLowerCase()
    return entries.filter((e) => e.name.toLowerCase().includes(lower))
  }, [entries, filterText])

  const isFiltering = filterText.length > 0
  const totalCount = entries.length
  const filteredCount = filteredEntries.length

  // Empty entries (before filtering)
  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-background px-2 pt-2 pb-1">
            <div className="flex items-center gap-1.5 rounded-md border border-input/50 px-2 py-1">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter..."
                disabled
                className="w-full bg-transparent bg-muted/30 text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            <p className="py-1 text-center text-[10px] text-muted-foreground">
              0 elements
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center p-2">
            <span className="text-sm text-muted-foreground">
              No child endpoints
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Split filtered entries into groups
  const navProperties = filteredEntries.filter((c) => c.kind === 'navProperty')
  const functions = filteredEntries.filter((c) => c.kind === 'function')
  const hasBothGroups = navProperties.length > 0 && functions.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable area with sticky filter */}
      <div className="flex-1 overflow-y-auto">
        {/* Sticky filter inside scroll container — animates with sidebar */}
        <div className="sticky top-0 z-10 bg-background px-2 pt-2 pb-1 border-b border-border/50">
          <div className="flex items-center gap-1.5 rounded-md border border-input/50 px-2 py-1">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-transparent bg-muted/30 text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <p className="py-1 text-center text-[10px] text-muted-foreground">
            {isFiltering
              ? `Showing ${filteredCount} of ${totalCount} elements`
              : `${totalCount} elements`}
          </p>
        </div>

        {/* List items */}
        <div className="p-2">
        {filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm text-muted-foreground">
              No matching elements
            </span>
          </div>
        ) : (
          <>
            {navProperties.map((child) => (
              <SidebarItem
                key={`nav-${child.name}`}
                entry={child}
                onClick={() => onNavigate(child)}
                showTypeTags={showTypeTags}
                variant={variant}
              />
            ))}

            {hasBothGroups && <hr className="my-1 border-border" />}

            {functions.map((child) => (
              <SidebarItem
                key={`fn-${child.name}-${child.ref}`}
                entry={child}
                onClick={() => onNavigate(child)}
                showTypeTags={showTypeTags}
                variant={variant}
              />
            ))}
          </>
        )}
        </div>
      </div>
    </div>
  )
}
