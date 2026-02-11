# Requirements: SP REST API Explorer — New UI

**Defined:** 2026-02-11
**Core Value:** Developers can browse and understand every SharePoint REST API endpoint through a fast, modern interface with contextual navigation.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: Project scaffolded with Vite 7 + React 19 + TypeScript 5 in new `app/` directory
- [ ] **INFRA-02**: Tailwind CSS 4 configured with shadcn/ui component library initialized
- [ ] **INFRA-03**: Zustand store created with metadata state management (immutable data pattern, metadata stored outside reactive state)
- [ ] **INFRA-04**: Metadata fetched from Azure Blob Storage on app mount with loading state
- [ ] **INFRA-05**: MiniSearch index built on metadata load (~6K searchable items across all tree levels)
- [ ] **INFRA-06**: React Router 7 HashRouter configured with route structure matching current URL patterns
- [ ] **INFRA-07**: Dark mode toggle with localStorage persistence (shadcn/ui CSS variable architecture)
- [ ] **INFRA-08**: Build outputs to `docs/` directory for GitHub Pages deployment
- [ ] **INFRA-09**: Pre-computed lookup maps built on metadata load (entity Map, function Map, parent-children Map)

### Navigation

- [ ] **NAV-01**: User can see a full-width breadcrumb bar showing the current API path with clickable segments
- [ ] **NAV-02**: User can click any breadcrumb segment to navigate to that node and update the sidebar
- [ ] **NAV-03**: User can copy the full `_api/...` path to clipboard via a copy button on the breadcrumb bar
- [ ] **NAV-04**: User can see a contextual sidebar showing immediate children (functions + nav properties) of the current node
- [ ] **NAV-05**: User can click a sidebar item to navigate to that child node, updating breadcrumb and sidebar
- [ ] **NAV-06**: Sidebar items display type tags (FN for functions in blue, NAV for navigation properties in purple)
- [ ] **NAV-07**: User can resize the sidebar by dragging a handle (280px default, 200px min, 500px max)

### Explore API

- [ ] **EXPL-01**: User can see a home screen with curated popular endpoints grouped into 6 feature-area cards (Core, Content & Pages, People & Social, Search, Administration, Machine Learning)
- [ ] **EXPL-02**: User can click an endpoint chip on the home screen to navigate directly to that API node
- [ ] **EXPL-03**: User can browse all 793 root endpoints in a filterable list view (State 3)
- [ ] **EXPL-04**: User can filter root endpoints by typing in a filter input with real-time count ("Showing 22 of 793 endpoints")
- [ ] **EXPL-05**: Long endpoint names are truncated with prefix ellipsis and show full name on hover

### Entity Detail

- [ ] **ENTD-01**: User can see entity name, full name, and official documentation link (when available)
- [ ] **ENTD-02**: User can see a collapsible Properties section with Property | Type | Nullable columns and item count badge
- [ ] **ENTD-03**: User can see a collapsible Navigation Properties section with Name | Target Type columns and item count badge
- [ ] **ENTD-04**: User can see a collapsible Methods section with Method | Parameters | Returns columns and item count badge
- [ ] **ENTD-05**: Entity type names in all tables are clickable green links that navigate to that entity's detail (within Explore API context)
- [ ] **ENTD-06**: Method parameters display one-per-line as `paramName: ParamType` with entity types linked
- [ ] **ENTD-07**: Composable methods show a COMPOSABLE badge next to the return type
- [ ] **ENTD-08**: User can filter within Properties section using an inline filter input in the section header
- [ ] **ENTD-09**: User can filter within Methods section using an inline filter input in the section header
- [ ] **ENTD-10**: Navigation property names display in purple (nav-color)
- [ ] **ENTD-11**: Function/method names display in blue monospace (fn-color)

### Function Detail

- [ ] **FUNC-01**: User can see function name, parameters with types, and return type
- [ ] **FUNC-02**: Entity types in parameters and return type are clickable green links
- [ ] **FUNC-03**: Composable functions show a COMPOSABLE badge

### UI Foundation

- [ ] **UIFN-01**: Loading skeleton screens display during metadata fetch
- [ ] **UIFN-02**: App header with navigation links (Explore API, Explore Types, API Changelog, How it works) and dark mode toggle
- [ ] **UIFN-03**: Color-coded type system: blue for functions, green for entities, purple for nav properties
- [ ] **UIFN-04**: Monospace font used for all type names, property names, method signatures

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Search

- **SRCH-01**: Cmd+K / Ctrl+K command palette for global search across all tree levels
- **SRCH-02**: Search results grouped by category (Functions, Entities, Properties)
- **SRCH-03**: Same-name results disambiguated by path breadcrumbs
- **SRCH-04**: Match highlighting on search result text
- **SRCH-05**: Keyboard navigation in search results (arrow keys, Enter, Esc)

### Explore Types

