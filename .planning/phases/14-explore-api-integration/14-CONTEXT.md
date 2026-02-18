# Phase 14: Explore API Integration - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply the Phase 13 icon system to the Explore API sidebar and welcome screen. Every sidebar entry shows its type icon left of the label. All text badges (`<>`, `FN`, `NAV`) are removed and replaced by Lucide icons with type colors. Namespace groups show correct type icons on their entries. The welcome screen hero icon switches from `<>` text to the TypeIcon component.

Scope: Explore API sidebar (`SidebarItem.tsx`), Explore API welcome screen (`ExplorePage.tsx`), and the root-variant sidebar rendering (`Sidebar.tsx`). Explore Types sidebar and search modal are Phase 15.

</domain>

<decisions>
## Implementation Decisions

### Icon-label layout
- Icons always visible — remove `showTypeTags` concept entirely. Icons ARE the type indicator, not optional decoration.
- Icon positioned LEFT of label text (icon-first: `[icon] Label`), reversing current badge-after-text layout.
- Label text stays default sidebar text color — only the icon carries the type color (green/blue/purple).
- Icon color does NOT change on hover/selection — background highlights on hover, but icon color remains constant.

### Badge-to-icon transition
- Root entries and child entries have the SAME structural layout — only the icon differs (green Box for root, blue Zap for function, purple Compass for nav).
- No visual distinction for root entries beyond the green icon — no bold text, no extra weight, no borders.
- Bare icon with no container — no tinted background pill, circle, or square around the icon. Just the colored Lucide icon inline.
- Green Box icon alone is sufficient to signal root-level identity (replacing the old `<>` pill badge).

### Welcome screen icon treatment
- Replace `<>` text symbol with `<TypeIcon type="root" size="lg" />` (36px) — 36px size is correct, no need to go larger.
- No tinted background container around the hero icon — icon floats without a box.
- Stats row ("X Root Endpoints", "Y Functions") stays text-only — no small type icons added to stats.
- Hint box at bottom stays as-is with its cursor SVG illustration — not a type indicator, no change needed.

### Namespace group headers
- No icons on namespace group headers — headers stay as chevron + uppercase text. Groups are organizational containers, not typed items.
- Current entry indentation within groups is sufficient — no extra indent needed despite icons adding visual density.
- "Core" catch-all group treated identically to named namespaces (SP, Microsoft.Online, etc.) — same chevron, same styling.
- Collapsed group headers show just the name — no item count, no type preview.

### Claude's Discretion
- Icon size choice (sm vs md) for sidebar entries — pick what balances with existing sidebar typography
- Component API design — whether to keep `variant` prop or derive ApiType from `entry.kind` + context
- Exact gap/spacing between icon and label text
- Any cleanup of `showTypeTags` prop removal across calling components

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Key reference: the TypeIcon component from Phase 13 (`@/components/ui/type-icon`) with its Record-based icon/color lookup. The mapping is:
- `variant === 'root'` → `ApiType = 'root'` (green Box)
- `entry.kind === 'function'` → `ApiType = 'function'` (blue Zap)
- `entry.kind === 'navProperty'` → `ApiType = 'nav'` (purple Compass)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-explore-api-integration*
*Context gathered: 2026-02-18*
