# Phase 6: Global Search - Context

**Gathered:** 2026-02-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can find any entity, function, or nav property across all ~6K indexed items via a command palette and jump directly to it. The MiniSearch index already exists in the data layer — this phase builds the UI and interaction layer on top of it.

Out of scope: search analytics, saved searches, search filters/facets, search history persistence.

</domain>

<decisions>
## Implementation Decisions

### Result presentation
- Results grouped by kind: Entities, Functions, Nav Properties — each group has its own heading
- Cap of 7 results per group (max ~21 visible results)
- Each result shows a kind-specific icon (reuse existing sidebar icons for entity, function, nav property)
- Disambiguation via parent breadcrumb trail below the name (e.g. "GetById" with "SP.List › Functions" underneath)
- Name only — no return type shown in results (user sees that on the detail page)
- Query text highlighted (bold) within matching result names
- Root functions get an explicit "Root" badge/label to distinguish them from bound functions
- No result count displayed
- Hide empty groups — only show group headings that have results
- Always show group headings even when only one group has matches
- Footer hint bar showing keyboard shortcuts: ↑↓ Navigate, ↵ Open, Esc Close

### Empty & edge states
- Initial state (empty input): placeholder text only — "Type to search entities, functions, properties..."
- No recently visited items shown in the palette (keep it clean)
- Minimum 2 characters required before search fires
- Below minimum (1 char): show hint text "Type 2+ characters to search"
- No results: simple message "No results for '[query]'"
- Light debounce on search input (100–150ms)
- Palette disabled until metadata is loaded — Cmd+K does nothing while app is in loading state

### Trigger & dismiss behavior
- Three open triggers: Cmd+K / Ctrl+K from anywhere, clicking header search bar, clicking home hero search input — all open the same palette
- Dismiss via Escape key or clicking the backdrop overlay
- Cmd+K toggles: if palette is open, Cmd+K closes it
- Query always starts fresh on open — no persistence between sessions
- Semi-transparent backdrop overlay behind the palette
- Positioned top-center of viewport (like VS Code, GitHub, Linear)
- Subtle open/close animation (fade + slight scale)
- Header search bar shows a ⌘K / Ctrl+K shortcut badge (platform-aware)

### Result selection & navigation
- Selecting a result navigates to the item's canonical `/_api/...` path — sidebar, breadcrumbs, and detail view update naturally via existing routing
- Each search result is already specific to a parent entity (search index stores `parentEntity`), so paths are always unambiguous
- Nav property results navigate to the nav property's path directly (e.g. `/_api/web/Lists`) rather than the parent entity
- Palette closes immediately on selection — navigation happens in the background
- Keyboard navigation wraps around (past last → first, past first → last)
- No auto-highlight of first result — user must arrow down or click to select
- Mouse hover and keyboard share the same highlight state (hover selects like keyboard)
- Selecting a result adds it to the "recently visited" localStorage list

### Claude's Discretion
- Exact palette width and max-height
- Search input styling details (icon placement, clear button)
- Animation timing and easing
- Scrollbar behavior within the result list
- How the ⌘K badge renders on different platforms (Mac vs Windows/Linux)
- Exact highlight/selection colors

</decisions>

<specifics>
## Specific Ideas

- Command palette pattern inspired by VS Code, GitHub, and Linear — top-center, keyboard-first
- The existing disabled search inputs in the header and home hero become click-to-open triggers for the palette
- The MiniSearch index already tokenizes on dots and underscores (`SP.Web` → `["SP", "Web"]`), so partial matches on namespace segments work naturally

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-global-search*
*Context gathered: 2026-02-12*
