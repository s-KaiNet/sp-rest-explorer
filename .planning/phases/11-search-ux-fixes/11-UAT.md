---
status: diagnosed
phase: 11-search-ux-fixes
source: [11-01-SUMMARY.md]
started: 2026-02-17T02:00:00Z
updated: 2026-02-17T02:06:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Literal substring matching for special-char queries
expected: Open Cmd+K, type "SP.File". Only results containing the literal substring "SP.File" appear — no split-token matches like "SPWeb FileCollection".
result: pass

### 2. Stable collapsible group headers
expected: In Cmd+K results, click a group header (e.g., "Entity Types" or "API Endpoints"). The group collapses/expands. The header text does NOT shift position. A chevron indicator (▶/▼) shows collapse state.
result: pass

### 3. Path-length sorting for API Endpoints
expected: In Cmd+K, type a query that returns multiple API Endpoint results (e.g., "web"). Results in the API Endpoints group are sorted by path length, shortest first (e.g., "/web" appears before "/web/lists/getbyid(…)/items").
result: pass

### 4. Hover feedback on search result items
expected: In Cmd+K, hover over any search result item. You should see a visible background highlight, the cursor changes to a pointer, and a right-arrow hint (→) appears on the right side.
result: issue
reported: "no visible background highlight"
severity: cosmetic

## Summary

total: 4
passed: 3
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Hovering over a search result item shows a visible background highlight"
  status: failed
  reason: "User reported: no visible background highlight"
  severity: cosmetic
  test: 4
  root_cause: "Dark mode --accent (oklch(0.22 0.01 260)) is identical to --popover (oklch(0.22 0.01 260)) — hover:bg-accent paints the same color as the dialog background, producing zero contrast"
  artifacts:
    - path: "app/src/index.css"
      issue: "Dark mode --accent and --popover are identical values (oklch(0.22 0.01 260))"
    - path: "app/src/components/search/CommandPalette.tsx"
      issue: "Lines 347, 375 use hover:bg-accent which is invisible against bg-popover in dark mode"
  missing:
    - "Use theme-resilient hover color on CommandItem — e.g., hover:bg-foreground/5 dark:hover:bg-foreground/8 (semi-transparent overlay always visible regardless of background)"
  debug_session: ""
