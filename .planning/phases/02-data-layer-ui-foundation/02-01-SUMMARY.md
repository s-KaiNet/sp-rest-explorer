---
phase: 02-data-layer-ui-foundation
plan: 01
subsystem: data-layer
tags: [zustand, minisearch, idb-keyval, useSyncExternalStore, indexeddb]

# Dependency graph
requires:
  - phase: 01-project-scaffolding
    provides: Vite + React 19 + TypeScript 5 project shell with Tailwind CSS 4
provides:
  - TypeScript interfaces matching Azure Blob Storage JSON shape
  - Frozen metadata singleton with useSyncExternalStore hook
  - Zustand status-only store (loading/error/ready)
  - O(1) lookup Maps for entities by fullName, functions by ID, entity children
  - MiniSearch index for ~6K searchable items with prefix/fuzzy matching
  - IndexedDB cache with cache-then-revalidate boot pattern
  - Boot orchestrator that hydrates entire data layer
affects: [02-data-layer-ui-foundation, 03-navigation-system, 04-explore-api-views, 05-entity-function-detail]

# Tech tracking
tech-stack:
  added: [zustand@5, minisearch, idb-keyval]
  patterns: [frozen-singleton-useSyncExternalStore, zustand-status-only, cache-then-revalidate, barrel-export]

key-files:
  created:
    - app/src/lib/constants.ts
    - app/src/lib/metadata/types.ts
    - app/src/lib/metadata/metadata-store.ts
    - app/src/lib/metadata/lookup-maps.ts
    - app/src/lib/metadata/search-index.ts
    - app/src/lib/metadata/metadata-cache.ts
    - app/src/lib/metadata/boot.ts
    - app/src/lib/metadata/index.ts
    - app/src/stores/app-store.ts
  modified:
    - app/package.json
    - app/package-lock.json

key-decisions:
  - "Metadata stored as frozen singleton outside Zustand, accessed via useSyncExternalStore — prevents deep-clone perf trap on 4MB object"
  - "Zustand store holds only AppStatus + error string — zero metadata reference in reactive state"
  - "IndexedDB cache uses idb-keyval with silent error handling for private browsing compatibility"
  - "Background revalidation updates cache only, not live singleton — prevents mid-session UI disruption"
  - "Lookup Maps use Map (not object) for O(1) access to 2,450 entities and 3,534 functions"

patterns-established:
  - "Frozen singleton pattern: module-level let + Object.freeze() + useSyncExternalStore for large immutable data"
  - "Zustand status-only pattern: reactive store for UI flags, not data storage"
  - "Cache-then-revalidate: serve IndexedDB instantly, fetch fresh in background, update cache only"
  - "Barrel export: index.ts re-exports public API, hides internal wiring (setMetadata, initLookupMaps)"

# Metrics
duration: 3min
completed: 2026-02-11
---

# Phase 2 Plan 1: Data Layer Summary

**Metadata singleton with frozen Object.freeze() + useSyncExternalStore, Zustand status-only store, O(1) lookup Maps, MiniSearch index for ~6K items, IndexedDB cache with cache-then-revalidate boot orchestrator**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-11T09:44:35Z
- **Completed:** 2026-02-11T09:47:25Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Ported all TypeScript interfaces from old Vue app into a single self-contained types.ts matching the Azure Blob Storage JSON shape
- Created frozen metadata singleton with useSyncExternalStore hook — 4MB metadata lives outside Zustand to avoid deep-clone performance traps
- Built pre-computed lookup Maps providing O(1) access to entities by fullName, functions by sparse ID, and entity children sorted by kind
- Created MiniSearch index with custom tokenizer splitting on dots/underscores for SP.Web-style names, covering entities + root functions + nav properties + bound functions
- Implemented IndexedDB cache with idb-keyval for instant repeat-visit loads, with silent error handling for private browsing
- Built boot orchestrator implementing cache-then-revalidate: serve cached immediately, fetch fresh in background, update cache only (not live singleton)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create TypeScript types + metadata singleton + Zustand store** - `ecd6fd2` (feat)
2. **Task 2: Create lookup maps, search index, IndexedDB cache, and boot orchestrator** - `7263567` (feat)

## Files Created/Modified

- `app/src/lib/constants.ts` - Azure Blob URL, cache key, API prefix constants
- `app/src/lib/metadata/types.ts` - TypeScript interfaces: Metadata, EntityType, FunctionImport, Property, NavigationProperty, Parameter, SearchDocument, ChildEntry, LookupMaps, AppStatus
- `app/src/lib/metadata/metadata-store.ts` - Frozen singleton with useSyncExternalStore hook
- `app/src/stores/app-store.ts` - Zustand v5 store for loading/error/ready status only
- `app/src/lib/metadata/lookup-maps.ts` - Pre-computed Maps: entityByFullName, functionById, entityChildren with sorted children
- `app/src/lib/metadata/search-index.ts` - MiniSearch builder with custom tokenizer and fuzzy/prefix search
- `app/src/lib/metadata/metadata-cache.ts` - IndexedDB cache via idb-keyval with silent error handling
- `app/src/lib/metadata/boot.ts` - Boot orchestrator: cache-check → fetch → freeze → build maps → build index → ready
- `app/src/lib/metadata/index.ts` - Barrel export for public API (hides internal setMetadata, initLookupMaps, etc.)
- `app/package.json` - Added zustand, minisearch, idb-keyval dependencies
- `app/package-lock.json` - Lock file updated

## Decisions Made

- **Metadata outside Zustand:** 4MB frozen singleton + useSyncExternalStore prevents deep-clone perf trap — Zustand holds only AppStatus + error string
- **Map over Object for lookups:** Function IDs are sparse (1-3576 with gaps), Map provides true O(1) access without prototype chain issues
- **Background revalidation updates cache only:** Prevents mid-session UI disruption from re-rendering entire tree when fresh data arrives
- **Silent IndexedDB error handling:** idb-keyval operations wrapped in try/catch to gracefully degrade in private browsing mode
- **Custom tokenizer for MiniSearch:** Splits on whitespace, dots, and underscores so "SP.Web" tokenizes to ["SP", "Web"] for better search relevance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Data layer complete — all metadata types, singleton, lookup maps, search index, cache, and boot orchestrator are in place
- Ready for 02-02-PLAN.md: UI foundation (color tokens, CodeText component, skeleton screens, error state, CSS spinner, boot integration in App.tsx)

---
*Phase: 02-data-layer-ui-foundation*
*Completed: 2026-02-11*
