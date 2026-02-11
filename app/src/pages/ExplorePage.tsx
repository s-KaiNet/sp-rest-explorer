import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useApiNavigation, useRecentlyVisited } from '@/hooks'
import type { ChildEntry } from '@/lib/metadata'
import {
  BreadcrumbBar,
  Sidebar,
  ResizablePanel,
  SidebarTransition,
  ContentTransition,
} from '@/components/navigation'

export function ExplorePage() {
  const navigate = useNavigate()
  const { segments, children, currentEntity, currentFunction, isRoot } = useApiNavigation()
  const { addVisit } = useRecentlyVisited()

  // Record visits for non-root endpoints
  useEffect(() => {
    if (isRoot || segments.length < 2) return
    const last = segments[segments.length - 1]
    addVisit({ name: last.label, path: last.path, kind: last.kind })
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
      {/* Breadcrumb bar — full width, spanning above both sidebar and content */}
      <BreadcrumbBar segments={segments} onNavigate={handleBreadcrumbNavigate} />

      {/* Sidebar + Content horizontal layout — fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Resizable sidebar */}
        <ResizablePanel>
          <SidebarTransition pathKey={pathKey} direction={direction}>
            <Sidebar
              entries={children}
              onNavigate={handleSidebarNavigate}
              showTypeTags={!isRoot}
              variant={isRoot ? 'root' : 'default'}
            />
          </SidebarTransition>
        </ResizablePanel>

        {/* Right: Content area with independent scroll */}
        <div className="flex-1 overflow-y-auto">
          <ContentTransition pathKey={pathKey}>
            <div className="p-6">
              {isRoot ? (
                <div className="max-w-[640px] py-8">
                  <h2 className="mb-1.5 text-lg font-bold">All Root Endpoints</h2>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    The SharePoint REST API exposes{' '}
                    <strong className="text-foreground">{children.length} root endpoints</strong>{' '}
                    under <code className="rounded bg-muted px-1 py-0.5 text-xs">_api/</code>.
                    Use the filter in the sidebar to narrow down by name.
                    Long endpoint names are truncated — <strong className="text-foreground">hover to see the full name</strong>, or drag the sidebar edge to widen it.
                  </p>
                  <div className="flex items-center gap-2 rounded-lg bg-type-fn/5 px-3.5 py-3 text-[13px] text-type-fn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M15 15l-2 5L9 9l11 4-5 2z"/><path d="m2 2 7.586 7.586"/></svg>
                    Click any endpoint in the sidebar to explore its entity, methods, and navigation properties.
                  </div>
                </div>
              ) : currentFunction ? (
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-mono text-xl font-semibold text-type-fn">
                      {currentFunction.name}
                    </h1>
                    {currentFunction.isComposable && (
                      <span className="rounded bg-type-fn/10 px-2 py-0.5 text-xs font-medium text-type-fn">
                        COMPOSABLE
                      </span>
                    )}
                  </div>
                  {currentFunction.parameters.length > 0 && (
                    <div className="mt-3">
                      <h2 className="mb-1 text-sm font-medium text-muted-foreground">Parameters</h2>
                      <div className="space-y-0.5">
                        {currentFunction.parameters.map((p) => (
                          <div key={p.name} className="font-mono text-sm">
                            <span>{p.name}</span>
                            <span className="text-muted-foreground">: </span>
                            <span className="text-type-entity">{p.typeName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentFunction.returnType && (
                    <p className="mt-2 text-sm">
                      <span className="text-muted-foreground">Returns: </span>
                      <span className="font-mono text-type-entity">{currentFunction.returnType}</span>
                    </p>
                  )}
                </div>
              ) : currentEntity ? (
                <div>
                  <h1 className="text-xl font-semibold">
                    {currentEntity.name}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentEntity.fullName}
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p>Endpoint not found</p>
                </div>
              )}
            </div>
          </ContentTransition>
        </div>
      </div>
    </div>
  )
}
