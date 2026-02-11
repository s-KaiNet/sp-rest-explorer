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

**Phase:** 01-project-scaffolding (complete)
**Plan:** Plan 2 of 2 complete — phase done
**Status:** Phase 1 complete, ready for Phase 2

```
Phase 1 [==========] Project Scaffolding          (6 reqs) ✓ complete
Phase 2 [          ] Data Layer & UI Foundation   (7 reqs) ← next
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
| Plans executed | 2 |
| Blockers encountered | 0 |
| Research phases used | 0 |

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01 | 01 | 6 min | 2 | 13 |
| 01 | 02 | 10 min | 3 | 17 |

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
| Grid header layout (1fr auto 1fr) | Keeps search centered regardless of left/right content width | 01-02 |
| Anti-flash inline script in index.html | Reads localStorage before React hydrates to prevent wrong-theme flash | 01-02 |
| Scoped dark mode transition (body/header/main) | Avoids animating unrelated hover states while providing smooth theme switching | 01-02 |

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

**Last session:** Execute 01-02-PLAN.md (2026-02-11)
**What happened:** Built complete app shell: React Router 7 HashRouter with all routes, styled Header with nav/search/dark mode/GitHub, ThemeProvider with system preference + localStorage, placeholder pages, 404. Visual verification approved.
**Next step:** Plan/execute Phase 2 (Data Layer & UI Foundation — metadata fetching, Zustand, MiniSearch, lookup maps)

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-11*
