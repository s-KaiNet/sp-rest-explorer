# Project State: SP REST API Explorer — New UI

## Project Reference

**Core Value:** Developers can browse and understand every SharePoint REST API endpoint through a fast, modern interface with contextual navigation.

**Current Focus:** Rebuild from Vue 2 + Webpack 3 to React 19 + Vite + Tailwind 4 + shadcn/ui. v1 delivers the Explore API view with navigation, detail panels, and home screen.

**Key Constraints:**
- Tech stack locked: React 19, Vite, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, React Router 7
- GitHub Pages hosting (hash routing required)
- Azure Blob Storage data format is fixed
- Desktop only for v1
- Incremental delivery — each phase deployable

## Current Position

**Phase:** 05-entity-function-detail
**Plan:** Plan 3 of 3 complete — phase complete
**Status:** Phase 5 complete, ready for verification

```
Phase 1 [==========] Project Scaffolding          (6 reqs) ✓
Phase 2 [==========] Data Layer & UI Foundation   (7 reqs) ✓
Phase 3 [==========] Navigation System            (7 reqs) ✓
Phase 4 [==========] Explore API Views            (5 reqs) ✓
Phase 5 [==========] Entity & Function Detail     (14 reqs) ✓
```

**Progress:** 39/39 requirements complete (100%)

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 5/5 |
| Requirements completed | 39/39 |
| Plans executed | 11 |
| Blockers encountered | 0 |
| Research phases used | 1 |

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01 | 01 | 6 min | 2 | 13 |
| 02 | 01 | 3 min | 2 | 11 |
| 02 | 02 | ~5 min | 3 | 12 |
| 03 | 01 | 2 min | 2 | 6 |
| 03 | 02 | ~25 min | 3 | 8 |
| 04 | 01 | 3 min | 3 | 5 |
| 04 | 02 | ~20 min | 2 | 9 |
| 05 | 01 | 4 min | 2 | 11 |
| 05 | 02 | 3 min | 2 | 2 |
| 05 | 03 | ~25 min | 2 | 6 |

## Accumulated Context

