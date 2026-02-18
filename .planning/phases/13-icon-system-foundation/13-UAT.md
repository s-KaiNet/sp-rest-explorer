---
status: diagnosed
phase: 13-icon-system-foundation
source: [13-01-SUMMARY.md]
started: 2026-02-18T12:00:00Z
updated: 2026-02-18T10:40:00Z
---

## Current Test

[testing complete]

## Tests

### 1. CSS color tokens exist with correct hues
expected: In the app, elements using type colors show 4 distinct colors — root=green, fn=blue, nav=purple, entity=orange/amber. Inspecting in DevTools shows OKLCH values from --type-* custom properties.
result: issue
reported: "root elements are not green, but orange/amber. also, the type names in the explore api content view changed their colors to orange/amber. in the /_api home the colors are still blue for root api indication, but should be green"
severity: major

### 2. TypeIcon renders distinct icons per API type
expected: Rendering `<TypeIcon type="root" />`, `<TypeIcon type="nav" />`, `<TypeIcon type="function" />`, `<TypeIcon type="entity" />` produces 4 visually distinct Lucide icons — Box (root), Compass (nav), Zap (function), Braces (entity).
result: skipped
reason: TypeIcon component is not rendered anywhere in the app yet (Phase 14-15 work). Code review confirms correct icon mapping. TypeScript compiles clean.

### 3. TypeIcon renders icons in correct type colors
expected: Each TypeIcon renders in its designated color — root icon is green, function icon is blue, nav icon is purple, entity icon is orange/amber. Colors match the CSS custom properties.
result: skipped
reason: TypeIcon component is not rendered anywhere in the app yet (Phase 14-15 work). Code review confirms correct color class mapping.

### 4. Entity badges show orange/amber (not green)
expected: In the existing app, entity-related UI elements (sidebar badges, search results with `<>` markers, TypeLink text) display in orange/amber color — not the old green that was previously used for --type-entity.
result: issue
reported: "it's a critical mess with colors. The root endpoint now orange, also the entity links also orange, but was blue"
severity: blocker

### 5. Dark mode color variants work
expected: Toggling to dark mode, the type colors remain visible and distinguishable. They should be slightly brighter/lighter than light mode variants (dark mode uses higher OKLCH lightness values).
result: issue
reported: "same color mess as light mode — as said it's a mess"
severity: blocker

## Summary

total: 5
passed: 0
issues: 3
pending: 0
skipped: 2

## Gaps

- truth: "Root elements should display in green (--type-root), entity elements in orange/amber (--type-entity). Each type has its own distinct color."
  status: failed
  reason: "User reported: root elements are not green, but orange/amber. also, the type names in the explore api content view changed their colors to orange/amber. in the /_api home the colors are still blue for root api indication, but should be green"
  severity: major
  test: 1
  root_cause: "Phase 13 changed --type-entity from green (hue 155) to orange (hue 80) and added new --type-root (green hue 155), but NO component classes were updated. Elements using text-type-entity that represent ROOT items (SidebarItem variant=root, HomePage kind=root, CommandPalette Root badge) now show orange instead of green. ExplorePage /_api welcome screen uses text-type-fn (blue) for root items instead of text-type-root (green)."
  artifacts:
    - path: "app/src/components/navigation/SidebarItem.tsx"
      line: 27
      issue: "Root variant uses bg-type-entity/10 text-type-entity — should be bg-type-root/10 text-type-root"
    - path: "app/src/pages/HomePage.tsx"
      line: 38
      issue: "kind=root card uses bg-type-entity/10 text-type-entity — should be bg-type-root/10 text-type-root"
    - path: "app/src/pages/HomePage.tsx"
      line: 145
      issue: "Browse root endpoints button hover uses type-fn — should be type-root"
    - path: "app/src/pages/ExplorePage.tsx"
      line: 138
      issue: "/_api welcome icon uses bg-type-fn/10 text-type-fn — should be bg-type-root/10 text-type-root"
    - path: "app/src/pages/ExplorePage.tsx"
      line: 155
      issue: "Root Endpoints count uses text-type-fn — should be text-type-root"
    - path: "app/src/components/search/CommandPalette.tsx"
      line: 399
      issue: "Root pill badge uses bg-type-entity/10 text-type-entity — should be bg-type-root/10 text-type-root"
  missing:
    - "Update all root-type UI elements from text-type-entity to text-type-root"
    - "Update /_api welcome screen from text-type-fn to text-type-root"
    - "Update Root badge in search from text-type-entity to text-type-root"

- truth: "Entity-related UI elements display in orange/amber, root elements in green — each type has its designated color applied correctly"
  status: failed
  reason: "User reported: it's a critical mess with colors. The root endpoint now orange, also the entity links also orange, but was blue"
  severity: blocker
  test: 4
  root_cause: "Same root cause as gap 1. The color token rename (--type-entity green→orange) was applied to CSS but component classes were not migrated. Root items inherited the orange from --type-entity instead of getting the new --type-root green."
  artifacts: []
  missing: []

- truth: "Dark mode type colors are visible, distinguishable, and correctly assigned per type"
  status: failed
  reason: "User reported: same color mess as light mode"
  severity: blocker
  test: 5
  root_cause: "Same root cause — dark mode defines correct OKLCH values for --type-root (green) and --type-entity (orange), but since no component references text-type-root, the fix is the same class migration."
  artifacts: []
  missing: []
