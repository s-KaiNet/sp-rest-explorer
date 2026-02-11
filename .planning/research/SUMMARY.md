# Project Research Summary

**Project:** SP REST API Explorer — Complete Rebuild
**Domain:** Data-heavy static SPA — API metadata schema browser
**Researched:** 2026-02-11
**Confidence:** HIGH

## Executive Summary

The SP REST API Explorer is a **read-only metadata schema browser** — not an API docs generator. It visualizes SharePoint's `$metadata` OData schema (2,449 entities, 3,528 functions, 11,967 properties) as a navigable tree with deep search. The rebuild migrates from Vue 2 + Webpack 3 to React 19 + Vite 7 + Tailwind CSS 4, deployed as a static SPA on GitHub Pages. The recommended stack is fully verified: all 15+ libraries have confirmed React 19 / Vite 7 peer dependency compatibility, and the architecture pattern (frozen metadata singleton + Zustand for UI-only state + MiniSearch on main thread) is well-supported by official docs. This is a greenfield rebuild, not a migration — there's no incremental porting of Vue components.

The critical technical challenge is handling ~4MB of metadata JSON that drives everything: a recursive entity graph with 9 levels of depth and cyclic references (entities referencing each other via navigation properties). The architecture solves this with three key decisions: (1) metadata stored as an `Object.freeze()`-ed module singleton outside React's render cycle, (2) an iterative DFS tree walk with cycle detection that builds a ~6K-item search index at startup in ~19ms, and (3) lazy child computation for the tree UI so only expanded nodes are ever resolved. MiniSearch stays on the main thread — 19ms index build is well under the 50ms jank threshold, and the non-transferable nature of MiniSearch instances makes Web Workers counterproductive.

The primary risks are: (1) `JSON.parse()` blocking the main thread for 200-800ms on the 4MB fetch — mitigated with either a Web Worker or a CSS-only spinner in `index.html`, (2) Zustand v5's strict selector reference equality causing infinite re-render loops — mitigated by using scalar selectors or `useShallow`, and (3) Tailwind CSS v4 silent default changes (border colors, ring widths) breaking styling without warnings — mitigated by using shadcn/ui's CSS variable architecture from day one. All 16 identified pitfalls map to Phase 1 (foundation), meaning the hardest decisions are upfront and the later phases build on proven patterns.

## Key Findings

### Recommended Stack

The entire stack is verified at current-latest versions with full compatibility. No version conflicts exist. See [STACK.md](./STACK.md) for complete details.

**Core technologies:**
- **React 19.2.x**: UI framework — concurrent features, `use()` API for Suspense-based data loading
- **Vite 7.x**: Build tool — native ESM, fast HMR, Rollup production bundling (updated from originally-planned Vite 6)
- **TypeScript 5.9.x**: Type safety — strict mode catches React 19 ref callback pitfalls at compile time
- **Zustand 5.0.x**: State management — 2KB, hook-based, persist middleware for user preferences. UI state only; metadata lives outside the store
- **Tailwind CSS 4.x**: Styling — CSS-first config via `@tailwindcss/vite` plugin, zero runtime, `dark:` variants via CSS custom properties
- **React Router 7.x**: Routing — `createHashRouter` in library mode (not framework mode) for GitHub Pages compatibility
- **shadcn/ui 3.8.x**: Component system — copy-paste source files using Radix primitives, fully Tailwind v4 compatible

**Feature libraries (all React 19 compatible):**
- **react-arborist 3.4.x**: Virtualized tree view with lazy children, built on react-window
- **MiniSearch 7.2.x**: Full-text search — ~19ms index build, ~1ms queries, prefix + fuzzy + field boosting
- **cmdk 1.1.x**: Cmd+K command palette — fast, accessible, unstyled (shadcn/ui wraps it)
- **@tanstack/react-table 8.x**: Headless sortable/filterable data tables for entity detail views
- **@tanstack/react-virtual 3.x**: List virtualization for the 2,449-item Types list
- **react-resizable-panels 4.x**: Resizable sidebar panels, keyboard accessible

