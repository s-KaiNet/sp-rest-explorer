---
status: complete
phase: 13-icon-system-foundation
source: [13-01-SUMMARY.md, 13-02-SUMMARY.md]
started: 2026-02-18T12:00:00Z
updated: 2026-02-18T21:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. CSS color tokens exist with correct hues
expected: In the app, elements using type colors show 4 distinct colors — root=green, fn=blue, nav=purple, entity=orange/amber. Inspecting in DevTools shows OKLCH values from --type-* custom properties.
result: pass

### 2. TypeIcon renders distinct icons per API type
expected: Rendering `<TypeIcon type="root" />`, `<TypeIcon type="nav" />`, `<TypeIcon type="function" />`, `<TypeIcon type="entity" />` produces 4 visually distinct Lucide icons — Box (root), Compass (nav), Zap (function), Braces (entity).
result: pass

### 3. TypeIcon renders icons in correct type colors
expected: Each TypeIcon renders in its designated color — root icon is green, function icon is blue, nav icon is purple, entity icon is orange/amber. Colors match the CSS custom properties.
result: pass

### 4. Entity badges show orange/amber (not green)
expected: In the existing app, entity-related UI elements (sidebar badges, search results with `<>` markers, TypeLink text) display in orange/amber color — not the old green that was previously used for --type-entity.
result: pass

### 5. Dark mode color variants work
expected: Toggling to dark mode, the type colors remain visible and distinguishable. They should be slightly brighter/lighter than light mode variants (dark mode uses higher OKLCH lightness values).
result: issue
reported: "1. the '60k+ endpoints' stat dot should be green (same color as root <>) — currently shows amber/orange. 2. Entity type links in property tables (e.g. on /entity/Microsoft.Office.Server.ContentCenter.SPModelPublishConfig) changed from green to orange — user expected them to stay green."
severity: major

## Summary

total: 5
passed: 4
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "60k+ endpoints stat dot on home page should use root green color, matching the root <> badge color"
  status: failed
  reason: "User reported: the '60k+ endpoints' should be of the same color as root <>"
  severity: minor
  test: 5
  root_cause: "HomePage.tsx:136 uses hardcoded bg-amber-500 instead of bg-type-root for the endpoints stat dot"
  artifacts:
    - path: "app/src/pages/HomePage.tsx"
      line: 136
      issue: "bg-amber-500 should be bg-type-root"
  missing:
    - "Change bg-amber-500 to bg-type-root on line 136"
  debug_session: ""

- truth: "Entity type links in property tables should remain green (not change to orange/amber)"
  status: failed
  reason: "User reported: wrong colors for entity links (it was green, now it's orange)"
  severity: major
  test: 5
  root_cause: "TypeLink.tsx uses text-type-entity which changed from green to orange in Phase 13-01. Entity links should use a different color — the intent was entity BADGES use orange, but inline type links should stay a readable accent color, not orange."
  artifacts:
    - path: "app/src/components/entity/TypeLink.tsx"
      lines: [66, 89]
      issue: "text-type-entity now renders orange — entity links need a different treatment"
  missing:
    - "Determine correct color for entity type links (revert to green, use a dedicated link color, or accept orange)"
  debug_session: ""
