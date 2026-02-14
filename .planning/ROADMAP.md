# Roadmap: SP REST API Explorer — New UI

## Milestones

- **v1.0 MVP** — Phases 1-5, 39 requirements (shipped 2026-02-12) — [archive](milestones/v1.0-ROADMAP.md)
- **v1.1 Search, Types & Polish** — Phases 6-8, 13 requirements

## Phases

<details>
<summary>v1.0 MVP (Phases 1-5) — SHIPPED 2026-02-12</summary>

- [x] Phase 1: Project Scaffolding (2/2 plans) — completed 2026-02-11
- [x] Phase 2: Data Layer & UI Foundation (2/2 plans) — completed 2026-02-11
- [x] Phase 3: Navigation System (2/2 plans) — completed 2026-02-11
- [x] Phase 4: Explore API Views (2/2 plans) — completed 2026-02-11
- [x] Phase 5: Entity & Function Detail (3/3 plans) — completed 2026-02-12

</details>

### Phase 6: Global Search

**Goal:** Users can find any entity, function, or property across all 6K+ indexed items in seconds and jump directly to it.

**Dependencies:** None (MiniSearch index with ~6K items already exists in data layer)

**Requirements:** SRCH-01, SRCH-02, SRCH-03, SRCH-04

**Plans:** 2 plans
- [x] 06-01-PLAN.md — Install shadcn primitives and build CommandPalette component
- [x] 06-02-PLAN.md — Wire triggers (Cmd+K, header, hero) and integrate with app

**Success Criteria:**
1. User presses Cmd+K (Mac) or Ctrl+K (Windows) from any page and a command palette opens immediately
2. User types a query and sees matching results appear in real-time as they type, with no perceptible delay
3. User sees results organized into groups by kind (entities, functions, properties) so they can scan to the right category
4. User selects a result (click or keyboard) and the app navigates to that item's detail view with correct context (sidebar, breadcrumbs)
5. User presses Escape or clicks outside to dismiss the palette and return to their previous view unchanged

---

### Phase 7: Explore Types

**Goal:** Users can browse, inspect, and cross-reference every complex type in the SharePoint REST API metadata — with namespace-grouped sidebar, type detail views, inheritance display, precomputed used-by index, and cross-navigation via TypeLink.

**Dependencies:** Phase 6 not required, but TypeLink component from v1.0 will be extended

**Requirements:** TYPE-01, TYPE-02, TYPE-03, TYPE-04, TYPE-05, TYPE-06

**Plans:** 3 plans

Plans:
- [x] 07-01-PLAN.md — Data layer (type indexes) + ComplexTypeDetail component
- [x] 07-02-PLAN.md — TypesPage sidebar with namespace grouping + TypeLink cross-navigation
- [x] 07-03-PLAN.md — Gap closure: sidebar lists all types, fullName filter, entity derived types

**Success Criteria:**
1. User clicks "Explore Types" in the main header navigation and sees a sidebar listing all complex types grouped by namespace, with a filter input to narrow the list
2. User clicks a complex type and sees its properties table with Name, Type, Nullable columns
3. User viewing a type can see its base type as a clickable link and any derived types as a list
4. User viewing a type can see a "Used by" section showing which entities reference this type via navigation properties (precomputed, not scanned)
5. User clicks any type reference in the Explore API views and navigates to that type's detail in Explore Types with sidebar synced

---

### Phase 07.1: Fix search experience (INSERTED)

**Goal:** Fix search result navigation UX so clicking any search result reliably navigates to the correct destination. Restructure search indexing to two groups (Entities, API Endpoints) with pre-computed navigation paths.

**Depends on:** Phase 7

**Plans:** 2 plans

Plans:
- [x] 07.1-01-PLAN.md — BFS tree-walk and search index rewrite (entity + endpoint documents with pre-computed paths)
- [x] 07.1-02-PLAN.md — CommandPalette 2-group UI rewrite with collapsible groups, Show more, and fixed navigation

### Phase 07.2: Add path to API Endpoints index (INSERTED)

**Goal:** Users can search API endpoints by their full `_api/...` REST path using slash or space as mode triggers, with matched path segments highlighted — preserving existing name search behavior.

**Depends on:** Phase 07.1

**Plans:** 2 plans

Plans:
- [x] 07.2-01-PLAN.md — Dual MiniSearch indexes (name + path) with mode-aware CommandPalette
- [x] 07.2-02-PLAN.md — Fix path search: substring matching instead of MiniSearch tokenization (gap closure)

### Phase 8: Quality-of-Life Polish

**Goal:** Small but meaningful UX improvements and content additions that round out the v1.1 milestone.

**Dependencies:** None (breadcrumb bar and header exist from v1.0)

**Requirements:** NAV-03, INFO-01, INFO-02

**Plans:** 3 plans

Plans:
- [x] 08-01-PLAN.md — How It Works page content + GitHub star count in header
- [ ] 08-02-PLAN.md — Copy-to-clipboard in breadcrumb bar + favicons
- [ ] 08-03-PLAN.md — Dark mode color scheme rethink (GitHub Dark) + dark scrollbars

**Success Criteria:**
1. User clicks a copy button in the breadcrumb bar and the `_api/...` path for the current item is copied to clipboard, with visual confirmation
2. User can navigate to a "How It Works" page from the home screen or header
3. User reading the How It Works page understands where the metadata comes from and how the app processes it

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|:--------------:|--------|-----------|
| 1. Project Scaffolding | v1.0 | 2/2 | Complete | 2026-02-11 |
| 2. Data Layer & UI Foundation | v1.0 | 2/2 | Complete | 2026-02-11 |
| 3. Navigation System | v1.0 | 2/2 | Complete | 2026-02-11 |
| 4. Explore API Views | v1.0 | 2/2 | Complete | 2026-02-11 |
| 5. Entity & Function Detail | v1.0 | 3/3 | Complete | 2026-02-12 |
| 6. Global Search | v1.1 | 2/2 | Complete | 2026-02-12 |
| 7. Explore Types | v1.1 | 3/3 | Complete | 2026-02-14 |
| 07.1. Fix search experience | v1.1 | 2/2 | Complete | 2026-02-14 |
| 07.2. Add path to API Endpoints index | v1.1 | 2/2 | Complete | 2026-02-14 |
| 8. Quality-of-Life Polish | v1.1 | 1/3 | In progress | — |

---
*Roadmap created: 2026-02-11*
*Last updated: 2026-02-14 (Phase 8 — 1/3 plans complete)*
