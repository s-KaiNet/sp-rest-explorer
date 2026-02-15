# SP REST API Explorer — New UI

## What This Is

A modern rebuild of the SharePoint REST API Metadata Explorer — from Vue 2 + Webpack 3 to React 19 + Vite 7 + Tailwind CSS 4 + shadcn/ui. The app lets SharePoint developers browse and understand every endpoint in the SharePoint REST API by parsing the ~4MB `$metadata` JSON (2,449 entities, 3,528 functions, 11,967 properties). It features Cmd+K deep search across all 5,779 indexed items, contextual sidebar navigation, breadcrumb-driven browsing, entity/function detail panels, a full Explore Types surface with namespace-grouped sidebar, and a curated home screen with How It Works overview. GitHub Dark-inspired dark mode. Static SPA hosted on GitHub Pages.

## Current State

**Shipped:** v1.1 Search, Types & Polish (2026-02-15)
**Codebase:** ~5,000 LOC TypeScript/CSS across 65 files in `app/`
**Tech stack:** React 19, Vite 7, TypeScript 5.9, Zustand 5, Tailwind CSS 4, shadcn/ui, MiniSearch, React Router 7

v1.1 adds Cmd+K command palette with dual search modes (name + path), Explore Types with namespace-grouped sidebar and type detail views (properties, base types, derived types, used-by), How It Works page, copy-to-clipboard breadcrumb button, GitHub star count badge, GitHub Dark dark mode, and app-branded favicons.

## Current Milestone: v1.2 UI Improvements

**Goal:** Polish the UI across Explore API, Explore Types, home page, and command palette to fix visual bugs, improve navigation consistency, and add missing UX elements.

**Target features:**
- Fix sidebar slide animation horizontal scroll on forward navigation
- Add site icon next to title on home page
- Update home page stats to approximate values (3.5k+ functions, 2.4k entities, 11k+ properties, 60k+ endpoints)
- Expand recently visited to include /entities path and recent Types
- Fix cmdk dark mode border brightness
- Add namespace grouping to Explore API sidebar (root level only, with "No Group" first)
- Redesign Explore API home screen (similar to Explore Types — centered message, stats, help text)
- Remove "Entity Type" and "Complex Type" badges throughout the app
- Move root indicator to right side of Explore API sidebar items

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

### Active (v1.2)

- [ ] UI polish and improvements — see REQUIREMENTS.md for full scope

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

Shipped v1.1 with ~5,000 LOC TypeScript/CSS across 65 files. Total ~2,460 lines added over v1.0.
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
| cmdk via shadcn/ui CommandDialog | Fast, unstyled, accessible command menu | Good — Cmd+K working well |
| New `app/` directory | Keep old `web/` as reference during development | Good |
| Desktop only for v1 | Focus on core UX, mobile responsive deferred | Good |
| Dark mode from v1 | Trivial with shadcn/ui + Tailwind dark: variants | Good — GitHub Dark palette |
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

## Constraints

- **Tech stack**: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, MiniSearch 7, React Router 7 (hash mode) — all locked per research
- **Hosting**: GitHub Pages — requires hash routing (`createHashRouter`), static output to `docs/`
- **Data format**: Azure Blob Storage JSON format is fixed — cannot change the metadata or diff schema
- **URL compatibility**: Hash routes must match current patterns for any bookmarked URLs
- **Bundle size**: < 500KB gzipped (current is ~300KB+)
- **Delivery**: Incremental — each phase should produce a deployable state

---
*Last updated: 2026-02-15 after v1.2 milestone started*
