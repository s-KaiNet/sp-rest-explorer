import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useApiNavigation, useRecentlyVisited } from '@/hooks'
import type { ChildEntry } from '@/lib/metadata'
import { useMetadataSnapshot } from '@/lib/metadata'
import {
  BreadcrumbBar,
  Sidebar,
  SidebarFilter,
  ResizablePanel,
  SidebarTransition,
  ContentTransition,
} from '@/components/navigation'
import { TypeLink, EntityDetail } from '@/components/entity'

export function ExplorePage() {
  const navigate = useNavigate()
  const { segments, children, currentEntity, currentFunction, isRoot } = useApiNavigation()
  const { addVisit } = useRecentlyVisited()
  const metadata = useMetadataSnapshot()

  // Sidebar filter state — lifted here so filter sits outside slide animation
  const [filterText, setFilterText] = useState('')
  const prevChildrenRef = useRef(children)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)

  // Clear filter when navigation changes (entries change)
  useEffect(() => {
    if (children !== prevChildrenRef.current) {
      setFilterText('')
      prevChildrenRef.current = children
    }
  }, [children])

  // Filter entries
  const filteredChildren = useMemo(() => {
    if (!filterText) return children
    const lower = filterText.toLowerCase()
    return children.filter((e) => e.name.toLowerCase().includes(lower))
  }, [children, filterText])

  // Count all functions in metadata (for welcome screen stats)
  const functionCount = useMemo(() => {
    return Object.keys(metadata?.functions ?? {}).length
  }, [metadata])

  // Record visits for non-root endpoints
  useEffect(() => {
    if (isRoot || segments.length < 2) return
    const last = segments[segments.length - 1]
    // Direct children of /_api (depth 2: [_api, item]) are "root" endpoints
    // Deeper items keep their actual kind (function/navProperty)
    const kind = segments.length === 2 ? 'root' : last.kind
    addVisit({ name: last.label, path: last.path, kind })
  }, [segments, isRoot, addVisit])

  // Track previous depth for animation direction
  const prevDepthRef = useRef(segments.length)
  const direction = useMemo(() => {
    const prev = prevDepthRef.current
    const curr = segments.length
    if (curr > prev) return 'left' as const
    if (curr < prev) return 'right' as const
    return 'left' as const
  }, [segments.length])

  // Update ref AFTER direction is computed (useEffect runs after render)
  useEffect(() => {
    prevDepthRef.current = segments.length
  }, [segments.length])

  // Unique key for animation transitions
  const pathKey = segments.map((s) => s.label).join('/')

  // Reset sidebar scroll position on navigation
  useEffect(() => {
    if (sidebarScrollRef.current) {
      sidebarScrollRef.current.scrollTop = 0
    }
  }, [pathKey])

  // Breadcrumb segments already contain full route paths
  const handleBreadcrumbNavigate = (path: string) => navigate(path)

  // Sidebar: append child name to current deepest segment's path
  const handleSidebarNavigate = (child: ChildEntry) => {
    const currentPath = segments[segments.length - 1].path
    navigate(`${currentPath}/${child.name}`)
  }

  // Determine what to show in content area:
  // - isRoot: welcome message
  // - currentFunction: always show function details (parameters, return type, composable badge)
  //   Whether composable or not, functions display their signature in the content area.
  //   The sidebar still shows entity children if the function is composable.
  // - currentEntity (no function): entity view (navigated via nav property)
  // - neither: not found

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Sidebar + Content horizontal layout — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Resizable sidebar */}
        <ResizablePanel>
          {/* Filter stays fixed above slide animation */}
          <SidebarFilter
            filterText={filterText}
            onFilterChange={setFilterText}
            totalCount={children.length}
            filteredCount={filteredChildren.length}
            disabled={children.length === 0}
          />
          {/* Sidebar content slides on navigation */}
          <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
            <SidebarTransition pathKey={pathKey} direction={direction}>
              <Sidebar
                entries={filteredChildren}
                onNavigate={handleSidebarNavigate}
                showTypeTags={!isRoot}
                variant={isRoot ? 'root' : 'default'}
              />
            </SidebarTransition>
          </div>
        </ResizablePanel>

        {/* Right: Content area — flex column with non-scrolling breadcrumb + scrollable content */}
        <div className="flex flex-1 flex-col overflow-hidden bg-muted/30">
          {/* Breadcrumb — outside scroll container, only on detail pages */}
          {!isRoot && segments.length > 0 && (
            <BreadcrumbBar segments={segments} onNavigate={handleBreadcrumbNavigate} />
          )}
          {/* Scrollable content area — scrollbar starts below breadcrumb */}
          <div className="flex-1 overflow-y-auto">
          <ContentTransition pathKey={pathKey}>
              {isRoot ? (
                <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
                  {/* Blue icon box */}
                  <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-type-root/10 text-[28px] font-extrabold text-type-root">
                    &lt;&gt;
                  </div>

                  {/* Title */}
                  <h2 className="mb-2 text-xl font-bold">Explore API</h2>

                  {/* Description */}
                  <p className="mb-6 max-w-[420px] text-sm leading-relaxed text-muted-foreground">
                    Browse all root endpoints exposed by the SharePoint REST API.
                    Select an endpoint from the sidebar to explore its entity, methods,
                    and navigation properties.
                  </p>

                  {/* Stats row — computed from live data */}
                  <div className="flex gap-8">
                    <div className="flex flex-col items-center">
                      <span className="text-[28px] font-bold text-type-root">
                        {children.length.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Root Endpoints
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[28px] font-bold text-type-root">
                        {functionCount.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Functions
                      </span>
                    </div>
                  </div>

                  {/* Hint box */}
                  <div className="mt-7 flex items-center gap-2 rounded-lg bg-type-root/10 px-[18px] py-3 text-[13px] text-green-800 dark:text-green-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                      <path d="M15 15l-2 5L9 9l11 4-5 2z" />
                      <path d="m2 2 7.586 7.586" />
                    </svg>
                    Select an endpoint from the sidebar, or use{' '}
                    <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px]">
                      Ctrl K
                    </kbd>{' '}
                    to search
                  </div>
                </div>
              ) : currentFunction ? (
                <div className="p-6">
                  {/* Function name */}
                  <h1 className="font-mono text-xl font-semibold text-type-fn">
                    {currentFunction.name}
                  </h1>

                  {/* Parameters — one per line, this filtered out */}
                  <div className="mt-3">
                    <h2 className="mb-1 text-sm font-medium text-muted-foreground">Parameters</h2>
                    {(() => {
                      const userParams = currentFunction.parameters.filter((p) => p.name !== 'this')
                      if (userParams.length === 0) {
                        return <p className="text-sm italic text-muted-foreground">none</p>
                      }
                      return (
                        <div className="space-y-0.5">
                          {userParams.map((p) => (
                            <div key={p.name} className="font-mono text-sm">
                              <span className="font-medium">{p.name}</span>
                              <span className="text-muted-foreground">: </span>
                              <TypeLink typeName={p.typeName} />
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>

                  {/* Return type */}
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Returns: </span>
                    {!currentFunction.returnType || currentFunction.returnType === 'void' ? (
                      <span className="font-mono italic text-muted-foreground">void</span>
                    ) : (
                      <TypeLink typeName={currentFunction.returnType} />
                    )}
                  </div>
                </div>
              ) : currentEntity ? (
                <EntityDetail entity={currentEntity} />
              ) : (
                <div className="p-6 py-12 text-center text-muted-foreground">
                  <p>Endpoint not found</p>
                </div>
              )}
          </ContentTransition>
          </div>
        </div>
      </div>
    </div>
  )
}
