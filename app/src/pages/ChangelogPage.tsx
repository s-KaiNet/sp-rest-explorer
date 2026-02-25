import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { AlertCircle, ClipboardCheck, Filter, RefreshCw } from 'lucide-react'
import type { ChangeType } from '@/lib/diff'
import {
  useDiffSnapshot,
  useDiffStatus,
  useDiffError,
  computeDiff,
  resetDiff,
  getDefaultComparisonDate,
} from '@/lib/diff'
import { CollapsibleSection } from '@/components/entity/CollapsibleSection'
import { RootFunctionsTable } from '@/components/changelog/RootFunctionsTable'
import { EntityChangeCard } from '@/components/changelog/EntityChangeCard'

/** Format year/month as "January 2026". */
function getMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/** Parse "2026-1" → { year: 2026, month: 1 }. Returns null on invalid input. */
function parseMonthKey(key: string): { year: number; month: number } | null {
  const parts = key.split('-')
  if (parts.length !== 2) return null
  const year = Number(parts[0])
  const month = Number(parts[1])
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null
  return { year, month }
}

/** Subtract N months from the current date. Returns the comparison year/month. */
function getComparisonDate(rangeMonths: number): { year: number; month: number } {
  if (rangeMonths === 1) return getDefaultComparisonDate()

  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-indexed
  const currentYear = now.getFullYear()

  // Subtract rangeMonths from current date
  let targetMonth = currentMonth - rangeMonths
  let targetYear = currentYear
  while (targetMonth <= 0) {
    targetMonth += 12
    targetYear -= 1
  }

  return { year: targetYear, month: targetMonth }
}

// ── Filter chip config ──

const chipConfig: { type: ChangeType; label: string; activeClass: string }[] = [
  {
    type: 'added',
    label: 'Added',
    activeClass:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
  },
  {
    type: 'updated',
    label: 'Updated',
    activeClass:
      'bg-sky-100 text-sky-800 border-sky-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
  },
  {
    type: 'removed',
    label: 'Removed',
    activeClass:
      'bg-rose-100 text-rose-800 border-rose-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
  },
]

// ── Segmented control config ──

const rangeOptions: { value: number; label: string }[] = [
  { value: 1, label: 'Current month' },
  { value: 3, label: 'Last 3' },
  { value: 6, label: 'Last 6' },
]

const INACTIVE_CHIP_CLASS = 'bg-muted/50 text-muted-foreground border-border'