**Critical version note:** Vite 7 requires Node.js 20.19+ or 22.12+. GitHub Actions should use `node-version: 22`.

### Expected Features

The product is a **metadata schema browser**, not an interactive API docs tool. Features like "Try It" consoles, code sample generation, and AI-powered search are anti-features. See [FEATURES.md](./FEATURES.md) for complete analysis.

**Must have (table stakes) — users assume these exist:**
- **T1: Full-text search** (Cmd+K) across all 9 tree levels — THE core improvement over old app
- **T2: Type cross-linking** — clicking `SP.List` navigates to that type's detail
- **T3: Breadcrumb navigation** — shows current position in 9-level hierarchy
- **T4: Deep linking / permalinks** — hash routes for every item, shareable in PRs/Slack
- **T5: Copy API path** — developers paste `_api/web/Lists/GetByTitle(...)` into code
- **T6-T12**: Keyboard nav, dark mode, fast load, resizable panels, collapsible sections with counts, in-section filtering, skeleton loading states

**Should have (competitive differentiators):**
- **D1: "Used by" reverse cross-references** — shows which entities reference a given type (unique — no competitor has this)
- **D2: Base type inheritance chain** — `SP.List → SP.SecurableObject → SP.ClientObject` lineage
- **D3: Monthly API changelog** with visual diffs — unique feature, data already exists
- **D4: Grouped search results** with path disambiguation — critical when 15+ items share the same name
- **D5-D9**: Popular endpoints home screen, recent history, function signatures, contextual sidebar, section jump links

**Defer to v1.x/v2+:**
- D10: PnPjs code snippet generation (needs usage data first)
- D12: Enum/complex type expansion (needs metadata investigation)
- Gap 6: Offline PWA support (low priority, easy to add later)

### Architecture Approach

The architecture separates **immutable data** (metadata, lookup maps, search index) from **reactive UI state** (search query, filters, loading, navigation). Immutable data lives as module-level singletons accessed via `useSyncExternalStore`, while only lightweight UI flags live in Zustand. This eliminates the current app's core performance problem: 4MB deep clones on every filter change. See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete details with code examples.

**Major components and layers:**
1. **Data Singletons** (`data/`) — frozen metadata, `Map<string, Entity>` lookups, MiniSearch instance, diff data. Initialized once, read-only forever.
2. **Services** (`services/`) — HTTP fetching, tree builder (lazy child computation), search index builder (iterative DFS with cycle detection), metadata path resolution. Pure functions, no React dependency.
3. **Hooks** (`hooks/`) — bridge between data singletons + Zustand and React components. `useMetadata()`, `useFilteredRootNodes()`, `useSearchIndex()`, `useEntityLookup()`, `useTreeChildren()`.
4. **Zustand UI Store** (`store/`) — minimal: `isLoading`, `searchQuery`, `hiddenNamespaces`, `currentPath`. Persist middleware for `hiddenNamespaces` only.
5. **Presentation** (`components/`) — feature-organized: `explorer/`, `types/`, `changelog/`, `search/`, `shared/`, `layout/`. Route-level code splitting via React Router 7 `lazy`.

**Key architectural patterns:**
- `Object.freeze()` + `useSyncExternalStore` for metadata (zero subscription overhead)
- `useMemo` for all derived views (no deep cloning, no stored derived state)
- Iterative DFS with path-based visited set for cycle-safe tree walking
- React Router 7 `lazy` (not `React.lazy`) for route-level code splitting
- React 19 `use()` + Suspense for initial data loading (MEDIUM confidence — fallback to `useEffect` if needed)

### Critical Pitfalls

All 16 identified pitfalls are Phase 1 concerns. The top 5 with highest impact: see [PITFALLS.md](./PITFALLS.md) for all 16.

