---
status: diagnosed
trigger: "Namespace grouping in Explore API sidebar is wrong - doesn't match Explore Types behavior"
created: 2026-02-15T00:00:00Z
updated: 2026-02-15T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - getNamespace() extracts from entry.returnType instead of entry.name
test: Compared with TypesSidebar which uses entity.fullName (the item's own name)
expecting: N/A - root cause confirmed
next_action: Report diagnosis

## Symptoms

expected: Namespace = everything before last dot of entry.name; short name = everything after last dot
actual: Namespace extracted from entry.returnType — a completely different field (what function returns, not function name)
errors: Wrong grouping, garbage namespace names like "Edm", "Collection(SP.WorkManagement.OM", items in wrong groups
reproduction: Open Explore API root sidebar, observe namespace grouping
started: Since namespace grouping was implemented

## Eliminated

## Evidence

- timestamp: 2026-02-15
  checked: Sidebar.tsx getNamespace() function (line 25-30)
  found: Uses entry.returnType to extract namespace via lastIndexOf('.')
  implication: Groups are based on return type, not function name

- timestamp: 2026-02-15
  checked: TypesSidebar + type-indexes.ts (lines 139-140)
  found: Uses entity.fullName.lastIndexOf('.') to extract namespace
  implication: TypesSidebar correctly groups by the item's own fully-qualified name

- timestamp: 2026-02-15
  checked: Root function data (metadata.latest.json)
  found: 590 out of 793 root functions have name-namespace != returnType-namespace
  implication: 74% of entries are grouped under wrong namespace

- timestamp: 2026-02-15
  checked: Specific example from bug report
  found: "Microsoft.SharePoint.Utilities.WebTemplateExtensions.SiteScriptUtility.GrantSiteDesignRights" has returnType=undefined, so grouped under "Core" instead of "Microsoft.SharePoint.Utilities.WebTemplateExtensions.SiteScriptUtility"
  implication: Functions with undefined/primitive returnType all get dumped into "Core"

- timestamp: 2026-02-15
  checked: Garbage namespace generation
  found: returnTypes like "Collection(SP.List)" produce namespaces like "Collection(SP" — malformed namespace headers
  implication: The returnType field was never designed to be used as a namespace source

## Resolution

root_cause: |
  In Sidebar.tsx, the `getNamespace()` function (lines 25-30) extracts the namespace from
  `entry.returnType` instead of from `entry.name`. This is fundamentally wrong because:
  
  1. returnType is what the function returns, not the function's fully-qualified name
  2. Many functions return primitive types (Edm.String, Edm.Boolean, undefined) creating
     wrong groups like "Edm" or "Core" 
  3. Collection(...) return types create malformed namespaces like "Collection(SP.WorkManagement.OM"
  4. Even when returnType has dots, its namespace rarely matches the function's name namespace
  5. 74% of root entries (590/793) are grouped under the wrong namespace
  
  The TypesSidebar (type-indexes.ts lines 139-140) does it correctly: uses entity.fullName
  (the item's own name) to extract namespace via lastIndexOf('.').

fix: |
  Change getNamespace() to use entry.name instead of entry.returnType:
  
  ```typescript
  function getNamespace(name: string): string {
    const lastDot = name.lastIndexOf('.')
    if (lastDot <= 0) return 'Core'
    return name.substring(0, lastDot)
  }
  ```
  
  And update the call site in groupByNamespace() (line 54):
    const ns = getNamespace(entry.name)
  
  The getStrippedName() function (lines 36-43) is already correct — it strips
  based on namespace prefix from entry.name, so no change needed there.

verification:
files_changed: []
