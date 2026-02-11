import type { ChildEntry } from '@/lib/metadata'
import { SidebarItem } from './SidebarItem'

interface SidebarProps {
  entries: ChildEntry[]
  onNavigate: (child: ChildEntry) => void
}

export function Sidebar({ entries, onNavigate }: SidebarProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-2">
        <span className="text-sm text-muted-foreground">No child endpoints</span>
      </div>
    )
  }

  const navProperties = entries.filter((c) => c.kind === 'navProperty')
  const functions = entries.filter((c) => c.kind === 'function')
  const hasBothGroups = navProperties.length > 0 && functions.length > 0

  return (
    <div className="min-h-full p-2">
      {navProperties.map((child) => (
        <SidebarItem
          key={`nav-${child.name}`}
          entry={child}
          onClick={() => onNavigate(child)}
        />
      ))}

      {hasBothGroups && <hr className="my-1 border-border" />}

      {functions.map((child) => (
        <SidebarItem
          key={`fn-${child.name}-${child.ref}`}
          entry={child}
          onClick={() => onNavigate(child)}
        />
      ))}
    </div>
  )
}
