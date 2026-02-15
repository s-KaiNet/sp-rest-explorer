import { useNavigate, useOutletContext } from 'react-router'
import { Search, Clock, ArrowRight } from 'lucide-react'
import { useRecentlyVisited } from '@/hooks'
import type { RecentlyVisitedItem } from '@/hooks'
import faviconUrl from '/favicon.svg'

// ── Relative time helper ──

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

// ── Recently Visited Card ──

function RecentlyVisitedCard({
  item,
  onClick,
}: {
  item: RecentlyVisitedItem
  onClick: () => void
}) {
  // Determine icon and colors based on kind
  // root = <> green, function = ƒ blue, navProperty = NAV purple, entity (future) = T green
  let icon: string
  let colorClass: string
  if (item.kind === 'root') {
    icon = '<>'
    colorClass = 'bg-type-entity/10 text-type-entity'
  } else if (item.kind === 'function') {
    icon = 'ƒ'
    colorClass = 'bg-type-fn/10 text-type-fn'
  } else {
    // navProperty
    icon = 'NAV'
    colorClass = 'bg-type-nav/10 text-type-nav'
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-border bg-background px-3.5 py-3 text-left transition-all hover:border-border/60 hover:bg-accent/50 hover:shadow-sm cursor-pointer"
    >
      {/* Type icon */}
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold ${colorClass}`}
      >
        {icon}
      </div>

      {/* Name + path */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold" title={item.name}>
          {item.name}
        </div>
        <div
          className="truncate font-mono text-xs text-muted-foreground"
          title={item.path}
        >
          {item.path}
        </div>
      </div>

      {/* Relative time */}
      <span className="shrink-0 text-xs text-muted-foreground">
        {relativeTime(item.timestamp)}
      </span>
    </button>
  )
}

// ── Home Page ──

export function HomePage() {
  const navigate = useNavigate()
  const { onSearchClick } = useOutletContext<{ onSearchClick?: () => void }>()
  const { items, clearAll } = useRecentlyVisited()

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* ── Hero ── */}
      <div className="mb-12 text-center">
        <h1 className="mb-2 flex items-center justify-center gap-3 text-[28px] font-bold tracking-tight">
          <img src={faviconUrl} alt="" className="h-9 w-9" />
          SharePoint REST API Explorer
        </h1>
        <p className="mb-6 text-[15px] text-muted-foreground">
          Browse, search, and understand every endpoint in the SharePoint REST
          API.
        </p>

        {/* Search trigger — opens command palette */}
        <button
          type="button"
          onClick={() => onSearchClick?.()}
          className="relative mx-auto flex h-11 w-full max-w-[520px] items-center rounded-[10px] border border-input bg-background pl-10 pr-24 text-[15px] shadow-md transition-colors cursor-pointer hover:border-ring hover:shadow-lg"
        >
          <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground/50" />
          <span className="flex-1 text-left text-muted-foreground/50">
            Search functions, entities, properties...
          </span>
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform || '') || /Mac/.test(navigator.userAgent || ''))
              ? '\u2318K'
              : 'Ctrl+K'}
          </kbd>
        </button>

        {/* Stats row */}
        <div className="mt-4 flex items-center justify-center gap-6 text-[12.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-type-fn" />
            3.5k+ functions
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-type-entity" />
            2.4k entities
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-type-nav" />
            11k+ properties
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            60k+ endpoints
          </span>
        </div>
      </div>

      {/* ── Browse All Root Endpoints Button ── */}
      <button
        onClick={() => navigate('/_api')}
        className="mb-8 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-[13px] text-muted-foreground transition-all hover:border-type-fn hover:bg-type-fn/5 hover:text-type-fn cursor-pointer"
      >
        Browse all root endpoints
        <ArrowRight className="h-3.5 w-3.5" />
      </button>

      {/* ── Recently Visited ── */}
      <div>
        {/* Section header */}
        <div className="mb-3.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Recently Visited
          </span>
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[12.5px] font-medium text-type-fn hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Cards grid or empty state */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <RecentlyVisitedCard
                key={item.path}
                item={item}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
            No recently visited endpoints.{' '}
            <button
              onClick={() => navigate('/_api')}
              className="font-medium text-type-fn hover:underline"
            >
              Browse all root endpoints
            </button>{' '}
            to get started.
          </div>
        )}
      </div>
    </div>
  )
}
