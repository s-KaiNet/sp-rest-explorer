import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLookupMaps, useTypeIndexes } from '@/lib/metadata'
import { useRecentlyVisited } from '@/hooks'
import { EntityDetail } from '@/components/entity'
import { ComplexTypeDetail, TypesSidebar } from '@/components/types'
import { ResizablePanel, SidebarFilter } from '@/components/navigation'
import { TypeIcon } from '@/components/ui/type-icon'

export function TypesPage() {
  const { typeName } = useParams()
  const maps = useLookupMaps()
  const typeIndexes = useTypeIndexes()
  const navigate = useNavigate()
  const { addVisit } = useRecentlyVisited()

  const [filterText, setFilterText] = useState('')

  const decodedName = typeName ? decodeURIComponent(typeName) : null

  // Count total types across all namespace groups (entity + complex)
  const totalCount = useMemo(() => {
    if (!typeIndexes) return 0
    let count = 0
    for (const group of typeIndexes.namespaceGroups) {
      count += group.types.length
    }
    return count
  }, [typeIndexes])

  const filteredCount = useMemo(() => {
    if (!typeIndexes || !filterText) return totalCount
    const lower = filterText.toLowerCase()
    let count = 0
    for (const group of typeIndexes.namespaceGroups) {
      for (const type of group.types) {
        if (type.name.toLowerCase().includes(lower) || type.fullName.toLowerCase().includes(lower)) {
          count++
        }
      }
    }
    return count
  }, [typeIndexes, filterText, totalCount])

  // Compute stats for welcome screen (all types in namespaceGroups)
  const stats = useMemo(() => {
    if (!typeIndexes) return { types: 0, properties: 0 }
    let propertyCount = 0
    for (const group of typeIndexes.namespaceGroups) {
      for (const type of group.types) {
        propertyCount += type.properties.length
      }
    }
    return { types: totalCount, properties: propertyCount }
  }, [typeIndexes, totalCount])

  // Scroll-to-active: when typeName changes, scroll the active sidebar item into view
  useEffect(() => {
    if (!decodedName) return
    // Defer to allow React to render the sidebar items first
    const timer = setTimeout(() => {
      const el = document.querySelector(
        `[data-type-fullname="${CSS.escape(decodedName)}"]`,
      )
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [decodedName])

  // Handler: sidebar type selection
  const handleTypeSelect = (type: { fullName: string }) => {
    navigate(`/entity/${encodeURIComponent(type.fullName)}`)
    addVisit({
      name: type.fullName.split('.').pop() || type.fullName,
      path: `/entity/${encodeURIComponent(type.fullName)}`,
      kind: 'entity',
    })
  }

  // Resolve type for content area
  const resolvedType = decodedName ? maps?.entityByFullName.get(decodedName) ?? null : null
  const isComplex = decodedName ? typeIndexes?.complexTypeNames.has(decodedName) ?? false : false

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Resizable sidebar */}
      <ResizablePanel storageKey="types-sidebar-width">
        <SidebarFilter
          filterText={filterText}
          onFilterChange={setFilterText}
          totalCount={totalCount}
          filteredCount={filteredCount}
          label="types"
        />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {typeIndexes && (
            <TypesSidebar
              namespaceGroups={typeIndexes.namespaceGroups}
              filterText={filterText}
              selectedTypeName={decodedName}
              onSelect={handleTypeSelect}
            />
          )}
        </div>
      </ResizablePanel>

      {/* Right: Content area with independent scroll */}
      <div className="flex-1 overflow-y-auto bg-muted/30">
        {!decodedName ? (
          /* Welcome screen — no type selected */
          <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
            {/* Type icon hero */}
            <TypeIcon type="entity" size="lg" className="mb-5" />

            {/* Title */}
            <h2 className="mb-2 text-xl font-bold">Explore Types</h2>

            {/* Description */}
            <p className="mb-6 max-w-[420px] text-sm leading-relaxed text-muted-foreground">
              Browse all complex types defined in the SharePoint REST API
              metadata. Select a type from the sidebar to view its properties,
              base type, derived types, and cross-references.
            </p>

            {/* Stats row */}
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <span className="text-[28px] font-bold text-type-entity">
                  {stats.types.toLocaleString()}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Types
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[28px] font-bold text-type-entity">
                  {stats.properties.toLocaleString()}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Properties
                </span>
              </div>
            </div>

            {/* Hint box */}
            <div className="mt-7 flex items-center gap-2 rounded-lg bg-type-entity/5 px-[18px] py-3 text-[13px] text-amber-800 dark:text-amber-200">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0"
              >
                <path d="M15 15l-2 5L9 9l11 4-5 2z" />
                <path d="m2 2 7.586 7.586" />
              </svg>
              Select a type from the sidebar, or use{' '}
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px]">
                Ctrl K
              </kbd>{' '}
              to search
            </div>
          </div>
        ) : !maps ? (
          /* Loading state */
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : !resolvedType ? (
          /* Type not found */
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-2xl text-destructive">
              ?
            </div>
            <h2 className="mb-2 text-lg font-semibold">Type not found</h2>
            <p className="max-w-[360px] text-sm text-muted-foreground">
              No type matching{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                {decodedName}
              </code>{' '}
              was found in the metadata.
            </p>
          </div>
        ) : isComplex ? (
          /* Complex type detail */
          <ComplexTypeDetail type={resolvedType} />
        ) : (
          /* Entity type detail (backward compatible) */
          <EntityDetail entity={resolvedType} />
        )}
      </div>
    </div>
  )
}
