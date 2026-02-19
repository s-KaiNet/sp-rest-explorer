# Phase 5: Entity & Function Detail - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can view complete entity and function documentation with interactive tables, type linking, inline filtering, cross-references, and section navigation. The EntityDetail component is universal — reused in both Explore API content area and on the Explore Types page (which gains a welcome landing screen and per-entity detail views). Tables follow the mockup styling from `.planning/phases/1-rebuild-ui/mockups/types-view.html`. No documentation link (ENTD-01 simplified to name + fullName + badge). Base type chain included.

</domain>

<decisions>
## Implementation Decisions

### Collection type visual treatment
- `Collection(SP.ListItem)` renders as a split link with two independently clickable parts
- "Collection" portion: muted/secondary color (dimmed), navigates to `/#/entity/Collection(SP.ListItem)` — the synthetic Collection entity with its own bound methods (GetById, Add, etc.)
- Inner type "SP.ListItem" portion: entity green, prominent — navigates to `/#/entity/SP.ListItem`
- Parentheses are plain non-clickable text between the two links: `Collection` `(` `SP.ListItem` `)`
- Both parts get hover tooltips: "Collection" shows "View Collection(SP.ListItem) entity", inner type shows "View SP.ListItem entity"
- All clickable entity type links (not just Collection) get consistent hover tooltips saying "View {typeName} entity"
- `Collection(Edm.*)` types are NOT linkable — rendered as plain gray/muted text (same as primitive types)
- Underline-on-hover for both Collection parts to show clickability

### Entity detail empty sections
- Sections with 0 items: show collapsed with (0) count badge — not hidden, not expanded
- Sections with items: all expanded by default — user sees all content immediately
- When expanding a (0) section: show italic message "No properties" / "No navigation properties" / "No methods" (not an empty table)
- Section jump links always show for all three sections including (0) — dimmed/muted styling for empty sections

### Type link behavior
- ALL entity type links navigate to `/#/entity/{typeName}` — consistent behavior everywhere
- This applies in Explore API content area, in Explore Types page, in base type chain, in "Used by" chips — no exceptions
- Type links chain: clicking SP.Web in SP.ChangeToken's detail navigates to `/#/entity/SP.Web`, which shows full entity detail
- EntityDetail component is universal — same component used in both `/_api/*` context (Explore API) and `/#/entity/*` context (Explore Types)
- Explore Types page at `/#/entity` (no type selected): show welcome landing screen from mockup (stats: entity count, property count, method count, "Select a type" hint)
- Explore Types page at `/#/entity/SP.List`: show full EntityDetail with properties, nav properties, methods — no sidebar type list (that's v2)
- Cross-context "View in API" link: deferred to v2
- Primitive types (Edm.String, Edm.Int32, Edm.Boolean, etc.): gray/muted monospace text, NOT clickable
- Base type chain links: same behavior as all type links — navigate to `/#/entity/{baseTypeName}`

### "Used by" cross-references
- Purple background bar matching mockup design exactly — chip-style links showing "EntityName .propertyName"
- Positioned above section jump links, below base type chain
- Scope: navigation properties only (NOT regular properties — too numerous and less meaningful)
- Clicking a chip navigates to `/#/entity/{referencingEntityFullName}` — consistent with all type links
- Truncation: show first 10 chips, then "+N more" expandable pill for the rest
- Hide entirely when 0 references (no purple bar shown)
- Collection entities also show "Used by" — Collection(SP.List) shows which entities reference it via nav properties
- Computation: on-demand per entity render (scan all entities' nav properties), not precomputed at boot

### Table styling and sorting
- Follow mockup CSS exactly from `types-view.html` — custom table classes (`.props-table`, `.methods-table`), not shadcn/ui Table or @tanstack/react-table
- All tables sorted alphabetically by name column — always, no interactive sort toggles
- No pagination, no column reorder, no virtualization — render all rows
- Inline filter in Properties and Methods section headers (matching mockup `.section-filter` pattern)

### Function detail
- Existing function detail in ExplorePage enhanced, not replaced
- COMPOSABLE badge, parameters one-per-line as `paramName: ParamType`, return type display
- Entity types in parameters and return type are clickable green links navigating to `/#/entity/{typeName}`
- `this` parameter filtered from display (already done in current code)
- `void` return type in italic muted text, "none" for no parameters in italic muted text

### Claude's Discretion
- Exact spacing, padding, and font sizes (guided by mockup but adapted to Tailwind)
- Loading/transition behavior when navigating between entities
- How the "+N more" expansion works in "Used by" (toggle, dialog, or inline expand)
- Section jump link scroll behavior (smooth scroll, offset for sticky header)
- Error states for entities not found in metadata

</decisions>

<specifics>
## Specific Ideas

- Table and section styling must follow the HTML mockup at `.planning/phases/1-rebuild-ui/mockups/types-view.html` — this is the visual reference
- Collection split link behavior matches the old Vue app's `DocLink.vue` component with `splitCollection: true` — but with updated visual treatment (Collection dimmed, inner type prominent)
- "Used by" cross-references follow the mockup's purple `.used-by` bar design with `.used-by-chip` elements
- Section jump links follow the mockup's `.section-jump` pill design with `.jump-count` badges
- Explore Types welcome screen follows the mockup's `.types-welcome` design with stats and hint

</specifics>

<deferred>
## Deferred Ideas

- Explore Types sidebar with full 2,449 entity list + filter — v2
- "View in Explore API" cross-context link from Explore Types page — v2
- Interactive table sorting (click column headers) — v2
- Table pagination for very large sections — not needed, render all rows

</deferred>

---

*Phase: 05-entity-function-detail*
*Context gathered: 2026-02-11*
