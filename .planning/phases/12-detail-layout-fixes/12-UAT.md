---
status: diagnosed
phase: 12-detail-layout-fixes
source: 12-01-SUMMARY.md
started: 2026-02-17T03:00:00Z
updated: 2026-02-17T03:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Nullable Column — False Shows "No"
expected: Navigate to an entity properties table. Properties with nullable explicitly set to false should show "no" in the Nullable column.
result: pass

### 2. Nullable Column — Missing/Undefined Shows "Yes"
expected: On the same entity properties table, properties without an explicit nullable value (or with nullable: true) should show "yes" in the Nullable column.
result: pass

### 3. Breadcrumb Position — Inside Content Area
expected: Navigate to a detail page in Explore API (e.g., click into an entity). The breadcrumb trail should render inside the main content area (the right panel), not spanning the full width above the sidebar.
result: issue
reported: "when scrolling (for example #/_api/site/RootWeb/Lists/GetByTitle/Author) the breadcrumb has a transparency and makes weired experience. the iisue is that vertical scrollbar starts from breadcrumb, but should be available for content area under the breadcrumb"
severity: major

### 4. Breadcrumb Sticky on Scroll
expected: On a detail page with enough content to scroll, scroll down. The breadcrumb should stick to the top of the content area and remain visible as you scroll.
result: issue
reported: "when scrolling (for example #/_api/site/RootWeb/Lists/GetByTitle/Author) the breadcrumb has a transparency and makes weired experience. the iisue is that vertical scrollbar starts from breadcrumb, but should be available for content area under the breadcrumb"
severity: major

### 5. Breadcrumb Hidden on Root
expected: Navigate to the Explore API root listing (the top-level endpoints view). No breadcrumb should be visible — it only appears on detail/nested pages.
result: pass

## Summary

total: 5
passed: 3
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "Breadcrumb renders inside the main content area without visual artifacts"
  status: failed
  reason: "User reported: when scrolling the breadcrumb has a transparency and makes weird experience. The vertical scrollbar starts from breadcrumb, but should be available for content area under the breadcrumb"
  severity: major
  test: 3
  root_cause: "overflow-y-auto is on the outer div containing BOTH breadcrumb and content (ExplorePage.tsx:127). Scrollbar spans entire area including breadcrumb. Sticky breadcrumb with bg-sidebar causes transparency bleed as content scrolls behind it."
  artifacts:
    - path: "app/src/pages/ExplorePage.tsx"
      issue: "overflow-y-auto on line 127 wraps both breadcrumb and content — scrollbar includes breadcrumb region"
    - path: "app/src/components/navigation/BreadcrumbBar.tsx"
      issue: "sticky top-0 causes content to scroll behind breadcrumb creating transparency artifact"
  missing:
    - "Split content div into flex column: breadcrumb (non-scrolling) + scrollable content wrapper"
    - "Move overflow-y-auto from outer div to inner wrapper around ContentTransition only"
    - "Remove sticky from BreadcrumbBar — no longer needed when outside scroll container"
  debug_session: ""

- truth: "Breadcrumb sticks to top of content area and scrollbar only covers content below it"
  status: failed
  reason: "User reported: when scrolling the breadcrumb has a transparency and makes weird experience. The vertical scrollbar starts from breadcrumb, but should be available for content area under the breadcrumb"
  severity: major
  test: 4
  root_cause: "Same root cause as Test 3 — overflow-y-auto wraps both breadcrumb and scrollable content. The scrollbar should only cover the content area below the breadcrumb, not the breadcrumb itself."
  artifacts:
    - path: "app/src/pages/ExplorePage.tsx"
      issue: "Single scroll container for breadcrumb + content instead of separate regions"
  missing:
    - "Breadcrumb must be a fixed (non-scrolling) element above the scroll region"
    - "Only ContentTransition area should be scrollable"
  debug_session: ""
