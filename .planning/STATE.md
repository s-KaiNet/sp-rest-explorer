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
**Plan:** Plan 1 of 2 complete — next: 02-02-PLAN.md
**Status:** Executing Phase 2

```
Phase 1 [==========] Project Scaffolding          (6 reqs) ✓
Phase 2 [=====     ] Data Layer & UI Foundation   (7 reqs) ← current
Phase 3 [          ] Navigation System            (7 reqs)
Phase 4 [          ] Explore API Views            (5 reqs)
Phase 5 [          ] Entity & Function Detail     (14 reqs)
```

**Progress:** 6/39 requirements complete (15%)

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 1/5 |
| Requirements completed | 6/39 |
| Plans executed | 3 |
| Blockers encountered | 0 |
| Research phases used | 1 |

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01 | 01 | 6 min | 2 | 13 |
| 02 | 01 | 3 min | 2 | 11 |

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

**Last session:** Execute 02-01-PLAN.md (2026-02-11)
**What happened:** Built complete data layer: TypeScript types, frozen metadata singleton with useSyncExternalStore, Zustand status-only store, O(1) lookup Maps, MiniSearch index for ~6K items, IndexedDB cache with cache-then-revalidate boot orchestrator.
**Next step:** Execute 02-02-PLAN.md (UI foundation: color tokens, CodeText component, skeleton screens, error state, CSS spinner, boot integration)

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-11*