- **TYPE-01**: Virtualized list of all 2,449 entity types with filter input
- **TYPE-02**: Type detail with properties, nav props, methods (same tables as Explore API)
- **TYPE-03**: Base type inheritance chain with clickable links
- **TYPE-04**: "Used by" reverse cross-references showing referencing entities
- **TYPE-05**: Section jump links (Properties | Nav Props | Methods)
- **TYPE-06**: Type cross-linking everywhere (all entity names are clickable)

### Changelog

- **CHLG-01**: Monthly tabs showing 6 months of API changes
- **CHLG-02**: Summary stats bar (Added, Updated, Removed counts)
- **CHLG-03**: Filter chips to toggle visibility of change types
- **CHLG-04**: Collapsible entity cards with color-coded micro-badges
- **CHLG-05**: Root functions changes table
- **CHLG-06**: Empty month state with friendly message

### Additional

- **ADDL-01**: Recently visited section on home screen (localStorage)
- **ADDL-02**: GitHub Actions CI/CD auto-deployment
- **ADDL-03**: How It Works static page with CSS architecture diagram

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| "Try It" / API Playground | Static SPA on GitHub Pages — no backend, no SharePoint auth, no proxy |
| Code sample generation | Metadata has no HTTP methods, request bodies, or usage examples |
| AI-powered search / chat | Structured metadata search (MiniSearch) is better than LLM for finding named items |
| User accounts / personalization | No backend — localStorage is sufficient |
| Mobile-optimized UX | SharePoint developers use desktop; data density makes mobile impractical |
| Full-tree visualization / graph | 2,449 entities = unreadable hairball; text-based navigation is more productive |
| Inline editing of metadata | Read-only viewer, not an editor |
| Analytics (GA / App Insights) | Deferred — add after core functionality is validated |
| Multiple API versions | SharePoint has ONE metadata at any time; changelog tracks changes |
| Offline PWA support | Nice to have for v2+, not launch critical |
| PnPjs code snippet generation | High value but requires mapping logic — consider post-launch |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 — Project Scaffolding | Pending |
| INFRA-02 | Phase 1 — Project Scaffolding | Pending |
| INFRA-03 | Phase 2 — Data Layer & UI Foundation | Pending |
| INFRA-04 | Phase 2 — Data Layer & UI Foundation | Pending |
| INFRA-05 | Phase 2 — Data Layer & UI Foundation | Pending |
| INFRA-06 | Phase 1 — Project Scaffolding | Pending |
| INFRA-07 | Phase 1 — Project Scaffolding | Pending |
| INFRA-08 | Phase 1 — Project Scaffolding | Pending |
| INFRA-09 | Phase 2 — Data Layer & UI Foundation | Pending |
| NAV-01 | Phase 3 — Navigation System | Pending |
| NAV-02 | Phase 3 — Navigation System | Pending |
| NAV-03 | Phase 3 — Navigation System | Pending |
| NAV-04 | Phase 3 — Navigation System | Pending |
| NAV-05 | Phase 3 — Navigation System | Pending |
| NAV-06 | Phase 3 — Navigation System | Pending |
| NAV-07 | Phase 3 — Navigation System | Pending |
| EXPL-01 | Phase 4 — Explore API Views | Pending |
| EXPL-02 | Phase 4 — Explore API Views | Pending |
| EXPL-03 | Phase 4 — Explore API Views | Pending |
| EXPL-04 | Phase 4 — Explore API Views | Pending |
| EXPL-05 | Phase 4 — Explore API Views | Pending |
| ENTD-01 | Phase 5 — Entity & Function Detail | Pending |
| ENTD-02 | Phase 5 — Entity & Function Detail | Pending |
| ENTD-03 | Phase 5 — Entity & Function Detail | Pending |
| ENTD-04 | Phase 5 — Entity & Function Detail | Pending |
| ENTD-05 | Phase 5 — Entity & Function Detail | Pending |
| ENTD-06 | Phase 5 — Entity & Function Detail | Pending |
| ENTD-07 | Phase 5 — Entity & Function Detail | Pending |
| ENTD-08 | Phase 5 — Entity & Function Detail | Pending |
| ENTD-09 | Phase 5 — Entity & Function Detail | Pending |
| ENTD-10 | Phase 5 — Entity & Function Detail | Pending |
| ENTD-11 | Phase 5 — Entity & Function Detail | Pending |
| FUNC-01 | Phase 5 — Entity & Function Detail | Pending |
| FUNC-02 | Phase 5 — Entity & Function Detail | Pending |
| FUNC-03 | Phase 5 — Entity & Function Detail | Pending |
| UIFN-01 | Phase 2 — Data Layer & UI Foundation | Pending |
| UIFN-02 | Phase 1 — Project Scaffolding | Pending |
| UIFN-03 | Phase 2 — Data Layer & UI Foundation | Pending |
| UIFN-04 | Phase 2 — Data Layer & UI Foundation | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0

---
*Requirements defined: 2026-02-11*
*Last updated: 2026-02-11 after roadmap creation*
