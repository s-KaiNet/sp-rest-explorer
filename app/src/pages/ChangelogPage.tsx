import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router'
import { AlertCircle, ClipboardCheck, RefreshCw } from 'lucide-react'
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

export function ChangelogPage() {
  const { monthKey } = useParams<{ monthKey?: string }>()

  // Determine comparison date from URL param or default
  const { year, month } = useMemo(() => {
    if (monthKey) {
      const parsed = parseMonthKey(monthKey)
      if (parsed) return parsed
    }
    return getDefaultComparisonDate()
  }, [monthKey])

  // Kick off diff computation on mount; reset on unmount
  useEffect(() => {
    void computeDiff(year, month)
    return () => resetDiff()
  }, [year, month])

  const status = useDiffStatus()
  const diff = useDiffSnapshot()
  const diffError = useDiffError()

  // Compute summary counts
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
  const isReady = status === 'ready'
  const isLoading = status === 'loading' || status === 'idle'
  const isError = status === 'error'

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[720px] px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-foreground mb-2">API Changelog</h1>
          <p className="text-[15px] text-muted-foreground">
            Changes in {getMonthLabel(year, month)}
          </p>
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
            {/* Summary bar — always show 3 stat cards */}
            <div className="flex gap-4">
              <div className="flex-1 rounded-xl border border-border bg-background p-5 text-center">
                <div className="text-3xl font-bold leading-none mb-1 text-green-600 dark:text-green-400">
                  {counts.added}
                </div>
                <div className="text-xs font-medium text-muted-foreground">Added</div>
              </div>
              <div className="flex-1 rounded-xl border border-border bg-background p-5 text-center">
                <div className="text-3xl font-bold leading-none mb-1 text-blue-600 dark:text-blue-400">
                  {counts.updated}
                </div>
                <div className="text-xs font-medium text-muted-foreground">Updated</div>
              </div>
              <div className="flex-1 rounded-xl border border-border bg-background p-5 text-center">
                <div className="text-3xl font-bold leading-none mb-1 text-red-600 dark:text-red-400">
                  {counts.removed}
                </div>
                <div className="text-xs font-medium text-muted-foreground">Removed</div>
              </div>
            </div>

            {/* Empty state — all counts zero */}
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

            {/* Detail views — root functions then entities */}
            {totalChanges > 0 && diff && (
              <div className="mt-8 space-y-2">
                {/* Root Functions section — before entities per user decision */}
                <CollapsibleSection
                  id="root-functions"
                  title="Root Functions"
                  count={diff.functions.length}
                  emptyMessage="No root function changes"
                >
                  <RootFunctionsTable functions={diff.functions} />
                </CollapsibleSection>

                {/* Entities section */}
                <CollapsibleSection
                  id="entities"
                  title="Entities"
                  count={diff.entities.length}
                  emptyMessage="No entity changes"
                >
                  <div className="space-y-3 pt-2">
                    {[...diff.entities]
                      .sort((a, b) => a.name.localeCompare(b.name))
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
