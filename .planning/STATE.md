# Project State: SP REST API Explorer — New UI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-24)

**Core value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.
**Current focus:** Milestone v2.1 Connect Frontend — Phase 23

**Key Constraints:**
- Frontend tech stack locked: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, Lucide React, React Router 7
- Backend tech stack locked: Azure Functions v4, TypeScript 5.7, MSAL Node 2, @azure/storage-blob 12
- GitHub Pages hosting (hash routing required)
- Azure Functions hosting (sp-rest-explorer-new)
- Azure Blob Storage data format is fixed
- Desktop only for frontend
- Incremental delivery — each phase deployable

## Current Position

Phase: 23 — Recently Visited Fix
Plan: 1 of 1 ✓
Status: Phase 23 complete — all plans executed
Last activity: 2026-02-25 — Phase 23 plan 01 executed (recently visited bug fixes)

```
v2.1 Progress: ████████████████████ 100% (2/2 phases: 22 ✓, 23 ✓)
v2.0 Progress: ████████████████████ 100% (4/4 phases: 18 ✓, 19 ✓, 20 ✓, 21 ✓) — SHIPPED
v1.0 Progress: ████████████████████ 100% (5/5 phases: 1-5) — SHIPPED
v1.1 Progress: ████████████████████ 100% (5/5 phases: 06, 07, 07.1, 07.2, 08) — SHIPPED
v1.2 Progress: ████████████████████ 100% (2/2 phases: 09, 10) — SHIPPED
v1.3 Progress: ████████████████████ 100% (2/2 phases: 11 ✓, 12 ✓) — SHIPPED
v1.4 Progress: ████████████████████ 100% (5/5 phases: 13 ✓, 14 ✓, 15 ✓, 16 ✓, 17 ✓) — SHIPPED
```

## Performance Metrics

| Metric | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | v2.0 | v2.1 |
|--------|------|------|------|------|------|------|------|
| Phases completed | 5 | 5 | 2 | 2 | 5 | 4 | 2 |
| Plans executed | 11 | 13 | 5 | 4 | 7 | 7 | 2 |
| Tasks completed | 25 | 28 | 9 | 8 | 12 | 17 | 5 |
| Requirements validated | 38 | 13 | 9 | 6 | 16 | 31 | 12 |
| Timeline | 2 days | 3 days | 1 day | 1 day | 2 days | 2 days | 1 day |

## Accumulated Context

### Key Decisions
See PROJECT.md Key Decisions table for full list with outcomes.

### Roadmap Evolution
- Phase 07.1 inserted after Phase 7: Fix search experience (URGENT)
- Phase 07.2 inserted after Phase 07.1: Add path to API Endpoints index (URGENT)
- Phase 09-03 inserted: Gap closure for namespace grouping (used entry.returnType instead of entry.name)
- Phase 13-02 inserted: Gap closure for root-type color migration (root elements rendering orange instead of green)
- Phase 16 added: Change color for entity links
- Phase 17 added: Move icons in search modal
- Phase 23 added: Recently visited fix

### Known Risks
- JSON.parse() may block main thread 200-800ms on 4MB fetch — CSS spinner in index.html as mitigation
- Zustand v5 selector instability — use scalar selectors or `useShallow`
- lz-string decompressFromUTF16 adds ~30-80ms to boot — acceptable for ~3.5MB network savings

### Technical Debt
- TypeLink navigates to /entity/{fullName} for all types — no entity-to-API-path resolver
- Legacy `az-funcs/` directory can be removed now that `backend/` is deployed

### Blockers
- (None)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Replace initial screen loading skeleton with regular loading indicator | 2026-02-17 | c170a4d | [1-replace-initial-screen-loading-skeleton-](./quick/1-replace-initial-screen-loading-skeleton-/) |
| 2 | Narrow search result rows, increase results per group to 7, taller dialog | 2026-02-17 | 756a2e4 | [2-narrow-search-result-rows-increase-resul](./quick/2-narrow-search-result-rows-increase-resul/) |

## Session Continuity

**Last session:** 2026-02-25T00:07:00Z
**What happened:** Executed phase 23 plan 01 — migrated recently visited to Zustand store with persist middleware, expanded SearchSelection kind, removed lossy kindMap. All three bugs fixed and verified. Human-verify checkpoint APPROVED.
**Next step:** `/gsd-complete-milestone` for v2.1

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-25 (phase 23 plan 01 executed)*
