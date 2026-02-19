# Phase 9: Explore API Sidebar Polish - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the Explore API sidebar: group root-level items by namespace (collapsible groups matching Explore Types pattern), fix badge positioning for consistency, remove noisy type badges everywhere, and fix horizontal scrollbar flickering during slide animation. No new sidebar capabilities — this is visual/organizational polish only.

</domain>

<decisions>
## Implementation Decisions

### Namespace grouping behavior
- Groups are **all expanded by default** when viewing the root level
- Ungrouped items appear at the top under a group labeled **"Core"** (not "No Group")
- "Core" label applies **only to Explore API** — Explore Types keeps its existing "No Group" label
- "Core" group looks identical to namespace groups — same header with chevron, collapsible
- Group headers show **no item count** — just the namespace name
- Collapsed state shows **just name + chevron** — no preview of contents
- **Reuse the same grouping component** from Explore Types (same component, same visual style)
- Collapse/expand state **resets to default** (all expanded) when returning to root from deeper levels

### Badge cleanup
- **Remove three badge types entirely:** "Entity Type", "Complex Type", and "Composable"
- Remove from **all locations**: sidebar items, detail/entity views, and search results
- **Nothing replaces** the removed badges — item names are sufficient
- Detail view heading area **tightens up** naturally after badge removal
- Search results rely on **path context** (e.g., "SP.Social > SocialPost") for differentiation — no replacement badge needed

### Root-level item ordering
- Items within each namespace group sorted **alphabetically**
- Namespace groups sorted **alphabetically** (Core fixed at top, then A-Z)
- Root indicator badges positioned **right-aligned, same line as item name** — consistent with function/nav property badges
- Items inside namespace groups show **stripped names** — common namespace prefix removed (e.g., "SocialPost" inside SP.Social group, not "SP.Social.SocialPost")

### Animation & scrollbar fix
- **Keep existing animation** speed and easing — only fix the scrollbar issue
- Horizontal scrollbar flickering occurs **only during forward navigation** (drilling into items)
- Sidebar should **never show a horizontal scrollbar** — content truncates with ellipsis if too wide
- Scroll position **resets to top** when navigating to deeper levels

### Claude's Discretion
- Exact overflow/hidden CSS approach to prevent horizontal scrollbar
- How to detect and strip namespace prefixes from item names
- Any transition timing adjustments needed to prevent the flicker
- Badge removal implementation order (sidebar vs detail views vs search)

</decisions>

<specifics>
## Specific Ideas

- Reuse the exact grouping component from Explore Types — not a new implementation, share the component
- "Core" is a deliberate naming choice for Explore API ungrouped items — it should feel like a real group, not a fallback

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-explore-api-sidebar-polish*
*Context gathered: 2026-02-15*
