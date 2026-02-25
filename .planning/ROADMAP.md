# Roadmap: SP REST API Explorer — New UI

## Milestones

- 🔄 **v2.2 API Changelog** — Phases 24-27 (in progress)
- ✅ **v2.1 Connect Frontend** — Phases 22-23 (shipped 2026-02-25) — [archive](milestones/v2.1-ROADMAP.md)
- ✅ **v2.0 Backend Rework** — Phases 18-21 (shipped 2026-02-24) — [archive](milestones/v2.0-ROADMAP.md)
- ✅ **v1.0 MVP** — Phases 1-5 (shipped 2026-02-12) — [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Search, Types & Polish** — Phases 6-8 (shipped 2026-02-15) — [archive](milestones/v1.1-ROADMAP.md)
- ✅ **v1.2 UI Improvements** — Phases 9-10 (shipped 2026-02-15) — [archive](milestones/v1.2-ROADMAP.md)
- ✅ **v1.3 Improvements** — Phases 11-12 (shipped 2026-02-17) — [archive](milestones/v1.3-ROADMAP.md)
- ✅ **v1.4 Unify Icons** — Phases 13-17 (shipped 2026-02-19) — [archive](milestones/v1.4-ROADMAP.md)

## Phases

- [ ] **Phase 24: Diff Engine** - Port DiffGenerator and wire blob fetch + diff computation pipeline
- [ ] **Phase 25: Changelog Page Shell** - Routable page with header nav, summary bar, loading/error/empty states
- [ ] **Phase 26: Change Detail Views** - Entity cards with property-level changes, root functions table, badges
- [ ] **Phase 27: Filtering & Range Selection** - Range selector (1-6 months), filter chips, entity name links

<details>
<summary>✅ v2.1 Connect Frontend (Phases 22-23) — SHIPPED 2026-02-25</summary>

- [x] Phase 22: Switch to Compressed Data Source (1/1 plan) — completed 2026-02-24
- [x] Phase 23: Recently Visited Fix (1/1 plan) — completed 2026-02-25

</details>

<details>
<summary>✅ v2.0 Backend Rework (Phases 18-21) — SHIPPED 2026-02-24</summary>

- [x] Phase 18: Project Scaffolding & Auth Validation (1/1 plan) — completed 2026-02-23
- [x] Phase 19: Data Pipeline (3/3 plans) — completed 2026-02-23
- [x] Phase 20: Function Orchestration (2/2 plans) — completed 2026-02-23
- [x] Phase 21: Deployment & Validation (1/1 plan) — completed 2026-02-24

</details>

<details>
<summary>✅ v1.0 MVP (Phases 1-5) — SHIPPED 2026-02-12</summary>

- [x] Phase 1: Project Scaffolding (2/2 plans) — completed 2026-02-11
- [x] Phase 2: Data Layer & UI Foundation (2/2 plans) — completed 2026-02-11
- [x] Phase 3: Navigation System (2/2 plans) — completed 2026-02-11
- [x] Phase 4: Explore API Views (2/2 plans) — completed 2026-02-11
- [x] Phase 5: Entity & Function Detail (3/3 plans) — completed 2026-02-12

</details>

<details>
<summary>✅ v1.1 Search, Types & Polish (Phases 6-8) — SHIPPED 2026-02-15</summary>

- [x] Phase 6: Global Search (2/2 plans) — completed 2026-02-12
- [x] Phase 7: Explore Types (3/3 plans) — completed 2026-02-14
- [x] Phase 07.1: Fix search experience (2/2 plans) — completed 2026-02-14
- [x] Phase 07.2: Add path to API Endpoints index (2/2 plans) — completed 2026-02-14
- [x] Phase 8: Quality-of-Life Polish (4/4 plans) — completed 2026-02-15

</details>

<details>
<summary>✅ v1.2 UI Improvements (Phases 9-10) — SHIPPED 2026-02-15</summary>

- [x] Phase 9: Explore API Sidebar Polish (3/3 plans) — completed 2026-02-15
- [x] Phase 10: Home Screens & Visual Polish (2/2 plans) — completed 2026-02-15

</details>

<details>
<summary>✅ v1.3 Improvements (Phases 11-12) — SHIPPED 2026-02-17</summary>

- [x] Phase 11: Search UX Fixes (2/2 plans) — completed 2026-02-17
- [x] Phase 12: Detail & Layout Fixes (2/2 plans) — completed 2026-02-17

</details>

<details>
<summary>✅ v1.4 Unify Icons (Phases 13-17) — SHIPPED 2026-02-19</summary>

- [x] Phase 13: Icon System Foundation (2/2 plans) — completed 2026-02-18
- [x] Phase 14: Explore API Integration (1/1 plan) — completed 2026-02-18
- [x] Phase 15: Cross-View Consistency (2/2 plans) — completed 2026-02-18
- [x] Phase 16: Change color for entity links (1/1 plan) — completed 2026-02-18
- [x] Phase 17: Move icons in search modal (1/1 plan) — completed 2026-02-19

</details>

## Phase Details

### Phase 24: Diff Engine
**Goal**: App can fetch current and historical metadata blobs, decompress them, and compute a structured diff describing added/updated/removed entities and functions
**Depends on**: Phase 23 (existing metadata fetch pipeline and lz-string decompression)
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. App fetches metadata.latest.zip.json and a historical monthly blob (e.g., 2026y_m1_metadata.zip.json) from Azure Blob Storage
  2. Both blobs are decompressed client-side using lz-string decompressFromUTF16 into parsed metadata objects
  3. DiffGenerator (ported from az-funcs/ to app/src/lib/) produces a structured diff result with added, updated, and removed entities and root functions
  4. jsondiffpatch is installed as a project dependency and used by DiffGenerator for property-level diffing
**Plans**: 2 plans

Plans:
- [ ] 24-01-PLAN.md — Install jsondiffpatch, define diff types, port DiffGenerator, create historical blob fetch
- [ ] 24-02-PLAN.md — Create diff store singleton with reactive hooks and orchestration

### Phase 25: Changelog Page Shell
**Goal**: Users can navigate to the API Changelog page and see a functional page skeleton with summary counts, loading feedback, and graceful handling of errors and empty results
**Depends on**: Phase 24 (diff engine must produce data for the page to render)
**Requirements**: VIEW-01, VIEW-02, VIEW-05, INTG-01, INTG-02, INTG-03, INTG-04, FILT-04
**Success Criteria** (what must be TRUE):
  1. User can click "API Changelog" in the app header and land on the changelog page at a dedicated hash route
  2. User sees a loading indicator while metadata blobs are being fetched and the diff is being computed
  3. User sees a summary bar displaying counts of added, updated, and removed entities/functions once the diff completes
  4. User sees a friendly empty state message when no changes exist for the selected period
  5. User sees a clear error message if blob fetching fails or a historical blob is missing
**Plans**: TBD

### Phase 26: Change Detail Views
**Goal**: Users can inspect the full details of API changes — expandable entity cards with property-level diffs, a root functions change table, and color-coded change-type badges on every item
**Depends on**: Phase 25 (page shell must exist to render detail content into)
**Requirements**: VIEW-03, VIEW-04, VIEW-06
**Success Criteria** (what must be TRUE):
  1. User sees expandable entity cards that reveal property-level and function-level changes (added/removed/updated properties and bound functions)
  2. User sees a root functions section showing added, updated, and removed top-level functions in a table layout
  3. Every entity card and individual change row displays a color-coded badge indicating the change type (New, Added, Removed, Updated)
**Plans**: TBD

### Phase 27: Filtering & Range Selection
**Goal**: Users can control what they see in the changelog — selecting a time range for cumulative diffs and filtering by change type — and can navigate from changelog entries to detailed type information
**Depends on**: Phase 26 (detail views must exist to be filtered and linked)
**Requirements**: DATA-04, FILT-01, FILT-02, FILT-03
**Success Criteria** (what must be TRUE):
  1. User can select a range of 1-6 months via a range selector control (default: 1 month) and the changelog updates to show the cumulative diff for that period
  2. User can toggle filter chips to show/hide Added, Updated, and Removed change categories, and the changelog view updates immediately
  3. User can click any entity name in the changelog to navigate to the Explore Types detail page (/types/{fullName})
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|:--------------:|--------|-----------|
| 24. Diff Engine | v2.2 | 0/? | Not started | - |
| 25. Changelog Page Shell | v2.2 | 0/? | Not started | - |
| 26. Change Detail Views | v2.2 | 0/? | Not started | - |
| 27. Filtering & Range Selection | v2.2 | 0/? | Not started | - |
| 22. Switch to Compressed Data Source | v2.1 | 1/1 | Complete | 2026-02-24 |
| 23. Recently Visited Fix | v2.1 | 1/1 | Complete | 2026-02-25 |
| 18. Project Scaffolding & Auth Validation | v2.0 | 1/1 | Complete | 2026-02-23 |
| 19. Data Pipeline | v2.0 | 3/3 | Complete | 2026-02-23 |
| 20. Function Orchestration | v2.0 | 2/2 | Complete | 2026-02-23 |
| 21. Deployment & Validation | v2.0 | 1/1 | Complete | 2026-02-24 |
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
| 13. Icon System Foundation | v1.4 | 2/2 | Complete | 2026-02-18 |
| 14. Explore API Integration | v1.4 | 1/1 | Complete | 2026-02-18 |
| 15. Cross-View Consistency | v1.4 | 2/2 | Complete | 2026-02-18 |
| 16. Change color for entity links | v1.4 | 1/1 | Complete | 2026-02-18 |
| 17. Move icons in search modal | v1.4 | 1/1 | Complete | 2026-02-19 |

---
*Roadmap created: 2026-02-11*
*Last updated: 2026-02-25 (v2.2 API Changelog roadmap created)*
