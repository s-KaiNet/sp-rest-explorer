# Project State: SP REST API Explorer — New UI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-15)

**Core value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.
**Current focus:** v1.3 Improvements — Search UX fixes, detail & layout fixes

**Key Constraints:**
- Tech stack locked: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, React Router 7
- GitHub Pages hosting (hash routing required)
- Azure Blob Storage data format is fixed
- Desktop only for v1
- Incremental delivery — each phase deployable

## Current Position

**Milestone:** v1.3 Improvements
Phase: 12 — Detail & Layout Fixes (complete, 2/2 plans)
Plan: 02 complete
Status: Phase 12 complete — v1.3 milestone complete
Last activity: 2026-02-17 - Completed 12-02: breadcrumb scroll fix (flex column split)

```
v1.0 Progress: ████████████████████ 100% (5/5 phases: 1-5) — SHIPPED
v1.1 Progress: ████████████████████ 100% (5/5 phases: 06, 07, 07.1, 07.2, 08) — SHIPPED
v1.2 Progress: ████████████████████ 100% (2/2 phases: 09, 10) — SHIPPED
v1.3 Progress: ████████████████████ 100% (2/2 phases: 11 ✓, 12 ✓) — SHIPPED
```

## Performance Metrics

| Metric | v1.0 | v1.1 | v1.2 |
|--------|------|------|------|
| Phases completed | 5 | 5 | 2 |
| Plans executed | 11 | 13 | 5 |
| Tasks completed | 25 | 28 | 9 |
| Requirements validated | 38 | 13 | 9 |
| Timeline | 2 days | 3 days | 1 day |

## Accumulated Context

### Key Decisions
See PROJECT.md Key Decisions table for full list with outcomes.

- **Phase 11:** Bypass MiniSearch for special-char queries (literalNameSearch) rather than modifying tokenizer
- **Phase 11:** Render SearchGroup header as plain div above headingless CommandGroup for layout stability
- **Phase 11:** Use bg-foreground/8 overlays instead of bg-accent for command palette hover/selection (accent === popover in dark mode)
- **Phase 12:** Strict equality (=== false) for optional boolean nullable field — undefined/missing treated as nullable
- **Phase 12:** Breadcrumb conditional on !isRoot, rendered inside content area with sticky top-0
- **Phase 12:** Flex column split for scroll isolation — breadcrumb outside scroll container, no sticky needed

### Roadmap Evolution
- Phase 07.1 inserted after Phase 7: Fix search experience (URGENT)
- Phase 07.2 inserted after Phase 07.1: Add path to API Endpoints index (URGENT)
- Phase 09-03 inserted: Gap closure for namespace grouping (used entry.returnType instead of entry.name)

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

**Last session:** 2026-02-17T02:37:16Z
**What happened:** Executed 12-02 plan — split content panel into flex column so breadcrumb is outside scroll container. 1 task, 1 commit (ec15237).
**Next step:** Phase 12 complete. `/gsd-add-phase` for v1.4 or `/gsd-complete-milestone`

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-17 (Phase 12 plan 02 complete)*
