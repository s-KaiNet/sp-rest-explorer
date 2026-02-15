---
status: resolved
trigger: "Explore Types page sidebar only shows complex types, not entity types"
created: 2026-02-14T00:00:00Z
updated: 2026-02-14T00:00:00Z
---

## Current Focus

hypothesis: namespaceGroups is built exclusively from complexTypes array, excluding entity types by design oversight
test: read buildTypeIndexes logic in type-indexes.ts
expecting: step 4 only iterates complexTypes
next_action: report root cause

## Symptoms

expected: Sidebar shows ALL types (entity types like SP.List, SP.Web AND complex types)
actual: Sidebar only shows complex types; entity types accessible only via direct URL /entity/SP.List
errors: none
reproduction: Navigate to Explore Types page, observe sidebar - no entity types listed
started: since feature was built

## Eliminated

(none needed - root cause found on first investigation)

## Evidence

- timestamp: 2026-02-14
  checked: type-indexes.ts lines 133-153 (step 4)
  found: namespaceGroups is built by iterating `complexTypes` only. Comment says "complex types only".
  implication: Entity types are intentionally excluded from namespaceGroups

- timestamp: 2026-02-14
  checked: type-indexes.ts lines 59-65 (isComplexType)
  found: complex type = no navProperties + no functionIds + not Collection(). Entity types like SP.List have navProperties and functionIds, so they fail this check.
  implication: Entity types are classified separately and never make it into namespaceGroups

- timestamp: 2026-02-14
  checked: TypesPage.tsx lines 19, 80-81
  found: totalCount uses complexTypes.length, sidebar passes typeIndexes.namespaceGroups directly
  implication: Both the count and the sidebar content are limited to complex types only

- timestamp: 2026-02-14
  checked: TypesPage.tsx lines 64-65, 171-176
  found: Content area DOES handle both types (isComplex branch → ComplexTypeDetail, else → EntityDetail)
  implication: The detail view supports entity types already; only the sidebar/navigation is missing them

## Resolution

root_cause: In `type-indexes.ts` buildTypeIndexes(), step 4 (lines 133-146) builds `namespaceGroups` by iterating ONLY over the `complexTypes` array. Entity types (those with navigationProperties or functionIds) are never added to namespaceGroups. The sidebar (TypesSidebar.tsx) renders only what's in namespaceGroups, so entity types are invisible in the sidebar.

fix: Build namespaceGroups from ALL entities (not just complexTypes). Add a `kind` discriminator to NamespaceGroup items or add a separate entityGroups/allGroups field. Update TypesPage to pass the combined groups and update counts accordingly.

verification: After fix, sidebar should show entity types like SP.List, SP.Web alongside complex types.

files_changed:
- app/src/lib/metadata/type-indexes.ts
- app/src/pages/TypesPage.tsx
