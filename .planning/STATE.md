# Project State: SP REST API Explorer — New UI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-18)

**Core value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.
**Current focus:** v1.4 Unify Icons — Consistent Lucide icons and colors for all API types

**Key Constraints:**
- Tech stack locked: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, React Router 7
- GitHub Pages hosting (hash routing required)
- Azure Blob Storage data format is fixed
- Desktop only for v1
- Incremental delivery — each phase deployable

## Current Position

**Milestone:** v1.4 Unify Icons
Phase: 15 — Cross-View Consistency
Plan: 01 complete (1/2 plans)
Status: In progress — plan 15-01 complete, 15-02 remaining
Last activity: 2026-02-18 — Executed 15-01 (Cross-View Icon Consistency)

```
v1.0 Progress: ████████████████████ 100% (5/5 phases: 1-5) — SHIPPED
v1.1 Progress: ████████████████████ 100% (5/5 phases: 06, 07, 07.1, 07.2, 08) — SHIPPED
v1.2 Progress: ████████████████████ 100% (2/2 phases: 09, 10) — SHIPPED
v1.3 Progress: ████████████████████ 100% (2/2 phases: 11 ✓, 12 ✓) — SHIPPED
v1.4 Progress: █████████████░░░░░░░ 67% (2/3 phases: 13 ✓, 14 ✓, 15)
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
- **Phase 13:** ApiType as minimal union type — no enums or utilities, deferred to consuming phases
- **Phase 13:** TypeIcon uses Record maps for icon/color lookup, OKLCH chroma 0.12-0.15 for muted colors
- **Phase 14:** Caller-passed apiType prop on SidebarItem — no internal kind-to-type mapping
- **Phase 14:** Welcome hero uses bare TypeIcon(root, lg) with no background container
- **Phase 15:** Root items in search results use green Box icon as sole indicator — no pill badge
- **Phase 15:** Recently visited cards use TypeIcon md (20px) — larger than sidebar sm but proportional to card

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

**Last session:** 2026-02-18T23:14:20Z
**What happened:** Executed 15-01 — Replaced text symbols with TypeIcon in search modal and recently visited cards. Plan 1 of 2 complete.
**Next step:** Execute 15-02 to complete Cross-View Consistency phase

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-18 (phase 14 complete)*
