# Roadmap: SP REST API Explorer — New UI

## Milestones

- ✅ **v1.0 MVP** — Phases 1-5 (shipped 2026-02-12) — [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Search, Types & Polish** — Phases 6-8 (shipped 2026-02-15) — [archive](milestones/v1.1-ROADMAP.md)
- ✅ **v1.2 UI Improvements** — Phases 9-10 (shipped 2026-02-15) — [archive](milestones/v1.2-ROADMAP.md)
- ✅ **v1.3 Improvements** — Phases 11-12 (shipped 2026-02-17) — [archive](milestones/v1.3-ROADMAP.md)
- 🔄 **v1.4 Unify Icons** — Phases 13-15

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

<details>
<summary>v1.3 Improvements (Phases 11-12) — SHIPPED 2026-02-17</summary>

- [x] Phase 11: Search UX Fixes (2/2 plans) — completed 2026-02-17
- [x] Phase 12: Detail & Layout Fixes (2/2 plans) — completed 2026-02-17

</details>

### v1.4 Unify Icons (Phases 13-15)

- [x] **Phase 13: Icon System Foundation** — Define Lucide icon set, TypeIcon component, and CSS color tokens for all 4 API types (completed 2026-02-18)
  **Plans:** 1 plan
  Plans:
  - [ ] 13-01-PLAN.md — CSS color tokens + ApiType type + TypeIcon component
- [ ] **Phase 14: Explore API Integration** — Apply icon system to Explore API sidebar, welcome screen, and namespace groups
  **Plans:** TBD
- [ ] **Phase 15: Cross-View Consistency** — Apply icons to search modal, home page, and Explore Types views
  **Plans:** TBD

## Phase Details

<details>
<summary>v1.3 Phase Details (archived)</summary>

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

</details>

### Phase 13: Icon System Foundation
**Goal**: A reusable icon system exists for all 4 API types — each type has a distinct Lucide icon and CSS color token, ready to be used everywhere
**Depends on**: Nothing (foundational work for v1.4)
**Requirements**: ICON-01, ICON-02, ICON-03, ICON-04
**Success Criteria** (what must be TRUE):
  1. A `TypeIcon` component renders a distinct Lucide icon for each of the 4 API types: root, nav property, function, and type/entity
  2. Each icon renders in its designated type color (root = green, nav property = purple, function = blue, type/entity = orange/amber)
  3. A `--type-root` CSS custom property exists and produces a green color (OKLCH hue ~155) distinct from the other type colors
  4. The `--type-entity` CSS custom property produces an orange/amber color (OKLCH hue ~75-85) clearly distinguishable from the root green

### Phase 14: Explore API Integration
**Goal**: The Explore API sidebar and welcome screen use the new icon system — icons appear left of labels, text badges are gone, namespace groups show correct type icons
**Depends on**: Phase 13
**Requirements**: EAPI-01, EAPI-02, EAPI-03, EAPI-04
**Success Criteria** (what must be TRUE):
  1. Every entry in the Explore API sidebar shows its type icon to the left of the label text (icon-first layout: `[icon] Label`)
  2. No `FN`, `NAV`, or `<>` text badges appear anywhere in the Explore API sidebar — all replaced by Lucide icons
  3. The Explore API welcome screen displays Lucide icons with correct type colors matching the new icon system
  4. Root-level namespace-grouped entries in the sidebar show type icons consistent with the icon system (root entries = green icon, functions = blue icon, etc.)

### Phase 15: Cross-View Consistency
**Goal**: Every view in the app uses the unified icon system — search modal, home page, Explore Types all show consistent Lucide icons with correct type colors
**Depends on**: Phase 13
**Requirements**: XVEW-01, XVEW-02, XVEW-03, XVEW-04, XVEW-05
**Success Criteria** (what must be TRUE):
  1. Cmd+K search modal results display Lucide type icons — no `<>`, `ƒ`, `NAV`, or `T` text symbols remain
  2. Individual search result items no longer show a "Root" pill badge — root status is conveyed solely by the green root icon
  3. Home page recently visited cards display Lucide icons matching the type of each visited item
  4. The Explore Types welcome screen displays the type/entity Lucide icon in orange/amber
  5. The Explore Types sidebar entries display Lucide icons consistent with the new icon system

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
| 12. Detail & Layout Fixes | v1.3 | 2/2 | Complete | 2026-02-17 |
| 13. Icon System Foundation | 2/2 | Complete    | 2026-02-18 | - |
| 14. Explore API Integration | v1.4 | 0/? | Not started | - |
| 15. Cross-View Consistency | v1.4 | 0/? | Not started | - |

---
*Roadmap created: 2026-02-11*
*Last updated: 2026-02-18 (v1.4 roadmap — phases 13-15)*
