# Project State: SP REST API Explorer — New UI

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Developers can find any SharePoint REST API endpoint — at any nesting depth — in seconds, and immediately understand its parameters, return types, and navigation properties.
**Current focus:** v1.1 Search, Types & Polish — defining requirements.

**Key Constraints:**
- Tech stack locked: React 19, Vite 7, TypeScript 5, Zustand 5, Tailwind CSS 4, shadcn/ui, React Router 7
- GitHub Pages hosting (hash routing required)
- Azure Blob Storage data format is fixed
- Desktop only for v1
- Incremental delivery — each phase deployable

## Current Position

**Milestone:** v1.1 Search, Types & Polish
**Phase:** Not started (defining requirements)
**Plan:** —
**Status:** Defining requirements
**Last activity:** 2026-02-12 — Milestone v1.1 started

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases completed | 0 (v1.1) |
| Requirements validated | 0 (v1.1) |
| Plans executed | 0 (v1.1) |
| Tasks completed | 0 (v1.1) |

## Accumulated Context

### Key Decisions
See PROJECT.md Key Decisions table for full list with outcomes.

### Known Risks
- JSON.parse() may block main thread 200-800ms on 4MB fetch — CSS spinner in index.html as mitigation
- Zustand v5 selector instability — use scalar selectors or `useShallow`

### Technical Debt
- UsedByBar scans all entities on every render (no precomputed index)
- Search placeholder shown but Cmd+K not functional
- NAV-03 copy button not implemented

### Blockers
- (None)

## Session Continuity

**Last session:** Start v1.1 milestone (2026-02-12)
**What happened:** Gathered milestone goals — Cmd+K search, Explore Types view, copy button, How It Works page. Updated PROJECT.md and STATE.md.
**Next step:** Define requirements and create roadmap.

---
*State initialized: 2026-02-11*
*Last updated: 2026-02-12 (v1.1 milestone started)*
