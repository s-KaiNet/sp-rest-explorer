---
status: complete
phase: 12-detail-layout-fixes
source: 12-01-SUMMARY.md
started: 2026-02-17T03:00:00Z
updated: 2026-02-17T03:10:00Z
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
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Breadcrumb sticks to top of content area and scrollbar only covers content below it"
  status: failed
  reason: "User reported: when scrolling the breadcrumb has a transparency and makes weird experience. The vertical scrollbar starts from breadcrumb, but should be available for content area under the breadcrumb"
  severity: major
  test: 4
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
