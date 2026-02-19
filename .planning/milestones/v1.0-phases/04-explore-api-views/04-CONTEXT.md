# Phase 4: Explore API Views - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Users have a curated home screen for API discovery and can browse all 793 root endpoints with filtering. This phase delivers the home screen (hero + recently visited + browse-all link) and the browse-all sidebar view at `/_api` root with live filtering. Popular endpoint cards were considered and explicitly removed. Search (Cmd+K) is v2 — search UI elements are placeholder/disabled.

</domain>

<decisions>
## Implementation Decisions

### Home screen layout
- Uniform grid of cards (responsive columns) for recently visited items — 3 columns, 4 rows (up to 12 items)
- Hero section at top: title, description ("Browse, search, and understand every endpoint..."), real stats from loaded metadata (function/entity/nav property counts with colored dots)
- Hero search bar present but disabled/non-functional (v2 placeholder) — shows "Coming soon" state
- "Browse all root endpoints" button positioned above recently visited section (top of content after hero)
- No Popular Endpoints cards — replaced entirely by Recently Visited
- No footer hint section
- Endpoint chips from mockup style: pill-shaped with function marker, wrapped flex layout, subtle border, blue hover effect (used if popular cards return in future — not needed for v1)

### Recently Visited
- Tracks visited endpoints in localStorage with timestamps
- Each card shows: colored type icon (blue for functions, green for entities), name, path (monospace), and relative time ("2h ago")
- "Clear" action button in the section header to clear all history
- Empty state: simple message + browse hint ("No recently visited endpoints. Browse all root endpoints to get started.")
- Clicking a recently visited item navigates directly to that endpoint's URL

### Search UI placeholders
- Home screen: hero search bar visible but disabled with "Coming soon" indicator — header search trigger hidden
- Non-home pages (Explore API browsing, Explore Types, API Changelog, How it works): header search trigger visible but disabled/non-functional
- No duplicate search UI — hero search and header search are mutually exclusive based on current route

### Sidebar filter (all levels)
- Filter input always visible in sidebar at every navigation level — consistent layout, no jumping
- Live filtering as user types (u-type, real-time, no debounce/button)
- Count always displayed: "X elements" when no filter, "Showing X of Y elements" when filtering
- Label is "elements" everywhere (root and deeper nodes alike)

### Browse-all view (/_api root)
- Sidebar at /_api root shows all 793 root endpoints with filter input (State 3 from mockup)
- "Browse all root endpoints" button on home screen navigates to `/#/_api`
- Default sidebar width stays at 280px (same as other levels — user can drag wider)
- Content area shows welcome message as in mockup: "All Root Endpoints" heading, description about 793 endpoints, hint about hovering and dragging sidebar

### Root endpoint visual treatment
- Root items display a `<>` icon/symbol with a green-ish background instead of FN/NAV type tags
- This replaces the Phase 3 "no tags at root" decision — root items now have visual distinction
- Deeper levels continue using FN (blue) and NAV (purple) type tags as before

### Name truncation
- Standard CSS right-truncation (`text-overflow: ellipsis`) everywhere — no prefix ellipsis
- EXPL-05 requirement updated from "prefix ellipsis" to standard right-truncation
- Full name shown on hover via native HTML `title` attribute (not a styled tooltip)
- Already partially implemented via Tailwind `truncate` class in SidebarItem

### Claude's Discretion
- Exact styling of the disabled/coming-soon search bar states
- Welcome message content wording for /_api root content area
- Green shade for the `<>` root item icon background
- Layout responsive breakpoints for the recently visited grid
- How relative timestamps are computed and displayed ("2h ago", "1d ago", etc.)
- localStorage schema for recently visited tracking

</decisions>

<specifics>
## Specific Ideas

- Home screen follows the mockup at `.planning/phases/1-rebuild-ui/mockups/home-screen.html` — chip styling, card layout, general visual language
- Hero description text kept aspirational: "Browse, search, and understand every endpoint in the SharePoint REST API" even though search is v2
- Real metadata counts in hero stats (not hardcoded) — computed from loaded data
- Browse-all button moved to top of home screen content (above recently visited), not bottom as in mockup

</specifics>

<deferred>
## Deferred Ideas

- Popular Endpoints cards — removed from v1, could return in future if good categorization is found
- Cmd+K deep search — v2 feature, search UI is placeholder-only in v1
- Recently Visited as a separate section/page with more history — keep it simple for now

</deferred>

---

*Phase: 04-explore-api-views*
*Context gathered: 2026-02-11*
