---
status: complete
phase: 08-quality-of-life-polish
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md, 08-03-SUMMARY.md, 08-04-SUMMARY.md]
started: 2026-02-15T12:00:00Z
updated: 2026-02-15T12:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. How It Works Page Content
expected: Navigate to "How It Works" from home screen or header. You should see a centered content page with stats, architecture diagram (4-node pipeline), callout box, and feedback links. The diagram should fit entirely within the content area without clipping.
result: pass

### 2. GitHub Star Count in Header
expected: In the header, the GitHub link should show a filled star icon with a number (the repo's star count). The count is fetched from GitHub API and cached locally for 30 days.
result: pass

### 3. Copy-to-Clipboard in Breadcrumb Bar
expected: Navigate to any entity or function detail page. Hover over the breadcrumb bar — a copy button should appear. Click it and the full `_api/...` path is copied to clipboard with a visual confirmation (icon swap).
result: pass

### 4. App-Branded Favicon and Header Logo
expected: The browser tab should show a custom app-branded icon (brackets + tree design). In the header nav bar, the same logo should appear before the "SP REST Explorer" text.
result: pass

### 5. Dark Mode Color Scheme with Chrome Elevation
expected: Toggle dark mode. Background should be deep blue-gray (not pure black), text muted light gray. Header, breadcrumb bar, and sidebar should appear slightly elevated/lighter than the main page background — matching GitHub Dark's visual hierarchy.
result: issue-fixed
reported: "the top bar, header, sidebars are still too dark"
severity: major
fix: "Recalibrated all dark mode oklch values — page bg 0.14→0.16, sidebar bg 0.18→0.26, chroma 0.005→0.01 for stronger blue undertone. Now ~25 RGB channels of elevation difference."
result-after-fix: pass

### 6. Dark Mode Scrollbars
expected: In dark mode, scroll any page with overflow content. The scrollbar thumb should be a dark gray matching the border tone, not the default bright OS scrollbar. Works in both Chrome/Edge and Firefox.
result: pass

## Summary

total: 6
passed: 6
issues: 0 (1 found, fixed in-session)
pending: 0
skipped: 0

## Gaps

- truth: "Header, breadcrumb bar, and sidebar should appear slightly elevated/lighter than the main page background in dark mode"
  status: fixed
  reason: "User reported: the top bar, header, sidebars are still too dark"
  severity: major
  test: 5
  root_cause: "oklch values with 0.005 chroma producing colors darker than intended GitHub Dark targets. Page bg at 0.14 rendered as #08090b (darker than target #0d1117). Sidebar at 0.18 rendered as #101214 — only 8 RGB channels brighter, imperceptible on most monitors."
  artifacts:
    - path: "app/src/index.css"
      issue: "All dark mode oklch values used 0.005 chroma (insufficient blue) and lightness values too low"
  missing:
    - "Raise chroma to 0.01 across all dark mode vars for visible blue undertone"
    - "Raise page background from 0.14 to 0.16 to match GitHub Dark #0d1117"
    - "Raise sidebar background from 0.18 to 0.26 for clear elevation (~25 RGB channel diff)"
  debug_session: ""
