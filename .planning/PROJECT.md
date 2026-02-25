# SP REST API Explorer — New UI

## What This Is

A modern rebuild of the SharePoint REST API Metadata Explorer — from Vue 2 + Webpack 3 to React 19 + Vite 7 + Tailwind CSS 4 + shadcn/ui. The app lets SharePoint developers browse and understand every endpoint in the SharePoint REST API by parsing the ~4MB `$metadata` JSON (2,449 entities, 3,528 functions, 11,967 properties). It features Cmd+K deep search across all 5,779 indexed items, contextual sidebar navigation with namespace-grouped collapsible sections, breadcrumb-driven browsing, entity/function detail panels, a full Explore Types surface, and curated home screens with branding and live stats. Unified Lucide icon system with color-coded type indicators across all views. GitHub Dark-inspired dark mode. Static SPA hosted on GitHub Pages.

The backend is a clean-room Azure Functions v4 rewrite (`backend/`) replacing the legacy `az-funcs/` — MSAL certificate-based auth, resilient metadata fetch, byte-identical XML-to-JSON parser, lz-string compression, and simplified blob layout. Runs daily on Azure, producing 6 blobs. The frontend fetches the compressed blob (~557KB) and decompresses client-side with lz-string for ~75% network savings over the uncompressed 2.2MB JSON.

## Current State

**Shipped:** v2.1 Connect Frontend (2026-02-25)
**Frontend codebase:** ~5,198 LOC TypeScript/CSS across 68 files in `app/`
**Backend codebase:** ~1,016 LOC TypeScript across 15 source files in `backend/src/`
**Frontend tech stack:** React 19, Vite 7, TypeScript 5.9, Zustand 5 (with persist), Tailwind CSS 4, shadcn/ui, Lucide React, MiniSearch, lz-string, React Router 7
**Backend tech stack:** Azure Functions v4, TypeScript 5.7, MSAL Node 2, @azure/storage-blob 12, axios, xml2js, lz-string, vitest

v2.1 connected the frontend to the new backend's compressed blobs. The metadata fetch pipeline now downloads ~557KB instead of ~2.2MB, decompressing client-side with lz-string. Recently visited was migrated to a Zustand store with persist middleware for atomic state management across all consumers. The full stack (backend + frontend) is now running on the new infrastructure.

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

- **v2.0 (31 requirements):**
  - PROJ-01 through PROJ-03 — v2.0 (project scaffolding, TypeScript strict, deps pinned)
  - AUTH-01, AUTH-02 — v2.0 (MSAL certificate auth, env var config)
  - FTCH-01 through FTCH-04 — v2.0 (metadata fetch, retry, 429 handling, timeout)
  - PROC-01 through PROC-04 — v2.0 (byte-identical parser, interfaces, compact JSON, lz-string compression)
  - BLOB-01 through BLOB-08 — v2.0 (6 blobs, container auto-create, content-type headers)
  - OPS-01 through OPS-07 — v2.0 (daily timer, configurable CRON, fresh Date, structured logging, HTTP trigger, retry policy, all-or-nothing)
  - DEPL-01 through DEPL-03 — v2.0 (build, deploy, funcignore)

- **v2.1 (12 requirements):**
  - DSRC-01, DSRC-02 — v2.1 (frontend data source switch to new compressed blob)
  - DCMP-01 through DCMP-05 — v2.1 (lz-string decompression, boot pipeline, cache, revalidation)
  - RVIS-01 through RVIS-05 — v2.1 (recently visited atomic clear, correct icons, Zustand persist store, granular kind type)

### Active

*(No active milestone — planning next)*

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

Shipped v2.1 Connect Frontend. Combined codebase: ~6,214 LOC TypeScript across `app/` (frontend) and `backend/` (Azure Functions).
Frontend tech stack: React 19, Vite 7, TypeScript 5.9, Zustand 5 (with persist), Tailwind CSS 4, shadcn/ui, Lucide React, MiniSearch, lz-string, idb-keyval, React Router 7.
Backend tech stack: Azure Functions v4, TypeScript 5.7, MSAL Node 2.16, @azure/storage-blob 12.31, axios 1.7, xml2js 0.6, lz-string 1.5, vitest 4.0.
Data layer: frozen 4MB metadata singleton + useSyncExternalStore, pre-computed O(1) lookup Maps, BFS tree-walk endpoint indexing (~3,330 unique endpoints), MiniSearch dual indexes (name + path), type classification + used-by + derived-type indexes, IndexedDB cache with cache-then-revalidate boot. Frontend fetches compressed blob (~557KB) and decompresses with lz-string (~75% network savings).
Icon system: TypeIcon component with Record-based Lucide icon/color lookup maps, OKLCH CSS custom properties for 4 type colors with dark mode variants.
Recently visited: Zustand persist store with granular SearchSelection.kind (`entity`/`function`/`navProperty`/`root`), atomic clear, correct icon mapping.
Backend pipeline: auth → fetch (retry/backoff/timeout) → parse (xml2js) → compress (lz-string) → upload (6 blobs to `api-files` container).
Legacy `az-funcs/` preserved as reference. Legacy `web/` preserved as reference.

