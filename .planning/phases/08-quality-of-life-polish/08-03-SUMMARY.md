---
phase: 08-quality-of-life-polish
plan: 03
subsystem: ui
tags: [dark-mode, css, oklch, github-dark, scrollbar, theming]

# Dependency graph
requires:
  - phase: 08-01
    provides: "Base CSS variables and dark mode toggle"
provides:
  - "GitHub Dark-inspired dark mode color scheme with blue-gray undertones"
  - "Global dark scrollbar styling (WebKit + Firefox)"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: ["oklch blue-gray hue (~260) for dark mode grays", "dual scrollbar API (scrollbar-color + ::-webkit-scrollbar)"]

key-files:
  created: []
  modified:
    - "app/src/index.css"

key-decisions:
  - "GitHub Dark color palette as reference (#0d1117 bg, #c9d1d9 fg, #30363d borders)"
  - "Blue undertone (hue ~260) in all dark mode grays — signature GitHub Dark feel"
  - "Scrollbar thumb at ~0.35 lightness matching border tone"

patterns-established:
  - "oklch with hue 260 for dark mode grays (blue undertone)"

# Metrics
duration: 1min
completed: 2026-02-14
---

# Phase 8 Plan 3: Dark Mode Rework & Scrollbar Styling Summary

**GitHub Dark-inspired dark mode with blue-gray undertones, softer contrast, and themed scrollbars across all surfaces**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-14T22:43:09Z
- **Completed:** 2026-02-14T22:44:35Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Reworked all dark mode CSS variables to GitHub Dark-inspired palette with blue-gray undertones
- Replaced harsh pure black/white with muted tones (~0.14 bg, ~0.85 fg)
- Added global dark scrollbar styling with cross-browser coverage (WebKit + Firefox)
- Light mode completely preserved — zero changes to `:root` block

## Task Commits

Each task was committed atomically:

1. **Task 1: Rethink dark mode colors (GitHub Dark inspired)** - `3437463` (feat)
2. **Task 2: Add dark mode scrollbar styling** - `28f5b7d` (feat)

## Files Created/Modified
- `app/src/index.css` - Reworked `.dark {}` block with GitHub Dark-inspired oklch values; added dark scrollbar CSS

## Decisions Made
- Used GitHub Dark palette as reference: #0d1117 background, #c9d1d9 foreground, #30363d borders
- Applied blue undertone (hue ~260) consistently across all dark mode grays for the GitHub Dark signature feel
- Scrollbar thumb set at ~0.35 lightness to match the border tone, with ~0.42 hover state
- Used both `scrollbar-color` (Firefox) and `::-webkit-scrollbar` (Chrome/Edge/Safari) for cross-browser coverage
- Type colors slightly adjusted down from previous values for better contrast on new backgrounds

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 8 complete — all 3 plans executed
- v1.1 milestone ready for final verification

---
*Phase: 08-quality-of-life-polish*
*Completed: 2026-02-14*
