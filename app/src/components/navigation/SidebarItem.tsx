import type { ChildEntry } from '@/lib/metadata'

interface SidebarItemProps {
  entry: ChildEntry
  onClick: () => void
}

export function SidebarItem({ entry, onClick }: SidebarItemProps) {
  const isFunction = entry.kind === 'function'

  return (
    <button
      type="button"
      onClick={onClick}
      title={entry.name}
      className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent"
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {isFunction ? (
          <span className="shrink-0 text-xs font-bold text-type-fn" aria-hidden="true">f</span>
        ) : (
          <svg
            className="size-3 shrink-0 text-type-nav"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6 0L11 6L6 12L1 6Z" />
          </svg>
        )}
        <span className="truncate">{entry.name}</span>
      </span>
      {isFunction ? (
        <span className="shrink-0 rounded bg-type-fn/10 px-1.5 py-0.5 text-xs font-medium text-type-fn">
          FN
        </span>
      ) : (
        <span className="shrink-0 rounded bg-type-nav/10 px-1.5 py-0.5 text-xs font-medium text-type-nav">
          NAV
        </span>
      )}
    </button>
  )
}
