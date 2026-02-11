---
phase: 01-project-scaffolding
plan: 02
subsystem: ui
tags: [react-router-7, hashrouter, dark-mode, theme, header, navigation, lucide-react]

# Dependency graph
requires:
  - phase: 01-project-scaffolding
    provides: "Vite 7 + React 19 + TypeScript 5 project with Tailwind CSS 4 and shadcn/ui"
provides:
  - "React Router 7 HashRouter with all route patterns matching old Vue app"
  - "ThemeProvider with system preference detection and localStorage persistence"
  - "DarkModeToggle component with sun/moon icons"
  - "Header component with nav links, search placeholder, dark mode toggle, GitHub icon"
  - "Placeholder pages for all routes and 404 catch-all"
  - "Anti-flash theme script in index.html"
affects: [02-data-layer, 03-navigation, 04-explore-api, all-subsequent-phases]

# Tech tracking
tech-stack:
  added: [react-router-7]
  patterns: ["HashRouter for GitHub Pages compatibility", "ThemeProvider context with useTheme hook", "NavLink with isActive for active state styling", "Anti-flash inline script for dark mode", "Grid-based header layout (1fr auto 1fr)"]

key-files:
  created:
    - app/src/components/theme/ThemeProvider.tsx
    - app/src/components/theme/DarkModeToggle.tsx
    - app/src/components/theme/index.ts
    - app/src/components/layout/Header.tsx
    - app/src/components/layout/index.ts
    - app/src/routes.tsx
    - app/src/pages/ExplorePage.tsx
    - app/src/pages/TypesPage.tsx
    - app/src/pages/ChangelogPage.tsx
    - app/src/pages/HowItWorksPage.tsx
    - app/src/pages/NotFoundPage.tsx
    - app/src/pages/index.ts
  modified:
    - app/src/main.tsx
    - app/src/App.tsx
    - app/src/index.css
    - app/index.html
    - app/package.json

key-decisions:
  - "Grid layout (1fr auto 1fr) for header keeps search centered regardless of left/right content width"
  - "Anti-flash inline script in index.html prevents wrong-theme flash before React hydrates"
  - "Scoped dark mode transition to body/header/main to avoid animating unrelated hover states"

patterns-established:
  - "ThemeProvider + useTheme: context-based theme management with localStorage persistence"
  - "NavLink active styling: font-semibold bg-accent for active, text-muted-foreground for inactive"
  - "Placeholder pages: flex-1 centered content pattern for consistent placeholder layout"
  - "Barrel exports: each component folder has index.ts re-exporting public API"

# Metrics
duration: 10min
completed: 2026-02-11
---

# Phase 1 Plan 2: App Shell — React Router, Header, Dark Mode, Placeholder Pages Summary

**React Router 7 HashRouter with all route patterns, styled Header (nav links, centered search, dark mode toggle, GitHub icon), ThemeProvider with system preference detection and localStorage persistence, and placeholder pages with 404 catch-all**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-11T02:40:41Z
- **Completed:** 2026-02-11T02:50:16Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 17 (source), 35 total (including docs/ build output)

## Accomplishments
- React Router 7 HashRouter configured with all route patterns matching the old Vue app (/, /_api/*, /entity, /entity/:typeName, /api-diff, /how-it-works, 404 catch-all)
- Styled Header with three-section grid layout: app name + NavLinks, centered search placeholder, dark mode toggle + GitHub icon
- ThemeProvider with system preference detection on first visit, localStorage persistence after toggle, and anti-flash inline script
- Smooth ~200ms CSS transition on dark mode toggle, scoped to layout elements
- All placeholder pages with consistent centered layout, 404 page with link home
- Visual verification approved by user

## Task Commits

Each task was committed atomically:

1. **Task 1: Theme system, React Router, and placeholder pages** - `8d3e84f` (feat)
2. **Task 2: Header with navigation, search, dark mode, GitHub link** - `554cd67` (feat)
3. **Task 3: Visual verification checkpoint** - no commit (human-verify checkpoint, approved)

## Files Created/Modified
- `app/src/components/theme/ThemeProvider.tsx` - React context provider with system preference detection, localStorage persistence, useTheme hook
- `app/src/components/theme/DarkModeToggle.tsx` - Sun/moon toggle button using lucide-react icons
- `app/src/components/theme/index.ts` - Barrel export for theme components
- `app/src/components/layout/Header.tsx` - Full header with grid layout, NavLinks, search placeholder, dark mode toggle, GitHub icon
- `app/src/components/layout/index.ts` - Barrel export for layout components
- `app/src/routes.tsx` - createHashRouter with all route patterns
- `app/src/pages/ExplorePage.tsx` - Home page placeholder
- `app/src/pages/TypesPage.tsx` - Types page placeholder
- `app/src/pages/ChangelogPage.tsx` - Changelog page placeholder
- `app/src/pages/HowItWorksPage.tsx` - How it works page placeholder
- `app/src/pages/NotFoundPage.tsx` - 404 page with link home
- `app/src/pages/index.ts` - Barrel export for page components
- `app/src/main.tsx` - Updated to wrap RouterProvider in ThemeProvider
- `app/src/App.tsx` - Root layout with Header + Outlet
- `app/src/index.css` - Added scoped dark mode CSS transition
- `app/index.html` - Added anti-flash theme detection script
- `app/package.json` - Added react-router dependency

## Decisions Made
- **Grid header layout (1fr auto 1fr):** Ensures search stays centered regardless of left/right content width, matching the GitHub/Linear aesthetic
- **Anti-flash inline script:** Reads localStorage before React hydrates to apply dark class immediately, preventing flash of light theme on dark-mode users
- **Scoped CSS transition:** Applied to body/header/main only (not `*`) to avoid animating unrelated hover states while still providing smooth dark mode switching

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error with NavLink `end` property type**
- **Found during:** Task 2 (Header component)
- **Issue:** Using `as const` on the navLinks array caused TypeScript to narrow the type, making `end` unavailable on items that didn't define it
- **Fix:** Changed from `as const` to explicit type annotation `{ to: string; label: string; end?: boolean }[]`
- **Files modified:** `app/src/components/layout/Header.tsx`
- **Verification:** `npx tsc -b` passes with no errors
- **Committed in:** `554cd67` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type annotation fix. No scope creep.

## Issues Encountered
None — both tasks completed successfully after the TypeScript type fix.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 1 complete — full app shell with routing, header, dark mode, and build pipeline
- Ready for Phase 2: Data Layer & UI Foundation (metadata fetching, Zustand store, MiniSearch, lookup maps)
- `npm run build` produces deployable output in docs/ for GitHub Pages

---
*Phase: 01-project-scaffolding*
*Completed: 2026-02-11*

## Self-Check: PASSED

- All 12 key created files verified present on disk
- Both task commits found: `8d3e84f`, `554cd67`
