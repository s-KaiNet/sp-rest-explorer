import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useApiNavigation } from '@/hooks'
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
  const { segments, children, currentEntity, isRoot } = useApiNavigation()

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

  return (
    <div className="flex flex-1 flex-col">
      {/* Breadcrumb bar — full width, spanning above both sidebar and content */}
      <BreadcrumbBar segments={segments} onNavigate={handleBreadcrumbNavigate} />

      {/* Sidebar + Content horizontal layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Resizable sidebar */}
        <ResizablePanel>
          <SidebarTransition pathKey={pathKey} direction={direction}>
            <Sidebar entries={children} onNavigate={handleSidebarNavigate} />
          </SidebarTransition>
        </ResizablePanel>

        {/* Right: Content area with independent scroll */}
        <div className="flex-1 overflow-y-auto">
          <ContentTransition pathKey={pathKey}>
            <div className="p-6">
              {isRoot ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="text-lg">
                    Select an endpoint from the sidebar to explore
                  </p>
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
