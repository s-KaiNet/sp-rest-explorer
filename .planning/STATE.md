# Project State: SP REST API Explorer — New UI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.
**Current focus:** v2.0 Backend Rework — rewrite Azure Functions backend

**Key Constraints:**
- Tech stack locked: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, Lucide React, React Router 7
- GitHub Pages hosting (hash routing required)
- Azure Blob Storage data format is fixed
- Desktop only for v1
- Incremental delivery — each phase deployable

## Current Position

Phase: 20 — Function Orchestration
Plan: 1/2 complete
Status: In progress — Plan 01 (blob upload module) complete, Plan 02 (handler + triggers) next
Last activity: 2026-02-23 — Phase 20 Plan 01 executed (blob upload module with buildBlobList + uploadBlobs)

```
v2.0 Progress: ██████████░░░░░░░░░░  50% (2/4 phases: 18 ✓, 19 ✓, 20, 21)
v1.0 Progress: ████████████████████ 100% (5/5 phases: 1-5) — SHIPPED
v1.1 Progress: ████████████████████ 100% (5/5 phases: 06, 07, 07.1, 07.2, 08) — SHIPPED
v1.2 Progress: ████████████████████ 100% (2/2 phases: 09, 10) — SHIPPED
v1.3 Progress: ████████████████████ 100% (2/2 phases: 11 ✓, 12 ✓) — SHIPPED
v1.4 Progress: ████████████████████ 100% (5/5 phases: 13 ✓, 14 ✓, 15 ✓, 16 ✓, 17 ✓) — SHIPPED
```

## Performance Metrics

| Metric | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 |
|--------|------|------|------|------|------|
| Phases completed | 5 | 5 | 2 | 2 | 5 |
| Plans executed | 11 | 13 | 5 | 4 | 7 |
| Tasks completed | 25 | 28 | 9 | 8 | 12 |
| Requirements validated | 38 | 13 | 9 | 6 | 16 |
| Timeline | 2 days | 3 days | 1 day | 1 day | 2 days |

## Accumulated Context

### Key Decisions
See PROJECT.md Key Decisions table for full list with outcomes.

**v2.0 Decisions:**
- (18-01) Used `backend/` directory name for new Azure Functions project
- (18-01) authLevel: 'function' for validateAuth HTTP trigger
- (18-01) MSAL thumbprintSha256 (not deprecated thumbprint) for certificate auth
- (18-01) PEM newline normalization in auth module for env var encoding resilience
- (19-01) All 7 metadata interfaces in single file (interfaces.ts) — reduces import complexity
- (19-01) FunctionImport boolean flags made optional to match actual serialized JSON shape
- (19-01) transformResponse override on axios to prevent XML JSON.parse
- (19-02) Plain async function over class for parser — cleaner API, no stateful coupling
- (19-02) Type assertions for readonly property mutation during parser construction
- (19-02) Vitest as test runner — TypeScript-native, zero config
- (19-03) Thin compressJson() wrapper over lz-string — single place to change compression strategy
- (19-03) PipelineResult stores all three artifacts (xml, json, compressedJson) for Phase 20 flexibility
- (19-03) Integration tests without mocking — exercises real parse→compress chain against golden fixtures
- (20-01) Buffer.byteLength('utf-8') for upload content length — critical for multi-byte lz-string output
- (20-01) Separated buildBlobList() as exported pure function for easy unit testing without SDK mocking
- (20-01) Descriptive error throw on missing AzureWebJobsStorage env var — fail fast

### Roadmap Evolution
- Phase 07.1 inserted after Phase 7: Fix search experience (URGENT)
- Phase 07.2 inserted after Phase 07.1: Add path to API Endpoints index (URGENT)
- Phase 09-03 inserted: Gap closure for namespace grouping (used entry.returnType instead of entry.name)
- Phase 13-02 inserted: Gap closure for root-type color migration (root elements rendering orange instead of green)
- Phase 16 added: Change color for entity links
- Phase 17 added: Move icons in search modal

### Known Risks
- JSON.parse() may block main thread 200-800ms on 4MB fetch — CSS spinner in index.html as mitigation
- Zustand v5 selector instability — use scalar selectors or `useShallow`

### Technical Debt
- TypeLink navigates to /entity/{fullName} for all types — no entity-to-API-path resolver
- Recently visited kind mapping relies on depth heuristic (depth 2 = root)

### Blockers
- (None)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Replace initial screen loading skeleton with regular loading indicator | 2026-02-17 | c170a4d | [1-replace-initial-screen-loading-skeleton-](./quick/1-replace-initial-screen-loading-skeleton-/) |
| 2 | Narrow search result rows, increase results per group to 7, taller dialog | 2026-02-17 | 756a2e4 | [2-narrow-search-result-rows-increase-resul](./quick/2-narrow-search-result-rows-increase-resul/) |

## Session Continuity

**Last session:** 2026-02-23T21:31:05.465Z
**What happened:** Executed Phase 20 Plan 01 — installed @azure/storage-blob, created blob-uploader.ts with buildBlobList() and uploadBlobs(), 5 unit tests pass. 3 min execution.
**Next step:** Execute Phase 20 Plan 02 — shared handler with structured logging, timer trigger, HTTP trigger

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-23 (Phase 20 Plan 01 complete — blob upload module)*
