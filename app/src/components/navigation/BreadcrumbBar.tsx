import type { BreadcrumbSegment } from '@/hooks'

interface BreadcrumbBarProps {
  segments: BreadcrumbSegment[]
  onNavigate: (path: string) => void
}

export function BreadcrumbBar({ segments, onNavigate }: BreadcrumbBarProps) {
  return (
    <nav
      aria-label="API path breadcrumb"
      className="sticky top-14 z-10 flex min-h-[40px] flex-wrap items-center border-b border-border bg-background px-4 py-2"
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1

        return (
          <span key={segment.path} className="flex items-center">
            {index > 0 && (
              <span className="mx-1 text-muted-foreground/50">/</span>
            )}
            {isLast ? (
              <span className="text-sm font-semibold text-foreground">
                {segment.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(segment.path)}
                className="cursor-pointer text-sm text-type-fn transition-colors hover:text-type-fn/80 hover:underline"
              >
                {segment.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