### Key Decisions
| Decision | Rationale | Phase |
|----------|-----------|-------|
| MiniSearch over FlexSearch | Native TS, returns docs (not IDs), 19ms init, simpler API. Speed difference irrelevant at 6K items | Research |
| Sidebar as contextual nav, not tree | Single node has 5-30 children. No virtualization needed. Breadcrumb shows full path | Research |
| Metadata outside Zustand reactive state | 4MB frozen singleton + useSyncExternalStore. Prevents deep-clone perf trap | Research |
| New `app/` directory | Clean separation from old `web/` code during development | Research |
| Desktop only for v1 | Data density makes mobile impractical. Deferred | Research |
| v1 = Explore API only | No search (Cmd+K), types view, or changelog. Ship core browsing first | Requirements |
| @tailwindcss/vite over PostCSS | Tailwind CSS 4 native Vite plugin — better integration, no config file needed | 01-01 |
| Root tsconfig.json needs paths for shadcn | shadcn CLI reads root tsconfig for alias resolution, not just tsconfig.app.json | 01-01 |
| Frozen singleton + useSyncExternalStore for metadata | 4MB metadata outside Zustand reactive state — Object.freeze() prevents mutation | 02-01 |
| Zustand status-only store | AppStatus + error string only — no metadata reference in reactive state | 02-01 |
| Map over Object for lookup maps | Sparse function IDs (1-3576 with gaps) — Map provides true O(1) without prototype chain | 02-01 |
| Background revalidation updates cache only | Prevents mid-session UI disruption from re-rendering when fresh data arrives | 02-01 |
| Custom MiniSearch tokenizer | Splits on dots/underscores so "SP.Web" → ["SP", "Web"] for better search relevance | 02-01 |
| OKLCH color space for type tokens | Perceptually uniform — dark mode adjusts lightness only, hue/chroma consistent | 02-02 |
| CSS spinner in index.html (not JS) | Zero-dependency pre-React loading, auto-removed on React mount | 02-02 |
| Header always visible during loading/error | Skeleton only replaces content area below fixed header | 02-02 |
| ChildEntry.ref union type (number/string) | Functions ref by numeric ID, nav properties by string fullName — matches lookup map key types | 03-01 |
| Root detection: undefined === empty splat | Index route has no splat param; treat undefined and "" identically for seamless / → /_api routing | 03-01 |
| isComposable controls entity resolution | Composable functions resolve to return-type entity with children; non-composable are terminal endpoints | 03-02 |
| Function-first content display | Content area prioritizes function details over entity display; entity view only for nav property navigation | 03-02 |
| Breadcrumb (...) for user-facing params only | Functions with params beyond `this` binding show (...) suffix; empty or this-only = no brackets | 03-02 |
| Root items plain text (no FN/NAV tags) | Functions at /_api root show no type tags — cleaner list when all items are functions | 03-02 |
| Max sidebar width 600px | User preferred wider max over planned 500px | 03-02 |
| Blue clickable breadcrumb segments | text-type-fn color for clickable segments distinguishes from bold non-clickable last segment | 03-02 |
| Breadcrumb in flex flow, not sticky | sticky top-14 broke inside overflow-hidden parent; normal flex flow works correctly | 03-02 |
| Contained sidebar scroll | absolute inset-0 + overflow-x-hidden overflow-y-auto inside ResizablePanel prevents page-level scrollbar | 03-02 |
| useRef for filter clear on navigation | Comparing entries reference via useRef detects navigation changes without stale closures | 04-01 |
| SidebarItem variant prop pattern | 'root' shows green `<>` on left, 'default' shows FN/NAV on right — replaces "no tags at root" decision | 04-01 |
| Filter always visible (even empty entries) | Disabled filter input + "0 elements" for consistent sidebar layout across all navigation states | 04-01 |
| Filter state lifted to ExplorePage | SidebarFilter component sits outside SidebarTransition — no slide animation on filter, stable UX | 04-02 |
| Explore API nav → /_api, not / | Clicking "Explore API" navigates to the API browser, not home. Not highlighted on home page | 04-02 |
| SP REST Explorer title is clickable Link | Header app name navigates to home (/) | 04-02 |
| Root endpoints kind mapping for recently visited | Depth-2 paths (/_api/X) recorded as kind 'root' for correct <> icon in recently visited | 04-02 |
| Recently visited icon types | root=<> green, function=ƒ blue, navProperty=NAV purple, entity type (future)=T green | 04-02 |
| ResizablePanel flex column layout | Changed from single scrollable div to flex column for filter/content separation | 04-02 |
| Content area bg-muted/30 | Subtle background distinction between sidebar (white) and content area | 04-02 |
| TypeLink pattern for all entity type references | Consistent component handles plain entities, Collection split-links, Edm.* primitives | 05-01 |
| CollapsibleSection filterSlot pattern | ReactNode prop for inline filter injection — keeps filter logic in parent | 05-01 |
| UsedByBar on-demand scan per render | Scan all entities' nav properties each render — simple, no precomputed index needed | 05-01 |
| React Router Link for entity type navigation | to="/entity/{typeName}" — hash router handles prefix, no /#/ needed | 05-01 |
| TypeLink reuse across pages | Existing TypeLink imported into ExplorePage instead of inlining — avoids duplication | 05-02 |
| Metadata stats via useMemo | Object.keys(entities) iteration for entity/property/method counts in welcome screen | 05-02 |
| COMPOSABLE badge only on return type | Removed from function name header — only shows in Methods table next to return type | 05-03 |
| Nav Properties inline filter | All three entity sections (Properties, Nav Properties, Methods) now have inline filters | 05-03 |
| h-screen contained scroll layout | Root div uses h-screen + overflow-hidden; min-h-0 on flex children; content area scrolls independently | 05-03 |
| void for empty/undefined return types | MethodsTable checks !fn.returnType before passing to TypeLink — shows italic "void" | 05-03 |
| TypeLink undefined guard | Renders italic "unknown" for undefined typeName from metadata gaps — prevents crash | 05-03 |

### Known Risks
- JSON.parse() may block main thread 200-800ms on 4MB fetch — CSS spinner in index.html as mitigation
- Zustand v5 selector instability — use scalar selectors or `useShallow`
- Tailwind CSS v4 silent default changes — use shadcn/ui CSS variables from day one
- MiniSearch tokenizer strips dots/parens — custom tokenizer needed (but search is v2)

### Todos
- (None yet — populated during phase planning)

### Blockers
- (None)

## Session Continuity

**Last session:** Execute Phase 5 (2026-02-12)
**What happened:** Executed all 3 plans across 2 waves. Plan 01: EntityDetail component suite (TypeLink, collapsible sections, tables, base type chain, used-by bar — 11 files). Plan 02: Enhanced function detail with TypeLink, Explore Types welcome screen with stats. Plan 03: Wired EntityDetail into ExplorePage and TypesPage, human verification checkpoint with 4 fixes (COMPOSABLE badge, nav props filter, void returns, contained scroll).
**Next step:** Verify Phase 5 goal achievement

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-12 (Phase 5 complete)*
