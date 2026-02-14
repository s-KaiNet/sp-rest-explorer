import { useCallback, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { BreadcrumbSegment } from '@/hooks'

interface BreadcrumbBarProps {
  segments: BreadcrumbSegment[]
  onNavigate: (path: string) => void
}

export function BreadcrumbBar({ segments, onNavigate }: BreadcrumbBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const apiPath = segments.map((s) => s.label).join('/')
    await navigator.clipboard.writeText(apiPath)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [segments])

  const apiPath = segments.map((s) => s.label).join('/')

  return (
    <nav
      aria-label="API path breadcrumb"
      className="group z-10 flex min-h-[40px] shrink-0 flex-wrap items-center border-b border-border bg-sidebar px-4 py-2"
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

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy API path"
        title={`Copy ${apiPath}`}
        className="ml-2 cursor-pointer rounded p-1 opacity-0 transition-all hover:bg-accent group-hover:opacity-100"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    </nav>
  )
}
