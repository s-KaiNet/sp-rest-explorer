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

**Phase:** 04-explore-api-views
**Plan:** Plan 1 of 2 complete
**Status:** Executing Phase 4

```
Phase 1 [==========] Project Scaffolding          (6 reqs) ✓
Phase 2 [==========] Data Layer & UI Foundation   (7 reqs) ✓
Phase 3 [==========] Navigation System            (7 reqs) ✓
Phase 4 [=====     ] Explore API Views            (5 reqs) ← current
Phase 5 [          ] Entity & Function Detail     (14 reqs)
```

**Progress:** 20/39 requirements complete (51%)

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 3/5 |
| Requirements completed | 20/39 |
| Plans executed | 7 |
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

**Last session:** Execute Phase 4 Plan 1 (2026-02-11)
**What happened:** Built Phase 4 foundation: useRecentlyVisited hook (localStorage, max 12 items, dedup by path), sidebar filter input at all navigation levels (real-time filtering, element count, auto-clear on navigation), and root endpoint green `<>` icon badges via SidebarItem variant prop.
**Next step:** Execute 04-02-PLAN.md (home screen with hero, browse-all button, recently visited grid)

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-11 (Phase 4 Plan 1 complete)*
