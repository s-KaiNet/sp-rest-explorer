# Project State: SP REST API Explorer — New UI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.
**Current focus:** Planning next milestone

**Key Constraints:**
- Frontend tech stack locked: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, Lucide React, lz-string, React Router 7
- Backend tech stack locked: Azure Functions v4, TypeScript 5.7, MSAL Node 2, @azure/storage-blob 12
- GitHub Pages hosting (hash routing required, deployed via GitHub Actions)
- Azure Functions hosting (sp-rest-explorer-new)
- Azure Blob Storage data format is fixed
- Desktop only for frontend
- Incremental delivery — each phase deployable

## Current Position

Phase: None — between milestones
Plan: N/A
Status: v2.3 milestone complete — ready for next milestone planning
Last activity: 2026-02-25 — v2.3 GH Pages milestone archived

```
v2.3 Progress: ████████████████████ 100% (1/1 phases: 29 ✓) — SHIPPED
v2.2 Progress: ████████████████████ 100% (5/5 phases: 24 ✓, 25 ✓, 26 ✓, 27 ✓, 28 ✓) — SHIPPED
v2.1 Progress: ████████████████████ 100% (2/2 phases: 22 ✓, 23 ✓) — SHIPPED
v2.0 Progress: ████████████████████ 100% (4/4 phases: 18 ✓, 19 ✓, 20 ✓, 21 ✓) — SHIPPED
v1.0 Progress: ████████████████████ 100% (5/5 phases: 1-5) — SHIPPED
v1.1 Progress: ████████████████████ 100% (5/5 phases: 06, 07, 07.1, 07.2, 08) — SHIPPED
v1.2 Progress: ████████████████████ 100% (2/2 phases: 09, 10) — SHIPPED
v1.3 Progress: ████████████████████ 100% (2/2 phases: 11 ✓, 12 ✓) — SHIPPED
v1.4 Progress: ████████████████████ 100% (5/5 phases: 13 ✓, 14 ✓, 15 ✓, 16 ✓, 17 ✓) — SHIPPED
```

## Performance Metrics

| Metric | v1.0 | v1.1 | v1.2 | v1.3 | v1.4 | v2.0 | v2.1 | v2.2 | v2.3 |
|--------|------|------|------|------|------|------|------|------|------|
| Phases completed | 5 | 5 | 2 | 2 | 5 | 4 | 2 | 5 | 1 |
| Plans executed | 11 | 13 | 5 | 4 | 7 | 7 | 2 | 8 | 2 |
| Tasks completed | 25 | 28 | 9 | 8 | 12 | 17 | 5 | 13 | 4 |
| Requirements validated | 38 | 13 | 9 | 6 | 16 | 31 | 12 | 22 | 8 |
| Timeline | 2 days | 3 days | 1 day | 1 day | 2 days | 2 days | 2 days | 1 day | 1 day |

## Accumulated Context

### Key Decisions
See PROJECT.md Key Decisions table for full list with outcomes.

**Phase 29-01:** Trigger on master branch (not main) — repo default branch. Single build-and-deploy job. Widen objectHash type + ES2023 lib for CI strict mode compatibility.
**Phase 29-02:** Clean atomic deletion of docs/ build artifacts — single git rm -r commit.

### Roadmap Evolution
- Phase 07.1 inserted after Phase 7: Fix search experience (URGENT)
- Phase 07.2 inserted after Phase 07.1: Add path to API Endpoints index (URGENT)
- Phase 09-03 inserted: Gap closure for namespace grouping (used entry.returnType instead of entry.name)
- Phase 13-02 inserted: Gap closure for root-type color migration (root elements rendering orange instead of green)
- Phase 16 added: Change color for entity links
- Phase 17 added: Move icons in search modal
- Phase 23 added: Recently visited fix
- Phase 28 added: API Changelog changes

### Known Risks
- JSON.parse() may block main thread 200-800ms on 4MB fetch — CSS spinner in index.html as mitigation
- Zustand v5 selector instability — use scalar selectors or `useShallow`

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

**Last session:** 2026-02-25
**What happened:** Completed v2.3 GH Pages milestone — archived to milestones/, updated ROADMAP.md, PROJECT.md, MILESTONES.md. Git tagged v2.3.
**Next step:** Run `/gsd-new-milestone` to start next milestone (questioning → research → requirements → roadmap).

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-25 (v2.3 milestone archived)*
