---
status: diagnosed
phase: 10-home-screens-visual-polish
source: 10-01-SUMMARY.md, 10-02-SUMMARY.md
started: 2026-02-15T12:00:00Z
updated: 2026-02-15T12:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Home Page Favicon Branding
expected: Visiting the home page, the site icon (favicon.svg) is displayed inline to the left of the "SharePoint REST API Explorer" title, approximately 36px in size.
result: pass

### 2. Home Page Hardcoded Stats
expected: The home page stats section shows approximate values — "3.5k+ functions", "2.4k entities", "11k+ properties", "60k+ endpoints" — rendered instantly with no loading ellipsis or spinner.
result: issue
reported: "small UI thing - the color for 60k+ endpoints is gray, should something different"
severity: cosmetic

### 3. Recently Visited Includes Types Entries
expected: After visiting a type in Explore Types, returning to the home page shows that type entry in the Recently Visited section alongside any API endpoint entries. Entity/type entries display a green "T" icon.
result: pass

### 4. Explore API Welcome Screen
expected: Navigating to Explore API with no endpoint selected shows a centered welcome layout with a blue "<>" icon, title, description, live stats (endpoint count, function count), and a hint box — matching the Explore Types home screen pattern.
result: issue
reported: "title says 93 Root Endpoints 793 Functions the number of functions is wrong"
severity: major

### 5. Dark Mode Cmd+K Modal Borders
expected: In dark mode, opening the Cmd+K search modal shows subdued, non-distracting borders on the modal — including the outer dialog border, input separator, footer separator, and keyboard hint badges.
result: issue
reported: "the colors now are too dark, the separation lines almost invisible"
severity: cosmetic

## Summary

total: 5
passed: 2
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "Home page stats show approximate values with consistent styling"
  status: failed
  reason: "User reported: small UI thing - the color for 60k+ endpoints is gray, should something different"
  severity: cosmetic
  test: 2
  root_cause: "Line 136 of HomePage.tsx uses bg-muted-foreground (gray) for endpoints dot while other stats use semantic type colors (bg-type-fn, bg-type-entity, bg-type-nav)"
  artifacts:
    - path: "app/src/pages/HomePage.tsx"
      issue: "Line 136: bg-muted-foreground instead of a distinct color for endpoints"
  missing:
    - "Add a dedicated endpoint color token or reuse an existing accent color for the endpoints stat dot"

- truth: "Explore API welcome screen shows correct live stats (endpoint count, function count)"
  status: failed
  reason: "User reported: title says 93 Root Endpoints 793 Functions the number of functions is wrong"
  severity: major
  test: 4
  root_cause: "functionCount in ExplorePage.tsx line 40-43 filters children where kind==='function', but children only contains root-level functions (793). Should count all functions from metadata (~3.5k+) to match home page"
  artifacts:
    - path: "app/src/pages/ExplorePage.tsx"
      issue: "Lines 40-43: functionCount counts only root-level children, not total functions from metadata"
    - path: "app/src/hooks/use-api-navigation.ts"
      issue: "Lines 56-64: rootChildren only includes fn.isRoot functions"
  missing:
    - "Count all functions from metadata (Object.keys(metadata.functions).length) instead of filtering children"

- truth: "Dark mode Cmd+K modal has subdued but visible borders"
  status: failed
  reason: "User reported: the colors now are too dark, the separation lines almost invisible"
  severity: cosmetic
  test: 5
  root_cause: "--modal-border oklch lightness 0.24 is only 0.02 above --popover background 0.22, producing ~1.07:1 contrast — nearly invisible"
  artifacts:
    - path: "app/src/index.css"
      issue: "Line 91: --modal-border oklch(0.24 0.01 260) too close to --popover oklch(0.22 0.01 260)"
  missing:
    - "Increase --modal-border lightness to ~0.34 for visible but subdued borders"
