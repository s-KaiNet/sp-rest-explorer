# Project State: SP REST API Explorer — New UI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.
**Current focus:** v1.1 Search, Types & Polish — Phase 07 complete (incl. 07-03 gap closure). Next: Phase 08 (Polish).

**Key Constraints:**
- Tech stack locked: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, React Router 7
- GitHub Pages hosting (hash routing required)
- Azure Blob Storage data format is fixed
- Desktop only for v1
- Incremental delivery — each phase deployable

## Current Position

**Milestone:** v1.1 Search, Types & Polish
**Phase:** 07 — Explore Types (complete, UAT gaps closed)
**Plan:** 3/3 complete
**Status:** Phase 07 fully complete. All UAT gaps (5a, 5b, 5c, 9) resolved by 07-03. Sidebar shows all types, filter matches fullName, EntityDetail shows derived types, no horizontal scroll. Ready for Phase 08 (Polish).
**Last activity:** 2026-02-14 — Plan 07-03 executed (UAT gap closure)

```
v1.1 Progress: ██████████████░░░░░░ 67% (2/3 phases + 07.1 + 07.2 complete)
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 4/5 (v1.1) — Phase 6 + 07.1 + 07.2 + 07 |
| Requirements validated | 4/13 (v1.1) — SRCH-01, SRCH-02, SRCH-03, SRCH-04 |
| Plans executed | 10 (v1.1) |
| Tasks completed | 20 + 11 fixes (v1.1) |

| Phase-Plan | Duration | Tasks | Files |
|------------|----------|-------|-------|
| 06-01 | 5min | 2 | 7 |
| 06-02 | 8min | 2+checkpoint | 5 |
| 07.1-01 | 3min | 2 | 6 |
| 07.1-02 | ~15min | 3 | 4 |
| 07.2-01 | 3min | 2 | 4 |
| 07.2-02 | 3min | 2 | 3 |
| 07-01 | 2min | 2 | 5 |
| 07-02 | 4min | 3 | 8 |
| 07-03 | 2min | 2 | 4 |

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
- Per-path ancestor tracking with depth limit (4) — replaced entity-level visited Set for comprehensive coverage (~62K endpoints)
- Endpoint fullName set to '' so MiniSearch indexes leaf name only — path stored but not searchable
- getLookupMaps()! after initLookupMaps() for boot wiring (minimal change)
- 2-group display (Entities first, API Endpoints second) replacing old 3-group layout
- 5 results initial per group with "Show more" progressive disclosure
- SearchSelection with pre-computed path — no runtime path resolution needed

**Phase 07.2 decisions:**
- Path mode triggered by / or space in query; bare _api/ excluded (too broad)
- Path index is endpoints-only — skip kind filter in path mode, entities always empty
- ~~Path index tokenizes on / (MiniSearch)~~ → replaced with substring filtering (07.2-02)
- Slash queries: contiguous substring match on path (literal "web/lists" match)
- Space queries: AND-substring matching (every term must appear as substring in path)
- Results limited to 50 to prevent UI flooding on 62K doc set

**Phase 07 decisions:**
- Type classification heuristic: complex types = no nav props AND no function IDs AND not Collection wrappers
- type-indexes.ts singleton + useSyncExternalStore pattern (matches lookup-maps.ts)
- Boot chain: setMetadata → initLookupMaps → initSearchIndex → initTypeIndexes
- Used-by links navigate to /entity/{fullName} in Explore Types context (no fullName→API path resolver)
- Base type shown as single immediate parent link (not full chain)
- Derived types shown for all types that have them (complex and entity types)
- ComplexTypeDetail reuses entity components (TypeLink, CollapsibleSection, SectionFilter, PropertiesTable)
- All TypeLinks navigate to /entity/{fullName} — no entity-to-API-path resolver built (pragmatic tradeoff)
- TypeLink uses getTypeIndexes() (non-React singleton) for complex type vs entity type title text
- ResizablePanel accepts configurable storageKey for independent sidebar widths
- SidebarFilter accepts configurable label prop for context-specific count text
- namespaceGroups iterates allEntities (not complexTypes) — sidebar shows all types
- Filter predicate uses name OR fullName match for qualified name search
- EntityDetail derived types section placed between UsedByBar and SectionJumpLinks

### Roadmap Evolution
- Phase 07.1 inserted after Phase 7: Fix search experience (URGENT)
- Phase 07.2 inserted after Phase 7: Add path to API Endpoints index (URGENT)

### Known Risks
- JSON.parse() may block main thread 200-800ms on 4MB fetch — CSS spinner in index.html as mitigation
- Zustand v5 selector instability — use scalar selectors or `useShallow`

### Technical Debt
- ~~UsedByBar scans all entities on every render (no precomputed index)~~ — **resolved by 07-01/07-02** (usedByIndex precomputed at boot; UsedByBar rewritten to use O(1) lookup)
- ~~Search placeholder shown but Cmd+K not functional~~ — **resolved by Phase 6**
- NAV-03 copy button not implemented — **addressed by NAV-03**
- ~~Search result navigation UX~~ — **resolved by Phase 07.1** (pre-computed paths, 2-group display)
- CommandPalette.tsx line 274: unused variable `i` causes `tsc -b` build error — pre-existing, needs fix in Phase 8

### Blockers
- (None)

## Session Continuity

**Last session:** Execute Phase 07 Plan 03 — UAT gap closure (2026-02-14)
**What happened:** Completed 07-03-PLAN.md. Fixed 4 UAT gaps: namespaceGroups now includes all types (entity + complex), sidebar filter matches on fullName, EntityDetail shows derived types section, namespace headers truncate with ellipsis and no horizontal scrollbar. Phase 07 fully complete.
**Next step:** Plan/execute Phase 08 (Polish) — independent small items completing v1.1 milestone.

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-14 (Phase 07 complete — 3/3 plans incl. gap closure)*
