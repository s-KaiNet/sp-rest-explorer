# Roadmap: SP REST API Explorer — New UI

**Created:** 2026-02-11
**Depth:** Standard (5 phases)
**Coverage:** 39/39 v1 requirements mapped
**Execution:** Sequential — each phase produces a deployable state

## Overview

Rebuild the SharePoint REST API Metadata Explorer from Vue 2 + Webpack 3 to React 19 + Vite + Tailwind 4 + shadcn/ui. v1 scope is the Explore API view only — deep search, Explore Types, and API Changelog are deferred to v2. The 39 v1 requirements cluster into 5 natural delivery boundaries: scaffolding, data layer, navigation, explore views, and detail panels.

---

## Phase 1: Project Scaffolding

**Goal:** A working React app shell with routing, styling, dark mode, and deployment pipeline — ready for feature development.

**Dependencies:** None (foundation phase)

**Requirements:**
- INFRA-01: Vite + React 19 + TypeScript 5 project in `app/` directory
- INFRA-02: Tailwind CSS 4 + shadcn/ui initialized
- INFRA-06: React Router 7 HashRouter with route structure matching current URL patterns
- INFRA-07: Dark mode toggle with localStorage persistence
- INFRA-08: Build outputs to `docs/` for GitHub Pages
- UIFN-02: App header with nav links and dark mode toggle

**Success Criteria:**
1. User can open the app in a browser, see a styled header with navigation links (Explore API, Explore Types, API Changelog, How it works), and toggle dark mode
2. User can navigate between route placeholders using header links with hash-based URLs (`/#/`, `/#/entity`, `/#/api-diff`, `/#/how-it-works`)
3. Dark mode preference persists across browser sessions via localStorage
4. Running `npm run build` produces output in `docs/` directory deployable to GitHub Pages

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold Vite + React 19 + TS5 with Tailwind CSS 4 + shadcn/ui and build-to-docs config
- [x] 01-02-PLAN.md — React Router HashRouter, Header with nav/dark mode/GitHub link, placeholder pages, 404

---

## Phase 2: Data Layer & UI Foundation

**Goal:** Metadata loads from Azure, is indexed for search, and the app displays loading/ready states with a consistent visual language.

**Dependencies:** Phase 1 (build toolchain, routing shell)

**Requirements:**
- INFRA-03: Zustand store with metadata state management (immutable data, metadata outside reactive state)
- INFRA-04: Metadata fetched from Azure Blob Storage on app mount with loading state
- INFRA-05: MiniSearch index built on metadata load (~6K searchable items across all tree levels)
- INFRA-09: Pre-computed lookup maps (entity Map, function Map, parent-children Map)
- UIFN-01: Loading skeleton screens during metadata fetch
- UIFN-03: Color-coded type system (blue for functions, green for entities, purple for nav properties)
- UIFN-04: Monospace font for all type names, property names, method signatures

**Success Criteria:**
1. App loads metadata from Azure Blob Storage and transitions from skeleton loading state to ready state within 3 seconds on broadband
2. MiniSearch index contains ~6K items built from metadata (root functions + nested children via DFS tree walk + entities) — verifiable via console log of index stats
3. Developer can access any entity by full name and any function by ID in O(1) time via pre-computed lookup Maps
4. Color-coded styling is visible: blue text for function references, green for entity types, purple for navigation properties, monospace font for code identifiers

**Plans:** 2 plans

Plans:
- [x] 02-01-PLAN.md — Data layer: TypeScript types, metadata singleton, Zustand store, lookup Maps, MiniSearch index, IndexedDB cache, boot orchestrator
- [x] 02-02-PLAN.md — UI foundation: color tokens, monospace font, CodeText component, skeleton screens, error state, CSS spinner, boot integration in App.tsx

---

## Phase 3: Navigation System

**Goal:** Users can navigate the API hierarchy via breadcrumbs and a contextual sidebar showing children of the current node.

**Dependencies:** Phase 2 (metadata + lookup maps needed to resolve nodes and their children)

**Requirements:**
- NAV-01: Full-width breadcrumb bar showing current API path with clickable segments
- NAV-02: Clicking any breadcrumb segment navigates to that node and updates the sidebar
- NAV-03: Copy button on breadcrumb bar copies full `_api/...` path to clipboard
- NAV-04: Contextual sidebar showing immediate children (functions + nav properties) of current node
- NAV-05: Clicking a sidebar item navigates to that child, updating breadcrumb and sidebar
- NAV-06: Sidebar items display type tags (FN in blue for functions, NAV in purple for nav properties)
- NAV-07: Sidebar is resizable by dragging a handle (280px default, 200px min, 500px max)

