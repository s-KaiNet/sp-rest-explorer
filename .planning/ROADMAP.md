# Roadmap: SP REST API Explorer — New UI

## Milestones

- ✅ **v2.0 Backend Rework** — Phases 18-21 (shipped 2026-02-24)
- ✅ **v1.0 MVP** — Phases 1-5 (shipped 2026-02-12) — [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 Search, Types & Polish** — Phases 6-8 (shipped 2026-02-15) — [archive](milestones/v1.1-ROADMAP.md)
- ✅ **v1.2 UI Improvements** — Phases 9-10 (shipped 2026-02-15) — [archive](milestones/v1.2-ROADMAP.md)
- ✅ **v1.3 Improvements** — Phases 11-12 (shipped 2026-02-17) — [archive](milestones/v1.3-ROADMAP.md)
- ✅ **v1.4 Unify Icons** — Phases 13-17 (shipped 2026-02-19) — [archive](milestones/v1.4-ROADMAP.md)

## Phases

### v2.0 Backend Rework (Phases 18-21)

- [x] **Phase 18: Project Scaffolding & Auth Validation** — New Functions v4 project with certificate-based SharePoint auth proven end-to-end (completed 2026-02-23)
- [x] **Phase 19: Data Pipeline** — Fetch metadata XML from SharePoint with retry/timeout, parse to JSON, compress with lz-string (completed 2026-02-23)
- [x] **Phase 20: Function Orchestration** — Wire pipeline into daily timer function with blob upload, structured logging, and operational controls (completed 2026-02-23)
- [x] **Phase 21: Deployment & Validation** — Build, publish to Azure, verify production blobs consumed by frontend (completed 2026-02-24)

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

<details>
<summary>v1.4 Unify Icons (Phases 13-17) — SHIPPED 2026-02-19</summary>

- [x] Phase 13: Icon System Foundation (2/2 plans) — completed 2026-02-18
- [x] Phase 14: Explore API Integration (1/1 plan) — completed 2026-02-18
- [x] Phase 15: Cross-View Consistency (2/2 plans) — completed 2026-02-18
- [x] Phase 16: Change color for entity links (1/1 plan) — completed 2026-02-18
- [x] Phase 17: Move icons in search modal (1/1 plan) — completed 2026-02-19

</details>

## Phase Details

### Phase 18: Project Scaffolding & Auth Validation
**Goal**: A working Azure Functions v4 project that acquires a valid SharePoint access token via certificate-based client credentials
**Depends on**: Nothing (first phase of v2.0)
**Requirements**: PROJ-01, PROJ-02, PROJ-03, AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. `func start` discovers and loads the function locally with zero errors
  2. Function acquires a valid access token from Entra ID using certificate-based client credentials (not client secret, not ROPC)
  3. Function can make a successful authenticated GET request to SharePoint `_api/web` returning a 200 response
  4. All credentials (tenant ID, client ID, certificate, SP URL) are loaded from environment variables — no hardcoded secrets
  5. TypeScript compiles in strict mode with zero errors and ESLint passes
**Plans**: 1 plan
Plans:
- [x] 18-01-PLAN.md — Scaffold project, auth module, HTTP trigger with end-to-end SharePoint validation

### Phase 19: Data Pipeline
**Goal**: Isolated, testable pipeline stages that fetch SharePoint metadata XML, parse it to the exact JSON shape the frontend consumes, and compress it
**Depends on**: Phase 18 (auth token required for fetch)
**Requirements**: FTCH-01, FTCH-02, FTCH-03, FTCH-04, PROC-01, PROC-02, PROC-03, PROC-04
**Success Criteria** (what must be TRUE):
  1. Fetch stage retrieves the full `_api/$metadata` XML from SharePoint with a valid Bearer token
  2. Fetch retries up to 3 times with exponential backoff on failures, respects 429 Retry-After headers, and times out after 60 seconds per attempt
  3. Parse stage produces JSON output identical in structure to legacy MetadataParser (entities, functions, associations, navProperties, collection types)
  4. TypeScript interfaces for all metadata types (EntityType, FunctionImport, Metadata, Property, NavigationProperty, Parameter, Association) are defined and used
  5. Compressed output via lz-string `compressToUTF16` is produced and can be decompressed back to the original JSON
**Plans**: 3 plans
Plans:
- [ ] 19-01-PLAN.md — Install deps, define metadata interfaces, build fetch module with retry/timeout
- [ ] 19-02-PLAN.md — TDD MetadataParser against golden reference (byte-identical JSON output)
- [ ] 19-03-PLAN.md — lz-string compression, pipeline entry point, integration tests

### Phase 20: Function Orchestration
**Goal**: A complete daily timer function that runs the full pipeline (auth → fetch → parse → compress → upload) and writes 6 blobs to Azure Blob Storage
**Depends on**: Phase 19 (pipeline stages must exist)
**Requirements**: BLOB-01, BLOB-02, BLOB-03, BLOB-04, BLOB-05, BLOB-06, BLOB-07, BLOB-08, OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, OPS-06, OPS-07
**Success Criteria** (what must be TRUE):
  1. Function uploads 6 blobs on each run: 3 latest files (`metadata.latest.json`, `.xml`, `.zip.json`) and 3 monthly snapshots (`{year}y_m{month}_metadata.*`) with 1-indexed months
  2. Function runs on a daily timer (configurable CRON schedule via app setting) and also exposes an HTTP trigger for manual execution with function key auth
  3. If the fetch stage fails after all retries, no blobs are written (all-or-nothing) — function exits with an error log
  4. Function logs structured milestones with durations for each pipeline stage (auth, fetch, parse, compress, upload)
  5. Blobs are uploaded to an auto-created `api-files` container with correct Content-Type headers and public blob access level
**Plans**: 2 plans
Plans:
- [ ] 20-01-PLAN.md — Install @azure/storage-blob, create blob upload module with buildBlobList() and uploadBlobs(), unit tests
- [ ] 20-02-PLAN.md — Shared handler with structured logging, timer trigger with retry, HTTP trigger, handler tests

### Phase 21: Deployment & Validation
**Goal**: Function deployed to Azure, running daily in production, producing blobs the frontend successfully loads
**Depends on**: Phase 20 (complete working function required)
**Requirements**: DEPL-01, DEPL-02, DEPL-03
**Success Criteria** (what must be TRUE):
  1. `npm run build` compiles TypeScript to JavaScript and `npm run deploy` publishes to Azure successfully
  2. Azure Portal shows the function registered and executing on its daily schedule
  3. Frontend loads metadata from the new blob URLs without any changes (data format compatibility confirmed)
**Plans**: 1 plan
Plans:
- [x] 21-01-PLAN.md — Update build/deploy scripts, deploy to Azure, configure secrets, validate production blobs

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|:--------------:|--------|-----------|
| 18. Project Scaffolding & Auth Validation | v2.0 | Complete    | 2026-02-23 | 2026-02-23 |
| 19. Data Pipeline | 3/3 | Complete    | 2026-02-23 | - |
| 20. Function Orchestration | 2/2 | Complete    | 2026-02-23 | - |
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
*Last updated: 2026-02-24 (v2.0 Backend Rework complete — Phase 21 shipped)*
