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

**Phase:** 01-project-scaffolding
**Plan:** Plan 1 of 2 complete — next: 01-02-PLAN.md
**Status:** Executing Phase 1

```
Phase 1 [==        ] Project Scaffolding          (6 reqs) ← current
Phase 2 [ ] Data Layer & UI Foundation   (7 reqs)
Phase 3 [ ] Navigation System            (7 reqs)
Phase 4 [ ] Explore API Views            (5 reqs)
Phase 5 [ ] Entity & Function Detail     (14 reqs)
```

**Progress:** 0/39 requirements complete (0%)

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 0/5 |
| Requirements completed | 0/39 |
| Plans executed | 1 |
| Blockers encountered | 0 |
| Research phases used | 0 |

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 01 | 01 | 6 min | 2 | 13 |

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

**Last session:** Execute 01-01-PLAN.md (2026-02-11)
**What happened:** Scaffolded Vite 7 + React 19 + TypeScript 5.9 project in app/ with Tailwind CSS 4 and shadcn/ui. Build outputs to docs/ for GitHub Pages.
**Next step:** Execute 01-02-PLAN.md (React Router, Header, dark mode, placeholder pages)

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-11*