**Success Criteria:**
1. User can navigate to `/#/_api/web` and see a breadcrumb showing `_api / web` with each segment clickable, plus a sidebar listing web's children (Lists, SiteGroups, CurrentUser, etc.) with FN/NAV type tags
2. User can click a sidebar child (e.g., "Lists"), see the breadcrumb update to `_api / web / Lists`, sidebar update to show Lists' children, and URL update to `/#/_api/web/Lists`
3. User can click any breadcrumb segment to jump back to that level, with sidebar updating to show that node's children
4. ~~User can click the copy button and paste a valid `_api/web/Lists` path from clipboard~~ (NAV-03 deferred)
5. User can drag the sidebar resize handle to change its width between 200px and 600px

**Plans:** 2 plans

Plans:
- [x] 03-01-PLAN.md — Navigation hook, breadcrumb bar, and sidebar components
- [x] 03-02-PLAN.md — Resizable layout, directional animations, and ExplorePage wiring

---

## Phase 4: Explore API Views

**Goal:** Users have a curated home screen for discovery and can browse all 793 root endpoints with filtering.

**Dependencies:** Phase 3 (navigation system for endpoint chip clicks and sidebar browse)

**Requirements:**
- EXPL-01: Home screen with popular endpoints grouped into 6 feature-area cards (Core, Content & Pages, People & Social, Search, Administration, Machine Learning)
- EXPL-02: Clicking an endpoint chip navigates directly to that API node
- EXPL-03: Browse all 793 root endpoints in a filterable list view (State 3)
- EXPL-04: Filter root endpoints by typing with real-time count ("Showing 22 of 793 endpoints")
- EXPL-05: Long endpoint names truncated with prefix ellipsis, full name on hover

**Success Criteria:**
1. User lands on the home screen and sees 6 categorized cards (Core, Content & Pages, People & Social, Search, Administration, Machine Learning) with clickable endpoint chips
2. User clicks a popular endpoint chip (e.g., "web") and navigates to `/#/_api/web` with breadcrumb and sidebar showing web's children
3. User clicks "Browse all root endpoints" and sees all 793 root functions in a sidebar list with a filter input
4. User types "list" in the filter input and sees a filtered list with count (e.g., "Showing 22 of 793 endpoints"), with long names prefix-truncated and full name visible on hover

**Plans:** 2 plans

Plans:
- [x] 04-01-PLAN.md — Foundation: recently visited hook, sidebar filter at all levels, root endpoint green icon treatment
- [x] 04-02-PLAN.md — Home screen with hero, browse-all button, recently visited grid, search UI placeholders, welcome message

---

## Phase 5: Entity & Function Detail

**Goal:** Users can view complete entity and function documentation with interactive tables, type linking, and inline filtering.

**Dependencies:** Phase 3 (navigation system for breadcrumb context), Phase 2 (lookup maps for type resolution)

**Requirements:**
- ENTD-01: Entity name, full name, and official documentation link
- ENTD-02: Collapsible Properties section with Property | Type | Nullable columns and count badge
- ENTD-03: Collapsible Navigation Properties section with Name | Target Type columns and count badge
- ENTD-04: Collapsible Methods section with Method | Parameters | Returns columns and count badge
- ENTD-05: Entity type names in tables are clickable green links navigating to that entity
- ENTD-06: Method parameters display one-per-line as `paramName: ParamType` with entity types linked
- ENTD-07: Composable methods show a COMPOSABLE badge next to return type
- ENTD-08: Inline filter input in Properties section header
- ENTD-09: Inline filter input in Methods section header
- ENTD-10: Navigation property names display in purple
- ENTD-11: Function/method names display in blue monospace
- FUNC-01: Function name, parameters with types, and return type
- FUNC-02: Entity types in parameters and return type are clickable green links
- FUNC-03: Composable functions show a COMPOSABLE badge

**Success Criteria:**
1. User navigates to an entity (e.g., SP.List via `/#/_api/web/Lists/GetByTitle`) and sees entity name, full name, doc link, plus collapsible Properties (91), Navigation Properties (18), and Methods (102) sections with count badges
2. User can click any entity type name (e.g., `SP.ChangeToken` in properties, `SP.View` in nav props) and navigate to that entity's detail within the Explore API context
3. User can filter within the Properties section by typing in the inline filter (e.g., "title" shows only matching properties) and similarly filter Methods
4. User navigates to a function (e.g., GetById) and sees function name, parameters with types (one per line), return type, and COMPOSABLE badge when applicable
5. Visual styling is consistent: function names in blue monospace, nav property names in purple, entity type links in green, parameter types properly formatted

---

## Progress

| Phase | Name | Requirements | Status |
|-------|------|:------------:|--------|
| 1 | Project Scaffolding | 6 | ✓ Complete (2026-02-11) |
| 2 | Data Layer & UI Foundation | 7 | ✓ Complete (2026-02-11) |
| 3 | Navigation System | 7 | ✓ Complete (2026-02-11) |
| 4 | Explore API Views | 5 | ✓ Complete (2026-02-11) |
| 5 | Entity & Function Detail | 14 | Pending |
| **Total** | | **39** | |

---
*Roadmap created: 2026-02-11*
*Last updated: 2026-02-11 (Phase 4 complete)*
