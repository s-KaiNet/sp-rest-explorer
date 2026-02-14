---
status: diagnosed
phase: 07-explore-types
source: 07-01-SUMMARY.md, 07-02-SUMMARY.md
started: 2026-02-14T20:00:00Z
updated: 2026-02-14T20:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Navigate to Explore Types page
expected: Click "Explore Types" in the main header navigation. You should see a page with a resizable sidebar on the left listing complex types grouped by namespace (collapsible groups). The sidebar should have a filter input at the top. The main content area should show type stats or prompt to select a type.
result: pass

### 2. Filter types in sidebar
expected: Type a partial name in the sidebar filter input (e.g. "alert"). The type list should narrow to show only matching types. The count label should update to reflect filtered results.
result: pass

### 3. View complex type detail
expected: Click any complex type in the sidebar (e.g. one from the SP namespace). The main content area should show the type's detail view with: a header showing the type name, full name, and a properties table with Name, Type, and Nullable columns.
result: pass

### 4. Base type link
expected: Find a complex type that has a base type (look for a "Base Type" section in the detail view). The base type name should be shown as a clickable link. Clicking it should navigate to that base type's detail.
result: pass

### 5. Derived types display
expected: Find a type that has derived types (entity types often have these). A "Derived Types" section should list them. Each derived type should be a clickable link.
result: issue
reported: "1. Entity types like SP.List and SP.Web are missing from the sidebar — can be accessed via direct URL /entity/SP.List but not found in sidebar filter. 2. Sidebar filter doesn't match on full name (e.g. typing 'SP.ListForm' doesn't find ListForm). 3. SP.SecurableObject has no derived types section even though SP.List declares SP.SecurableObject as its base class."
severity: major

### 6. Used-by section
expected: View a complex type that is referenced by entities. A "Used by" section should show which entities reference this type via navigation properties. If there are many, a "show more" control should be available.
result: pass

### 7. TypeLink cross-navigation from Explore API
expected: Go to Explore API, navigate to any entity detail, and find a property or nav property whose type is a complex type. Click the type link. You should navigate to Explore Types with that type's detail shown and the sidebar synced.
result: pass

### 8. Sidebar syncs with selection
expected: When viewing a type's detail, the sidebar should highlight the active type and scroll it into view. Navigating to a different type (e.g. via a base type link) should update the sidebar highlight.
result: pass

### 9. Sidebar text overflow (added post-testing)
expected: Long type names and namespace headers in the Types sidebar should truncate with ellipsis, not cause horizontal scrolling. Should match Explore API sidebar behavior.
result: issue
reported: "There shouldn't be any horizontal scrolling in the types sidebar, it should be the same as for the sidebar at Explore API page - text-overflow property"
severity: cosmetic

## Summary

total: 9
passed: 7
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "Sidebar should list ALL types (entity types + complex types), not just complex types"
  status: failed
  reason: "User reported: Entity types like SP.List and SP.Web are missing from the sidebar — can be accessed via direct URL /entity/SP.List but not found in sidebar filter"
  severity: major
  test: 5a
  root_cause: "type-indexes.ts line 133-146 builds namespaceGroups from complexTypes array only. Entity types (which have navProperties or functionIds) are excluded by isComplexType() heuristic. TypesPage totalCount also undercounts."
  artifacts:
    - path: "app/src/lib/metadata/type-indexes.ts"
      issue: "namespaceGroups loop iterates complexTypes instead of all entities (minus Collection wrappers)"
    - path: "app/src/pages/TypesPage.tsx"
      issue: "totalCount uses complexTypes.length instead of counting all types in namespaceGroups"
  missing:
    - "Change namespaceGroups to iterate all entities (excluding Collection wrappers)"
    - "Update TypesPage totalCount to count from namespaceGroups"
  debug_session: ""

- truth: "Sidebar filter should match on full qualified name (e.g. SP.ListForm)"
  status: failed
  reason: "User reported: Sidebar filter doesn't match on full name (e.g. typing 'SP.ListForm' doesn't find ListForm entity)"
  severity: major
  test: 5b
  root_cause: "TypesSidebar.tsx line 57-58 filter predicate only checks type.name (short name e.g. 'ListForm'). type.fullName (e.g. 'SP.ListForm') is never consulted during filtering."
  artifacts:
    - path: "app/src/components/types/TypesSidebar.tsx"
      issue: "Filter predicate uses type.name.toLowerCase().includes(lower) only — missing type.fullName"
  missing:
    - "Add type.fullName.toLowerCase().includes(lower) as OR condition in filter predicate"
  debug_session: ""

- truth: "Entity types should show derived types section (e.g. SP.SecurableObject should list SP.List as derived)"
  status: failed
  reason: "User reported: SP.SecurableObject has no derived types section even though SP.List declares SP.SecurableObject as its base class"
  severity: major
  test: 5c
  root_cause: "derivedTypes map in type-indexes.ts is correct (includes entity-type inheritance). But EntityDetail.tsx never looks up or renders derived types — only ComplexTypeDetail.tsx does. When TypesPage renders an entity type, it uses EntityDetail which has no derived types UI."
  artifacts:
    - path: "app/src/components/entity/EntityDetail.tsx"
      issue: "Does not import useTypeIndexes or render derived types section"
  missing:
    - "Add useTypeIndexes import and derivedTypes lookup to EntityDetail.tsx"
    - "Add derived types rendering section (same pattern as ComplexTypeDetail.tsx lines 70-81)"
  debug_session: ""

- truth: "Types sidebar should truncate long names with ellipsis, no horizontal scrolling — matching Explore API sidebar"
  status: failed
  reason: "User reported: There shouldn't be any horizontal scrolling in the types sidebar, it should be the same as for the sidebar at Explore API page - text-overflow property"
  severity: cosmetic
  test: 9
  root_cause: "TypesSidebar.tsx line 108 namespace header span lacks min-w-0 truncate classes. TypesPage.tsx line 78 sidebar scroll container uses overflow-y-auto but doesn't set overflow-x-hidden, allowing horizontal scroll when content overflows."
  artifacts:
    - path: "app/src/components/types/TypesSidebar.tsx"
      issue: "Namespace group header span missing min-w-0 truncate classes"
    - path: "app/src/pages/TypesPage.tsx"
      issue: "Sidebar scroll container missing overflow-x-hidden"
  missing:
    - "Add min-w-0 truncate to namespace header span in TypesSidebar.tsx"
    - "Add overflow-x-hidden to sidebar scroll container in TypesPage.tsx"
  debug_session: ""
