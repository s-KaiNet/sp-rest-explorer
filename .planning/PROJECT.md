# SP REST API Explorer — New UI

## What This Is

A modern rebuild of the SharePoint REST API Metadata Explorer — from Vue 2 + Webpack 3 to React 19 + Vite 7 + Tailwind CSS 4 + shadcn/ui. The app lets SharePoint developers browse and understand every endpoint in the SharePoint REST API by parsing the ~4MB `$metadata` JSON (2,449 entities, 3,528 functions, 11,967 properties). It features contextual sidebar navigation, breadcrumb-driven browsing, entity/function detail panels with collapsible sections and type cross-linking, and a curated home screen. Static SPA hosted on GitHub Pages.

## Current State

**Shipped:** v1.0 MVP (2026-02-12)
**Codebase:** ~8,700 LOC TypeScript across 64 files in `app/`
**Tech stack:** React 19, Vite 7, TypeScript 5.9, Zustand 5, Tailwind CSS 4, shadcn/ui, MiniSearch, React Router 7

v1.0 delivers the complete Explore API view: home screen with stats and browse-all, resizable sidebar navigation with breadcrumbs and directional animations, entity detail with Properties/NavProperties/Methods tables and TypeLink cross-references, and function detail with typed parameters and COMPOSABLE badges. Dark mode, loading skeletons, and IndexedDB caching are all in place.

## Core Value

Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.

The current site only searches root-level items (793 of 3,528 functions). The rebuild's deep search across all levels is the single most important improvement. (Note: Cmd+K deep search is built in the data layer but the UI is deferred to v2.)

## Requirements

### Validated

- **v1.0 (38 requirements):**
- INFRA-01 through INFRA-09 — v1.0 (project scaffolding, data layer, build pipeline)
- NAV-01, NAV-02, NAV-04 through NAV-07 — v1.0 (breadcrumbs, sidebar, resize)
- EXPL-01 through EXPL-05 — v1.0 (home screen, browse-all, filtering)
- ENTD-01 through ENTD-11 — v1.0 (entity detail panels, tables, filters, type links)
- FUNC-01 through FUNC-03 — v1.0 (function detail, typed params, COMPOSABLE)
- UIFN-01 through UIFN-04 — v1.0 (loading, header, color system, monospace)

### Active

- [ ] NAV-03: Copy `_api/...` path to clipboard via breadcrumb button (deferred from v1.0)
- [ ] SRCH-01 through SRCH-05: Cmd+K command palette for global deep search
- [ ] TYPE-01 through TYPE-06: Explore Types full view (virtualized list, detail, base type chain, used-by, jump links)
- [ ] CHLG-01 through CHLG-06: API Changelog view (monthly diffs, summary stats, filter chips)
- [ ] ADDL-01: Recently visited section on home screen (partially done — hook exists, cards on home exist)
- [ ] ADDL-02: GitHub Actions CI/CD auto-deployment
- [ ] ADDL-03: How It Works static page with architecture diagram

### Out of Scope

- "Try It" / API Playground — static SPA, no backend, no SharePoint auth
- Code sample generation — metadata has no HTTP methods or request bodies
- AI-powered search / chat — MiniSearch is better for structured metadata search
- User accounts / personalization — no backend, localStorage sufficient
- Mobile-optimized UX — desktop only, data density makes mobile impractical
- Full-tree visualization / graph — 2,449 entities = unreadable hairball
- Inline editing of metadata — read-only viewer
- Multiple API versions — SharePoint has one metadata at any time
- PnPjs code snippet generation — high value but requires mapping logic, consider post-launch

## Context

Shipped v1.0 with ~8,700 LOC TypeScript across 64 files.
Tech stack: React 19, Vite 7, TypeScript 5.9, Zustand 5, Tailwind CSS 4, shadcn/ui, MiniSearch, idb-keyval, React Router 7.
Data layer: frozen 4MB metadata singleton + useSyncExternalStore, pre-computed O(1) lookup Maps, MiniSearch index with ~6K items, IndexedDB cache with cache-then-revalidate boot.
Old `web/` directory preserved as reference during development.

**Known technical debt:**
- UsedByBar scans all entities on every render (no precomputed index)
- Recently visited kind mapping relies on depth heuristic (depth 2 = root)
- Search placeholder shown but Cmd+K not functional yet
- NAV-03 copy button not implemented

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MiniSearch over FlexSearch | Native TS, returns full docs, faster init (19ms), simpler API | Good — working well, ~6K items indexed |
| Sidebar as contextual nav, not tree | Single node has 5-30 children, no virtualization needed | Good — clean UX, breadcrumbs provide path context |
| Remove namespace filter dialog | Cmd+K deep search makes filtering obsolete | Pending — Cmd+K not yet built |
| cmdk via shadcn/ui CommandDialog | Fast, unstyled, accessible command menu | Pending — not yet implemented |
| New `app/` directory | Keep old `web/` as reference during development | Good — clean separation |
| Desktop only for v1 | Focus on core UX, mobile responsive deferred | Good — desktop data density works well |
| Skip analytics for v1 | Ship core functionality first | Good — no overhead during development |
| Dark mode in v1 | Trivial with shadcn/ui + Tailwind dark: variants | Good — immediate polish, user verified |
| GitHub Actions deployment | Replaces manual `npm run docs` + commit | Pending — not yet implemented |
| Metadata outside Zustand | Frozen 4MB singleton + useSyncExternalStore | Good — no deep-clone perf issues |
| @tailwindcss/vite over PostCSS | Tailwind CSS 4 native Vite plugin | Good — faster builds, no config file |
| OKLCH color space for type tokens | Perceptually uniform, dark mode adjusts lightness only | Good — consistent across themes |
| Composable function routing | Composable -> entity children, non-composable -> terminal | Good — correct API semantics |
| TypeLink for all entity references | Consistent cross-linking component | Good — reused across all pages |
| Contained scroll layout | h-screen + overflow-hidden + independent scrolling | Good — no full-page scroll issues |

## Constraints

- **Tech stack**: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, MiniSearch 7, React Router 7 (hash mode) — all locked per research
- **Hosting**: GitHub Pages — requires hash routing (`createHashRouter`), static output to `docs/`
- **Data format**: Azure Blob Storage JSON format is fixed — cannot change the metadata or diff schema
- **URL compatibility**: Hash routes must match current patterns for any bookmarked URLs
- **Bundle size**: < 500KB gzipped (current is ~300KB+)
- **Delivery**: Incremental — each phase should produce a deployable state

---
*Last updated: 2026-02-12 after v1.0 milestone*
