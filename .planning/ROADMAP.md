# Roadmap: SP REST API Explorer — New UI

## Milestones

- 🔄 **v2.1 Connect Frontend** — Phase 22 (in progress)
- ✅ **v2.0 Backend Rework** — Phases 18-21 (shipped 2026-02-24) — [archive](milestones/v2.0-ROADMAP.md)
- ✅ **v1.0 MVP** — Phases 1-5 (shipped 2026-02-12) — [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Search, Types & Polish** — Phases 6-8 (shipped 2026-02-15) — [archive](milestones/v1.1-ROADMAP.md)
- ✅ **v1.2 UI Improvements** — Phases 9-10 (shipped 2026-02-15) — [archive](milestones/v1.2-ROADMAP.md)
- ✅ **v1.3 Improvements** — Phases 11-12 (shipped 2026-02-17) — [archive](milestones/v1.3-ROADMAP.md)
- ✅ **v1.4 Unify Icons** — Phases 13-17 (shipped 2026-02-19) — [archive](milestones/v1.4-ROADMAP.md)

## Phases

- [x] **Phase 22: Switch to Compressed Data Source** (1 plan) — Frontend fetches from new backend and decompresses metadata client-side with ~75% network savings (completed 2026-02-24)

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

### Phase 22: Switch to Compressed Data Source
**Goal**: Frontend loads metadata from the new backend's compressed blobs with lz-string decompression, delivering ~75% network savings while preserving the existing app experience
**Depends on**: Phase 21 (new backend must be deployed and producing blobs)
**Requirements**: DSRC-01, DSRC-02, DCMP-01, DCMP-02, DCMP-03, DCMP-04, DCMP-05
**Success Criteria** (what must be TRUE):
  1. App boots successfully from a cold start (no cache) — fetches compressed blob from new storage account, decompresses, parses, and renders the home screen with live stats
  2. App boots successfully from a warm start (cached) — loads decompressed metadata from IndexedDB instantly, then revalidates in the background by fetching and decompressing the compressed blob
  3. Network transfer for metadata is ~557KB (compressed) instead of ~2.2MB (uncompressed) — verifiable in browser DevTools Network tab
  4. All existing app functionality works identically after the switch — entity browsing, search, type exploration, navigation, detail panels all render the same data
  5. METADATA_URL is defined in a single location (constants.ts) pointing to `sprestapiexplorernew.blob.core.windows.net/api-files/metadata.latest.zip.json`
**Plans:** 1/1 plans complete

Plans:
- [x] 22-01-PLAN.md — Install lz-string, switch METADATA_URL, wire decompression into fetch pipeline

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|:--------------:|--------|-----------|
| 22. Switch to Compressed Data Source | 1/1 | Complete    | 2026-02-24 | - |
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
| 23. Recently visited fix | v2.1 | Complete    | 2026-02-24 | 2026-02-25 |

### Phase 23: Recently visited fix

**Goal:** Fix three recently visited bugs: (1) clear button doesn't purge in-memory state across components, (2) entity type icon shows Box instead of Braces when selected from search, (3) endpoint icons always show function icon regardless of actual type — by migrating to a Zustand store and expanding SearchSelection with granular kinds
**Depends on:** Phase 22
**Requirements:** RVIS-01, RVIS-02, RVIS-03, RVIS-04, RVIS-05
**Success Criteria** (what must be TRUE):
  1. Clicking "Clear" on the home page removes all recently visited entries and they do not reappear on any page or after navigation
  2. Selecting an entity from search records it with kind `'entity'` and displays the Braces icon (orange) in recently visited
  3. Selecting an endpoint from search records it with the correct kind (`'function'`, `'navProperty'`, or `'root'`) and displays the matching icon
  4. All consumers (App.tsx, ExplorePage, TypesPage, HomePage) share a single Zustand store instance — no independent useState for recently visited state
  5. Old localStorage entries with buggy kinds are cleared on store upgrade
**Plans:** 1/1 plans complete

Plans:
- [x] 23-01-PLAN.md — Migrate to Zustand store with persist, expand SearchSelection kind, fix icon mapping

---
*Roadmap created: 2026-02-11*
*Last updated: 2026-02-24 (v2.1 Connect Frontend roadmap added)*
