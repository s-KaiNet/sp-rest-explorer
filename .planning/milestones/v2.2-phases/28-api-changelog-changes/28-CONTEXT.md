# Phase 28: API Changelog changes - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Refinements to the existing API Changelog page UI. Four specific changes: replace the month range dropdown with toggle buttons, remove the full-width stat cards, integrate counts into the filter buttons and make them bigger/right-aligned, and tone down the change-type colors. No new features or capabilities — purely visual/interaction refinements to the existing page.

</domain>

<decisions>
## Implementation Decisions

### Range button design
- Replace native `<select>` dropdown with a **segmented control** (connected button group, shared borders)
- Three segments: "Current month" (default), "Last 3", "Last 6"
- Active segment gets a **filled background** with neutral color (foreground/primary — dark fill on light mode, light fill on dark mode)
- Inactive segments are outlined/ghost style
- Position stays on the **left side** of the toolbar row (same spot as current dropdown)

### Filter button layout & sizing
- Remove the three full-width stat cards entirely (the Added/Updated/Removed summary row)
- Move filter buttons to the **right side** of the toolbar (stays where they are, but now the stat cards above are gone)
- Increase button size to **medium** — roughly 2x current chips: `text-sm`, more padding, comfortable click target
- Change shape from **pill (rounded-full)** to **rounded rectangle** (rounded-md or rounded-lg)
- Integrate counts **inside the button label** — e.g., "Added (12)" or "Added · 12"
- Active state uses **muted change-type color** (muted green for Added, muted blue for Updated, muted red for Removed)
- Inactive state is **fully desaturated** — plain gray/muted, no color hint

### Color palette adjustments
- Tone down colors in **light mode only** — same green/blue/red hues but shifted to more muted, less saturated variants (e.g., emerald/slate-blue/rose territory instead of bright primary green/blue/red)
- **Dark mode stays as-is** — current -400 variants are acceptable
- Apply muted colors **consistently everywhere**: filter buttons, ChangeBadge pills in entity cards, ChangeBadge in root functions table
- All three change-type color locations (filter buttons, ChangeBadge component, stat card numbers [removed]) use the same updated palette

### Claude's Discretion
- Exact Tailwind color classes for the muted palette (e.g., specific -500/-600 shades, or emerald vs green)
- Segmented control border and transition styling
- Exact padding/spacing values for the medium-sized filter buttons
- Count format inside buttons ("Added (12)" vs "Added · 12" vs other)
- Any micro-interactions (hover states, transitions)

</decisions>

<specifics>
## Specific Ideas

- Segmented control is a common pattern for mutually-exclusive options — should feel native and expected
- Filter buttons with integrated counts replace both the stat cards and the old small chips — they become the single source of "how many changes" information
- The stat cards being removed means the toolbar row is the first visual element after the page header — it needs to carry the key information

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 28-api-changelog-changes*
*Context gathered: 2026-02-25*
