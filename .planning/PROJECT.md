# SP REST API Explorer — New UI

## What This Is

A modern rebuild of the SharePoint REST API Metadata Explorer — from Vue 2 + Webpack 3 to React 19 + Vite 7 + Tailwind CSS 4 + shadcn/ui. The app lets SharePoint developers browse and understand every endpoint in the SharePoint REST API by parsing the ~4MB `$metadata` JSON (2,449 entities, 3,528 functions, 11,967 properties). It features Cmd+K deep search across all 5,779 indexed items, contextual sidebar navigation with namespace-grouped collapsible sections, breadcrumb-driven browsing, entity/function detail panels, a full Explore Types surface, and curated home screens with branding and live stats. Unified Lucide icon system with color-coded type indicators across all views. GitHub Dark-inspired dark mode. Static SPA hosted on GitHub Pages.

## Current Milestone: v2.0 Backend Rework

**Goal:** Rewrite the Azure Functions backend from scratch — modern TypeScript, updated SDKs, simplified blob layout, client credentials auth, resilient daily timer.

**Target features:**
- New TypeScript Azure Functions project (v4 programming model) replacing `az-funcs/`
- Client credentials MSAL auth (replacing deprecated ROPC username/password flow)
- SharePoint `$metadata` XML fetch with retry logic and timeout
- XML-to-JSON parsing pipeline (xml2js, lz-string compression)
- Simplified blob storage layout: single `api-files` container with `metadata.latest.*` and monthly `<year>y_m<month>_metadata.*` snapshots
- Modern SDK stack: `@azure/storage-blob` v12, `@azure/functions` v4, current versions of msal-node, axios, xml2js, lz-string, jsondiffpatch
- Developer-friendly deployment workflow (local dev, publish to Azure)
- No diff generation (GenerateDiff function dropped entirely)

## Current State

**Shipped:** v1.4 Unify Icons (2026-02-19)
**Frontend codebase:** ~5,175 LOC TypeScript/CSS across 67 files in `app/`
**Frontend tech stack:** React 19, Vite 7, TypeScript 5.9, Zustand 5, Tailwind CSS 4, shadcn/ui, Lucide React, MiniSearch, React Router 7
**Backend codebase (legacy):** `az-funcs/` — Azure Functions v2, deprecated SDKs, ROPC auth, 2 timer functions

v1.4 unified all type indicators across the app with a Lucide icon system — TypeIcon component renders distinct icons in designated colors for root (green Box), nav properties (purple Compass), functions (blue Zap), and types/entities (orange Braces). Entity links now use the type-entity color. Search modal footer reorganized for clarity.

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

- **v1.3 (6 requirements):**
  - SRCH-05 through SRCH-08 — v1.3 (dot-handling literal search, group collapse fix, path-length sort, hover feedback)
  - DETL-01 — v1.3 (nullable property logic fix)
  - LAYT-01 — v1.3 (breadcrumb relocation to content area)

- **v1.4 (16 requirements):**
  - ICON-01 through ICON-04 — v1.4 (Lucide icon system, TypeIcon component, CSS color tokens for root/entity)
  - EAPI-01 through EAPI-04 — v1.4 (icon-first Explore API sidebar, text badges replaced)
  - XVEW-01 through XVEW-05 — v1.4 (cross-view icon consistency: search, home, Explore Types)
  - LINK-01, LINK-02 — v1.4 (entity link color change to type-entity)
  - SMOD-01 — v1.4 (search modal footer layout)

### Active

- [ ] Rewrite Azure Functions backend from scratch (new project, modern tooling)
- [ ] Client credentials MSAL auth replacing ROPC flow
- [ ] SharePoint metadata fetch with retry/timeout resilience
- [ ] XML-to-JSON parsing pipeline with lz-string compression
- [ ] Simplified blob layout: `api-files` only, monthly snapshots with 1-indexed months
- [ ] Developer deployment workflow for Azure Functions
- [ ] Drop GenerateDiff function entirely (no `diff-files` container)

### Backlog (future milestones)

- [ ] CHLG-01 through CHLG-06: API Changelog view (monthly diffs, summary stats, filter chips)
- [ ] ADDL-02: GitHub Actions CI/CD auto-deployment
- [ ] Frontend changes to consume new blob layout (if any needed)

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

Shipped v1.4 with ~5,175 LOC TypeScript/CSS across 67 files. ~24 lines net added over v1.3 (153 insertions, 129 deletions across 10 app files).
Frontend tech stack: React 19, Vite 7, TypeScript 5.9, Zustand 5, Tailwind CSS 4, shadcn/ui, Lucide React, MiniSearch, idb-keyval, React Router 7.
Data layer: frozen 4MB metadata singleton + useSyncExternalStore, pre-computed O(1) lookup Maps, BFS tree-walk endpoint indexing (~3,330 unique endpoints), MiniSearch dual indexes (name + path), type classification + used-by + derived-type indexes, IndexedDB cache with cache-then-revalidate boot.
Icon system: TypeIcon component with Record-based Lucide icon/color lookup maps, OKLCH CSS custom properties for 4 type colors with dark mode variants.
Old `web/` directory preserved as reference during development.

**Legacy backend (`az-funcs/`):**
- Azure Functions v2, TypeScript, 2 timer-triggered functions (GenerateMetadata + GenerateDiff)
- Deprecated: `azure-storage` SDK v2, ROPC auth flow, TSLint, azure-functions-pack, bluebird promisify
- Pain points: no retry/timeout, module-scope Date stale across warm starts, zero-indexed months, `context.done()` legacy pattern
- Key libs to preserve logic from: xml2js XML→JSON parser (`src/metadataParser.ts`), lz-string compression, MSAL auth (switching to client credentials)

**Known technical debt:**
- TypeLink navigates to /entity/{fullName} for all types — no entity-to-API-path resolver
- Recently visited kind mapping relies on depth heuristic (depth 2 = root)
- Legacy `az-funcs/` backend needs full rewrite (v2.0 milestone target)

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
| ApiType as minimal union type | No enums or utilities, type resolution deferred to consumers | Good |
| TypeIcon Record-based lookup maps | Cleaner than if/else, easy to extend for new types | Good |
| OKLCH chroma 0.12-0.15 for type colors | Muted/pastel appearance, consistent with existing color system | Good |
| Caller-passed apiType prop on SidebarItem | No internal kind-to-type mapping, keeps component simple | Good |
| Root icon as sole root indicator | Green Box icon replaces pill badge, reduces visual clutter | Good |
| Entity link color via CSS variable | text-type-entity handles light/dark automatically, no dual classes | Good |
| Footer hint bar justify-between | Semantic structure over spacer element, consistent Tailwind pattern | Good |
| Switch ROPC to client credentials | ROPC deprecated by Microsoft, no MFA support, service app doesn't need user context | — Pending |
| Drop GenerateDiff function | diff-files container not needed, simplifies blob layout | — Pending |
| Rewrite backend from scratch | Too many deprecated deps and patterns to incrementally migrate | — Pending |

## Constraints

- **Tech stack**: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, Lucide React, MiniSearch 7, React Router 7 (hash mode) — all locked per research
- **Hosting**: GitHub Pages — requires hash routing (`createHashRouter`), static output to `docs/`
- **Data format**: Azure Blob Storage JSON format is fixed — cannot change the metadata or diff schema
- **URL compatibility**: Hash routes must match current patterns for any bookmarked URLs
- **Bundle size**: < 500KB gzipped (current is ~300KB+)
- **Delivery**: Incremental — each phase should produce a deployable state

---
*Last updated: 2026-02-22 after v2.0 Backend Rework milestone started*
