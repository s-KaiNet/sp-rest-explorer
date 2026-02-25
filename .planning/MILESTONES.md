# Milestones: SP REST API Explorer — New UI

## v2.1 Connect Frontend — Shipped 2026-02-25

**Phases:** 22-23 | **Plans:** 2 | **Tasks:** 5 | **Requirements:** 12/12 validated

Switched the frontend data source to the new backend's compressed blobs with lz-string decompression (~75% network savings, ~557KB vs ~2.2MB). Fixed three recently visited bugs by migrating to a Zustand store with persist middleware and expanding SearchSelection with granular kind types. +103/-80 lines across 7 app files in 2 days (14 commits).

**Key accomplishments:**
1. lz-string decompression wired into metadata fetch pipeline — frontend fetches compressed blob from new storage account, decompresses client-side with ~75% network savings
2. Boot guard for React StrictMode idempotency preventing double metadata fetch+decompress
3. Zustand recently-visited store with persist middleware — atomic clear across all consumers, replacing independent useState hooks
4. SearchSelection.kind expanded to granular 4-value union (`entity`/`function`/`navProperty`/`root`) — correct icons for all recently visited items
5. Boot spinner visibility and dialog animation consistency fixes

**Deferred:** CHLG-01-06 (API Changelog), ADDL-02 (CI/CD)

**Archive:** [milestones/v2.1-ROADMAP.md](milestones/v2.1-ROADMAP.md) | [milestones/v2.1-REQUIREMENTS.md](milestones/v2.1-REQUIREMENTS.md)

---

## v2.0 Backend Rework — Shipped 2026-02-24

**Phases:** 18-21 | **Plans:** 7 | **Tasks:** 17 | **Requirements:** 31/31 validated

Rewrote the Azure Functions backend from scratch — modern TypeScript Azure Functions v4 project with MSAL certificate-based auth, resilient metadata fetch pipeline, byte-identical XML-to-JSON parser, lz-string compression, simplified blob layout, and daily timer. Deployed to Azure with Key Vault-backed certificates and managed identity. ~1,016 LOC TypeScript in 2 days (16 commits).

**Key accomplishments:**
1. Azure Functions v4 backend scaffolded in `backend/` with MSAL certificate-based SharePoint auth (SHA-256 thumbprint, PEM normalization) proven end-to-end
2. Resilient metadata fetch with 3-retry exponential backoff, 429 Retry-After respect, and 60s AbortController timeout
3. MetadataParser ported from legacy (357 lines) — byte-identical JSON output verified via golden-reference TDD with vitest (10 tests)
4. Full pipeline orchestrator (fetch→parse→compress) with lz-string UTF-16 compression and shared handler for timer+HTTP triggers
5. Blob upload module writing 6 blobs per run (3 latest + 3 monthly) with Buffer.byteLength content sizing via @azure/storage-blob SDK
6. Deployed to Azure sp-rest-explorer-new with Key Vault certificates, managed identity, daily 1 AM UTC timer — 6 production blobs validated (2.2MB JSON, 3.0MB XML, 557KB compressed in 2.5s)

**Deferred:** CHLG-01-06 (API Changelog), ADDL-02 (CI/CD), FRNT-01 (frontend compression switch)

**Archive:** [milestones/v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md) | [milestones/v2.0-REQUIREMENTS.md](milestones/v2.0-REQUIREMENTS.md)

---

## v1.4 Unify Icons — Shipped 2026-02-19

**Phases:** 13-17 | **Plans:** 7 | **Tasks:** 12 | **Requirements:** 16/16 validated

Unified all type indicators across the app with a Lucide icon system. TypeIcon component renders distinct icons in designated OKLCH colors for 4 API types. Replaced all text symbols (<>, FN, NAV, T, Root pill) with consistent Lucide icons. Entity links use type-entity CSS variable color. ~24 lines net across 10 app files in 2 days (35 commits).

**Key accomplishments:**
1. TypeIcon component with Lucide icons (Box, Compass, Zap, Braces) and CSS color tokens for all 4 API types: root (green), nav property (purple), function (blue), type/entity (orange/amber)
2. Icon-first Explore API sidebar — replaced all text badges (FN, NAV, <>) with Lucide icons left of labels
3. Cross-view consistency — search modal, home page recently visited, Explore Types all use unified TypeIcon with zero remaining text symbols
4. Entity type links render in orange/amber (--type-entity) matching TypeIcon entity color instead of hardcoded emerald
5. Search modal footer hint bar split into left (Navigate) and right (Open + Close) groups

**Deferred:** CHLG-01-06 (API Changelog), ADDL-02 (CI/CD)

**Archive:** [milestones/v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md) | [milestones/v1.4-REQUIREMENTS.md](milestones/v1.4-REQUIREMENTS.md)

---

## v1.3 Improvements — Shipped 2026-02-17

**Phases:** 11-12 | **Plans:** 4 | **Tasks:** 8 | **Requirements:** 6/6 validated

