# Phase 25: Changelog Page Shell - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Routable page at a dedicated hash route with "API Changelog" nav entry in the app header. Displays a summary bar with counts of added, updated, and removed entities/functions. Shows loading feedback while blobs are fetched and diff is computed. Handles errors (network failures, missing blobs) and empty results gracefully. This phase delivers the page frame only — detail views (Phase 26) and filtering/range selection (Phase 27) come later.

</domain>

<decisions>
## Implementation Decisions

### Summary bar design
- **Stat cards** — 3 distinct cards in a horizontal row, one per change type
- **Combined totals** — each card merges entity + function counts into a single number per change type (Added: 15, Updated: 8, Removed: 3)
- **Color scheme** — Added = green, Updated = blue, Removed = red
- **Zero counts** — always show all 3 cards, even when count is 0 (no layout shifting, communicates "loaded correctly, just no changes of this type")

### Page layout & structure
- **Centered content, no sidebar** — full-width centered column like the How It Works page, not the sidebar+tree layout of Explore pages
- **Content width** — match existing centered pages (same max-width as How It Works)
- **Page heading** — "API Changelog" title with period indicator subtitle (e.g., "Changes in February 2026")
- **Nav link** — same style as existing header links (Explore API, Explore Types, How it works), no badge or special treatment; active state highlighting is sufficient

### Loading & error states
- **Loading** — centered spinner with message text (e.g., "Computing changes..."), not skeleton cards
- **Error tone** — neutral + helpful, matter-of-fact with actionable next step
- **Differentiated errors** — 404 (missing blob) gets informational message "No historical data available for this period" with no retry button; network errors get "Unable to load data" with a "Try again" retry button
- **Transition** — instant swap from loading to content, no fade-in animation. Consistent with how Explore pages handle state transitions

### Empty state presentation
- **Visual** — muted icon (checkmark or clipboard) centered with text below
- **Summary bar** — still visible with all zeros (reinforces successful load)
- **Message** — heading: "No changes detected"; subtext: "No API changes were found for [period]. The diff is computed by comparing monthly metadata snapshots."
- **No action suggested** — purely informational; range selection comes in Phase 27

### Claude's Discretion
- Exact icon choice for empty state
- Spinner style and "computing" message wording
- Card spacing, padding, and typography within the stat cards
- Exact hash route path format (e.g., `/#/changelog` vs `/#/api-diff`)
- How the page heading and summary bar are vertically spaced

</decisions>

<specifics>
## Specific Ideas

- Phase 24's diff engine stores results as a module-level singleton with `useSyncExternalStore` — the page shell reads from this, doesn't manage its own data fetching
- The diff module has its own loading/error/ready status independent from the global app-store — use that status to drive page states
- The research doc describes the route as `/#/api-diff` with `/#/api-diff/:monthKey` — respect this if it aligns with the existing routing setup
- Stat cards should feel like dashboard widgets — clean, scannable, not heavy

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 25-changelog-page-shell*
*Context gathered: 2026-02-25*
