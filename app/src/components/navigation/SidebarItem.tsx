import type { ChildEntry } from '@/lib/metadata'

interface SidebarItemProps {
  entry: ChildEntry
  onClick: () => void
  showTypeTags?: boolean
}

export function SidebarItem({ entry, onClick, showTypeTags = true }: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={entry.name}
      className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
    >
      <span className="truncate">{entry.name}</span>
      {showTypeTags && (
        entry.kind === 'function' ? (
          <span className="shrink-0 rounded bg-type-fn/10 px-1.5 py-0.5 text-xs font-medium text-type-fn">
            FN
          </span>
        ) : (
          <span className="shrink-0 rounded bg-type-nav/10 px-1.5 py-0.5 text-xs font-medium text-type-nav">
            NAV
          </span>
        )
      )}
    </button>
  )
}
