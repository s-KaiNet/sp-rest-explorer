# Project State: SP REST API Explorer — New UI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.
**Current focus:** v2.2 API Changelog — Phase 27 (Filtering & Range Selection)

**Key Constraints:**
- Frontend tech stack locked: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, Lucide React, lz-string, React Router 7
- Backend tech stack locked: Azure Functions v4, TypeScript 5.7, MSAL Node 2, @azure/storage-blob 12
- GitHub Pages hosting (hash routing required)
- Azure Functions hosting (sp-rest-explorer-new)
- Azure Blob Storage data format is fixed
- Desktop only for frontend
- Incremental delivery — each phase deployable

## Current Position

Phase: 27 — Filtering & Range Selection
Plan: 1 of 2 ✓
Status: Plan 27-01 complete — range dropdown and filter chips
Last activity: 2026-02-25 — Plan 01 (range dropdown & filter chips) complete

```
v2.2 Progress: ███████████████░░░░░  75% (3/4 phases: 24 ✓, 25 ✓, 26 ✓, 27)
v2.1 Progress: ████████████████████ 100% (2/2 phases: 22 ✓, 23 ✓) — SHIPPED
v2.0 Progress: ████████████████████ 100% (4/4 phases: 18 ✓, 19 ✓, 20 ✓, 21 ✓) — SHIPPED
v1.0 Progress: ████████████████████ 100% (5/5 phases: 1-5) — SHIPPED
v1.1 Progress: ████████████████████ 100% (5/5 phases: 06, 07, 07.1, 07.2, 08) — SHIPPED
v1.2 Progress: ████████████████████ 100% (2/2 phases: 09, 10) — SHIPPED
v1.3 Progress: ████████████████████ 100% (2/2 phases: 11 ✓, 12 ✓) — SHIPPED
v1.4 Progress: ████████████████████ 100% (5/5 phases: 13 ✓, 14 ✓, 15 ✓, 16 ✓, 17 ✓) — SHIPPED
```

## Performance Metrics

| Metric | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | v2.0 | v2.1 | v2.2 |
|--------|------|------|------|------|------|------|------|------|
| Phases completed | 5 | 5 | 2 | 2 | 5 | 4 | 2 | 2 |
| Plans executed | 11 | 13 | 5 | 4 | 7 | 7 | 2 | 4 |
| Tasks completed | 25 | 28 | 9 | 8 | 12 | 17 | 5 | 9 |
| Requirements validated | 38 | 13 | 9 | 6 | 16 | 31 | 12 | 14 |
| Timeline | 2 days | 3 days | 1 day | 1 day | 2 days | 2 days | 2 days | — |
| Phase 24 P01 | 2 min | 3 tasks | 7 files |
| Phase 24 P02 | 1 min | 2 tasks | 2 files |
| Phase 25 P01 | 3 min | 2 tasks | 1 files |
| Phase 26 P01 | 2 min | 2 tasks | 3 files |
| Phase 27 P01 | 3 min | 2 tasks | 1 files |

## Accumulated Context

### Key Decisions
See PROJECT.md Key Decisions table for full list with outcomes.

**Phase 24-01:** ChangeType as string union (not enum) — codebase convention. structuredClone() for deep copy. null-on-404 for missing historical blobs. Renamed functionIds→functions in DiffEntity.
**Phase 24-02:** Same useSyncExternalStore singleton pattern as metadata-store.ts. 404 blobs → empty DiffChanges (not error). Separate hooks for result/status/error for fine-grained re-renders.
**Phase 25-01:** Combined entity+function counts per stat card. Always show 3 stat cards even with zero counts. Empty state below zero-count cards, not replacing them. parseMonthKey helper with null-on-invalid for safe URL param parsing.
**Phase 26-01:** Hide empty sub-sections rather than showing empty state headers. PropertySubSection extracted as internal helper (not separate file) for reuse across 3 sub-sections. No card shadow — clean flat border.
**Phase 27-01:** Native HTML select for range dropdown (no deps). Set<ChangeType> for filter state. Summary cards always show full totals. Subtitle shows current month (not comparison month).

### v2.2 Phase Design Rationale
- **Phase 24 (Diff Engine)** is pure data: fetch historical blobs, decompress, port DiffGenerator, compute diffs. No UI — this is the foundation everything else renders.
- **Phase 25 (Page Shell)** creates the visible page: route, header nav entry, loading/error/empty states, summary bar. Wires Phase 24 output into a renderable page.
- **Phase 26 (Detail Views)** adds the content: expandable entity cards with property-level diffs, root functions table, change-type badges. The "meat" of the changelog.
- **Phase 27 (Filtering & Range)** adds interactivity on top: range selector triggers re-fetch + re-diff for cumulative periods, filter chips toggle visibility, entity names link to Explore Types.

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
- Historical blobs may not exist for all months (new backend started recently) — must handle missing blobs gracefully
- Two concurrent blob fetches (latest + historical) — coordinate loading state

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

**Last session:** 2026-02-25T16:39:32Z
**What happened:** Executed Plan 27-01 (range dropdown & filter chips). Added toolbar with range selector and filter chips to ChangelogPage. Fixed subtitle bug (showing comparison month instead of current month).
**Next step:** Execute Plan 27-02 — entity name links to Explore Types

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-25 (plan 27-01 complete)*
