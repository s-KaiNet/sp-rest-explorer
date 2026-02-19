# Phase 11: Search UX Fixes - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix four specific search behaviors in the Cmd+K palette: dot-literal matching, group collapse stability, path-length sorting for API Endpoints, and hover feedback on result items. These are targeted fixes to the existing search — no new search capabilities.

</domain>

<decisions>
## Implementation Decisions

### Dot-matching behavior
- Dots are ALWAYS treated as literal characters — no fuzzy fallback
- ALL special characters (dots, parentheses, slashes) match literally in search queries
- Matching is substring-based: "SP.Fi" matches any result containing the exact substring "SP.Fi" (including "SP.File")
- Matching is case-insensitive: "sp.file" matches "SP.File"

### Sorting rules
- Path-length sorting applies ONLY to the API Endpoints group — other groups keep their current ordering
- Sort metric is character count of the path string (not segment count)
- Ties in path length preserve original order (stable sort)
- Sorting applies only when there's an active search query — no query means no path-length sort

### Group collapse interaction
- Chevron rotation indicator: ▶ when collapsed, ▼ when expanded
- Entire header row is the click target — label, count badge, whitespace, everything
- Collapse state resets on new search query — all groups expand fresh with new results
- Default open/close state on palette open: keep current behavior unchanged
- The key fix: collapsing/expanding must NOT cause header text to shift position

### Hover & selection feedback
- Pointer cursor + background highlight on hover for search result items
- Show a small action hint (arrow/icon) on the right side of hovered items
- Keyboard navigation and mouse hover use the same highlight style — no visual distinction
- Group headers do NOT get hover effects — only result items do

### Claude's Discretion
- Hover highlight color/intensity — pick what matches the existing palette design
- Exact action hint icon choice (arrow, chevron, etc.)
- How to implement literal matching technically (regex escape, custom matcher, etc.)
- Animation/transition for chevron rotation and collapse

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-search-ux-fixes*
*Context gathered: 2026-02-17*
