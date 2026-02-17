# Roadmap: SP REST API Explorer — New UI

## Milestones

- ✅ **v1.0 MVP** — Phases 1-5 (shipped 2026-02-12) — [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Search, Types & Polish** — Phases 6-8 (shipped 2026-02-15) — [archive](milestones/v1.1-ROADMAP.md)
- ✅ **v1.2 UI Improvements** — Phases 9-10 (shipped 2026-02-15) — [archive](milestones/v1.2-ROADMAP.md)
- 🔄 **v1.3 Improvements** — Phases 11-12

## Phases

<details>
<summary>v1.0 MVP (Phases 1-5) — SHIPPED 2026-02-12</summary>

- [x] Phase 1: Project Scaffolding (2/2 plans) — completed 2026-02-11
- [x] Phase 2: Data Layer & UI Foundation (2/2 plans) — completed 2026-02-11
- [x] Phase 3: Navigation System (2/2 plans) — completed 2026-02-11
- [x] Phase 4: Explore API Views (2/2 plans) — completed 2026-02-11
- [x] Phase 5: Entity & Function Detail (3/3 plans) — completed 2026-02-12

</details>

<details>
<summary>v1.1 Search, Types & Polish (Phases 6-8) — SHIPPED 2026-02-15</summary>

- [x] Phase 6: Global Search (2/2 plans) — completed 2026-02-12
- [x] Phase 7: Explore Types (3/3 plans) — completed 2026-02-14
- [x] Phase 07.1: Fix search experience (2/2 plans) — completed 2026-02-14
- [x] Phase 07.2: Add path to API Endpoints index (2/2 plans) — completed 2026-02-14
- [x] Phase 8: Quality-of-Life Polish (4/4 plans) — completed 2026-02-15

</details>

<details>
<summary>v1.2 UI Improvements (Phases 9-10) — SHIPPED 2026-02-15</summary>

- [x] Phase 9: Explore API Sidebar Polish (3/3 plans) — completed 2026-02-15
- [x] Phase 10: Home Screens & Visual Polish (2/2 plans) — completed 2026-02-15

</details>

### v1.3 Improvements (Phases 11-12)

- [x] **Phase 11: Search UX Fixes** — Dot-literal matching, group collapse stability, path-length sorting, and hover feedback (completed 2026-02-17)
  **Plans:** 2 plans
  Plans:
  - [x] 11-01-PLAN.md — Fix all four search UX issues (literal matching, collapse headers, path-length sort, hover feedback)
  - [x] 11-02-PLAN.md — Gap closure: fix invisible hover highlight (accent color identical to popover background)
- [x] **Phase 12: Detail & Layout Fixes** — Nullable column display and breadcrumb placement (completed 2026-02-17)
  **Plans:** 2 plans
  Plans:
  - [x] 12-01-PLAN.md — Fix nullable column logic and move breadcrumb into content area
  - [ ] 12-02-PLAN.md — Gap closure: fix breadcrumb scroll container so scrollbar only covers content below breadcrumb

## Phase Details

### Phase 11: Search UX Fixes
**Goal**: Search results in the Cmd+K palette behave predictably — dots match literally, groups collapse smoothly, results sort sensibly, and items feel interactive
**Depends on**: Nothing (independent fixes to existing search)
**Requirements**: SRCH-06, SRCH-07, SRCH-08, SRCH-09
**Success Criteria** (what must be TRUE):
  1. Typing "SP.File" in Cmd+K returns only results containing the literal substring "SP.File" — not results that match "SP" and "File" as separate tokens
  2. Clicking anywhere on a search result group header (label, count, whitespace) toggles collapse; collapsing/expanding does not cause the header text to shift position
  3. API Endpoints results appear sorted by path length, shortest first (e.g., `/web` before `/web/lists/getbyid(…)/items`)
  4. Hovering over any search result item shows a visible background highlight and the cursor changes to pointer

### Phase 12: Detail & Layout Fixes
**Goal**: Entity property nullable display is accurate and the Explore API breadcrumb sits in the correct visual region
**Depends on**: Nothing (independent of Phase 11)
**Requirements**: ENTD-12, LAYO-01
**Success Criteria** (what must be TRUE):
  1. On any entity properties table, a property with `"nullable": false` in metadata shows "no" in the Nullable column; all other properties show "yes"
  2. The Explore API breadcrumb trail renders inside the main content area (below the header chrome), not within the top header bar

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
| 07.2. Add path to API Endpoints | v1.1 | 2/2 | Complete | 2026-02-14 |
| 8. Quality-of-Life Polish | v1.1 | 4/4 | Complete | 2026-02-15 |
| 9. Explore API Sidebar Polish | v1.2 | 3/3 | Complete | 2026-02-15 |
| 10. Home Screens & Visual Polish | v1.2 | 2/2 | Complete | 2026-02-15 |
| 11. Search UX Fixes | v1.3 | 2/2 | Complete | 2026-02-17 |
| 12. Detail & Layout Fixes | v1.3 | Complete    | 2026-02-17 | - |

---
*Roadmap created: 2026-02-11*
*Last updated: 2026-02-17 (Phase 11 planned — 1 plan)*
