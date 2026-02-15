import { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { ChildEntry } from '@/lib/metadata'
import { SidebarItem } from './SidebarItem'

interface SidebarProps {
  entries: ChildEntry[]
  onNavigate: (child: ChildEntry) => void
  showTypeTags?: boolean
  variant?: 'default' | 'root'
}

// ── Namespace grouping helpers ──

interface NamespaceGroup {
  namespace: string
  entries: Array<{ entry: ChildEntry; displayName: string }>
}

/**
 * Extract namespace from a returnType string.
 * e.g. "SP.Web" → "SP", "SP.Publishing.Pages.SitePage" → "SP.Publishing.Pages"
 * No returnType or no dot → "Core"
 */
function getNamespace(returnType?: string): string {
  if (!returnType) return 'Core'
  const lastDot = returnType.lastIndexOf('.')
  if (lastDot <= 0) return 'Core'
  return returnType.substring(0, lastDot)
}

/**
 * Compute stripped display name for an entry within a namespace group.
 * Only strips if the entry name actually starts with the namespace + ".".
 */
function getStrippedName(entry: ChildEntry, namespace: string): string {
  if (namespace === 'Core') return entry.name
  const prefix = namespace + '.'
  if (entry.name.startsWith(prefix)) {
    return entry.name.substring(prefix.length)
  }
  return entry.name
}

/**
 * Group entries by namespace extracted from returnType.
 * "Core" group always first, then alphabetical by namespace.
 * Items within each group sorted alphabetically by name.
 */
function groupByNamespace(entries: ChildEntry[]): NamespaceGroup[] {
  const groupMap = new Map<string, ChildEntry[]>()

  for (const entry of entries) {
    const ns = getNamespace(entry.returnType)
    const existing = groupMap.get(ns)
    if (existing) {
      existing.push(entry)
    } else {
      groupMap.set(ns, [entry])
    }
  }

  // Sort entries within each group alphabetically
  for (const [, groupEntries] of groupMap) {
    groupEntries.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Build sorted group array: Core first, then alphabetical
  const namespaces = Array.from(groupMap.keys()).sort((a, b) => {
    if (a === 'Core') return -1
    if (b === 'Core') return 1
    return a.localeCompare(b)
  })

  return namespaces.map((ns) => ({
    namespace: ns,
    entries: groupMap.get(ns)!.map((entry) => ({
      entry,
      displayName: getStrippedName(entry, ns),
    })),
  }))
}

export function Sidebar({
  entries,
  onNavigate,
  showTypeTags = true,
  variant = 'default',
}: SidebarProps) {
  // Track collapsed groups for root namespace view (empty set = all expanded)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Compute namespace groups (only used for root variant, but stable across renders)
  const namespaceGroups = useMemo(
    () => (variant === 'root' ? groupByNamespace(entries) : []),
    [entries, variant],
  )

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

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="text-sm text-muted-foreground">
          No matching elements
        </span>
      </div>
    )
  }

  // Root variant: namespace-grouped with collapsible headers
  if (variant === 'root') {
    return (
      <div className="p-2">
        {namespaceGroups.map((group, idx) => {
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
                <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.namespace}
                </span>
              </button>

              {/* Group items */}
              {!isCollapsed &&
                group.entries.map(({ entry, displayName }) => (
                  <SidebarItem
                    key={`root-${entry.name}`}
                    entry={entry}
                    onClick={() => onNavigate(entry)}
                    showTypeTags={false}
                    variant="root"
                    displayName={displayName}
                  />
                ))}
            </div>
          )
        })}
      </div>
    )
  }

  // Default variant: split into navProperties/functions with separator
  const navProperties = entries.filter((c) => c.kind === 'navProperty')
  const functions = entries.filter((c) => c.kind === 'function')
  const hasBothGroups = navProperties.length > 0 && functions.length > 0

  return (
    <div className="p-2">
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
    </div>
  )
}
