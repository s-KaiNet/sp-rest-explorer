# Project State: SP REST API Explorer — New UI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.
**Current focus:** v1.1 Search, Types & Polish — Phase 07.1 in progress (fixing search experience).

**Key Constraints:**
- Tech stack locked: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, React Router 7
- GitHub Pages hosting (hash routing required)
- Azure Blob Storage data format is fixed
- Desktop only for v1
- Incremental delivery — each phase deployable

## Current Position

**Milestone:** v1.1 Search, Types & Polish
**Phase:** 07.1 — Fix Search Experience (in progress)
**Plan:** 1/2 complete
**Status:** Plan 01 (BFS tree-walk + search index rewrite) complete. Plan 02 (CommandPalette rewrite) next.
**Last activity:** 2026-02-14 — Plan 07.1-01 executed

```
v1.1 Progress: ██████░░░░░░░░░░░░░░ 33% (1/3 phases + 07.1 in progress)
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 1/3 (v1.1) |
| Requirements validated | 4/13 (v1.1) — SRCH-01, SRCH-02, SRCH-03 (partial), SRCH-04 |
| Plans executed | 3 (v1.1) |
| Tasks completed | 6 + 7 fixes (v1.1) |

| Phase-Plan | Duration | Tasks | Files |
|------------|----------|-------|-------|
| 06-01 | 5min | 2 | 7 |
| 06-02 | 8min | 2+checkpoint | 5 |
| 07.1-01 | 3min | 2 | 6 |

## Accumulated Context

### Key Decisions
See PROJECT.md Key Decisions table for full list with outcomes.

**v1.1 roadmap decisions:**
- 3 phases for 13 requirements (standard depth, natural clustering)
- Search first (Phase 6) — highest user value, data layer already complete
- Types second (Phase 7) — largest feature surface, extends browsing capability
- Polish last (Phase 8) — independent small items, completes milestone

**Phase 6 decisions:**
- shouldFilter=false on cmdk — MiniSearch handles all filtering, not cmdk's built-in
- BFS from root functions through nav properties to build entity→path map for O(1) lookups
- 120ms debounce on search input for responsive feel without excessive re-renders
- Min 3 chars to trigger search (raised from 2 per user feedback)
- Modal height 66vh for maximum results visibility
- Removed kind labels from breadcrumbs — icons suffice
- ESC badge on input for discoverability
- Search result navigation clarity deferred to dedicated phase

**Phase 07.1 decisions:**
- BFS tree-walk from root functions through nav properties and bound functions for endpoint indexing
- Entity-level visited Set for cycle detection (no depth limit needed)
- Endpoint fullName set to '' so MiniSearch indexes leaf name only — path stored but not searchable
- Dedup by identity string with shortest-path preference
- getLookupMaps()! after initLookupMaps() for boot wiring (minimal change)

### Roadmap Evolution
- Phase 07.1 inserted after Phase 7: Fix search experience (URGENT)

### Known Risks
- JSON.parse() may block main thread 200-800ms on 4MB fetch — CSS spinner in index.html as mitigation
- Zustand v5 selector instability — use scalar selectors or `useShallow`

### Technical Debt
- UsedByBar scans all entities on every render (no precomputed index) — **addressed by TYPE-04**
- ~~Search placeholder shown but Cmd+K not functional~~ — **resolved by Phase 6**
- NAV-03 copy button not implemented — **addressed by NAV-03**
- **Search result navigation UX** — path resolution works but result-to-route mapping is confusing for non-root items. Needs dedicated phase.

### Blockers
- (None)

## Session Continuity

**Last session:** Execute Phase 07.1 Plan 01 (2026-02-14)
**What happened:** Completed 07.1-01-PLAN.md. Created BFS tree-walk module (api-tree-walk.ts), rewrote search-index.ts with two-kind documents (entity + endpoint), updated boot.ts to pass LookupMaps. Fixed pre-existing MiniSearch limit type error (Rule 3).
**Next step:** Execute 07.1-02-PLAN.md (CommandPalette rewrite to use new endpoint-based search results).

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-14 (Phase 07.1 Plan 01 complete)*
