# SP REST API Explorer — New UI

## What This Is

A complete rebuild of the SharePoint REST API Metadata Explorer from Vue 2 + Webpack 3 to React 19 + Vite 6. The app lets SharePoint developers browse, search, and understand every endpoint in the SharePoint REST API by parsing the ~4MB `$metadata` JSON (2,449 entities, 3,528 functions, 11,967 properties). It's a static SPA hosted on GitHub Pages.

## Core Value

Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.

The current site only searches root-level items (793 of 3,528 functions). The rebuild's deep search across all levels is the single most important improvement.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Rebuild from Vue 2 / Webpack 3 / Element UI to React 19 / Vite 6 / Tailwind 4 / shadcn/ui
- [ ] Deep search via Cmd+K command palette (MiniSearch) across all ~6,000+ items at all tree levels
- [ ] Contextual sidebar navigation showing children of the currently selected node
- [ ] Breadcrumb-driven navigation with clickable path segments and copy-path button
- [ ] Explore API view: home screen with popular endpoints + browsing with sidebar + detail panels
- [ ] Explore Types view: virtualized list of 2,449 entity types with full detail (properties, nav props, methods, base type chain, "used by" cross-references)
- [ ] API Changelog view: monthly diffs with summary stats, filter chips (added/updated/removed), collapsible entity cards
- [ ] How It Works: static page with CSS-based architecture diagram, stats, and callouts
- [ ] Dark mode with localStorage preference toggle
- [ ] GitHub Actions CI/CD deployment (replacing manual `docs/` build)
- [ ] All existing URL patterns preserved (hash routing: `/#/_api/...`, `/#/entity/...`, `/#/api-diff/...`)
- [ ] Filter preferences persist in localStorage
- [ ] No deep-cloning of metadata — immutable store with `useMemo` derived views

### Out of Scope

- Mobile-optimized UX — desktop only for v1, mobile later
- Analytics (Google Analytics / Application Insights) — add after core functionality works
- Namespace filter dialog — replaced entirely by Cmd+K deep search
- Azure Functions changes — metadata JSON format stays unchanged
- Data pipeline changes — the Azure Blob Storage source and structure remain as-is

## Context

**Current architecture:** Vue 2.5.2 app with Webpack 3, TypeScript 2.7, Element UI 2.2.2, Vuex. Metadata fetched from Azure Blob Storage on load. Filtering deep-clones the entire 4MB JSON via `JSON.parse(JSON.stringify())` and only processes root-level functions. Tree is Element UI `el-tree` with brute-force destroy/recreate on filter changes. No virtualization. No CI/CD.

**Data source:** `https://sprestapiexplorer.blob.core.windows.net/` — metadata JSON and monthly diff JSONs produced by Azure Functions in `az-funcs/` directory.

**Data scale:**
- ~2,449 entities (SP.Web, SP.List, etc.)
- ~3,528 functions (793 root, 2,735 non-root/bindable)
- ~515 navigation properties across 162 entities
- ~11,967 total properties
- Tree depth up to 9 levels with recursive entity references (SP.User -> Groups -> Users -> ...)

**Existing research:** Detailed technical research with UI/UX design specs and static HTML mockups in `.planning/phases/1-rebuild-ui/1-RESEARCH.md` and `.planning/phases/1-rebuild-ui/mockups/`.

**New app location:** `app/` directory (keeping `web/` as reference during development).

## Constraints

- **Tech stack**: React 19, Vite 6, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, react-arborist, MiniSearch 7, cmdk, React Router 7 (hash mode), @tanstack/react-table — all locked per research
- **Hosting**: GitHub Pages — requires hash routing (`createHashRouter`), static output to `docs/`
- **Data format**: Azure Blob Storage JSON format is fixed — cannot change the metadata or diff schema
- **URL compatibility**: Hash routes must match current patterns for any bookmarked URLs
- **Bundle size**: < 500KB gzipped (current is ~300KB+)
- **Delivery**: Incremental — each phase should produce a deployable state

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MiniSearch over FlexSearch | Native TS, returns full docs (not just IDs), faster init (19ms vs 120ms), simpler API. At 6K items both are ~1ms search — speed difference irrelevant | — Pending |
| Sidebar as contextual nav, not tree | Single node has 5-30 children vs 793 root items. No virtualization needed. Breadcrumb shows full path | — Pending |
| Remove namespace filter dialog | Cmd+K deep search makes filtering obsolete. Users find what they need directly | — Pending |
| cmdk via shadcn/ui CommandDialog | Fast, unstyled, accessible command menu. Groups results by type with path breadcrumbs for disambiguation | — Pending |
| New `app/` directory | Keep old `web/` as reference during development. Clean separation | — Pending |
| Desktop only for v1 | Focus on core UX. Mobile responsive layout deferred to future milestone | — Pending |
| Skip analytics for v1 | Ship core functionality first. GA/App Insights added after launch | — Pending |
| Dark mode in v1 | Trivial with shadcn/ui + Tailwind dark: variants. Adds immediate polish | — Pending |
| GitHub Actions deployment | Replaces manual `npm run docs` + commit. Automatic on push to main | — Pending |

---
*Last updated: 2026-02-11 after initialization*
