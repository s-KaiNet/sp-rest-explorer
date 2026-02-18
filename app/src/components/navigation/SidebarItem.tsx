import type { ChildEntry } from '@/lib/metadata'
import type { ApiType } from '@/lib/api-types'
import { TypeIcon } from '@/components/ui/type-icon'

interface SidebarItemProps {
  entry: ChildEntry
  onClick: () => void
  apiType: ApiType
  displayName?: string
}

export function SidebarItem({
  entry,
  onClick,
  apiType,
  displayName,
}: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={entry.name}
      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
    >
      <TypeIcon type={apiType} size="sm" />
      <span className="min-w-0 flex-1 truncate">{displayName ?? entry.name}</span>
    </button>
  )
}
