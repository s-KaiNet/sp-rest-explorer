# Phase 15: Cross-View Consistency - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Every view in the app uses the unified icon system — search modal, home page, and Explore Types all show consistent Lucide icons with correct type colors. This replaces all remaining text-based type indicators (`<>`, `ƒ`, `NAV`, `T`, Root pill badge) with TypeIcon. Scope is strictly limited to these three views.

</domain>

<decisions>
## Implementation Decisions

### Search result icon placement
- Icon positioned left of result text — same left-of-label pattern as Explore API sidebar
- Smaller icon size than sidebar to fit the compact/dense search modal rows
- Group headers stay as text labels only — no icons on group headers
- "Root" pill badge fully removed — green root icon is the sole indicator of root status, no supplementary text

### Recently visited card icons
- Icon positioned left of the card title (inline with title text)
- Slightly larger icon than sidebar default — take advantage of the card's larger visual canvas
- Bare icon with no background container — consistent with Phase 14's welcome hero decision
- Only replace existing type indicators on cards — don't add or remove other card content

### Explore Types icon treatment
- Same orange/amber entity icon for all type entries — no differentiation between entity types, enum types, complex types
- Welcome screen uses bare TypeIcon(entity, lg) — same pattern as Explore API welcome hero
- Sidebar mirrors Explore API sidebar exactly — icon left of label, same layout and spacing
- Old text indicators fully removed — icons replace text completely, no fallback

### Text symbol cleanup scope
- Complete symbol set to replace: `<>`, `ƒ`, `NAV`, `T`, and Root pill badge
- Strictly scoped to three views: search modal, home page, Explore Types — no opportunistic cleanup elsewhere
- Old text symbol components/utilities deleted from codebase if no longer imported anywhere
- No other stray symbols expected beyond the listed set

### Claude's Discretion
- Accessible text handling for screen readers (descriptive labels like "Function", "Entity" vs icon-only)
- Exact pixel sizing for "smaller" search icons and "slightly larger" card icons
- Any spacing adjustments needed to accommodate icons in search result rows

</decisions>

<specifics>
## Specific Ideas

- Consistency is the driving principle — every view should feel like it uses the same icon system, not patched in differently per view
- Phase 14 established the patterns (left-of-label, bare icon on welcome hero) — Phase 15 extends those patterns to the remaining views
- TypeIcon component from Phase 13 is the single source of truth for all icon rendering

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-cross-view-consistency*
*Context gathered: 2026-02-19*
