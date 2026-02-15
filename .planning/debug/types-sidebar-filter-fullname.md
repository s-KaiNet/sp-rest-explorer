---
status: resolved
trigger: "Sidebar filter on Explore Types page doesn't match on full qualified names (e.g. SP.ListForm)"
created: 2026-02-14T00:00:00Z
updated: 2026-02-14T00:00:00Z
---

## Current Focus

hypothesis: Filter matches only on `type.name` (short name) instead of also matching `type.fullName`
test: Read filter logic in TypesSidebar.tsx line 57-58
expecting: Confirms filter uses `type.name` only
next_action: Document root cause and fix

## Symptoms

expected: Typing "SP.ListForm" in the sidebar filter should find the ListForm type
actual: No match found — filter only matches against the short `name` field (e.g. "ListForm")
errors: None (functional bug, not an error)
reproduction: Go to Explore Types, type "SP.ListForm" in filter — no results
started: Since initial implementation

## Eliminated

(none needed — root cause found on first hypothesis)

## Evidence

- timestamp: 2026-02-14
  checked: TypesSidebar.tsx lines 50-65 — the filteredGroups useMemo
  found: Line 58 filters with `type.name.toLowerCase().includes(lower)` — only checks `type.name`
  implication: `type.name` is the short name (e.g. "ListForm"), not the full qualified name ("SP.ListForm")

- timestamp: 2026-02-14
  checked: metadata.latest.json — shape of EntityType for SP.ListForm
  found: `name: "ListForm"`, `fullName: "SP.ListForm"` — confirms name vs fullName difference
  implication: The filter never sees the namespace prefix

- timestamp: 2026-02-14
  checked: getDisplayName() in TypesSidebar.tsx lines 22-34
  found: Display name is computed by stripping the namespace prefix from fullName
  implication: The display name is also a short name, not useful for full qualified matching

## Resolution

root_cause: |
  In `app/src/components/types/TypesSidebar.tsx`, line 57-58, the filter logic is:
  ```ts
  const matchingTypes = group.types.filter((type) =>
    type.name.toLowerCase().includes(lower),
  )
  ```
  This only matches against `type.name` (e.g. "ListForm"), never against `type.fullName` (e.g. "SP.ListForm").
  When a user types "SP.ListForm", the string "sp.listform" is not found in "listform".

fix: |
  Change the filter predicate to also check `type.fullName`. The fix is a one-line change on line 58:
  ```ts
  const matchingTypes = group.types.filter((type) =>
    type.name.toLowerCase().includes(lower) ||
    type.fullName.toLowerCase().includes(lower),
  )
  ```
  This allows matching on both the short display name AND the full qualified name.

verification: Code review — logic is straightforward
files_changed:
  - app/src/components/types/TypesSidebar.tsx
