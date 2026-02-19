# Phase 2: Data Layer & UI Foundation - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Metadata loads from Azure Blob Storage, is indexed with MiniSearch for ~6K searchable items, and pre-computed lookup maps provide O(1) access. The app displays loading/ready states with skeleton screens and establishes a consistent visual language: color-coded type system (blue functions, green entities, purple nav properties) and monospace font for all code identifiers. This phase does NOT include navigation, detail views, or search UI — those are Phases 3-5.

</domain>

<decisions>
## Implementation Decisions

### Loading & transition states
- Skeleton screens mimicking the actual layout (sidebar + content area shapes) during metadata fetch
- Header with navigation renders immediately on first paint — only the content area shows skeletons
- Nav links in header are clickable during loading — each route shows its own skeleton layout
- Real content fades in over ~200ms replacing the skeleton when metadata is ready
- CSS spinner in index.html as pre-React fallback (covers the ~200-800ms JSON.parse window noted in known risks)

### Color-coded type system
- Blue for functions, green for entities, purple for navigation properties — applied as **text color only** in detail/content views
- Sidebar (Phase 3) gets small FN/NAV **badges** — list scanning context warrants the extra visual cue; detail views use color-only
- Entity type names styled as links everywhere: green text + underline (or underline on hover) — clear clickable affordance
- Same hue in both light and dark mode, with **adjusted brightness** for dark mode to maintain readability and contrast
- Define color tokens as CSS custom properties so they're reusable across all phases

### Monospace & typography rules
- Inline code identifiers (type names, property names, method signatures) get a **subtle background tint** (light gray) like markdown inline `code` — clearly distinct from prose
- Claude's discretion on monospace font choice (system stack, JetBrains Mono, Fira Code — whatever balances load time and readability)
- Claude's discretion on code text sizing relative to body text
- Claude's discretion on table typography (code columns only vs full monospace) — optimize for readability

### Error & offline states
- Metadata fetch failure shows an **error message with retry button** — no silent auto-retry
- Error replaces the **entire content area** — header stays visible, content zone becomes error message + retry button
- Error tone is **technical and direct**: "Failed to load API metadata from Azure. Check your connection and try again." — no fluff for a developer audience
- **Cache with revalidation**: cache metadata in IndexedDB, serve cached on load, fetch fresh in background — fast repeat visits, eventually consistent

### Claude's Discretion
- Monospace font choice (system stack vs web font)
- Code text sizing relative to body text (same size vs slightly smaller)
- Table typography approach (code columns only vs full monospace)
- Exact skeleton shimmer animation style
- IndexedDB cache eviction strategy and staleness threshold
- MiniSearch configuration and tokenizer details

</decisions>

<specifics>
## Specific Ideas

- Skeletons should mimic the real layout — not generic bars, but shapes that match where sidebar, breadcrumb, and content will actually be
- The fade-in transition from skeleton to real content should be subtle (~200ms) — not a flashy animation
- Color system must be defined as reusable tokens (CSS custom properties) since every subsequent phase uses these colors
- Error messaging targets developers — keep it factual, skip the cute illustrations

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-data-layer-ui-foundation*
*Context gathered: 2026-02-11*
