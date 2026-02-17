# Phase 13: Icon System Foundation - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

A reusable icon system for all 4 API types — each type gets a distinct Lucide icon and CSS color token, ready to be consumed everywhere. Delivers: TypeIcon component, CSS custom properties for type colors, and TypeScript types. Integration into specific views (sidebar, search, home) is phases 14-15.

</domain>

<decisions>
## Implementation Decisions

### Icon selection per type
- Root → `Box` (Lucide `box` icon) — contained root object
- Nav Property → `Compass` (Lucide `compass` icon) — navigation/exploration
- Function → `Zap` (Lucide `zap` icon) — action/execution
- Type/Entity → `Braces` (Lucide `braces` icon) — type definition/schema

### Color token design
- Single color token per type — no multi-shade palette (no separate bg/border variants)
- Colors adjust for dark mode — same hue but lighter/more vivid on dark backgrounds for readability
- Muted/pastel saturation — colors blend with existing shadcn neutral palette, not vibrant/loud
- OKLCH color space as specified in roadmap (root hue ~155 green, entity hue ~75-85 orange/amber)
- Root = green, Nav Property = purple, Function = blue, Type/Entity = orange/amber

### TypeIcon component API
- 2-3 size variants: small (sidebar/lists), medium (cards/headers), large (welcome screens)
- Always renders in its type color — no color override prop
- Accepts type as explicit string enum: `type="root" | "nav" | "function" | "entity"`
- Pure icon only — no label, no tooltip. Parent component provides context.

### Type classification
- 4 types is the complete list: root, nav property, function, type/entity
- Actions (POST-only operations) are classified as functions — no separate type
- Unknown/unclassifiable items fall back to a neutral/gray icon — graceful degradation, not an error

### Claude's Discretion
- Whether to use standalone CSS custom properties or integrate into Tailwind theme (or both) — pick what's simpler
- Whether to include a `getApiType(entry)` utility function in this phase or leave type resolution to consuming phases
- Whether to define a canonical app-wide `ApiType` TypeScript enum or scope it to the icon system
- Exact OKLCH lightness/chroma values within the muted/pastel constraint
- Exact pixel sizes for the 2-3 size variants

</decisions>

<specifics>
## Specific Ideas

No specific references — open to standard approaches. Key constraint: icons should be instantly scannable in dense lists (sidebar, search results) while blending with the shadcn aesthetic.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 13-icon-system-foundation*
*Context gathered: 2026-02-18*