Fixed search UX issues (literal dot matching, group collapse stability, path-length sort, hover feedback), corrected nullable property display logic, and relocated breadcrumb to content area. Targeted fixes that improved daily usability of existing features.

**Key accomplishments:**
1. Literal substring search for special characters (dots) bypassing MiniSearch tokenizer
2. Stable group header collapse with no layout shift (div-based headers above headingless CommandGroups)
3. Path-length sorted API endpoint results (shortest paths first)
4. Hover feedback on all search result items (bg-foreground/8 overlays)
5. Nullable property strict equality check (=== false for optional boolean)
6. Breadcrumb relocated from header to content area with scroll isolation

**Deferred:** CHLG-01-06 (API Changelog), ADDL-02 (CI/CD)

**Archive:** [milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md) | [milestones/v1.3-REQUIREMENTS.md](milestones/v1.3-REQUIREMENTS.md)

---

## v1.2 UI Improvements — Shipped 2026-02-15

**Phases:** 9-10 | **Plans:** 5 | **Tasks:** 9 | **Requirements:** 9/9 validated

Polished the UI across Explore API sidebar, home pages, and command palette. Decluttered badges, added namespace grouping, branded home screens, and fixed dark mode visual issues. ~160 lines net across 11 app files in 1 day (23 commits).

**Key accomplishments:**
1. Removed "Entity Type", "Complex Type", and "COMPOSABLE" badges from all views to declutter the UI
2. Namespace-grouped collapsible sidebar for Explore API root level (~200+ endpoints organized into groups)
3. Fixed horizontal scrollbar flickering during sidebar slide animation
4. Home page branding with inline favicon icon and hardcoded approximate stats (3.5k+ functions, 2.4k entities, 11k+ properties, 60k+ endpoints)
5. Redesigned Explore API root as centered welcome screen matching Explore Types pattern
6. Subdued dark mode borders on Cmd+K search modal and expanded recently visited with Types entries

**Deferred:** CHLG-01-06 (API Changelog), ADDL-02 (CI/CD)

**Archive:** [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md) | [milestones/v1.2-REQUIREMENTS.md](milestones/v1.2-REQUIREMENTS.md)

---

## v1.1 Search, Types & Polish — Shipped 2026-02-15

**Phases:** 6-8 (incl. 07.1, 07.2) | **Plans:** 13 | **Tasks:** 28 | **Requirements:** 13/13 validated

Added global deep search, a full Explore Types browsing surface, and quality-of-life polish to make the v1.0 foundation feel complete. ~2,460 lines added across 36 app files over 3 days (77 commits).

**Key accomplishments:**
1. Cmd+K command palette with MiniSearch-powered search across 5,779 items (2,449 entities + 3,330 API endpoints) with real-time results, keyboard navigation, and grouped display
2. BFS tree-walk indexing all reachable API endpoints with pre-computed REST paths, dual search modes (name + path), and substring matching
3. Full Explore Types browsing surface — namespace-grouped sidebar, type detail with properties, base type chain, derived types, and precomputed used-by index
4. How It Works content page, GitHub star count badge, and copy-to-clipboard breadcrumb button
5. GitHub Dark-inspired dark mode with blue-gray undertones, themed scrollbars, elevated chrome surfaces, and app-branded favicons

**Deferred:** SRCH-05 (recently visited in palette), CHLG-01-06 (API Changelog), ADDL-02 (CI/CD)

**Archive:** [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md) | [milestones/v1.1-REQUIREMENTS.md](milestones/v1.1-REQUIREMENTS.md)

---

## v1.0 MVP — Shipped 2026-02-12

**Phases:** 1-5 | **Plans:** 11 | **Tasks:** 25 | **Requirements:** 38/39 validated

Rebuilt the SharePoint REST API Metadata Explorer from Vue 2 + Webpack 3 to React 19 + Vite 7 + Tailwind CSS 4 + shadcn/ui. Delivers the Explore API view with contextual sidebar navigation, entity/function detail panels, and a curated home screen. ~8,700 LOC TypeScript across 64 files.

**Key accomplishments:**
1. React 19 + Vite 7 + Tailwind CSS 4 + shadcn/ui project with GitHub Pages deployment pipeline
2. Frozen metadata singleton with O(1) lookup Maps, MiniSearch index, and IndexedDB cache-then-revalidate boot
3. Breadcrumb + resizable sidebar navigation with directional animations and composable function routing
4. Home screen with curated endpoint cards, browse-all with filtering, and recently visited tracking
5. Entity detail with collapsible Properties/NavProperties/Methods tables, TypeLink cross-references, and inline filters
6. Function detail with typed parameters, COMPOSABLE badges, and clickable entity type links

**Deferred:** NAV-03 (copy path button), deep search (Cmd+K), Explore Types full view, API Changelog, CI/CD

**Archive:** [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) | [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md)

---
*Last updated: 2026-02-25*
