/** Skeleton screen mimicking the real sidebar + content area layout. */
export function ContentSkeleton() {
  return (
    <div className="flex flex-1">
      {/* Sidebar skeleton — 280px, border-right */}
      <div className="w-[280px] shrink-0 border-r border-border p-4 space-y-3">
        {/* Sidebar header block */}
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-px bg-border" />
        {/* List item blocks — varying widths */}
        <div className="space-y-2">
          <div className="h-4 w-[90%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[70%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[85%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[60%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[78%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[65%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[88%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[72%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[80%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[62%] animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Content area skeleton — flex-1 */}
      <div className="flex-1 p-6 space-y-6">
        {/* Breadcrumb bar */}
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />

        {/* Heading */}
        <div className="h-7 w-1/2 animate-pulse rounded bg-muted" />

        {/* Paragraph blocks */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-[92%] animate-pulse rounded bg-muted" />
          <div className="h-4 w-[85%] animate-pulse rounded bg-muted" />
        </div>

        {/* Table placeholder */}
        <div className="space-y-2 pt-4">
          <div className="h-8 w-full animate-pulse rounded bg-muted" />
          <div className="h-6 w-full animate-pulse rounded bg-muted" />
          <div className="h-6 w-full animate-pulse rounded bg-muted" />
          <div className="h-6 w-full animate-pulse rounded bg-muted" />
          <div className="h-6 w-[90%] animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
