# Phase 27: Filtering & Range Selection - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can control what they see in the changelog — selecting a time range for cumulative diffs and filtering by change type — and can navigate from changelog entries to detailed type/API information. The existing changelog page (Phase 25-26) provides the shell, summary bar, entity change cards, and root functions table. This phase adds controls and navigation on top of that.

</domain>

<decisions>
## Implementation Decisions

### Range selector design
- Dropdown/select control (not button group or slider)
- Options: "Current month" (default), "Last 3 months", "Last 6 months" — fewer steps, not all 1-6
- "Current month" is the default because metadata.latest.json is from today's run and the comparison blob is a snapshot from the last day of the previous month
- Labels use "Last N months" format for multi-month ranges
- When range changes: replace content with loading spinner (same as initial load), not overlay on stale data
- Subtitle text updates to reflect selected range: "Changes in February 2026" for current month, "Changes from Dec 2025 to Feb 2026" for multi-month ranges

### Filter chip behavior
- Three toggle chips: Added, Updated, Removed — all ON by default
- Summary count cards (big numbers at top) stay as totals regardless of filter state — filters only affect detail content below
- All chips can be turned off — show a message like "No change types selected" when all are off
- Chips are color-coded when active: green for Added, blue for Updated, red for Removed — matching the summary card colors. Inactive/off chips use neutral/muted styling

### Entity name linking
- Entity names in changelog cards link to `/types/{fullName}` (Explore Types detail page)
- Root function names link to `/_api/` explore route (Explore API view, not types view)
- Removed entities and removed root functions are NOT clickable — rendered as plain text since they no longer exist in current metadata
- Added and Updated entities/functions are clickable
- Link styling: subtle underline on hover with cursor pointer. No always-visible link color — keeps cards clean

### Controls layout & placement
- Dedicated toolbar row between the page header (title + subtitle) and the summary count cards
- Range dropdown positioned on the left, filter chips on the right
- Toolbar is sticky when scrolling — stays visible as user scrolls through long changelog content
- On narrow/mobile screens: toolbar stacks vertically (range dropdown full width on top, filter chips row below)

### Claude's Discretion
- Exact dropdown component choice (shadcn Select, custom, etc.)
- Sticky toolbar z-index and background treatment
- Filter chip component implementation (shadcn Toggle, custom chips, etc.)
- Exact responsive breakpoint for vertical stacking
- "No change types selected" empty state styling
- Transition/animation when filters toggle content visibility

</decisions>

<specifics>
## Specific Ideas

- Range dropdown should offer only 3 options (current month, 3 months, 6 months) — not all 1-6. Keeps it simple.
- The "current month" default reflects the actual data semantics: latest metadata is from today's pipeline run, comparison blob is end-of-previous-month snapshot
- Root functions route to `/_api/` (Explore API) while entities route to `/types/` (Explore Types) — different link targets based on item type
- Color-coding of filter chips should visually match the summary count cards above for strong association

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 27-filtering-range-selection*
*Context gathered: 2026-02-25*
