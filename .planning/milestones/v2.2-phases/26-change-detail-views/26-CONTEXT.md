# Phase 26: Change Detail Views - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can inspect the full details of API changes — expandable entity cards with property-level diffs, a root functions change table, and color-coded change-type badges on every item. The changelog page shell (Phase 25) already exists with summary stats and a placeholder for detail content. The diff engine (Phase 24) already produces structured `DiffEntity[]` and `DiffFunction[]` data. This phase fills the placeholder with the actual change visualizations.

Filtering, range selection, and entity-name linking are Phase 27 — out of scope here.

</domain>

<decisions>
## Implementation Decisions

### Entity card layout & density
- Cards start **expanded by default** — all property-level changes visible immediately on load
- Each property change shows **name + typeName + change badge** (e.g., `ReturnType: Edm.String [Updated]`)
- Inside each entity card, changes are organized into **three labeled sub-sections**: Properties, Navigation Properties, Functions — matching the existing CollapsibleSection pattern
- For added entities, **list all properties** — no condensed summary, full visibility even for 20+ items

### Root functions table design
- Table has **three columns**: Function Name, Return Type, Change Badge
- **One mixed table sorted alphabetically** — not grouped by change type
- Function names and return types use the **CodeText component** (monospace, color-coded) for consistency with Explore API pages
- Root functions section appears **before entities** (overview first, deep details second)

### Change-type badge style
- **Three labels**: Added, Updated, Removed (no separate "New" label — keep it simple, same as diff engine output)
- **Same color scheme** as summary stats: green for Added, blue for Updated, red for Removed
- **Pill shape** (rounded-full) — fully rounded ends, matching existing count badge pattern
- **Subtle fill**: light colored background (e.g., green-100/green-900 dark) with colored text — visible but not overwhelming, like GitHub/Linear labels

### Grouping & ordering
- Entities shown in **one alphabetical list** — not grouped by change type — badges distinguish them
- Within entity card sub-sections, individual changes sorted **alphabetically by name**
- Both main sections (Root Functions, Entities) have **headers with counts** (e.g., "Entities (47)", "Root Functions (12)")
- Both sections are **collapsible** using the existing CollapsibleSection component

### Claude's Discretion
- Entity card border/shadow styling details
- Spacing between cards and sections
- Empty sub-section handling (hide section header if 0 items, or show with "None")
- Animation/transition on card expand/collapse
- Exact badge font size and padding

</decisions>

<specifics>
## Specific Ideas

- Reuse the existing `CollapsibleSection` component for section headers with counts
- Reuse the existing `CodeText` component for function names and type names in tables
- Match the existing table styling pattern from `PropertiesTable.tsx` / `MethodsTable.tsx` (raw `<table>` with Tailwind, `w-full border-collapse text-sm`)
- The insertion point is the placeholder text in `ChangelogPage.tsx` line ~152: `"Detailed change views coming in a future update."`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 26-change-detail-views*
*Context gathered: 2026-02-25*