1. **JSON.parse() blocks main thread** (200-800ms on 4MB) — Use `response.text()` + Web Worker for parsing, OR accept the freeze with a CSS-only spinner in `index.html` that's visible before React mounts. Decision needed in Phase 1.
2. **Zustand v5 selector instability** — Selectors returning arrays/objects cause infinite re-render loops. Always use scalar selectors or wrap with `useShallow` from `zustand/shallow`. Establish patterns in store setup.
3. **Tailwind CSS v4 silent default changes** — Border color now `currentColor` (not `gray-200`), ring width now `1px` (not `3px`). No build warnings. Use shadcn/ui CSS variables from day one; never use bare `border` or `ring`.
4. **shadcn/ui dark mode requires CSS variable architecture** — Must run `npx shadcn@latest init` before writing any components. Retrofitting is HIGH cost (touching every component).
5. **MiniSearch tokenizer strips dots/parens** — `SP.Web` tokenizes to `["sp", "web"]`, matching too broadly. Implement custom tokenizer that keeps full qualified names as additional tokens.

## Implications for Roadmap

Based on the architecture's build order dependencies, feature dependency graph, and pitfall-to-phase mapping, the project naturally divides into **6 phases** with clear boundaries. Each phase is independently deployable.

### Phase 1: Project Scaffolding & Data Foundation
**Rationale:** Every other phase depends on the build toolchain, type system, data layer, and UI component infrastructure. Architecture research identifies 6 foundation layers that must exist before any features. ALL 16 pitfalls map to this phase — getting the foundation right eliminates risk for everything that follows.
**Delivers:** Working Vite 7 + React 19 project with TypeScript, Tailwind CSS 4, shadcn/ui initialized, Zustand store, metadata fetch + freeze pipeline, lookup Maps, MiniSearch index builder, basic routing shell, GitHub Actions CI/CD, dark mode toggle.
**Addresses features:** T7 (dark mode), T8 (fast initial load), T12 (loading states — skeleton during fetch/parse)
**Avoids pitfalls:** P1 (JSON.parse blocking), P2 (ref callbacks), P3 (Zustand persist), P4 (Tailwind defaults), P5 (CSS variables), P6 (selector instability), P7/P8 (MiniSearch setup), P9 (Vite base path), P11 (hash router), P12 (GitHub Actions)
**Estimated complexity:** HIGH — most architectural decisions are made here

### Phase 2: Explorer Core (Tree Navigation + Detail Views)
**Rationale:** The Explorer page is the primary user experience and the most architecturally complex feature (recursive tree, lazy children, breadcrumbs, entity/function detail views). It exercises the entire data layer built in Phase 1.
**Delivers:** Sidebar with contextual children, breadcrumb navigation, entity detail view (properties table, nav properties table, methods table), function detail view (parameters, return type), type cross-linking, resizable panels.
**Addresses features:** T2 (type cross-linking), T3 (breadcrumbs), T4 (deep linking for Explorer), T5 (copy path), T9 (resizable panels), T10 (collapsible sections), T11 (in-section filtering), D2 (base type chain), D7 (function signatures), D8 (contextual sidebar), D9 (section jump links)
**Avoids pitfalls:** P10 (tree data reference stability), P16 (metadata re-render)
**Estimated complexity:** HIGH — most feature-dense phase

### Phase 3: Global Search (Cmd+K Command Palette)
**Rationale:** Architecture research confirms the command palette is "independent of all page features — it only needs the search index hook." It can be built and tested standalone. But it should come after Phase 2 because search results navigate TO explorer paths, and we need the Explorer working to verify navigation.
**Delivers:** Cmd+K overlay, grouped search results (functions/entities/properties), path breadcrumb disambiguation, keyboard navigation, highlighted text matches, result navigation.
**Addresses features:** T1 (full-text search — THE core improvement), T6 (keyboard navigation), D4 (grouped search with disambiguation)
**Avoids pitfalls:** P8 (MiniSearch tokenizer — validate custom tokenizer against real queries)
**Estimated complexity:** MEDIUM — cmdk + MiniSearch do most of the work

