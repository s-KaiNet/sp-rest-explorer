# Phase 1: Project Scaffolding - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

A working React 19 app shell in `app/` with Vite, TypeScript 5, Tailwind CSS 4, shadcn/ui, and React Router 7 (HashRouter). Includes a styled header with navigation, dark mode toggle, route structure matching current URL patterns, and build output to `docs/` for GitHub Pages. No data layer, no API browsing, no search functionality — just the deployable shell.

</domain>

<decisions>
## Implementation Decisions

### Header layout & navigation links
- **Layout:** Logo/app name + nav links on the left, centered search box placeholder, dark mode toggle + GitHub icon (with star count) on the right
- **Style:** Minimal top bar, neutral background (same as page bg), separated by subtle border — not a colored toolbar
- **Sticky:** Header is fixed at top, content scrolls beneath it
- **Nav links:** All 4 links shown and active (Explore API, Explore Types, API Changelog, How it works) — they navigate to their routes even though only Explore API has real content in v1
- **Active link indicator:** Subtle background highlight + bold text on the currently active route
- **Search placeholder:** A disabled/non-functional search input centered in the header to reserve layout space for the v2 search feature
- **GitHub icon:** Include a GitHub repo link icon in the header right section, optionally showing star count

### Dark mode behavior
- **Default:** Respect system/OS preference on first visit to determine initial theme
- **Toggle:** Sun/moon icon button — two states only (Light ↔ Dark), no "system" option in toggle
- **Persistence:** After first toggle, store choice in localStorage. Subsequent visits use stored preference, ignoring system setting.
- **Transition:** Smooth CSS transition (~200ms) on theme switch for a polished feel

### Route placeholder pages
- **Placeholder content:** Simple centered "Coming soon" message — same generic message for all placeholder routes (Explore Types, Changelog, How it works)
- **No extra navigation:** Header nav is sufficient to navigate away from placeholder pages — no additional CTA or back links needed
- **404 page:** Unknown/invalid routes show a "Page not found" message (not a silent redirect to home)

### App directory conventions
- **Component naming:** PascalCase for component files (Header.tsx, DarkModeToggle.tsx)
- **Barrel exports:** Yes — each folder has index.ts re-exporting its public API
- **Path aliases:** Use `@/` alias pointing to `src/` for all imports (no relative path hell)
- **Folder structure:** Claude's discretion — pick what fits the project size and React conventions

### Claude's Discretion
- Folder structure within `app/src/` (feature-based, type-based, or hybrid) — pick what makes sense for a small-to-medium React app that will grow through 5 phases
- Exact spacing, typography, and component sizing in the header
- Loading/transition states during route changes
- Specific shadcn/ui components chosen for header elements

</decisions>

<specifics>
## Specific Ideas

- Header should feel like GitHub or Linear's top bar — clean, thin, not branded/colored
- Search box is centered in the header (not left or right aligned) — even though it's just a placeholder in v1, the layout should accommodate it as the focal point
- GitHub icon in header right section mirrors what many open-source dev tools do (links to repo, shows social proof with stars)

</specifics>

<deferred>
## Deferred Ideas

- Search functionality (Cmd+K) — v2, but layout space reserved in header with placeholder input
- GitHub star count display — nice-to-have, may require GitHub API call; can be static link without count if simpler

</deferred>

---

*Phase: 01-project-scaffolding*
*Context gathered: 2026-02-11*
