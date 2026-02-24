---
phase: 23-recently-visited-fix
plan: 01
subsystem: ui
tags: [zustand, recently-visited, state-management, search, icons]

# Dependency graph
requires:
  - phase: 22-compressed-data-source
    provides: working frontend with metadata loading
provides:
  - Zustand-based recently visited store with persist middleware
  - Granular SearchSelection kind type (entity/function/navProperty/root)
  - Atomic clear across all consumers
  - Correct icon mapping for all recently visited item types
affects: [recently-visited, search, home-page, explore-page]

# Tech tracking
tech-stack:
  added: [zustand persist middleware]
  patterns: [shared zustand store replacing independent useState hooks, granular kind discriminator on SearchSelection]

key-files:
  created:
    - app/src/stores/recently-visited-store.ts
  modified:
    - app/src/hooks/use-recently-visited.ts
    - app/src/components/search/CommandPalette.tsx
    - app/src/App.tsx

key-decisions:
  - "Zustand persist version 2 with wipe migration — clear all old buggy localStorage entries on upgrade instead of migrating"
  - "Removed kindMap from App.tsx — CommandPalette emits correct kind, App.tsx passes through with no remapping"
  - "SearchSelection.kind expanded to 'entity' | 'function' | 'navProperty' | 'root' — replaces lossy 'entity' | 'endpoint' union"

patterns-established:
  - "Zustand persist store for cross-component shared state: create store with persist middleware, expose via thin hook wrapper"
  - "Granular kind discriminator: emit precise kind at source (CommandPalette) rather than remapping downstream"

requirements-completed: [RVIS-01, RVIS-02, RVIS-03, RVIS-04, RVIS-05]

# Metrics
duration: 10min
completed: 2026-02-25
---

# Phase 23 Plan 01: Recently Visited Fix Summary

**Migrated recently visited to Zustand store with persist middleware, expanded SearchSelection kind to granular types, removed lossy kindMap — fixing atomic clear, entity icon, and endpoint icon bugs**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-24T22:57:00Z
- **Completed:** 2026-02-25T00:02:00Z
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 4

## Accomplishments
- Created Zustand recently-visited store with persist middleware (version 2) replacing independent useState hooks — clear button now purges state atomically across all consumers
- Expanded SearchSelection.kind from `'entity' | 'endpoint'` to `'entity' | 'function' | 'navProperty' | 'root'` — entities show correct Braces icon, endpoints show correct type-specific icons
- Removed kindMap from App.tsx — SearchSelection.kind is passed directly to addVisit with no lossy remapping
- Old buggy localStorage entries automatically cleared on persist version upgrade

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Zustand recently-visited store and update SearchSelection type** - `48e5667` (feat)
2. **Task 2: Wire App.tsx consumers and remove kindMap remapping** - `f1e6161` (fix)
3. **Task 3: Verify all three recently visited bugs are fixed** - checkpoint:human-verify (approved)

## Files Created/Modified
- `app/src/stores/recently-visited-store.ts` - New Zustand store with persist middleware for recently visited items (version 2, wipe migration)
- `app/src/hooks/use-recently-visited.ts` - Converted to thin wrapper around Zustand store (removed useState, localStorage helpers)
- `app/src/components/search/CommandPalette.tsx` - Expanded SearchSelection.kind to granular types, handleEndpointSelect emits correct kind from search result
- `app/src/App.tsx` - Removed kindMap object, passes selection.kind directly to addVisit

## Decisions Made
- Used Zustand persist middleware version 2 with wipe migration (clear all old entries) instead of attempting to migrate buggy kind values — per user decision in CONTEXT.md
- Removed kindMap entirely from App.tsx — CommandPalette now emits the correct kind at source, making the mapping unnecessary
- Expanded SearchSelection.kind to 4-value union instead of keeping the 2-value union with downstream mapping — cleaner architecture, kind is correct from the moment of selection

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 23 complete (single plan phase) — ready for phase/milestone transition
- All three recently visited bugs verified and approved by user
- No technical debt introduced

## Self-Check: PASSED

- [x] `app/src/stores/recently-visited-store.ts` — FOUND
- [x] `app/src/hooks/use-recently-visited.ts` — FOUND
- [x] `app/src/components/search/CommandPalette.tsx` — FOUND
- [x] `app/src/App.tsx` — FOUND
- [x] Commit `48e5667` (Task 1) — FOUND
- [x] Commit `f1e6161` (Task 2) — FOUND

---
*Phase: 23-recently-visited-fix*
*Completed: 2026-02-25*
