import { Search, X } from 'lucide-react'

interface SidebarFilterProps {
  filterText: string
  onFilterChange: (value: string) => void
  totalCount: number
  filteredCount: number
  disabled?: boolean
  label?: string
}

export function SidebarFilter({
  filterText,
  onFilterChange,
  totalCount,
  filteredCount,
  disabled = false,
  label = 'elements',
}: SidebarFilterProps) {
  const isFiltering = filterText.length > 0

  return (
    <div className="shrink-0 border-b border-border/50 px-2 pt-2 pb-1">
      <div className="flex items-center gap-1.5 rounded-md border border-input/50 px-2 py-1">
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter..."
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
        {isFiltering && (
          <button
            type="button"
            onClick={() => onFilterChange('')}
            className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Clear filter"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
      <p className="py-1 text-center text-[10px] text-muted-foreground">
        {isFiltering
          ? `Showing ${filteredCount} of ${totalCount} ${label}`
          : `${totalCount} ${label}`}
      </p>
    </div>
  )
}
