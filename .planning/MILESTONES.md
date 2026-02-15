# Milestones: SP REST API Explorer — New UI

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
*Last updated: 2026-02-15*
