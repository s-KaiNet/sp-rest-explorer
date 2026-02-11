import type { BreadcrumbSegment } from '@/hooks'

interface BreadcrumbBarProps {
  segments: BreadcrumbSegment[]
  onNavigate: (path: string) => void
}

export function BreadcrumbBar({ segments, onNavigate }: BreadcrumbBarProps) {
  return (
    <nav
      aria-label="API path breadcrumb"
      className="z-10 flex min-h-[40px] shrink-0 flex-wrap items-center border-b border-border bg-background px-4 py-2"
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const suffix = segment.hasParams ? '(...)' : ''

        return (
          <span key={segment.path} className="flex items-center">
            {index > 0 && (
              <span className="mx-1 text-muted-foreground/50">/</span>
            )}
            {isLast ? (
              <span className="font-semibold text-foreground">
                {segment.label}{suffix}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(segment.path)}
                className="cursor-pointer text-type-fn transition-colors hover:text-type-fn/80 hover:underline"
              >
                {segment.label}{suffix}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
