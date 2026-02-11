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

**Phase:** 02-data-layer-ui-foundation
**Plan:** Plan 2 of 2 complete — phase complete
**Status:** Phase 2 complete, ready for Phase 3

```
Phase 1 [==========] Project Scaffolding          (6 reqs) ✓
Phase 2 [==========] Data Layer & UI Foundation   (7 reqs) ✓
Phase 3 [          ] Navigation System            (7 reqs) ← next
Phase 4 [          ] Explore API Views            (5 reqs)
Phase 5 [          ] Entity & Function Detail     (14 reqs)
```

**Progress:** 13/39 requirements complete (33%)

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 2/5 |
| Requirements completed | 13/39 |
| Plans executed | 4 |
| Blockers encountered | 0 |
| Research phases used | 1 |

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01 | 01 | 6 min | 2 | 13 |
| 02 | 01 | 3 min | 2 | 11 |
| 02 | 02 | ~5 min | 3 | 12 |

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

### Known Risks
- JSON.parse() may block main thread 200-800ms on 4MB fetch — CSS spinner in index.html as mitigation
- Zustand v5 selector instability — use scalar selectors or `useShallow`
- Tailwind CSS v4 silent default changes — use shadcn/ui CSS variables from day one
- MiniSearch tokenizer strips dots/parens — custom tokenizer needed (but search is v2)
- react-arborist contextual sidebar is non-standard pattern — may need simpler custom list

### Todos
- (None yet — populated during phase planning)

### Blockers
- (None)

## Session Continuity

**Last session:** Execute 02-02-PLAN.md (2026-02-11)
**What happened:** Built UI foundation: OKLCH color tokens for type system (fn/entity/nav), CodeText component, ContentSkeleton and ErrorState components, CSS spinner in index.html, and wired App.tsx to boot metadata on mount with status-driven rendering. Human-verified loading flow, dark mode, error handling, and retry.
**Next step:** Plan Phase 3 (Navigation System: sidebar, breadcrumbs, routing)

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-11*
