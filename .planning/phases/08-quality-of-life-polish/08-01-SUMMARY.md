---
phase: 08-quality-of-life-polish
plan: 01
subsystem: ui
tags: [how-it-works, github-api, star-count, content-page, tailwind]

# Dependency graph
requires:
  - phase: 1-rebuild-ui
    provides: "Header component, page routing, design system"
provides:
  - "Full How It Works content page with stats, architecture diagram, callout, feedback links"
  - "GitHub star count utility with localStorage caching"
  - "Star count badge integrated in header GitHub link"
affects: []

# Tech tracking
tech-stack:
  added: [GitHub REST API (public, no auth)]
  patterns: [localStorage caching with TTL, formatted count display]

key-files:
  created:
    - app/src/lib/github.ts
  modified:
    - app/src/pages/HowItWorksPage.tsx
    - app/src/components/layout/Header.tsx

key-decisions:
  - "Hardcoded stats (2,449 entity types, 11,967 properties, etc.) per user decision — not computed from live metadata"
  - "30-day localStorage cache for GitHub star count to minimize API calls"
  - "Star count shown as filled star icon + formatted number integrated within GitHub link"

patterns-established:
  - "Content page pattern: max-w-[720px] mx-auto centered layout with overflow-y-auto"
  - "Callout box pattern: amber-themed border-l-4 with dark mode variants"

# Metrics
duration: 2min
completed: 2026-02-14
---

# Phase 8 Plan 1: How It Works Page + GitHub Star Count Summary

**Full How It Works content page with 7 sections (stats, architecture diagram, callout box, change tracking, feedback links) plus GitHub star count badge in header with 30-day localStorage caching**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-14T22:33:57Z
- **Completed:** 2026-02-14T22:36:05Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Complete How It Works page with all 7 sections matching mockup structure
- Architecture diagram showing 4-node pipeline (SP → Azure Fn → Blob → App) with labeled arrows
- GitHub star count fetched from public API, cached in localStorage for 30 days, displayed in header
- Dark mode support throughout with explicit callout box dark variants

## Task Commits

Each task was committed atomically:

1. **Task 1: Build How It Works page content** - `0857ee5` (feat)
2. **Task 2: Add GitHub star count to header** - `dccf21d` (feat)

## Files Created/Modified
- `app/src/pages/HowItWorksPage.tsx` - Full content page replacing placeholder, all 7 sections with Tailwind styling
- `app/src/lib/github.ts` - fetchStarCount() with localStorage caching + formatStarCount() utility
- `app/src/components/layout/Header.tsx` - Star count state/effect + star badge integrated with GitHub link

## Decisions Made
- Used hardcoded stats numbers (per user decision) — not dynamically computed from metadata
- 30-day cache TTL for star count — balances freshness vs API rate limits
- Star icon uses `fill-current` for filled appearance (more recognizable than outline)
- Feedback links point to `s-KaiNet/sp-rest-explorer` (correct repo, not mockup placeholder)
- Internal API Changelog link uses React Router `<Link>` component for client-side navigation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- How It Works page complete (INFO-01, INFO-02)
- Ready for 08-02 (copy-to-clipboard in breadcrumb bar + favicons)

## Self-Check: PASSED

All 3 key files verified on disk. Both task commits (0857ee5, dccf21d) verified in git history.

---
*Phase: 08-quality-of-life-polish*
*Completed: 2026-02-14*
