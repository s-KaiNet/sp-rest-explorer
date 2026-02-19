# Phase 12: Detail & Layout Fixes - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix two display bugs: (1) entity property nullable column shows incorrect values — must reflect actual metadata, and (2) the Explore API breadcrumb renders inside the top header bar — must move to the main content area. No new features, just correctness and layout fixes.

</domain>

<decisions>
## Implementation Decisions

### Nullable column display logic
- Column already exists but shows wrong values — this is a fix, not a new column
- If property has `"nullable": false` → show "no"; everything else (true, missing, undefined) → show "yes"
- Display format: plain lowercase text ("yes" / "no") — no icons, badges, or colors
- Only applies to structural properties (Edm.String, Edm.Int32, etc.) — navigation properties should not show a nullable value
- Missing `nullable` field in metadata is treated as nullable → show "yes"

### Breadcrumb placement & styling
- Move breadcrumb from the top header bar into the top of the content area where API details are displayed
- Breadcrumb should be sticky — stays pinned below the header when scrolling through detail content
- Keep the current separator style (whatever is already in use) — no design change
- Add a subtle bottom border below the breadcrumb to visually separate it from the content below

### Breadcrumb interaction behavior
- Keep current click/navigation behavior — no changes to how segments work (standard React Router links)
- Breadcrumb should only appear on detail pages (entity detail, function detail, endpoint detail) — not on listing/index pages
- Long breadcrumb paths wrap to the next line rather than truncating or horizontally scrolling

### Claude's Discretion
- Exact sticky implementation approach (CSS sticky vs JS-based)
- Breadcrumb padding and spacing values
- How to handle the removal of breadcrumb from the header bar (ensure header doesn't break visually)
- Any edge cases in nullable logic for unusual property types

</decisions>

<specifics>
## Specific Ideas

- The breadcrumb fix is purely positional — keep the same component, same styling, same separator; just move it to the right DOM location
- Nullable fix is about reading the metadata correctly — the column infrastructure already exists

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-detail-layout-fixes*
*Context gathered: 2026-02-17*
