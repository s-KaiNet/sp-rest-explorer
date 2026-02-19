---
phase: 03-navigation-system
plan: 02
subsystem: navigation
tags: [react-router, resize, animation, tw-animate-css, localStorage, pointer-events]

# Dependency graph
requires:
  - phase: 03-navigation-system/plan-01
    provides: "useApiNavigation hook, BreadcrumbBar, Sidebar, SidebarItem components"
  - phase: 02-data-layer-ui-foundation
    provides: "Metadata singleton, lookup maps, OKLCH color tokens, ContentSkeleton"
provides:
  - "ResizablePanel with drag handle (200-600px, localStorage persistence)"
  - "SidebarTransition with directional slide animations"
  - "ContentTransition with fade animations"
  - "ExplorePage layout: breadcrumb + resizable sidebar + content area"
  - "Function detail view with parameters, return type, COMPOSABLE badge"
  - "Composable/non-composable function routing: composable shows entity children, non-composable shows empty sidebar"
  - "Breadcrumb (...) suffix for functions with user-facing parameters"
affects: [04-explore-api-views, 05-entity-function-detail]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Pointer capture for drag resize", "Key-based remounting for CSS animations", "useRef for previous depth tracking", "absolute inset-0 for contained scroll"]

key-files:
  created:
    - app/src/components/navigation/ResizablePanel.tsx
    - app/src/components/navigation/NavigationTransition.tsx
  modified:
    - app/src/pages/ExplorePage.tsx
    - app/src/App.tsx
    - app/src/hooks/use-api-navigation.ts
    - app/src/components/navigation/BreadcrumbBar.tsx
    - app/src/components/navigation/Sidebar.tsx
    - app/src/components/navigation/SidebarItem.tsx

key-decisions:
  - "isComposable controls entity resolution: composable functions resolve to entity with children, non-composable are terminal endpoints"
  - "Content area always shows function details when currentFunction is set, entity view only for nav property navigation"
  - "Breadcrumb (...) suffix only for functions with user-facing params beyond this binding"
  - "Breadcrumb segments carry kind field (root/function/navProperty) and hasParams for display logic"
  - "Root functions at /_api show no FN/NAV type tags, just plain text list"
  - "Sidebar scroll contained via absolute inset-0 + overflow-y-auto inside ResizablePanel"
  - "Breadcrumb not sticky, sits in normal flex flow below fixed header"
  - "Clickable breadcrumb segments use text-type-fn (blue), last segment uses text-foreground"
  - "Max sidebar width 600px (user preference over original 500px plan)"

patterns-established:
  - "Contained sidebar scroll: absolute inset-0 + overflow-x-hidden overflow-y-auto"
  - "Function vs nav property display logic via BreadcrumbSegment.kind"
  - "Human-verify checkpoint flow with iterative fix rounds"

# Metrics
duration: ~25min
completed: 2026-02-11
---

# Phase 3 Plan 2: Resizable Layout & ExplorePage Wiring Summary

**Resizable sidebar with drag handle, directional slide animations, and full navigation wiring — function detail views with composable/non-composable routing and breadcrumb (...) parameter indicators**

## Performance

- **Duration:** ~25 min (including 4 rounds of human verification fixes)
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files created:** 2
- **Files modified:** 6

## Accomplishments
- ResizablePanel with pointer-capture drag handle: 200-600px range, localStorage persistence, hover highlight
- Directional sidebar animations: slide-left when going deeper, slide-right when going back (150ms via tw-animate-css)
- Full ExplorePage layout: breadcrumb bar + resizable sidebar + content area, all independently scrollable
- Function detail view: name, parameters with types, return type, COMPOSABLE badge
- Composable functions resolve to entity (showing children in sidebar), non-composable show "No child endpoints"
- Breadcrumb shows (...) suffix only for functions with user-facing parameters (not just `this` binding)
- Deep link support: opening `/#/_api/web/Lists/GetById` directly resolves correct breadcrumb, sidebar, and content
- Browser back/forward triggers navigation with correct directional animations

## Task Commits

Each task was committed atomically:

1. **Task 1: Resizable panel and animation wrappers** - `3b9c4ab` (feat)
2. **Task 2: Wire navigation into ExplorePage and App layout** - `3f25883` (feat)
3. **Task 3: Human verification (4 rounds of fixes):**
   - `299bad1` — sidebar scroll, height, max-width, tooltips, fn details, breadcrumb colors, icons
   - `4f0bb0e` — root items plain text, remove icons, fix scroll/height, composable logic, breadcrumb blue
   - `c5cbdf1` — breadcrumb position, font size, function view for all functions
   - `d59760f` — (...) suffix for function segments in breadcrumb
   - `9f07848` — refined (...) to only show for functions with user-facing params

## Files Created/Modified
- `app/src/components/navigation/ResizablePanel.tsx` - Resizable sidebar container with drag handle and localStorage persistence
- `app/src/components/navigation/NavigationTransition.tsx` - SidebarTransition (directional slide) and ContentTransition (fade)
- `app/src/pages/ExplorePage.tsx` - Full navigation layout with sidebar + breadcrumb + content area
- `app/src/App.tsx` - Removed duplicate fade animation on Outlet wrapper
- `app/src/hooks/use-api-navigation.ts` - Added currentFunction tracking, isComposable routing, BreadcrumbSegment.kind/hasParams
- `app/src/components/navigation/BreadcrumbBar.tsx` - Blue clickable segments, (...) suffix, non-sticky positioning
- `app/src/components/navigation/Sidebar.tsx` - showTypeTags prop, full height layout
- `app/src/components/navigation/SidebarItem.tsx` - Tooltip on truncated names, showTypeTags support

## Decisions Made
- **isComposable routing:** Composable functions resolve to return-type entity and show its children. Non-composable functions are terminal — empty sidebar with function detail in content area.
- **Function-first content:** Content area prioritizes function details over entity display. Navigating via nav property shows entity info.
- **Breadcrumb (...) rules:** Only functions with parameters beyond `this` get `(...)` suffix. Empty params or `this`-only = no brackets.
- **Root items plain text:** Functions at `/_api` root show no FN/NAV tags — just a clean list.
- **Max width 600px:** User preferred wider maximum over the planned 500px.
- **Blue breadcrumb segments:** Clickable segments use `text-type-fn` (blue) to clearly distinguish from the bold non-clickable last segment.

## Deviations from Plan

### Checkpoint-driven refinements (4 rounds)

Human verification revealed several UX issues not anticipated in the plan:
1. Sidebar scroll leaked to page level — fixed with contained scroll via `absolute inset-0`
2. Non-composable functions showed empty content — added function detail view
3. Breadcrumb was sticky (broke layout) — changed to normal flex flow
4. Function parameters indicator `(...)` needed nuanced rules based on actual parameter data

**Impact on plan:** All fixes improved the navigation UX. No scope creep — all changes within Phase 3 navigation scope.

## Issues Encountered
- Breadcrumb `sticky top-14` inside `overflow-hidden` parent broke layout — removed sticky, used normal flex flow
- `slide-in-from-right` animation caused horizontal scrollbar — contained with `overflow-x-hidden` on scroll container

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full navigation system complete: breadcrumb + sidebar + content area + resize + animations
- ExplorePage ready for Phase 4 (home screen, browse all endpoints) and Phase 5 (entity/function detail panels)
- Content area currently shows placeholder function/entity info — Phase 5 will build full detail components

---
*Phase: 03-navigation-system*
*Completed: 2026-02-11*