**Known technical debt:**
- TypeLink navigates to /entity/{fullName} for all types — no entity-to-API-path resolver
- Legacy `az-funcs/` directory can be removed now that `backend/` is deployed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MiniSearch over FlexSearch | Native TS, returns full docs, faster init (19ms), simpler API | ✓ Good |
| Sidebar as contextual nav, not tree | Single node has 5-30 children, no virtualization needed | ✓ Good |
| cmdk via shadcn/ui CommandDialog | Fast, unstyled, accessible command menu | ✓ Good |
| New `app/` directory | Keep old `web/` as reference during development | ✓ Good |
| Desktop only for v1 | Focus on core UX, mobile responsive deferred | ✓ Good |
| Dark mode from v1 | Trivial with shadcn/ui + Tailwind dark: variants | ✓ Good |
| Metadata outside Zustand | Frozen 4MB singleton + useSyncExternalStore | ✓ Good |
| @tailwindcss/vite over PostCSS | Tailwind CSS 4 native Vite plugin | ✓ Good |
| OKLCH color space for type tokens | Perceptually uniform, dark mode adjusts lightness only | ✓ Good |
| Composable function routing | Composable -> entity children, non-composable -> terminal | ✓ Good |
| TypeLink for all entity references | Consistent cross-linking component | ✓ Good |
| Contained scroll layout | h-screen + overflow-hidden + independent scrolling | ✓ Good |
| BFS tree-walk for endpoint indexing | Comprehensive coverage of ~62K reachable paths, ~3,330 unique | ✓ Good |
| Substring matching for path search | MiniSearch tokenization didn't work for path segments | ✓ Good |
| Type classification heuristic | Complex = no nav props AND no function IDs AND not Collection | ✓ Good |
| Precomputed used-by index | O(1) lookup replacing O(n*m) scans | ✓ Good |
| GitHub Dark palette for dark mode | Blue OKLCH undertones, elevated chrome surfaces | ✓ Good |
| Hardcoded How It Works stats | Simpler than computing from live metadata | ✓ Good |
| Replicated TypesSidebar pattern | Different data types (EntityType[] vs ChildEntry[]) make sharing awkward | ✓ Good |
| Namespace from entry.name not returnType | returnType caused 74% of items to land in wrong groups | ✓ Good |
| Hardcoded home stats, live API stats | Home page needs instant render (no data), API page has data loaded | ✓ Good |
| Scoped --modal-border CSS variable | Per-modal dark mode border control without global side effects | ✓ Good |
| ApiType as minimal union type | No enums or utilities, type resolution deferred to consumers | ✓ Good |
| TypeIcon Record-based lookup maps | Cleaner than if/else, easy to extend for new types | ✓ Good |
| OKLCH chroma 0.12-0.15 for type colors | Muted/pastel appearance, consistent with existing color system | ✓ Good |
| Caller-passed apiType prop on SidebarItem | No internal kind-to-type mapping, keeps component simple | ✓ Good |
| Root icon as sole root indicator | Green Box icon replaces pill badge, reduces visual clutter | ✓ Good |
| Entity link color via CSS variable | text-type-entity handles light/dark automatically, no dual classes | ✓ Good |
| Footer hint bar justify-between | Semantic structure over spacer element, consistent Tailwind pattern | ✓ Good |
| Switch ROPC to client credentials | ROPC deprecated by Microsoft, no MFA support, service app doesn't need user context | ✓ Good |
| Drop GenerateDiff function | diff-files container not needed, simplifies blob layout | ✓ Good |
| Rewrite backend from scratch | Too many deprecated deps and patterns to incrementally migrate | ✓ Good |
| `backend/` directory name | Clearer separation from frontend `app/` | ✓ Good |
| MSAL thumbprintSha256 | Modern API over deprecated thumbprint property | ✓ Good |
| Single interfaces.ts for all types | Reduces import complexity for 7 related metadata types | ✓ Good |
| Async function parser over class | Cleaner API, no stateful coupling, easier testing | ✓ Good |
| Vitest as test runner | TypeScript-native, zero config, fast | ✓ Good |
| Shared handler for timer+HTTP | Single orchestration source, no duplication | ✓ Good |
| Key Vault for PEM certificates | Azure app settings mangle multiline values | ✓ Good |
| Managed identity for Key Vault | No secrets to rotate or leak | ✓ Good |
| Buffer.byteLength for blob uploads | Critical for multi-byte lz-string UTF-16 output | ✓ Good |
| Pure buildBlobList() function | Testable without Azure SDK mocking | ✓ Good |
| decompressFromUTF16 named import | Matches backend compressToUTF16 convention | ✓ Good |
| Fetch-as-text then decompress pipeline | Compressed blob is not valid JSON, can't use .json() | ✓ Good |
| Module-level boot promise guard | Prevents StrictMode double-mount duplicate fetch+decompress | ✓ Good |
| Zustand persist v2 with wipe migration | Simpler than migrating buggy old localStorage entries | ✓ Good |
| Granular kind at source (CommandPalette) | Eliminates lossy kindMap remapping, kind correct from selection | ✓ Good |

## Constraints

- **Frontend tech stack**: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, Lucide React, MiniSearch 7, React Router 7 (hash mode) — all locked per research
- **Backend tech stack**: Azure Functions v4, TypeScript 5.7, MSAL Node 2, @azure/storage-blob 12, axios, xml2js, lz-string — locked per v2.0
- **Hosting**: GitHub Pages (frontend) — requires hash routing, static output to `docs/`
- **Backend hosting**: Azure Functions (sp-rest-explorer-new) — daily timer + HTTP trigger
- **Data format**: Azure Blob Storage JSON format is fixed — cannot change the metadata schema
- **URL compatibility**: Hash routes must match current patterns for any bookmarked URLs
- **Bundle size**: < 500KB gzipped (current is ~300KB+)
- **Delivery**: Incremental — each phase should produce a deployable state

---
*Last updated: 2026-02-25 after v2.1 milestone*
