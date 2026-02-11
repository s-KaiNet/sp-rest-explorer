# Phase 3: Navigation System - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Users navigate the API hierarchy via breadcrumbs and a contextual sidebar showing children of the current node. Covers breadcrumb bar, sidebar with child items, sidebar resize, and route-driven navigation. Does NOT include sidebar filtering/search (Phase 4) or deep search/Cmd+K (v2).

**Scope change:** NAV-03 (copy path button on breadcrumb bar) is removed from this phase per user decision.

</domain>

<decisions>
## Implementation Decisions

### Breadcrumb bar design
- Full-width breadcrumb bar spanning above both sidebar and content area
- Sticky — stays pinned at top when scrolling content
- Slash (`/`) separator between segments — mirrors actual API path format
- Current (last) segment is bold and not clickable — clearly shows current position
- Wraps to multiple lines when paths get deep — no truncation or collapse
- No copy-path button (NAV-03 removed)

### Sidebar content & ordering
- Type-grouped, then alphabetical within each group
- Navigation properties appear first, functions second
- Horizontal divider separates nav properties from functions (no section headers or counts)
- Independent scroll — sidebar scrolls separately from main content area
- Each item shows name + type tag (FN blue, NAV purple) as defined in NAV-06

### Navigation transitions
- Sidebar slides directionally: slides left when navigating deeper, slides right when going back up
- Content area uses fade animation (not slide)
- Browser back/forward triggers the same animations as manual breadcrumb/sidebar navigation (back = reverse direction)
- Animation speed: fast (~150ms)

### Resize handle & layout
- Sidebar on the left side, content on the right — standard explorer pattern
- Resize handle is a thin line (1-2px border), highlights on hover
- Sidebar width persists across sessions via localStorage
- Sidebar is always visible — no collapse/toggle
- Default 280px, min 200px, max 500px (per NAV-07)

### Claude's Discretion
- Breadcrumb bar separator visual (border vs shadow vs background color difference)
- Exact animation easing curves
- Sidebar item hover/active states
- Empty state when a node has no children

</decisions>

<specifics>
## Specific Ideas

- Slash separator chosen specifically because it mirrors the real `_api/web/Lists` path format — keeps it feeling like a developer tool
- Directional slide animation creates spatial metaphor: deeper = left, back = right — gives sense of hierarchy depth
- Independent sidebar scroll is important because some nodes (like SP.Web) have ~50 children

</specifics>

<deferred>
## Deferred Ideas

- NAV-03 (copy path button on breadcrumb bar) — removed from phase, may revisit later
- Sidebar filter/search input — deferred to Phase 4
- Deep search / Cmd+K — deferred to v2

</deferred>

---

*Phase: 03-navigation-system*
*Context gathered: 2026-02-11*