export function ChangelogPage() {
  const { monthKey } = useParams<{ monthKey?: string }>()

  // Range selector state
  const [rangeMonths, setRangeMonths] = useState(1)

  // Filter chip state — all ON by default
  const [activeFilters, setActiveFilters] = useState<Set<ChangeType>>(
    () => new Set<ChangeType>(['added', 'updated', 'removed']),
  )

  // Determine comparison date from URL param or range selector
  const { year, month } = useMemo(() => {
    if (monthKey) {
      const parsed = parseMonthKey(monthKey)
      if (parsed) return parsed
    }
    return getComparisonDate(rangeMonths)
  }, [monthKey, rangeMonths])

  // Kick off diff computation on mount; reset on unmount
  useEffect(() => {
    void computeDiff(year, month)
    return () => resetDiff()
  }, [year, month])

  const status = useDiffStatus()
  const diff = useDiffSnapshot()
  const diffError = useDiffError()

  // Compute summary counts (always from full diff — unaffected by filters)
  const counts = useMemo(() => {
    if (!diff) return { added: 0, updated: 0, removed: 0 }
    return {
      added:
        diff.entities.filter((e) => e.changeType === 'added').length +
        diff.functions.filter((f) => f.changeType === 'added').length,
      updated:
        diff.entities.filter((e) => e.changeType === 'updated').length +
        diff.functions.filter((f) => f.changeType === 'updated').length,
      removed:
        diff.entities.filter((e) => e.changeType === 'removed').length +
        diff.functions.filter((f) => f.changeType === 'removed').length,
    }
  }, [diff])

  const totalChanges = counts.added + counts.updated + counts.removed

  // Filtered arrays for detail content
  const filteredFunctions = useMemo(
    () => (diff ? diff.functions.filter((f) => activeFilters.has(f.changeType)) : []),
    [diff, activeFilters],
  )
  const filteredEntities = useMemo(
    () => (diff ? diff.entities.filter((e) => activeFilters.has(e.changeType)) : []),
    [diff, activeFilters],
  )
  const filteredTotal = filteredFunctions.length + filteredEntities.length

  const isReady = status === 'ready'
  const isLoading = status === 'loading' || status === 'idle'
  const isError = status === 'error'

  // Build subtitle text based on range
  // The label reflects the CURRENT month (what the user views changes for),
  // not the comparison date (which is the end of the previous month used for diffing).
  const subtitleText = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-indexed

    if (rangeMonths === 1) {
      return `Changes in ${getMonthLabel(currentYear, currentMonth)}`
    }
    // Multi-month range: "from {start month + 1} to {current month}"
    // year/month is the comparison date (start of the range); the label shows one month after
    // because the comparison snapshot represents the END of that month, so changes start the next month
    let startLabelMonth = month + 1
    let startLabelYear = year
    if (startLabelMonth > 12) {
      startLabelMonth = 1
      startLabelYear += 1
    }
    return `Changes from ${getMonthLabel(startLabelYear, startLabelMonth)} to ${getMonthLabel(currentYear, currentMonth)}`
  }, [rangeMonths, year, month])

  function toggleFilter(type: ChangeType) {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-foreground mb-2">API Changelog</h1>
          <p className="text-[15px] text-muted-foreground">{subtitleText}</p>
        </div>

        {/* Toolbar — segmented control + filter buttons */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Segmented control */}
          <div className="inline-flex border border-input rounded-md">
            {rangeOptions.map(({ value, label }, i) => {
              const isActive = rangeMonths === value
              const isFirst = i === 0
              const isLast = i === rangeOptions.length - 1
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRangeMonths(value)}
                  className={`px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                    isFirst ? 'rounded-l-md' : ''
                  } ${isLast ? 'rounded-r-md' : ''} ${
                    !isFirst ? 'border-l border-input' : ''
                  } ${
                    isActive
                      ? 'bg-foreground text-background'
                      : 'bg-background text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            {chipConfig.map(({ type, label, activeClass }) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleFilter(type)}
                className={`rounded-md px-4 py-2 text-sm font-medium border cursor-pointer transition-colors ${
                  activeFilters.has(type) ? activeClass : INACTIVE_CHIP_CLASS
                }`}
              >
                {label} ({counts[type]})
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="size-8 rounded-full border-3 border-muted border-t-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Computing changes…</p>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center py-20">
            <AlertCircle className="size-12 text-destructive" />
            <h2 className="text-lg font-medium text-foreground mt-3">
              Unable to load changelog data
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md text-center">
              {diffError || 'An error occurred while computing changes.'}
            </p>
            <button
              type="button"
              onClick={() => void computeDiff(year, month)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors mt-4"
            >
              <RefreshCw className="size-4" />
              Try again
            </button>
          </div>
        )}

        {/* Ready state */}
        {isReady && (
          <>
            {/* Empty state — diff itself has zero results */}
            {totalChanges === 0 && (
              <div className="flex flex-col items-center py-12">
                <ClipboardCheck className="size-12 text-muted-foreground/40" />
                <h2 className="text-lg font-medium text-foreground mt-3">No changes detected</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-md text-center">
                  No API changes were found for {getMonthLabel(year, month)}. The diff is computed by
                  comparing monthly metadata snapshots.
                </p>
              </div>
            )}

            {/* Filter empty state — all chips off */}
            {totalChanges > 0 && activeFilters.size === 0 && (
              <div className="flex flex-col items-center py-12">
                <Filter className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground mt-3">No change types selected</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Toggle the filter chips above to show changes
                </p>
              </div>
            )}

            {/* Detail views — filtered root functions then entities */}
            {totalChanges > 0 && filteredTotal > 0 && diff && (
              <div className="mt-8 space-y-2">
                {/* Root Functions section — before entities per user decision */}
                <CollapsibleSection
                  id="root-functions"
                  title="Root Functions"
                  count={filteredFunctions.length}
                  emptyMessage="No root function changes"
                >
                  <RootFunctionsTable functions={filteredFunctions} />
                </CollapsibleSection>

                {/* Entities section */}
                <CollapsibleSection
                  id="entities"
                  title="Entities"
                  count={filteredEntities.length}
                  emptyMessage="No entity changes"
                >
                  <div className="space-y-3 pt-2">
                    {filteredEntities
                      .toSorted((a, b) => a.name.localeCompare(b.name))
                      .map((entity) => (
                        <EntityChangeCard key={entity.name} entity={entity} />
                      ))}
                  </div>
                </CollapsibleSection>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
