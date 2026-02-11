import { useState, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  id: string
  title: string
  count: number
  emptyMessage?: string
  filterSlot?: ReactNode
  children: ReactNode
}

/**
 * Collapsible section wrapper with count badge.
 * Sections with 0 items start collapsed; sections with items start expanded.
 */
export function CollapsibleSection({
  id,
  title,
  count,
  emptyMessage = 'No items',
  filterSlot,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(count > 0)

  return (
    <div className="mb-6" id={id}>
      <div
        className="flex cursor-pointer select-none items-center gap-2 border-b-2 border-border py-2"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
        {filterSlot && (
          <div
            className="ml-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {filterSlot}
          </div>
        )}
        <span
          className={`text-xs text-muted-foreground transition-transform duration-200 ${filterSlot ? '' : 'ml-auto'}`}
        >
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      {isOpen && (
        <div className="mt-0">
          {count === 0 ? (
            <p className="py-4 text-center text-sm italic text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  )
}
