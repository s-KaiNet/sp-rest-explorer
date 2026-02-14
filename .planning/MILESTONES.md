# Milestones: SP REST API Explorer — New UI

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
*Last updated: 2026-02-15*
