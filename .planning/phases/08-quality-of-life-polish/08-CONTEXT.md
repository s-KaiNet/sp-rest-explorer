# Phase 8: Quality-of-Life Polish - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Small but meaningful UX improvements and content additions that round out the v1.1 milestone. Three requirements (NAV-03, INFO-01, INFO-02) plus additional polish items: GitHub star count, favicon, dark mode scrollbars, and dark mode color scheme rethink.

</domain>

<decisions>
## Implementation Decisions

### Copy-to-clipboard (NAV-03)
- Button appears **inline with the breadcrumb path text**, visible on hover over the breadcrumb bar area
- Copies the **full `_api/...` path** (REST endpoint path, not a full URL with site prefix)
- Visual confirmation: **icon swap** — copy icon changes to checkmark for ~1.5s, then reverts
- Available on **any page that has a breadcrumb path** — consistent everywhere, not limited to detail pages

### How It Works page content (INFO-01, INFO-02)
- **Follow the mockup closely** — use the section structure from `.planning/phases/1-rebuild-ui/mockups/how-it-works-view.html`
- Sections: stats row, "What is this?", "What you should know" (with callout), Architecture diagram, Monthly change tracking, Feedback & contributions
- Stats row uses **hardcoded approximate numbers** (not computed from live metadata)
- Architecture diagram: **static SVG** matching the mockup's flow (SP Online → Azure Function → Azure Blob → Explorer App)
- Monthly change tracking section: **include it as-is** — no "coming soon" note, just describe the change tracking pipeline
- Feedback section links to **s-KaiNet/sp-rest-explorer** GitHub repo and issues
- Content tone: matches the mockup — accessible but technically informed, aimed at SP developers

### How It Works page placement & navigation
- Accessible from **header nav only** — add as a nav link alongside Explore API, Explore Types
- **Separate route** at `/#/how-it-works` — its own dedicated page
- **Narrow centered layout (720px max-width)** — comfortable reading layout for prose content, not the sidebar+content layout used by Explore API/Types

### GitHub star count
- Display near/integrated with the existing GitHub link in the header
- **Fetched from GitHub API** but **cached for one month** (localStorage or similar)
- Repo: `s-KaiNet/sp-rest-explorer`

### Favicon
- Two source PNGs exist: `app/src/assets/rest-explorer.png` (light) and `rest-explorer-dark.png` (dark), both 192x192
- Generate **favicon.svg** (with CSS media query for dark/light mode switching) and **favicon.ico** (32x32 fallback)
- Two output files total: `favicon.svg` + `favicon.ico`

### Dark mode scrollbars
- Apply dark scrollbar styling **globally to all scrollable areas** in dark mode (sidebar, content panels, modals, etc.)

### Dark mode color scheme rethink
- Reference: **VS Code GitHub Dark theme** — see https://github.dev/github/dev for the actual colors
- Applies to **all surfaces**: header, sidebar, content area, code blocks — full rethink, not partial
- Goal: make dark mode "milder" — less harsh contrast, more like the muted tones of GitHub Dark

### Claude's Discretion
- Exact hover timing/area for copy button reveal
- Checkmark icon animation style
- Scrollbar CSS approach (`::-webkit-scrollbar` vs `scrollbar-color`)
- How to structure the favicon.svg dark mode media query
- GitHub API caching implementation details (localStorage key, TTL check)
- Exact color values for dark mode rethink — use GitHub Dark as reference, adapt to this app's design system

</decisions>

<specifics>
## Specific Ideas

- Mockup reference: `.planning/phases/1-rebuild-ui/mockups/how-it-works-view.html` — follow this structure closely for the How It Works page
- Live reference: `https://s-kainet.github.io/sp-rest-explorer/#/how-it-works` — current production version (simpler structure, same content essence)
- VS Code GitHub Dark theme as the visual reference for dark mode rethink — open https://github.dev/github/dev to see the colors for top bar, content area, sidebar, class definitions
- Star count should feel "nicely integrated" with the GitHub link, not a separate badge

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-quality-of-life-polish*
*Context gathered: 2026-02-14*
