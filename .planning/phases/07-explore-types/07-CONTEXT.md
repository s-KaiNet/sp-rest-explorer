# Phase 7: Explore Types - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse, inspect, and cross-reference every complex type in the SharePoint REST API metadata. Includes a sidebar listing with namespace grouping, type detail views with properties tables, inheritance display (base type + derived types), and "Used by" cross-references showing which entities reference a type via navigation properties. TypeLinks in Explore API views navigate to type details in Explore Types.

**Scope reduction:** Enum types are excluded from this phase. The metadata parser does not currently extract EnumType nodes from the OData schema (enum properties are stored as Edm.Int32). Enum type support requires parser extension and is deferred.

</domain>

<decisions>
## Implementation Decisions

### Sidebar & type listing
- Single mixed alphabetical list of all complex types (no separate grouping by complex vs enum since enums are deferred)
- Icon/badge distinguishes type kind in the sidebar
- Filter input searches by type name only (not property names within types)
- Strip the common `SP.` prefix from displayed names — but keep sub-namespace prefixes (e.g., `Publishing.PageLayoutType` not `SP.Publishing.PageLayoutType`)
- Show total and filtered count near the filter input (e.g., "127 of 342 types")
- Namespace-based collapsible groups (SP., SP.Publishing., SP.Sharing., etc.) with group headings
- Within a namespace group, strip the group prefix from type names (e.g., under "SP.Publishing" show "PageLayoutType")
- Groups start expanded; filtering hides groups with no matches
- No count shown on group headings — just the namespace name

### Type detail layout
- Complex types only (no enum types in this phase)
- Properties table with 3 columns: Name, Type (using existing TypeLink component for clickable complex type references), Nullable
- Nullable logic: a property is nullable unless it explicitly has `"nullable": false` — nullable is the default
- Type detail header follows the existing EntityDetail header pattern
- Enum member display style: Claude's discretion (deferred with enum types anyway)

### Inheritance & cross-references
- Base type shown as a "Base type" field with immediate parent as a clickable link (not a full chain)
- Derived types section: list all types that inherit from this type, as clickable links
- Whether to show derived types for complex types (not just entity types): Claude's discretion based on actual inheritance patterns in the data
- "Used by" section shows entities only (no functions) — specifically entities whose navigation properties reference this type
- "Used by" grouped by kind label ("Used by Entities")
- Capped with "Show more" toggle for types referenced by many entities
- "Used by" entries are clickable and navigate to the entity detail in Explore API

### Navigation & TypeLink behavior
- "Explore Types" is a separate top-level nav item in the header, alongside "Explore API"
- URL structure follows the existing pattern used by Explore API entity detail
- Clicking a TypeLink in Explore API navigates to Explore Types AND syncs the sidebar to highlight/scroll to that type
- TypeLinks within Explore Types (on property types): complex types navigate within Explore Types; entity type references navigate to Explore API
- Clicking a "Used by" entity navigates to that entity's detail in Explore API

### Claude's Discretion
- Enum member display format (when enum types are eventually added)
- Whether derived types section applies to complex types or entity types only — based on actual data patterns
- Exact spacing, typography, and visual density within type detail views
- Loading and error states
- Empty state when no type is selected
- "Show more" threshold for "Used by" section

</decisions>

<specifics>
## Specific Ideas

- Follow existing EntityDetail header pattern for type detail headers — don't invent a new one
- Reuse the existing TypeLink component for property type values — it already renders differently and is clickable
- Sidebar pattern should feel consistent with Explore API sidebar but add namespace grouping as an enhancement
- The UsedByBar component already exists but scans all entities on every render (noted as tech debt) — Phase 7 should address this with a precomputed index

</specifics>

<deferred>
## Deferred Ideas

- **Enum type support** — requires extending the metadata parser (`metadataParser.ts`) to extract `EnumType` nodes from OData schema. Currently enum properties are stored as `Edm.Int32`. This is a prerequisite for displaying enum types and their members. Separate phase.
- **"Used by Functions"** — showing which functions reference a type was considered but removed from scope. Could be added later if users need it.

</deferred>

---

*Phase: 07-explore-types*
*Context gathered: 2026-02-14*