### Phase 4: Types View (Entity Browser)
**Rationale:** The Types page is architecturally simpler than Explorer — a virtualized flat list of 2,449 entities with detail panels. It reuses shared components (PropsTable, MethodsTable, TypeLink) built in Phase 2. The "Used by" reverse cross-references (D1) belong here because the Types view is where developers explore entities by name.
**Delivers:** Virtualized entity type list with filter, type detail view, "Used by" reverse references, base type inheritance display.
**Addresses features:** D1 ("Used by" reverse refs — key differentiator), deep linking for entity routes
**Estimated complexity:** MEDIUM — reuses Phase 2 shared components

### Phase 5: Changelog View
**Rationale:** Changelog is independent of the metadata tree — it uses separate diff JSON files fetched from Azure. It can be built in parallel with Phases 2-4 but is lower priority because it's a secondary feature. It has its own data pipeline (diff files, not metadata.json).
**Delivers:** Month tab navigation, diff summary statistics, color-coded entity change cards (added/updated/removed), collapsible detail sections.
**Addresses features:** D3 (monthly API changelog — unique differentiator)
**Estimated complexity:** MEDIUM — independent data pipeline, straightforward UI

### Phase 6: Home Screen & Polish
**Rationale:** The home/landing screen requires components from all previous phases (recent visits from navigation state, popular endpoints from metadata, search trigger). Polish items (composable tooltips, share buttons, enhanced stats) are quick wins once the core is working.
**Delivers:** Curated popular endpoint categories, recently visited history, welcome hero, final dark mode audit, performance tuning, accessibility pass.
**Addresses features:** D5 (popular endpoints), D6 (recently visited), D11 (share button), Gap 5 (composable tooltip), D13 (stats)
**Estimated complexity:** LOW — mostly static content + localStorage

### Phase Ordering Rationale

1. **Dependency-driven:** Phase 1 → Phase 2 is strict (data layer → UI that consumes it). Phase 2 → Phase 3 is strong (search navigates to explorer paths). Phases 4 and 5 can run in parallel after Phase 2 (they reuse shared components). Phase 6 is last because it aggregates from all phases.
2. **Risk-front-loaded:** All 16 pitfalls are addressed in Phase 1. If the foundation is wrong, we find out immediately — not after building 5 phases of UI on top.
3. **Incrementally deployable:** After Phase 1, the app is a skeleton with dark mode. After Phase 2, it's a functional explorer. After Phase 3, it has the killer feature (deep search). Each phase adds independent value.
4. **Architecture-aligned:** The suggested phases match the architecture's 6-layer build order (types → data → hooks → shared components → features → integration).

### Research Flags

**Phases likely needing `/gsd-research-phase` during planning:**
- **Phase 1:** Complex scaffolding — Vite 7 config, shadcn/ui init, Tailwind CSS 4 CSS-first setup, Zustand persist middleware. Many moving parts that must align. Research should verify exact init commands work together.
- **Phase 2:** react-arborist integration — lazy children loading pattern, `data` prop management, integration with breadcrumbs and navigation. The contextual sidebar (showing only children of current node) is a custom pattern not documented in react-arborist examples.
- **Phase 3:** MiniSearch custom tokenizer — the default tokenizer doesn't handle `SP.Web` or `GetById()` correctly. Needs implementation research and testing against real queries.

