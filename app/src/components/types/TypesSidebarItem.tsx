import type { EntityType } from '@/lib/metadata'
import { TypeIcon } from '@/components/ui/type-icon'

interface TypesSidebarItemProps {
  type: EntityType
  displayName: string
  isActive: boolean
  onClick: () => void
}

/**
 * Individual type entry in the Explore Types sidebar.
 * Shows a clickable item with active state highlight and an entity TypeIcon.
 */
export function TypesSidebarItem({
  type,
  displayName,
  isActive,
  onClick,
}: TypesSidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={type.fullName}
      data-type-fullname={type.fullName}
      className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
        isActive
          ? 'bg-accent text-accent-foreground font-semibold'
          : 'text-foreground hover:bg-accent/50'
      }`}
    >
      <TypeIcon type="entity" size="sm" />
      <span className="min-w-0 flex-1 truncate">{displayName}</span>
    </button>
  )
}
