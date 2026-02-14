---
status: diagnosed
phase: 08-quality-of-life-polish
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md, 08-03-SUMMARY.md]
started: 2026-02-14T23:00:00Z
updated: 2026-02-15T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. How It Works Page
expected: Navigate to "How It Works" from home screen or header. You should see a centered content page with stats, architecture diagram (4-node pipeline), callout box, and feedback links.
result: issue
reported: "the diagram on the left and right sides are slightly wider than the content area (Targeted release label is cut in the left)"
severity: minor

### 2. GitHub Star Count in Header
expected: In the header, the GitHub link should show a filled star icon with a number (the repo's star count). This count is fetched from GitHub's API and cached locally for 30 days.
result: pass

### 3. Copy-to-Clipboard in Breadcrumb Bar
expected: Navigate to any entity or function detail page. Hover over the breadcrumb/navigation bar and a copy button should appear. Click it — the full `_api/...` path for the current item should be copied to your clipboard, with a visual confirmation (icon swap).
result: pass

### 4. App-Branded Favicon
expected: Check the browser tab — the favicon should be a custom app-branded icon (brackets + tree design), not the default Vite logo. In dark mode, the favicon colors should adapt.
result: issue
reported: "the site logo should also be added to the header nav bar - before the SP REST EXPLORER label"
severity: minor

### 5. Dark Mode Color Scheme
expected: Toggle dark mode. The background should be a deep blue-gray (not pure black), text should be muted light gray (not pure white), and borders should have a subtle blue undertone. The overall feel should be similar to GitHub's dark theme.
result: issue
reported: "The top area (header, breadcrumb), the side navigation area are still have a little bit too dark background."
severity: minor

### 6. Dark Mode Scrollbars
expected: In dark mode, scroll any page with overflow content. The scrollbar thumb should be a dark gray matching the border tone, not the default bright OS scrollbar. This should work in both Chrome/Edge and Firefox.
result: pass

## Summary

total: 6
passed: 3
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "Architecture diagram fits within the centered content area without clipping"
  status: failed
  reason: "User reported: the diagram on the left and right sides are slightly wider than the content area (Targeted release label is cut in the left)"
  severity: minor
  test: 1
  root_cause: "Diagram nodes (4x min-w-[120px]=480px) plus arrows (3x min-w-[80px]=240px) total 720px minimum, exceeding the 608px available inside card container (720px - 48px page padding - 64px card padding)"
  artifacts:
    - path: "app/src/pages/HowItWorksPage.tsx"
      issue: "min-w-[120px] on nodes (line 150) and min-w-[80px] on arrows (line 166) create rigid 720px floor; justify-center clips both sides symmetrically"
  missing:
    - "Remove min-w constraints from nodes and arrows to let flex shrink naturally within 608px available space"
  debug_session: ""

- truth: "App-branded logo displayed in header navigation bar before the site title"
  status: failed
  reason: "User reported: the site logo should also be added to the header nav bar - before the SP REST EXPLORER label"
  severity: minor
  test: 4
  root_cause: "Header logo was never implemented — Header.tsx renders only a plain text Link with 'SP REST Explorer' and no img or inline SVG preceding it"
  artifacts:
    - path: "app/src/components/layout/Header.tsx"
      issue: "Lines 40-42: bare <Link> with text only, no logo element"
  missing:
    - "Add <img src='/favicon.svg' className='h-5 w-5' /> inside the Link before the title text, with flex items-center gap-2 on the Link"
  debug_session: ""

- truth: "Header, breadcrumb, and side navigation backgrounds match GitHub Dark tone (not too dark)"
  status: failed
  reason: "User reported: The top area (header, breadcrumb), the side navigation area are still have a little bit too dark background."
  severity: minor
  test: 5
  root_cause: "All chrome surfaces use bg-background (oklch 0.14) identical to page background, and --sidebar-background is set darker (0.12) instead of lighter — opposite of GitHub Dark's elevation pattern where chrome is lighter than page"
  artifacts:
    - path: "app/src/index.css"
      issue: "--sidebar-background at oklch(0.12) is darker than --background (0.14); no elevated surface variable exists"
    - path: "app/src/components/layout/Header.tsx"
      issue: "Uses bg-background — needs elevated surface class"
    - path: "app/src/components/navigation/BreadcrumbBar.tsx"
      issue: "Uses bg-background — needs elevated surface class"
    - path: "app/src/components/navigation/ResizablePanel.tsx"
      issue: "No background class — needs bg-sidebar"
  missing:
    - "Change --sidebar-background from oklch(0.12) to oklch(0.18) to match GitHub Dark #161b22 elevation"
    - "Change Header.tsx and BreadcrumbBar.tsx from bg-background to bg-sidebar"
    - "Add bg-sidebar to ResizablePanel.tsx outer container"
  debug_session: ""
