---
phase: 11-search-ux-fixes
plan: 01
subsystem: search
tags: [cmdk, minisearch, literal-search, command-palette, hover-ux, path-sorting]

# Dependency graph
requires:
  - phase: 07.2-api-path-search
    provides: "MiniSearch index, path search, CommandPalette component"
provides:
  - "Literal substring matching for special-char queries (literalNameSearch)"
  - "Stable collapsible group headers with chevron indicators"
  - "Path-length sorting for endpoint results"
  - "Hover feedback on search result items"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "MiniSearch bypass pattern — literalNameSearch for special chars, MiniSearch for simple queries"
    - "Standalone header div above headingless CommandGroup for layout-stable collapse"
    - "Tailwind group/group-hover for reveal-on-hover patterns"

key-files:
  created: []
  modified:
    - "app/src/lib/metadata/search-index.ts"
    - "app/src/components/search/CommandPalette.tsx"
    - "app/src/lib/metadata/index.ts"

key-decisions:
  - "Bypass MiniSearch entirely for special-char queries rather than modifying tokenizer"
  - "Render header as plain div above headingless CommandGroup to maintain cmdk keyboard nav"
  - "Show-more button as plain div (not CommandItem) to avoid cmdk interference"

patterns-established:
  - "literalNameSearch bypass: check hasSpecialChars → literalNameSearch, else MiniSearch"
  - "SearchGroup consistent header: single div always rendered, CommandGroup only when expanded"

# Metrics
duration: 4min
completed: 2026-02-17
---

# Phase 11 Plan 01: Search UX Fixes Summary

**Literal substring matching for dot/special-char queries, layout-stable collapsible group headers with chevron indicators, path-length sorting for endpoints, and hover feedback on result items**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-17T01:08:37Z
- **Completed:** 2026-02-17T01:12:17Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Queries with dots/special chars (e.g., "SP.File", "getbyid(") now use literal substring matching, returning only exact matches
- Group headers are a single consistent clickable element with ▶/▼ chevron — no layout shift between collapsed/expanded
- API Endpoints results sort by path character length (shortest first) when query is active
- Result items show pointer cursor, background highlight on hover, and a right-side arrow hint (→)

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement literal substring matching for name-mode queries (SRCH-06)** - `54b57d8` (feat)
2. **Task 2: Fix group collapse headers and add hover feedback (SRCH-07, SRCH-09)** - `9bdeaac` (feat)
3. **Task 3: Sort API Endpoints results by path length (SRCH-08)** - `316100d` (feat)
4. **Build output** - `a8e505f` (chore)

## Files Created/Modified
- `app/src/lib/metadata/search-index.ts` - Added literalNameSearch(), hasSpecialChars(), nameDocuments store
- `app/src/components/search/CommandPalette.tsx` - Redesigned SearchGroup, added hover feedback, path-length sorting
- `app/src/lib/metadata/index.ts` - Barrel export for literalNameSearch and hasSpecialChars

## Decisions Made
- Used MiniSearch bypass (literalNameSearch) rather than modifying the tokenizer — preserves fuzzy/prefix behavior for simple queries while giving exact results for special-char queries
- Rendered SearchGroup header as plain div above headingless CommandGroup — maintains cmdk arrow-key navigation while giving full control over header layout/click behavior
- Changed "Show more" from CommandItem to plain div — prevents cmdk from interfering with the expand action

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All four search UX fixes (SRCH-06/07/08/09) are complete
- Phase 11 has only this one plan — phase complete
- Ready for Phase 12: Detail & Layout Fixes (ENTD-12, LAYO-01)

---
*Phase: 11-search-ux-fixes*
*Completed: 2026-02-17*

## Self-Check: PASSED
- All 3 source files verified on disk
- All 4 commits (54b57d8, 9bdeaac, 316100d, a8e505f) verified in git log
