import type { ChildEntry } from '@/lib/metadata'
import { SidebarItem } from './SidebarItem'

interface SidebarProps {
  entries: ChildEntry[]
  onNavigate: (child: ChildEntry) => void
  showTypeTags?: boolean
}

export function Sidebar({ entries, onNavigate, showTypeTags = true }: SidebarProps) {
  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <span className="text-sm text-muted-foreground">No child endpoints</span>
      </div>
    )
  }

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
        />
      ))}

      {hasBothGroups && <hr className="my-1 border-border" />}

      {functions.map((child) => (
        <SidebarItem
          key={`fn-${child.name}-${child.ref}`}
          entry={child}
          onClick={() => onNavigate(child)}
          showTypeTags={showTypeTags}
        />
      ))}
    </div>
  )
}
