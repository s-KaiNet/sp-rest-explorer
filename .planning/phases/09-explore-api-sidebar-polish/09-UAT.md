---
status: diagnosed
phase: 09-explore-api-sidebar-polish
source: [09-01-SUMMARY.md, 09-02-SUMMARY.md]
started: 2026-02-15T02:00:00Z
updated: 2026-02-15T02:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Entity Type badge removed from detail views
expected: Navigate to any entity detail view. The heading shows just the entity name as plain text — no "Entity Type" badge next to it.
result: pass

### 2. Complex Type badge removed from detail views
expected: Navigate to any complex type detail view. The heading shows just the type name as plain text — no "Complex Type" badge next to it.
result: pass

### 3. Composable badge removed from methods and inline functions
expected: View an entity's methods table and any inline function return types. No "COMPOSABLE" badge appears anywhere in the methods table or inline function views.
result: pass

### 4. Namespace-grouped sidebar at Explore API root
expected: Navigate to the Explore API root level. Sidebar items are organized into collapsible namespace groups (e.g., "Core" for ungrouped items first, then alphabetical namespace groups). Each group has a chevron toggle and uppercase header. Clicking a group header collapses/expands it.
result: issue
reported: "the groupping works weired. it should work exactly the same as for types: if the root name is 'Microsoft.SharePoint.Utilities.WebTemplateExtensions.SiteScriptUtility.GrantSiteDesignRights', then the namespace should be 'Microsoft.SharePoint.Utilities.WebTemplateExtensions.SiteScriptUtility' (everything before the last dot becomes namespace). Also if namespace is used, the items under namespace should use stripped names, ie. just SiteScriptUtility"
severity: major

### 5. Root badge positioned on the right side
expected: In the Explore API sidebar, root indicator badges (the `<>` badge) appear on the right side of sidebar items, aligned consistently with function (FN) and navigation property (NAV) badges.
result: pass

### 6. No horizontal scrollbar flicker during slide animation
expected: Click into a sidebar item to navigate deeper (trigger the slide animation). During the transition, no horizontal scrollbar appears or flickers at the bottom of the sidebar panel.
result: pass

### 7. Sidebar scroll resets to top on navigation
expected: Scroll down in the sidebar, then click an item to navigate deeper. The sidebar scroll position resets to the top of the new view.
result: pass

## Summary

total: 7
passed: 6
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Namespace grouping extracts namespace as everything before the last dot in the full name, and items under a namespace show stripped short names"
  status: failed
  reason: "User reported: the groupping works weired. it should work exactly the same as for types: if the root name is 'Microsoft.SharePoint.Utilities.WebTemplateExtensions.SiteScriptUtility.GrantSiteDesignRights', then the namespace should be 'Microsoft.SharePoint.Utilities.WebTemplateExtensions.SiteScriptUtility' (everything before the last dot becomes namespace). Also if namespace is used, the items under namespace should use stripped names, ie. just SiteScriptUtility"
  severity: major
  test: 4
  root_cause: "getNamespace() in Sidebar.tsx extracts namespace from entry.returnType instead of entry.name. returnType represents what a function returns, not its fully-qualified identifier. 74% of entries get grouped under wrong namespace."
  artifacts:
    - path: "app/src/components/navigation/Sidebar.tsx"
      issue: "getNamespace() uses returnType parameter instead of name — lines 25-30 and call site line 54"
  missing:
    - "Change getNamespace() to accept name instead of returnType"
    - "Change call site from entry.returnType to entry.name"
  debug_session: ".planning/debug/namespace-grouping-wrong.md"
