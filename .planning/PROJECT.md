# SP REST API Explorer — New UI

## What This Is

A modern rebuild of the SharePoint REST API Metadata Explorer — from Vue 2 + Webpack 3 to React 19 + Vite 7 + Tailwind CSS 4 + shadcn/ui. The app lets SharePoint developers browse and understand every endpoint in the SharePoint REST API by parsing the ~4MB `$metadata` JSON (2,449 entities, 3,528 functions, 11,967 properties). It features Cmd+K deep search across all 5,779 indexed items, contextual sidebar navigation with namespace-grouped collapsible sections, breadcrumb-driven browsing, entity/function detail panels, a full Explore Types surface, and curated home screens with branding and live stats. GitHub Dark-inspired dark mode. Static SPA hosted on GitHub Pages.

## Current State

**Shipped:** v1.2 UI Improvements (2026-02-15)
**Codebase:** ~5,150 LOC TypeScript/CSS across 65 files in `app/`
**Tech stack:** React 19, Vite 7, TypeScript 5.9, Zustand 5, Tailwind CSS 4, shadcn/ui, MiniSearch, React Router 7

v1.2 polished the UI with namespace-grouped Explore API sidebar, decluttered badge system, branded home page with favicon and approximate stats, redesigned Explore API welcome screen, expanded recently visited with Types entries, and subdued dark mode Cmd+K modal borders.

## Current Milestone: v1.3 Improvements

**Goal:** Fix search behavior bugs, improve search UX, fix nullable property display, and relocate Explore API breadcrumb to content area.

**Target features:**
- Fix search dot-handling so "SP.File" matches literally, not as regex
- Fix group collapse label jump and make full row clickable
- Sort API Endpoints search results by path length (shortest first)
- Add hover visual feedback and pointer cursor to search results
- Fix nullable property logic on entity detail pages
- Move Explore API breadcrumb into main content area

## Core Value

Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.

Cmd+K deep search now covers all 5,779 items (2,449 entities + 3,330 API endpoints) with name and path search modes. This is the single most important improvement over the old site which only searched root-level items (793 of 3,528 functions).

## Requirements

### Validated

- **v1.0 (38 requirements):**
  - INFRA-01 through INFRA-09 — v1.0 (project scaffolding, data layer, build pipeline)
  - NAV-01, NAV-02, NAV-04 through NAV-07 — v1.0 (breadcrumbs, sidebar, resize)
  - EXPL-01 through EXPL-05 — v1.0 (home screen, browse-all, filtering)
  - ENTD-01 through ENTD-11 — v1.0 (entity detail panels, tables, filters, type links)
  - FUNC-01 through FUNC-03 — v1.0 (function detail, typed params, COMPOSABLE)
  - UIFN-01 through UIFN-04 — v1.0 (loading, header, color system, monospace)

- **v1.1 (13 requirements):**
  - SRCH-01 through SRCH-04 — v1.1 (Cmd+K command palette, real-time search, grouped results, navigation)
  - TYPE-01 through TYPE-06 — v1.1 (Explore Types: sidebar, detail, inheritance, used-by, cross-nav, header nav)
  - NAV-03 — v1.1 (copy _api/ path to clipboard)
  - INFO-01, INFO-02 — v1.1 (How It Works page, navigation to it)

- **v1.2 (9 requirements):**
  - SIDE-01 through SIDE-04 — v1.2 (sidebar animation fix, namespace grouping, badge repositioning, recently visited Types)
  - HOME-01 through HOME-03 — v1.2 (favicon branding, approximate stats, Explore API welcome screen)
  - VISU-01, VISU-02 — v1.2 (dark mode modal borders, badge removal)

### Backlog (future milestones)

- [ ] CHLG-01 through CHLG-06: API Changelog view (monthly diffs, summary stats, filter chips)
- [ ] ADDL-02: GitHub Actions CI/CD auto-deployment

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
- Full search page / route — CommandDialog sufficient for quick-jump

## Context

Shipped v1.2 with ~5,150 LOC TypeScript/CSS across 65 files. Total ~160 lines net added over v1.1 (241 insertions, 83 deletions across 11 app files).
Tech stack: React 19, Vite 7, TypeScript 5.9, Zustand 5, Tailwind CSS 4, shadcn/ui, MiniSearch, idb-keyval, React Router 7.
Data layer: frozen 4MB metadata singleton + useSyncExternalStore, pre-computed O(1) lookup Maps, BFS tree-walk endpoint indexing (~3,330 unique endpoints), MiniSearch dual indexes (name + path), type classification + used-by + derived-type indexes, IndexedDB cache with cache-then-revalidate boot.
Old `web/` directory preserved as reference during development.

**Known technical debt:**
- TypeLink navigates to /entity/{fullName} for all types — no entity-to-API-path resolver
- Recently visited kind mapping relies on depth heuristic (depth 2 = root)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MiniSearch over FlexSearch | Native TS, returns full docs, faster init (19ms), simpler API | Good |
| Sidebar as contextual nav, not tree | Single node has 5-30 children, no virtualization needed | Good |
| cmdk via shadcn/ui CommandDialog | Fast, unstyled, accessible command menu | Good |
| New `app/` directory | Keep old `web/` as reference during development | Good |
| Desktop only for v1 | Focus on core UX, mobile responsive deferred | Good |
| Dark mode from v1 | Trivial with shadcn/ui + Tailwind dark: variants | Good |
| Metadata outside Zustand | Frozen 4MB singleton + useSyncExternalStore | Good |
| @tailwindcss/vite over PostCSS | Tailwind CSS 4 native Vite plugin | Good |
| OKLCH color space for type tokens | Perceptually uniform, dark mode adjusts lightness only | Good |
| Composable function routing | Composable -> entity children, non-composable -> terminal | Good |
| TypeLink for all entity references | Consistent cross-linking component | Good |
| Contained scroll layout | h-screen + overflow-hidden + independent scrolling | Good |
| BFS tree-walk for endpoint indexing | Comprehensive coverage of ~62K reachable paths, ~3,330 unique | Good |
| Substring matching for path search | MiniSearch tokenization didn't work for path segments | Good |
| Type classification heuristic | Complex = no nav props AND no function IDs AND not Collection | Good |
| Precomputed used-by index | O(1) lookup replacing O(n*m) scans | Good |
| GitHub Dark palette for dark mode | Blue OKLCH undertones, elevated chrome surfaces | Good |
| Hardcoded How It Works stats | Simpler than computing from live metadata | Good |
| Replicated TypesSidebar pattern | Different data types (EntityType[] vs ChildEntry[]) make sharing awkward | Good |
| Namespace from entry.name not returnType | returnType caused 74% of items to land in wrong groups | Good |
| Hardcoded home stats, live API stats | Home page needs instant render (no data), API page has data loaded | Good |
| Scoped --modal-border CSS variable | Per-modal dark mode border control without global side effects | Good |

## Constraints

- **Tech stack**: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, MiniSearch 7, React Router 7 (hash mode) — all locked per research
- **Hosting**: GitHub Pages — requires hash routing (`createHashRouter`), static output to `docs/`
- **Data format**: Azure Blob Storage JSON format is fixed — cannot change the metadata or diff schema
- **URL compatibility**: Hash routes must match current patterns for any bookmarked URLs
- **Bundle size**: < 500KB gzipped (current is ~300KB+)
- **Delivery**: Incremental — each phase should produce a deployable state

---
*Last updated: 2026-02-17 after v1.3 milestone start*
