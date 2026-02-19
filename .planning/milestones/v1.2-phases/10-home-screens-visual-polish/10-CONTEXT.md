# Phase 10: Home Screens & Visual Polish - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Home pages for both Explore API and the main app are visually polished with proper branding, accurate stats, a redesigned API welcome screen, expanded recently visited (covering both API endpoints and Types), and fixed dark mode borders on the search modal. Requirements: HOME-01, HOME-02, HOME-03, SIDE-04, VISU-01.

</domain>

<decisions>
## Implementation Decisions

### Home page stats & branding
- Add favicon.svg icon inline to the left of the "SharePoint REST API Explorer" title on the home page
- Icon should be larger/prominent (32-40px range) befitting a hero section — not the small 20px used in the nav bar
- Replace all computed stats with hardcoded approximate strings: "3.5k+ functions", "2.4k entities", "11k+ properties", "60k+ endpoints"
- No metadata computation needed for stats — pure static strings, no loading delay
- 4 stats displayed in a single horizontal row with even spacing
- Subtitle text ("Browse, search, and explore the complete SharePoint REST API surface.") stays unchanged

### Explore API welcome screen
- Redesign the `/_api` root view (no endpoint selected) from left-aligned info block to a centered layout matching the Explore Types home screen pattern
- Icon: styled `<>` symbol in a colored box (matching how Explore Types uses "T" in a box)
- Color accent: function blue (`type-fn`) — ties to the API/function domain, distinct from Types' purple
- Stats: two stats — root endpoints count and functions count, computed from loaded data (not hardcoded, since data is already available on this page)
- Include centered description text and a hint box (e.g., "Select an endpoint from the sidebar, or use Ctrl+K to search")
- Follow the exact structural pattern from TypesPage.tsx: large icon box → title → description → stats row → hint box

### Recently visited expansion
- Types entries mixed chronologically with API endpoint entries in one unified list, sorted by most recent
- Types entries use a purple "T" icon matching the Explore Types branding, visually distinct from API endpoint icons
- No dedicated "Explore Types" link needed in the recently visited section — the types entries themselves serve as navigation
- Max items stays at 12, shared between both API and Types visits
- Need to add `'entity'` to the `RecentlyVisitedItem.kind` union and track Types page visits

### Dark mode search borders
- Modal-only fix — override border color specifically on the CommandPalette/dialog, no global `--border` change
- Subdue all modal borders: outer dialog border, input separator (`border-b`), footer separator (`border-t`), and `<kbd>` hint borders
- Target: subtly visible borders — still present but noticeably dimmer than current, guiding the eye without demanding attention
- Backdrop/overlay stays unchanged — only borders are adjusted

### Claude's Discretion
- Exact icon sizing within the 32-40px range for the home page title
- Exact border color value for the subdued dark mode modal borders
- Spacing and typography refinements across all changed layouts
- The `<>` symbol styling details (font weight, size within the box)
- Loading/error state handling on the Explore API welcome screen

</decisions>

<specifics>
## Specific Ideas

- Explore API welcome screen should follow the exact structural pattern from TypesPage.tsx (lines 101-159): centered flex container → large icon box → title → description → stats row → hint box
- The `<>` symbol for the API welcome mirrors how Explore Types uses "T" — establishing a visual language across sections
- Function blue (`type-fn`) for API, entity purple (`type-entity`) for Types — consistent color coding throughout the app
- Stats on home page are presentation-only (hardcoded), but stats on Explore API welcome are live (computed) — different sources for different contexts

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-home-screens-visual-polish*
*Context gathered: 2026-02-15*
