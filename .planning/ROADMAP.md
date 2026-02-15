# Roadmap: SP REST API Explorer — New UI

## Milestones

- **v1.0 MVP** — Phases 1-5 (shipped 2026-02-12) — [archive](milestones/v1.0-ROADMAP.md)
- **v1.1 Search, Types & Polish** — Phases 6-8 (shipped 2026-02-15) — [archive](milestones/v1.1-ROADMAP.md)
- **v1.2 UI Improvements** — Phases 9-10 (active)

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

### v1.2 UI Improvements (Phases 9-10)

---

### Phase 9: Explore API Sidebar Polish ✅ (2026-02-15)

**Goal**: The Explore API sidebar presents root-level items cleanly — grouped by namespace, with consistent badge positioning, no visual clutter from type badges, and no animation glitches.
**Depends on**: None (sidebar components exist from v1.0)

**Requirements:** SIDE-01, SIDE-02, SIDE-03, VISU-02

**Success Criteria:**
1. User navigates forward in the Explore API sidebar and sees smooth slide animation with no horizontal scrollbar flickering
2. User viewing the Explore API root level sees items organized into collapsible namespace groups (matching Explore Types pattern), with ungrouped items shown first under "No Group"
3. User sees root indicator badges on the right side of sidebar items, aligned consistently with function/nav property badges
4. User no longer sees "Entity Type" or "Complex Type" badges anywhere in the app — sidebar items, detail views, or search results

**Plans:** 3 plans

Plans:
- [x] 09-01-PLAN.md — Remove Entity Type, Complex Type, and Composable badges from all locations
- [x] 09-02-PLAN.md — Namespace grouping, badge repositioning, and animation fix for sidebar
- [x] 09-03-PLAN.md — Fix namespace grouping to use entry.name instead of entry.returnType (gap closure)

---

### Phase 10: Home Screens & Visual Polish ✅ (2026-02-15)

**Goal**: Home pages for both Explore API and the main app are visually polished with proper branding, accurate stats, a redesigned API welcome screen, expanded recently visited, and fixed dark mode borders.
**Depends on**: Phase 9 (Explore API home redesign benefits from namespace-grouped sidebar already in place)

**Requirements:** HOME-01, HOME-02, HOME-03, SIDE-04, VISU-01

**Success Criteria:**
1. User visiting the home page sees the site icon displayed inline to the left of "SharePoint REST API Explorer" title
2. User visiting the home page sees approximate stat values (3.5k+ functions, 2.4k entities, 11k+ properties, 60k+ endpoints) instead of exact computed numbers
3. User entering Explore API (no endpoint selected) sees a centered welcome layout with stats and help text, matching the Explore Types home screen pattern
4. User viewing recently visited sees both API endpoints and Types entries, with a link to navigate to /entities (Explore Types)
5. User opening Cmd+K in dark mode sees subdued, non-distracting borders on the search modal

**Plans:** 2 plans

Plans:
- [x] 10-01-PLAN.md — Home page icon branding, hardcoded stats, and recently visited expansion with Types entries
- [x] 10-02-PLAN.md — Explore API welcome screen redesign and dark mode search modal border fix

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
| 07.2. Add path to API Endpoints | v1.1 | 2/2 | Complete | 2026-02-14 |
| 8. Quality-of-Life Polish | v1.1 | 4/4 | Complete | 2026-02-15 |
| 9. Explore API Sidebar Polish | v1.2 | 3/3 | Complete | 2026-02-15 |
| 10. Home Screens & Visual Polish | v1.2 | 2/2 | Complete | 2026-02-15 |

---
*Roadmap created: 2026-02-11*
*Last updated: 2026-02-15 (phase 10 complete — v1.2 milestone complete)*