**Phases with standard patterns (skip research-phase):**
- **Phase 4:** Types view is a standard virtualized list + detail panel. @tanstack/react-virtual + reused shared components. Well-documented pattern.
- **Phase 5:** Changelog is a straightforward data-display view. Tabs + cards + color-coded badges. No novel patterns.
- **Phase 6:** Home screen is static curation + localStorage history. Trivial.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | All 15+ libraries verified on npm registry + Context7 official docs. Every peer dependency checked. Version compatibility matrix complete. |
| Features | **HIGH** | Analyzed against 15+ competitor products. Clear table-stakes vs differentiators. Anti-features well-justified. Feature dependency graph mapped. |
| Architecture | **HIGH** | Three critical decisions (metadata outside Zustand, MiniSearch on main thread, iterative DFS with cycle detection) verified via official docs with code examples. Build order dependencies mapped. |
| Pitfalls | **HIGH** | 16 pitfalls identified, 14 verified via Context7/official docs (HIGH confidence), 2 inferred (MEDIUM confidence: MiniSearch tokenizer specifics, React Router hash edge cases). All have prevention strategies and phase mappings. |

**Overall confidence: HIGH**

The entire stack is greenfield (no migration constraints), all technologies are current-latest with verified compatibility, and the architecture patterns are well-documented. The highest uncertainty is in the MiniSearch custom tokenizer (P8) — this needs validation during Phase 1/3 implementation.

### Gaps to Address

- **JSON.parse Worker vs CSS spinner:** Architecture research says "decision needed" — implement the simpler CSS spinner approach for Phase 1, measure TBT, add Worker only if TBT > 200ms. Don't over-engineer upfront.
- **React 19 `use()` API for data loading:** MEDIUM confidence. The pattern of caching a promise in module scope is documented but new. Fallback to `useEffect` + loading state if `use()` causes issues.
- **Enum definitions in metadata:** Feature D12 (enum/complex type expansion) depends on whether enum values are present in the source JSON. Needs data investigation — defer to v1.x.
- **react-arborist contextual sidebar pattern:** The design shows only immediate children of the current node, not a full tree. This isn't a standard react-arborist pattern — may need a simpler custom list instead of the tree component for the sidebar.
- **MiniSearch tokenizer for code identifiers:** Default tokenizer splits `SP.Web` incorrectly. Custom tokenizer approach is designed but not validated against MiniSearch v7.2 API. Validate early in Phase 3.

## Sources

### Primary (HIGH confidence)
- Context7 `/vitejs/vite/v7.0.0` — Vite 7 config, Node.js requirements, base path
- Context7 `/pmndrs/zustand/v5.0.8` — Zustand v5 migration, `useShallow`, persist middleware
- Context7 `/websites/react_dev` — React 19 `use()`, `useSyncExternalStore`, `useMemo`, ref callbacks
- Context7 `/remix-run/react-router/react-router_7.9.4` — `createHashRouter`, library mode, `lazy` routes
- Context7 `/brimdata/react-arborist` — Tree API, `searchTerm`, `searchMatch`, `data` prop, lazy loading
- Context7 `/lucaong/minisearch` — MiniSearch API, `addAll`, stored fields, TypeScript generics
- Context7 `/pacocoursey/cmdk` — Command palette, Dialog, keyboard patterns
- Context7 `/shadcn-ui/ui/shadcn_3.5.0` — Vite install guide, Tailwind v4 compatibility
- Context7 `/websites/tailwindcss` — Tailwind CSS v4 upgrade, CSS-first config, dark mode
- Context7 `/websites/tanstack_table` — TanStack Table v8 install, React 19 note
- npm registry — all version numbers verified 2026-02-11

### Secondary (MEDIUM confidence)
- API documentation tool comparisons (apisyouwonthate.com, ferndesk.com, treblle.com) — feature landscape
- Stripe DX teardowns (moesif.com, kenneth.io) — search and navigation patterns
- MiniSearch tokenizer behavior — inferred from docs and NLP tokenization standards
- React Router 7 hash routing edge cases — supported but less documented path

### Tertiary (LOW confidence)
- MiniSearch Web Worker transferability — inferred from internal structure, not explicitly documented
- react-arborist + contextual sidebar pattern — custom usage not in examples, may need alternative approach
- React 19 Compiler compatibility with TanStack Table — noted in TanStack docs as potential issue, but Compiler is opt-in and not needed

---
*Research completed: 2026-02-11*
*Ready for roadmap: yes*
