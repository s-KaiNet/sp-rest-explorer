import { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { EntityType } from '@/lib/metadata'
import type { NamespaceGroup } from '@/lib/metadata'
import { TypesSidebarItem } from './TypesSidebarItem'

interface TypesSidebarProps {
  namespaceGroups: NamespaceGroup[]
  filterText: string
  selectedTypeName: string | null
  onSelect: (type: EntityType) => void
}

/**
 * Computes the display name for a type within its namespace group.
 * Strips the "SP." prefix globally and then strips the group prefix within the group.
 *
 * Examples:
 * - In "SP" group: SP.Web → Web, SP.List → List
 * - In "SP.Publishing" group: SP.Publishing.PageLayoutType → PageLayoutType
 */
function getDisplayName(type: EntityType, namespace: string): string {
  // The type's fullName includes the namespace prefix + "."
  // e.g., "SP.Publishing.PageLayoutType" in group "SP.Publishing"
  const prefix = namespace + '.'
  if (type.fullName.startsWith(prefix)) {
    return type.fullName.substring(prefix.length)
  }
  // Fallback: just strip "SP." if present
  if (type.fullName.startsWith('SP.')) {
    return type.fullName.substring(3)
  }
  return type.name
}

/**
 * Namespace-grouped sidebar for the Explore Types page.
 * Renders collapsible groups of complex types with filter support.
 */
export function TypesSidebar({
  namespaceGroups,
  filterText,
  selectedTypeName,
  onSelect,
}: TypesSidebarProps) {
  // Track collapsed state per group via Set of namespace names (starts empty = all expanded)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Filter types within each group
  const filteredGroups = useMemo(() => {
    if (!filterText) return namespaceGroups

    const lower = filterText.toLowerCase()
    const result: Array<{ namespace: string; types: EntityType[] }> = []

    for (const group of namespaceGroups) {
      const matchingTypes = group.types.filter((type) =>
        type.name.toLowerCase().includes(lower),
      )
      if (matchingTypes.length > 0) {
        result.push({ namespace: group.namespace, types: matchingTypes })
      }
    }
    return result
  }, [namespaceGroups, filterText])

  const toggleGroup = (namespace: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(namespace)) {
        next.delete(namespace)
      } else {
        next.add(namespace)
      }
      return next
    })
  }

  // Empty state — no types match filter
  if (filteredGroups.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="text-sm text-muted-foreground">
          No types match filter
        </span>
      </div>
    )
  }

  return (
    <div className="p-2">
      {filteredGroups.map((group, idx) => {
        const isCollapsed = collapsedGroups.has(group.namespace)
        const Chevron = isCollapsed ? ChevronRight : ChevronDown

        return (
          <div key={group.namespace}>
            {/* Subtle separator between groups (not on the first one) */}
            {idx > 0 && <div className="my-1 border-t border-border/30" />}

            {/* Group header */}
            <button
              type="button"
              onClick={() => toggleGroup(group.namespace)}
              className="flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/50"
            >
              <Chevron className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.namespace || 'Other'}
              </span>
            </button>

            {/* Group items */}
            {!isCollapsed &&
              group.types.map((type) => (
                <TypesSidebarItem
                  key={type.fullName}
                  type={type}
                  displayName={getDisplayName(type, group.namespace)}
                  isActive={selectedTypeName === type.fullName}
                  onClick={() => onSelect(type)}
                />
              ))}
          </div>
        )
      })}
    </div>
  )
}
